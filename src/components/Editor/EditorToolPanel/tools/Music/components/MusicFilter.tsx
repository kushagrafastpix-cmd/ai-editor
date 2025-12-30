// EditorToolPanel/tools/Music/components/MusicFilter.tsx

import ChevronDownIcon from "../../../../../Common/Icons/ChevronDownIcon";

interface Props {
  value: "all" | "liked";
  onChange: (v: "all" | "liked") => void;
}

const MusicFilter = ({ value, onChange }: Props) => {
  return (
    <div className="relative w-[120px]">
      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value as "all" | "liked")
        }
        className="
          w-full
          h-10
          appearance-none
          rounded-md
          border border-[#d9d8d6]
          bg-white
          px-3
          pr-10
          text-sm
          outline-none
        "
      >
        <option value="all">All</option>
        <option value="liked">Liked</option>
      </select>

      {/* Chevron icon */}
      <ChevronDownIcon
        className="
          pointer-events-none
          absolute
          right-3
          top-1/2
          h-4
          w-4
          -translate-y-1/2
          text-gray-600
        "
      />
    </div>
  );
};

export default MusicFilter;
