import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from "react-router";
import { AppLayout } from "@/layouts/AppLayout";

// Types
export type AppLoaderData = {
  title: string;
  hasUnsavedChanges: boolean;
};

export type AppActionData = {
  success: boolean;
  message?: string;
  hasUnsavedChanges?: boolean;
} | null;

// Loader
export async function loader({}: LoaderFunctionArgs): Promise<AppLoaderData> {
  return {
    title: "What is FastPix? | All-in-One Video API Platform",
    hasUnsavedChanges: false,
  };
}

// Action
export async function action({ request }: ActionFunctionArgs): Promise<AppActionData> {
  const formData = await request.formData();
  const actionType = formData.get("actionType") as string;

  if (actionType === "save") {
    await new Promise((res) => setTimeout(res, 1000));
    return {
      success: true,
      message: "Changes saved successfully",
      hasUnsavedChanges: false,
    };
  }

  if (actionType === "export") {
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

// Layout Component
export default function AppLayoutRoute() {
  return <AppLayout />;
}

