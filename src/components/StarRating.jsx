// Reusable star rating display component
// Used on both ProductCard and ProductDetailPage

export default function StarRating({ rating, reviewCount, size = 'sm' }) {
  // Build an array of 5 stars, each either full, half, or empty
  const stars = Array.from({ length: 5 }, (_, i) => {
    if (rating >= i + 1) return 'full';
    if (rating >= i + 0.5) return 'half';
    return 'empty';
  });

  const starSize = size === 'lg' ? '18px' : '13px';
  const fontSize = size === 'lg' ? '14px' : '12px';

  return (
    <div className="star-rating" style={{ fontSize }}>
      <span className="stars" style={{ fontSize: starSize }}>
        {stars.map((type, i) => (
          <span
            key={i}
            style={{ color: type === 'empty' ? '#d4cfc9' : '#f5a623' }}
          >
            {type === 'half' ? '½' : '★'}
          </span>
        ))}
      </span>
      <span className="rating-text">
        {rating} ({reviewCount} reviews)
      </span>
    </div>
  );
}
