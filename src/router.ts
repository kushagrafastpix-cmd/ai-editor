import { createBrowserRouter } from "react-router";
import AppLayoutRoute, { loader as appLoader, action as appAction } from "./routes/_app";
import EditorRoute, { loader as editorLoader, action as editorAction, ErrorBoundary } from "./routes/editor";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AppLayoutRoute,
    loader: appLoader,
    action: appAction,
    children: [
      {
        index: true,
        Component: EditorRoute,
        loader: editorLoader,
        action: editorAction,
        ErrorBoundary,
      },
    ],
  },
]);

