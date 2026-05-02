import React, { FC } from "react";
import { Grid3X3, Table2 } from "lucide-react";

const ToggleView: FC<{
  onChangeView: (val: boolean) => void;
  isList: boolean;
}> = ({ onChangeView, isList }) => {
  return (
    <div className="flex items-center gap-2 border border-border  rounded-3xl">
      <button
        onClick={() => onChangeView(false)}
        aria-label="Toggle Grid View"
        title="Toggle View"
        className={`p-2    rounded-full transition-all ${
          !isList ? "bg-button-primary text-button-primary-foreground" : ""
        }`}
      >
        <Grid3X3 className="h-4 w-4" />
      </button>
      <button
        onClick={() => onChangeView(true)}
        aria-label="Toggle List View"
        title="Toggle View"
        className={`p-2   rounded-full transition-all ${
          isList ? "bg-button-primary text-button-primary-foreground" : ""
        }`}
      >
        <Table2 className="h-4 w-4" />
      </button>
    </div>
  );
};

export default React.memo(ToggleView);
