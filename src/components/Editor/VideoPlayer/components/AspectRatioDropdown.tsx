import { useState } from "react";
import CustomDropdown from "../../../Common/CustomDropdown/CustomDropdown";

type AspectRatio = "9:16" | "16:9" | "1:1" | "4:5";

interface AspectRatioDropdownProps {
  value: AspectRatio;
  onChange: (value: AspectRatio) => void;
}

const AspectRatioDropdown = ({
  value,
  onChange,
}: AspectRatioDropdownProps) => {
  return (
    <div style={{ width: "60px" }}>
      <CustomDropdown
        value={value}
        options={[
          { value: "9:16", label: "9:16" },
          { value: "16:9", label: "16:9" },
          { value: "1:1", label: "1:1" },
          { value: "4:5", label: "4:5" },
        ]}
        onChange={(v) => onChange(v as AspectRatio)}
        className="text-xs px-2"
        style={{ height: "22px" }}
      />
    </div>
  );
};

export default AspectRatioDropdown;
export type { AspectRatio };

