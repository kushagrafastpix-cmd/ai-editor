import type { ReactNode } from "react";

interface ToolCardProps {
  children: ReactNode;
}

// const ToolCard = ({ children }: ToolCardProps) => {
//   return (
//     <div className="h-full rounded-sm bg-white shadow-sm">
//       {children}
//     </div>
//   );
// };

const ToolCard = ({ children }: ToolCardProps) => {
  return (
    <div className="h-full flex flex-col rounded-sm bg-white shadow-sm">
      {children}
    </div>
  );
};


export default ToolCard;
