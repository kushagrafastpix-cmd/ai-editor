import { useState } from "react";
import type { CaptionSection } from "./types";
import AddCaptionSection from "./components/AddCaptionSection";
import PresetsEditor from "./components/PresetsEditor";
import FontEditor from "./components/FontEditor";
import EffectsEditor from "./components/EffectsEditor";

const CaptionsTool = () => {
  const [activeSection, setActiveSection] = useState<CaptionSection | null>(
    null
  );

  const handleBack = () => {
    setActiveSection(null);
  };

  return (
    <div className="h-full flex flex-col">
      {activeSection === null ? (
        <AddCaptionSection onSelect={setActiveSection} />
      ) : (
        <>
          {activeSection === "presets" && <PresetsEditor onBack={handleBack} />}
          {activeSection === "font" && <FontEditor />}
          {activeSection === "effects" && <EffectsEditor onBack={handleBack} />}
        </>
      )}
    </div>
  );
};

export default CaptionsTool;