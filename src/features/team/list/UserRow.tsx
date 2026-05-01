import { UserRowProps } from "@/shared/model/model";
import UserRowAction from "./UserRowAction";
import Modal from "@/shared/components/modal/Modal";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getMembershipForBusiness } from "@/utils/helpers";
import { useAppContext } from "@/shared/contexts/AppContext";
import { CircleCheck, Loader } from "lucide-react";
import { INVITE_STATUS } from "@/shared/enums/enums";

function UserRow({ data }: UserRowProps) {
  const { user } = useAppContext();

  return (
    <>
      {data?.map((row, i) => {
        const membership = getMembershipForBusiness(
          row,
          user?.currentBusiness.id!
        );

        return (
          <TableRow key={row.id} className="  relative border-b ">
            {/* <td className="p-2 font-medium md:px-2 md:py-4 whitespace-nowrap">
							<input
								title="check"
								id="checkbox-all-search"
								type="checkbox"
								className="w-4 h-4 m-0 border-border rounded focus:ring-ring "
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
            {/* <td>
							<span
								title={row.title}
								className='block  ellipsis-overflow'>
								{row.title}
							</span>
						</td> */}
            <TableCell colSpan={2}>
              <span
                title={row.name}
                className={"text-sm font-semibold block   mb-1  rounded-3xl"}
              >
                {row.name}
              </span>
              <span
                title={membership?.business.name}
                className={" text-xs block"}
              >
                {membership?.business.name}
              </span>
            </TableCell>

            <TableCell>
              <span title={row.email} className="block  ">
                {row.email}
              </span>
            </TableCell>
            {/* <TableCell>
							<span
								className=' block ellipsis-overflow'
								title={row.currentBusiness.country}>
								{row.currentBusiness.country}
							</span>
						</TableCell> */}
            <TableCell>
              {membership?.status === INVITE_STATUS.activated && (
                <Badge
                  variant="outline"
                  className="gap-1 border-status-resolved/40 text-status-resolved dark:border-status-resolved/40 dark:text-status-resolved"
                >
                  <CircleCheck
                    className=" "
                    strokeWidth={1.25}
                    size={14}
                    color="green"
                  />

                  {membership?.status}
                </Badge>
              )}
              {membership?.status === INVITE_STATUS.invited && (
                <Badge
                  variant="outline"
                  className="gap-1 border-status-open/40 text-status-open dark:border-status-open/40 dark:text-status-open"
                >
                  <CircleCheck
                    className=" "
                    strokeWidth={1.25}
                    size={14}
                    color="orange"
                  />

                  {membership?.status}
                </Badge>
              )}
              {membership?.status === INVITE_STATUS.declined && (
                <Badge
                  variant="outline"
                  className="gap-1 text-or border-destructive/40 text-destructive dark:border-destructive/40 dark:text-destructive"
                >
                  <CircleCheck
                    className=" "
                    strokeWidth={1.25}
                    size={14}
                    color="red"
                  />

                  {membership?.status}
                </Badge>
              )}
              {/* <Badge
								variant='outline'
								className='gap-1 border-status-resolved/40 text-status-resolved dark:border-status-resolved/40 dark:text-status-resolved'>
								{membership?.status ===
									INVITE_STATUS.activated && (
									/>

									{membership?.status}
								</Badge>
							)}
							{/* <Badge
								variant='outline'
								className='gap-1 border-status-resolved/40 text-status-resolved dark:border-status-resolved/40 dark:text-status-resolved'>
								{membership?.status ===
									INVITE_STATUS.activated && (
									<CircleCheck
										className=' '
										strokeWidth={1.25}
										size={14}
										color='green'
									/>
								)}
								{membership?.status}
							</Badge> */}
              {/* <Badge variant='outline' className='gap-1'>
								{membership?.status ===
									INVITE_STATUS.invited && (
									<Loader strokeWidth={1.25} size={14} />
								)}
								{membership?.status}
							</Badge> */}
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{membership?.role}</Badge>
            </TableCell>
            <Modal>
              <UserRowAction user={row} membership={membership} />
            </Modal>
          </TableRow>
        );
      })}
    </>
  );
}

export default UserRow;
