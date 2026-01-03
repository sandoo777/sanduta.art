/**
 * Fallback component for missing product images
 */
export function ProductImageFallback({ 
  productName, 
  className = "w-full h-48 object-cover" 
}: { 
  productName: string; 
  className?: string;
}) {
  return (
    <div 
      className={`${className} bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center`}
      role="img"
      aria-label={`Image placeholder for ${productName}`}
    >
      <svg 
        className="w-16 h-16 text-gray-400" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
        />
      </svg>
    </div>
  );
}

/**
 * Product image with fallback handling
 */
export function ProductImage({ 
  src, 
  alt, 
  className = "w-full h-48 object-cover",
  onError
}: { 
  src?: string | null; 
  alt: string; 
  className?: string;
  onError?: () => void;
}) {
  if (!src) {
    return <ProductImageFallback productName={alt} className={className} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        // Replace failed image with fallback
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        const fallback = target.nextSibling as HTMLElement;
        if (fallback) fallback.style.display = 'flex';
        onError?.();
      }}
      loading="lazy"
    />
  );
}
