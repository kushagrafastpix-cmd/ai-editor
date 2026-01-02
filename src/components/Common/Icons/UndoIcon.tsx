// Editor/Common/Icons/UndoIcon.tsx

interface UndoIconProps {
  className?: string;
}

const UndoIcon = ({ className }: UndoIconProps) => {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M0.667969 3.33317H7.33464C9.54378 3.33317 11.3346 5.12403 11.3346 7.33317C11.3346 9.54231 9.54377 11.3332 7.33464 11.3332H0.667969M0.667969 3.33317L3.33464 0.666504M0.667969 3.33317L3.33464 5.99984"
        stroke="#303132"
        strokeWidth={1.33333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default UndoIcon;
