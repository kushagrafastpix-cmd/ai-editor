import { useMemo } from 'react';
import { formatTime } from '../utils/timeFormat';

interface TimelineRulerProps {
  duration: number; // Total duration in seconds
  pixelsPerSecond: number; // Zoom scale
  width: number; // Container width in pixels
}

interface TickMark {
  time: number;
  position: number;
  isMajor: boolean;
}

const TimelineRuler = ({ duration, pixelsPerSecond, width }: TimelineRulerProps) => {
  // Major ticks every 5 seconds, minor ticks every 0.5 seconds (9 minors between 2 majors)
  const MAJOR_INTERVAL = 5; // Major ticks every 5 seconds
  const MINOR_INTERVAL = 0.5; // Minor ticks every 0.5 seconds (9 minors between 2 majors: 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5)

  // Generate tick marks
  const ticks = useMemo(() => {
    const tickMarks: TickMark[] = [];
    
    // Generate all ticks (both major and minor)
    for (let time = 0; time <= duration; time += MINOR_INTERVAL) {
      const position = time * pixelsPerSecond;
      const isMajor = time % MAJOR_INTERVAL === 0; // Major tick every 5 seconds
      tickMarks.push({ time, position, isMajor });
    }
    
    return tickMarks;
  }, [duration, pixelsPerSecond]);

  const rulerWidth = duration * pixelsPerSecond;

  return (
    <div 
      className="relative bg-white border-b border-[#DADCE5] overflow-x-auto scrollbar-hide"
      style={{ height: '50px', width: `${width}px` }}
    >
      <div style={{ width: `${rulerWidth}px`, height: '100%', position: 'relative' }}>
        {/* Base horizontal line at the top */}
        <div 
          className="absolute top-0 left-0"
          style={{ 
            height: '1px', 
            backgroundColor: '#DADCE5',
            width: `${rulerWidth}px`
          }}
        />

        {/* Tick marks */}
        {ticks.map((tick, index) => {
          const tickHeight = tick.isMajor ? 12 : 6;
          // Only show labels on major ticks (every 5 seconds)
          const shouldShowLabel = tick.isMajor;

          return (
            <div key={index} className="absolute top-0" style={{ left: `${tick.position}px` }}>
              {/* Tick mark extending downward */}
              <div
                style={{
                  width: '1px',
                  height: `${tickHeight}px`,
                  backgroundColor: '#DADCE5',
                }}
              />

              {/* Label above the line - only on major ticks */}
              {shouldShowLabel && (
                <div
                  className="absolute text-[10px] text-gray-600 whitespace-nowrap"
                  style={{
                    top: `${tickHeight + 4}px`,
                    left: '50%',
                    transform: 'translateX(-50%)',
                  }}
                >
                  {formatTime(tick.time)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineRuler;

