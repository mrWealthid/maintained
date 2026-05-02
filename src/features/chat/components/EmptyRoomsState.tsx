import { Button } from "@/components/ui/button";
import { MessageSquare, Plus } from "lucide-react";

export const EmptyRoomsState = () => (
  <div className="flex-1 flex items-center justify-center p-8">
    <div className="text-center max-w-md">
      <div className="mx-auto h-24 w-24 bg-muted rounded-full flex items-center justify-center mb-6">
        <MessageSquare className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        No Tickets Yet
      </h3>
      <p className="text-muted-foreground mb-6">
        When maintenance requests are submitted, they&apos;ll appear here for
        you to manage and respond to.
      </p>
      {/* <Button className="bg-primary hover:bg-primary/90">
        <Plus className="h-4 w-4 mr-2" />
        Create New Ticket
      </Button> */}
    </div>
  </div>
);
