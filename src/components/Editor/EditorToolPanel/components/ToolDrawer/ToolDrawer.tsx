import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { DrawerToolId } from "../../types";
import { TOOLS } from "../../constants";
import ToolDrawerHeader from "./ToolDrawerHeader";

interface ToolDrawerProps {
  toolId: DrawerToolId;
  children: ReactNode;
  onClose: () => void;
}

const DRAWER_WIDTH = 320; // Fixed width in pixels

const ToolDrawer = ({ toolId, children, onClose }: ToolDrawerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const tool = TOOLS.find((t) => t.id === toolId);
  const toolLabel = tool?.label || "Tool";

  useEffect(() => {
    // Trigger animation after mount
    setIsOpen(true);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // Wait for animation to complete before calling onClose
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`
          absolute
          inset-0
          z-40
          transition-opacity
          duration-300
          ease-in-out
          ${isOpen ? "bg-opacity-20 opacity-100" : "bg-opacity-0 opacity-0"}
        `}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="
          absolute
          top-0
          bottom-0
          left-0
          bg-white
          shadow-xl
          z-50
          flex
          flex-col
          transition-transform
          duration-300
          ease-in-out
        "
        style={{
          width: `${DRAWER_WIDTH}px`,
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        {/* Header */}
        <ToolDrawerHeader title={toolLabel} onClose={handleClose} />

        {/* Content area (scrollable) */}
        <div className="flex-1 min-h-0 min-w-0 overflow-y-auto scrollbar-hide">
          {children}
        </div>
      </div>
    </>
  );
};

export default ToolDrawer;

