import type { ReactNode } from "react";

interface ToolCardProps {
  children: ReactNode;
}

const ToolCard = ({ children }: ToolCardProps) => {
  return (
    <div className="h-full rounded-sm bg-white shadow-sm">
      {children}
    </div>
  );
};

export default ToolCard;
