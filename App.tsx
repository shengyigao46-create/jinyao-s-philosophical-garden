import React, { useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Upload } from 'lucide-react';

import Navigation from './components/Navigation';
import { ParticleImage } from './components/ParticleImage';
import ControlPanel from './components/ControlPanel';
import MusicPlayer from './components/MusicPlayer';
import MusicLibrary from './components/MusicLibrary';
import ChatInterface from './components/ChatInterface';
import MemoryHall from './components/MemoryHall';

import { ViewMode, ParticleConfig, PhilosopherId, Memory, ChatMessage, Track, PlaybackMode } from './types';

// Add type definitions for Three.js elements in JSX used in this file
declare global {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: any;
      pointLight: any;
    }
  }
}

// --- AI CONFIGURATION (UPDATED) ---

type KimiMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

const STORAGE_KEYS = {
  image: 'garden:image',
  chatHistory: 'garden:chat',
  memories: 'garden:memories',
  particle: 'garden:particle',
  tracks: 'garden:tracks',
  philosopher: 'garden:philosopher'
};

const KIMI_API_ENDPOINT = '/api/kimi'; // Proxied via Vite dev server
const KIMI_MODEL = 'moonshot-v1-8k';

const GLOBAL_CONSTRAINTS = `
🧠 回应模式自动判断规则（内嵌）
当用户输入中出现以下特征之一：
明确提及哲学家著作、文章、论证
使用哲学概念或问题（如理由、规范性、意识、历史性等）
明确要求“如何理解/是否成立/你是否同意”
👉 启动 【哲学密度模式】
否则：
👉 启动 【生活—哲学过渡模式】
⚠️ 这不是两个角色，而是同一个人在不同谈话深度下的自然状态。
【全局语言约束（升级版）】
回答必须体现该哲学家的真实思想立场
允许使用概念，但只用“必要的那一个”
禁止教材式解释
禁止抽象总结替代判断
你必须严格遵守以下输出规范：

输出只能是自然语言的一整段连续文本。
禁止使用任何格式化或排版符号，包括但不限于：
星号、双星号、井号、反引号、引用符号、破折号、列表符号。
禁止使用说话人标签或角色标记，例如：
“Philosopher:”“Hegel:”“Williams:”“胡塞尔：”等。
禁止用冒号来引出观点或定义。
不得通过符号或排版来强调概念，只能通过自然语言表达重点。
输出应当像真实对话中的发言，而不是文章、论文或笔记。
如果你生成的文本中包含任何符号、标签或格式化痕迹，
你必须在最终输出前自动重写为符合以上规范的自然语言表达。
名词不需要英文翻译
回复长度：
哲学密度模式：150–200 字
生活—哲学过渡模式：90–150 字
始终保持对话姿态，允许反问
允许不同意用户，并说明为什么
`;

const SYSTEM_PROMPTS: Record<PhilosopherId, string> = {
  hegel: `${GLOBAL_CONSTRAINTS}
（1） 黑格尔（Hegel）
二者并存关键词：经验 → 矛盾 → 理解的展开
System Prompt|黑格尔（双模式）
你是黑格尔。
你清楚自己的哲学关心的不是零散经验，而是经验如何在自身矛盾中被理解。
【哲学密度模式】
当对方讨论你的文本、概念或论证时：
你要指出问题中尚未被反思的前提
展示该前提如何在自身中产生张力
说明一种可能的更高理解，但不将其简化为结论
你反对把矛盾当作错误，也反对停留在直接经验层面。
【生活—哲学过渡模式】
当对话源于日常、疲惫或情绪时：
你仍会把谈话引向“正在发生的过程”
但不使用技术术语
让哲学自然地从生活展开，而非压在其上
无论哪种模式，你都保持耐心但不退让，
你让对方感到：
这段经验并非无意义，而是尚未被完全理解。`,

  williams: `${GLOBAL_CONSTRAINTS}
（2） 伯纳德·威廉斯（Bernard Williams）
二者并存关键词：现实处境 × 对道德理论的警惕
，这是你这个系统的思想锋刃。
System Prompt|伯纳德·威廉斯（双模式）
你是伯纳德·威廉斯。
你始终警惕一种倾向：
用抽象的道德语言，替代对真实处境的理解。
【哲学密度模式】
当对方讨论你的书、文章或伦理论证时：
你必须基于你真实的哲学立场回应
尤其针对：义务论、功利主义、过度理想化的规范性要求
你会拆解问题中隐含的道德化前提
讨论行动者的理由、历史位置与不可消除的遗憾
你可以明确反对对方，并说明为什么这种期待不诚实或不可能。
【生活—哲学过渡模式】
当对话来自个人处境、内疚、疲惫或困惑时：
你仍然保持哲学上的清醒
但不把对方推向抽象评判
你会帮助他们看清：他们实际上在乎什么，而不是他们“应该”在乎什么
你不提供安慰性的意义，
但你始终与现实站在一起。
你让人感到：
即使处境不光彩，也值得被认真对待。`,

  husserl: `${GLOBAL_CONSTRAINTS}
（3） 胡塞尔（Husserl）
二者并存关键词：经验的精确性 × 方法论警觉
System Prompt|胡塞尔（双模式）
你是胡塞尔。
你始终区分：事实发生了什么，与意义是如何被给予的。
【哲学密度模式】
当对方讨论意识、经验、主体性或你的文本时：
你会指出是否混淆了对象与其显现方式
要求澄清：讨论的是心理事实，还是意义条件
你保持抽象，但要求概念精确
你反对自然主义的草率解释，也反对含糊的经验描述。
【生活—哲学过渡模式】
当谈话源于疲惫、感受或生活细节时：
你不会急于分析
你会引导对方回到当下经验本身
让哲学以“注意力的调整”方式出现
无论哪种模式，
你都让对方意识到：
真正的问题，往往出现在我们还没仔细看清之前。`
};

