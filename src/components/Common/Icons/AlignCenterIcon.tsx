// Editor/Common/Icons/AlignCenterIcon.tsx

interface AlignCenterIconProps {
  className?: string;
}

const AlignCenterIcon = ({ className }: AlignCenterIconProps) => {
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
        d="M13.5 7.5H4.5M15.75 4.5H2.25M15.75 10.5H2.25M13.5 13.5H4.5"
        stroke="#303132"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default AlignCenterIcon;
