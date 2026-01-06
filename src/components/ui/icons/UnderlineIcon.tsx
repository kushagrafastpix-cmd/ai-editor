// Editor/Common/Icons/UnderlineIcon.tsx

interface UnderlineIconProps {
  className?: string;
}

const UnderlineIcon = ({ className }: UnderlineIconProps) => {
  return (
    <svg
      width="14"
      height="15"
      viewBox="0 0 14 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M11.25 0.75V6C11.25 8.48528 9.23528 10.5 6.75 10.5C4.26472 10.5 2.25 8.48528 2.25 6V0.75M0.75 13.5H12.75"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default UnderlineIcon;
