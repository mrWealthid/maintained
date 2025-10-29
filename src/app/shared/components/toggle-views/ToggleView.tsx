import React, { FC } from "react";
import { CiViewTable } from "react-icons/ci";
import { TfiViewGrid } from "react-icons/tfi";

const ToggleView: FC<{
  onChangeView: (val: boolean) => void;
  isList: boolean;
}> = ({ onChangeView, isList }) => {
  return (
    <div className="flex items-center gap-2 border border-gray-300  rounded-3xl">
      <button
        onClick={() => onChangeView(false)}
        aria-label="Toggle Grid View"
        title="Toggle View"
        className={`p-2    rounded-full transition-all ${
          !isList ? "bg-button-primary text-button-primary-foreground" : ""
        }`}
      >
        <TfiViewGrid />
      </button>
      <button
        onClick={() => onChangeView(true)}
        aria-label="Toggle List View"
        title="Toggle View"
        className={`p-2   rounded-full transition-all ${
          isList ? "bg-button-primary text-button-primary-foreground" : ""
        }`}
      >
        <CiViewTable />
      </button>
    </div>
  );
};

export default React.memo(ToggleView);
