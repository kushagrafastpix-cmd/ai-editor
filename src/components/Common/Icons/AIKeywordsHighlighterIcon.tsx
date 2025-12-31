// Editor/Common/Icons/AIKeywordsHighlightIcon.tsx

interface AIKeywordsHighlightIconProps {
  className?: string;
}

const AIKeywordsHighlightIcon = ({ className }: AIKeywordsHighlightIconProps) => {
  return (
    <svg
      width="19"
      height="17"
      viewBox="0 0 19 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M9.9987 4.16683H3.4987C2.56528 4.16683 2.09857 4.16683 1.74205 4.34849C1.42844 4.50827 1.17348 4.76324 1.01369 5.07685C0.832031 5.43337 0.832031 5.90008 0.832031 6.8335V9.8335C0.832031 10.7669 0.832031 11.2336 1.01369 11.5901C1.17348 11.9038 1.42844 12.1587 1.74205 12.3185C2.09857 12.5002 2.56528 12.5002 3.4987 12.5002H9.9987M13.332 4.16683H14.832C15.7655 4.16683 16.2322 4.16683 16.5887 4.34849C16.9023 4.50827 17.1573 4.76324 17.317 5.07685C17.4987 5.43337 17.4987 5.90008 17.4987 6.8335V9.8335C17.4987 10.7669 17.4987 11.2336 17.317 11.5901C17.1573 11.9038 16.9023 12.1587 16.5887 12.3185C16.2322 12.5002 15.7655 12.5002 14.832 12.5002H13.332M13.332 15.8335L13.332 0.833496M15.4154 0.833503L11.2487 0.833496M15.4154 15.8335L11.2487 15.8335"
        stroke="#303132"
        strokeWidth={1.66667}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default AIKeywordsHighlightIcon;
