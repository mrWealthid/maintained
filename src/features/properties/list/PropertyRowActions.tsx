import React, { FC } from "react";
import { PropertyRowActionsProps } from "@/features/properties/models/property.model";
import { TableCell } from "@/components/ui/table";
import PropertyActions from "@/features/properties/components/PropertyActions";

const PropertyRowActions: FC<PropertyRowActionsProps> = ({ property }) => {
  return (
    <TableCell className="md:px-2 py-2 space-x-3">
      <PropertyActions property={property} />
    </TableCell>
  );
};

export default PropertyRowActions;
