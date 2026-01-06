// EditorToolPanel/tools/Music/components/MusicFilter.tsx

import CustomDropdown from "@/components/ui/CustomDropdown/CustomDropdown";

export type MusicFilterValue =
  | "all"
  | "liked"
  | "instrumental"
  | "trap"
  | "future-house"
  | "drum-bass"
  | "melodic-dubstep"
  | "future-bass"
  | "bass-house"
  | "bass-music"
  | "melodic-house"
  | "dubstep"
  | "progressive-house"
  | "phonk"
  | "electronic-pop"
  | "hardstyle"
  | "chill-bass"
  | "future-bounce"
  | "rock-roll"
  | "new-age"
  | "ambient"
  | "dance-pop";

interface Props {
  value: MusicFilterValue;
  onChange: (v: MusicFilterValue) => void;
}

const MusicFilter = ({ value, onChange }: Props) => {
  return (
    <div className="w-[120px]">
      <CustomDropdown
        value={value}
        options={[
          { value: "all", label: "All" },
          { value: "liked", label: "Liked" },
          { value: "instrumental", label: "Instrumental" },
          { value: "trap", label: "Trap" },
          { value: "future-house", label: "Future House" },
          { value: "drum-bass", label: "Drum & Bass" },
          { value: "melodic-dubstep", label: "Melodic Dubstep" },
          { value: "future-bass", label: "Future Bass" },
          { value: "bass-house", label: "Bass House" },
          { value: "bass-music", label: "Bass Music" },
          { value: "melodic-house", label: "Melodic House" },
          { value: "dubstep", label: "Dubstep" },
          { value: "progressive-house", label: "Progressive House" },
          { value: "phonk", label: "Phonk" },
          { value: "electronic-pop", label: "Electronic Pop" },
          { value: "hardstyle", label: "Hardstyle" },
          { value: "chill-bass", label: "Chill Bass" },
          { value: "future-bounce", label: "Future Bounce" },
          { value: "rock-roll", label: "Rock & Roll" },
          { value: "new-age", label: "New Age" },
          { value: "ambient", label: "Ambient" },
          { value: "dance-pop", label: "Dance-Pop" },
        ]}
        onChange={(v) => onChange(v as MusicFilterValue)}
      />
    </div>
  );
};

export default MusicFilter;
