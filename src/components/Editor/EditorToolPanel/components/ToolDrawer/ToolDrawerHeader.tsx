import ChevronLeftIcon from "../../../../Common/Icons/ChevronLeftIcon";

interface ToolDrawerHeaderProps {
  title: string;
  onClose: () => void;
}

const ToolDrawerHeader = ({ title, onClose }: ToolDrawerHeaderProps) => {
  return (
    <div className="flex items-center justify-between border-b border-[#d9d8d6] px-4 py-3">
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      <button
        onClick={onClose}
        className="
          rounded
          p-1
          text-gray-600
          hover:bg-gray-100
          hover:text-gray-900
          transition-colors
          focus:outline-none
        "
        aria-label="Close drawer"
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

export default ToolDrawerHeader;

