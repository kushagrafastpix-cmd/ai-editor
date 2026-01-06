interface VideoCallIconProps {
  className?: string;
}

const VideoCallIcon = ({ className }: VideoCallIconProps) => {
  return (
    <svg
      width="12"
      height="8"
      viewBox="0 0 12 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M9.33333 3V0.666667C9.33333 0.3 9.03333 0 8.66667 0H0.666667C0.3 0 0 0.3 0 0.666667V7.33333C0 7.7 0.3 8 0.666667 8H8.66667C9.03333 8 9.33333 7.7 9.33333 7.33333V5L12 7.66667V0.333333L9.33333 3ZM7.33333 4.66667H5.33333V6.66667H4V4.66667H2V3.33333H4V1.33333H5.33333V3.33333H7.33333V4.66667Z"
        fill="#303132"
      />
    </svg>
  );
};

export default VideoCallIcon;
