import { TechnicianTicketRowProps } from "@/app/shared/ticket-feat/model/ticket.model";
import TicketRowActions from "./TicketRowActions";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Modal from "@/app/shared/components/modal/Modal";

function RequestRow({ data }: TechnicianTicketRowProps) {
  return (
    <>
      {data?.map((row, i) => {
        const { area, title, user, category } = row.ticket;
        return (
          <TableRow key={row.id} className="relative  ">
            {/* <td className="p-2 font-medium md:px-2 md:py-4 whitespace-nowrap">
							<input
								title="check"
								id="checkbox-all-search"
								type="checkbox"
								className="w-4 h-4 m-0 border-gray-300 rounded focus:ring-gray-500 "
							/>
							<label
								htmlFor="checkbox-all-search text-sm"
								className="sr-only">
								#
							</label>
						</td> */}
            <TableCell className="font-medium  whitespace-nowrap">
              <span>{i + 1}.</span>
            </TableCell>
            <TableCell colSpan={3}>
              <span title={title} className="block ">
                {title}
              </span>
            </TableCell>
            <TableCell colSpan={2}>
              <span
                title={user.name}
                className={"text-sm font-semibold block   mb-1  rounded-3xl"}
              >
                {user.name}
              </span>
              {/* <span
								title={row.category?.name}
								className={' ellipsis-overflow text-xs block'}>
								{row.category?.name}
							</span> */}
            </TableCell>

            <TableCell>
              <span className=" block " title={category.name}>
                {category.name}
              </span>
            </TableCell>
            <TableCell>
              <span className=" block ellipsis-overflow" title={area}>
                {area}
              </span>
            </TableCell>
            <TableCell>
              <Badge variant="outline">
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
                  {/* <span>
										{new Date(row.startDate).toDateString()}{' '}
										➡️
									</span> */}

                  {/* <span>
										{' '}
										{new Date(row.endDate).toDateString()}
									</span> */}
                  {new Date(row.createdAt).toDateString()}
                </span>
              </span>
            </TableCell>

            <Modal>
              <TicketRowActions technicianRequest={row} />
            </Modal>
          </TableRow>
        );
      })}
    </>
  );
}

export default RequestRow;
