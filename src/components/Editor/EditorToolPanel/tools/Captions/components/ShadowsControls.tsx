interface ShadowsControlsProps {
  shadowsEnabled: boolean;
  shadowColor: string;
  shadowX: number;
  shadowY: number;
  shadowBlur: number;
  onToggle: (enabled: boolean) => void;
  onColorChange?: (color: string) => void;
  onXChange: (x: number) => void;
  onYChange: (y: number) => void;
  onBlurChange: (blur: number) => void;
}

const ShadowsControls = ({
  shadowsEnabled,
  shadowColor,
  shadowX,
  shadowY,
  shadowBlur,
  onToggle,
  onXChange,
  onYChange,
  onBlurChange,
}: ShadowsControlsProps) => {
  return (
    <div className="flex flex-col gap-3">
      {/* Toggle row */}
      <div className="flex items-center justify-between gap-6">
        <span className="text-sm font-medium text-gray-900">Shadows</span>

        <button
          onClick={() => onToggle(!shadowsEnabled)}
          className={`relative h-5 w-9 rounded-full transition-colors ${
            shadowsEnabled ? "bg-[#0CB16D]" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-[2px] left-[2px] h-4 w-4 rounded-full bg-white transition-transform ${
              shadowsEnabled ? "translate-x-4" : ""
            }`}
          />
        </button>
      </div>

      {/* Shadow controls (shown when enabled) */}
      {shadowsEnabled && (
        <div className="flex items-center gap-2 pl-0">
          {/* Color picker */}
          <div className="flex items-center gap-2 rounded-md border border-[#d9d8d6] px-3 py-2">
            <div
              className="h-4 w-4 rounded-sm"
              style={{ backgroundColor: shadowColor }}
            />
            <span className="text-sm">
              {shadowColor.replace("#", "").toUpperCase()}
            </span>
          </div>

          {/* X-offset */}
          <div className="flex items-center gap-1 rounded-md border border-[#d9d8d6] px-2 py-2">
            <input
              type="number"
              min={0}
              max={20}
              value={shadowX}
              onChange={(e) => {
                const value = Number(e.target.value);
                onXChange(Math.min(20, Math.max(0, value)));
              }}
              className="w-8 text-sm outline-none"
            />
            <span className="text-gray-500 text-sm">x</span>
          </div>

          {/* Y-offset */}
          <div className="flex items-center gap-1 rounded-md border border-[#d9d8d6] px-2 py-2">
            <input
              type="number"
              min={0}
              max={20}
              value={shadowY}
              onChange={(e) => {
                const value = Number(e.target.value);
                onYChange(Math.min(20, Math.max(0, value)));
              }}
              className="w-8 text-sm outline-none"
            />
            <span className="text-gray-500 text-sm">y</span>
          </div>

          {/* Blur */}
          <div className="flex items-center gap-1 rounded-md border border-[#d9d8d6] px-2 py-2">
            <input
              type="number"
              min={0}
              max={30}
              value={shadowBlur}
              onChange={(e) => {
                const value = Number(e.target.value);
                onBlurChange(Math.min(30, Math.max(0, value)));
              }}
              className="w-8 text-sm outline-none"
            />
            <span className="text-gray-500 text-sm">blur</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShadowsControls;

