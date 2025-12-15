import React, { useState } from 'react';
import { ParticleConfig } from '../types';
import { Sliders, X } from 'lucide-react';

interface ControlPanelProps {
  config: ParticleConfig;
  setConfig: React.Dispatch<React.SetStateAction<ParticleConfig>>;
  isVisible: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ config, setConfig, isVisible }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!isVisible) return null;

  const handleChange = (key: keyof ParticleConfig, value: number) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="absolute right-8 top-1/2 transform -translate-y-1/2 z-30 pointer-events-auto">
      
      {/* Toggle Button (When Closed) */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-black/40 backdrop-blur-md border border-white/10 p-4 rounded-full hover:bg-white/10 transition-all duration-300 text-white/70 hover:text-white shadow-[0_0_15px_rgba(0,0,0,0.5)] animate-fade-in"
          title="Particle Settings"
        >
          <Sliders size={20} strokeWidth={1.5} />
        </button>
      )}

      {/* Expanded Panel (When Open) */}
      {isOpen && (
        <div className="bg-black/40 backdrop-blur-md border border-white/10 p-6 rounded-2xl w-64 shadow-2xl animate-fade-in">
          <div className="flex items-center justify-between mb-6 text-white/80 border-b border-white/10 pb-3">
            <div className="flex items-center gap-3">
               <Sliders size={18} />
               <h3 className="font-serif tracking-widest text-sm">CONTROLS</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-gray-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Dispersion */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400 tracking-wider">
                <span>DISPERSION</span>
                <span>{Math.round(config.dispersion * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.01"
                value={config.dispersion}
                onChange={(e) => handleChange('dispersion', parseFloat(e.target.value))}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>

            {/* Noise / Chaos */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400 tracking-wider">
                <span>CHAOS</span>
                <span>{Math.round(config.noiseStrength * 10)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={config.noiseStrength}
                onChange={(e) => handleChange('noiseStrength', parseFloat(e.target.value))}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>

            {/* Speed */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400 tracking-wider">
                <span>FLOW SPEED</span>
                <span>{config.speed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0"
                max="3"
                step="0.1"
                value={config.speed}
                onChange={(e) => handleChange('speed', parseFloat(e.target.value))}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>

            {/* Size */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400 tracking-wider">
                <span>PARTICLE SIZE</span>
                <span>{config.size.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                step="0.5"
                value={config.size}
                onChange={(e) => handleChange('size', parseFloat(e.target.value))}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlPanel;