"use client";
import React, { FC, useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserForm from "./UserForm";
import MultipleUserForm from "./MultipleUserForm";
import { Plus, Users, UserPlus } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const AddUser: FC = () => {
  const [singleUserOpen, setSingleUserOpen] = useState(false);
  const [multipleUsersOpen, setMultipleUsersOpen] = useState(false);

  return (
    <>
      {/* Single User Dialog */}
      <Dialog open={singleUserOpen} onOpenChange={setSingleUserOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
            <DialogDescription>
              Add users to your organization
            </DialogDescription>
          </DialogHeader>
          <Separator />
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
        </DialogContent>
      </Dialog>

      {/* Multiple Users Dialog */}
      <Dialog open={multipleUsersOpen} onOpenChange={setMultipleUsersOpen}>
        <DialogContent className="w-screen h-screen max-w-none max-h-none rounded-none border-0 p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Add Multiple Users</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6 pt-4">
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
          </div>
        </DialogContent>
      </Dialog>

      {/* Dropdown Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="flex items-center gap-1  rounded-3xl">
            <CiCirclePlus size={18} />
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
