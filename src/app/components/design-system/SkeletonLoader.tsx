export function SkeletonLoader({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-black/5 ${className}`}
      style={{ animationDuration: '1.5s' }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="border border-black/10 bg-white p-6">
      <SkeletonLoader className="mb-4 h-6 w-3/4" />
      <SkeletonLoader className="mb-2 h-4 w-full" />
      <SkeletonLoader className="h-4 w-5/6" />
    </div>
  );
}