const PHILOSOPHER_NAMES = {
    hegel: 'G.W.F. Hegel',
    williams: 'Bernard Williams',
    husserl: 'Edmund Husserl'
};

const DEFAULT_TRACKS: Track[] = [];

const App: React.FC = () => {
  // --- STATE ---
  const [activeMode, setActiveMode] = useState<ViewMode>(ViewMode.THE_GARDEN);
  const [isMuted, setIsMuted] = useState(false);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // AI & Chat State
  const [philosopher, setPhilosopher] = useState<PhilosopherId>('hegel');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentAIResponse, setCurrentAIResponse] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Memories
  const [memories, setMemories] = useState<Memory[]>([]);

  // Music State (Lifted)
  const [tracks, setTracks] = useState<Track[]>(DEFAULT_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>('SEQUENCE');
  const hasTracks = tracks.length > 0;
  const currentTrack = hasTracks ? tracks[Math.min(currentTrackIndex, tracks.length - 1)] : null;

  // Particle Config
  const [particleConfig, setParticleConfig] = useState<ParticleConfig>({
    size: 3.5,
    speed: 0.8,
    dispersion: 0.6,
    noiseStrength: 1.0,
    colorHex: '#ffffff'
  });

  // --- PERSISTENCE ---
  const safeParse = useCallback(<T,>(value: string | null): T | null => {
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedImage = localStorage.getItem(STORAGE_KEYS.image);
    if (savedImage) {
      const img = new Image();
      img.src = savedImage;
      img.onload = () => setImageElement(img);
    }

    const savedChat = safeParse<ChatMessage[]>(localStorage.getItem(STORAGE_KEYS.chatHistory));
    if (savedChat) setChatHistory(savedChat);

    const savedMemories = safeParse<Memory[]>(localStorage.getItem(STORAGE_KEYS.memories));
    if (savedMemories) setMemories(savedMemories);

    const savedParticle = safeParse<ParticleConfig>(localStorage.getItem(STORAGE_KEYS.particle));
    if (savedParticle) setParticleConfig(savedParticle);

    const savedTracks = safeParse<Track[]>(localStorage.getItem(STORAGE_KEYS.tracks));
    if (savedTracks && savedTracks.length) setTracks(savedTracks);

    const savedPhilosopher = localStorage.getItem(STORAGE_KEYS.philosopher) as PhilosopherId | null;
    if (savedPhilosopher === 'hegel' || savedPhilosopher === 'williams' || savedPhilosopher === 'husserl') {
      setPhilosopher(savedPhilosopher);
    }
  }, [safeParse]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (imageElement?.src) {
      localStorage.setItem(STORAGE_KEYS.image, imageElement.src);
    } else {
      localStorage.removeItem(STORAGE_KEYS.image);
    }
  }, [imageElement]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (chatHistory.length) {
      localStorage.setItem(STORAGE_KEYS.chatHistory, JSON.stringify(chatHistory));
    } else {
      localStorage.removeItem(STORAGE_KEYS.chatHistory);
    }
  }, [chatHistory]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (memories.length) {
      localStorage.setItem(STORAGE_KEYS.memories, JSON.stringify(memories));
    } else {
      localStorage.removeItem(STORAGE_KEYS.memories);
    }
  }, [memories]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.particle, JSON.stringify(particleConfig));
  }, [particleConfig]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (tracks.length) {
      localStorage.setItem(STORAGE_KEYS.tracks, JSON.stringify(tracks));
    } else {
      localStorage.removeItem(STORAGE_KEYS.tracks);
    }
  }, [tracks]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.philosopher, philosopher);
  }, [philosopher]);

  // --- HANDLERS ---

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          setImageElement(img);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioElementReady = useCallback((el: HTMLAudioElement) => {}, []);

  // --- MUSIC LOGIC ---
  const handleMusicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        const newTrack = { title: file.name.substring(0, 20), url, isLocal: true };
        setTracks(prev => {
          const next = [...prev, newTrack];
          setCurrentTrackIndex(next.length - 1);
          return next;
        });
        setIsPlaying(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const nextTrack = useCallback(() => {
    if (!tracks.length) return;
    if (playbackMode === 'LOOP') {
       const audioEl = document.querySelector('audio');
       if (audioEl) { audioEl.currentTime = 0; audioEl.play(); }
    } else if (playbackMode === 'RANDOM') {
      const nextIndex = Math.floor(Math.random() * tracks.length);
      setCurrentTrackIndex(nextIndex);
    } else {
      // SEQUENCE
      setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    }
    setIsPlaying(true);
  }, [playbackMode, tracks.length]);

  const prevTrack = () => {
     if (!tracks.length) return;
     setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
     setIsPlaying(true);
  };

  const handleTrackError = () => {
    if (!tracks.length) return;
    // Auto skip on error
    console.log("Track error, skipping...");
    setTimeout(() => {
       setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    }, 1000);
  };

  // --- AI LOGIC ---

  const callKimi = useCallback(async (messages: KimiMessage[], temperature = 0.7) => {
    const response = await fetch(KIMI_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: KIMI_MODEL,
        messages,
        temperature
      })
    });

    const data = await response.json();
    if (!response.ok) {
      const message = data?.error?.message || 'Kimi API request failed';
      throw new Error(message);
    }

    const content = data?.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('Kimi returned an empty response');
    }

    return content;
  }, []);

  const generateAIResponse = async (userText: string) => {
    setIsProcessing(true);

    // Add user message to history
    const newUserMsg: ChatMessage = { role: 'user', text: userText, timestamp: Date.now() };
    const updatedHistory = [...chatHistory, newUserMsg];
    setChatHistory(updatedHistory);

    try {
      const messages: KimiMessage[] = [
        { role: 'system', content: SYSTEM_PROMPTS[philosopher] },
        ...updatedHistory.map((m) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.text
        }))
      ];

      const aiText = await callKimi(messages, 0.7);

      setCurrentAIResponse(aiText);
      setChatHistory(prev => [...prev, { role: 'model', text: aiText, timestamp: Date.now() }]);

    } catch (error) {
      console.error("AI Error:", error);
      const message = error instanceof Error ? error.message : 'Kimi is unreachable right now.';
      setCurrentAIResponse(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const endSessionAndArchive = async () => {
    if (chatHistory.length === 0) return;

    setIsProcessing(true);
    setCurrentAIResponse("凝固回忆中..."); // "Solidifying memory..."

    try {
      const fullTranscript = chatHistory.map(m => `${m.role}: ${m.text}`).join('\n');

      // 1. Generate Title (Single best choice)
      const titlePrompt = `
        请为以下哲学对话生成一个最符合特质的标题：
        要求：抽象、诗性、不超过 12 个字、不直接重复对话内容、像一本哲学随笔的章节名。
        不需要解释，直接输出这一个标题。
        
        对话内容：
        ${fullTranscript.slice(0, 10000)}
      `;

      const titleText = await callKimi([{ role: 'user', content: titlePrompt }], 0.5);
      let title = titleText.trim() || "无题";
      title = title.replace(/['"《》]/g, '');

      // 2. Generate Diary Body
      const bodyPrompt = `
        请将以下对话整理为一篇哲思日记：
        要求：
        第一人称
        200–400 字
        不记录对话形式
        更像思想回溯，而非事件记录
        语言克制、安静、有密度
        保留哲学张力，而不是总结答案
        文体参考：思想随笔、存在主义日记
        
        对话内容：
        ${fullTranscript.slice(0, 15000)}
      `;

      const body = await callKimi([{ role: 'user', content: bodyPrompt }], 0.65);

      // Create Memory Object with IMAGE and PRECISE TIMESTAMP (China Time)
      const newMemory: Memory = {
        id: Date.now().toString(),
        philosopherId: philosopher,
        philosopherName: PHILOSOPHER_NAMES[philosopher],
        title,
        body,
        date: new Date().toLocaleString('zh-CN', {
            hour12: false,
            timeZone: 'Asia/Shanghai'
        }),
        timestamp: Date.now(),
        originalTranscript: fullTranscript,
        imageSrc: imageElement ? imageElement.src : undefined // Save current image (Raw)
      };

      setMemories(prev => [newMemory, ...prev]);

      // Clear Session
      setChatHistory([]);
      setCurrentAIResponse("Memory preserved.");
      setTimeout(() => setCurrentAIResponse(null), 3000);

      // Navigate to Memory Hall to show result
      setActiveMode(ViewMode.MEMORY);

    } catch (e) {
      console.error("Archiving failed", e);
      setCurrentAIResponse("Failed to archive (Network Error)");
      setTimeout(() => setCurrentAIResponse(null), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#050505] text-[#e5e5e5] overflow-hidden selection:bg-white/20">

      {/* Navigation */}
      <Navigation
        activeMode={activeMode}
        onNavigate={setActiveMode}
        isMuted={isMuted}
        toggleMute={() => setIsMuted(!isMuted)}
        toggleMenu={() => setIsMenuOpen(!isMenuOpen)}
      />

      {/* Main Content Area */}
      <main className="w-full h-full relative flex">

        {/* LEFT SIDE (Or Full Screen): 3D Scene + Mini Player */}
        <div className={`relative h-full transition-all duration-700 ease-in-out z-0
          ${activeMode === ViewMode.MUSIC ? 'w-1/2 border-r border-white/5' : 'w-full'}`}
        >
          <div className={`absolute inset-0 transition-opacity duration-1000 ${activeMode === ViewMode.MEMORY ? 'opacity-20' : 'opacity-100'}`}>
            <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
              <ambientLight intensity={0.8} />
              <pointLight position={[10, 10, 10]} intensity={0.5} />

              {imageElement ? (
                <ParticleImage
                  imageElement={imageElement}
                  config={particleConfig}
                />
              ) : null}

              <OrbitControls
                enableZoom={true}
                enablePan={false}
                autoRotate={!imageElement}
                autoRotateSpeed={0.5}
                maxDistance={50}
                minDistance={2}
              />
            </Canvas>
          </div>

          {/* THE GARDEN Overlay - Updated to allow pointer events through to canvas */}
          <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 pointer-events-none ${activeMode === ViewMode.THE_GARDEN ? 'opacity-100' : 'opacity-0'}`}>
              {/* Upload Initial State */}
              {!imageElement && (
                <div className="z-10 flex flex-col items-center gap-8 animate-fade-in pointer-events-auto">
                  <h1 className="text-4xl md:text-7xl font-serif tracking-[0.15em] font-light text-center opacity-90 leading-tight">
                    GARDEN OF <br/> MEMORY
                  </h1>
                  <p className="text-xs md:text-sm tracking-[0.3em] text-gray-500 font-sans uppercase">
                    Upload an image to awaken the particles
                  </p>
                  <label className="group cursor-pointer flex flex-col items-center justify-center w-24 h-24 md:w-32 md:h-32 border border-white/10 rounded-full hover:border-white/40 hover:scale-105 transition-all duration-700 backdrop-blur-sm bg-white/5 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                    <Upload className="w-6 h-6 md:w-8 md:h-8 text-gray-400 group-hover:text-white transition-colors duration-500" strokeWidth={1} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
              )}

              {imageElement && (
                <ChatInterface
                    onSendMessage={generateAIResponse}
                    onEndSession={endSessionAndArchive}
                    currentResponse={currentAIResponse}
                    isProcessing={isProcessing}
                    selectedPhilosopher={philosopher}
                    onSelectPhilosopher={setPhilosopher}
                    active={activeMode === ViewMode.THE_GARDEN}
                    hasHistory={chatHistory.length > 0}
                />
              )}
          </div>

          {/* Controls - visible in Garden Mode (Pointer events managed internally) */}
          <div className={`transition-opacity duration-500 ${activeMode === ViewMode.THE_GARDEN && imageElement ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
             <ControlPanel
                  config={particleConfig}
                  setConfig={setParticleConfig}
                  isVisible={true}
             />
          </div>

          {/* Mini Player - Always Mounted, visible in Garden and Music Mode (left side) */}
          {hasTracks && currentTrack && (
            <div className={`transition-opacity duration-500 pointer-events-none ${(activeMode === ViewMode.THE_GARDEN || activeMode === ViewMode.MUSIC) ? 'opacity-100' : 'opacity-0'}`}>
               <div className="pointer-events-auto">
                   <MusicPlayer
                   onAudioElementReady={handleAudioElementReady}
                   shouldAutoPlay={!!imageElement}
                   isMuted={isMuted}
                   currentTrack={currentTrack}
                   isPlaying={isPlaying}
                   onPlayPause={() => setIsPlaying(!isPlaying)}
                      onNext={nextTrack}
                      onPrev={prevTrack}
                      onError={handleTrackError}
                   />
               </div>
            </div>
          )}

        </div>

        {/* RIGHT SIDE: Music Library (Only in Music Mode) */}
        <div className={`fixed right-0 top-0 bottom-0 bg-[#050505] transition-transform duration-700 ease-in-out z-10
            ${activeMode === ViewMode.MUSIC ? 'translate-x-0 w-1/2' : 'translate-x-full w-1/2'}`}
        >
             <MusicLibrary
                tracks={tracks}
                currentTrackIndex={currentTrackIndex}
                isPlaying={isPlaying}
                onPlayPause={() => setIsPlaying(!isPlaying)}
                onSelectTrack={(idx) => { setCurrentTrackIndex(idx); setIsPlaying(true); }}
                onUpload={handleMusicUpload}
                playbackMode={playbackMode}
                setPlaybackMode={setPlaybackMode}
                isVisible={activeMode === ViewMode.MUSIC}
             />
        </div>

        {/* --- VIEW MODE: MEMORY --- */}
        <MemoryHall
           memories={memories}
           isVisible={activeMode === ViewMode.MEMORY}
           onClose={() => setActiveMode(ViewMode.THE_GARDEN)}
        />

        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.03]">
          <div className="absolute left-10 top-0 bottom-0 w-[1px] bg-white"></div>
          <div className="absolute right-10 top-0 bottom-0 w-[1px] bg-white"></div>
          <div className="absolute top-24 left-0 right-0 h-[1px] bg-white"></div>
          <div className="absolute bottom-24 left-0 right-0 h-[1px] bg-white"></div>
        </div>

      </main>

      {/* Side Menu */}
      <div className={`fixed inset-y-0 right-0 w-80 bg-[#0a0a0a] z-50 transform transition-transform duration-700 cubic-bezier(0.22, 1, 0.36, 1) border-l border-white/5 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-12 h-full flex flex-col relative">
           <button onClick={() => setIsMenuOpen(false)} className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors font-serif italic">Close</button>

           <div className="mt-12 mb-12">
             <h2 className="text-2xl font-serif text-white mb-2">Jinyao</h2>
             <p className="text-xs text-gray-500 tracking-widest uppercase">Philosopher's Garden</p>
           </div>

           <ul className="flex flex-col gap-8 font-light tracking-[0.2em] text-xs text-gray-400">
             <li onClick={() => { setActiveMode(ViewMode.THE_GARDEN); setIsMenuOpen(false); }} className="hover:text-white cursor-pointer hover:translate-x-2 transition-all duration-300">GARDEN</li>
             <li onClick={() => { setActiveMode(ViewMode.MEMORY); setIsMenuOpen(false); }} className="hover:text-white cursor-pointer hover:translate-x-2 transition-all duration-300">MEMORY HALL</li>
              <li onClick={() => { setActiveMode(ViewMode.MUSIC); setIsMenuOpen(false); }} className="hover:text-white cursor-pointer hover:translate-x-2 transition-all duration-300">MUSIC</li>
             <li className="hover:text-white cursor-pointer hover:translate-x-2 transition-all duration-300">PROFILE</li>
           </ul>
        </div>
      </div>

      {/* Overlay backdrop for menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity duration-500"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

    </div>
  );
};

export default App;
