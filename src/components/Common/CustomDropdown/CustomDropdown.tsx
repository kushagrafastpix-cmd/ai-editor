import { useState, useRef, useEffect } from "react";
import ChevronDownIcon from "../Icons/ChevronDownIcon";

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

  // Find selected option label
  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption?.label || placeholder || "";

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

  const handleToggle = () => {
    if (!disabled) {
      if (!isOpen && triggerRef.current) {
        // Set dropdown width to match trigger button width
        setDropdownWidth(triggerRef.current.offsetWidth);
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
          pl-3
          pr-12
          text-sm
          text-left
          outline-none
          cursor-pointer
          transition-colors
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          ${className}
        `}
        style={{ height: style?.height || "40px", ...style }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={displayText || "Select an option"}
      >
        <span className="block truncate">
          {displayText || placeholder || "Select..."}
        </span>
        <ChevronDownIcon
          className={`
            pointer-events-none
            absolute
            right-3
            top-1/2
            h-4 w-4
            -translate-y-1/2
            text-gray-500
            transition-transform
            ${isOpen ? "rotate-180" : ""}
          `}
        />
      </button>

      {/* Dropdown list */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="
            absolute
            top-full
            left-0
            mt-1
            z-50
            bg-white
            border border-[#d9d8d6]
            rounded-md
            shadow-lg
            overflow-hidden
            max-h-[180px]
            overflow-y-auto
            scrollbar-hide
          "
          style={{ width: dropdownWidth }}
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
                min-h-[36px]
                px-3
                py-2
                text-sm
                text-left
                text-gray-900
                cursor-pointer
                transition-colors
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
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;

