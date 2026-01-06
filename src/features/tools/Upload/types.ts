export type FileType = "video" | "audio" | "image";
export type FileFilter = "all" | "audio" | "image" | "video";

export interface UploadedFile {
  id: string;
  name: string;
  type: FileType;
  file: File;
  thumbnail?: string; // For images/videos
  size: number;
  uploadedAt: Date;
}

