// EditorToolPanel/tools/Music/components/UploadButton.tsx

import UploadFileIcon from "../../../../../Common/Icons/UploadFileIcon";

interface UploadButtonProps {
  onUpload: (file: File) => void;
}

const UploadButton = ({ onUpload }: UploadButtonProps) => {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
      e.target.value = ""; // reset input
    }
  };

  return (
    <label
      className="
        flex
        h-10
        cursor-pointer
        items-center
        gap-2
        rounded-md
        bg-[#4CAF73]
        px-4
        text-sm
        font-medium
        text-white
      "
    >
      <UploadFileIcon className="h-4 w-4" />
      Upload

      <input
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handleChange}
      />
    </label>
  );
};

export default UploadButton;
