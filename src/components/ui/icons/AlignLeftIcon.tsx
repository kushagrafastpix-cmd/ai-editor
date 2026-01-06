// Editor/Common/Icons/AlignLeftIcon.tsx

interface AlignLeftIconProps {
  className?: string;
}

const AlignLeftIcon = ({ className }: AlignLeftIconProps) => {
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
        d="M12 7.5H2.25M15 4.5H2.25M15 10.5H2.25M12 13.5H2.25"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default AlignLeftIcon;
