import CustomDropdown from "../../../Common/CustomDropdown/CustomDropdown";

type Layout = "fill" | "fit" | "split" | "three" | "four";

interface LayoutDropdownProps {
  value: Layout;
  onChange: (value: Layout) => void;
}

const LayoutDropdown = ({ value, onChange }: LayoutDropdownProps) => {
  return (
    <div style={{ width: "60px" }}>
      <CustomDropdown
        value={value}
        options={[
          { value: "fill", label: "Fill" },
          { value: "fit", label: "Fit" },
          { value: "split", label: "Split" },
          { value: "three", label: "Three" },
          { value: "four", label: "Four" },
        ]}
        onChange={(v) => onChange(v as Layout)}
        className="text-xs px-2"
        style={{ height: "22px" }}
      />
    </div>
  );
};

export default LayoutDropdown;
export type { Layout };

