interface PresetsIconProps {
  className?: string;
  size?: number;
}

const PresetsIcon = ({ className, size = 17 }: PresetsIconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 17 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M15.832 15H9.9987M6.66536 15H0.832031M15.832 9.16667L8.33203 9.16667M4.9987 9.16667H0.832031M15.832 3.33333L11.6654 3.33333M8.33203 3.33333H0.832031M9.9987 17.5V12.5M4.9987 11.6667L4.9987 6.66667M11.6654 5.83333L11.6654 0.833333"
        stroke="currentColor"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default PresetsIcon;

