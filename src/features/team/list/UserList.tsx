"use client";

import React from "react";
import { fetchUsers } from "../services/user.service";
import UserHeaderActions from "./UserHeaderActions";
import UserRow from "./UserRow";
import { INVITE_STATUS, ROLES } from "@/shared/enums/enums";
import { TableColumn } from "@/shared/components/table/models/table.model";
import { User } from "@/shared/model/model";
import TableComponent from "@/shared/components/table/Table";

// API response flattens current-business membership status/role onto each user
type UserListRow = User & { status?: INVITE_STATUS; role?: ROLES };

const UserList = () => {
  const columns: TableColumn<UserListRow>[] = [
    {
      header: "Name",
      accessor: "name",
      searchType: "TEXT",
      filterKey: "name",
      colspan: 2,
      exportValue: (row) => row.name ?? "",
    },
    {
      header: "Email",
      accessor: "email",
      exportValue: (row) => row.email ?? "",
    },
    {
      header: "Invite Status",
      accessor: "status",
      searchType: "DROPDOWN",
      filterKey: "status",
      selectOptions: [
        { name: "Invited", value: INVITE_STATUS.invited },
        { name: "Activated", value: INVITE_STATUS.activated },
        { name: "Declined", value: INVITE_STATUS.declined },
      ],
      exportValue: (row) => row.status ?? "",
    },
    {
      header: "Role",
      accessor: "role",
      searchType: "DROPDOWN",
      filterKey: "role",
      selectOptions: [
        { name: "Admin", value: ROLES.admin },
        { name: "User", value: ROLES.user },
      ],
      exportValue: (row) => row.role ?? "",
    },
  ];

  return (
    <TableComponent<UserListRow>
      headerActions={<UserHeaderActions />}
      service={fetchUsers}
      exportTitle="Team"
      defaultParams={{ status: INVITE_STATUS.invited }}
      searchKey="name"
      queryKey="Users"
      columns={columns}
    >
      <TableComponent.TableHeader />
      <TableComponent.TableRow customRow={true}>
        <UserRow />
      </TableComponent.TableRow>
    </TableComponent>
  );
};

export default UserList;
