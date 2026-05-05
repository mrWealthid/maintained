import { TableCell } from "@/components/ui/table";
import WorkspaceActions from "../components/WorkspaceActions";
import type { WorkspaceListRowDTO } from "../models/workspace-list.model";

export default function WorkspaceRowActions({
  workspace,
}: {
  workspace: WorkspaceListRowDTO;
}) {
  return (
    <TableCell className="md:px-2 py-2">
      <WorkspaceActions workspace={workspace} />
    </TableCell>
  );
}
