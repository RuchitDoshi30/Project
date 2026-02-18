/**
 * Skeleton Component
 * 
 * Reusable skeleton loading components for better perceived performance.
 * Shows placeholder UI while content is loading.
 */

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className = '' }: SkeletonProps) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-lc-elevated rounded ${className}`} />
);

export const SkeletonText = ({ lines = 1, className = '' }: { lines?: number; className?: string }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className="h-4 w-full" />
    ))}
  </div>
);

export const SkeletonCard = () => (
  <div className="bg-white dark:bg-lc-card rounded-lg border border-gray-200 dark:border-lc-border p-5 space-y-4">
    <div className="flex items-start justify-between">
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="w-20 h-5 rounded" />
        </div>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
    <div className="flex items-center gap-4">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-20" />
    </div>
  </div>
);

export const SkeletonTestList = ({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export const SkeletonTable = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-lc-card rounded-lg border border-gray-200 dark:border-lc-border">
        <Skeleton className="w-12 h-12 rounded" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="w-20 h-8 rounded" />
      </div>
    ))}
  </div>
);

export const SkeletonDashboard = () => (
  <div className="space-y-6">
    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-lc-card rounded-lg border border-gray-200 dark:border-lc-border p-5">
          <Skeleton className="h-4 w-20 mb-3" />
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>

    {/* Charts/Content */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-lc-card rounded-lg border border-gray-200 dark:border-lc-border p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
      <div className="bg-white dark:bg-lc-card rounded-lg border border-gray-200 dark:border-lc-border p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const SkeletonForm = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-32 w-full" />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
    <Skeleton className="h-10 w-32" />
  </div>
);

export const SkeletonQuestion = () => (
  <div className="bg-white dark:bg-lc-card rounded-lg border border-gray-200 dark:border-lc-border p-6 space-y-6">
    <div className="space-y-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-5/6" />
    </div>
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="border border-gray-200 dark:border-lc-border rounded-lg p-4">
          <Skeleton className="h-5 w-4/5" />
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonResults = () => (
  <div className="space-y-6">
    <div className="bg-white dark:bg-lc-card rounded-lg border border-gray-200 dark:border-lc-border p-8 space-y-6">
      <Skeleton className="w-16 h-16 rounded-full mx-auto" />
      <Skeleton className="h-8 w-48 mx-auto" />
      <Skeleton className="h-4 w-64 mx-auto" />
      <Skeleton className="w-32 h-32 rounded-full mx-auto" />
      <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
        <Skeleton className="h-16 rounded-lg" />
        <Skeleton className="h-16 rounded-lg" />
        <Skeleton className="h-16 rounded-lg" />
      </div>
    </div>
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-lc-card rounded-lg border border-gray-200 dark:border-lc-border p-4">
          <Skeleton className="h-5 w-full" />
        </div>
      ))}
    </div>
  </div>
);
