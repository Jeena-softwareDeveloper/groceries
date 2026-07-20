import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { customerApi, cartApi, type HomeFeed } from '../api';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import ShopCard from '../components/ShopCard';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [feed, setFeed] = useState<HomeFeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addMsg, setAddMsg] = useState<string | null>(null);

  useEffect(() => {
    customerApi.getHomeFeed()
      .then(setFeed)
      .catch(() => setError('Failed to load home feed'))
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = async (productId: string) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    try {
      await cartApi.addToCart(productId);
      setAddMsg('Added to cart!');
      setTimeout(() => setAddMsg(null), 2000);
    } catch {
      setAddMsg('Could not add to cart');
      setTimeout(() => setAddMsg(null), 2000);
    }
  };

  if (loading) {
    return (
      <div className="page-container flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !feed) {
    return (
      <div className="page-container text-center">
        <p className="text-red-600">{error ?? 'Something went wrong'}</p>
      </div>
    );
  }

  return (
    <div className="page-container space-y-8 pb-20 md:pb-8">
      {addMsg && (
        <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white shadow-lg md:bottom-8">
          {addMsg}
        </div>
      )}

      {/* Hero / Banners */}
      {feed.banners.length > 0 && (
        <section>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {feed.banners.map((banner) => (
              <div
                key={banner.id}
                className="relative h-32 w-64 flex-shrink-0 overflow-hidden rounded-xl sm:h-40 sm:w-80"
              >
                <img src={banner.imageUrl} alt={banner.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <h2 className="absolute bottom-4 left-4 text-lg font-bold text-white">{banner.title}</h2>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      {feed.categories.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-bold text-gray-900">Shop by Category</h2>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12">
            {feed.categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/shops?categoryId=${cat.id}`}
                className="flex flex-col items-center gap-2 rounded-xl p-2 transition hover:bg-white hover:shadow-sm"
              >
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-primary-50">
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt={cat.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-primary-600">{cat.name.charAt(0)}</span>
                  )}
                </div>
                <span className="line-clamp-2 text-center text-xs font-medium text-gray-700">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Nearby Shops */}
      {feed.nearbyShops.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Nearby Shops</h2>
            <Link to="/shops" className="text-sm font-medium text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {feed.nearbyShops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        </section>
      )}

      {/* Trending Products */}
      {feed.trendingProducts.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-bold text-gray-900">Trending Now</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {feed.trendingProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                showAddButton={isAuthenticated}
              />
            ))}
          </div>
        </section>
      )}

      {/* Offers */}
      {feed.offers.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-bold text-gray-900">Offers & Deals</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {feed.offers.map((offer) => (
              <div
                key={offer.id}
                className="rounded-xl border border-primary-200 bg-primary-50 p-4"
              >
                <h3 className="font-semibold text-primary-800">{offer.title}</h3>
                {offer.description && (
                  <p className="mt-1 text-sm text-primary-700">{offer.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
