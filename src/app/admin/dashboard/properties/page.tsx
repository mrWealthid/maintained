"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Home } from "lucide-react";
import PropertyList from "./components/PropertyList";
import UnitList from "./components/UnitList";

const PropertyManagementPage = () => {
  const [activeTab, setActiveTab] = useState("properties");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Property Management
          </h1>
          <p className="text-muted-foreground">
            Manage your properties and units
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="properties" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Properties
          </TabsTrigger>
          <TabsTrigger value="units" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Units
          </TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="space-y-6">
          <PropertyList />
        </TabsContent>

        <TabsContent value="units" className="space-y-6">
          <UnitList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PropertyManagementPage;
