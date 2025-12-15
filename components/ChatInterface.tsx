import React, { useState, useRef } from 'react';
import { Philosopher, PhilosopherId } from '../types';
import { Send, StopCircle } from 'lucide-react';

interface ChatInterfaceProps {
  onSendMessage: (text: string) => void;
  onEndSession: () => void;
  currentResponse: string | null;
  isProcessing: boolean;
  selectedPhilosopher: PhilosopherId;
  onSelectPhilosopher: (id: PhilosopherId) => void;
  active: boolean;
  hasHistory: boolean;
}

const PHILOSOPHERS: Philosopher[] = [
  { id: 'hegel', name: 'Hegel', nameCh: '黑格尔', desc: '精神现象学' },
  { id: 'williams', name: 'Williams', nameCh: '威廉斯', desc: '伦理与限度' },
  { id: 'husserl', name: 'Husserl', nameCh: '胡塞尔', desc: '现象学还原' },
];

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onSendMessage,
  onEndSession,
  currentResponse,
  isProcessing,
  selectedPhilosopher,
  onSelectPhilosopher,
  active,
  hasHistory
}) => {
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isProcessing) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  if (!active) return null;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between pb-12 pt-28">
      
      {/* TOP: Philosopher Selector */}
      <div className="flex justify-center w-full pointer-events-auto">
        <div className="flex gap-4 bg-black/20 backdrop-blur-sm p-2 rounded-full border border-white/5">
          {PHILOSOPHERS.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectPhilosopher(p.id)}
              className={`px-5 py-2 rounded-full transition-all duration-500 flex flex-col items-center min-w-[90px] ${
                selectedPhilosopher === p.id
                  ? 'bg-white/10 border border-white/40 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <span className="text-xs tracking-widest uppercase font-sans">{p.name}</span>
              <span className="text-[10px] font-serif italic opacity-60">{p.nameCh}</span>
            </button>
          ))}
        </div>
      </div>

      {/* MIDDLE: 3D Image Space (Transparent) */}
      <div className="flex-grow"></div>

      {/* LOWER MIDDLE: AI Response Display */}
      <div className="flex flex-col items-center justify-center px-6 min-h-[120px] mb-4">
        {isProcessing ? (
          <div className="flex gap-2 mb-4">
            <span className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
          </div>
        ) : currentResponse ? (
          <div className="animate-fade-in text-center max-w-2xl bg-black/20 backdrop-blur-sm p-6 rounded-xl border border-white/5">
            <p className="font-serif text-lg md:text-xl text-white/90 leading-relaxed tracking-wide shadow-black drop-shadow-lg">
              {currentResponse}
            </p>
          </div>
        ) : null}
      </div>

      {/* BOTTOM: Input & Controls */}
      <div className="flex flex-col items-center w-full px-6 gap-4 pointer-events-auto">
        
        {/* Input Bar Container */}
        <div className="relative w-full max-w-lg">
          <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
            
            {/* Text Input */}
            <div className="relative flex-grow">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Whisper into the void..."
                disabled={isProcessing}
                className="w-full bg-black/40 backdrop-blur-xl border border-white/20 text-white placeholder-gray-500 font-serif text-base py-3 pl-6 pr-12 rounded-full focus:outline-none focus:border-white/50 focus:bg-black/60 transition-all shadow-lg"
              />
               <button 
                type="submit" 
                disabled={!inputText.trim() || isProcessing}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white disabled:opacity-0 transition-all p-2"
              >
                <Send size={16} />
              </button>
            </div>

          </form>
        </div>

        {/* Archive / End Session Button */}
        {hasHistory && (
          <button
            onClick={onEndSession}
            disabled={isProcessing}
            className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-red-300/60 hover:text-red-300 transition-colors uppercase py-2"
          >
            <StopCircle size={10} />
            <span>Archive Memory</span>
          </button>
        )}

      </div>
    </div>
  );
};

export default ChatInterface;
