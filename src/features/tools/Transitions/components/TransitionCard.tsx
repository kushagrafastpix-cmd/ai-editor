import type { TransitionConfig } from "../types";

interface Props {
  transition: TransitionConfig;
  onClick: () => void;
}

const TransitionCard = ({ transition, onClick }: Props) => {
  return (
    <button
      onClick={onClick}
      className="
        flex
        flex-col
        text-left
        focus:outline-none
      "
    >
      {/* Thumbnail */}
      <div
        className="
          relative
          overflow-hidden
          rounded-xl
          border
          border-gray-200
          bg-gray-100
          transition-colors
          duration-150
          hover:border-gray-300
          hover:shadow-sm
        "
      >
        {/* placeholder preview */}
        <div className="aspect-video w-full bg-gradient-to-br from-gray-200 to-gray-300" />
      </div>

      {/* Label */}
      <span className="mt-2 text-sm text-gray-700">
        {transition.label}
      </span>
    </button>
  );
};

export default TransitionCard;
