import { createBrowserRouter } from "react-router";
import AppLayoutRoute from "./routes/_app";
import EditorRoute, { loader as editorLoader, action as editorAction, ErrorBoundary } from "./routes/editor";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AppLayoutRoute,
    children: [
      {
        index: true,
        id: "routes/editor",
        Component: EditorRoute,
        loader: editorLoader,
        action: editorAction,
        ErrorBoundary,
      },
    ],
  },
]);

