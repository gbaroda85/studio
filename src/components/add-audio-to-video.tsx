
"use client";

import { useState, useRef, type ChangeEvent, type DragEvent, useEffect, useCallback, useMemo } from "react";
import { 
    UploadCloud, 
    FileVideo, 
    Download, 
    Loader2, 
    ShieldCheck, 
    Zap, 
    CheckCircle2, 
    Sparkles,
    X,
    Settings2,
    MonitorPlay,
    Music,
    Play,
    Pause,
    Volume2,
    Plus,
    RefreshCcw,
    Monitor,
    Scissors,
    Clock,
    Activity,
    ZoomIn,
    ZoomOut,
    VolumeX,
    GripVertical,
    MoveHorizontal,
    Type,
    ArrowLeft,
    AlignLeft,
    AlignRight,
    ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import confetti from 'canvas-confetti';
import WaveSurfer from 'wavesurfer.js';

// --- TYPES ---
type AudioMode = 'keep' | 'replace' | 'mix' | 'mute';
type Stage = 'upload' | 'studio';

const StarIcons = () => (
    <>
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`star-${i} pointer-events-none`}>
                <svg viewBox="0 0 784.11 815.53" className="fill-white">
                    <path d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
                </svg>
            </div>
        ))}
    </>
);

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${m}:${s.toString().padStart(2, '0')}.${ms}`;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default function AddAudioToVideo() {
    const { toast } = useToast();
    
    // --- FILES & URLS ---
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    
    // --- STUDIO STATE ---
    const [videoDuration, setVideoDuration] = useState(0);
    const [audioDuration, setAudioDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [zoom, setZoom] = useState([50]); // px per second
    
    // Mixing Logic
    const [audioMode, setAudioMode] = useState<AudioMode>('mix');
    const [videoVolume, setVideoVolume] = useState([100]);
    const [audioVolume, setAudioVolume] = useState([100]);
    const [isLooping, setIsLooping] = useState(false);
    const [fadeIn, setFadeIn] = useState([0]);
    const [fadeOut, setFadeOut] = useState([0]);
    
    const [audioOffset, setAudioOffset] = useState(0); 
    const [audioTrimStart, setAudioTrimStart] = useState(0);
    const [audioTrimEnd, setAudioTrimEnd] = useState(0);
    
    // System State
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isFFmpegReady, setIsFFmpegReady] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    // --- REFS ---
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const audioInputRef = useRef<HTMLInputElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);
    const waveformRef = useRef<HTMLDivElement>(null);
    const wavesurferRef = useRef<WaveSurfer | null>(null);
    const ffmpegRef = useRef<any>(null);
    const syncFrameRef = useRef<number | null>(null);

    // --- FFMPEG DYNAMIC LOADER ---
    // Fixing "Module not found: Can't resolve <dynamic>" by importing dynamically in useEffect
    useEffect(() => {
        const load = async () => {
            try {
                const { FFmpeg } = await import('@ffmpeg/ffmpeg');
                const { toBlobURL } = await import('@ffmpeg/util');
                const ffmpeg = new FFmpeg();
                const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd';
                
                await ffmpeg.load({
                    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
                });
                
                ffmpegRef.current = ffmpeg;
                setIsFFmpegReady(true);
            } catch (err) {
                console.error("FFmpeg loading failed", err);
            }
        };
        load();
    }, []);

    // --- CLEANUP ---
    useEffect(() => {
        return () => {
            if (videoUrl) URL.revokeObjectURL(videoUrl);
            if (audioUrl) URL.revokeObjectURL(audioUrl);
            if (wavesurferRef.current) wavesurferRef.current.destroy();
            if (syncFrameRef.current) cancelAnimationFrame(syncFrameRef.current);
        };
    }, [videoUrl, audioUrl]);

    // --- WAVEFORM ENGINE ---
    const initWaveform = useCallback((url: string) => {
        if (!waveformRef.current) return;
        if (wavesurferRef.current) wavesurferRef.current.destroy();

        const ws = WaveSurfer.create({
            container: waveformRef.current,
            waveColor: '#6366f1',
            progressColor: 'hsl(var(--primary))',
            cursorColor: 'transparent',
            barWidth: 2,
            barGap: 3,
            height: 60,
            normalize: true,
            interact: false,
            minPxPerSec: zoom[0]
        });

        ws.on('ready', () => {
            const d = ws.getDuration();
            setAudioDuration(d);
            setAudioTrimEnd(d);
        });

        ws.load(url);
        wavesurferRef.current = ws;
    }, [zoom]);

    useEffect(() => {
        if (wavesurferRef.current) {
            wavesurferRef.current.zoom(zoom[0]);
        }
    }, [zoom]);

    // --- REAL-TIME PLAYBACK SYNC ---
    const updateSync = useCallback(() => {
        const video = videoRef.current;
        const audio = audioRef.current;
        if (!video || !audio) return;

        const vt = video.currentTime;
        setCurrentTime(vt);

        const relTime = vt - audioOffset;
        const clipDuration = audioTrimEnd - audioTrimStart;
        const inBounds = relTime >= 0 && (isLooping || relTime <= clipDuration);
        
        // MIXING PROTOCOL LOGIC (Preview)
        const shouldHearAudio = inBounds && audioUrl && (audioMode === 'mix' || audioMode === 'replace' || audioMode === 'mute');

        if (shouldHearAudio) {
            let targetAudioTime;
            if (isLooping) {
                targetAudioTime = audioTrimStart + (relTime % Math.max(0.1, clipDuration));
            } else {
                targetAudioTime = audioTrimStart + relTime;
            }

            // Sync seek
            if (Math.abs(audio.currentTime - targetAudioTime) > 0.1) {
                audio.currentTime = targetAudioTime;
            }

            // Sync playback state
            if (video.paused) {
                if (!audio.paused) audio.pause();
            } else {
                if (audio.paused) audio.play().catch(() => {});
            }

            // Apply Individual Volume & Fades (Strict 0.0 - 1.0 clamping for HTMLMediaElement)
            let vol = audioVolume[0] / 100;
            if (fadeIn[0] > 0 && relTime < fadeIn[0]) vol *= (relTime / fadeIn[0]);
            if (!isLooping && fadeOut[0] > 0 && relTime > (clipDuration - fadeOut[0])) {
                vol *= Math.max(0, (clipDuration - relTime) / fadeOut[0]);
            }
            audio.volume = Math.min(1, Math.max(0, vol));
        } else {
            if (!audio.paused) audio.pause();
        }

        // Video Volume Logic (Mixing Protocol)
        const shouldHearVideo = (audioMode === 'mix' || audioMode === 'keep');
        video.volume = shouldHearVideo ? Math.min(1, videoVolume[0] / 100) : 0;

        syncFrameRef.current = requestAnimationFrame(updateSync);
    }, [audioOffset, audioTrimStart, audioTrimEnd, isLooping, audioVolume, videoVolume, audioMode, fadeIn, fadeOut, audioUrl]);

    useEffect(() => {
        syncFrameRef.current = requestAnimationFrame(updateSync);
        return () => { if (syncFrameRef.current) cancelAnimationFrame(syncFrameRef.current); };
    }, [updateSync]);

    const togglePlayback = () => {
        const v = videoRef.current;
        if (!v) return;
        if (v.paused) {
            v.play().catch(() => {});
            setIsPlaying(true);
        } else {
            v.pause();
            setIsPlaying(false);
        }
    };

    const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!timelineRef.current || !videoRef.current) return;
        const rect = timelineRef.current.getBoundingClientRect();
        const scrollLeft = timelineRef.current.scrollLeft;
        const clickX = e.clientX - rect.left + scrollLeft;
        const targetTime = clickX / zoom[0];
        videoRef.current.currentTime = Math.max(0, Math.min(videoDuration, targetTime));
    };

    const onVideoInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (videoUrl) URL.revokeObjectURL(videoUrl);
            setVideoFile(file);
            setVideoUrl(URL.createObjectURL(file));
            setAudioMode('mix');
        }
    };

    const onAudioInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
            setAudioFile(file);
            const url = URL.createObjectURL(file);
            setAudioUrl(url);
            initWaveform(url);
        }
    };

    // --- INDUSTRIAL EXPORT ENGINE (FFmpeg.WASM) ---
    const startFusion = async () => {
        if (!ffmpegRef.current || !videoFile || !audioFile) return;
        const ffmpeg = ffmpegRef.current;
        
        // Dynamically import fetchFile to avoid build errors
        const { fetchFile } = await import('@ffmpeg/util');
        
        setIsProcessing(true);
        setProgress(0);

        try {
            await ffmpeg.writeFile('input_v.mp4', await fetchFile(videoFile));
            await ffmpeg.writeFile('input_a.mp3', await fetchFile(audioFile));

            const vVol = Math.min(1, videoVolume[0] / 100);
            const aVol = Math.min(2, audioVolume[0] / 100); // Allow up to 200% gain in export
            const delayMs = Math.round(audioOffset * 1000);
            
            // Build Complex Filter based on Mixing Protocol
            // [0:a] is video audio, [1:a] is added audio
            let vStream = "";
            if (audioMode === 'mix' || audioMode === 'keep') {
                vStream = `[0:a]volume=${vVol}[va];`;
            } else {
                // If replacing or muting, use silent source for video track
                vStream = `anullsrc=r=44100:cl=stereo,atrim=duration=${videoDuration}[va];`;
            }

            let aFilter = `[1:a]atrim=start=${audioTrimStart}:end=${audioTrimEnd},asetpts=PTS-STARTPTS`;
            if (fadeIn[0] > 0) aFilter += `,afade=t=in:st=0:d=${fadeIn[0]}`;
            if (fadeOut[0] > 0) aFilter += `,afade=t=out:st=${audioTrimEnd - audioTrimStart - fadeOut[0]}:d=${fadeOut[0]}`;
            if (isLooping) aFilter += `,aloop=loop=-1:size=${(audioTrimEnd - audioTrimStart) * 44100}`;
            
            // Apply delay and volume to added audio
            const aOutput = (audioMode === 'keep') ? "anullsrc=r=44100:cl=stereo,atrim=duration=1[aa];" : `${aFilter},adelay=${delayMs}|${delayMs},volume=${aVol}[aa];`;

            const mixFilter = `${vStream}${aOutput}[va][aa]amix=inputs=2:duration=first[aout]`;

            ffmpeg.on('progress', ({ progress }) => setProgress(Math.round(progress * 100)));

            await ffmpeg.exec([
                '-i', 'input_v.mp4',
                '-i', 'input_a.mp3',
                '-filter_complex', mixFilter,
                '-map', '0:v',
                '-map', '[aout]',
                '-c:v', 'copy',
                '-c:a', 'aac',
                '-b:a', '192k',
                'output.mp4'
            ]);

            const data = await ffmpeg.readFile('output.mp4');
            const blob = new Blob([data], { type: 'video/mp4' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Fusion_${Date.now()}.mp4`;
            link.click();
            
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            setIsProcessing(false);
        } catch (e) {
            console.error(e);
            toast({ variant: 'destructive', title: "Fusion Failed" });
            setIsProcessing(false);
        }
    };

    const handleReset = () => {
        setVideoFile(null);
        setAudioFile(null);
        setVideoUrl(null);
        setAudioUrl(null);
        setAudioOffset(0);
        setIsPlaying(false);
    };

    return (
        <div className="w-full flex flex-col items-center gap-6 py-4 text-left">
            {!videoFile ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl px-4">
                    <Card className="glass-card border-2 border-dashed shadow-2xl rounded-[2.5rem] hover:border-primary/50 cursor-pointer bg-card/50" onClick={() => videoInputRef.current?.click()}>
                        <CardContent className="p-16 flex flex-col items-center justify-center gap-6">
                            <div className="size-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center shadow-xl transition-all group-hover:scale-110"><FileVideo className="size-10" /></div>
                            <div className="text-center text-left">
                                <p className="text-xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Upload Original Video</p>
                                <p className="text-[10px] text-muted-foreground mt-2 font-bold opacity-60 uppercase tracking-widest">MP4, MOV, WebM (Max 500MB)</p>
                            </div>
                            <input ref={videoInputRef} type="file" className="hidden" accept="video/*" onChange={onVideoInputChange} />
                        </CardContent>
                    </Card>
                </motion.div>
            ) : (
                <div className="w-full max-w-[1600px] grid grid-cols-1 lg:grid-cols-12 gap-6 items-start px-4">
                    
                    <div className="lg:col-span-8 flex flex-col gap-4">
                        <Card className="overflow-hidden border-2 shadow-3xl bg-card/50 rounded-[2.5rem] relative">
                            <CardHeader className="bg-muted/30 border-b py-3 px-6 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-3">
                                    <MonitorPlay className="size-4 text-primary" />
                                    <CardTitle className="text-[10px] font-black uppercase tracking-widest truncate max-w-[200px]">{videoFile.name}</CardTitle>
                                </div>
                                <Button variant="ghost" size="icon" onClick={handleReset} className="h-8 w-8 text-destructive hover:bg-destructive/10"><X size={16}/></Button>
                            </CardHeader>
                            <CardContent className="p-4 md:p-8 flex flex-col items-center justify-center bg-black min-h-[350px] relative overflow-hidden">
                                <video 
                                    ref={videoRef} 
                                    src={videoUrl!} 
                                    className="max-h-[50vh] w-auto rounded-xl shadow-2xl"
                                    onLoadedMetadata={(e) => setVideoDuration(e.currentTarget.duration)}
                                    onClick={togglePlayback}
                                />
                                <audio ref={audioRef} src={audioUrl || undefined} />
                                
                                {!isPlaying && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none cursor-pointer" onClick={togglePlayback}>
                                        <div className="size-16 rounded-full bg-primary/80 backdrop-blur-xl flex items-center justify-center shadow-3xl"><Play className="size-8 text-white fill-white ml-1" /></div>
                                    </div>
                                )}

                                <AnimatePresence>
                                    {isProcessing && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/90 backdrop-blur-xl z-50 flex flex-col items-center justify-center gap-6">
                                            <div className="relative">
                                                <Loader2 className="size-16 animate-spin text-primary stroke-[3]" />
                                                <Zap className="absolute inset-0 m-auto size-8 text-primary animate-pulse" />
                                            </div>
                                            <div className="w-full max-w-[280px] space-y-3">
                                                <p className="text-xs font-black uppercase text-white tracking-[0.3em] text-center animate-pulse">Encoding Fusion</p>
                                                <Progress value={progress} className="h-1 shadow-inner" />
                                                <p className="text-[8px] font-bold text-white/40 text-center uppercase tracking-widest">{progress}% COMPLETE</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </CardContent>
                            
                            {/* PROFESSIONAL TIMELINE */}
                            <div className="border-t bg-muted/20 select-none">
                                <div className="h-8 border-b flex items-center justify-between px-4 bg-background/50">
                                    <div className="flex items-center gap-4">
                                        <span className="text-[9px] font-black font-mono text-primary bg-primary/5 px-2 py-0.5 rounded">{formatTime(currentTime)}</span>
                                        <Separator orientation="vertical" className="h-3" />
                                        <span className="text-[9px] font-black font-mono opacity-30">{formatTime(videoDuration)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ZoomOut size={12} className="opacity-30" />
                                        <Slider value={zoom} min={10} max={200} step={5} onValueChange={setZoom} className="w-24" />
                                        <ZoomIn size={12} className="opacity-30" />
                                    </div>
                                </div>

                                <div ref={timelineRef} className="h-44 overflow-x-auto overflow-y-hidden relative bg-slate-100 dark:bg-black/20 custom-scrollbar" onClick={handleTimelineClick}>
                                    <div className="h-6 border-b border-dashed border-primary/10 relative" style={{ width: `${Math.max(videoDuration, audioDuration + audioOffset) * zoom[0]}px` }}>
                                        {Array.from({ length: Math.ceil(Math.max(videoDuration, audioDuration + audioOffset)) + 1 }).map((_, i) => (
                                            <div key={i} className="absolute top-0 flex flex-col items-center" style={{ left: `${i * zoom[0]}px` }}>
                                                <div className="h-2 w-px bg-muted-foreground/30" />
                                                {i % 5 === 0 && <span className="text-[7px] font-black opacity-30 mt-1">{i}s</span>}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Tracks */}
                                    <div className="p-2 space-y-2">
                                        <div className="h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center px-4 relative" style={{ width: `${videoDuration * zoom[0]}px` }}>
                                            <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Main Video Stream</span>
                                        </div>
                                        <div className="h-14 relative">
                                            {audioUrl ? (
                                                <motion.div 
                                                    drag="x" dragMomentum={false} dragConstraints={{ left: 0 }}
                                                    onDrag={(e, info) => setAudioOffset(prev => Math.max(0, prev + info.delta.x / zoom[0]))}
                                                    className="h-full bg-primary/10 border-2 border-primary/40 rounded-xl cursor-move flex items-center overflow-hidden shadow-lg absolute"
                                                    style={{ left: `${audioOffset * zoom[0]}px`, width: `${(audioTrimEnd - audioTrimStart) * zoom[0]}px` }}
                                                >
                                                    <div ref={waveformRef} className="w-full pointer-events-none opacity-60" />
                                                    <div className="absolute inset-y-0 left-0 w-3 bg-primary/20 cursor-ew-resize hover:bg-primary/40 transition-colors flex items-center justify-center"><AlignLeft size={8}/></div>
                                                    <div className="absolute inset-y-0 right-0 w-3 bg-primary/20 cursor-ew-resize hover:bg-primary/40 transition-colors flex items-center justify-center"><AlignRight size={8}/></div>
                                                </motion.div>
                                            ) : (
                                                <div className="h-full border-2 border-dashed border-muted-foreground/20 rounded-xl flex items-center justify-center opacity-20"><p className="text-[8px] font-black uppercase">No Audio Added</p></div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Playhead */}
                                    <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-50 shadow-[0_0_10px_red] transition-transform duration-75 pointer-events-none" style={{ left: `${currentTime * zoom[0]}px` }}>
                                        <div className="absolute -top-1 -left-1.5 size-3.5 bg-red-500 rounded-full border-2 border-white shadow-xl" />
                                    </div>
                                </div>
                            </div>
                        </Card>
                        
                        {!audioFile && (
                            <Card className="border-2 border-dashed rounded-[2rem] bg-indigo-500/5 hover:border-indigo-500/40 transition-all cursor-pointer group shadow-xl" onClick={() => audioInputRef.current?.click()}>
                                <CardContent className="p-8 flex items-center gap-6">
                                    <div className="size-14 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform"><Music className="size-6" /></div>
                                    <div className="flex-1 text-left">
                                        <p className="text-lg font-black uppercase tracking-tighter">Add Audio Track</p>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">MP3, WAV, M4A background music</p>
                                    </div>
                                    <Plus className="size-6 text-indigo-500 opacity-20" />
                                </CardContent>
                                <input ref={audioInputRef} type="file" className="hidden" accept="audio/*" onChange={onAudioInputChange} />
                            </Card>
                        )}
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                        <Card className="glass-panel border-none shadow-2xl overflow-hidden rounded-[2.5rem]">
                            <CardHeader className="bg-primary/5 border-b p-6 text-left">
                                <CardTitle className="text-base flex items-center gap-3 font-black uppercase tracking-tighter text-primary">
                                    <Settings2 className="size-5" /> Studio Actions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 md:p-8 space-y-8 text-left">
                                {audioFile ? (
                                    <div className="space-y-8 animate-in fade-in">
                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-black uppercase opacity-60 tracking-widest">Mixing Protocol</Label>
                                            <Select value={audioMode} onValueChange={(v) => setAudioMode(v as AudioMode)}>
                                                <SelectTrigger className="h-11 border-2 font-black rounded-xl bg-background shadow-sm"><SelectValue /></SelectTrigger>
                                                <SelectContent className="rounded-xl border-2 shadow-2xl">
                                                    <SelectItem value="mix" className="font-bold py-3 uppercase text-[10px]">Mix Both Tracks</SelectItem>
                                                    <SelectItem value="replace" className="font-bold py-3 uppercase text-[10px]">Replace Original</SelectItem>
                                                    <SelectItem value="mute" className="font-bold py-3 uppercase text-[10px]">Mute Original</SelectItem>
                                                    <SelectItem value="keep" className="font-bold py-3 uppercase text-[10px]">Keep Original Only</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center"><Label className="text-[9px] font-black uppercase opacity-60">Original Video Sound</Label><Badge variant="secondary" className="font-mono text-[9px]">{videoVolume[0]}%</Badge></div>
                                                <Slider min={0} max={100} value={videoVolume} onValueChange={setVideoVolume} disabled={audioMode === 'replace' || audioMode === 'mute'} />
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center"><Label className="text-[9px] font-black uppercase opacity-60">New Audio Track</Label><Badge variant="secondary" className="font-mono text-[9px]">{audioVolume[0]}%</Badge></div>
                                                <Slider min={0} max={100} value={audioVolume} onValueChange={setAudioVolume} disabled={audioMode === 'keep'} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-[8px] font-black uppercase opacity-40 ml-1">Fade In (s)</Label>
                                                <Input type="number" step="0.1" value={fadeIn[0]} onChange={(e) => setFadeIn([parseFloat(e.target.value) || 0])} className="h-10 rounded-xl font-bold border-2 text-center" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[8px] font-black uppercase opacity-40 ml-1">Fade Out (s)</Label>
                                                <Input type="number" step="0.1" value={fadeOut[0]} onChange={(e) => setFadeOut([parseFloat(e.target.value) || 0])} className="h-10 rounded-xl font-bold border-2 text-center" />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border-2 border-dashed">
                                            <div className="flex items-center gap-3"><RefreshCcw className="size-4 text-primary"/><Label className="text-[10px] font-black uppercase opacity-60">Auto Loop Track</Label></div>
                                            <Switch checked={isLooping} onCheckedChange={setIsLooping} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-20 flex flex-col items-center justify-center text-center opacity-20 gap-4">
                                        <Music className="size-16" />
                                        <p className="text-[11px] font-black uppercase tracking-widest leading-relaxed">Add background music<br/>to unlock studio</p>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="bg-muted/10 p-8 border-t flex flex-col gap-4">
                                <Button className="magic-button w-full h-18 rounded-[1.5rem] bg-primary text-white font-black transition-all active:scale-95 disabled:opacity-50 group flex items-center justify-center gap-4 shadow-3xl" onClick={startFusion} disabled={isProcessing || !audioFile || !isFFmpegReady}>
                                    <StarIcons />
                                    {isProcessing ? <Loader2 className="size-6 animate-spin" /> : <Zap className="size-7 group-hover:scale-125 transition-transform" />}
                                    <span className="uppercase tracking-tighter text-lg font-black">START FUSION</span>
                                </Button>
                                <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-30 text-center">Local FFmpeg.WASM Engine Active</p>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}

