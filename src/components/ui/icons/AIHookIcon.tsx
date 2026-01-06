// Editor/Common/Icons/AIHookIcon.tsx

interface AIHookIconProps {
  className?: string;
}

const AIHookIcon = ({ className }: AIHookIconProps) => {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M0.832031 6.66683L0.832031 10.0002M4.58203 7.50016V9.16683M8.33203 3.3335V13.3335M12.082 0.833496V15.8335M15.832 6.66683V10.0002"
        stroke="#303132"
        strokeWidth={1.66667}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default AIHookIcon;
