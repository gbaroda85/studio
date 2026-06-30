"use client";

import { useState, useRef, type ChangeEvent, type DragEvent, useEffect, useCallback } from "react";
import { 
    UploadCloud, 
    Music, 
    FileVideo, 
    Download, 
    Loader2, 
    ShieldCheck, 
    Zap, 
    RefreshCcw, 
    CheckCircle2, 
    Sparkles,
    Eye,
    X,
    Settings2,
    MonitorPlay,
    Volume2,
    Plus,
    RotateCcw,
    Monitor
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
import { motion, AnimatePresence } from "framer-motion";
import confetti from 'canvas-confetti';

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

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i];
}

export default function AddAudioToVideo() {
    const { toast } = useToast();
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isDragOver, setIsDragOver] = useState(false);

    // Mixer Settings
    const [videoVolume, setVideoVolume] = useState([100]);
    const [audioVolume, setAudioVolume] = useState([100]);
    const [isLooping, setIsLooping] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const audioInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const handleVideoChange = (file: File | null) => {
        if (file && file.type.startsWith('video/')) {
            if (file.size > 500 * 1024 * 1024) {
                toast({ variant: 'destructive', title: 'Video Too Large', description: 'Max 500MB for local merge.' });
                return;
            }
            setVideoFile(file);
            setVideoUrl(URL.createObjectURL(file));
            setResultUrl(null);
        }
    };

    const handleAudioChange = (file: File | null) => {
        if (file && file.type.startsWith('audio/')) {
            setAudioFile(file);
            setAudioUrl(URL.createObjectURL(file));
            setResultUrl(null);
        }
    };

    const startMerge = async () => {
        if (!videoUrl || !audioUrl) return;

        setIsProcessing(true);
        setProgress(5);
        chunksRef.current = [];

        const video = videoRef.current;
        const audio = audioRef.current;
        if (!video || !audio) return;

        try {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d', { alpha: false });
            if (!ctx) throw new Error("Canvas failure");

            // Audio Context Setup
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const videoSrc = audioCtx.createMediaElementSource(video);
            const audioSrc = audioCtx.createMediaElementSource(audio);
            
            const videoGain = audioCtx.createGain();
            const audioGain = audioCtx.createGain();
            
            videoGain.gain.value = videoVolume[0] / 100;
            audioGain.gain.value = audioVolume[0] / 100;

            const dest = audioCtx.createMediaStreamDestination();
            
            videoSrc.connect(videoGain);
            videoGain.connect(dest);
            audioSrc.connect(audioGain);
            audioGain.connect(dest);

            // Combine Video Track + Mixed Audio Track
            const videoStream = (video as any).captureStream ? (video as any).captureStream() : (video as any).mozCaptureStream();
            const mixedStream = new MediaStream([
                videoStream.getVideoTracks()[0],
                dest.stream.getAudioTracks()[0]
            ]);

            const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm';
            const recorder = new MediaRecorder(mixedStream, { mimeType, videoBitsPerSecond: 8000000 });
            mediaRecorderRef.current = recorder;

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                setResultUrl(URL.createObjectURL(blob));
                setIsProcessing(false);
                setProgress(100);
                confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
                toast({ title: "Merge Complete!", description: "Video bitstream re-mapped with new audio." });
            };

            // Start Playback and Recording
            audio.loop = isLooping;
            video.currentTime = 0;
            audio.currentTime = 0;
            
            recorder.start();
            await video.play();
            await audio.play();

            const renderLoop = () => {
                if (video.paused || video.ended) {
                    if (recorder.state === 'recording') {
                        recorder.stop();
                        audio.pause();
                    }
                    return;
                }

                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                setProgress(Math.round((video.currentTime / video.duration) * 95));
                requestAnimationFrame(renderLoop);
            };

            renderLoop();

        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Process Error' });
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (!resultUrl || !videoFile) return;
        const link = document.createElement('a');
        link.href = resultUrl;
        const name = videoFile.name.split('.').slice(0, -1).join('.');
        link.download = `Fused-${name}.webm`;
        link.click();
    };

    const handleReset = () => {
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        if (resultUrl) URL.revokeObjectURL(resultUrl);
        setVideoFile(null);
        setAudioFile(null);
        setVideoUrl(null);
        setAudioUrl(null);
        setResultUrl(null);
        setProgress(0);
    };

    return (
        <div className="w-full flex flex-col items-center gap-8 py-4">
            <AnimatePresence mode="wait">
                {!videoFile || !audioFile ? (
                    <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-4xl grid md:grid-cols-2 gap-6 px-4">
                        {/* Video Upload */}
                        <Card className={cn(
                            "glass-card overflow-hidden border-2 border-dashed shadow-2xl rounded-[2.5rem] hover:border-primary/50 cursor-pointer select-none",
                            videoFile ? "border-green-500/40 bg-green-500/5" : "bg-card/50"
                        )} onClick={() => videoInputRef.current?.click()}>
                            <CardContent className="p-10 flex flex-col items-center justify-center gap-4">
                                <div className={cn("size-16 rounded-2xl flex items-center justify-center shadow-xl transition-all", videoFile ? "bg-green-500 text-white" : "bg-primary/10 text-primary")}>
                                    <FileVideo className="size-8" />
                                </div>
                                <div className="text-center">
                                    <p className="font-black uppercase tracking-widest text-xs">{videoFile ? 'VIDEO LOADED' : 'UPLOAD VIDEO'}</p>
                                    {videoFile && <p className="text-[8px] font-mono opacity-50 mt-1 uppercase">{videoFile.name}</p>}
                                </div>
                                <input ref={videoInputRef} type="file" className="hidden" accept="video/*" onChange={(e) => handleVideoChange(e.target.files?.[0] || null)} />
                            </CardContent>
                        </Card>

                        {/* Audio Upload */}
                        <Card className={cn(
                            "glass-card overflow-hidden border-2 border-dashed shadow-2xl rounded-[2.5rem] hover:border-primary/50 cursor-pointer select-none",
                            audioFile ? "border-green-500/40 bg-green-500/5" : "bg-card/50"
                        )} onClick={() => audioInputRef.current?.click()}>
                            <CardContent className="p-10 flex flex-col items-center justify-center gap-4">
                                <div className={cn("size-16 rounded-2xl flex items-center justify-center shadow-xl transition-all", audioFile ? "bg-green-500 text-white" : "bg-indigo-500/10 text-indigo-500")}>
                                    <Music className="size-8" />
                                </div>
                                <div className="text-center">
                                    <p className="font-black uppercase tracking-widest text-xs">{audioFile ? 'AUDIO LOADED' : 'UPLOAD MUSIC'}</p>
                                    {audioFile && <p className="text-[8px] font-mono opacity-50 mt-1 uppercase">{audioFile.name}</p>}
                                </div>
                                <input ref={audioInputRef} type="file" className="hidden" accept="audio/*" onChange={(e) => handleAudioChange(e.target.files?.[0] || null)} />
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div key="studio" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start px-4">
                        <div className="lg:col-span-8 space-y-6">
                            <Card className="overflow-hidden border-2 shadow-3xl h-full flex flex-col bg-card/50 rounded-[2.5rem] relative">
                                <CardHeader className="bg-muted/30 border-b py-4 px-6 flex flex-row items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <MonitorPlay className="size-5 text-primary" />
                                        <CardTitle className="text-[10px] font-black uppercase tracking-widest">Mixer Viewport</CardTitle>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="font-mono text-[9px]">{formatBytes(videoFile.size)}</Badge>
                                        <Button variant="ghost" size="icon" onClick={handleReset} className="h-8 w-8 text-destructive"><X size={16}/></Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 md:p-10 flex flex-col items-center justify-center bg-black/5 dark:bg-black/40 min-h-[450px] relative overflow-hidden">
                                    <div className="relative group w-full max-w-2xl">
                                        <video ref={videoRef} src={videoUrl!} muted className="w-full h-auto rounded-2xl shadow-2xl border-4 border-white dark:border-slate-800 bg-black" />
                                        <audio ref={audioRef} src={audioUrl!} className="hidden" />
                                        
                                        <AnimatePresence>
                                            {isProcessing && (
                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/70 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center z-50 gap-6">
                                                    <div className="relative">
                                                        <Loader2 className="size-20 animate-spin text-primary opacity-80 stroke-[3]" />
                                                        <Zap className="absolute inset-0 m-auto size-10 text-primary animate-pulse" />
                                                    </div>
                                                    <div className="space-y-3 w-full max-w-[280px]">
                                                        <p className="text-sm font-black uppercase text-white tracking-widest text-center animate-pulse">Rendering Fusion...</p>
                                                        <Progress value={progress} className="h-1.5 shadow-inner" />
                                                        <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest text-center">DO NOT CLOSE TAB</p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-white dark:bg-slate-950 border-t p-6 flex justify-center gap-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">
                                    <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-green-500" /> SECURE RAM</div>
                                    <div className="flex items-center gap-2"><Zap className="size-4 text-yellow-500" /> INSTANT MIX</div>
                                </CardFooter>
                            </Card>
                        </div>

                        <div className="lg:col-span-4 space-y-6">
                            <Card className="glass-panel border-none shadow-2xl overflow-hidden rounded-[2.5rem]">
                                <CardHeader className="bg-primary/5 border-b p-6">
                                    <CardTitle className="text-base flex items-center gap-3 font-black uppercase tracking-tighter text-primary">
                                        <Settings2 className="size-5" /> Audio Mixer
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-10 text-left">
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center"><Label className="text-[10px] font-black uppercase opacity-60">Original Video Sound</Label><Badge variant="secondary" className="font-mono text-[9px]">{videoVolume[0]}%</Badge></div>
                                            <Slider min={0} max={100} step={1} value={videoVolume} onValueChange={setVideoVolume} />
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center"><Label className="text-[10px] font-black uppercase opacity-60">New Audio Track</Label><Badge variant="secondary" className="font-mono text-[9px]">{audioVolume[0]}%</Badge></div>
                                            <Slider min={0} max={200} step={1} value={audioVolume} onValueChange={setAudioVolume} />
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border-2 border-dashed">
                                            <div className="flex items-center gap-3">
                                                <RefreshCcw className="size-4 text-primary" />
                                                <div className="text-left">
                                                    <p className="text-[10px] font-black uppercase leading-none">Loop Audio</p>
                                                    <p className="text-[7px] font-bold opacity-40 uppercase mt-1">Repeat track if short</p>
                                                </div>
                                            </div>
                                            <Switch checked={isLooping} onCheckedChange={setIsLooping} />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-muted/10 p-8 border-t flex flex-col gap-4">
                                    {!resultUrl ? (
                                        <Button 
                                            className="magic-button w-full h-18 rounded-[1.5rem] bg-primary hover:bg-transparent border-4 border-primary text-white hover:text-primary transition-all active:scale-95 disabled:opacity-50 group px-10 flex items-center justify-center gap-4 shadow-3xl" 
                                            onClick={startMerge}
                                            disabled={isProcessing}
                                        >
                                            <StarIcons />
                                            {isProcessing ? "MIXING..." : (
                                                <div className="flex items-center gap-3">
                                                    <Zap className="size-7 group-hover:scale-125 transition-transform" />
                                                    <span className="uppercase tracking-tighter text-lg md:text-xl">START FUSION</span>
                                                </div>
                                            )}
                                        </Button>
                                    ) : (
                                        <Button 
                                            size="lg" 
                                            className="relative flex items-center justify-between gap-0 p-0 overflow-hidden bg-[#00aeef] hover:bg-[#009bd1] text-white font-black rounded-xl transition-all duration-300 group h-14 md:h-18 shadow-[0_8px_20px_-10px_rgba(0,174,239,0.5)] hover:shadow-[0_12px_25px_-10px_rgba(0,174,239,0.6)] hover:-translate-y-1 active:scale-95 border-none animate-in zoom-in-95" 
                                            onClick={handleDownload}
                                        >
                                            <div className="absolute left-6 w-0.5 h-10 bg-white/40 rounded-full" />
                                            <span className="flex-1 px-10 text-center tracking-widest text-[11px] md:text-xs uppercase">DOWNLOAD HD MIX</span>
                                            <div className="bg-white h-full pl-6 pr-8 flex items-center justify-center text-[#00aeef] transition-all group-hover:pl-7 group-hover:pr-9 relative" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)', marginLeft: '-15px' }}>
                                                <Download className="size-6 md:size-8 group-hover:scale-110 transition-transform" />
                                                <div className="absolute right-3 w-0.5 h-6 bg-[#00aeef]/20 rounded-full" />
                                            </div>
                                        </Button>
                                    )}
                                    <p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-30 text-center mt-2">Local Workspace Mapping Active</p>
                                </CardFooter>
                            </Card>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
