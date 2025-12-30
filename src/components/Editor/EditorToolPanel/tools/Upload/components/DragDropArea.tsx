import { useRef, useState } from "react";
import UploadCloudIcon from "../../../../../Common/Icons/UploadCloudIcon";

interface DragDropAreaProps {
  onFilesSelected: (files: File[]) => void;
}

const DragDropArea = ({ onFilesSelected }: DragDropAreaProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(
      (file) =>
        file.type.startsWith("video/") ||
        file.type.startsWith("audio/") ||
        file.type.startsWith("image/")
    );

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFilesSelected(files);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative
          flex
          flex-col
          items-center
          justify-center
          gap-3
          rounded-md
          border-2
          border-dashed
          bg-white
          px-4
          py-4
          cursor-pointer
          transition-colors
          ${
            isDragging
              ? "border-[#0CB16D] bg-[#EDFFFA]"
              : "border-gray-300 hover:border-gray-400"
          }
        `}
      >
        <UploadCloudIcon className="h-12 w-12" />
        <div className="text-center text-sm text-gray-700">
          Drag & drop files or{" "}
          <span className="text-[#0CB16D] underline font-medium">
            Browse
          </span>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="video/*,audio/*,image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  );
};

export default DragDropArea;

