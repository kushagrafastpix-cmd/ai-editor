// Editor/Common/Icons/StrikethroughIcon.tsx

interface StrikethroughIconProps {
  className?: string;
}

const StrikethroughIcon = ({ className }: StrikethroughIconProps) => {
  return (
    <svg
      width="15"
      height="14"
      viewBox="0 0 15 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M3 9.75C3 11.4069 4.34315 12.75 6 12.75H9C10.6569 12.75 12 11.4069 12 9.75C12 8.09315 10.6569 6.75 9 6.75M12 3.75C12 2.09315 10.6569 0.75 9 0.75H6C4.34315 0.75 3 2.09315 3 3.75M0.75 6.75H14.25"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default StrikethroughIcon;
