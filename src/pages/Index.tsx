import { useState } from "react";
import Header from "@/components/Header";
import PlayButton from "@/components/PlayButton";
import ArtistDisplay from "@/components/ArtistDisplay";
import WaveformPlayer from "@/components/WaveformPlayer";

const Index = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="min-h-screen bg-radio-bg text-radio-text">
      <Header isPlaying={isPlaying} />

      {/* Main Content */}
      <main className="pt-20 pb-32">
        <div className="h-[calc(100vh-13rem)] flex">
          {/* Left Side - Station Info */}
          <div className="flex-1 relative px-6">
            {/* Large Play Button - Bottom Left */}
            <div className="absolute bottom-8 left-8">
              <PlayButton isPlaying={isPlaying} onToggle={handleTogglePlay} />
            </div>

            {/* Center Content - Station Info */}
            <div className="flex items-center justify-center h-full">
              <div className="text-left space-y-6">
                <h1 className="text-6xl md:text-8xl font-light tracking-widest text-radio-text">
                  Tancy
                </h1>
                <p className="text-xl text-radio-text-muted tracking-wide">
                  Techno in Georgia (live)
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Artist Photo */}
          <div className="w-1/2">
            <ArtistDisplay />
          </div>
        </div>
      </main>

      {/* Footer Media Player */}
      <WaveformPlayer isPlaying={isPlaying} onToggle={handleTogglePlay} />
    </div>
  );
};

export default Index;
