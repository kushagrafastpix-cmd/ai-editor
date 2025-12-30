import { useState } from "react";
import type { UploadedFile, FileFilter } from "./types";
import DragDropArea from "./components/DragDropArea";
import FileTypeFilter from "./components/FileTypeFilter";
import FileGrid from "./components/FileGrid";

const UploadTool = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [filter, setFilter] = useState<FileFilter>("all");

  const getFileType = (file: File): "video" | "audio" | "image" => {
    if (file.type.startsWith("video/")) return "video";
    if (file.type.startsWith("audio/")) return "audio";
    if (file.type.startsWith("image/")) return "image";
    // Default fallback
    return "image";
  };

  const handleFilesSelected = (selectedFiles: File[]) => {
    const newFiles: UploadedFile[] = selectedFiles.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      type: getFileType(file),
      file,
      size: file.size,
      uploadedAt: new Date(),
    }));

    setFiles((prev) => [...newFiles, ...prev]);
  };

  const handleFileClick = (file: UploadedFile) => {
    // Future: Handle file selection/click
    console.log("File clicked:", file);
  };

  return (
    <div className="flex h-full flex-col gap-4 px-4 py-4">
      {/* Drag & Drop Area */}
      <DragDropArea onFilesSelected={handleFilesSelected} />

      {/* Filter Dropdown - positioned on right */}
      <div className="flex justify-end">
        <FileTypeFilter value={filter} onChange={setFilter} />
      </div>

      {/* File Grid - scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
        <FileGrid files={files} filter={filter} onFileClick={handleFileClick} />
      </div>
    </div>
  );
};

export default UploadTool;
