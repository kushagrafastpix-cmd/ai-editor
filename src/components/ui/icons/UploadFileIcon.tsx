// Editor/Common/Icons/UploadFileIcon.tsx

interface UploadFileIconProps {
  className?: string;
}

const UploadFileIcon = ({ className }: UploadFileIconProps) => {
  return (
    <svg
      width="15"
      height="14"
      viewBox="0 0 15 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M1.9974 9.49417C1.19341 8.95599 0.664062 8.03949 0.664062 6.99935C0.664062 5.43697 1.8584 4.15354 3.38389 4.01226C3.69594 2.1141 5.34423 0.666016 7.33073 0.666016C9.31723 0.666016 10.9655 2.1141 11.2776 4.01226C12.8031 4.15354 13.9974 5.43697 13.9974 6.99935C13.9974 8.03949 13.4681 8.95599 12.6641 9.49417M4.66406 9.33268L7.33073 6.66602M7.33073 6.66602L9.9974 9.33268M7.33073 6.66602V12.666"
        stroke="white"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default UploadFileIcon;
