// EditorToolPanel/tools/Music/components/MusicSearchBar.tsx

import SearchIcon from "../../../../../Common/Icons/SearchIcon";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

const MusicSearchBar = ({ value, onChange }: Props) => {
  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search copyright free music"
        className="
          w-full
          h-10
          rounded-md
          border border-[#d9d8d6]
          px-3
          pr-10
          text-sm
          outline-none
        "
      />
      {/* Search icon */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <SearchIcon className="h-4 w-4" />
      </div>
    </div>
  );
};

export default MusicSearchBar;
