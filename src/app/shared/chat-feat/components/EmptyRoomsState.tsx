import { Button } from "@/components/ui/button";
import { MessageSquare, Plus } from "lucide-react";

export const EmptyRoomsState = () => (
  <div className="flex-1 flex items-center justify-center p-8">
    <div className="text-center max-w-md">
      <div className="mx-auto h-24 w-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
        <MessageSquare className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        No Tickets Yet
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        When maintenance requests are submitted, they&apos;ll appear here for
        you to manage and respond to.
      </p>
      <Button className="bg-blue-600 hover:bg-blue-700">
        <Plus className="h-4 w-4 mr-2" />
        Create New Ticket
      </Button>
    </div>
  </div>
);
