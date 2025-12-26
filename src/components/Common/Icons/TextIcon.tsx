interface IconProps {
  className?: string;
}

const TextIcon = ({ className }: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.16}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 6.25C4 5.55109 4 5.20163 4.11418 4.92597C4.26642 4.55843 4.55843 4.26642 4.92597 4.11418C5.20163 4 5.55109 4 6.25 4H13.75C14.4489 4 14.7984 4 15.074 4.11418C15.4416 4.26642 15.7336 4.55843 15.8858 4.92597C16 5.20163 16 5.55109 16 6.25M7.75 16H12.25M10 4V16" />
    </svg>
  );
};

export default TextIcon;
