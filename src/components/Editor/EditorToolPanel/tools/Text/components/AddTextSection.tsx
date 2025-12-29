
import type { TextType } from "../types";

interface AddTextSectionProps {
  onAdd: (type: TextType) => void;
}

const AddTextSection = ({ onAdd }: AddTextSectionProps) => {
  return (
    <div className="px-4 py-3">
      {/* Title */}
      <h3 className="mb-3 text-sm font-medium text-gray-900">
        Add text
      </h3>

      <div className="flex flex-col gap-3">
        {/* Heading */}
        <button
          onClick={() => onAdd("heading")}
          className="
            rounded-lg
            border
            px-4
            py-3
            text-center
            text-base
            font-semibold
            text-gray-800
            bg-[#FBFBFC]
            border-[#d9d8d6]
            focus:outline-none
          "
        >
          Heading
        </button>

        {/* Body text */}
        <button
          onClick={() => onAdd("body")}
          className="
            rounded-lg
            border
            px-4
            py-3
            text-center
            text-base
            font-normal
            text-gray-800
            bg-[#FBFBFC]
            border-[#d9d8d6]
            focus:outline-none
          "
        >
          Body text
        </button>
      </div>
    </div>
  );
};

export default AddTextSection;
