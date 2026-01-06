// Editor/Common/Icons/NoCaptionIcon.tsx

interface NoCaptionIconProps {
  className?: string;
}

const NoCaptionIcon = ({ className }: NoCaptionIconProps) => {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M2.6213 2.61984L12.048 12.0465M14.0013 7.33317C14.0013 11.0151 11.0165 13.9998 7.33464 13.9998C3.65274 13.9998 0.667969 11.0151 0.667969 7.33317C0.667969 3.65127 3.65274 0.666504 7.33464 0.666504C11.0165 0.666504 14.0013 3.65127 14.0013 7.33317Z"
        stroke="#B9B9C3"
        strokeWidth={1.33333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default NoCaptionIcon;
