import CustomDropdown from "@/components/ui/CustomDropdown/CustomDropdown";

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
        className="text-[10px]"
        style={{ height: "22px", paddingLeft: "4px", paddingRight: "20px" }}
      />
    </div>
  );
};

export default LayoutDropdown;
export type { Layout };

