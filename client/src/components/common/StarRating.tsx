import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  count?: number;
}

export default function StarRating({ rating, size = 'sm', showValue = false, count }: StarRatingProps) {
  const sizes = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' };
  const stars = [];
  const rounded = Math.round(rating * 2) / 2;

  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rounded)) {
      stars.push(<Star key={i} className={`${sizes[size]} fill-amber-400 text-amber-400`} />);
    } else if (i === Math.ceil(rounded) && rounded % 1 !== 0) {
      stars.push(
        <div key={i} className={`relative ${sizes[size]}`}>
          <Star className={`absolute inset-0 ${sizes[size]} text-amber-300`} />
          <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
            <Star className={`${sizes[size]} fill-amber-400 text-amber-400`} />
          </div>
        </div>
      );
    } else {
      stars.push(<Star key={i} className={`${sizes[size]} text-slate-200`} />);
    }
  }

  return (
    <div className="flex items-center gap-0.5">
      <div className="flex items-center">{stars}</div>
      {showValue && <span className="ml-1 text-xs font-medium text-slate-600">{rating.toFixed(1)}</span>}
      {count !== undefined && <span className="ml-1 text-xs text-slate-400">({count})</span>}
    </div>
  );
}
