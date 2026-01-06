// Editor/Common/Icons/AddIcon.tsx

interface AddIconProps {
  className?: string;
}

const AddIcon = ({ className }: AddIconProps) => {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M4.66927 0.583984V8.75065M0.585938 4.66732H8.7526"
        stroke="#303132"
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default AddIcon;
