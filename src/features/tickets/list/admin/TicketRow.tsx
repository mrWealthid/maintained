import Link from "next/link";
import { TicketRowProps } from "@/features/tickets/models/ticket.model";
import TicketRowActions from "./TicketRowActions";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
function RequestRow({
  data,
  enableSelection,
  getRowIdForRow,
  isRowSelected,
  toggleRowSelection,
}: TicketRowProps) {
  return (
    <>
      {data?.map((row, i) => {
        const rowId = getRowIdForRow ? getRowIdForRow(row, i) : row.id;
        const checked = !!enableSelection && !!isRowSelected?.(rowId);
        return (
          <TableRow key={i} className="relative  ">
            {enableSelection ? (
              <TableCell className="w-8 px-2">
                <Checkbox
                  aria-label="Select row"
                  checked={checked}
                  onCheckedChange={() => toggleRowSelection?.(rowId)}
                  className="m-0"
                />
              </TableCell>
            ) : null}
            <TableCell className="font-medium  whitespace-nowrap">
              <span>{i + 1}.</span>
            </TableCell>
            <TableCell colSpan={3}>
              <Link
                href={`/dashboard/ticket-management/${row.slug}`}
                title={row.title}
                className="block font-medium text-foreground hover:text-primary hover:underline"
              >
                {row.title}
              </Link>
            </TableCell>
            <TableCell colSpan={2}>
              <span
                title={row.user?.name}
                className={"text-sm font-semibold block   mb-1  rounded-3xl"}
              >
                {row.user?.name}
              </span>
              {/* <span
								title={row.category?.name}
								className={' ellipsis-overflow text-xs block'}>
								{row.category?.name}
							</span> */}
            </TableCell>

            <TableCell>
              <span className=" block " title={row.category?.name}>
                {row.category?.name}
              </span>
            </TableCell>
            <TableCell>
              <span className=" block ellipsis-overflow" title={row.area}>
                {row.area}
              </span>
            </TableCell>
            <TableCell>
              <span className="block" title={row.actionedBy?.name}>
                {row.actionedBy?.name || "N/A"}
              </span>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">
                {row.status}
                {/*
								<IconLoader/> */}
              </Badge>
              {/* <span
								style={{
									backgroundColor: getStatusColor(row.status)
								}}
								className='text-[8px] md:text-xs text-primary py-2 px-3 rounded-3xl inline-flex'>
								{row.status}
							</span> */}
            </TableCell>
            <TableCell>
              <span className="flex justify-center gap-2 flex-col">
                {/* <span className='font-bold'>
									{row.} Night(s)
								</span> */}

                <span
                  title={new Date(row.createdAt).toDateString()}
                  className="flex  gap-1"
                >
                  {new Date(row.createdAt).toDateString()}
                </span>
              </span>
            </TableCell>
            <TicketRowActions ticket={row} />
          </TableRow>
        );
      })}
    </>
  );
}

export default RequestRow;
