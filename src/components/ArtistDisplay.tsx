import { useState } from "react";
import artistPhoto from "@/assets/artist.jpg";

const ArtistDisplay = () => {
  const [showDescription, setShowDescription] = useState(false);

  const artistInfo = {
    name: "Tancy",
    bio: "Tancy is part of a new wave of selectors who speak through rhythm and build sets like stories. Deep in the world of hypnotic groove and hardgroove, his sound is raw, driving, and built for the floor.  He’s not chasing trends or algorithms. His sets are for heads who know — for those who come to lose themselves in the loop and lock into something deeper. Though he only recently stepped behind the decks, he’s already played international gigs, showing up in the right places with the right energy. Tancy’s style is all about vibe over hype. No gimmicks, no fluff — just tight selections and straight connection. Every set is a conversation with the crowd, and every track is a part of the language.",
    location: "St Petersburg , Russia",
    genre: "Hypnotic Groove / Hard Groove",
  };

  return (
    <div
      className="relative w-full h-full cursor-pointer group overflow-hidden"
      onClick={() => setShowDescription(!showDescription)}
    >
      {!showDescription ? (
        <div className="relative w-full h-full">
          <img
            src={artistPhoto}
            alt="Current Artist"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-3 left-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="text-sm font-medium">Click for info</div>
          </div>
        </div>
      ) : (
        <div className="w-full h-full bg-radio-surface border border-radio-border p-4 flex flex-col justify-center text-left">
          <h3 className="text-radio-text font-bold text-lg mb-2">
            {artistInfo.name}
          </h3>
          <p className="text-radio-text-muted text-sm mb-3 leading-relaxed">
            {artistInfo.bio}
          </p>
          <div className="space-y-1">
            <div className="text-radio-accent text-xs">
              {artistInfo.location}
            </div>
            <div className="text-radio-accent text-xs">{artistInfo.genre}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistDisplay;
