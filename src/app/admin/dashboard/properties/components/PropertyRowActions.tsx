import React, { FC } from "react";
import { PropertyRowActionsProps } from "@/app/shared/property-feat/model/property.model";
import { TableCell } from "@/components/ui/table";
import PropertyActions from "@/app/shared/property-feat/pages/PropertyActions";

const PropertyRowActions: FC<PropertyRowActionsProps> = ({ property }) => {
  return (
    <TableCell className="md:px-2 py-2 space-x-3">
      <PropertyActions property={property} />
    </TableCell>
  );
};

export default PropertyRowActions;
