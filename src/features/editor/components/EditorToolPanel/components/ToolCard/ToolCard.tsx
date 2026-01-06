import type { ReactNode } from "react";

interface ToolCardProps {
  children: ReactNode;
}


const ToolCard = ({ children }: ToolCardProps) => {
  return (
    <div className="h-full min-h-0 min-w-0 flex flex-col rounded-sm bg-white shadow-sm">
      {children}
    </div>
  );
};


export default ToolCard;
