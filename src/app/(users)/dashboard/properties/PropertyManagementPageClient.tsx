"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Home } from "lucide-react";
import PropertyList from "@/features/properties/list/PropertyList";
import UnitList from "@/features/units/list/UnitList";
import PropertyHeaderActions from "@/features/properties/list/PropertyHeaderActions";
import UnitHeaderActions from "@/features/units/list/UnitHeaderActions";

const PropertyManagementPage = () => {
  const [activeTab, setActiveTab] = useState("properties");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-full border border-border/70 bg-secondary p-1 shadow-none sm:w-auto">
            <TabsTrigger
              value="properties"
              className="justify-start gap-3 rounded-full px-3 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:text-muted-foreground"
            >
              <Building2 className="h-4 w-4" />
              Properties
            </TabsTrigger>
            <TabsTrigger
              value="units"
              className="justify-start gap-3 rounded-full px-3 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:text-muted-foreground"
            >
              <Home className="h-4 w-4" />
              Units
            </TabsTrigger>
          </TabsList>

          {activeTab === "properties" && <PropertyHeaderActions />}
          {activeTab === "units" && <UnitHeaderActions />}
        </div>

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
