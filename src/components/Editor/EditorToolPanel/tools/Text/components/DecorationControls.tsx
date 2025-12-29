// EditorToolPanel/tools/Text/components/DecorationControls.tsx

const ACTIVE_COLOR = "#5D09C7";

const DecorationControls = () => {
  return (
    <div className="flex items-center justify-between gap-6">
      {/* Label */}
      <span className="text-sm font-medium text-gray-900">
        Decoration
      </span>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          className="flex h-9 w-9 items-center justify-center rounded-md border"
          style={{
            borderColor: ACTIVE_COLOR,
            color: ACTIVE_COLOR,
          }}
        >
          –
        </button>

        <button className="flex h-9 w-9 items-center justify-center rounded-md border border-[#d9d8d6]">
          U
        </button>

        <button className="flex h-9 w-9 items-center justify-center rounded-md border border-[#d9d8d6]">
          S
        </button>
      </div>
    </div>
  );
};

export default DecorationControls;
