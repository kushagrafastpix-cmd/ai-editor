// EditorToolPanel/tools/Text/components/TextEditor.tsx

import type { TextLayer } from "../types";
import ChevronLeftIcon from "@/components/ui/icons/ChevronLeftIcon";
import TextInput from "./TextInput";
import FontSettings from "./FontSettings";
import DecorationControls from "./DecorationControls";
import ColorRow from "./ColorRow";

interface Props {
  layer: TextLayer;
  onUpdate: (id: string, update: Partial<TextLayer>) => void;
  onBack: () => void;
}

const TextEditor = ({ layer, onUpdate, onBack }: Props) => {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200">
        <button
          onClick={onBack}
          className="
            flex
            items-center
            justify-center
            p-1
            text-gray-600
            hover:text-gray-900
            transition-colors
            focus:outline-none
          "
          aria-label="Go back"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <h2 className="text-base font-semibold text-gray-900">
          Text Overlay Settings
        </h2>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
        <div className="flex flex-col min-h-0 gap-6 px-4 py-4">
      {/* Input text section */}
      <TextInput
        value={layer.content}
        onChange={(content) =>
          onUpdate(layer.id, { content })
        }
      />

      {/* Font settings section - contains all font-related controls */}
      <div className="flex flex-col gap-4">
        <span className="font-medium text-gray-800">Font settings</span>

        {/* Font family, weight, size row */}
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
        </div>
      </div>
    </div>
  );
};

export default TextEditor;
