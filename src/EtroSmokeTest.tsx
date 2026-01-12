import { useEffect, useRef } from "react";
import etro from "etro";

export default function EtroSmokeTest() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    // Fixed preview resolution
    canvas.width = 480;
    canvas.height = 270; // 16:9 test

    // Hidden video element
    const video = document.createElement("video");
    video.src = "/videos/testing-video.mp4";
    video.crossOrigin = "anonymous";
    video.playsInline = true;
    video.muted = true; // REQUIRED for autoplay
    video.preload = "auto";

    // Create Etro movie
    const movie = new etro.Movie({
        canvas,
      });

    // Create video layer
    const videoLayer = new etro.layer.Video({
      source: video,
      startTime: 0,
    });

    movie.layers.push(videoLayer);

    video.addEventListener("loadeddata", async () => {
        try {
          await video.play();   // 🔥 THIS is the missing piece
          movie.play();
        } catch (err) {
          console.error("Video play failed:", err);
        }
      });
      

    return () => {
      movie.pause();
    };
  }, []);

  return (
    <div style={{ width: 480, height: 270, background: "black" }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
