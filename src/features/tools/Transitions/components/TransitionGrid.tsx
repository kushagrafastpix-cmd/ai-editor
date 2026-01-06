import type { TransitionConfig } from "../types";
import TransitionCard from "./TransitionCard";

interface Props {
  transitions: TransitionConfig[];
  onApplyTransition: (id: TransitionConfig["id"]) => void;
}

const TransitionGrid = ({ transitions, onApplyTransition }: Props) => {
  return (
    <div className="px-4 pb-6">
      <div className="grid grid-cols-3 gap-x-5 gap-y-6">
        {transitions.map((transition) => (
          <TransitionCard
            key={transition.id}
            transition={transition}
            onClick={() => onApplyTransition(transition.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default TransitionGrid;
