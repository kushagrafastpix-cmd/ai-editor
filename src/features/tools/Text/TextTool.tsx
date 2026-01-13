// EditorToolPanel/tools/Text/TextTool.tsx

import { useState } from "react";
import type { TextLayer, TextType } from "./types";
import {
  DEFAULT_TEXT_CONTENT,
  DEFAULT_TEXT_DURATION,
  DEFAULT_TEXT_STYLE,
} from "./constants";

import AddTextSection from "./components/AddTextSection";
import TextEditor from "./components/TextEditor";

interface TextToolProps {
  currentTime: number;
  textLayers: readonly TextLayer[];
  onPauseVideo: () => void;
  onAddText: (layer: TextLayer) => void;
  onUpdateText: (id: string, update: Partial<TextLayer>) => void;
}

const TextTool = ({ 
  currentTime, 
  textLayers,
  onPauseVideo, 
  onAddText, 
  onUpdateText 
}: TextToolProps) => {
  const [activeTextId, setActiveTextId] = useState<string | null>(null);

  const handleAddText = (type: TextType) => {
    // Pause the video when adding text
    onPauseVideo();

    const newLayer: TextLayer = {
      id: crypto.randomUUID(),
      type,
      content: DEFAULT_TEXT_CONTENT[type],
      startTime: currentTime, // Use current playhead position
      duration: DEFAULT_TEXT_DURATION,
      style: DEFAULT_TEXT_STYLE[type],
    };

    // Notify parent to add text
    onAddText(newLayer);
    
    // Set as active for editing
    setActiveTextId(newLayer.id);
  };

  const handleUpdateLayer = (
    id: string,
    update: Partial<TextLayer>
  ) => {
    // Notify parent to update text
    onUpdateText(id, update);
  };

  const activeLayer = textLayers.find(
    (layer) => layer.id === activeTextId
  );

  const handleBack = () => {
    setActiveTextId(null);
  };

  return (
    <div className="h-full flex flex-col">
      {activeLayer ? (
        <TextEditor
          layer={activeLayer}
          onUpdate={handleUpdateLayer}
          onBack={handleBack}
        />
      ) : (
        <AddTextSection onAdd={handleAddText} />
      )}
    </div>
  );
};

export default TextTool;
