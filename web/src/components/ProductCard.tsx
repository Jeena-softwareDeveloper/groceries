import { Link } from 'react-router-dom';
import { formatPrice, type ProductSummary } from '../api';

interface ProductCardProps {
  product: ProductSummary;
  onAddToCart?: (productId: string) => void;
  showAddButton?: boolean;
}

export default function ProductCard({ product, onAddToCart, showAddButton = true }: ProductCardProps) {
  const imageUrl = product.images?.find((i) => i.isPrimary)?.url ?? product.images?.[0]?.url;
  const inStock = !product.inventory || product.inventory.stock > 0;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      <Link to={`/products/${product.id}`} className="relative aspect-square overflow-hidden bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
        {!inStock && (
          <span className="absolute left-2 top-2 rounded bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
            Out of stock
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3">
        {product.vendor && (
          <p className="mb-1 truncate text-xs text-gray-500">{product.vendor.shopName}</p>
        )}
        <Link to={`/products/${product.id}`}>
          <h3 className="line-clamp-2 text-sm font-medium text-gray-900 hover:text-primary-600">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 text-xs text-gray-500">{product.unit}</p>

        <div className="mt-auto flex items-center justify-between pt-3">
          <div>
            <span className="text-base font-bold text-gray-900">
              {formatPrice(product.sellingPrice)}
            </span>
            {product.mrp && Number(product.mrp) > Number(product.sellingPrice) && (
              <span className="ml-1 text-xs text-gray-400 line-through">
                {formatPrice(product.mrp)}
              </span>
            )}
          </div>

          {showAddButton && inStock && onAddToCart && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onAddToCart(product.id);
              }}
              className="rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 transition hover:bg-primary-100"
            >
              ADD
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
