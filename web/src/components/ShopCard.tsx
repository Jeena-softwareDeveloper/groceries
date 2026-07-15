import { Link } from 'react-router-dom';
import { formatPrice, type ShopSummary } from '../api';

interface ShopCardProps {
  shop: ShopSummary;
}

export default function ShopCard({ shop }: ShopCardProps) {
  return (
    <Link
      to={`/shops/${shop.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative h-32 overflow-hidden bg-gray-100 sm:h-40">
        {shop.bannerUrl ? (
          <img
            src={shop.bannerUrl}
            alt={shop.shopName}
            className="h-full w-full object-cover transition group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
            <span className="text-3xl font-bold text-primary-300">{shop.shopName.charAt(0)}</span>
          </div>
        )}
        {shop.logoUrl && (
          <img
            src={shop.logoUrl}
            alt=""
            className="absolute -bottom-4 left-4 h-12 w-12 rounded-full border-2 border-white object-cover shadow"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 pt-6">
        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600">{shop.shopName}</h3>
        <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
          <span className="flex items-center gap-0.5 text-amber-500">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {shop.rating.toFixed(1)}
          </span>
          <span>·</span>
          <span>Min {formatPrice(shop.minOrderValue)}</span>
        </div>
      </div>
    </Link>
  );
}
