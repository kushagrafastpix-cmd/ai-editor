// EditorToolPanel/tools/Text/components/TextEditor.tsx

import TextInput from "./TextInput";
import FontSettings from "./FontSettings";
import DecorationControls from "./DecorationControls";
import ColorRow from "./ColorRow";

const TextEditor = () => {
  return (
    <div className="flex flex-col gap-4 px-4 py-4 text-sm">
      {/* Input text */}
      <TextInput />

      {/* Font settings */}
      <FontSettings />

      {/* Decoration */}
      <DecorationControls />

      {/* Font fill */}
      <ColorRow label="Font fill" color="#FF4646" />

      {/* Text background */}
      <ColorRow label="Text background color" color="#000000" />
    </div>
  );
};

export default TextEditor;
