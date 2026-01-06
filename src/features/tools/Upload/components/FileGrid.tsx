import type { UploadedFile, FileFilter } from "../types";
import FileItem from "./FileItem";

interface FileGridProps {
  files: UploadedFile[];
  filter: FileFilter;
  onFileClick?: (file: UploadedFile) => void;
}

const FileGrid = ({ files, filter, onFileClick }: FileGridProps) => {
  const filteredFiles = files.filter((file) => {
    if (filter === "all") return true;
    return file.type === filter;
  });

  if (filteredFiles.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-gray-400">
        No files found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {filteredFiles.map((file) => (
        <FileItem key={file.id} file={file} onClick={onFileClick} />
      ))}
    </div>
  );
};

export default FileGrid;

