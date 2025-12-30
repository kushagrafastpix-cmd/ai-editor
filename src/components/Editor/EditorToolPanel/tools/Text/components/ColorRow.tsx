// EditorToolPanel/tools/Text/components/ColorRow.tsx

interface ColorRowProps {
  label: string;
  color: string;
  opacity: number;
  onColorChange?: (color: string) => void; // future
  onOpacityChange: (opacity: number) => void;
}

const ColorRow = ({
  label,
  color,
  opacity,
  onOpacityChange,
}: ColorRowProps) => {
  return (
    <div className="flex items-center justify-between gap-6">
      <span className="text-sm font-medium text-gray-900">
        {label}
      </span>

      <div className="flex gap-3">
        {/* Color box (static for now) */}
        <div className="flex items-center gap-2 rounded-md border border-[#d9d8d6] px-3 py-2">
          <div
            className="h-4 w-4 rounded-sm"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm">
            {color.replace("#", "").toUpperCase()}
          </span>
        </div>

        {/* Opacity */}
        <div className="flex items-center gap-1 rounded-md border border-[#d9d8d6] px-3 py-2">
          <input
            type="number"
            min={0}
            max={100}
            value={opacity}
            onChange={(e) =>
              onOpacityChange(
                Math.min(100, Math.max(0, Number(e.target.value)))
              )
            }
            className="w-12 text-sm outline-none"
          />
          <span className="text-gray-500 text-sm">%</span>
        </div>
      </div>
    </div>
  );
};

export default ColorRow;
