import React, { useState } from 'react';
import { Memory } from '../types';
import { BookOpen, X, ImageIcon } from 'lucide-react';

interface MemoryHallProps {
  memories: Memory[];
  isVisible: boolean;
  onClose: () => void;
}

const MemoryHall: React.FC<MemoryHallProps> = ({ memories, isVisible, onClose }) => {
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 z-40 bg-[#050505] animate-fade-in overflow-hidden flex flex-col">
      {/* Header */}
      <div className="pt-32 px-12 pb-8 border-b border-white/10 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-serif text-white tracking-widest mb-2">MEMORY HALL</h2>
          <p className="text-xs text-gray-500 uppercase tracking-[0.3em]">The Corridor of Thought</p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="flex-1 overflow-y-auto p-12">
        {memories.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4">
            <BookOpen size={48} strokeWidth={0.5} />
            <p className="font-serif italic text-lg">No echoes recorded yet.</p>
            <p className="text-xs uppercase tracking-widest">Speak to the philosophers to create memories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {memories.map((memory) => (
              <div 
                key={memory.id}
                onClick={() => setSelectedMemory(memory)}
                className="group cursor-pointer border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 p-8 transition-all duration-500 flex flex-col gap-4 relative overflow-hidden"
              >
                {/* Background Image - Original Color, Subtle Opacity */}
                {memory.imageSrc && (
                    <div 
                        className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-700 bg-cover bg-center"
                        style={{ backgroundImage: `url(${memory.imageSrc})` }}
                    />
                )}
                
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                <div className="flex justify-between items-start relative z-10">
                   <span className="text-[10px] uppercase tracking-widest text-gray-500 border border-white/10 px-2 py-1 rounded bg-black/50 backdrop-blur-sm">
                      {memory.philosopherName}
                   </span>
                   <span className="text-[10px] font-sans text-gray-300 shadow-black drop-shadow-md">{memory.date}</span>
                </div>

                <h3 className="text-xl md:text-2xl font-serif text-white/90 group-hover:text-white leading-relaxed mt-2 relative z-10 drop-shadow-lg">
                  {memory.title}
                </h3>

                <div className="w-8 h-[1px] bg-white/20 mt-auto group-hover:w-16 transition-all duration-500 relative z-10"></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reading Modal */}
      {selectedMemory && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 md:p-20 animate-fade-in">
          <div className="max-w-4xl w-full bg-[#0a0a0a] border border-white/10 flex flex-col md:flex-row shadow-2xl max-h-[90vh] overflow-hidden">
            
            {/* Image Section - Original Color */}
            {selectedMemory.imageSrc && (
                <div className="w-full md:w-1/3 h-48 md:h-auto bg-cover bg-center border-r border-white/10" style={{ backgroundImage: `url(${selectedMemory.imageSrc})` }}>
                    {/* Optional slight darkening for contrast if needed, but keeping it mostly original */}
                    <div className="w-full h-full bg-black/10"></div>
                </div>
            )}

            {/* Text Section */}
            <div className="flex-1 p-12 relative overflow-y-auto">
                <button 
                  onClick={() => setSelectedMemory(null)}
                  className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors z-50"
                >
                  <X size={24} strokeWidth={1} />
                </button>

                <div className="mb-12">
                  <span className="text-xs uppercase tracking-[0.3em] text-gray-500 block mb-4">
                    {selectedMemory.philosopherName} · {selectedMemory.date}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-serif text-white leading-tight">
                    {selectedMemory.title}
                  </h2>
                </div>

                <div className="prose prose-invert prose-p:font-serif prose-p:text-lg prose-p:text-gray-300 prose-p:leading-loose">
                   {selectedMemory.body.split('\n').map((para, i) => (
                     para.trim() && <p key={i}>{para}</p>
                   ))}
                </div>

                <div className="mt-16 pt-8 border-t border-white/5 text-center">
                  <p className="text-[10px] text-gray-700 tracking-widest uppercase">Archived in The Garden Memory</p>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryHall;