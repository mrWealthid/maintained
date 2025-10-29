"use client";
import React from "react";
import { useProfile } from "./hooks/useProfile";
import Image from "next/image";
import { User } from "../../model/model";

function Profile() {
  const { data, isLoading, error } = useProfile<User>();

  return (
    <div className="flex items-center gap-2">
      <Image
        width={30}
        height={30}
        className="border cursor-pointer rounded-full"
        alt="default"
        src={"/images/default.jpg"}
      />

      {<span className="capitalize">{data?.name}</span>}
    </div>
  );
}

export default React.memo(Profile);
