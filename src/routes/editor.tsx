import {
  useRouteError,
  isRouteErrorResponse,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from "react-router";
import { EditorUI } from "@/features/editor";
import type { TranscriptData } from "@/types/transcript";
import type { TimelineState } from "@/features/timeline/types";
import { detectPauses } from "@/features/tools/AITools/utils/pauseDetection";
import { removePausesFromTimeline } from "@/features/tools/AITools/utils/timelineUpdater";
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

// Dummy transcript data generator
function generateDummyTranscript(): TranscriptData {
  return {
    words: [
      // --- Segment 1 (no pause before start) ---
      { word: "Hello", startTime: 0.0, endTime: 0.4 },
      { word: "everyone", startTime: 0.4, endTime: 1.0 },

      // --- Pause: 0.3s (BELOW threshold, should NOT be removed) ---
      { word: "Welcome", startTime: 1.3, endTime: 1.9 },
      { word: "back", startTime: 1.9, endTime: 2.3 },

      // --- Pause: 0.5s (EDGE CASE, SHOULD be removed) ---
      { word: "Today", startTime: 2.8, endTime: 3.2 },
      { word: "we", startTime: 3.2, endTime: 3.4 },
      { word: "discuss", startTime: 3.4, endTime: 4.1 },

      // --- Pause: 2.0s (NORMAL, should be removed) ---
      { word: "how", startTime: 6.1, endTime: 6.4 },
      { word: "pause", startTime: 6.4, endTime: 6.9 },
      { word: "removal", startTime: 6.9, endTime: 7.6 },

      // --- Pause: 4.0s (EDGE CASE MAX, SHOULD be removed) ---
      { word: "works", startTime: 11.6, endTime: 12.2 },

      // --- Pause: 4.2s (ABOVE max, should NOT be removed) ---
      { word: "in", startTime: 16.4, endTime: 16.6 },
      { word: "practice", startTime: 16.6, endTime: 40.0 },
      { word: "This", startTime: 40.0, endTime: 40.4 },
      { word: "is", startTime: 40.4, endTime: 40.6 },
      { word: "a", startTime: 40.6, endTime: 40.7 },
      { word: "demo", startTime: 40.7, endTime: 41.3 },

      // --- Pause: 1.5s (should be removed) ---
      { word: "showing", startTime: 42.8, endTime: 43.4 },
      { word: "silence", startTime: 43.4, endTime: 179.0 },
      // --- Pause: 1.0s (should be removed) ---
      { word: "Near", startTime: 180.0, endTime: 180.4 },
      { word: "the", startTime: 180.4, endTime: 180.6 },
      { word: "end", startTime: 180.6, endTime: 181.0 },

      // --- Pause: 0.6s (should be removed) ---
      { word: "thanks", startTime: 181.6, endTime: 182.1 },
      { word: "for", startTime: 182.1, endTime: 182.3 },
      { word: "watching", startTime: 182.3, endTime: 183.2 },
    ],

    totalDuration: 210,
    language: "en",
    videoId: "dummy-video-1",
  };
}

// Dummy timeline state generator
function generateDummyTimelineState(): TimelineState {
  return {
    tracks: [
      {
        id: "track-main-video",
        category: "main-video",
        visible: true,
        locked: false,
        isMainVideo: true,
        clips: [
          {
            id: "clip-1",
            trackId: "track-main-video",
            startTime: 0,
            duration: 11.2,
            sourceStartTime: 0,
            sourceEndTime: 11.2,
            sourceVideoId: "dummy-video-1",
          },
        ],
      },
      {
        id: "track-default-audio",
        category: "audio",
        visible: true,
        locked: false,
        isDefaultAudio: true,
        clips: [
          {
            id: "clip-audio-1",
            trackId: "track-default-audio",
            startTime: 0,
            duration: 11.2,
            sourceStartTime: 0,
            sourceEndTime: 11.2,
            sourceVideoId: "dummy-video-1",
          },
        ],
      },
    ],
    duration: 11.2,
    clips: [
      {
        id: "clip-1",
        trackId: "track-main-video",
        startTime: 0,
        duration: 11.2,
        sourceStartTime: 0,
        sourceEndTime: 11.2,
        sourceVideoId: "dummy-video-1",
      },
      {
        id: "clip-audio-1",
        trackId: "track-default-audio",
        startTime: 0,
        duration: 11.2,
        sourceStartTime: 0,
        sourceEndTime: 11.2,
        sourceVideoId: "dummy-video-1",
      },
    ],
  };
}

// Loader
export async function loader({}: LoaderFunctionArgs): Promise<LoaderData> {
  // Return initial state data
  // Can be extended later for fetching project data, user preferences, etc.
  return {
    title: "What is FastPix? | All-in-One Video API Platform",
    hasUnsavedChanges: false,
    transcript: generateDummyTranscript(),
    timelineState: generateDummyTimelineState(),
  };
}

// Action
export async function action({
  request,
}: ActionFunctionArgs): Promise<ActionData> {
  const formData = await request.formData();
  const actionType = formData.get("actionType") as string;

  if (actionType === "remove-pauses") {
    // FormData contains intent only: threshold
    const threshold = parseFloat(formData.get("threshold") as string);

    if (isNaN(threshold) || threshold < 0.5 || threshold > 4.0) {
      return {
        success: false,
        message: "Invalid threshold value",
      };
    }

    // Operate on route-owned data (from loader/session/etc)
    // TODO: In production, read current timeline state from session/database
    // For now, use dummy data - in production, this would read the current state
    // that was previously returned by this action or loaded by the loader
    const transcript = generateDummyTranscript();
    const currentTimelineState = generateDummyTimelineState();

    // Call pure utility functions
    const pauses = detectPauses(transcript, threshold);
    const updatedClips = removePausesFromTimeline(
      currentTimelineState.clips,
      pauses
    );

    // Compute new timeline state
    const updatedTimelineState: TimelineState = {
      ...currentTimelineState,
      clips: updatedClips,
      duration:
        updatedClips.length > 0
          ? Math.max(...updatedClips.map((c) => c.startTime + c.duration))
          : 0,
    };

    return {
      success: true,
      message: `Successfully removed ${pauses.length} pauses`,
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
