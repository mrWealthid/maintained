import ChatComponent from "@/features/chat/ChatComponent";
import { requireDashboardAccess } from "@/lib/auth/requireDashboardAccess";
import { PERMISSION } from "@/shared/auth/permission-registry";
import React from "react";

const page = async () => {
  await requireDashboardAccess({
    requiredPermission: PERMISSION.CHAT_VIEW,
  });

  return <ChatComponent />;
};

export default page;
