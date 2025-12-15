import React from 'react';
import { ViewMode } from '../types';
import { Volume2, VolumeX, Menu } from 'lucide-react';

interface NavigationProps {
  activeMode: ViewMode;
  onNavigate: (mode: ViewMode) => void;
  isMuted: boolean;
  toggleMute: () => void;
  toggleMenu: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ 
  activeMode, 
  onNavigate, 
  isMuted, 
  toggleMute,
  toggleMenu
}) => {
  const navItems = [
    { label: 'THE GARDEN', mode: ViewMode.THE_GARDEN },
    { label: 'MEMORY', mode: ViewMode.MEMORY },
    { label: 'MUSIC', mode: ViewMode.MUSIC },
    { label: 'INFO', mode: ViewMode.INFO },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-8 py-6 flex justify-between items-center text-[#e5e5e5] mix-blend-difference pointer-events-none">
      {/* Top Left: Name (Pointer events allowed) */}
      <div className="text-xl font-light tracking-[0.2em] font-serif pointer-events-auto">
        JINYAO
      </div>

      {/* Center: Navigation Links (Pointer events allowed) */}
      <div className="hidden md:flex gap-12 absolute left-1/2 transform -translate-x-1/2 pointer-events-auto">
        {navItems.map((item) => (
          <button
            key={item.mode}
            onClick={() => onNavigate(item.mode)}
            className={`text-sm tracking-[0.15em] transition-all duration-300 hover:text-white ${
              activeMode === item.mode ? 'text-white opacity-100 border-b border-white pb-1' : 'text-gray-400 opacity-70'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Top Right: Controls (Pointer events allowed) */}
      <div className="flex items-center gap-6 pointer-events-auto">
        <button 
          onClick={toggleMute}
          className="hover:opacity-70 transition-opacity"
          aria-label="Toggle Audio"
        >
          {isMuted ? <VolumeX size={20} strokeWidth={1} /> : <Volume2 size={20} strokeWidth={1} />}
        </button>
        <button 
          onClick={toggleMenu}
          className="hover:opacity-70 transition-opacity"
          aria-label="Menu"
        >
          <Menu size={24} strokeWidth={1} />
        </button>
      </div>
    </nav>
  );
};

export default Navigation;