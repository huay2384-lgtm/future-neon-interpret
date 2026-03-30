/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  GoogleGenAI, 
  LiveServerMessage, 
  Modality 
} from "@google/genai";
import { 
  Home, 
  Settings, 
  Mic, 
  Settings2, 
  Bell, 
  User, 
  ChevronDown, 
  Layers, 
  Brain, 
  Languages, 
  Keyboard, 
  Zap, 
  Pause, 
  Play, 
  Filter, 
  RefreshCw,
  MoreHorizontal,
  PlusCircle,
  Volume2,
  FastForward,
  Music,
  Radio,
  Smile,
  Check,
  ArrowLeftRight,
  Terminal,
  Key,
  AtSign,
  Bolt,
  AudioLines,
  Sparkles,
  Trash2,
  AlertCircle,
  Copy,
  Clock,
  Activity,
  Download,
  PlayCircle,
  PauseCircle,
  Info,
  History,
  Waves,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { signUp, signIn, signOut, getHistory, saveHistory, deleteHistory } from './lib/api';

// --- Types ---
type View = 'home' | 'services' | 'synthesis' | 'settings' | 'login';

// --- Components ---

const Layout = ({ children, currentView, setView, user, onLogout }: { children: React.ReactNode, currentView: View, setView: (v: View) => void, user: any, onLogout: () => void }) => {
  return (
    <div className="min-h-screen bg-background text-on-surface font-body relative overflow-x-hidden">
      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 retro-grid opacity-30" />
        <div className="absolute inset-0 scanline opacity-10" />
        <div className="absolute top-24 right-[-5%] opacity-10 rotate-12 scale-150 select-none">
          <div className="text-[200px] font-black font-headline text-primary/20">未来</div>
        </div>
      </div>

      {/* Top App Bar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-background/80 backdrop-blur-xl border-b border-outline-variant/20">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black text-primary drop-shadow-[0_0_10px_#ff83d1] font-headline uppercase tracking-widest">
            未来 NEON INTERPRET
          </span>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="font-headline text-[10px] text-primary uppercase tracking-widest">{user.name}</span>
            </div>
          )}
          <button className="text-tertiary hover:text-primary transition-all duration-300">
            <Bell size={20} />
          </button>
          <button 
            className="text-tertiary hover:text-primary transition-all duration-300 flex items-center gap-2" 
            onClick={() => user ? onLogout() : setView('login')}
          >
            {user ? <LogOut size={20} /> : <User size={20} />}
          </button>
        </div>
        <div className="absolute bottom-0 left-0 bg-gradient-to-r from-transparent via-secondary/20 to-transparent h-[1px] w-full" />
      </header>

      {/* Main Content */}
      <main className="relative z-10 pt-24 pb-32 px-6 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full z-50 bg-background/90 backdrop-blur-md border-t border-outline-variant/20">
        <div className="bg-gradient-to-r from-transparent via-primary to-transparent h-[2px] w-full" />
        <div className="flex justify-around items-center px-4 pb-6 pt-2 h-20">
          <NavItem 
            icon={<Home size={24} />} 
            label="首页" 
            active={currentView === 'home'} 
            onClick={() => setView('home')} 
          />
          <NavItem 
            icon={<Settings2 size={24} />} 
            label="服务管理" 
            active={currentView === 'services'} 
            onClick={() => setView('services')} 
          />
          <NavItem 
            icon={<Mic size={24} />} 
            label="语音合成" 
            active={currentView === 'synthesis'} 
            onClick={() => setView('synthesis')} 
          />
          <NavItem 
            icon={<Settings size={24} />} 
            label="设置" 
            active={currentView === 'settings'} 
            onClick={() => setView('settings')} 
          />
        </div>
      </nav>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center transition-all duration-300 px-4 py-2 rounded-lg",
      active 
        ? "text-primary drop-shadow-[0_0_12px_#ff83d1] scale-110" 
        : "text-tertiary/60 hover:text-tertiary hover:bg-primary/5"
    )}
  >
    <div className={cn(active && "animate-pulse")}>{icon}</div>
    <span className="font-headline text-[10px] tracking-tighter mt-1 uppercase">{label}</span>
  </button>
);

// --- Views ---

