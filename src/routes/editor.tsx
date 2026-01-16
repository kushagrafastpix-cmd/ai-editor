import {
  useRouteError,
  isRouteErrorResponse,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from "react-router";
import { EditorUI } from "@/features/editor";
import type { TranscriptData } from "@/types/transcript";
import type { TimelineState, VideoClip } from "@/features/timeline/types";
import type { TextLayer } from "@/features/tools/Text/types";
import type { TransitionEffect } from "@/features/tools/Transitions/types";
import { detectPauses } from "@/features/tools/AITools/utils/pauseDetection";
import { removePausesFromTimeline } from "@/features/tools/AITools/utils/timelineUpdater";
import { generateDummyTranscript, generateDummyTimelineState } from "@/mocks/editorData";
import "@/App.css";

// Helper function to identify outro clips (clips after main video ends)
export function getOutroClips(clips: readonly VideoClip[], transcript: TranscriptData): readonly VideoClip[] {
  const mainVideoId = transcript.videoId;
  const mainVideoClips = clips.filter(c => c.sourceVideoId === mainVideoId);
  
  if (mainVideoClips.length === 0) return [];
  
  // Find where main video ends
  const lastMainClipEnd = Math.max(
    ...mainVideoClips.map(c => c.startTime + c.duration)
  );
  
  // Outros are non-main-video clips after main video ends
  return clips.filter(
    c => c.sourceVideoId !== mainVideoId && c.startTime >= lastMainClipEnd
  );
}

// Types
export type LoaderData = {
  title: string;
  hasUnsavedChanges: boolean;
  transcript: TranscriptData;
  timelineState: TimelineState;
};

export type ActionData = {
  success: boolean;
  message?: string;
  timelineState?: TimelineState;
  hasUnsavedChanges?: boolean;
} | null;

// Loader
export async function loader({ }: LoaderFunctionArgs): Promise<LoaderData> {
  // Return initial state data
  // Can be extended later for fetching project data, user preferences, etc.
  const transcript = generateDummyTranscript();
  return {
    title: "What is FastPix? | All-in-One Video API Platform",
    hasUnsavedChanges: false,
    transcript,
    timelineState: generateDummyTimelineState(transcript),
  };
}

// Action
export async function action({
  request,
}: ActionFunctionArgs): Promise<ActionData> {
  const formData = await request.formData();
  const actionType = formData.get("actionType") as string;

  if (actionType === "remove-pauses") {
    // FormData contains threshold and current state
    const threshold = parseFloat(formData.get("threshold") as string);
    const currentStateJson = formData.get("currentState") as string;

    if (isNaN(threshold) || threshold < 0.5 || threshold > 4.0) {
      return {
        success: false,
        message: "Invalid threshold value",
      };
    }

    // Get current timeline state from FormData (with text layers)
    // Fallback to dummy data if not provided
    const transcript = generateDummyTranscript();
    const currentTimelineState: TimelineState = currentStateJson
      ? JSON.parse(currentStateJson)
      : generateDummyTimelineState(transcript);

    // Call pure utility functions
    const pauses = detectPauses(transcript, threshold);
    console.log(`[RemovePauses] Detected ${pauses.length} pauses:`, pauses);

    const updatedClips = removePausesFromTimeline(
      currentTimelineState.clips,
      pauses,
      transcript
    );
    console.log(`[RemovePauses] Updated clips:`, updatedClips);

    // Update tracks to reference new clips
    const updatedTracks = currentTimelineState.tracks.map(track => ({
      ...track,
      clips: updatedClips.filter(clip => clip.trackId === track.id)
    }));

    // Compute new timeline state - preserve text layers and transitions!
    const updatedTimelineState: TimelineState = {
      tracks: updatedTracks,
      clips: updatedClips,
      duration:
        updatedClips.length > 0
          ? Math.max(...updatedClips.map((c) => c.startTime + c.duration))
          : 0,
      textLayers: currentTimelineState.textLayers, // Preserve text layers
      transitions: currentTimelineState.transitions, // Preserve transitions
    };

    console.log(`[RemovePauses] New timeline duration: ${updatedTimelineState.duration}s (was ${currentTimelineState.duration}s)`);

    return {
      success: true,
      message: `Successfully removed ${pauses.length} pauses`,
      timelineState: updatedTimelineState,
      hasUnsavedChanges: true,
    };
  }

  if (actionType === "add-text") {
    // Get text layer data from form
    const textLayerJson = formData.get("textLayer") as string;
    const currentStateJson = formData.get("currentState") as string;

    if (!textLayerJson || !currentStateJson) {
      return {
        success: false,
        message: "Missing text layer or current state data",
      };
    }

    const newTextLayer: TextLayer = JSON.parse(textLayerJson);
    const currentTimelineState: TimelineState = JSON.parse(currentStateJson);

    // Get or create text track
    let textTrack = currentTimelineState.tracks.find(t => t.category === 'text');
    let updatedTracks = [...currentTimelineState.tracks];

    if (!textTrack) {
      // Create new text track
      textTrack = {
        id: 'text-track',
        category: 'text' as const,
        visible: true,
        locked: false,
      };
      updatedTracks.push(textTrack);
    }

    // Add text layer to timeline state
    const updatedTextLayers = [
      ...(currentTimelineState.textLayers || []),
      newTextLayer
    ];

    const updatedTimelineState: TimelineState = {
      ...currentTimelineState,
      tracks: updatedTracks,
      textLayers: updatedTextLayers,
      duration: Math.max(
        currentTimelineState.duration,
        newTextLayer.startTime + newTextLayer.duration
      ),
    };

    return {
      success: true,
      message: "Text overlay added",
      timelineState: updatedTimelineState,
      hasUnsavedChanges: true,
    };
  }

  if (actionType === "update-text") {
    // Get update data from form
    const textId = formData.get("textId") as string;
    const updateJson = formData.get("update") as string;
    const currentStateJson = formData.get("currentState") as string;

    if (!textId || !updateJson || !currentStateJson) {
      return {
        success: false,
        message: "Missing text update data",
      };
    }

    const update: Partial<TextLayer> = JSON.parse(updateJson);
    const currentTimelineState: TimelineState = JSON.parse(currentStateJson);

    // Update the specific text layer
    const updatedTextLayers = (currentTimelineState.textLayers || []).map(layer =>
      layer.id === textId ? { ...layer, ...update } : layer
    );

    const updatedTimelineState: TimelineState = {
      ...currentTimelineState,
      textLayers: updatedTextLayers,
    };

    return {
      success: true,
      message: "Text overlay updated",
      timelineState: updatedTimelineState,
      hasUnsavedChanges: true,
    };
  }

  if (actionType === "save") {
    // Simulate save operation
    await new Promise((res) => setTimeout(res, 1000));
    return {
      success: true,
      message: "Changes saved successfully",
      hasUnsavedChanges: false,
    };
  }

  if (actionType === "export") {
    // Simulate export operation
    await new Promise((res) => setTimeout(res, 1500));
    return {
      success: true,
      message: "Export completed successfully",
    };
  }

  if (actionType === "add-video") {
    const duration = parseFloat(formData.get("duration") as string);
    const sourceVideoId = formData.get("sourceVideoId") as string;
    const currentStateJson = formData.get("currentState") as string;
    const videoType = (formData.get("videoType") as string) || "intro"; // Default to intro for backward compatibility

    if (!duration || !sourceVideoId || !currentStateJson) {
      return {
        success: false,
        message: "Missing video data",
      };
    }

    const currentTimelineState: TimelineState = JSON.parse(currentStateJson);
    
    let insertTime: number;
    let updatedClips: typeof currentTimelineState.clips;
    let updatedTextLayers = currentTimelineState.textLayers || [];

    if (videoType === "intro") {
      // Intro: Insert at time 0, shift all clips forward
      insertTime = 0;

      // 1. Shift existing clips
      updatedClips = currentTimelineState.clips.map((clip) => {
        // Only shift clips that are after or at the insertion point
        if (clip.startTime >= insertTime) {
          return {
            ...clip,
            startTime: clip.startTime + duration,
          };
        }
        return clip;
      });

      // Shift text layers forward
      updatedTextLayers = (currentTimelineState.textLayers || []).map(layer => {
        if (layer.startTime >= insertTime) {
          return {
            ...layer,
            startTime: layer.startTime + duration
          };
        }
        return layer;
      });
    } else if (videoType === "outro") {
      // Outro: Insert at end of timeline, no shifting needed
      insertTime = currentTimelineState.duration;
      updatedClips = currentTimelineState.clips; // No shifting for outros
    } else {
      return {
        success: false,
        message: `Invalid videoType: ${videoType}. Must be "intro" or "outro"`,
      };
    }

    // 2. Create new clip
    // We need a unique ID for the new clip. 
    // In a real app, this might come from the backend or a UUID generator.
    // For now, we'll use a timestamp-based ID.
    const newClipId = `clip-${Date.now()}`;
    const mainVideoTrack = currentTimelineState.tracks.find(t => t.category === 'main-video');
    const trackId = mainVideoTrack ? mainVideoTrack.id : 'track-main-video';

    const newClip = {
      id: newClipId,
      trackId: trackId,
      startTime: insertTime,
      duration: duration,
      sourceStartTime: 0,
      sourceEndTime: duration,
      sourceVideoId: sourceVideoId,
    };

    // 3. Add new clip to the list
    const finalClips = [...updatedClips, newClip];

    // 4. Update track references
    const updatedTracks = currentTimelineState.tracks.map(track => ({
      ...track,
      clips: finalClips.filter(c => c.trackId === track.id)
    }));

    // 5. Compute new duration
    const newDuration = Math.max(
      ...finalClips.map((c) => c.startTime + c.duration)
    );

    const updatedTimelineState: TimelineState = {
      ...currentTimelineState,
      tracks: updatedTracks,
      clips: finalClips,
      duration: newDuration,
      textLayers: updatedTextLayers,
    };

    return {
      success: true,
      message: videoType === "intro" ? "Intro added successfully" : "Outro added successfully",
      timelineState: updatedTimelineState,
      hasUnsavedChanges: true,
    };
  }

  if (actionType === "add-transition") {
    const transitionJson = formData.get("transition") as string;
    const currentStateJson = formData.get("currentState") as string;

    if (!transitionJson || !currentStateJson) {
      return {
        success: false,
        message: "Missing transition data",
      };
    }

    const newTransition: TransitionEffect = JSON.parse(transitionJson);
    const currentTimelineState: TimelineState = JSON.parse(currentStateJson);

    // Check for overlaps with existing transitions
    const existingTransitions = currentTimelineState.transitions || [];
    const newTransitionEnd = newTransition.startTime + newTransition.duration;
    
    // Find if there's an overlap
    const overlappingTransition = existingTransitions.find(t => {
      const tEnd = t.startTime + t.duration;
      // Check if intervals overlap
      return (newTransition.startTime < tEnd && newTransitionEnd > t.startTime);
    });

    // If there's an overlap, adjust the start time to be right after the overlapping transition
    let finalTransition = newTransition;
    if (overlappingTransition) {
      const adjustedStartTime = overlappingTransition.startTime + overlappingTransition.duration;
      finalTransition = {
        ...newTransition,
        startTime: adjustedStartTime,
      };
    }

    // Get or create transition track
    let transitionTrack = currentTimelineState.tracks.find(t => t.category === 'transition');
    let updatedTracks = [...currentTimelineState.tracks];

    if (!transitionTrack) {
      // Create new transition track at the beginning
      transitionTrack = {
        id: 'transition-track',
        category: 'transition' as const,
        visible: true,
        locked: false,
      };
      updatedTracks.unshift(transitionTrack); // Add to beginning
    }

    // Add transition to timeline state
    const updatedTransitions = [
      ...(currentTimelineState.transitions || []),
      finalTransition
    ];

    const updatedTimelineState: TimelineState = {
      ...currentTimelineState,
      tracks: updatedTracks,
      transitions: updatedTransitions,
    };

    return {
      success: true,
      message: overlappingTransition 
        ? `Transition added at ${finalTransition.startTime.toFixed(1)}s (adjusted to avoid overlap)` 
        : "Transition added",
      timelineState: updatedTimelineState,
      hasUnsavedChanges: true,
    };
  }

  return {
    success: false,
    message: "Unknown action",
  };
}

// Error Boundary
export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {error.status} {error.statusText}
        </h1>
        <p className="mt-2 text-gray-600">{error.data}</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
      <p className="mt-2 text-gray-600">
        {error instanceof Error
          ? error.message
          : "An unexpected error occurred"}
      </p>
    </div>
  );
}

// Component
export default function EditorRoute() {
  return <EditorUI />;
}
