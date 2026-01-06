// Editor/Common/Icons/PauseIcon.tsx

interface PauseIconProps {
  className?: string;
}

const PauseIcon = ({ className }: PauseIconProps) => {
  return (
    <svg
      width="10px"
      height="12px"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M7 1H2V15H7V1Z" fill="#000000" />
      <path d="M14 1H9V15H14V1Z" fill="#000000" />
    </svg>
  );
};

export default PauseIcon;
