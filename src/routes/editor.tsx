import {
  useRouteError,
  isRouteErrorResponse,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from "react-router";
import { EditorUI } from "@/features/editor";
import type { TranscriptData } from "@/types/transcript";
import type { TimelineState } from "@/features/timeline/types";
import type { TextLayer } from "@/features/tools/Text/types";
import { detectPauses } from "@/features/tools/AITools/utils/pauseDetection";
import { removePausesFromTimeline } from "@/features/tools/AITools/utils/timelineUpdater";
import { generateDummyTranscript, generateDummyTimelineState } from "@/mocks/editorData";
import "@/App.css";

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
export async function loader({}: LoaderFunctionArgs): Promise<LoaderData> {
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
      pauses
    );
    console.log(`[RemovePauses] Updated clips:`, updatedClips);

    // Update tracks to reference new clips
    const updatedTracks = currentTimelineState.tracks.map(track => ({
      ...track,
      clips: updatedClips.filter(clip => clip.trackId === track.id)
    }));

    // Compute new timeline state - preserve text layers!
    const updatedTimelineState: TimelineState = {
      tracks: updatedTracks,
      clips: updatedClips,
      duration:
        updatedClips.length > 0
          ? Math.max(...updatedClips.map((c) => c.startTime + c.duration))
          : 0,
      textLayers: currentTimelineState.textLayers, // Preserve text layers
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
