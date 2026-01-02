interface RedoIconProps {
    className?: string;
  }
  
  const RedoIcon = ({ className }: RedoIconProps) => {
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
          d="M11.3346 3.33317H4.66797C2.45883 3.33317 0.667969 5.12403 0.667969 7.33317C0.667969 9.54231 2.45883 11.3332 4.66797 11.3332H11.3346M11.3346 3.33317L8.66797 0.666504M11.3346 3.33317L8.66797 5.99984"
          stroke="#B9B9C3"
          strokeWidth={1.33333}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };
  
  export default RedoIcon;
  