import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface WaveformPlayerProps {
  isPlaying: boolean;
  onToggle: () => void;
}

const WaveformPlayer = ({ isPlaying, onToggle }: WaveformPlayerProps) => {
  const [volume, setVolume] = useState([75]);
  const [isMuted, setIsMuted] = useState(false);
  const [eqBars, setEqBars] = useState<number[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Generate random equalizer animation
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        const newBars = Array.from(
          { length: 120 },
          () => Math.random() * 40 + 5
        );
        setEqBars(newBars);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setEqBars(Array.from({ length: 120 }, () => 5));
    }
  }, [isPlaying]);

  // Control audio playback
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Control volume and mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume[0] / 100;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Generate equalizer bars
  const generateEqualizer = () => {
    const bars = [];
    for (let i = 0; i < 120; i++) {
      const height = eqBars[i] || 5;
      bars.push(
        <div
          key={i}
          className={`w-1 transition-all duration-100 ${
            isPlaying ? "bg-radio-accent" : "bg-radio-border"
          }`}
          style={{ height: `${height}px` }}
        />
      );
    }
    return bars;
  };

  return (
    <>
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        loop
        preload="none"
        src="https://streams.ilovemusic.de/iloveradio17.mp3" // stream URL----------------------------------------------------------------------------------------!!!
      />

      <footer className="fixed bottom-0 left-0 right-0 border-t border-radio-border bg-radio-surface/95 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between space-x-6">
            {/* Play/Pause Button */}
            <Button
              onClick={onToggle}
              className="w-20 h-20 rounded-full bg-radio-accent hover:bg-radio-accent-hover transition-all duration-300 shadow-lg hover:shadow-radio-glow/50 hover:shadow-2xl group"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
              ) : (
                <Play className="w-8 h-8 text-white ml-1 group-hover:scale-110 transition-transform" />
              )}
            </Button>

            {/* Equalizer Visualization */}
            <div className="flex-1 flex items-end justify-center space-x-px h-12">
              {generateEqualizer()}
            </div>

            {/* Volume Control */}
            <div className="flex items-center space-x-3 w-32">
              <button
                onClick={toggleMute}
                className="text-radio-text-muted hover:text-radio-accent transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <Slider
                value={isMuted ? [0] : volume}
                onValueChange={setVolume}
                max={100}
                step={1}
                className="flex-1"
                disabled={isMuted}
              />
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default WaveformPlayer;
