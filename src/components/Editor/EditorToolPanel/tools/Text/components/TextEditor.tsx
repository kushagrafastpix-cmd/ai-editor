// EditorToolPanel/tools/Text/components/TextEditor.tsx

import type { TextLayer } from "../types";
import TextInput from "./TextInput";
import FontSettings from "./FontSettings";
import DecorationControls from "./DecorationControls";
import ColorRow from "./ColorRow";

interface Props {
  layer: TextLayer;
  onUpdate: (id: string, update: Partial<TextLayer>) => void;
}

const TextEditor = ({ layer, onUpdate }: Props) => {
  return (
    <div className="flex flex-col min-h-0 gap-6 px-4 py-4">
      <TextInput
        value={layer.content}
        onChange={(content) =>
          onUpdate(layer.id, { content })
        }
      />

      <FontSettings
        style={layer.style}
        onChange={(style) =>
          onUpdate(layer.id, {
            style: { ...layer.style, ...style },
          })
        }
      />

      <DecorationControls
        style={layer.style}
        onChange={(style) =>
          onUpdate(layer.id, {
            style: { ...layer.style, ...style },
          })
        }
      />

      <ColorRow
        label="Font fill"
        color={layer.style.fillColor}
      />

      <ColorRow
        label="Text background color"
        color={layer.style.backgroundColor}
      />
    </div>
  );
};

export default TextEditor;
