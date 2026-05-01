export const MessageSkeleton = () => (
  <div className="flex space-x-3 animate-pulse">
    <div className="h-8 w-8 bg-muted dark:bg-muted rounded-full flex-shrink-0"></div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center space-x-2 mb-1">
        <div className="h-4 w-20 bg-muted dark:bg-muted rounded"></div>
        <div className="h-4 w-12 bg-muted dark:bg-muted rounded"></div>
        <div className="h-3 w-16 bg-muted dark:bg-muted rounded"></div>
      </div>
      <div className="bg-muted rounded-lg p-3 border border-border">
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted dark:bg-muted rounded"></div>
          <div className="h-4 w-3/4 bg-muted dark:bg-muted rounded"></div>
        </div>
      </div>
    </div>
  </div>
);
