import { useEffect, useState } from "react";
import type { UploadedFile } from "../types";
import MusicIcon from "@/components/ui/icons/MusicIcon";

interface FileItemProps {
  file: UploadedFile;
  onClick?: (file: UploadedFile) => void;
}

const FileItem = ({ file, onClick }: FileItemProps) => {
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  useEffect(() => {
    // Generate thumbnail for images
    if (file.type === "image" && file.file) {
      const url = URL.createObjectURL(file.file);
      setThumbnail(url);
      return () => URL.revokeObjectURL(url);
    }

    // Generate thumbnail for videos
    if (file.type === "video" && file.file) {
      const video = document.createElement("video");
      const url = URL.createObjectURL(file.file);
      video.src = url;
      video.onloadedmetadata = () => {
        video.currentTime = 0.1; // Seek to a frame
      };
      video.onseeked = () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          setThumbnail(canvas.toDataURL());
        }
        URL.revokeObjectURL(url);
      };
      video.load();
    }
  }, [file]);

  const getThumbnailContent = () => {
    if (file.type === "image" && thumbnail) {
      return (
        <img
          src={thumbnail}
          alt={file.name}
          className="w-full h-full object-cover"
        />
      );
    }

    if (file.type === "video") {
      if (thumbnail) {
        return (
          <img
            src={thumbnail}
            alt={file.name}
            className="w-full h-full object-cover"
          />
        );
      }
      // Video placeholder
      return (
        <div className="w-full h-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
          <div className="text-white text-xs text-center px-2">
            <div className="font-semibold mb-1">How-to Guides</div>
            <div className="text-purple-200">Create GIFs from videos</div>
          </div>
        </div>
      );
    }

    if (file.type === "audio") {
      // Audio placeholder - white background with border
      return (
        <div className="w-full h-full bg-white border border-gray-200 flex items-center justify-center rounded-md">
          <MusicIcon className="h-8 w-8 text-gray-400" />
        </div>
      );
    }

    // Image placeholder - white background with border and icon
    return (
      <div className="w-full h-full bg-white border border-gray-200 flex items-center justify-center rounded-md">
        <div className="text-gray-400 text-2xl">📷</div>
      </div>
    );

    return null;
  };

  const truncateFileName = (name: string, maxLength: number = 20) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 3) + "...";
  };

  return (
    <div
      className="flex flex-col gap-2 cursor-pointer"
      onClick={() => onClick?.(file)}
    >
      {/* Thumbnail */}
      <div className="w-full aspect-square rounded-md overflow-hidden bg-gray-100">
        {getThumbnailContent()}
      </div>

      {/* File name */}
      <div className="text-xs text-gray-700 truncate" title={file.name}>
        {truncateFileName(file.name)}
      </div>
    </div>
  );
};

export default FileItem;

