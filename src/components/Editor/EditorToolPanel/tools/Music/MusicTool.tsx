// EditorToolPanel/tools/Music/MusicTool.tsx

import { useState } from "react";

import { MUSIC_LIST } from "./constants";
import type { MusicItem } from "./types";

import MusicSearchBar from "./components/MusicSearchBar";
import MusicFilter from "./components/MusicFilter";
import MusicList from "./components/MusicList";
import UploadButton from "./components/UploadButton";

const MusicTool = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "liked">("all");
  const [music, setMusic] = useState<MusicItem[]>(MUSIC_LIST);

  // toggle like
  const handleToggleLike = (id: string) => {
    setMusic((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, liked: !item.liked }
          : item
      )
    );
  };

  // TEMP: upload handler (UI only for now)
  const handleUpload = (file: File) => {
    const newItem: MusicItem = {
      id: crypto.randomUUID(),
      title: file.name.replace(/\.[^/.]+$/, ""),
      author: "You", // ✅ or "Local file" / "Unknown"
      duration: "0:30",
      liked: false,
    };

    setMusic((prev) => [newItem, ...prev]);
  };

  // filter + search
  const filteredMusic = music.filter((item) => {
    if (filter === "liked" && !item.liked) return false;
    return item.title
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  return (
    <div className="flex h-full flex-col gap-4 px-4 py-4">
      {/* Upload button - on top */}
      <UploadButton onUpload={handleUpload} />

      {/* Search bar */}
      <MusicSearchBar
        value={search}
        onChange={setSearch}
      />

      {/* Header + Filter */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900">
          All music
        </span>
        <MusicFilter
          value={filter}
          onChange={setFilter}
        />
      </div>

      {/* Music list (scrollable, scrollbar hidden) */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
        <MusicList
          music={filteredMusic}
          onLike={handleToggleLike}
        />
      </div>
    </div>
  );
};

export default MusicTool;
