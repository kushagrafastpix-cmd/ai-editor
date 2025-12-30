// EditorToolPanel/tools/Music/components/MusicSearchBar.tsx

import UploadButton from "./UploadButton";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onUpload: (file: File) => void;
}

const MusicSearchBar = ({
  value,
  onChange,
  onUpload,
}: Props) => {
  return (
    <div className="flex gap-3">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search copyright free music"
        className="
          flex-1
          h-10
          rounded-md
          border border-[#d9d8d6]
          px-3
          text-sm
          outline-none
        "
      />

      <UploadButton onUpload={onUpload} />
    </div>
  );
};

export default MusicSearchBar;
