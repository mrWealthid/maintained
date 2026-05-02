import React, { FC } from "react";
import { UnitRowActionsProps } from "@/features/units/models/unit.model";
import { TableCell } from "@/components/ui/table";
import UnitActions from "@/features/units/components/UnitActions";

const UnitRowActions: FC<UnitRowActionsProps> = ({ unit }) => {
  return (
    <TableCell className="md:px-2 py-2 space-x-3">
      <UnitActions unit={unit} />
    </TableCell>
  );
};

export default UnitRowActions;
