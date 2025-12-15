import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import { Track } from '../types';

interface MusicPlayerProps {
  onAudioElementReady: (el: HTMLAudioElement) => void;
  shouldAutoPlay: boolean;
  isMuted: boolean;
  
  // Controlled State
  currentTrack: Track;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onError: () => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ 
  onAudioElementReady, 
  shouldAutoPlay,
  isMuted,
  currentTrack,
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  onError
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      onAudioElementReady(audioRef.current);
    }
  }, [onAudioElementReady]);

  // Handle Mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Handle Play/Pause logic based on props
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => {
                // Auto-fix: if play fails (e.g. interaction policy), we might need to sync state
                console.warn("Autoplay prevented or interrupted", e);
            });
        }
    } else {
        audio.pause();
    }
  }, [isPlaying, currentTrack]); // Trigger when track changes too

  // Handle Error (Silent fail + Callback)
  const handleTrackError = () => {
    console.warn(`Load failed for: ${currentTrack.title}`);
    onError(); 
  };

  return (
    <div className="absolute bottom-12 left-8 z-30 animate-fade-in flex flex-col gap-2">
      <audio 
        ref={audioRef} 
        src={currentTrack.url} 
        crossOrigin="anonymous" 
        onEnded={onNext}
        onError={handleTrackError}
        preload="auto"
      />

      <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-3 rounded-full hover:bg-black/60 hover:border-white/30 transition-all group">
        
        <button onClick={onPrev} className="text-gray-500 hover:text-white transition-colors">
          <SkipBack size={14} />
        </button>

        <button onClick={onPlayPause} className="text-white hover:text-gray-300 transition-colors">
          {isPlaying ? <Pause size={18} fill="currentColor" className="opacity-90"/> : <Play size={18} fill="currentColor" className="opacity-90" />}
        </button>

        <div className="flex flex-col w-32 overflow-hidden">
          <span className="text-[9px] text-gray-500 uppercase tracking-widest font-sans">
             {isPlaying ? 'NOW PLAYING' : 'PAUSED'}
          </span>
          <span className="text-xs text-white truncate font-serif italic tracking-wide">
            {currentTrack.title}
          </span>
        </div>

        <button onClick={onNext} className="text-gray-400 hover:text-white transition-colors">
          <SkipForward size={16} />
        </button>
      </div>
    </div>
  );
};

export default MusicPlayer;
