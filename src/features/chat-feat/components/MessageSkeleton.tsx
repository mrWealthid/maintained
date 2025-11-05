export const MessageSkeleton = () => (
  <div className="flex space-x-3 animate-pulse">
    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center space-x-2 mb-1">
        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);
