const Skeleton = ({ className = '', count = 1, circle = false }) => {
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <>
      {items.map((i) => (
        <div
          key={i}
          className={`
            bg-charcoal-100 animate-pulse rounded-luxury
            ${circle ? 'rounded-full' : ''}
            ${className}
          `}
        />
      ))}
    </>
  );
};

export default Skeleton;
