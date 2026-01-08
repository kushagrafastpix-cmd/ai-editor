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
      { word: "Hello", startTime: 0.0, endTime: 0.5 },
      { word: "world", startTime: 0.5, endTime: 1.0 },
      // 2.5 second pause here
      { word: "This", startTime: 3.5, endTime: 3.8 },
      { word: "is", startTime: 3.8, endTime: 4.0 },
      // 1.2 second pause
      { word: "a", startTime: 5.2, endTime: 5.3 },
      { word: "test", startTime: 5.3, endTime: 5.7 },
      // 3.0 second pause
      { word: "of", startTime: 8.7, endTime: 8.9 },
      { word: "the", startTime: 8.9, endTime: 9.1 },
      { word: "pause", startTime: 9.1, endTime: 9.5 },
      { word: "removal", startTime: 9.5, endTime: 10.0 },
      // 0.5 second pause (below typical threshold)
      { word: "functionality", startTime: 10.5, endTime: 11.2 },
    ],
    totalDuration: 11.2,
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
export async function action({ request }: ActionFunctionArgs): Promise<ActionData> {
  const formData = await request.formData();
  const actionType = formData.get("actionType") as string;

  if (actionType === "remove-pauses") {
    // FormData contains intent only: threshold
    const threshold = parseFloat(formData.get("threshold") as string);
    
    if (isNaN(threshold) || threshold < 0.1 || threshold > 4.0) {
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
      duration: updatedClips.length > 0
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
        {error instanceof Error ? error.message : "An unexpected error occurred"}
      </p>
    </div>
  );
}

// Component
export default function EditorRoute() {
  return <EditorUI />;
}
