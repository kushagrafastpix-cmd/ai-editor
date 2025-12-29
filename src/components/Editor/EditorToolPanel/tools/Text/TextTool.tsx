
import { useState } from "react";
import type { TextLayer, TextType } from "./types";
import {
  DEFAULT_TEXT_CONTENT,
  DEFAULT_TEXT_DURATION,
  DEFAULT_TEXT_STYLE,
} from "./constants";

import AddTextSection from "./components/AddTextSection";
import TextEditor from "./components/TextEditor";

const TextTool = () => {
  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [activeTextId, setActiveTextId] = useState<string | null>(null);

  const handleAddText = (type: TextType) => {
    const newLayer: TextLayer = {
      id: crypto.randomUUID(),
      type,
      content: DEFAULT_TEXT_CONTENT[type],
      startTime: 0,
      duration: DEFAULT_TEXT_DURATION,
      style: DEFAULT_TEXT_STYLE[type],
    };

    setTextLayers((prev) => [...prev, newLayer]);
    setActiveTextId(newLayer.id);
  };

  const handleUpdateLayer = (
    id: string,
    update: Partial<TextLayer>
  ) => {
    setTextLayers((layers) =>
      layers.map((l) =>
        l.id === id ? { ...l, ...update } : l
      )
    );
  };

  const activeLayer = textLayers.find(
    (l) => l.id === activeTextId
  );

  return (
    <div className="h-full flex flex-col">
      {activeLayer ? (
        <TextEditor
          layer={activeLayer}
          onUpdate={handleUpdateLayer}
        />
      ) : (
        <AddTextSection onAdd={handleAddText} />
      )}
    </div>
  );
};

export default TextTool;
