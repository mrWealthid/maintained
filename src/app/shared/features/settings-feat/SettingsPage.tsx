"use client";

import { useState } from "react";
import SettingsSidebar from "./components/SettingsSidebar";
import NotificationSettings from "./components/NotificationSettings";
import SecuritySettings from "./components/SecuritySettings";
import CategoryManagement from "./components/CategoryManagement";
import TicketTypeManagement from "./components/TicketTypeManagement";

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("notifications");

  const renderActiveTab = () => {
    switch (activeTab) {
      case "notifications":
        return <NotificationSettings />;
      case "security":
        return <SecuritySettings />;
      case "categories":
        return <CategoryManagement />;
      case "ticket-types":
        return <TicketTypeManagement />;
      default:
        return <NotificationSettings />;
    }
  };

  return (
    <div className="flex h-full bg-background ">
      <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 p-6 overflow-y-auto">{renderActiveTab()}</div>
    </div>
  );
};

export default SettingsPage;
