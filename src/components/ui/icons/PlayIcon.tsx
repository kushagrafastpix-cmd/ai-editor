// Editor/Common/Icons/PlayIcon.tsx

interface PlayIconProps {
  className?: string;
}

const PlayIcon = ({ className }: PlayIconProps) => {
  return (
    <svg
      width="10"
      height="12"
      viewBox="0 0 10 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M0 0.945016V10.7217C0 11.4672 0.821011 11.9201 1.45328 11.5144L9.13493 6.62603C9.72001 6.25799 9.72001 5.40867 9.13493 5.0312L1.45328 0.152316C0.821011 -0.253471 0 0.199501 0 0.945016Z"
        fill="#303132"
      />
    </svg>
  );
};

export default PlayIcon;
