import { Outlet, useRouteLoaderData, useActionData, useNavigation, useBlocker } from "react-router";
import { useEffect, useState } from "react";
import { Header } from "./Header";
import type { LoaderData, ActionData } from "@/routes/editor";

export function AppLayout() {
  // Get loader data from child route (editor)
  const loaderData = useRouteLoaderData("routes/editor") as LoaderData | undefined;
  const actionData = useActionData() as ActionData;
  const navigation = useNavigation();

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(
    loaderData?.hasUnsavedChanges ?? false
  );

  // Update hasUnsavedChanges when action completes successfully
  useEffect(() => {
    if (actionData?.success && actionData.hasUnsavedChanges !== undefined) {
      setHasUnsavedChanges(actionData.hasUnsavedChanges);
    }
  }, [actionData]);

  // Update hasUnsavedChanges when loader data changes
  useEffect(() => {
    if (loaderData?.hasUnsavedChanges !== undefined) {
      setHasUnsavedChanges(loaderData.hasUnsavedChanges);
    }
  }, [loaderData]);

  // Navigation blocking for unsaved changes
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    if (blocker.state === "blocked") {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      if (confirmed) {
        blocker.proceed();
        setHasUnsavedChanges(false);
      } else {
        blocker.reset();
      }
    }
  }, [blocker]);

  // Determine pending states
  const isSaving =
    navigation.state === "submitting" &&
    navigation.formData?.get("actionType") === "save";
  const isExporting =
    navigation.state === "submitting" &&
    navigation.formData?.get("actionType") === "export";

  return (
    <div className="flex h-screen flex-col">
      <Header
        title={loaderData?.title ?? ""}
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        isExporting={isExporting}
      />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
