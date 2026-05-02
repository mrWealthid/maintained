import { MessageSquare } from "lucide-react";

export const EmptyChatState = () => (
  <div className="flex-1 flex items-center justify-center p-8">
    <div className="text-center max-w-md">
      <div className="mx-auto h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <MessageSquare className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Select a Ticket
      </h3>
      <p className="text-muted-foreground">
        Choose a maintenance request from the sidebar to view and respond to
        messages.
      </p>
    </div>
  </div>
);
