"use client";
import React, { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  AppDialogBody,
  AppDialogContent,
  AppDialogHeader,
} from "@/shared/components/AppDialogShell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserForm from "../forms/UserForm";
import MultipleUserForm from "../forms/MultipleUserForm";
import { Plus, PlusCircle, Users, UserPlus } from "lucide-react";
import { useHasPermission } from "@/shared/hooks/usePermission";
import { PERMISSION } from "@/shared/auth/permission-registry";

const AddUser: FC = () => {
  const [singleUserOpen, setSingleUserOpen] = useState(false);
  const [multipleUsersOpen, setMultipleUsersOpen] = useState(false);
  const canInviteTeam = useHasPermission(PERMISSION.TEAM_INVITE);

  if (!canInviteTeam) return null;

  return (
    <>
      {/* Single User Dialog */}
      <Dialog open={singleUserOpen} onOpenChange={setSingleUserOpen}>
        <AppDialogContent className="sm:max-w-lg">
          <AppDialogHeader
            title="Add User"
            description="Invite a single user to this workspace."
            icon={UserPlus}
          />
          <AppDialogBody>
            <UserForm
              successCallback={() => {
                setSingleUserOpen(false);
              }}
              onCloseModal={() => {
                setSingleUserOpen(false);
              }}
              errorCallback={(e) => {
                console.error("Error creating user:", e);
              }}
            />
          </AppDialogBody>
        </AppDialogContent>
      </Dialog>

      {/* Multiple Users Dialog */}
      <Dialog open={multipleUsersOpen} onOpenChange={setMultipleUsersOpen}>
        <AppDialogContent className="h-[100dvh] max-h-[100dvh] w-screen max-w-none rounded-none border-0 sm:max-h-[100dvh] sm:max-w-none">
          <AppDialogHeader
            title="Add Multiple Users"
            description="Invite multiple users to this workspace from one flow."
            icon={Users}
          />
          <AppDialogBody>
            <MultipleUserForm
              successCallback={() => {
                setMultipleUsersOpen(false);
              }}
              onCloseModal={() => {
                setMultipleUsersOpen(false);
              }}
              errorCallback={(e) => {
                console.error("Error creating users:", e);
              }}
            />
          </AppDialogBody>
        </AppDialogContent>
      </Dialog>

      {/* Dropdown Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="flex items-center gap-1  rounded-3xl">
            <PlusCircle className="h-[18px] w-[18px]" />
            Add User
            <Plus size={14} className="ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setSingleUserOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Single User
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setMultipleUsersOpen(true)}>
            <Users className="h-4 w-4 mr-2" />
            Add Multiple Users
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default AddUser;
