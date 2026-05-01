import { UnitRowProps } from "@/features/units/models/unit.model";
import UnitRowActions from "./UnitRowActions";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Modal from "@/shared/components/modal/Modal";
import { Home, Building2, Users } from "lucide-react";

function UnitRow({ data }: UnitRowProps) {
  return (
    <>
      {data?.map((row, i) => {
        return (
          <TableRow key={i} className="relative">
            <TableCell className="font-medium whitespace-nowrap">
              <span>{i + 1}.</span>
            </TableCell>
            <TableCell colSpan={2}>
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-muted-foreground" />
                <span title={row.label} className="block font-medium">
                  {row.label}
                </span>
              </div>
            </TableCell>
            <TableCell colSpan={2}>
              <div className="flex items-center gap-1 text-sm">
                <Building2 className="h-3 w-3 text-muted-foreground" />
                <span title={row.property?.name} className="block">
                  {row.property?.name}
                </span>
              </div>
            </TableCell>
            <TableCell>
              {row.tenantActive ? (
                <Badge className="bg-green-100 text-green-800">Occupied</Badge>
              ) : (
                <Badge variant="outline">Vacant</Badge>
              )}
            </TableCell>
            <TableCell>
              {row.tenantUser ? (
                <div className="flex items-center gap-1 text-sm">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{row.tenantUser.name}</div>
                    <div className="text-muted-foreground text-xs">
                      {row.tenantUser.email}
                    </div>
                  </div>
                </div>
              ) : (
                <span className="text-muted-foreground text-sm">No tenant</span>
              )}
            </TableCell>
            <TableCell>
              <span className="flex justify-center gap-2 flex-col">
                <span
                  title={new Date(row.createdAt).toDateString()}
                  className="flex gap-1"
                >
                  {new Date(row.createdAt).toDateString()}
                </span>
              </span>
            </TableCell>
            <Modal>
              <UnitRowActions unit={row} />
            </Modal>
          </TableRow>
        );
      })}
    </>
  );
}

export default UnitRow;
