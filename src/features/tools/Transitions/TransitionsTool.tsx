// EditorToolPanel/tools/Transitions/TransitionsTool.tsx

import { useState } from "react";

import AutoTransitionToggle from "./components/AutoTransitionToggle";
import TransitionGrid from "./components/TransitionGrid";
import { TRANSITIONS } from "./transitions.config";
import type { TransitionId, TransitionEffect } from "./types";

interface TransitionsToolProps {
  currentTime: number;
  onApplyTransition: (transition: TransitionEffect) => void;
}

const TransitionsTool = ({ currentTime, onApplyTransition }: TransitionsToolProps) => {
  const [autoTransitionEnabled, setAutoTransitionEnabled] = useState(false);

  const [feedback, setFeedback] = useState<string | null>(null);

  const handleApplyTransition = (id: TransitionId) => {
    // Create transition effect at current playhead position
    const transitionEffect: TransitionEffect = {
      id: crypto.randomUUID(),
      transitionId: id,
      startTime: currentTime,
      duration: 1, // Default 1 second duration
    };

    // Call parent handler
    onApplyTransition(transitionEffect);

    // Basic feedback
    setFeedback(`Applied "${TRANSITIONS.find((t) => t.id === id)?.label}"`);

    // Auto-clear feedback
    setTimeout(() => {
      setFeedback(null);
    }, 1500);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Auto transition toggle */}
      <AutoTransitionToggle
        enabled={autoTransitionEnabled}
        onToggle={setAutoTransitionEnabled}
      />

      {/* Section title */}
      <div className="px-4 py-2">
        <span className="text-xs font-medium text-gray-1000 uppercase">
          Custom transitions
        </span>
      </div>

      {/* Transition grid */}
      <TransitionGrid
        transitions={TRANSITIONS}
        onApplyTransition={handleApplyTransition}
      />

      {/* Basic feedback (toast-like) */}
      {feedback && (
        <div
          className="
      pointer-events-none
      fixed
      left-1/2
      -translate-x-1/2
      rounded-md
      px-4
      py-2
      text-xs
      text-white
      shadow
      z-50
    "
          style={{
            top: "68px", // header height (56px) + spacing
            backgroundColor: "#5D09C7",
          }}
        >
          {feedback}
        </div>
      )}
    </div>
  );
};

export default TransitionsTool;
