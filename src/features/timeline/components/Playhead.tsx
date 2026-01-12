interface PlayheadProps {
  currentTime: number;
  pixelsPerSecond: number;
  totalHeight: number; // Total height from bottom of tracks to middle of ruler
  showPentagon?: boolean;
}

const Playhead = ({ currentTime, pixelsPerSecond, totalHeight, showPentagon = true }: PlayheadProps) => {
  const position = currentTime * pixelsPerSecond;

  return (
    <div
      className="absolute bottom-0 pointer-events-none z-50"
      style={{
        left: `${position}px`,
        height: `${totalHeight}px`,
        transform: 'translateX(-1px)', // Center the 2px bar
      }}
    >
      {/* Vertical bar */}
      <div
        style={{
          width: '2px',
          height: '100%',
          backgroundColor: '#E20E0E',
        }}
      />
      
      {/* Pentagon at the top (middle of ruler) - pointing upward with bottom pointing to ruler */}
      {showPentagon && (
        <svg
          width="9"
          height="8"
          viewBox="0 0 9 8"
          style={{
            position: 'absolute',
            top: '0px',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          {/* Pentagon (5 sides) with bottom point pointing down to ruler:
              - Bottom point (narrow, pointing down): (4.5, 8) - center bottom
              - Left bottom: (2, 6)
              - Left top: (1, 3)
              - Top center: (4.5, 0)
              - Right top: (8, 3)
              - Right bottom: (7, 6)
          */}
          <polygon
            points="4.5,8 2,6 1,3 4.5,0 8,3 7,6"
            fill="#E20E0E"
          />
        </svg>
      )}
    </div>
  );
};

export default Playhead;

