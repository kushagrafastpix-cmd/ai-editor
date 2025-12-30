// EditorToolPanel/tools/Text/components/TextInput.tsx

interface Props {
  value: string;
  onChange: (v: string) => void;
}

const TextInput = ({ value, onChange }: Props) => {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-medium text-gray-800">
        Input text
      </span>

      <textarea
        value={value}
        maxLength={150}
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
