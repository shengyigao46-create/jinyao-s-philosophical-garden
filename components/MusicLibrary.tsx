import React from 'react';
import { Track, PlaybackMode } from '../types';
import { Play, Pause, Upload, Shuffle, Repeat, ListMusic, Trash2 } from 'lucide-react';

interface MusicLibraryProps {
  tracks: Track[];
  currentTrackIndex: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSelectTrack: (index: number) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  playbackMode: PlaybackMode;
  setPlaybackMode: (mode: PlaybackMode) => void;
  isVisible: boolean;
}

const MusicLibrary: React.FC<MusicLibraryProps> = ({
  tracks,
  currentTrackIndex,
  isPlaying,
  onPlayPause,
  onSelectTrack,
  onUpload,
  playbackMode,
  setPlaybackMode,
  isVisible
}) => {
  if (!isVisible) return null;

  return (
    <div className="h-full flex flex-col p-12 bg-[#080808] border-l border-white/5 relative z-30">
      
      {/* Header */}
      <div className="mb-8 border-b border-white/10 pb-6">
        <h2 className="text-3xl font-serif text-white tracking-widest mb-2">MUSIC LIBRARY</h2>
        <p className="text-xs text-gray-500 uppercase tracking-[0.3em]">Sonic Atmosphere</p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-8">
        <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all text-xs tracking-widest text-gray-300 hover:text-white">
          <Upload size={14} />
          <span>UPLOAD MP3</span>
          <input type="file" accept="audio/*" onChange={onUpload} className="hidden" />
        </label>

        <div className="h-6 w-[1px] bg-white/10 mx-2"></div>

        <button 
          onClick={() => setPlaybackMode('SEQUENCE')}
          className={`p-2 rounded-full transition-colors ${playbackMode === 'SEQUENCE' ? 'text-white bg-white/10' : 'text-gray-600 hover:text-gray-400'}`}
          title="Sequential"
        >
          <ListMusic size={18} />
        </button>
        <button 
          onClick={() => setPlaybackMode('RANDOM')}
          className={`p-2 rounded-full transition-colors ${playbackMode === 'RANDOM' ? 'text-white bg-white/10' : 'text-gray-600 hover:text-gray-400'}`}
          title="Random"
        >
          <Shuffle size={18} />
        </button>
        <button 
          onClick={() => setPlaybackMode('LOOP')}
          className={`p-2 rounded-full transition-colors ${playbackMode === 'LOOP' ? 'text-white bg-white/10' : 'text-gray-600 hover:text-gray-400'}`}
          title="Loop Single"
        >
          <Repeat size={18} />
        </button>
      </div>

      {/* Track List */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-1">
        {tracks.map((track, index) => {
          const isActive = index === currentTrackIndex;
          return (
            <div 
              key={`${track.title}-${index}`}
              onClick={() => onSelectTrack(index)}
              className={`group flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all duration-300 border border-transparent ${
                isActive 
                  ? 'bg-white/10 border-white/20' 
                  : 'hover:bg-white/5 hover:border-white/5'
              }`}
            >
              <div className="flex items-center gap-4 overflow-hidden">
                <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full ${isActive ? 'bg-white text-black' : 'bg-black/40 text-gray-500 group-hover:text-white'}`}>
                  {isActive && isPlaying ? (
                    <div className="flex gap-[2px]">
                       <div className="w-[2px] h-3 bg-black animate-[bounce_1s_infinite]"></div>
                       <div className="w-[2px] h-3 bg-black animate-[bounce_1.2s_infinite]"></div>
                       <div className="w-[2px] h-3 bg-black animate-[bounce_0.8s_infinite]"></div>
                    </div>
                  ) : (
                    <span className="font-serif text-xs">{index + 1}</span>
                  )}
                </div>
                <div className="flex flex-col overflow-hidden">
                   <span className={`text-sm truncate font-serif tracking-wide ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                     {track.title}
                   </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 pt-4 border-t border-white/5 text-center">
        <p className="text-[10px] text-gray-700">Currently Mode: {playbackMode}</p>
      </div>
    </div>
  );
};

export default MusicLibrary;
