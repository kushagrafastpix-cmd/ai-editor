import type { TextStyle } from "../types";
import CustomDropdown from "@/components/ui/CustomDropdown/CustomDropdown";

interface FontSettingsProps {
  style: TextStyle;
  onChange: (style: Partial<TextStyle>) => void;
}

const FontSettings = ({ style, onChange }: FontSettingsProps) => {
  return (
    <div className="flex flex-col gap-3 w-full min-w-0">
      {/* Font family - full width on first line */}
      <CustomDropdown
        value={style.fontFamily}
        options={[
          { value: "Inter", label: "Inter" },
          { value: "Roboto", label: "Roboto" },
          { value: "Poppins", label: "Poppins" },
        ]}
        onChange={(value) => onChange({ fontFamily: value })}
      />

      {/* Font weight and size - 50-50 on second line */}
      <div className="flex gap-3 w-full">
        {/* Font weight */}
        <div className="flex-1">
          <CustomDropdown
              value={style.fontWeight}
            options={[
              { value: "Regular", label: "Regular" },
              { value: "Semibold", label: "Semibold" },
              { value: "Bold", label: "Bold" },
            ]}
            onChange={(value) => onChange({ fontWeight: value })}
          />
        </div>

        {/* Font size */}
        <div className="flex-1">
        <div
          className="
            h-10
            flex
            items-center
            gap-1
            rounded-md
            border border-[#d9d8d6]
            bg-[#FBFBFC]
            px-2
          "
        >
          <input
            type="number"
            className="
              w-full
              bg-transparent
              text-sm
              outline-none
            "
            value={style.fontSize}
            onChange={(e) =>
              onChange({
                fontSize: Number(e.target.value),
              })
            }
          />
          <span className="text-gray-500 text-sm">px</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FontSettings;
