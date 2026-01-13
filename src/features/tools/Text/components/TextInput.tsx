// EditorToolPanel/tools/Text/components/TextInput.tsx

interface Props {
  value: string;
  onChange: (v: string) => void;
}

const MAX_CHARACTERS = 150;

const TextInput = ({ value, onChange }: Props) => {
  const currentLength = value.length;
  const isNearLimit = currentLength >= MAX_CHARACTERS * 0.9; // 90% of limit (135 chars)
  const isAtLimit = currentLength >= MAX_CHARACTERS;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-800">
          Input text
        </span>
        <span 
          className={`text-xs ${
            isAtLimit 
              ? 'text-red-600 font-medium' 
              : isNearLimit 
              ? 'text-orange-500' 
              : 'text-gray-500'
          }`}
        >
          {currentLength}/{MAX_CHARACTERS}
        </span>
      </div>

      <textarea
        value={value}
        maxLength={MAX_CHARACTERS}
        onChange={(e) => onChange(e.target.value)}
        className="
          h-28 resize-none rounded-md
          border border-[#d9d8d6]
          px-3 py-2 text-sm
          overflow-y-auto scrollbar-hidden
          focus:outline-none  bg-[#FBFBFC]
        "
        placeholder="Hello world!"
      />
    </div>
  );
};

export default TextInput;
