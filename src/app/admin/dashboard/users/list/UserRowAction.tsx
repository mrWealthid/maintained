import React, { FC } from "react";
import { UserRowActionsProps } from "@/app/shared/model/model";
import Modal from "@/app/shared/components/modal/Modal";
import ConfirmationPage from "@/app/shared/components/ui/ConfirmationPage";
import { useDeleteUser, useReInviteUser } from "../hooks/userHooks";
import UserForm from "../UserForm";
import { TfiMore } from "react-icons/tfi";
import { TableCell } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { getMembershipForBusiness } from "@/utils/helpers";
import { INVITE_STATUS } from "@/app/shared/enums/enums";

const UserRowAction: FC<UserRowActionsProps> = ({ user }) => {
  const { isDeleting, deleteUser } = useDeleteUser();
  const { isInviting, reInviteUser } = useReInviteUser();

  function handleDelete(onCloseModal: () => void) {
    if (!user.id) return;
    deleteUser(user.id, {
      onSuccess: () => onCloseModal(),
    });
  }
  function handleReInviteUser(
    onCloseModal: () => void,
    payload: { email: string }
  ) {
    if (!user.id) return;
    reInviteUser(payload, {
      onSuccess: () => onCloseModal(),
    });
  }

  const member = getMembershipForBusiness(user, user.currentBusiness.id);
  return (
    <TableCell className="md:px-2 py-2 space-x-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={"ghost"}
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <TfiMore />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem>
            <Modal.Open opens="edit-user-form">
              <button type="button" className="w-full text-left">
                Edit
              </button>
            </Modal.Open>
          </DropdownMenuItem>

          {member?.inviteExpired &&
            member.status !== INVITE_STATUS.activated && (
              <DropdownMenuItem>
                <Modal.Open opens="re-invite">
                  <button type="button" className="w-full text-left">
                    Re-Invite
                  </button>
                </Modal.Open>
              </DropdownMenuItem>
            )}
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Modal.Open opens="delete-user">
              <button type="button" className="w-full text-left">
                Delete
              </button>
            </Modal.Open>
            {/* Delete */}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Modal.Window
        title="Manage User"
        description="Manage your users"
        name="edit-user-form"
      >
        <UserForm user={user} />
      </Modal.Window>

      <Modal.Window
        title="Delete User"
        description="User will be deleted permanently"
        name="delete-user"
      >
        <ConfirmationPage
          handler={(onCloseModal: () => void) => {
            handleDelete(onCloseModal);
          }}
          isLoading={isDeleting}
          modalText={
            <span>
              Are you sure you want to delete <b>{user.name}</b>
            </span>
          }
        />
      </Modal.Window>

      <Modal.Window
        title="Re-Invite"
        description="User will be re-invited"
        name="re-invite"
      >
        <ConfirmationPage
          handler={(onCloseModal: () => void) => {
            handleReInviteUser(onCloseModal, { email: user.email });
          }}
          isLoading={isInviting}
          modalText={
            <span>
              Are you sure you want to re-invite <b>{user.name}</b>
            </span>
          }
        />
      </Modal.Window>
    </TableCell>
  );
};

export default UserRowAction;
