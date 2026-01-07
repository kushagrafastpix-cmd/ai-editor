import {
  useRouteError,
  isRouteErrorResponse,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from "react-router";
import { EditorUI } from "@/features/editor";
import "@/App.css";

// Types
export type LoaderData = {
  title: string;
  hasUnsavedChanges: boolean;
};

export type ActionData = {
  success: boolean;
  message?: string;
  hasUnsavedChanges?: boolean;
} | null;

// Loader
export async function loader({}: LoaderFunctionArgs): Promise<LoaderData> {
  // Return initial state data
  // Can be extended later for fetching project data, user preferences, etc.
  return {
    title: "What is FastPix? | All-in-One Video API Platform",
    hasUnsavedChanges: false,
  };
}

// Action
export async function action({ request }: ActionFunctionArgs): Promise<ActionData> {
  const formData = await request.formData();
  const actionType = formData.get("actionType") as string;

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
