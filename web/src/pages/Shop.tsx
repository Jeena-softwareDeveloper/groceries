import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  addToCart,
  getShop,
  getShopProducts,
  listShops,
  type ProductSummary,
  type Shop,
  type ShopSummary,
} from '../api/client';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import ShopCard from '../components/ShopCard';

export default function ShopPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('categoryId') ?? undefined;
  const { isAuthenticated } = useAuth();

  const [shops, setShops] = useState<ShopSummary[]>([]);
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    if (id) {
      Promise.all([getShop(id), getShopProducts(id, categoryId)])
        .then(([shopData, productData]) => {
          setShop(shopData);
          setProducts(productData);
        })
        .catch(() => setError('Shop not found'))
        .finally(() => setLoading(false));
    } else {
      listShops(undefined, undefined, categoryId)
        .then(setShops)
        .catch(() => setError('Failed to load shops'))
        .finally(() => setLoading(false));
    }
  }, [id, categoryId]);

  const handleAddToCart = async (productId: string) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    await addToCart(productId);
  };

  if (loading) {
    return (
      <div className="page-container flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container text-center">
        <p className="text-red-600">{error}</p>
        <Link to="/shops" className="mt-4 inline-block text-primary-600 hover:underline">
          Back to shops
        </Link>
      </div>
    );
  }

  // Shop detail view
  if (id && shop) {
    return (
      <div className="page-container pb-20 md:pb-8">
        <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="relative h-40 bg-gray-100 sm:h-56">
            {shop.bannerUrl ? (
              <img src={shop.bannerUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
                <span className="text-5xl font-bold text-primary-200">{shop.shopName.charAt(0)}</span>
              </div>
            )}
          </div>
          <div className="p-4 sm:p-6">
            <div className="flex items-start gap-4">
              {shop.logoUrl && (
                <img
                  src={shop.logoUrl}
                  alt=""
                  className="h-16 w-16 rounded-full border-2 border-white object-cover shadow -mt-10"
                />
              )}
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{shop.shopName}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                  <span className="text-amber-500">★ {shop.rating.toFixed(1)}</span>
                  {shop.area && <span>· {shop.area.name}</span>}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      shop.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {shop.isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
                {shop.description && (
                  <p className="mt-2 text-sm text-gray-600">{shop.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <h2 className="mb-4 text-lg font-bold text-gray-900">Products</h2>
        {products.length === 0 ? (
          <p className="text-gray-500">No products available in this shop.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                showAddButton={isAuthenticated}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Shop list view
  return (
    <div className="page-container pb-20 md:pb-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        {categoryId ? 'Shops in Category' : 'All Shops'}
      </h1>
      {shops.length === 0 ? (
        <p className="text-gray-500">No shops found in your area.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shops.map((s) => (
            <ShopCard key={s.id} shop={s} />
          ))}
        </div>
      )}
    </div>
  );
}
