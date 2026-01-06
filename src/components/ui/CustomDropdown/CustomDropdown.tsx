import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import ChevronDownIcon from "../icons/ChevronDownIcon";

interface CustomDropdownProps {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

const CustomDropdown = ({
  value,
  options,
  onChange,
  className = "",
  placeholder,
  disabled = false,
  style,
}: CustomDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [dropdownWidth, setDropdownWidth] = useState<number | undefined>(
    undefined
  );
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [maxHeight, setMaxHeight] = useState<number>(180);

  // Find selected option label
  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption?.label || placeholder || "";

  // Extract text size class from className prop for dropdown options
  const textSizeClass = className.match(/text-\[?\d+px?\]?|text-(xs|sm|base|lg|xl)/)?.[0] || "text-sm";
  
  // Determine if compact mode (small text) - reduce item height accordingly
  const isCompact = textSizeClass.includes("10px") || textSizeClass.includes("11px") || textSizeClass === "text-xs";
  const itemHeightClass = isCompact ? "min-h-[24px]" : "min-h-[36px]";
  const itemPaddingClass = isCompact ? "py-1" : "py-2";

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        triggerRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setFocusedIndex((prev) =>
            prev < options.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Enter":
          event.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < options.length) {
            handleOptionClick(options[focusedIndex].value);
          }
          break;
        case "Escape":
          event.preventDefault();
          setIsOpen(false);
          setFocusedIndex(-1);
          triggerRef.current?.focus();
          break;
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, focusedIndex, options]);

  // Update dropdown position on scroll/resize
  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    const updatePosition = () => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        
        // Recalculate available space
        const spaceBelow = window.innerHeight - rect.bottom - 4;
        const calculatedMaxHeight = Math.min(Math.max(spaceBelow, 100), 180);
        setMaxHeight(calculatedMaxHeight);
        
        setDropdownPosition({
          top: rect.bottom + 4,
          left: rect.left,
        });
      }
    };

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      if (!isOpen && triggerRef.current) {
        // Set dropdown width to match trigger button width
        const rect = triggerRef.current.getBoundingClientRect();
        setDropdownWidth(rect.width);
        
        // Calculate available space below the trigger
        const spaceBelow = window.innerHeight - rect.bottom - 4; // 4px margin
        
        // Use available space, but cap at 180px max, and ensure at least 100px
        const calculatedMaxHeight = Math.min(Math.max(spaceBelow, 100), 180);
        setMaxHeight(calculatedMaxHeight);
        
        setDropdownPosition({
          top: rect.bottom + 4, // 4px = mt-1
          left: rect.left,
        });
      }
      setIsOpen(!isOpen);
      setFocusedIndex(-1);
    }
  };

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          w-full
          appearance-none
          rounded-md
          border border-[#d9d8d6]
          bg-[#FBFBFC]
          text-sm
          text-left
          outline-none
          cursor-pointer
          transition-colors
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          ${className}
        `}
        style={{ 
          height: style?.height || "40px", 
          paddingLeft: style?.paddingLeft || "12px",
          paddingRight: style?.paddingRight || "48px",
          ...style 
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={displayText || "Select an option"}
      >
        <span 
          className="block truncate"
          style={{
            paddingRight: style?.paddingRight ? `${Math.max(24, (style.paddingRight as number) - 8)}px` : "32px"
          }}
        >
          {displayText || placeholder || "Select..."}
        </span>
        <div
          className="pointer-events-none absolute top-1/2 -translate-y-1/2"
          style={{
            right: "8px"
          }}
        >
          <ChevronDownIcon
            className={`
              h-4 w-4
              text-gray-500
              transition-transform
              ${isOpen ? "rotate-180" : ""}
            `}
          />
        </div>
      </button>

      {/* Dropdown list - using portal to render above everything */}
      {isOpen && dropdownPosition && createPortal(
        <div
          ref={dropdownRef}
          className="
            fixed
            z-[99999]
            bg-white
            border border-[#d9d8d6]
            rounded-md
            shadow-lg
            overflow-hidden
            overflow-y-auto
            scrollbar-hide
          "
          style={{ 
            width: dropdownWidth,
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            maxHeight: `${maxHeight}px`,
          }}
          role="listbox"
        >
          {options.map((option, index) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleOptionClick(option.value)}
              onMouseEnter={() => setFocusedIndex(index)}
              onMouseLeave={() => setFocusedIndex(-1)}
              className={`
                w-full
                ${itemHeightClass}
                px-3
                ${itemPaddingClass}
                text-left
                text-gray-900
                cursor-pointer
                transition-colors
                ${textSizeClass}
                ${
                  focusedIndex === index ? "bg-[#EDFFFA]" : "bg-white hover:bg-[#EDFFFA]"
                }
              `}
              role="option"
              aria-selected={value === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};

export default CustomDropdown;

