// EditorToolPanel/tools/Text/components/ColorRow.tsx

interface ColorRowProps {
  label: string;
  color: string;
}

const ColorRow = ({ label, color }: ColorRowProps) => {
  return (
    <div className="flex items-center justify-between gap-6">
      <span className="font-medium text-gray-800">
        {label}
      </span>

      <div className="flex gap-3">
        <div className="flex items-center gap-2 rounded-md border border-[#d9d8d6] px-3 py-2">
          <div
            className="h-4 w-4 rounded-sm"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm">
            {color.replace("#", "").toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-2 rounded-md border border-[#d9d8d6] px-3 py-2">
          <span>100</span>
          <span className="text-gray-500">%</span>
        </div>
      </div>
    </div>
  );
};

export default ColorRow;
