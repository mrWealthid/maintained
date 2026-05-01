import { MessageSquare } from "lucide-react";

export const EmptyChatState = () => (
  <div className="flex-1 flex items-center justify-center p-8">
    <div className="text-center max-w-md">
      <div className="mx-auto h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
        <MessageSquare className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Select a Ticket
      </h3>
      <p className="text-gray-500 dark:text-gray-400">
        Choose a maintenance request from the sidebar to view and respond to
        messages.
      </p>
    </div>
  </div>
);
