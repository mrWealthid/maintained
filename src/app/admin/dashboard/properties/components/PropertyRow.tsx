import { PropertyRowProps } from "@/app/shared/property-feat/model/property.model";
import PropertyRowActions from "./PropertyRowActions";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Modal from "@/app/shared/components/modal/Modal";
import { Building2, MapPin } from "lucide-react";

function PropertyRow({ data }: PropertyRowProps) {
  return (
    <>
      {data?.map((row, i) => {
        return (
          <TableRow key={i} className="relative">
            <TableCell className="font-medium whitespace-nowrap">
              <span>{i + 1}.</span>
            </TableCell>
            <TableCell colSpan={3}>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span title={row.name} className="block font-medium">
                  {row.name}
                </span>
              </div>
            </TableCell>
            <TableCell colSpan={2}>
              <Badge variant="outline" className="capitalize">
                {row.type?.replace(/_/g, " ")}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span title={row.address?.line1} className="block">
                  {row.address?.line1}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <span className="block" title={row.address?.city}>
                {row.address?.city}
              </span>
            </TableCell>
            <TableCell>
              <span className="block" title={row.address?.state}>
                {row.address?.state}
              </span>
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
              <PropertyRowActions property={row} />
            </Modal>
          </TableRow>
        );
      })}
    </>
  );
}

export default PropertyRow;
