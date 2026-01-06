// Editor/Common/Icons/SpeechEnhancementIcon.tsx

interface SpeechEnhancementIconProps {
  className?: string;
}

const SpeechEnhancementIcon = ({ className }: SpeechEnhancementIconProps) => {
  return (
    <svg
      width="14"
      height="19"
      viewBox="0 0 14 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12.4987 7.50016V9.16683C12.4987 12.3885 9.88703 15.0002 6.66536 15.0002M0.832031 7.50016V9.16683C0.832031 12.3885 3.4437 15.0002 6.66536 15.0002M6.66536 15.0002V17.5002M3.33203 17.5002H9.9987M6.66536 11.6668C5.28465 11.6668 4.16536 10.5475 4.16536 9.16683V3.3335C4.16536 1.95278 5.28465 0.833496 6.66536 0.833496C8.04608 0.833496 9.16536 1.95278 9.16536 3.3335V9.16683C9.16536 10.5475 8.04608 11.6668 6.66536 11.6668Z"
        stroke="#303132"
        strokeWidth={1.66667}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default SpeechEnhancementIcon;
