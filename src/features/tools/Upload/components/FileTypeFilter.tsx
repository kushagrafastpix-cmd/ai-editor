import type { FileFilter } from "../types";
import CustomDropdown from "@/components/ui/CustomDropdown/CustomDropdown";

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
    <div className="w-[120px]">
      <CustomDropdown
        value={value}
        options={options}
        onChange={(v) => onChange(v as FileFilter)}
      />
    </div>
  );
};

export default FileTypeFilter;

