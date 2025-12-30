import type { FileFilter } from "../types";
import ChevronDownIcon from "../../../../../Common/Icons/ChevronDownIcon";

interface FileTypeFilterProps {
  value: FileFilter;
  onChange: (filter: FileFilter) => void;
}

const FileTypeFilter = ({ value, onChange }: FileTypeFilterProps) => {
  const options: { value: FileFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "audio", label: "Audio" },
    { value: "image", label: "Image" },
    { value: "video", label: "Video" },
  ];

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as FileFilter)}
        className="
          h-10
          appearance-none
          rounded-md
          border border-[#d9d8d6]
          bg-[#FBFBFC]
          px-3
          pr-10
          text-sm
          outline-none
          cursor-pointer
        "
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
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
  );
};

export default FileTypeFilter;

