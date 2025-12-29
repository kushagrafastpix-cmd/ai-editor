// EditorToolPanel/tools/Text/components/TextInput.tsx

const TextInput = () => {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium text-gray-800">
        Input text
      </label>

      <textarea
        maxLength={150}
        placeholder="Hello world!"
        className="
          h-24
          resize-none
          rounded-md
          border
          border-[#d9d8d6]
          px-3
          py-2
          text-sm
          outline-none
          scrollbar-hide
        "
      />
    </div>
  );
};

export default TextInput;
