// EditorToolPanel/tools/Text/components/FontSettings.tsx

const FontSettings = () => {
  return (
    <div className="flex flex-col gap-3">
      <span className="font-medium text-gray-800">
        Font settings
      </span>

      <div className="flex gap-3">
        {/* Font family */}
        <select className="flex-1 rounded-md border border-[#d9d8d6] px-3 py-2">
          <option>Inter</option>
        </select>

        {/* Font weight */}
        <select className="flex-1 rounded-md border border-[#d9d8d6] px-3 py-2">
          <option>Semibold</option>
        </select>

        {/* Font size */}
        <div className="flex items-center gap-2 rounded-md border border-[#d9d8d6] px-3 py-2">
          <input
            type="number"
            defaultValue={40}
            className="w-12 outline-none"
          />
          <span className="text-gray-500">px</span>
        </div>
      </div>
    </div>
  );
};

export default FontSettings;
