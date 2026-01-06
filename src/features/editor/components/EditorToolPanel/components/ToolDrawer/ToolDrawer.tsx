import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import ChevronLeftIcon from "@/components/ui/icons/ChevronLeftIcon";

interface ToolDrawerProps {
  children: ReactNode;
  onClose: () => void;
}

const DRAWER_WIDTH = 360; // Fixed width in pixels

const ToolDrawer = ({ children, onClose }: ToolDrawerProps) => {
  const [isOpen, setIsOpen] = useState(false);

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
      {/* Drawer - overlays transcript from left */}
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
        {/* Close button - positioned on the right edge, outside the drawer */}
        <button
          onClick={handleClose}
          className="
            absolute
            top-1/2
            -translate-y-1/2
            z-10
            flex
            items-center
            justify-center
            rounded
            bg-white
            border
            border-gray-300
            shadow-sm
            text-gray-600
            hover:bg-gray-50
            hover:text-gray-900
            transition-colors
            focus:outline-none
          "
          style={{
            right: '-10px', // Position on the edge, half outside (10px = half of 20px)
            width: '20px',
            height: '40px',
            padding: '10px 0', // 10px top and bottom padding
          }}
          aria-label="Close drawer"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>

        {/* Content area (scrollable) - starts from top */}
        <div className="flex-1 min-h-0 min-w-0 overflow-y-auto scrollbar-hide">
          {children}
        </div>
      </div>
    </>
  );
};

export default ToolDrawer;

