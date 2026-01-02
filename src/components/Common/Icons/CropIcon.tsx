interface CropIconProps {
  className?: string;
}

const CropIcon = ({ className }: CropIconProps) => {
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
        d="M0.667969 3.47198H3.64879M3.64879 3.47198V0.666504M3.64879 3.47198V9.43363C3.64879 9.82098 3.9628 10.135 4.35016 10.135H10.8378M3.64879 3.47198L10.1365 3.43108C10.5238 3.43108 10.8378 3.7451 10.8378 4.13245V10.135M10.8378 10.135H13.468M10.8378 10.135V13.6418"
        stroke="#B9B9C3"
        strokeWidth={1.33333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CropIcon;
