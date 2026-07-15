import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { cartApi, formatPrice, productApi, type Product } from '../api';
import { useAuth } from '../context/AuthContext';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!id) return;
    productApi.getProduct(id)
      .then(setProduct)
      .catch(() => setError('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const inStock = product?.inventory ? product.inventory.stock > 0 : true;
  const maxStock = product?.inventory?.stock ?? 99;
  const primaryImage = product?.images?.find((i) => i.isPrimary) ?? product?.images?.[0];

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    if (!product) return;
    setAdding(true);
    try {
      await cartApi.addToCart(product.id, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch {
      setError('Could not add to cart');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="page-container text-center">
        <p className="text-red-600">{error ?? 'Product not found'}</p>
        <Link to="/" className="mt-4 inline-block text-primary-600 hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container pb-20 md:pb-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
            {primaryImage ? (
              <img src={primaryImage.url} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                <svg className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img) => (
                <img
                  key={img.id}
                  src={img.url}
                  alt=""
                  className="h-16 w-16 flex-shrink-0 rounded-lg border border-gray-200 object-cover"
                />
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          {product.vendor && (
            <Link
              to={`/shops/${product.vendor.id}`}
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              {product.vendor.shopName}
            </Link>
          )}
          <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">{product.name}</h1>
          {product.brand && <p className="mt-1 text-gray-500">{product.brand}</p>}

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-gray-900">
              {formatPrice(product.sellingPrice)}
            </span>
            {product.mrp && Number(product.mrp) > Number(product.sellingPrice) && (
              <span className="text-lg text-gray-400 line-through">{formatPrice(product.mrp)}</span>
            )}
            <span className="text-sm text-gray-500">/ {product.unit}</span>
          </div>

          <div className="mt-2">
            {inStock ? (
              <span className="text-sm font-medium text-green-600">In stock</span>
            ) : (
              <span className="text-sm font-medium text-red-600">Out of stock</span>
            )}
          </div>

          {product.description && (
            <p className="mt-6 text-gray-600 leading-relaxed">{product.description}</p>
          )}

          {inStock && (
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex items-center rounded-lg border border-gray-300">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-2 text-lg font-medium text-gray-600 hover:bg-gray-50"
                >
                  −
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                  className="px-4 py-2 text-lg font-medium text-gray-600 hover:bg-gray-50"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="btn-primary flex-1 sm:flex-none sm:px-8"
              >
                {adding ? 'Adding…' : added ? 'Added!' : 'Add to Cart'}
              </button>
            </div>
          )}

          {/* Reviews */}
          {product.reviews && product.reviews.length > 0 && (
            <div className="mt-10">
              <h2 className="mb-4 text-lg font-bold text-gray-900">Reviews</h2>
              <div className="space-y-3">
                {product.reviews.map((review) => (
                  <div key={review.id} className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500">{'★'.repeat(review.rating)}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && <p className="mt-2 text-sm text-gray-600">{review.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
