// Editor/Common/Icons/AlignRightIcon.tsx

interface AlignRightIconProps {
  className?: string;
}

const AlignRightIcon = ({ className }: AlignRightIconProps) => {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M15.75 7.5H6M15.75 4.5H3M15.75 10.5H3M15.75 13.5H6"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default AlignRightIcon;
