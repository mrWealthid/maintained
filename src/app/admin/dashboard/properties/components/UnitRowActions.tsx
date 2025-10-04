import React, { FC } from "react";
import { UnitRowActionsProps } from "@/app/shared/features/property-feat/model/unit.model";
import { TableCell } from "@/components/ui/table";
import UnitActions from "@/app/shared/features/property-feat/pages/UnitActions";

const UnitRowActions: FC<UnitRowActionsProps> = ({ unit }) => {
  return (
    <TableCell className="md:px-2 py-2 space-x-3">
      <UnitActions unit={unit} />
    </TableCell>
  );
};

export default UnitRowActions;
