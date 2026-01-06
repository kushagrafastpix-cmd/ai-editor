// Editor/Common/Icons/SpeakerColorIcon.tsx

interface SpeakerColorIconProps {
  className?: string;
}

const SpeakerColorIcon = ({ className }: SpeakerColorIconProps) => {
  return (
    <svg
      width="19"
      height="16"
      viewBox="0 0 19 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12.4987 1.2233C13.7335 1.83692 14.582 3.11111 14.582 4.5835C14.582 6.05588 13.7335 7.33007 12.4987 7.9437M14.1654 12.3055C15.4249 12.8754 16.5591 13.8043 17.4987 15.0002M0.832031 15.0002C2.45411 12.9356 4.65635 11.6668 7.08203 11.6668C9.50772 11.6668 11.71 12.9356 13.332 15.0002M10.832 4.5835C10.832 6.65456 9.1531 8.3335 7.08203 8.3335C5.01096 8.3335 3.33203 6.65456 3.33203 4.5835C3.33203 2.51243 5.01096 0.833496 7.08203 0.833496C9.1531 0.833496 10.832 2.51243 10.832 4.5835Z"
        stroke="#303132"
        strokeWidth={1.66667}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default SpeakerColorIcon;
