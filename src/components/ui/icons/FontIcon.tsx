interface FontIconProps {
  className?: string;
  size?: number;
}

const FontIcon = ({ className, size = 20 }: FontIconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M2 17.0588H4.82353M11.4118 17.0588H18M4.72941 12.3529H11.2235M7.83529 4.16471L13.2941 17.0588M2.94118 17.0588L8.58823 2H10.4706L17.0588 17.0588"
        stroke="currentColor"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default FontIcon;

