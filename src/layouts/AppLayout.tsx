import { Outlet } from "react-router";

export function AppLayout() {
  return (
    <div className="flex h-screen flex-col">
      <Outlet />
    </div>
  );
}

