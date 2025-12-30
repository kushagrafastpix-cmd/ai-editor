// EditorToolPanel/tools/Music/components/MusicList.tsx

import type { MusicItem } from "../types";
import MusicItemRow from "./MusicItem";

interface Props {
  music: MusicItem[];
  onLike: (id: string) => void;
}

const MusicList = ({ music, onLike }: Props) => {
  return (
    <div className="flex flex-col gap-4">
      {music.map((item) => (
        <MusicItemRow
          key={item.id}
          item={item}
          onLike={onLike}
        />
      ))}
    </div>
  );
};

export default MusicList;
