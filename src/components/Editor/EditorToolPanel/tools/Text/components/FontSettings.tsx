import type { TextStyle } from "../types";
import ChevronDownIcon from "../../../../../Common/Icons/ChevronDownIcon";

interface FontSettingsProps {
  style: TextStyle;
  onChange: (style: Partial<TextStyle>) => void;
}

const FontSettings = ({ style, onChange }: FontSettingsProps) => {
  return (
    <div className="flex flex-col gap-3">
      <span className="font-medium text-gray-800">Font settings</span>

      <div className="flex gap-3 w-full min-w-0">
        {/* Font family (flexible width) */}
        <div className="flex-1">
          <div className="relative">
            <select
              className="
                w-full
                h-10
                appearance-none
                rounded-md
                border border-[#d9d8d6]
                bg-[#FBFBFC]
                px-3 pr-12
                text-sm
                outline-none
              "
              value={style.fontFamily}
              onChange={(e) => onChange({ fontFamily: e.target.value })}
            >
              <option value="Inter">Inter</option>
              <option value="Inter">Roboto</option>
              <option value="Inter">Poppins</option>
            </select>

            <ChevronDownIcon
              className="
                pointer-events-none
                absolute
                right-3
                top-1/2
                h-4 w-4
                -translate-y-1/2
                text-gray-500
              "
            />
          </div>
        </div>

        {/* Font weight (medium width) */}
        <div className="w-[140px]">
          <div className="relative">
            <select
              className="
                w-full
                h-10
                appearance-none
                rounded-md
                border border-[#d9d8d6]
                bg-[#FBFBFC]
                px-3 pr-12
                text-sm
                outline-none
              "
              value={style.fontWeight}
              onChange={(e) => onChange({ fontWeight: e.target.value })}
            >
              <option value="Regular">Regular</option>
              <option value="Semibold">Semibold</option>
              <option value="Bold">Bold</option>
            </select>

            <ChevronDownIcon
              className="
        pointer-events-none
        absolute
        right-3
        top-1/2
        h-4 w-4
        -translate-y-1/2
        text-gray-500
      "
            />
          </div>
        </div>

        {/* Font size (small fixed width) */}
        <div
          className="
            w-[80px]
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
  );
};

export default FontSettings;