const HomeView = ({ 
  isTranslating, 
  toggleTranslation, 
  inputSource,
  audioDevices,
  audioStream,
  transcription,
  translation,
  sourceLanguage,
  targetLanguage,
  setSourceLanguage,
  setTargetLanguage,
  voiceModel,
  translationApi,
  voiceSpeed,
  masterVolume,
  recognitionMode,
  voicePersona,
  voiceTimbre,
  isSimultaneousMode,
  setIsSimultaneousMode,
  setTranscription,
  setTranslation,
  history,
  setHistory
}: { 
  isTranslating: boolean; 
  toggleTranslation: () => void; 
  inputSource: string;
  audioDevices: MediaDeviceInfo[];
  audioStream: MediaStream | null;
  transcription: string;
  translation: string;
  sourceLanguage: string;
  targetLanguage: string;
  setSourceLanguage: (l: string) => void;
  setTargetLanguage: (l: string) => void;
  voiceModel: string;
  translationApi: string;
  voiceSpeed: number;
  masterVolume: number;
  recognitionMode: 'auto' | 'manual';
  voicePersona: string;
  voiceTimbre: string;
  isSimultaneousMode: boolean;
  setIsSimultaneousMode: (b: boolean) => void;
  setTranscription: (s: string) => void;
  setTranslation: (s: string) => void;
  history: {id: string, text: string, type: 'input' | 'output', time: string}[];
  setHistory: React.Dispatch<React.SetStateAction<{id: string, text: string, type: 'input' | 'output', time: string}[]>>;
}) => {
  const [audioLevel, setAudioLevel] = useState(0);

  const activeDeviceLabel = inputSource === 'default' 
    ? '系统默认麦克风' 
    : audioDevices.find(d => d.deviceId === inputSource)?.label || '未知设备';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast here
  };

  useEffect(() => {
    if (!isTranslating || !audioStream) {
      setAudioLevel(0);
      return;
    }

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(audioStream);
    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 256;
    source.connect(analyzer);

    const dataArray = new Uint8Array(analyzer.frequencyBinCount);
    let animationFrame: number;

    const updateLevel = () => {
      analyzer.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(average / 128); // Normalized 0-1
      animationFrame = requestAnimationFrame(updateLevel);
    };

    updateLevel();

    return () => {
      cancelAnimationFrame(animationFrame);
      audioContext.close();
    };
  }, [isTranslating, audioStream]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-10 relative py-12">
      {/* Grouped Display Section - Neural Link Hub */}
      <div className="w-full max-w-3xl flex flex-col gap-2 relative group">
        {/* 1. Transcription Box (Input) */}
        <div className={cn(
          "relative z-20 bg-surface/30 backdrop-blur-xl border border-white/5 p-4 transition-all duration-700",
          isTranslating ? "border-primary/40 shadow-[0_0_30px_rgba(255,131,209,0.1)]" : "border-outline-variant/10"
        )}
        style={{
          boxShadow: isTranslating ? `0 0 ${20 + audioLevel * 40}px rgba(255, 131, 209, ${0.05 + audioLevel * 0.1})` : undefined,
          borderColor: isTranslating ? `rgba(255, 131, 209, ${0.2 + audioLevel * 0.4})` : undefined
        }}
        >
          {/* Decorative Corner Accents */}
          <div className="absolute top-0 left-0 w-8 h-[1px] bg-primary/30" />
          <div className="absolute top-0 left-0 w-[1px] h-8 bg-primary/30" />
          
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full",
                isTranslating ? "bg-primary animate-pulse shadow-[0_0_8px_#ff83d1]" : "bg-outline/30"
              )} />
              <span className="font-headline text-[9px] tracking-[0.4em] uppercase text-on-surface-variant">
                音频输入流 / AUDIO INPUT STREAM: <span className="text-primary">{activeDeviceLabel}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 px-2 py-0.5 bg-primary/10 border border-primary/20">
              <span className="font-mono text-[8px] text-primary uppercase">{sourceLanguage}</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-0.5 bg-secondary/10 border border-secondary/20 ml-2">
              <span className="font-mono text-[8px] text-secondary uppercase">{voiceModel}</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-0.5 bg-tertiary/10 border border-tertiary/20 ml-2">
              <span className="font-mono text-[8px] text-tertiary uppercase">{translationApi}</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-0.5 bg-primary/5 border border-primary/10 ml-2">
              <span className="font-mono text-[8px] text-on-surface-variant uppercase">SPD: {voiceSpeed.toFixed(2)}x</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-0.5 bg-secondary/5 border border-secondary/10 ml-2">
              <span className="font-mono text-[8px] text-on-surface-variant uppercase">VOL: {masterVolume}%</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-0.5 bg-tertiary/5 border border-tertiary/10 ml-2">
              <span className="font-mono text-[8px] text-on-surface-variant uppercase">MODE: {recognitionMode.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-0.5 bg-primary/5 border border-primary/10 ml-2">
              <span className="font-mono text-[8px] text-on-surface-variant uppercase">PER: {voicePersona.split(' / ')[0]}</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-0.5 bg-secondary/5 border border-secondary/10 ml-2">
              <span className="font-mono text-[8px] text-on-surface-variant uppercase">VOX: {voiceTimbre}</span>
            </div>
            <button 
              onClick={() => setIsSimultaneousMode(!isSimultaneousMode)}
              className={cn(
                "flex items-center gap-2 px-2 py-0.5 border ml-2 transition-all",
                isSimultaneousMode ? "bg-success/20 border-success text-success" : "bg-outline/10 border-outline/20 text-on-surface-variant"
              )}
            >
              <span className="font-mono text-[8px] uppercase">{isSimultaneousMode ? "SIMULTANEOUS_ON" : "CONSECUTIVE_MODE"}</span>
            </button>
          </div>

          <div className="min-h-[30px] relative group/box">
            <p className={cn(
              "text-xl font-headline font-light leading-relaxed transition-all duration-500 pr-12",
              isTranslating ? "text-on-surface" : "text-on-surface/30 italic"
            )}>
              {isTranslating ? (
                transcription || (sourceLanguage === '自动检测 (Auto Detect)' ? "正在检测语言..." : "正在监听...")
              ) : (
                "等待语音输入以开始实时转录..."
              )}
              {isTranslating && <motion.span 
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-1 h-5 ml-1 bg-primary align-middle" 
              />}
            </p>
            
            {/* Quick Actions */}
            <div className="absolute right-0 top-0 flex flex-col gap-2 opacity-0 group-hover/box:opacity-100 transition-opacity">
              <button 
                onClick={() => copyToClipboard(transcription)}
                className="p-1.5 bg-surface/50 border border-primary/20 text-primary hover:bg-primary/10 transition-colors"
                title="复制转录文本"
              >
                <Copy size={14} />
              </button>
              <button 
                onClick={() => setTranscription('')}
                className="p-1.5 bg-surface/50 border border-error/20 text-error hover:bg-error/10 transition-colors"
                title="清除转录"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Neural Link Connection - Visual Bridge */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[calc(50%-12px)] w-full h-24 pointer-events-none z-10">
          <div className={cn(
            "absolute left-1/2 -translate-x-1/2 w-[1px] h-full transition-all duration-1000",
            isTranslating ? "bg-gradient-to-b from-primary/60 via-success/60 to-success/60" : "bg-outline-variant/10"
          )} />
          {isTranslating && (
            <>
              <motion.div 
                animate={{ top: ["0%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute left-1/2 -translate-x-1/2 w-1 h-4 bg-success blur-[2px] shadow-[0_0_10px_#00ff66]"
              />
              {/* Data Particles flowing up */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={`particle-${i}`}
                  initial={{ bottom: "-20%", left: `${45 + Math.random() * 10}%`, opacity: 0 }}
                  animate={{ 
                    bottom: "120%", 
                    opacity: [0, 1, 0],
                    scale: [0.5, 1, 0.5]
                  }}
                  transition={{ 
                    duration: 1 + Math.random(), 
                    repeat: Infinity, 
                    delay: i * 0.4,
                    ease: "easeOut"
                  }}
                  className="absolute w-1 h-1 bg-primary rounded-full blur-[1px]"
                />
              ))}
            </>
          )}
        </div>

        {/* 2. Translation Result Box (Output) */}
        <div className={cn(
          "relative z-20 bg-surface/50 backdrop-blur-2xl border-2 p-4 transition-all duration-1000 overflow-hidden",
          isTranslating ? "border-success shadow-[0_0_80px_rgba(0,255,102,0.2)]" : "border-secondary/20 shadow-xl"
        )}>
          {/* Decorative Corner Accents */}
          <div className="absolute bottom-0 right-0 w-8 h-[1px] bg-success/30" />
          <div className="absolute bottom-0 right-0 w-[1px] h-8 bg-success/30" />
          
          {/* Futuristic Grid Overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
          
          {/* Scanning Line Animation */}
          {isTranslating && (
            <motion.div 
              initial={{ top: "-100%" }}
              animate={{ top: "200%" }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 w-full h-1/2 bg-gradient-to-b from-transparent via-success/10 to-transparent z-0"
            />
          )}

          <div className="relative z-10 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className={cn(
                  "transition-colors duration-500",
                  isTranslating ? "text-success animate-pulse" : "text-secondary/40"
                )} size={16} />
                <span className={cn(
                  "font-headline text-[10px] tracking-[0.5em] uppercase transition-colors duration-500",
                  isTranslating ? "text-success font-bold" : "text-on-surface-variant"
                )}>
                  翻译结果实时显示 / LIVE TRANSLATION RESULT
                </span>
              </div>
              <div className={cn(
                "px-3 py-0.5 border transition-all duration-500",
                isTranslating ? "bg-success/20 border-success text-success" : "bg-secondary/10 border-secondary/30 text-secondary"
              )}>
                <span className="font-mono text-[9px] font-black tracking-widest uppercase">{targetLanguage}</span>
              </div>
            </div>

            <div className="min-h-[40px] flex flex-col justify-center relative group/box">
              <p className={cn(
                "text-3xl font-headline font-bold leading-tight transition-all duration-1000 pr-16",
                isTranslating ? "text-on-surface drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" : "text-on-surface/20"
              )}>
                {isTranslating ? (
                  translation || "正在生成翻译..."
                ) : (
                  "翻译结果将实时显示在此处..."
                )}
              </p>

              {/* Quick Actions */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover/box:opacity-100 transition-opacity">
                <button 
                  onClick={() => copyToClipboard(translation)}
                  className="p-2 bg-surface/50 border border-success/20 text-success hover:bg-success/10 transition-colors"
                  title="复制翻译文本"
                >
                  <Copy size={16} />
                </button>
                <button 
                  onClick={() => setTranslation('')}
                  className="p-2 bg-surface/50 border border-error/20 text-error hover:bg-error/10 transition-colors"
                  title="清除翻译"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Status Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-outline-variant/10">
              <div className="flex gap-2">
                {[0, 1, 2].map(i => (
                  <div key={i} className={cn(
                    "w-6 h-1 transition-all duration-500",
                    isTranslating ? "bg-success" : "bg-outline-variant/30"
                  )} style={{ opacity: isTranslating ? 1 - i * 0.3 : 0.3 }} />
                ))}
              </div>
              <span className="font-mono text-[7px] text-on-surface-variant tracking-tighter uppercase">
                Latency: {isTranslating ? "124ms" : "---"} | Confidence: {isTranslating ? "98.4%" : "---"}
              </span>
            </div>
          </div>
        </div>

        {/* Visual Link to Button - Energy Conduit */}
        <div className={cn(
          "absolute left-1/2 -bottom-10 -translate-x-1/2 w-[1px] h-10 transition-all duration-1000",
          isTranslating ? "bg-gradient-to-b from-success/60 to-primary/60" : "bg-gradient-to-b from-success/30 to-transparent"
        )} />
        {isTranslating && (
          <motion.div 
            animate={{ height: ["0%", "100%"], opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-1/2 -bottom-10 -translate-x-1/2 w-[2px] bg-primary blur-[1px]"
          />
        )}
      </div>

      {/* 3. Central Interactive Circle */}
      <div className="relative flex items-center justify-center w-64 h-64 mt-4">
        {/* Atmospheric Energy Waves */}
        <AnimatePresence>
          {isTranslating && (
            <>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={`wave-${i}`}
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ 
                    scale: 1.2 + i * 0.3 + audioLevel * (0.5 + i * 0.2),
                    opacity: [0.4 - i * 0.1, 0.1, 0.4 - i * 0.1],
                    borderWidth: [`${1 + audioLevel * 2}px`, `${2 + audioLevel * 4}px`, `${1 + audioLevel * 2}px`],
                  }}
                  transition={{
                    duration: 2 + i,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 border rounded-full border-success/30 blur-[2px]"
                  style={{
                    boxShadow: `0 0 ${20 + audioLevel * 50}px rgba(0, 255, 102, ${0.1 + audioLevel * 0.2})`,
                  }}
                />
              ))}
              
              {/* Rapid Pulse Ripple */}
              <motion.div
                animate={{ 
                  scale: 1.1 + audioLevel * 0.4,
                  opacity: 0.2 + audioLevel * 0.5,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute inset-0 border-2 rounded-full border-success/50 shadow-[0_0_30px_rgba(0,255,102,0.3)]"
              />
            </>
          )}
        </AnimatePresence>

        {!isTranslating && (
          <>
            <div className="absolute w-full h-full border rounded-full border-primary/20 animate-[ping_4s_infinite_ease-out]" />
            <div className="absolute w-full h-full border rounded-full border-secondary/10 animate-[ping_4s_infinite_ease-out_1.3s]" />
          </>
        )}
        
        <div className="absolute inset-0 border border-dashed border-outline/10 rounded-full animate-[spin_30s_linear_infinite]" />
        <div className="absolute inset-8 border border-dashed border-outline/5 rounded-full animate-[spin_20s_linear_infinite_reverse]" />
        
        <motion.button 
          onClick={toggleTranslation}
          animate={isTranslating ? {
            scale: 1 + audioLevel * 0.05,
            boxShadow: `0 0 ${40 + audioLevel * 60}px rgba(0, 255, 102, ${0.3 + audioLevel * 0.4})`,
          } : {
            scale: 1,
            boxShadow: "0 0 40px rgba(255, 131, 209, 0.2)",
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "relative group z-10 w-56 h-56 rounded-full flex flex-col items-center justify-center border-2 transition-colors duration-500 overflow-hidden",
            isTranslating 
              ? "bg-surface-container/80 border-success" 
              : "bg-surface-container/80 border-primary"
          )}
        >
          {/* Background Glow */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-tr transition-opacity duration-500",
            isTranslating 
              ? "from-success/30 via-transparent to-success/20 opacity-100" 
              : "from-primary/20 via-transparent to-secondary/20 group-hover:opacity-100 opacity-0"
          )} />

          {/* Audio Visualizer Bars (Only visible when translating) */}
          {isTranslating && (
            <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-30 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-1 bg-success rounded-full"
                  style={{ 
                    height: `${20 + Math.random() * 40 * audioLevel}%`,
                    transition: 'height 0.1s ease-out'
                  }}
                />
              ))}
            </div>
          )}

          <Mic 
            className={cn(
              "mb-2 transition-all duration-500", 
              isTranslating ? "text-success scale-125 drop-shadow-[0_0_10px_#00ff66]" : "text-primary group-hover:scale-110"
            )} 
            style={{ 
              transform: isTranslating ? `scale(${1.25 + audioLevel * 0.5})` : undefined,
              filter: isTranslating ? `drop-shadow(0 0 ${10 + audioLevel * 20}px #00ff66)` : undefined
            }}
            size={48} 
          />
          
          <span className={cn(
            "font-headline font-bold text-xl tracking-widest uppercase transition-colors duration-500", 
            isTranslating ? "text-success" : "text-on-surface"
          )}>
            {isTranslating ? "停止翻译" : "开始翻译"}
          </span>
          
          <span className="font-headline text-[10px] text-on-surface-variant mt-1 tracking-[0.2em]">
            {isTranslating ? "STOP" : "START"}
          </span>
          
          {/* Active Indicator */}
          {isTranslating && (
            <div className="absolute bottom-4 flex items-center gap-1">
              <div className="w-1 h-1 bg-success rounded-full animate-ping" />
              <span className="text-[8px] font-mono text-success uppercase tracking-tighter">Live</span>
            </div>
          )}
        </motion.button>
        
        <div className="absolute -right-16 top-0 bg-surface/80 backdrop-blur px-3 py-1 border border-outline-variant/30 transform rotate-12">
          <span className="font-headline text-[10px] text-tertiary">延迟: {isTranslating ? "8ms" : "12ms"}</span>
        </div>
      </div>

      {/* Language Selection */}
      <div className="w-full max-w-xl bg-surface-container/90 border-2 border-primary/30 backdrop-blur-md p-6 flex flex-col gap-6 shadow-[0_0_40px_rgba(15,206,255,0.15)] mt-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Languages className="text-primary" size={16} />
            <span className="text-[10px] font-headline text-primary tracking-widest uppercase">语言选择 / SELECT LANGUAGE</span>
          </div>
          <div className="bg-primary/20 text-primary text-[8px] font-black px-2 py-0.5 tracking-tighter uppercase border border-primary/40">
            HD-Engine v4.2
          </div>
        </div>
        
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 space-y-1">
            <div className="text-[9px] font-headline text-on-surface-variant uppercase ml-1">源语言</div>
            <div className="relative">
              <select 
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
                className="w-full bg-surface border border-outline-variant/50 px-4 py-2 text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
              >
                <option value="自动检测 (Auto Detect)">自动检测 (Auto Detect)</option>
                <option value="中文 (Chinese)">中文 (Chinese)</option>
                <option value="英语 (English)">英语 (English)</option>
                <option value="日语 (Japanese)">日语 (Japanese)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none" size={16} />
            </div>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9, rotate: 180 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            onClick={() => {
              const temp = sourceLanguage;
              setSourceLanguage(targetLanguage);
              setTargetLanguage(temp);
            }}
            className="mt-4 w-12 h-12 rounded-xl flex items-center justify-center bg-surface border-2 border-primary/40 text-primary shadow-[0_0_15px_rgba(255,131,209,0.2)] hover:border-primary hover:shadow-[0_0_25px_rgba(255,131,209,0.4)] transition-all group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <ArrowLeftRight size={22} className="relative z-10" />
            
            {/* Decorative scan line */}
            <motion.div 
              animate={{ top: ["-100%", "200%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 w-full h-1 bg-primary/20 blur-[1px] pointer-events-none"
            />
          </motion.button>
          
          <div className="flex-1 space-y-1">
            <div className="text-[9px] font-headline text-on-surface-variant uppercase ml-1">目标语言</div>
            <div className="relative">
              <select 
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="w-full bg-surface border border-outline-variant/50 px-4 py-2 text-sm text-secondary focus:border-secondary focus:ring-1 focus:ring-secondary appearance-none cursor-pointer"
              >
                <option value="英语 (English)">英语 (English)</option>
                <option value="中文 (Chinese)">中文 (Chinese)</option>
                <option value="日语 (Japanese)">日语 (Japanese)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Recent Activity Log */}
      {history.length > 0 && (
        <div className="w-full max-w-xl flex flex-col gap-3">
          <div className="flex items-center gap-2 px-1">
            <Clock size={12} className="text-on-surface-variant" />
            <span className="text-[9px] font-headline text-on-surface-variant uppercase tracking-widest">最近活动 / RECENT ACTIVITY</span>
          </div>
          <div className="space-y-2">
            {history.map((item) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-surface/20 border-l-2 border-success/30 p-3 flex justify-between items-center group"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-[7px] font-mono text-on-surface-variant uppercase">{item.time}</span>
                  <p className="text-xs text-on-surface/80 line-clamp-1">{item.text}</p>
                </div>
                <button 
                  onClick={() => copyToClipboard(item.text)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-success transition-all"
                >
                  <Copy size={12} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ServiceManagementView = ({ 
  inputSource, 
  setInputSource,
  outputSource,
  setOutputSource,
  audioDevices,
  outputDevices,
  refreshDevices,
  isFetchingDevices,
  translationApi,
  setTranslationApi,
  isTranslating,
  toggleTranslation,
  speechLogs,
  setSpeechLogs,
  modelPrecision,
  voiceModel,
  voiceSpeed,
  masterVolume,
  recognitionMode,
  voicePersona,
  voiceTimbre,
  history,
  setHistory
}: { 
  inputSource: string; 
  setInputSource: (s: string) => void;
  outputSource: string;
  setOutputSource: (s: string) => void;
  audioDevices: MediaDeviceInfo[];
  outputDevices: MediaDeviceInfo[];
  refreshDevices: () => void;
  isFetchingDevices: boolean;
  translationApi: string;
  setTranslationApi: (s: string) => void;
  isTranslating: boolean;
  toggleTranslation: () => void;
  speechLogs: { id: number; time: string; text: string }[];
  setSpeechLogs: React.Dispatch<React.SetStateAction<{ id: number; time: string; text: string }[]>>;
  modelPrecision: string;
  voiceModel: string;
  voiceSpeed: number;
  masterVolume: number;
  recognitionMode: 'auto' | 'manual';
  voicePersona: string;
  voiceTimbre: string;
  history: {id: string, text: string, type: 'input' | 'output', time: string}[];
  setHistory: React.Dispatch<React.SetStateAction<{id: string, text: string, type: 'input' | 'output', time: string}[]>>;
}) => {
  const [activeTab, setActiveTab] = useState<'speech' | 'translation' | 'logs'>('speech');
  
  // Extract precision code from label (e.g., "FP16 (高音质模式)" -> "FP16")
  const precisionCode = modelPrecision.split(' ')[0];

  const [engineSpecs, setEngineSpecs] = useState([
    { label: "延迟", value: "85ms" },
    { label: "吞吐量", value: "12.4k tokens/sec" },
    { label: "语音核心", value: voiceModel },
    { label: "语速", value: `${voiceSpeed.toFixed(2)}x` },
    { label: "识别模式", value: recognitionMode === 'auto' ? "自动 (Auto)" : "手动 (Manual)" },
    { label: "语音角色", value: voicePersona },
    { label: "语音音色", value: voiceTimbre },
    { label: "翻译接口", value: translationApi },
    { label: "精度", value: precisionCode }
  ]);

  // Update engine specs when modelPrecision, voiceModel, voiceSpeed, recognitionMode, voicePersona, voiceTimbre or translationApi changes
  useEffect(() => {
    setEngineSpecs(prev => prev.map(spec => {
      if (spec.label === "精度") return { ...spec, value: precisionCode };
      if (spec.label === "语音核心") return { ...spec, value: voiceModel };
      if (spec.label === "语速") return { ...spec, value: `${voiceSpeed.toFixed(2)}x` };
      if (spec.label === "识别模式") return { ...spec, value: recognitionMode === 'auto' ? "自动 (Auto)" : "手动 (Manual)" };
      if (spec.label === "语音角色") return { ...spec, value: voicePersona };
      if (spec.label === "语音音色") return { ...spec, value: voiceTimbre };
      if (spec.label === "翻译接口") return { ...spec, value: translationApi };
      return spec;
    }));
  }, [precisionCode, voiceModel, voiceSpeed, recognitionMode, voicePersona, voiceTimbre, translationApi]);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const handleResetBuffer = () => {
    setSpeechLogs([]);
    setHistory([]);
  };

  const handleTestConnection = () => {
    if (isTestingConnection) return;
    setIsTestingConnection(true);
    
    // Simulate testing process
    setTimeout(() => {
      const newSpecs = [
        { label: "延迟", value: `${Math.floor(Math.random() * 40) + 60}ms` },
        { label: "吞吐量", value: `${(Math.random() * 3 + 11).toFixed(1)}k tokens/sec` },
        { label: "语音核心", value: voiceModel },
        { label: "语速", value: `${voiceSpeed.toFixed(2)}x` },
        { label: "识别模式", value: recognitionMode === 'auto' ? "自动 (Auto)" : "手动 (Manual)" },
        { label: "语音角色", value: voicePersona },
        { label: "语音音色", value: voiceTimbre },
        { label: "翻译接口", value: translationApi },
        { label: "精度", value: precisionCode }
      ];
      setEngineSpecs(newSpecs);
      setIsTestingConnection(false);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-end gap-4 mb-8">
        <h1 className="font-headline text-5xl font-bold italic tracking-tighter uppercase glitch-text">
          Service Management <span className="text-secondary font-light text-2xl not-italic tracking-normal">服务管理</span>
        </h1>
        <div className="h-1 flex-grow bg-gradient-to-r from-primary/50 to-transparent mb-3" />
      </div>

      <div className="bg-surface-container/60 backdrop-blur-md border border-outline-variant/30 flex flex-col overflow-hidden">
        <div className="flex border-b border-outline-variant/20 bg-surface-container-high/40">
          <button 
            onClick={() => setActiveTab('speech')}
            className={cn(
              "px-8 py-4 font-headline text-xs tracking-widest border-b-2 transition-all",
              activeTab === 'speech' ? "border-primary text-primary bg-primary/5" : "border-transparent text-on-surface-variant hover:text-primary"
            )}
          >
            语音识别 <br/> <span className="text-[10px] opacity-70">语音识别</span>
          </button>
          <button 
            onClick={() => setActiveTab('translation')}
            className={cn(
              "px-8 py-4 font-headline text-xs tracking-widest border-b-2 transition-all",
              activeTab === 'translation' ? "border-secondary text-secondary bg-secondary/5" : "border-transparent text-on-surface-variant hover:text-secondary"
            )}
          >
            翻译服务 <br/> <span className="text-[10px] opacity-70">翻译服务</span>
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            className={cn(
              "px-8 py-4 font-headline text-xs tracking-widest border-b-2 transition-all",
              activeTab === 'logs' ? "border-tertiary text-tertiary bg-tertiary/5" : "border-transparent text-on-surface-variant hover:text-tertiary"
            )}
          >
            应用日志 <br/> <span className="text-[10px] opacity-70">应用日志</span>
          </button>
        </div>

        <div className="p-10">
          {activeTab === 'speech' && (
            <div className="flex flex-col md:flex-row gap-12">
              <div className="w-full md:w-1/3 space-y-8">
                <div className="bg-surface-container-high/40 p-6 border-l-4 border-secondary">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-headline text-xs uppercase tracking-tighter opacity-70">系统状态</span>
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        {isTranslating && (
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                        )}
                        <span className={cn(
                          "relative inline-flex rounded-full h-3 w-3",
                          isTranslating ? "bg-secondary" : "bg-outline"
                        )} />
                      </span>
                      <span className={cn(
                        "text-sm font-bold tracking-widest uppercase",
                        isTranslating ? "text-secondary" : "text-on-surface-variant"
                      )}>
                        {isTranslating ? "活跃" : "已停止"}
                      </span>
                    </div>
                  </div>
                  <div className="text-3xl font-headline font-bold mb-2">引擎_V4.2</div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">连接稳定。神经处理延迟：14ms。</p>
                  
                  <div className="pt-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-headline uppercase tracking-widest text-on-surface-variant">API 状态</span>
                      <span className="text-[10px] font-headline font-bold text-success uppercase">已连接</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-headline uppercase tracking-widest text-on-surface-variant">神经负载</span>
                      <div className="w-24 h-1 bg-surface-container-highest rounded-full overflow-hidden">
                        <motion.div 
                          animate={{ width: ["15%", "35%", "25%"] }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="h-full bg-primary" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <label className="font-headline text-[10px] uppercase tracking-widest text-on-surface-variant block">当前输入源 / Input Source</label>
                    <button 
                      onClick={refreshDevices}
                      disabled={isFetchingDevices}
                      className="text-[10px] font-headline text-secondary hover:underline flex items-center gap-1 disabled:opacity-50"
                    >
                      <RefreshCw size={10} className={cn(isFetchingDevices && "animate-spin")} />
                      刷新设备
                    </button>
                  </div>
                  <div className="relative">
                    <select 
                      value={inputSource}
                      onChange={(e) => setInputSource(e.target.value)}
                      className="w-full bg-surface-container-highest border border-outline-variant/30 text-on-surface py-3 px-4 focus:ring-1 focus:ring-secondary appearance-none font-body text-xs"
                    >
                      <option value="default">默认麦克风 (Default)</option>
                      {audioDevices.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `麦克风 ${device.deviceId.slice(0, 5)}...`}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" size={16} />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="font-headline text-[10px] uppercase tracking-widest text-on-surface-variant block">当前输出源 / Output Source</label>
                  <div className="relative">
                    <select 
                      value={outputSource}
                      onChange={(e) => setOutputSource(e.target.value)}
                      className="w-full bg-surface-container-highest border border-outline-variant/30 text-on-surface py-3 px-4 focus:ring-1 focus:ring-secondary appearance-none font-body text-xs"
                    >
                      <option value="default">默认输出 (Default)</option>
                      {outputDevices.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `扬声器 ${device.deviceId.slice(0, 5)}...`}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" size={16} />
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <button 
                    onClick={toggleTranslation}
                    className={cn(
                      "w-full py-5 font-headline font-black text-xl tracking-widest uppercase flex items-center justify-center gap-3 transition-all",
                      isTranslating 
                        ? "bg-primary text-on-primary hover:shadow-[0_0_20px_#ff83d1]" 
                        : "bg-surface-container-highest text-on-surface border border-outline hover:bg-surface-variant"
                    )}
                  >
                    {isTranslating ? (
                      <>
                        <Pause size={24} fill="currentColor" />
                        暂停会话
                      </>
                    ) : (
                      <>
                        <Play size={24} fill="currentColor" />
                        恢复会话
                      </>
                    )}
                  </button>
                  <button 
                    onClick={handleResetBuffer}
                    className="w-full py-4 border border-outline text-on-surface font-headline text-sm tracking-widest uppercase hover:bg-surface-variant transition-colors"
                  >
                    重置缓冲区
                  </button>
                </div>

                <div className="pt-8 border-t border-outline-variant/30 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] font-headline text-on-surface-variant">已处理词数</div>
                    <div className="text-xl font-headline text-tertiary">12,408</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-headline text-on-surface-variant">准确率</div>
                    <div className="text-xl font-headline text-secondary">98.4%</div>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-2/3 space-y-4">
                <div className="flex items-center justify-between mb-2 px-2">
                  <span className="font-headline text-xs uppercase tracking-widest text-on-surface-variant">实时转录流</span>
                  <Filter size={16} className="text-outline cursor-pointer hover:text-primary transition-colors" />
                </div>
                <div className="space-y-4 h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                  {speechLogs.length > 0 ? (
                    speechLogs.map(log => (
                      <div key={log.id} className="bg-surface-container-high/40 p-5 hover:bg-surface-container-high transition-colors border border-transparent hover:border-primary/20">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[10px] font-headline bg-secondary/10 text-secondary px-2 py-0.5 tracking-tighter uppercase">语音记录 #{log.id}</span>
                          <span className="text-[10px] font-mono text-on-surface-variant">{log.time}</span>
                        </div>
                        <p className="text-sm leading-relaxed text-on-surface italic">"{log.text}"</p>
                        <div className="mt-4 flex gap-4 text-[10px] font-headline uppercase text-tertiary">
                          <button 
                            onClick={() => {
                              // Simulate export
                              console.log("Exporting:", log.text);
                            }}
                            className="hover:underline"
                          >
                            导出原始数据
                          </button>
                          <button 
                            onClick={() => navigator.clipboard.writeText(log.text)}
                            className="hover:underline"
                          >
                            复制文本
                          </button>
                          <button 
                            onClick={() => setSpeechLogs(prev => prev.filter(l => l.id !== log.id))}
                            className="hover:underline text-error/70"
                          >
                            清除记录
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-on-surface-variant opacity-50 space-y-4">
                      <RefreshCw size={48} className="animate-spin-slow" />
                      <p className="font-headline text-xs uppercase tracking-widest">缓冲区已清空</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'translation' && (
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-secondary/20 flex items-center justify-center rounded-lg">
                      <Languages className="text-secondary" size={24} />
                    </div>
                    <div>
                      <h3 className="font-headline text-xl font-bold uppercase tracking-widest">翻译引擎</h3>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">选择您的神经处理核心</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="font-headline text-xs uppercase tracking-widest text-on-surface-variant block">活跃翻译接口</label>
                    <div className="relative">
                      <select 
                        value={translationApi}
                        onChange={(e) => setTranslationApi(e.target.value)}
                        className="w-full bg-surface-container-highest border-2 border-secondary/30 text-on-surface py-5 px-8 focus:ring-2 focus:ring-secondary appearance-none font-headline font-bold tracking-widest uppercase transition-all"
                      >
                        <option value="Gemini Live API">Gemini Live API (实时翻译)</option>
                        <option value="LOCAL ENGINE">LOCAL ENGINE (本地离线)</option>
                        <option value="OpenAI GPT-4o">OpenAI GPT-4o (Translation)</option>
                        <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
                        <option value="DeepL Pro">DeepL Pro</option>
                        <option value="Google Translate">Google Translate</option>
                        <option value="Baidu Fanyi">Baidu Fanyi (百度翻译)</option>
                        <option value="Youdao">Youdao (有道翻译)</option>
                        <option value="Tencent Transmart">Tencent Transmart</option>
                      </select>
                      <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" size={24} />
                    </div>
                    <p className="text-[10px] text-secondary italic mt-2">
                      {translationApi === 'Gemini Live API' 
                        ? "当前已连接到 Gemini Live API，支持超低延迟实时语音翻译。" 
                        : `当前已选择 ${translationApi}，将在接收到语音时进行实时查找。`}
                    </p>
                  </div>

                  <div className="pt-8 border-t border-outline-variant/20 space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-headline uppercase tracking-widest text-on-surface-variant">API 状态</span>
                      <span className="text-xs font-headline font-bold text-success uppercase">已连接</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-headline uppercase tracking-widest text-on-surface-variant">神经负载</span>
                      <div className="w-32 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                        <motion.div 
                          animate={{ width: ["20%", "45%", "30%"] }}
                          transition={{ duration: 4, repeat: Infinity }}
                          className="h-full bg-secondary" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-highest/30 border border-secondary/20 p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 font-headline text-8xl pointer-events-none select-none">接口</div>
                  <h4 className="font-headline text-sm font-bold uppercase tracking-widest mb-6 text-secondary">引擎规格</h4>
                  <div className="space-y-4">
                    {engineSpecs.map((spec, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-outline-variant/10">
                        <span className="text-[10px] font-headline uppercase text-on-surface-variant">{spec.label}</span>
                        <div className="flex items-center gap-2">
                          {isTestingConnection && (spec.label === "延迟" || spec.label === "吞吐量") && (
                            <motion.div 
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 0.5, repeat: Infinity }}
                              className="w-1.5 h-1.5 rounded-full bg-secondary"
                            />
                          )}
                          <span className={cn(
                            "text-xs font-mono font-bold transition-all",
                            isTestingConnection && (spec.label === "延迟" || spec.label === "吞吐量") ? "text-secondary" : "text-on-surface"
                          )}>
                            {isTestingConnection && (spec.label === "延迟" || spec.label === "吞吐量") ? "计算中..." : spec.value}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={handleTestConnection}
                    disabled={isTestingConnection}
                    className={cn(
                      "mt-8 w-full py-3 border font-headline text-[10px] font-bold uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2",
                      isTestingConnection 
                        ? "border-outline text-outline cursor-not-allowed" 
                        : "border-secondary text-secondary hover:bg-secondary hover:text-on-secondary"
                    )}
                  >
                    {isTestingConnection ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        正在测试
                      </>
                    ) : (
                      "测试连接"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-headline text-xl font-bold uppercase tracking-widest text-tertiary">系统活动日志</h3>
                <button 
                  onClick={handleResetBuffer}
                  className="text-[10px] font-headline uppercase text-tertiary hover:underline flex items-center gap-2"
                >
                  <Trash2 size={12} />
                  清除所有日志
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-2">
                    <Mic size={14} className="text-secondary" />
                    <span className="text-[10px] font-headline uppercase tracking-widest text-on-surface-variant">语音识别日志 (Speech Logs)</span>
                  </div>
                  <div className="space-y-2 font-mono text-[11px] text-tertiary/80 bg-black/20 p-6 rounded border border-tertiary/10 h-[400px] overflow-y-auto custom-scrollbar">
                    {speechLogs.length > 0 ? speechLogs.map((log, i) => (
                      <div key={i} className="py-1 border-b border-tertiary/5 group flex justify-between items-center">
                        <div>
                          <span className="opacity-50">[{log.time}]</span> <span className="text-tertiary font-bold">SPEECH:</span> {log.text}
                        </div>
                        <button 
                          onClick={() => navigator.clipboard.writeText(log.text)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-primary"
                        >
                          <Copy size={10} />
                        </button>
                      </div>
                    )) : (
                      <div className="h-full flex items-center justify-center opacity-30 italic">无语音记录</div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-2">
                    <Languages size={14} className="text-primary" />
                    <span className="text-[10px] font-headline uppercase tracking-widest text-on-surface-variant">翻译历史日志 (Translation History)</span>
                  </div>
                  <div className="space-y-2 font-mono text-[11px] text-primary/80 bg-black/20 p-6 rounded border border-primary/10 h-[400px] overflow-y-auto custom-scrollbar">
                    {history.length > 0 ? history.map((log, i) => (
                      <div key={i} className="py-1 border-b border-primary/5 group flex justify-between items-center">
                        <div>
                          <span className="opacity-50">[{log.time}]</span> <span className="text-primary font-bold">TRANS:</span> {log.text}
                        </div>
                        <button 
                          onClick={() => navigator.clipboard.writeText(log.text)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-secondary"
                        >
                          <Copy size={10} />
                        </button>
                      </div>
                    )) : (
                      <div className="h-full flex items-center justify-center opacity-30 italic">无翻译记录</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-outline-variant/10">
                <div className="flex items-center gap-2 mb-4">
                  <Activity size={14} className="text-success" />
                  <span className="text-[10px] font-headline uppercase tracking-widest text-on-surface-variant">系统事件 (System Events)</span>
                </div>
                <div className="space-y-1 font-mono text-[10px] text-on-surface-variant/60">
                  <div className="py-1"><span className="opacity-50">[14:23:10 UTC]</span> <span className="text-success font-bold">SUCCESS:</span> 神经链接已建立，使用 {translationApi}</div>
                  <div className="py-1"><span className="opacity-50">[14:23:12 UTC]</span> <span className="text-primary font-bold">WAITING:</span> 正在监听传入的音频流...</div>
                  <div className="py-1"><span className="opacity-50">[14:25:01 UTC]</span> <span className="text-secondary font-bold">INFO:</span> 引擎规格已更新，延迟优化中。</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SpeechSynthesisView = ({ 
  outputSource, 
  voiceSpeed, 
  masterVolume,
  synthesisHistory,
  setSynthesisHistory
}: { 
  outputSource: string;
  voiceSpeed: number;
  masterVolume: number;
  synthesisHistory: {id: string, text: string, voiceId: string, time: string, audioUrl: string}[];
  setSynthesisHistory: React.Dispatch<React.SetStateAction<{id: string, text: string, voiceId: string, time: string, audioUrl: string}[]>>;
}) => {
  const [voices, setVoices] = useState([
    { id: 'NEON_A01', name: 'Neon Alpha', type: 'Female / Mature', style: 'Futuristic', status: 'READY', active: true, icon: <Mic size={20} />, volume: 100, speed: 50, pitch: 50 },
    { id: 'CYBER_KIND', name: 'Cyber Kind', type: 'Male / Gentle', style: 'Warm', status: 'IDLE', active: false, icon: <Settings2 size={20} />, volume: 100, speed: 50, pitch: 50 },
    { id: 'USER_MYSELF', name: 'My Voice', type: 'Personal / Cloned', style: 'Natural', status: 'IDLE', active: false, icon: <User size={20} />, volume: 100, speed: 50, pitch: 50 },
    { id: 'SYNTH_V1', name: 'Synth V1', type: 'Artificial / Lo-Fi', style: 'Robotic', status: 'IDLE', active: false, icon: <Music size={20} />, volume: 100, speed: 50, pitch: 50 },
    { id: 'RADIO_WAVE', name: 'Radio Wave', type: 'Vintage / Distorted', style: 'Retro', status: 'IDLE', active: false, icon: <Radio size={20} />, volume: 100, speed: 50, pitch: 50 },
  ]);

  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [isRecordingSample, setIsRecordingSample] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [cloningStatus, setCloningStatus] = useState<string | null>(null);
  const [cloningProgress, setCloningProgress] = useState(0);
  const [cloningTimeRemaining, setCloningTimeRemaining] = useState<number | null>(null);
  const [cloningStage, setCloningStage] = useState<'UPLOAD' | 'PROCESSING' | 'RECONSTRUCTION' | 'OPTIMIZATION' | null>(null);

  const sampleText = "在数字前沿的边缘，我们不仅是在合成声音，我们是在重建人类表达的灵魂。每一个音节，每一个停顿，都是通往未来沟通的桥梁。";

  useEffect(() => {
    let interval: any;
    if (isRecordingSample) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecordingSample]);

  const activeVoice = voices.find(v => v.active) || voices[0];

  const updateActiveVoice = (updates: Partial<typeof voices[0]>) => {
    setVoices(prev => prev.map(v => v.active ? { ...v, ...updates } : v));
  };

  const handleVoiceSelect = (id: string) => {
    setVoices(prev => prev.map(v => ({ ...v, active: v.id === id })));
  };

  const handleGenerateSpeech = async () => {
    if (!inputText.trim() || isGenerating) return;
    
    setIsGenerating(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const audioUrl = `https://api.fish.audio/v1/tts/preview?text=${encodeURIComponent(inputText)}&voice_id=${activeVoice.id}&speed=${voiceSpeed}&volume=${masterVolume}`;
      
      // Add to history
      const newEntry = {
        id: Math.random().toString(36).substr(2, 9),
        text: inputText,
        voiceId: activeVoice.id,
        time: new Date().toLocaleTimeString(),
        audioUrl: audioUrl
      };
      setSynthesisHistory(prev => [newEntry, ...prev].slice(0, 10));

      const audio = new Audio(audioUrl);
      audio.volume = masterVolume / 100;
      
      if (outputSource !== 'default' && (audio as any).setSinkId) {
        try {
          await (audio as any).setSinkId(outputSource);
        } catch (err) {
          console.error("Failed to set Audio element sink ID:", err);
        }
      }

      audio.play();
      // alert(`合成成功！已通过 fish.audio 生成语音。使用声音：${activeVoice.id}`);
    } catch (error) {
      console.error('Speech generation failed:', error);
      alert('合成失败，请检查网络或 API 配置。');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayClip = (url: string) => {
    const audio = new Audio(url);
    audio.volume = masterVolume / 100;
    audio.play();
  };

  const handleDownloadClip = (text: string, url: string) => {
    // In a real app, this would download the file
    console.log("Downloading clip:", text, url);
    alert("下载已开始 (模拟)");
  };

  const handleCloneVoice = async () => {
    if (isCloning || isRecordingSample) return;

    // Phase 1: Recording Sample
    setIsRecordingSample(true);
    setCloningStatus('正在录制您的语音样本... (Recording Sample - Please speak clearly)');
    
    try {
      // Simulate recording for 5 seconds
      await new Promise(resolve => setTimeout(resolve, 5000));
      setIsRecordingSample(false);
      
      // Phase 2: Cloning Process
      setIsCloning(true);
      setCloningProgress(0);
      
      const stages = [
        { id: 'UPLOAD' as const, label: '正在上传音频样本 (Uploading Samples)...', duration: 2000, startProgress: 0, endProgress: 25 },
        { id: 'PROCESSING' as const, label: '正在进行神经认同重建 (Neural Processing)...', duration: 3000, startProgress: 25, endProgress: 55 },
        { id: 'RECONSTRUCTION' as const, label: '正在重建声学特征 (Acoustic Reconstruction)...', duration: 2500, startProgress: 55, endProgress: 85 },
        { id: 'OPTIMIZATION' as const, label: '正在优化输出模型 (Model Optimization)...', duration: 1500, startProgress: 85, endProgress: 100 },
      ];

      let totalTime = stages.reduce((acc, s) => acc + s.duration, 0);
      let elapsed = 0;

      for (const stage of stages) {
        setCloningStage(stage.id);
        setCloningStatus(stage.label);
        
        const startTime = Date.now();
        const stageDuration = stage.duration;
        
        while (Date.now() - startTime < stageDuration) {
          const stageElapsed = Date.now() - startTime;
          const stageProgress = stageElapsed / stageDuration;
          const currentProgress = stage.startProgress + (stage.endProgress - stage.startProgress) * stageProgress;
          
          setCloningProgress(Math.min(currentProgress, stage.endProgress));
          
          const remaining = (totalTime - (elapsed + stageElapsed)) / 1000;
          setCloningTimeRemaining(Math.max(0, Math.ceil(remaining)));
          
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        elapsed += stageDuration;
      }

      setCloningProgress(100);
      setCloningTimeRemaining(0);
      await new Promise(resolve => setTimeout(resolve, 500));

      const newVoiceId = `CLONE_${Math.floor(Math.random() * 1000)}`;
      const newVoice = { 
        id: newVoiceId, 
        name: `Clone ${newVoiceId.split('_')[1]}`,
        type: 'Personal / Cloned', 
        style: 'Natural',
        status: 'READY', 
        active: true, 
        icon: <User size={20} />, 
        volume: 100, 
        speed: 50, 
        pitch: 50 
      };

      setVoices(prev => [newVoice, ...prev.map(v => ({ ...v, active: false }))]);
      alert(`克隆成功！新声音 ID: ${newVoiceId} 已同步至 fish.audio`);
    } catch (error) {
      console.error('Voice cloning failed:', error);
      alert('克隆失败。');
    } finally {
      setIsCloning(false);
      setIsRecordingSample(false);
      setCloningStatus(null);
      setCloningProgress(0);
      setCloningTimeRemaining(null);
      setCloningStage(null);
    }
  };

  const handleDeleteVoice = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (voices.length <= 1) {
      alert('至少需要保留一个声音。');
      return;
    }
    
    const voiceToDelete = voices.find(v => v.id === id);
    if (voiceToDelete?.active) {
      // If deleting active voice, select another one first
      const nextVoice = voices.find(v => v.id !== id);
      if (nextVoice) {
        handleVoiceSelect(nextVoice.id);
      }
    }
    
    setVoices(prev => prev.filter(v => v.id !== id));
  };

  return (
    <div className="space-y-8 relative">
      {/* Recording Overlay */}
      <AnimatePresence>
        {isRecordingSample && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-10 text-center"
          >
            <div className="max-w-2xl space-y-10">
              <div className="space-y-2">
                <h2 className="font-headline text-4xl font-black text-primary tracking-widest uppercase">正在采集语音样本</h2>
                <p className="text-on-surface-variant font-mono text-xs uppercase tracking-widest">Phase 01: Audio Acquisition // {recordingTime}s</p>
              </div>

              <div className="bg-surface-container-high p-10 border-2 border-primary/30 relative group">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-on-primary text-[10px] font-bold px-3 py-1 uppercase tracking-widest">请朗读以下文本</div>
                <p className="text-2xl font-headline leading-relaxed text-on-surface italic">"{sampleText}"</p>
              </div>

              <div className="flex items-center justify-center gap-2 h-20">
                {[...Array(20)].map((_, i) => (
                  <motion.div 
                    key={i}
                    animate={{ height: [10, 40 + Math.random() * 40, 10] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }}
                    className="w-1.5 bg-primary rounded-full"
                  />
                ))}
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="w-64 h-1 bg-surface-container-highest rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 5, ease: "linear" }}
                    className="h-full bg-primary"
                  />
                </div>
                <span className="font-mono text-[10px] text-primary uppercase tracking-widest animate-pulse">正在监听输入流...</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="flex flex-col md:flex-row justify-between items-end gap-6 border-l-4 border-secondary pl-6 py-2">
        <div className="flex flex-col">
          <span className="font-headline text-secondary text-xs tracking-[0.3em] uppercase mb-1">System Module: Audio_Engine</span>
          <h1 className="font-headline text-5xl font-black text-on-surface flex items-baseline gap-4">
            语音合成 <span className="text-primary text-xl tracking-tighter opacity-50 font-light">SPEECH SYNTHESIS</span>
          </h1>
        </div>
        <div className="bg-surface-container-high px-4 py-2 border border-outline-variant flex items-center gap-3">
          <Zap size={14} className="text-secondary" />
          <span className="font-headline text-xs tracking-widest">SIGNAL: 100%</span>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-4 space-y-8">
          <div className="bg-surface-container-low p-8 border-r-2 border-primary/20 relative">
            <div className="absolute -top-3 -left-1 bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 uppercase tracking-tighter">Parameters v.1.0</div>
            <div className="space-y-10 mt-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="font-headline text-xs tracking-[0.2em] text-on-surface-variant uppercase">Volume / 音量 (Master: {masterVolume}%)</label>
                  <span className="text-primary font-mono text-sm">{activeVoice.volume}%</span>
                </div>
                <input 
                  type="range" 
                  className="w-full accent-primary" 
                  value={activeVoice.volume} 
                  onChange={(e) => updateActiveVoice({ volume: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="font-headline text-xs tracking-[0.2em] text-on-surface-variant uppercase">Playback Speed / 语速 (Master: {voiceSpeed.toFixed(2)}x)</label>
                  <span className="text-secondary font-mono text-sm">{(activeVoice.speed / 50).toFixed(1)}x</span>
                </div>
                <input 
                  type="range" 
                  className="w-full accent-secondary" 
                  value={activeVoice.speed} 
                  onChange={(e) => updateActiveVoice({ speed: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="font-headline text-xs tracking-[0.2em] text-on-surface-variant uppercase">Tone Pitch / 音调</label>
                  <span className="text-tertiary font-mono text-sm">{(activeVoice.pitch / 50).toFixed(1)}</span>
                </div>
                <input 
                  type="range" 
                  className="w-full accent-tertiary" 
                  value={activeVoice.pitch} 
                  onChange={(e) => updateActiveVoice({ pitch: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <div className="bg-surface-container p-6 relative overflow-hidden h-48 group">
            <img 
              src="https://picsum.photos/seed/audio/800/400?blur=5" 
              alt="audio visualization" 
              className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale contrast-150 group-hover:scale-110 transition-transform duration-1000"
              referrerPolicy="no-referrer"
            />
            <div className="relative z-10 h-full flex flex-col justify-end">
              <p className="text-[10px] font-mono text-secondary mb-2 opacity-80">ACTIVE_STREAMING_NODE</p>
              <div className="flex gap-1 items-end h-12">
                {[4, 8, 6, 2, 5, 7, 3, 6, 4, 9, 5, 7, 3, 8, 4, 6].map((h, i) => (
                  <motion.div 
                    key={i}
                    animate={{ height: [h*4, (h+2)*4, (h-1)*4, h*4] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                    className="w-1.5 bg-secondary" 
                  />
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main className="lg:col-span-8 space-y-8">
          <div className="bg-surface-container-low p-8 border border-outline-variant/30 relative">
            <div className="absolute -top-3 -left-1 bg-secondary text-on-secondary text-[10px] font-bold px-2 py-0.5 uppercase tracking-tighter">Text Input Node</div>
            <div className="relative">
              <textarea 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="输入您想要合成的文本..."
                className="w-full h-48 bg-surface-container-highest/30 border-0 border-b-2 border-outline-variant focus:border-secondary focus:ring-0 text-xl font-headline leading-relaxed p-6 transition-all placeholder:text-on-surface-variant/30"
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-4">
                <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">{inputText.length} / 500 CHARS</span>
                <button 
                  onClick={() => setInputText('')}
                  className="text-on-surface-variant hover:text-error transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="mt-8 flex flex-col md:flex-row gap-4">
              <button 
                onClick={handleGenerateSpeech}
                disabled={isGenerating || !inputText.trim()}
                className={cn(
                  "flex-1 py-5 font-headline font-black text-xl tracking-widest uppercase flex items-center justify-center gap-3 transition-all",
                  isGenerating 
                    ? "bg-outline text-on-surface-variant cursor-not-allowed" 
                    : "bg-secondary text-on-secondary hover:shadow-[0_0_30px_rgba(0,255,102,0.3)] active:scale-[0.98]"
                )}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={24} className="animate-spin" />
                    正在生成神经语音...
                  </>
                ) : (
                  <>
                    <PlayCircle size={24} fill="currentColor" />
                    开始语音合成
                  </>
                )}
              </button>
              
              <button 
                onClick={handleCloneVoice}
                disabled={isCloning || isRecordingSample}
                className={cn(
                  "px-8 py-5 font-headline font-bold text-sm tracking-widest uppercase border-2 transition-all flex items-center justify-center gap-3",
                  isCloning || isRecordingSample
                    ? "border-outline text-outline cursor-not-allowed"
                    : "border-primary text-primary hover:bg-primary hover:text-on-primary"
                )}
              >
                {isCloning ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    克隆中...
                  </>
                ) : isRecordingSample ? (
                  <>
                    <Mic size={18} className="animate-pulse" />
                    录制中...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    克隆我的声音
                  </>
                )}
              </button>
            </div>

            {isCloning && (
              <div className="mt-8 space-y-4">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-primary uppercase tracking-widest">{cloningStage}</span>
                    <p className="text-xs font-headline text-on-surface uppercase tracking-widest">{cloningStatus}</p>
                  </div>
                  <span className="text-xs font-mono text-primary">{cloningTimeRemaining}s REMAINING</span>
                </div>
                <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${cloningProgress}%` }}
                    className="h-full bg-primary shadow-[0_0_10px_rgba(255,131,209,0.5)]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Synthesis History */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <History size={14} className="text-on-surface-variant" />
              <span className="text-[10px] font-headline uppercase tracking-widest text-on-surface-variant">合成历史 / SYNTHESIS HISTORY</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {synthesisHistory.length > 0 ? synthesisHistory.map((item) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-surface-container-low border border-outline-variant/30 p-4 flex flex-col gap-3 group hover:border-secondary/50 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] font-mono text-on-surface-variant uppercase">{item.time} // {item.voiceId}</span>
                      <p className="text-sm text-on-surface line-clamp-1 italic">"{item.text}"</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handlePlayClip(item.audioUrl)}
                        className="p-1.5 text-secondary hover:bg-secondary/10 transition-colors"
                      >
                        <PlayCircle size={18} />
                      </button>
                      <button 
                        onClick={() => handleDownloadClip(item.text, item.audioUrl)}
                        className="p-1.5 text-on-surface-variant hover:text-primary transition-colors"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="col-span-full py-12 flex flex-col items-center justify-center opacity-20 space-y-4">
                  <Waves size={48} />
                  <span className="font-headline text-xs uppercase tracking-widest">暂无合成记录</span>
                </div>
              )}
            </div>
          </div>
        </main>

        <aside className="lg:col-span-4 space-y-8">
          <div className="bg-surface-container-low p-6 border border-outline-variant/30">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-headline uppercase tracking-widest text-on-surface-variant">声音库 / VOICE LIBRARY</span>
              <PlusCircle size={14} className="text-primary cursor-pointer hover:scale-110 transition-transform" />
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {voices.map((voice) => (
                <button 
                  key={voice.id}
                  onClick={() => handleVoiceSelect(voice.id)}
                  className={cn(
                    "w-full p-4 flex items-center gap-4 border-l-4 transition-all group relative",
                    voice.active 
                      ? "bg-secondary/10 border-secondary shadow-[0_0_15px_rgba(0,255,102,0.1)]" 
                      : "bg-surface-container-highest/30 border-transparent hover:bg-surface-container-highest/50"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 flex items-center justify-center rounded-lg transition-colors",
                    voice.active ? "bg-secondary text-on-secondary" : "bg-surface-container-highest text-on-surface-variant"
                  )}>
                    {voice.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <h4 className={cn(
                        "text-xs font-headline font-bold uppercase tracking-widest",
                        voice.active ? "text-secondary" : "text-on-surface"
                      )}>{voice.name}</h4>
                      {voice.active && <Check size={12} className="text-secondary" />}
                    </div>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[8px] font-mono text-on-surface-variant uppercase">{voice.type}</span>
                      <span className="text-[8px] font-mono text-secondary uppercase opacity-60">#{voice.style}</span>
                    </div>
                  </div>
                  
                  {voices.length > 1 && (
                    <button 
                      onClick={(e) => handleDeleteVoice(e, voice.id)}
                      className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1 text-on-surface-variant hover:text-error transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

const SettingsView = ({ 
  inputSource, 
  setInputSource,
  outputSource,
  setOutputSource,
  audioDevices,
  outputDevices,
  refreshDevices,
  isFetchingDevices,
  translationApi,
  setTranslationApi,
  modelPrecision,
  setModelPrecision,
  voiceModel,
  setVoiceModel,
  voiceSpeed,
  setVoiceSpeed,
  masterVolume,
  setMasterVolume,
  recognitionMode,
  setRecognitionMode,
  voicePersona,
  setVoicePersona,
  voiceTimbre,
  setVoiceTimbre,
  shortcutKey,
  setShortcutKey,
  devicePermissionError,
  isSimultaneousMode,
  setIsSimultaneousMode
}: { 
  inputSource: string; 
  setInputSource: (s: string) => void;
  outputSource: string;
  setOutputSource: (s: string) => void;
  audioDevices: MediaDeviceInfo[];
  outputDevices: MediaDeviceInfo[];
  refreshDevices: () => void;
  isFetchingDevices: boolean;
  translationApi: string;
  setTranslationApi: (s: string) => void;
  modelPrecision: string;
  setModelPrecision: (s: string) => void;
  voiceModel: string;
  setVoiceModel: (s: string) => void;
  voiceSpeed: number;
  setVoiceSpeed: (n: number) => void;
  masterVolume: number;
  setMasterVolume: (n: number) => void;
  recognitionMode: 'auto' | 'manual';
  setRecognitionMode: (m: 'auto' | 'manual') => void;
  voicePersona: string;
  setVoicePersona: (s: string) => void;
  voiceTimbre: string;
  setVoiceTimbre: (s: string) => void;
  shortcutKey: string;
  setShortcutKey: (s: string) => void;
  devicePermissionError: string | null;
  isSimultaneousMode: boolean;
  setIsSimultaneousMode: (b: boolean) => void;
}) => {
  const [isRecordingShortcut, setIsRecordingShortcut] = useState(false);

  return (
    <div className="space-y-12">
      <section className="mb-8">
        <div className="flex items-baseline gap-4 mb-2">
          <h1 className="font-headline text-6xl font-black tracking-tighter text-on-background uppercase italic">
            Settings <span className="text-primary">设置中心</span>
          </h1>
        </div>
        <p className="text-on-surface-variant font-headline text-sm tracking-[0.2em] uppercase">SYSTEM_OVERRIDE_ACTIVE // 系统覆盖激活</p>
      </section>

      <div className="grid grid-cols-1 gap-8">
        {/* 1. Audio Devices */}
        <section className="bg-surface-container-low border-l-4 border-secondary p-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-20 font-headline text-6xl pointer-events-none select-none">01</div>
          <div className="flex items-center gap-4 mb-10">
            <Volume2 className="text-secondary" size={24} />
            <h2 className="font-headline text-2xl font-bold uppercase tracking-widest text-secondary">Audio Devices <span className="text-xs font-normal opacity-50 ml-2">音频设备</span></h2>
          </div>

          {devicePermissionError && (
            <div className="mb-8 p-4 bg-destructive/10 border border-destructive/30 flex items-start gap-4">
              <AlertCircle className="text-destructive shrink-0" size={20} />
              <div className="space-y-1">
                <p className="text-xs font-headline font-bold text-destructive uppercase tracking-widest">权限受限 // PERMISSION_DENIED</p>
                <p className="text-[10px] text-on-surface-variant leading-relaxed">
                  系统无法访问您的麦克风。请在浏览器地址栏中检查权限设置，确保已允许此应用访问音频输入。
                  <br />
                  错误详情: {devicePermissionError}
                </p>
                <button 
                  onClick={refreshDevices}
                  className="mt-2 text-[9px] font-headline text-primary hover:underline uppercase tracking-widest"
                >
                  重新请求权限
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <label className="font-headline text-xs uppercase tracking-widest text-on-surface-variant block">Input Source / 输入源</label>
                <button 
                  onClick={refreshDevices}
                  disabled={isFetchingDevices}
                  className="text-[10px] font-headline text-secondary hover:underline flex items-center gap-1 disabled:opacity-50"
                >
                  <RefreshCw size={10} className={cn(isFetchingDevices && "animate-spin")} />
                  刷新设备
                </button>
              </div>
              <div className="relative">
                <select 
                  value={inputSource}
                  onChange={(e) => setInputSource(e.target.value)}
                  className="w-full bg-surface-container-highest border-0 text-on-surface py-4 px-6 focus:ring-1 focus:ring-secondary appearance-none font-body"
                >
                  <option value="default">系统默认麦克风 (Default)</option>
                  {audioDevices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `麦克风 ${device.deviceId.slice(0, 5)}...`}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" size={20} />
              </div>
            </div>
            <div className="space-y-3">
              <label className="font-headline text-xs uppercase tracking-widest text-on-surface-variant block">Output Destination / 输出目标</label>
              <div className="relative">
                <select 
                  value={outputSource}
                  onChange={(e) => setOutputSource(e.target.value)}
                  className="w-full bg-surface-container-highest border-0 text-on-surface py-4 px-6 focus:ring-1 focus:ring-secondary appearance-none font-body"
                >
                  <option value="default">系统默认输出 (Default)</option>
                  {outputDevices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `扬声器 ${device.deviceId.slice(0, 5)}...`}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" size={20} />
              </div>
            </div>
          </div>
        </section>

        {/* 2. Audio Parameters */}
        <section className="bg-surface-container-low border-l-4 border-primary p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20 font-headline text-6xl pointer-events-none select-none">02</div>
          <div className="flex items-center gap-4 mb-10">
            <Layers className="text-primary" size={24} />
            <h2 className="font-headline text-2xl font-bold uppercase tracking-widest text-primary">Audio Parameters <span className="text-xs font-normal opacity-50 ml-2">音频参数</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="space-y-3">
              <label className="font-headline text-xs uppercase tracking-widest text-on-surface-variant block">Model Precision / 模型精度</label>
              <div className="relative">
                <select 
                  value={modelPrecision}
                  onChange={(e) => setModelPrecision(e.target.value)}
                  className="w-full bg-surface-container-highest border-0 text-on-surface py-4 px-6 focus:ring-1 focus:ring-primary appearance-none font-body"
                >
                  <option value="通用 (标准模式)">通用 (标准模式)</option>
                  <option value="INT8 (高性能优化)">INT8 (高性能优化)</option>
                  <option value="FP16 (高音质模式)">FP16 (高音质模式)</option>
                  <option value="BF16 (平衡模式)">BF16 (平衡模式)</option>
                  <option value="INT4 (极速模式)">INT4 (极速模式)</option>
                </select>
                <Layers className="absolute right-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none" size={18} />
              </div>
            </div>
            <div className="space-y-3">
              <label className="font-headline text-xs uppercase tracking-widest text-on-surface-variant block">Voice Model / 语音模型</label>
              <div className="relative">
                <select 
                  value={voiceModel}
                  onChange={(e) => setVoiceModel(e.target.value)}
                  className="w-full bg-surface-container-highest border-0 text-on-surface py-4 px-6 focus:ring-1 focus:ring-primary appearance-none font-body"
                >
                  <option value="NEON-V3 Alpha (霓虹)">NEON-V3 Alpha (霓虹)</option>
                  <option value="Whisper V3 Large">Whisper V3 Large</option>
                  <option value="SeamlessM4T v2">SeamlessM4T v2</option>
                  <option value="Gemini 2.5 Flash">Gemini 2.5 Flash</option>
                  <option value="Gemini 3.1 Pro">Gemini 3.1 Pro</option>
                  <option value="Fish Audio V2">Fish Audio V2</option>
                  <option value="ElevenLabs v2">ElevenLabs v2</option>
                  <option value="Meta Voice-1">Meta Voice-1</option>
                  <option value="OpenAI TTS-1">OpenAI TTS-1</option>
                  <option value="Azure Neural Voice">Azure Neural Voice</option>
                </select>
                <Brain className="absolute right-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none" size={18} />
              </div>
            </div>
            <div className="space-y-3">
              <label className="font-headline text-xs uppercase tracking-widest text-on-surface-variant block">Translation API / 翻译接口</label>
              <div className="relative">
                <select 
                  value={translationApi}
                  onChange={(e) => setTranslationApi(e.target.value)}
                  className="w-full bg-surface-container-highest border-0 text-on-surface py-4 px-6 focus:ring-1 focus:ring-primary appearance-none font-body"
                >
                  <option value="Gemini Live API">Gemini Live API (实时翻译)</option>
                  <option value="LOCAL ENGINE">LOCAL ENGINE (本地离线)</option>
                  <option value="OpenAI GPT-4o">OpenAI GPT-4o (Translation)</option>
                  <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
                  <option value="DeepL Pro">DeepL Pro</option>
                  <option value="Google Translate">Google Translate</option>
                  <option value="Baidu Fanyi">Baidu Fanyi (百度翻译)</option>
                  <option value="Youdao">Youdao (有道翻译)</option>
                  <option value="Tencent Transmart">Tencent Transmart</option>
                </select>
                <Languages className="absolute right-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none" size={18} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-12">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <label className="font-headline text-xs uppercase tracking-widest text-on-surface-variant block">Voice Speed / 语速</label>
                <span className="text-primary font-headline text-sm">{voiceSpeed.toFixed(2)}x</span>
              </div>
              <input 
                type="range" 
                className="w-full" 
                max="2.0" 
                min="0.5" 
                step="0.05" 
                value={voiceSpeed} 
                onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <label className="font-headline text-xs uppercase tracking-widest text-on-surface-variant block">Master Volume / 主音量</label>
                <span className="text-primary font-headline text-sm">{masterVolume}%</span>
              </div>
              <input 
                type="range" 
                className="w-full" 
                max="100" 
                min="0" 
                value={masterVolume} 
                onChange={(e) => setMasterVolume(parseInt(e.target.value))}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-12 border-t border-outline-variant/30 pt-10">
            <div className="space-y-4">
              <label className="font-headline text-xs uppercase tracking-widest text-on-surface-variant block">Recognition Mode / 识别模式</label>
              <div className="flex gap-4">
                <button 
                  onClick={() => setRecognitionMode('auto')}
                  className={cn(
                    "px-8 py-3 font-headline font-bold text-xs uppercase tracking-tighter transition-all",
                    recognitionMode === 'auto' 
                      ? "bg-primary text-on-primary neon-glow-primary" 
                      : "border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary"
                  )}
                >
                  自动 (Auto)
                </button>
                <button 
                  onClick={() => setRecognitionMode('manual')}
                  className={cn(
                    "px-8 py-3 font-headline font-bold text-xs uppercase tracking-tighter transition-all",
                    recognitionMode === 'manual' 
                      ? "bg-primary text-on-primary neon-glow-primary" 
                      : "border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary"
                  )}
                >
                  手动 (Manual)
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <label className="font-headline text-xs uppercase tracking-widest text-on-surface-variant block">Interpretation Mode / 传译模式</label>
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsSimultaneousMode(true)}
                  className={cn(
                    "px-8 py-3 font-headline font-bold text-xs uppercase tracking-tighter transition-all",
                    isSimultaneousMode 
                      ? "bg-success text-on-primary shadow-[0_0_15px_rgba(0,255,102,0.4)]" 
                      : "border border-outline-variant text-on-surface-variant hover:border-success hover:text-success"
                  )}
                >
                  同时传译 (Simultaneous)
                </button>
                <button 
                  onClick={() => setIsSimultaneousMode(false)}
                  className={cn(
                    "px-8 py-3 font-headline font-bold text-xs uppercase tracking-tighter transition-all",
                    !isSimultaneousMode 
                      ? "bg-primary text-on-primary neon-glow-primary" 
                      : "border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary"
                  )}
                >
                  交替传译 (Consecutive)
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <label className="font-headline text-xs uppercase tracking-widest text-on-surface-variant block">Voice Persona / 语音角色 (性格)</label>
              <div className="relative">
                <select 
                  value={voicePersona}
                  onChange={(e) => setVoicePersona(e.target.value)}
                  className="w-full bg-surface-container-highest border-0 text-on-surface py-4 px-6 focus:ring-1 focus:ring-tertiary appearance-none font-body uppercase tracking-widest text-sm"
                >
                  <option value="Techno-Optimist / 科技乐观派">Techno-Optimist / 科技乐观派</option>
                  <option value="Cyber-Punk / 赛博朋克">Cyber-Punk / 赛博朋克</option>
                  <option value="Gentle-AI / 温柔AI">Gentle-AI / 温柔AI</option>
                  <option value="Stoic-Narrator / 冷静叙述者">Stoic-Narrator / 冷静叙述者</option>
                  <option value="Energetic-Guide / 活力向导">Energetic-Guide / 活力向导</option>
                  <option value="Vintage-Radio / 复古电台">Vintage-Radio / 复古电台</option>
                  <option value="Zen-Master / 禅修大师">Zen-Master / 禅修大师</option>
                  <option value="Street-Wise / 街头达人">Street-Wise / 街头达人</option>
                  <option value="Royal-Butler / 皇家管家">Royal-Butler / 皇家管家</option>
                  <option value="Sci-Fi-Computer / 科幻电脑">Sci-Fi-Computer / 科幻电脑</option>
                  <option value="Warm-Grandma / 慈祥奶奶">Warm-Grandma / 慈祥奶奶</option>
                  <option value="Professional-News / 专业新闻">Professional-News / 专业新闻</option>
                  <option value="GPT-Assistant / 智能助手">GPT-Assistant / 智能助手</option>
                  <option value="Claude-Scholar / 克劳德学者">Claude-Scholar / 克劳德学者</option>
                  <option value="DeepL-Linguist / 语言专家">DeepL-Linguist / 语言专家</option>
                  <option value="Siri-Friendly / 亲切助手">Siri-Friendly / 亲切助手</option>
                  <option value="Jarvis-Butler / 贾维斯管家">Jarvis-Butler / 贾维斯管家</option>
                </select>
                <Smile className="absolute right-4 top-1/2 -translate-y-1/2 text-tertiary pointer-events-none" size={18} />
              </div>
            </div>
            <div className="space-y-4">
              <label className="font-headline text-xs uppercase tracking-widest text-on-surface-variant block">Voice Timbre / 语音音色 (音质)</label>
              <div className="relative">
                <select 
                  value={voiceTimbre}
                  onChange={(e) => setVoiceTimbre(e.target.value)}
                  className="w-full bg-surface-container-highest border-0 text-on-surface py-4 px-6 focus:ring-1 focus:ring-secondary appearance-none font-body uppercase tracking-widest text-sm"
                >
                  <optgroup label="Gemini Native (Native Support)">
                    <option value="Zephyr">Zephyr (Default - Balanced)</option>
                    <option value="Puck">Puck (Cheerful & Bright)</option>
                    <option value="Charon">Charon (Deep & Calm)</option>
                    <option value="Kore">Kore (Soft & Gentle)</option>
                    <option value="Fenrir">Fenrir (Strong & Authoritative)</option>
                  </optgroup>
                  <optgroup label="OpenAI Style (Simulated)">
                    <option value="Alloy">Alloy (Neutral & Balanced)</option>
                    <option value="Echo">Echo (Warm & Deep)</option>
                    <option value="Fable">Fable (Narrative & Expressive)</option>
                    <option value="Onyx">Onyx (Bold & Strong)</option>
                    <option value="Nova">Nova (Soft & Energetic)</option>
                    <option value="Shimmer">Shimmer (Bright & Clear)</option>
                  </optgroup>
                  <optgroup label="ElevenLabs Style (Simulated)">
                    <option value="Bella">Bella (Soft & Whispery)</option>
                    <option value="Antoni">Antoni (Professional & Calm)</option>
                    <option value="Arnold">Arnold (Deep & Gritty)</option>
                    <option value="Adam">Adam (Clear & Direct)</option>
                    <option value="Domi">Domi (Warm & Friendly)</option>
                    <option value="Elli">Elli (Young & Bright)</option>
                  </optgroup>
                  <optgroup label="Azure Style (Simulated)">
                    <option value="Aria">Aria (Natural & Flowing)</option>
                    <option value="Guy">Guy (Deep & Authoritative)</option>
                    <option value="Jenny">Jenny (Friendly & Clear)</option>
                    <option value="Nanami">Nanami (Soft & Polite)</option>
                    <option value="Jessa">Jessa (Professional & Precise)</option>
                  </optgroup>
                  <optgroup label="NEON Custom (Experimental)">
                    <option value="NEON-V3-Alpha">NEON-V3-Alpha (Cybernetic)</option>
                    <option value="NEON-V3-Beta">NEON-V3-Beta (Digital)</option>
                  </optgroup>
                </select>
                <Volume2 className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" size={18} />
              </div>
            </div>
          </div>
        </section>

        {/* 3. Shortcut Settings */}
        <section className="bg-surface-container-low border-l-4 border-tertiary p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20 font-headline text-6xl pointer-events-none select-none">03</div>
          <div className="flex items-center gap-4 mb-10">
            <Keyboard className="text-tertiary" size={24} />
            <h2 className="font-headline text-2xl font-bold uppercase tracking-widest text-tertiary">Shortcut Settings <span className="text-xs font-normal opacity-50 ml-2">快捷键设置</span></h2>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2 space-y-4">
              <label className="font-headline text-xs uppercase tracking-widest text-on-surface-variant block">Recording Toggle Key / 录音切换键</label>
              <div className="group relative">
                <input 
                  className={cn(
                    "w-full bg-surface-container-highest border-0 border-b-2 border-outline focus:border-tertiary text-on-surface py-5 px-8 font-headline font-black tracking-widest uppercase transition-all focus:ring-0 cursor-pointer",
                    isRecordingShortcut && "border-tertiary animate-pulse"
                  )} 
                  type="text" 
                  readOnly
                  value={isRecordingShortcut ? "正在录制... (按下按键)" : shortcutKey}
                  onClick={() => setIsRecordingShortcut(true)}
                  onBlur={() => setIsRecordingShortcut(false)}
                  onKeyDown={(e) => {
                    if (isRecordingShortcut) {
                      e.preventDefault();
                      const keys = [];
                      if (e.altKey) keys.push('ALT');
                      if (e.ctrlKey) keys.push('CTRL');
                      if (e.shiftKey) keys.push('SHIFT');
                      if (e.metaKey) keys.push('META');
                      
                      if (!['Alt', 'Control', 'Shift', 'Meta'].includes(e.key)) {
                        keys.push(e.key.toUpperCase());
                      }

                      if (keys.length > 0) {
                        setShortcutKey(keys.join(' + '));
                        setIsRecordingShortcut(false);
                      }
                    }
                  }}
                />
                <div className="absolute inset-0 bg-tertiary/5 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity" />
              </div>
              <p className="text-[10px] text-tertiary italic">
                {isRecordingShortcut ? "请在键盘上按下您想设置的组合键" : "点击输入框以重新映射激活序列。"}
              </p>
            </div>
            <div className="w-full md:w-1/2">
              <div className="p-8 bg-surface-container-highest/50 border border-tertiary/20 backdrop-blur-sm space-y-6">
                <h4 className="font-headline text-[10px] uppercase text-tertiary mb-4 tracking-[0.3em]">Device Feedback / 设备反馈</h4>
                <div className="flex items-center justify-between py-3 border-b border-outline-variant/20">
                  <span className="text-xs font-body text-on-surface-variant">触感脉冲 (Haptic Pulse)</span>
                  <div className="w-10 h-5 bg-tertiary/30 rounded-full flex items-center px-1">
                    <div className="w-3 h-3 bg-tertiary rounded-full shadow-[0_0_8px_#c47fff]" />
                  </div>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-outline-variant/20">
                  <span className="text-xs font-body text-on-surface-variant">屏幕叠加层 (OSD Overlay)</span>
                  <div className="w-10 h-5 bg-outline-variant rounded-full flex items-center justify-end px-1">
                    <div className="w-3 h-3 bg-on-background/30 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="h-64 bg-surface-container relative overflow-hidden group">
          <img 
            src="https://picsum.photos/seed/cyber/1200/600" 
            alt="signal visualization" 
            className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          <div className="absolute bottom-6 left-6">
            <span className="font-headline text-primary font-bold tracking-widest text-xs uppercase">实时信号分析 // LIVE SIGNAL ANALYSIS</span>
          </div>
        </div>
        <div className="h-64 bg-surface-container relative overflow-hidden group">
          <img 
            src="https://picsum.photos/seed/tech/1200/600" 
            alt="system status" 
            className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          <div className="absolute bottom-6 left-6">
            <span className="font-headline text-secondary font-bold tracking-widest text-xs uppercase">内核版本 // KERNEL VERSION: 4.9.2-NEON</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoginView = ({ onBack, onLogin }: { onBack: () => void, onLogin: (user: any) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    
    setIsLoggingIn(true);
    try {
      const result = isSignUp 
        ? await signUp(email, password, name || email.split('@')[0])
        : await signIn(email, password);
      
      onLogin({
        id: result.user.id,
        name: result.user.user_metadata?.name || name || email.split('@')[0],
        email: result.user.email
      });
    } catch (error) {
      console.error('Auth error:', error);
      // Handle error (show toast or something)
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-3xl" onClick={onBack} />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-[480px] relative z-10"
      >
        <div className="absolute -top-16 -left-8 z-20 select-none pointer-events-none">
          <span className="font-headline text-6xl font-black text-tertiary/10">ログイン</span>
        </div>
        
        <div className="bg-surface/40 backdrop-blur-2xl border-l border-t border-white/10 p-12 relative overflow-hidden border-r-2 border-primary neon-glow-primary">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-secondary/10 rounded-full blur-[80px]" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
          
          <div className="mb-12 space-y-3">
            <h1 className="font-headline text-4xl font-bold tracking-tight text-on-surface flex items-center gap-4">
              <span className="w-2 h-10 bg-primary" />
              身份验证
            </h1>
            <p className="font-headline text-[10px] text-secondary tracking-widest uppercase opacity-80">Accessing Digital Dimension Cluster // 01</p>
          </div>

          <form className="space-y-10" onSubmit={handleSubmit}>
            {isSignUp && (
              <div className="group relative">
                <label className="block font-headline text-[10px] uppercase tracking-widest text-on-surface-variant mb-3 ml-1">
                  Name / 姓名
                </label>
                <div className="relative">
                  <input 
                    className="w-full bg-background/50 border-0 border-b border-outline-variant focus:border-secondary focus:ring-0 text-on-surface placeholder:text-outline/40 font-body py-4 px-6 transition-all duration-300" 
                    placeholder="ENTER NAME" 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 text-outline/30 group-focus-within:text-secondary transition-colors" size={18} />
                </div>
              </div>
            )}
            <div className="group relative">
              <label className="block font-headline text-[10px] uppercase tracking-widest text-on-surface-variant mb-3 ml-1">
                Email / 邮箱
              </label>
              <div className="relative">
                <input 
                  className="w-full bg-background/50 border-0 border-b border-outline-variant focus:border-secondary focus:ring-0 text-on-surface placeholder:text-outline/40 font-body py-4 px-6 transition-all duration-300" 
                  placeholder="ENTER EMAIL" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <AtSign className="absolute right-4 top-1/2 -translate-y-1/2 text-outline/30 group-focus-within:text-secondary transition-colors" size={18} />
              </div>
            </div>

            <div className="group relative">
              <div className="flex justify-between items-end mb-3 ml-1">
                <label className="block font-headline text-[10px] uppercase tracking-widest text-on-surface-variant">
                  Password / 密码
                </label>
                <button type="button" className="font-headline text-[9px] uppercase tracking-widest text-tertiary hover:text-primary transition-colors">Forgot?</button>
              </div>
              <div className="relative">
                <input 
                  className="w-full bg-background/50 border-0 border-b border-outline-variant focus:border-secondary focus:ring-0 text-on-surface placeholder:text-outline/40 font-body py-4 px-6 transition-all duration-300" 
                  placeholder="••••••••" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Key className="absolute right-4 top-1/2 -translate-y-1/2 text-outline/30 group-focus-within:text-secondary transition-colors" size={18} />
              </div>
            </div>

            <div className="pt-8 space-y-6">
              <button 
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-primary py-5 text-on-primary font-headline font-bold uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(255,131,209,0.3)] hover:shadow-[0_0_30px_rgba(255,131,209,0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>{isSignUp ? '注册中...' : '登录中...'}</span>
                  </>
                ) : (
                  <>
                    <span>{isSignUp ? 'SIGN UP / 注册账户' : 'LOGIN / 登录系统'}</span>
                    <Bolt size={18} fill="currentColor" />
                  </>
                )}
              </button>
              
              <div className="flex items-center gap-6 text-outline/20">
                <div className="h-[1px] flex-1 bg-current" />
                <span className="font-headline text-[9px] uppercase tracking-widest">or</span>
                <div className="h-[1px] flex-1 bg-current" />
              </div>

              <button 
                type="button" 
                onClick={() => setIsSignUp(!isSignUp)}
                className="w-full border border-secondary/30 bg-secondary/5 py-5 text-secondary font-headline font-bold uppercase tracking-[0.2em] hover:bg-secondary hover:text-on-secondary transition-all flex items-center justify-center gap-3"
              >
                <span>{isSignUp ? '已有账户？登录' : 'SIGN UP / 注册账户'}</span>
              </button>
            </div>
          </form>

          <div className="mt-12 pt-8 border-t border-outline-variant/10 flex justify-between items-center opacity-40">
            <div className="flex gap-3">
              <div className="w-2 h-2 bg-secondary rounded-full" />
              <div className="w-2 h-2 bg-primary rounded-full" />
              <div className="w-2 h-2 bg-tertiary rounded-full" />
            </div>
            <span className="font-headline text-[8px] tracking-[0.3em]">ENCRYPTED_SESSION_v4.2</span>
          </div>
        </div>

        <div className="absolute -right-24 top-24 hidden lg:block w-40 aspect-square bg-surface-container/60 border border-white/5 backdrop-blur-md p-6 rotate-12">
          <div className="h-full border border-primary/20 flex flex-col items-center justify-center gap-3">
            <Terminal className="text-primary" size={32} />
            <span className="font-headline text-[8px] text-center text-on-surface-variant">CORE_LINK_STABLE</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [view, setView] = useState<View>('home');
  const [user, setUser] = useState<{name: string, email: string} | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [inputSource, setInputSource] = useState('default');
  const [outputSource, setOutputSource] = useState('default');
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [outputDevices, setOutputDevices] = useState<MediaDeviceInfo[]>([]);
  const [isFetchingDevices, setIsFetchingDevices] = useState(false);
  const [devicePermissionError, setDevicePermissionError] = useState<string | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [transcription, setTranscription] = useState('');
  const [translation, setTranslation] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('自动检测 (Auto Detect)');
  const [targetLanguage, setTargetLanguage] = useState('英语 (English)');
  const [isSimultaneousMode, setIsSimultaneousMode] = useState(true);
  const [translationApi, setTranslationApi] = useState('Gemini Live API');
  const [modelPrecision, setModelPrecision] = useState('通用 (标准模式)');
  const [voiceModel, setVoiceModel] = useState('NEON-V3 Alpha (霓虹)');
  const [voiceSpeed, setVoiceSpeed] = useState(1.15);
  const [masterVolume, setMasterVolume] = useState(82);
  const [recognitionMode, setRecognitionMode] = useState<'auto' | 'manual'>('auto');
  const [voicePersona, setVoicePersona] = useState('Techno-Optimist / 科技乐观派');
  const [voiceTimbre, setVoiceTimbre] = useState('Zephyr');
  const [shortcutKey, setShortcutKey] = useState('ALT + SHIFT + R');
  
  const [history, setHistory] = useState<{id: string, text: string, type: 'input' | 'output', time: string}[]>([]);
  const [synthesisHistory, setSynthesisHistory] = useState<{id: string, text: string, voiceId: string, time: string, audioUrl: string}[]>([]);
  const [speechLogs, setSpeechLogs] = useState([
    { id: 882, time: '14:22:05 UTC', text: '正在探索未来合成的数字前沿...' },
    { id: 881, time: '14:21:44 UTC', text: '用户请求立即翻译技术规范。' },
    { id: 880, time: '14:20:12 UTC', text: '系统初始化完成。准备好接收新的输入流。' },
    { id: 879, time: '14:18:55 UTC', text: '检测到环境音频配置文件的频率偏移。' },
  ]);

  const sessionRef = React.useRef<any>(null);

  // Load history when user changes
  useEffect(() => {
    if (user) {
      getHistory(user.id).then(setHistory).catch(console.error);
    } else {
      setHistory([]);
    }
  }, [user]);

  const fetchDevices = async (forcePermission = false) => {
    if (isFetchingDevices) return;
    setIsFetchingDevices(true);
    try {
      // Request permission if labels are empty or forced
      const devicesBefore = await navigator.mediaDevices.enumerateDevices();
      const needsPermission = forcePermission || devicesBefore.every(d => !d.label);
      
      if (needsPermission) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop());
          setDevicePermissionError(null);
        } catch (permissionErr: any) {
          console.warn("Microphone permission denied or blocked:", permissionErr);
          setDevicePermissionError(permissionErr.message || "Permission denied");
          // Don't throw here, let it continue to enumerateDevices
        }
      }
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      const audioOutputs = devices.filter(device => device.kind === 'audiooutput');
      
      setAudioDevices(audioInputs);
      setOutputDevices(audioOutputs);
      
      // If current inputSource is not in the list, reset to default
      if (inputSource !== 'default' && !audioInputs.some(d => d.deviceId === inputSource)) {
        setInputSource('default');
      }

      // If current outputSource is not in the list, reset to default
      if (outputSource !== 'default' && !audioOutputs.some(d => d.deviceId === outputSource)) {
        setOutputSource('default');
      }
    } catch (err) {
      console.error("Error fetching audio devices:", err);
    } finally {
      setIsFetchingDevices(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    
    const handleDeviceChange = () => fetchDevices();
    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, []);

  // Cleanup audio stream on unmount
  useEffect(() => {
    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
      }
      if (sessionRef.current) {
        sessionRef.current.close();
      }
    };
  }, [audioStream]);

  // Add to history when translation changes and is not empty
  useEffect(() => {
    if (translation && isTranslating) {
      const timer = setTimeout(() => {
        setHistory(prev => {
          const last = prev[0];
          if (last && last.text === translation) return prev;
          return [{
            id: Math.random().toString(36).substr(2, 9),
            text: translation,
            type: 'output',
            time: new Date().toLocaleTimeString()
          }, ...prev].slice(0, 20); // Keep more in global history
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [translation, isTranslating]);

  const toggleTranslation = useCallback(async () => {
    if (isTranslating) {
      // Stop translation
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        setAudioStream(null);
      }
      if (sessionRef.current) {
        sessionRef.current.close();
        sessionRef.current = null;
      }
      setIsTranslating(false);

      // Save translation history if user is logged in and we have content
      if (user && transcription && translation) {
        saveHistory(user.id, transcription, translation, sourceLanguage, targetLanguage)
          .then(() => {
            // Reload history
            getHistory(user.id).then(setHistory).catch(console.error);
          })
          .catch(console.error);
      }
    } else {
      // Start translation
      try {
        const constraints = {
          audio: inputSource === 'default' ? true : { deviceId: { exact: inputSource } }
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setAudioStream(stream);
        setIsTranslating(true);
        setTranscription('');
        setTranslation('');
        setDevicePermissionError(null);

        // Initialize Translation Engine based on settings
        if (translationApi === 'Gemini Live API') {
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
              const isAutoDetect = sourceLanguage === '自动检测 (Auto Detect)';
              const sessionPromise = ai.live.connect({
                model: "gemini-3.1-flash-live-preview",
                config: {
                  responseModalities: [Modality.AUDIO],
                  systemInstruction: `You are a professional real-time simultaneous interpreter. 
                  Source Language: ${isAutoDetect ? 'Detect automatically' : sourceLanguage}
                  Target Language: ${targetLanguage}
                  Mode: ${isSimultaneousMode ? 'Simultaneous (Translate as the user speaks, chunk by chunk)' : 'Consecutive (Wait for natural pauses)'}
                  Speaking Speed: ${voiceSpeed.toFixed(2)}x
                  Voice Persona: ${voicePersona}
                  Voice Timbre Style: ${voiceTimbre}
                  
                  Task:
                  1. ${isAutoDetect ? 'Identify the spoken language.' : `Listen to the user's speech in ${sourceLanguage}.`}
                  2. Transcribe it exactly.
                  3. Translate it into ${targetLanguage} with minimal latency.
                  4. ${isSimultaneousMode ? 'Do not wait for the end of a sentence if you have enough context to translate a phrase.' : 'Wait for a complete thought before translating.'}
                  
                  Output format:
                  Provide the transcription and translation in your response. 
                  Use the inputAudioTranscription and outputAudioTranscription features if available.`,
                  inputAudioTranscription: {},
                  outputAudioTranscription: {},
                  speechConfig: {
                    voiceConfig: { 
                      prebuiltVoiceConfig: { 
                        voiceName: ['Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir'].includes(voiceTimbre) 
                          ? voiceTimbre 
                          : 'Zephyr' 
                      } 
                    }
                  }
                },
            callbacks: {
              onopen: () => {
                console.log("Gemini Live session opened");
                
                // Start streaming audio
                const audioContext = new AudioContext({ sampleRate: 16000 });
                
                // Create a gain node for master volume control
                const gainNode = audioContext.createGain();
                gainNode.gain.value = masterVolume / 100;
                gainNode.connect(audioContext.destination);
                
                // Store gain node in a ref or local variable if needed for real-time updates
                // For now, we'll use it for the session's audio output
                sessionPromise.then(session => {
                  if (session) {
                    (session as any).audioContext = audioContext;
                    (session as any).gainNode = gainNode;
                  }
                });

                // Set output device if supported and not default
                if (outputSource !== 'default' && (audioContext as any).setSinkId) {
                  (audioContext as any).setSinkId(outputSource).catch((err: any) => {
                    console.error("Failed to set AudioContext sink ID:", err);
                  });
                }

                const source = audioContext.createMediaStreamSource(stream);
                
                // Use a more modern approach if possible, but ScriptProcessor is simple for this demo
                const processor = audioContext.createScriptProcessor(4096, 1, 1);

                source.connect(processor);
                // We don't connect processor to destination because we don't want to hear our own voice
                // processor.connect(audioContext.destination); 

                processor.onaudioprocess = (e) => {
                  const inputData = e.inputBuffer.getChannelData(0);
                  
                  // Convert to 16-bit PCM
                  const pcmData = new Int16Array(inputData.length);
                  for (let i = 0; i < inputData.length; i++) {
                    pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
                  }
                  
                  // Convert to Base64
                  const binary = String.fromCharCode(...new Uint8Array(pcmData.buffer));
                  const base64Data = btoa(binary);
                  
                  sessionPromise.then(session => {
                    if (session) {
                      session.sendRealtimeInput({
                        audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
                      });
                    }
                  });
                };
              },
              onmessage: (message: LiveServerMessage) => {
                // Handle audio output
                const audioData = message.serverContent?.modelTurn?.parts?.find(p => p.inlineData)?.inlineData?.data;
                if (audioData) {
                  sessionPromise.then(session => {
                    if (session && (session as any).audioContext && (session as any).gainNode) {
                      const audioContext = (session as any).audioContext as AudioContext;
                      const gainNode = (session as any).gainNode as GainNode;
                      
                      // Update gain value in case it changed
                      gainNode.gain.value = masterVolume / 100;

                      const binaryString = atob(audioData);
                      const len = binaryString.length;
                      const bytes = new Uint8Array(len);
                      for (let i = 0; i < len; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                      }
                      
                      // Gemini Live returns 16-bit PCM at 24kHz (usually, but let's assume 24k for output)
                      const pcmData = new Int16Array(bytes.buffer);
                      const audioBuffer = audioContext.createBuffer(1, pcmData.length, 24000);
                      const channelData = audioBuffer.getChannelData(0);
                      for (let i = 0; i < pcmData.length; i++) {
                        channelData[i] = pcmData[i] / 32768;
                      }
                      
                      const source = audioContext.createBufferSource();
                      source.buffer = audioBuffer;
                      source.connect(gainNode);
                      source.start();
                    }
                  });
                }

                // Handle transcription and translation from model turn (if text parts exist)
                if (message.serverContent?.modelTurn?.parts) {
                  const text = message.serverContent.modelTurn.parts.map(p => p.text).join("");
                  if (text) {
                    setTranslation(prev => prev + text);
                  }
                }
                
                // Handle user transcription (inputAudioTranscription)
                const inputTranscription = (message as any).inputAudioTranscription || (message.serverContent as any)?.inputAudioTranscription;
                if (inputTranscription) {
                  if (inputTranscription.text) {
                    setTranscription(inputTranscription.text);
                  }
                  
                  // If it's a final transcription, add it to logs
                  if (inputTranscription.final && inputTranscription.text) {
                    setSpeechLogs(prev => [
                      { 
                        id: Math.floor(Math.random() * 1000), 
                        time: new Date().toLocaleTimeString('en-GB', { hour12: false }) + ' UTC', 
                        text: inputTranscription.text 
                      },
                      ...prev.slice(0, 19)
                    ]);
                  }
                }

                // Handle model transcription (outputAudioTranscription) - This is the translation
                const outputTranscription = (message as any).outputAudioTranscription || (message.serverContent as any)?.outputAudioTranscription;
                if (outputTranscription && outputTranscription.text) {
                  setTranslation(outputTranscription.text);
                }
              },
              onerror: (err) => {
                console.error("Gemini Live error:", err);
                setIsTranslating(false);
              },
              onclose: () => {
                console.log("Gemini Live session closed");
                setIsTranslating(false);
              },
            }
          });

          sessionRef.current = await sessionPromise;
        } else {
          // Mock implementation for other APIs
          console.log(`Starting translation using ${translationApi}...`);
          // In a real app, we would initialize the specific SDK here.
          // For this demo, we'll simulate translation updates.
          const mockInterval = setInterval(() => {
            if (Math.random() > 0.7) {
              const mockText = "检测到语音输入片段 " + Math.floor(Math.random() * 100);
              setTranscription(mockText);
              setTranslation(prev => prev + ` [${translationApi} 翻译: ${mockText.slice(-3)}]`);
              
              setSpeechLogs(prev => [
                { 
                  id: Math.floor(Math.random() * 1000), 
                  time: new Date().toLocaleTimeString('en-GB', { hour12: false }) + ' UTC', 
                  text: mockText 
                },
                ...prev.slice(0, 19)
              ]);
            }
          }, 2000);
          
          (sessionRef.current as any) = {
            close: () => clearInterval(mockInterval)
          };
        }

      } catch (err: any) {
        console.error("Failed to access microphone or start Gemini:", err);
        setDevicePermissionError(err.message || "无法开启翻译服务，请检查麦克风权限或 API 配置。");
        setIsTranslating(false);
      }
    }
  }, [isTranslating, audioStream, inputSource, outputSource, sourceLanguage, targetLanguage, translationApi, voiceSpeed, masterVolume, voicePersona, voiceTimbre]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
      }
      if (sessionRef.current) {
        sessionRef.current.close();
      }
    };
  }, [audioStream]);

  // Global shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' || 
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      const keys = [];
      if (e.altKey) keys.push('ALT');
      if (e.ctrlKey) keys.push('CTRL');
      if (e.shiftKey) keys.push('SHIFT');
      if (e.metaKey) keys.push('META');
      
      if (!['Alt', 'Control', 'Shift', 'Meta'].includes(e.key)) {
        keys.push(e.key.toUpperCase());
      }

      const pressedShortcut = keys.join(' + ');
      
      if (pressedShortcut === shortcutKey) {
        e.preventDefault();
        toggleTranslation();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcutKey, toggleTranslation]);

  return (
    <Layout 
      currentView={view} 
      setView={setView} 
      user={user} 
      onLogout={async () => {
        try {
          await signOut();
        } catch (error) {
          console.error('Sign out error:', error);
        }
        setUser(null);
        setView('home');
      }}
    >
      {view === 'home' && (
        <HomeView 
          isTranslating={isTranslating} 
          toggleTranslation={toggleTranslation} 
          inputSource={inputSource}
          audioDevices={audioDevices}
          audioStream={audioStream}
          transcription={transcription}
          translation={translation}
          sourceLanguage={sourceLanguage}
          targetLanguage={targetLanguage}
          setSourceLanguage={setSourceLanguage}
          setTargetLanguage={setTargetLanguage}
          voiceModel={voiceModel}
          translationApi={translationApi}
          voiceSpeed={voiceSpeed}
          masterVolume={masterVolume}
          recognitionMode={recognitionMode}
          voicePersona={voicePersona}
          voiceTimbre={voiceTimbre}
          isSimultaneousMode={isSimultaneousMode}
          setIsSimultaneousMode={setIsSimultaneousMode}
          setTranscription={setTranscription}
          setTranslation={setTranslation}
          history={history}
          setHistory={setHistory}
        />
      )}
      {view === 'services' && (
        <ServiceManagementView 
          inputSource={inputSource} 
          setInputSource={setInputSource}
          outputSource={outputSource}
          setOutputSource={setOutputSource}
          audioDevices={audioDevices}
          outputDevices={outputDevices}
          refreshDevices={() => fetchDevices(true)}
          isFetchingDevices={isFetchingDevices}
          translationApi={translationApi}
          setTranslationApi={setTranslationApi}
          isTranslating={isTranslating}
          toggleTranslation={toggleTranslation}
          speechLogs={speechLogs}
          setSpeechLogs={setSpeechLogs}
          modelPrecision={modelPrecision}
          voiceModel={voiceModel}
          voiceSpeed={voiceSpeed}
          masterVolume={masterVolume}
          recognitionMode={recognitionMode}
          voicePersona={voicePersona}
          voiceTimbre={voiceTimbre}
          history={history}
          setHistory={setHistory}
        />
      )}
      {view === 'synthesis' && (
        <SpeechSynthesisView 
          outputSource={outputSource} 
          voiceSpeed={voiceSpeed}
          masterVolume={masterVolume}
          synthesisHistory={synthesisHistory}
          setSynthesisHistory={setSynthesisHistory}
        />
      )}
      {view === 'settings' && (
        <SettingsView 
          inputSource={inputSource} 
          setInputSource={setInputSource} 
          outputSource={outputSource}
          setOutputSource={setOutputSource}
          audioDevices={audioDevices}
          outputDevices={outputDevices}
          refreshDevices={() => fetchDevices(true)}
          isFetchingDevices={isFetchingDevices}
          translationApi={translationApi}
          setTranslationApi={setTranslationApi}
          modelPrecision={modelPrecision}
          setModelPrecision={setModelPrecision}
          voiceModel={voiceModel}
          setVoiceModel={setVoiceModel}
          voiceSpeed={voiceSpeed}
          setVoiceSpeed={setVoiceSpeed}
          masterVolume={masterVolume}
          setMasterVolume={setMasterVolume}
          recognitionMode={recognitionMode}
          setRecognitionMode={setRecognitionMode}
          voicePersona={voicePersona}
          setVoicePersona={setVoicePersona}
          voiceTimbre={voiceTimbre}
          setVoiceTimbre={setVoiceTimbre}
          shortcutKey={shortcutKey}
          setShortcutKey={setShortcutKey}
          devicePermissionError={devicePermissionError}
          isSimultaneousMode={isSimultaneousMode}
          setIsSimultaneousMode={setIsSimultaneousMode}
        />
      )}
      {view === 'login' && (
        <LoginView 
          onBack={() => setView('home')} 
          onLogin={(user) => {
            setUser(user);
            setView('home');
          }}
        />
      )}
    </Layout>
  );
}
