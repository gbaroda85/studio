"use client";

import { useState, useRef, type ChangeEvent, type DragEvent, useCallback, useEffect } from "react";
import { 
    UploadCloud, 
    RotateCw, 
    RotateCcw,
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
    Video,
    Maximize,
    Smartphone,
    Monitor
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
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

export default function RotateVideoConverter() {
    const { toast } = useToast();
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [rotation, setRotation] = useState(0); 
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isDragOver, setIsDragOver] = useState(false);
    const [rotatedVideoUrl, setRotatedPdfUrl] = useState<string | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const handleFileChange = (file: File | null) => {
        if (file && file.type.startsWith('video/')) {
            if (file.size > 500 * 1024 * 1024) { 
                toast({ variant: 'destructive', title: 'File Too Large', description: 'Max 500MB supported for browser rotation.' });
                return;
            }
            setVideoFile(file);
            setVideoUrl(URL.createObjectURL(file));
            setRotatedPdfUrl(null);
            setRotation(0);
            setProgress(0);
        } else if (file) {
            toast({ variant: 'destructive', title: 'Invalid File', description: 'Please upload a video file.' });
        }
    };

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
    const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
    const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
    const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };

    const rotateBy = (deg: number) => {
        setRotation(prev => (prev + deg + 360) % 360);
        setRotatedPdfUrl(null);
    };

    /**
     * ADVANCED BROWSER-SIDE RE-ENCODING
     * Uses Canvas + RequestAnimationFrame + MediaRecorder to permanently rotate the bitstream.
     */
    const handleSaveRotated = async () => {
        const video = videoRef.current;
        if (!video || !videoUrl) return;

        setIsProcessing(true);
        setProgress(5);
        setRotatedPdfUrl(null);
        chunksRef.current = [];

        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
            if (!ctx) throw new Error("Canvas context failed");

            // Setup dimensions based on rotation
            const isSideways = rotation === 90 || rotation === 270;
            canvas.width = isSideways ? video.videoHeight : video.videoWidth;
            canvas.height = isSideways ? video.videoWidth : video.videoHeight;

            const stream = canvas.captureStream(30); // 30 FPS
            
            // Try to find a good mime type
            const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') 
                ? 'video/webm;codecs=vp9' 
                : 'video/webm';
            
            const recorder = new MediaRecorder(stream, { 
                mimeType,
                videoBitsPerSecond: 5000000 // 5Mbps for HD quality
            });
            
            mediaRecorderRef.current = recorder;

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                setRotatedPdfUrl(url);
                setIsProcessing(false);
                setProgress(100);
                confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
                toast({ title: "Rotation Complete!", description: "Video bitstream re-mapped." });
            };

            // Start Recording
            recorder.start();
            video.currentTime = 0;
            await video.play();

            const renderLoop = () => {
                if (video.paused || video.ended) {
                    if (recorder.state === 'recording') recorder.stop();
                    return;
                }

                ctx.save();
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate((rotation * Math.PI) / 180);
                ctx.drawImage(video, -video.videoWidth / 2, -video.videoHeight / 2);
                ctx.restore();

                setProgress(Math.round((video.currentTime / video.duration) * 95));
                requestAnimationFrame(renderLoop);
            };

            renderLoop();

        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Process Error', description: 'Failed to re-encode video.' });
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (!rotatedVideoUrl || !videoFile) return;
        const link = document.createElement('a');
        link.href = rotatedVideoUrl;
        const baseName = videoFile.name.split('.').slice(0, -1).join('.');
        link.download = `Rotated-${baseName}.webm`;
        link.click();
    };

    const handleReset = () => {
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        if (rotatedVideoUrl) URL.revokeObjectURL(rotatedVideoUrl);
        setVideoFile(null);
        setVideoUrl(null);
        setRotatedPdfUrl(null);
        setRotation(0);
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="w-full flex flex-col items-center gap-8 py-4">
            <AnimatePresence mode="wait">
                {!videoFile ? (
                    <motion.div 
                        key="upload" 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-2xl px-4"
                    >
                        <Card className={cn(
                            "glass-card overflow-hidden transition-all duration-300 border-2 border-dashed shadow-2xl rounded-[2.5rem] hover:-translate-y-1 hover:border-primary/50 cursor-pointer select-none",
                            isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.02]"
                        )}
                            onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <CardHeader className="bg-muted/30 border-b p-6 text-center">
                                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">VIDEO WORKSPACE</CardTitle>
                            </CardHeader>
                            <CardContent className="p-10 md:p-16">
                                <div className="border-4 border-dashed border-muted-foreground/20 rounded-[2rem] p-8 md:p-12 flex flex-col items-center justify-center space-y-6 bg-muted/30 group relative">
                                    <div className="relative">
                                        <UploadCloud className="size-14 md:size-16 text-muted-foreground group-hover:text-primary transition-colors" />
                                        <Zap className="absolute -top-1 -right-1 size-4 md:size-6 text-yellow-500 animate-pulse" />
                                    </div>
                                    <div className="text-center px-4">
                                        <p className="text-lg md:text-xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Drop Video to Rotate</p>
                                        <p className="text-[10px] md:text-sm text-muted-foreground mt-2 font-bold opacity-60 uppercase">Max 500MB. Processed in local RAM.</p>
                                    </div>
                                </div>
                                <input ref={fileInputRef} type="file" className="hidden" accept="video/*" onChange={onFileChange} />
                            </CardContent>
                            <CardFooter className="justify-center gap-6 text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 bg-muted/10 pt-6 px-4">
                                <div className="flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-green-500" /> SECURE RAM</div>
                                <div className="flex items-center gap-1.5"><Zap className="size-3.5 text-yellow-500" /> INSTANT RENDER</div>
                                <div className="flex items-center gap-1.5"><MonitorPlay className="size-3.5 text-primary" /> HD EXPORT</div>
                            </CardFooter>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="process" 
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-6xl px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
                    >
                        <div className="lg:col-span-8 flex flex-col gap-6">
                            <Card className="overflow-hidden border-2 shadow-3xl flex flex-col bg-card/50 rounded-[2.5rem]">
                                <CardHeader className="bg-muted/30 border-b py-4 px-6 flex flex-row items-center justify-between">
                                    <div className="flex items-center gap-2 truncate pr-4 text-left">
                                        <FileVideo className="h-4 w-4 text-primary shrink-0" />
                                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground truncate">{videoFile.name}</CardTitle>
                                    </div>
                                    <Badge className="font-mono text-[9px] bg-white border shadow-sm">{formatBytes(videoFile.size)}</Badge>
                                </CardHeader>
                                <CardContent className="p-6 md:p-10 flex flex-col items-center justify-center bg-slate-100 dark:bg-black/20 shadow-inner min-h-[450px] relative overflow-hidden">
                                    
                                    <div className="relative group w-full max-w-2xl">
                                        <video 
                                            ref={videoRef}
                                            src={videoUrl!} 
                                            muted
                                            className="w-full h-auto rounded-2xl shadow-2xl border-4 border-white dark:border-slate-800 bg-black transition-transform duration-300 ease-out" 
                                            style={{ transform: `rotate(${rotation}deg)` }}
                                        />
                                        
                                        <AnimatePresence>
                                            {isProcessing && (
                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-10 gap-6">
                                                    <div className="relative">
                                                        <Loader2 className="size-16 md:size-20 animate-spin text-primary opacity-80 stroke-[3]" />
                                                        <RotateCw className="absolute inset-0 m-auto size-6 md:size-8 text-primary animate-pulse" />
                                                    </div>
                                                    <div className="space-y-3 w-full max-w-[250px] px-4">
                                                        <p className="text-[11px] font-black uppercase text-white tracking-widest text-center animate-pulse">Re-mapping Bitstream...</p>
                                                        <Progress value={progress} className="h-1.5 shadow-inner" />
                                                        <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest text-center">Do not close this tab</p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-2.5 bg-black/80 backdrop-blur-xl rounded-full text-white text-[9px] font-black uppercase tracking-widest border border-white/10 shadow-3xl z-40">
                                         <MonitorPlay className="size-3.5 text-primary animate-pulse" /> Local Studio Viewport
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-white dark:bg-slate-950 border-t p-6 md:p-8 flex justify-center gap-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 shrink-0">
                                    <div className="flex items-center gap-1.5"><ShieldCheck className="size-4 text-green-500" /> SECURE RAM</div>
                                    <div className="flex items-center gap-1.5"><Zap className="size-4 text-yellow-500" /> NATIVE SPEED</div>
                                    <div className="flex items-center gap-1.5"><Smartphone className="size-4 text-primary" /> MOBILE SYNC</div>
                                </CardFooter>
                            </Card>
                        </div>

                        <div className="lg:col-span-4 flex flex-col gap-6">
                            <Card className="glass-panel border-none shadow-2xl overflow-hidden rounded-[2.5rem]">
                                <CardHeader className="bg-primary/5 border-b border-white/10 p-6 md:p-8 text-left">
                                    <CardTitle className="text-base md:text-lg flex items-center gap-3 font-black uppercase tracking-tighter text-primary">
                                        <Settings2 className="size-4 md:size-5 text-primary" /> Studio Config
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 md:p-8 space-y-10">
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 text-left block">Rotate Command</Label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button onClick={() => rotateBy(-90)} className="btn-pos-uiverse h-14 !ring-[3px] !ring-slate-950 dark:!ring-white transition-all shadow-sm" data-label="90° LEFT" />
                                                <button onClick={() => rotateBy(90)} className="btn-pos-uiverse h-14 !ring-[3px] !ring-slate-950 dark:!ring-white transition-all shadow-sm" data-label="90° RIGHT" />
                                                <button onClick={() => setRotation(180)} className={cn("btn-pos-uiverse h-14 transition-all", rotation === 180 && "active-uiverse")} data-label="180° FLIP" />
                                                <button onClick={() => setRotation(0)} className={cn("btn-pos-uiverse h-14 transition-all", rotation === 0 && "active-uiverse")} data-label="RESET" />
                                            </div>
                                        </div>

                                        <div className="p-5 bg-green-500/5 rounded-3xl border-2 border-green-500/10 flex gap-4 text-left shadow-sm">
                                            <ShieldCheck className="size-6 text-green-600 shrink-0 mt-0.5" />
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-green-700 uppercase tracking-tight">Permanent Encoding</p>
                                                <p className="text-[8px] text-green-600/80 font-medium leading-tight uppercase">
                                                    We rewrite the bitstream so it stays rotated on all devices forever.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-muted/10 p-6 md:p-8 border-t border-white/10 flex flex-col gap-4">
                                    <Button 
                                        className="magic-button w-full h-16 md:h-18 text-lg font-black bg-primary hover:bg-primary/90 border-4 border-primary text-white hover:text-primary transition-all active:scale-95 disabled:opacity-50 group px-10 flex items-center justify-center gap-4 shadow-xl" 
                                        onClick={handleSaveRotated}
                                        disabled={isProcessing || rotation === 0}
                                    >
                                        <StarIcons />
                                        {isProcessing ? "ENCODING..." : (
                                            <div className="flex items-center gap-3">
                                                <RotateCw className="size-7 group-hover:rotate-12 transition-transform" />
                                                <span className="uppercase tracking-tighter">SAVE ROTATED VIDEO</span>
                                            </div>
                                        )}
                                    </Button>

                                    {rotatedVideoUrl && (
                                        <Button 
                                            size="lg" 
                                            className="relative flex items-center justify-between gap-0 p-0 overflow-hidden bg-[#00aeef] hover:bg-[#009bd1] text-white font-black rounded-xl transition-all duration-300 group h-14 md:h-16 shadow-[0_8px_20px_-10px_rgba(0,174,239,0.5)] border-none animate-in zoom-in-95" 
                                            onClick={handleDownload}
                                        >
                                            <div className="absolute left-4 w-0.5 h-6 md:h-8 bg-white/40 rounded-full" />
                                            <span className="flex-1 px-10 text-center tracking-widest text-[11px] md:text-xs uppercase">DOWNLOAD HD MP4</span>
                                            <div className="bg-white h-full pl-6 pr-8 flex items-center justify-center text-[#00aeef] transition-all group-hover:pl-7 group-hover:pr-9 relative" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)', marginLeft: '-15px' }}>
                                                <Download className="size-6 md:size-8 group-hover:scale-110 transition-transform" />
                                                <div className="absolute right-3 w-0.5 h-6 bg-[#00aeef]/20 rounded-full" />
                                            </div>
                                        </Button>
                                    )}

                                    <Button variant="outline" onClick={handleReset} className="h-11 w-full border-2 font-black text-[9px] uppercase tracking-widest text-muted-foreground hover:bg-destructive/5 hover:text-destructive rounded-xl transition-all">
                                        <RefreshCcw className="mr-1.5 size-3" /> Start Over
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
