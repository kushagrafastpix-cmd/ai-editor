interface CutIconProps {
  className?: string;
}

const CutIcon = ({ className }: CutIconProps) => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M4.4013 12.3398L10.0013 1.33984M3.33464 1.33984L8.93464 12.3398M6.66797 3.67318V3.66651M6.66797 0.673177V0.66651M0.667969 11.3398C0.667969 10.2353 1.5634 9.33984 2.66797 9.33984C3.77254 9.33984 4.66797 10.2353 4.66797 11.3398C4.66797 12.4444 3.77254 13.3398 2.66797 13.3398C1.5634 13.3398 0.667969 12.4444 0.667969 11.3398ZM8.66797 11.3398C8.66797 10.2353 9.5634 9.33984 10.668 9.33984C11.7725 9.33984 12.668 10.2353 12.668 11.3398C12.668 12.4444 11.7725 13.3398 10.668 13.3398C9.5634 13.3398 8.66797 12.4444 8.66797 11.3398Z"
        stroke="#303132"
        strokeWidth={1.33333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CutIcon;
