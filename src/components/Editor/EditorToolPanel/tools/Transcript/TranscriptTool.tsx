interface TranscriptToolProps {
  transcriptText?: string;
}

const TranscriptTool = ({ transcriptText }: TranscriptToolProps) => {
  const hasTranscript =
    transcriptText && transcriptText.trim().length > 0;

  return (
    <div className="h-full flex flex-col px-4 py-3">
      {/* Scrollable content */}
      <div
        className="
          flex-1
          overflow-y-auto
          pr-2
          text-sm
          text-gray-800
          leading-relaxed
          scrollbar-hide
        "
      >
        {hasTranscript ? (
          transcriptText!
            .split(/\n+/)
            .map((paragraph, index) => (
              <p key={index} className="mb-3 last:mb-0">
                {paragraph}
              </p>
            ))
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No transcript available
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptTool;
