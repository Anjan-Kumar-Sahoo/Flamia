import { HiStar, HiOutlineStar } from 'react-icons/hi2';

const StarRating = ({ rating = 0, maxStars = 5, size = 'md', interactive = false, onChange }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  return (
    <div className="flex items-center gap-0.5" role="group" aria-label={`Rating: ${rating} out of ${maxStars}`}>
      {Array.from({ length: maxStars }, (_, i) => {
        const filled = i < Math.round(rating);
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(i + 1)}
            className={`
              ${sizes[size]} transition-colors duration-150
              ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
              ${filled ? 'text-flame-500' : 'text-charcoal-200'}
            `}
            aria-label={`${i + 1} star`}
          >
            {filled ? <HiStar className="w-full h-full" /> : <HiOutlineStar className="w-full h-full" />}
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
