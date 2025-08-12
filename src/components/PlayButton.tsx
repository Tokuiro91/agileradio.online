import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

interface PlayButtonProps {
  isPlaying: boolean;
  onToggle: () => void;
}

const PlayButton = ({ isPlaying, onToggle }: PlayButtonProps) => {
  return (
    <div className="flex flex-col items-start space-y-4">
      <div className="text-left">
        <div className="text-radio-text font-medium text-lg"></div>
        <div className="text-radio-text-muted text-sm mt-1"></div>
        <div className="text-radio-accent text-sm mt-1"></div>
      </div>
    </div>
  );
};

export default PlayButton;
