interface Props {
  enabled: boolean;
  onToggle: (value: boolean) => void;
}

const AutoTransitionToggle = ({ enabled, onToggle }: Props) => {
  return (
    <div className="mt-2 flex items-center justify-between px-4 py-3">
      <span className="text-sm font-medium text-gray-900">
        Auto transitions
      </span>

      <button
        onClick={() => onToggle(!enabled)}
        className={`relative h-5 w-9 rounded-full transition-colors ${
          enabled ? "bg-[#0CB16D]" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-[2px] left-[2px] h-4 w-4 rounded-full bg-white transition-transform ${
            enabled ? "translate-x-4" : ""
          }`}
        />
      </button>
    </div>
  );
};

export default AutoTransitionToggle;
