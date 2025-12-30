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
      {/* Text input */}
      <TextInput
        value={layer.content}
        onChange={(content) =>
          onUpdate(layer.id, { content })
        }
      />

      {/* Font settings */}
      <FontSettings
        style={layer.style}
        onChange={(style) =>
          onUpdate(layer.id, {
            style: { ...layer.style, ...style },
          })
        }
      />

      {/* Decoration */}
      <DecorationControls
        style={layer.style}
        onChange={(style) =>
          onUpdate(layer.id, {
            style: { ...layer.style, ...style },
          })
        }
      />

      {/* Font fill */}
      <ColorRow
        label="Font fill"
        color={layer.style.fillColor}
        opacity={layer.style.fillOpacity}
        onOpacityChange={(opacity) =>
          onUpdate(layer.id, {
            style: {
              ...layer.style,
              fillOpacity: opacity,
            },
          })
        }
      />

      {/* Background color */}
      <ColorRow
        label="Text background color"
        color={layer.style.backgroundColor}
        opacity={layer.style.backgroundOpacity}
        onOpacityChange={(opacity) =>
          onUpdate(layer.id, {
            style: {
              ...layer.style,
              backgroundOpacity: opacity,
            },
          })
        }
      />
    </div>
  );
};

export default TextEditor;
