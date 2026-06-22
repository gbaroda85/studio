"use client";

import { useState, useRef, type ChangeEvent, type DragEvent } from "react";
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
    Volume2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";

const StarIcons = () => (
    <>
        <div className="star-1">
            <svg viewBox="0 0 784.11 815.53" style={{ shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision', imageRendering: 'optimizeQuality', fillRule: 'evenodd', clipRule: 'evenodd' }}>
                <path className="fil0" d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
            </svg>
        </div>
        <div className="star-2">
            <svg viewBox="0 0 784.11 815.53" style={{ shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision', imageRendering: 'optimizeQuality', fillRule: 'evenodd', clipRule: 'evenodd' }}>
                <path className="fil0" d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
            </svg>
        </div>
        <div className="star-3">
            <svg viewBox="0 0 784.11 815.53" style={{ shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision', imageRendering: 'optimizeQuality', fillRule: 'evenodd', clipRule: 'evenodd' }}>
                <path className="fil0" d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
            </svg>
        </div>
        <div className="star-4">
            <svg viewBox="0 0 784.11 815.53" style={{ shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision', imageRendering: 'optimizeQuality', fillRule: 'evenodd', clipRule: 'evenodd' }}>
                <path className="fil0" d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
            </svg>
        </div>
        <div className="star-5">
            <svg viewBox="0 0 784.11 815.53" style={{ shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision', imageRendering: 'optimizeQuality', fillRule: 'evenodd', clipRule: 'evenodd' }}>
                <path className="fil0" d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
            </svg>
        </div>
        <div className="star-6">
            <svg viewBox="0 0 784.11 815.53" style={{ shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision', imageRendering: 'optimizeQuality', fillRule: 'evenodd', clipRule: 'evenodd' }}>
                <path className="fil0" d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
            </svg>
        </div>
    </>
);

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export default function VideoToMp3Converter() {
    const { toast } = useToast();
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isDragOver, setIsDragOver] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (file: File | null) => {
        if (file && file.type.startsWith('video/')) {
            // Increased limit to 3GB (3 * 1024 * 1024 * 1024)
            if (file.size > 3221225472) { 
                toast({ variant: 'destructive', title: 'File Too Large', description: 'Max 3GB supported.' });
                return;
            }
            setVideoFile(file);
            setVideoUrl(URL.createObjectURL(file));
            setAudioUrl(null);
            setProgress(0);
        } else if (file) {
            toast({ variant: 'destructive', title: 'Invalid File', description: 'Please upload a video file.' });
        }
    };

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
    const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
    const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
    const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };

    const extractAudio = async () => {
        if (!videoFile) return;
        setIsProcessing(true);
        setProgress(10);
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const arrayBuffer = await videoFile.arrayBuffer();
            setProgress(30);
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            setProgress(70);
            const wavBlob = audioBufferToWav(audioBuffer);
            const url = URL.createObjectURL(wavBlob);
            setAudioUrl(url);
            setProgress(100);
            toast({ title: 'Extraction Success', description: 'Audio isolated.' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Extraction Failed', description: 'Format not supported.' });
        } finally {
            setIsProcessing(false);
        }
    };

    const audioBufferToWav = (buffer: AudioBuffer) => {
        const numOfChan = buffer.numberOfChannels;
        const length = buffer.length * numOfChan * 2 + 44;
        const outBuffer = new ArrayBuffer(length);
        const view = new DataView(outBuffer);
        let pos = 0;
        const setUint32 = (data: number) => { view.setUint32(pos, data, true); pos += 4; };
        const setUint16 = (data: number) => { view.setUint16(pos, data, true); pos += 2; };
        setUint32(0x46464952); setUint32(length - 8); setUint32(0x45564157); setUint32(0x20746d66); setUint32(16); setUint16(1); setUint16(numOfChan); setUint32(buffer.sampleRate); setUint32(buffer.sampleRate * 2 * numOfChan); setUint16(numOfChan * 2); setUint16(16); setUint32(0x61746164); setUint32(length - pos - 4);
        const channels = [];
        for (let i = 0; i < buffer.numberOfChannels; i++) channels.push(buffer.getChannelData(i));
        let offset = 0;
        while (pos < length) {
            for (let i = 0; i < numOfChan; i++) {
                let sample = Math.max(-1, Math.min(1, channels[i][offset]));
                sample = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF);
                view.setInt16(pos, sample, true);
                pos += 2;
            }
            offset++;
        }
        return new Blob([outBuffer], { type: "audio/wav" });
    };

    const handleDownload = () => {
        if (!audioUrl || !videoFile) return;
        const link = document.createElement('a');
        link.href = audioUrl;
        const baseName = videoFile.name.split('.').slice(0, -1).join('.');
        link.download = `GR7-Audio-${baseName}.wav`;
        link.click();
    };

    const handleReset = () => {
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setVideoFile(null);
        setVideoUrl(null);
        setAudioUrl(null);
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
                                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">MEDIA WORKSPACE</CardTitle>
                            </CardHeader>
                            <CardContent className="p-10 md:p-16">
                                <div className="border-4 border-dashed border-muted-foreground/20 rounded-[2rem] p-8 md:p-12 flex flex-col items-center justify-center space-y-6 bg-muted/30 group relative">
                                    <div className="relative">
                                        <UploadCloud className="size-14 md:size-16 text-muted-foreground group-hover:text-primary transition-colors" />
                                        <Zap className="absolute -top-1 -right-1 size-5 md:size-6 text-yellow-500 animate-pulse" />
                                    </div>
                                    <div className="text-center px-4">
                                        <p className="text-lg md:text-xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Drop Video File here</p>
                                        <p className="text-[10px] md:text-sm text-muted-foreground mt-2 font-bold opacity-60 uppercase tracking-widest">Max 3GB. Extraction happens locally.</p>
                                    </div>
                                </div>
                                <input ref={fileInputRef} type="file" className="hidden" accept="video/*" onChange={onFileChange} />
                            </CardContent>
                            <CardFooter className="justify-center gap-6 text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 bg-muted/10 pt-6 px-4">
                                <div className="flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-green-500" /> SECURE RAM</div>
                                <div className="flex items-center gap-1.5"><Zap className="size-3.5 text-yellow-500" /> INSTANT RENDER</div>
                                <div className="flex items-center gap-1.5"><Volume2 className="size-3.5 text-primary" /> HD AUDIO</div>
                            </CardFooter>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="process" 
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-2xl px-4"
                    >
                        <Card className="overflow-hidden border-2 shadow-3xl flex flex-col bg-card/50 rounded-[2.5rem]">
                            <CardHeader className="bg-muted/30 border-b py-4 px-6 flex flex-row items-center justify-between">
                                <div className="flex items-center gap-2 truncate pr-4">
                                    <FileVideo className="h-4 w-4 text-primary shrink-0" />
                                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground truncate">{videoFile.name}</CardTitle>
                                </div>
                                <Badge className="font-mono text-[9px]">{formatBytes(videoFile.size)}</Badge>
                            </CardHeader>
                            <CardContent className="p-6 md:p-10 flex flex-col gap-8 bg-slate-100 dark:bg-black/20 shadow-inner min-h-[400px]">
                                <div className="w-full relative group">
                                    <video 
                                        src={videoUrl!} 
                                        controls 
                                        className="w-full max-h-[45vh] rounded-2xl shadow-2xl border-4 border-white dark:border-slate-800 bg-black" 
                                    />
                                    {isProcessing && (
                                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-10 gap-4">
                                            <Loader2 className="h-12 w-12 animate-spin text-primary opacity-80 stroke-[3]" />
                                            <div className="space-y-2 w-full max-w-[200px] px-4">
                                                <p className="text-[10px] font-black uppercase text-white tracking-widest text-center animate-pulse">Extracting Audio Track...</p>
                                                <Progress value={progress} className="h-1.5 shadow-inner" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <AnimatePresence>
                                    {audioUrl && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 20 }} 
                                            animate={{ opacity: 1, y: 0 }}
                                            className="w-full space-y-6 pt-6 border-t-2 border-dashed border-primary/20"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="size-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600 shadow-lg shrink-0 border border-green-500/20">
                                                    <Music className="size-6" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-sm font-black uppercase tracking-tighter text-green-700">Audio isolated successfully!</p>
                                                    <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">High-fidelity WAV container render</p>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-white dark:bg-slate-900 p-2 rounded-[2rem] border-2 shadow-xl">
                                                <audio controls src={audioUrl} className="w-full h-12" />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {!audioUrl && !isProcessing && (
                                    <div className="p-4 bg-primary/5 rounded-2xl border-2 border-dashed border-primary/20 flex gap-4">
                                        <Zap className="size-5 text-yellow-500 shrink-0 mt-0.5" />
                                        <p className="text-[10px] text-primary/80 font-bold leading-relaxed uppercase text-left">
                                            We decode the audio track into raw PCM buffers for 100% original fidelity. Click 'Extract Audio' to begin.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="bg-white dark:bg-slate-950 border-t p-6 md:p-8 flex flex-col gap-4">
                                {!audioUrl ? (
                                    <Button 
                                        className="magic-button w-full h-16 md:h-18 text-lg font-black bg-primary hover:bg-transparent border-4 border-primary text-white hover:text-primary transition-all active:scale-95 disabled:opacity-50 group flex items-center justify-center gap-4 px-10 shadow-xl" 
                                        onClick={extractAudio}
                                        disabled={isProcessing}
                                    >
                                        <StarIcons />
                                        {isProcessing ? "DECODING..." : "EXTRACT AUDIO"}
                                    </Button>
                                ) : (
                                    <Button 
                                        className="magic-button magic-button-success w-full h-16 md:h-18 text-lg font-black bg-green-600 hover:bg-transparent border-4 border-green-600 text-white hover:text-green-600 rounded-full transition-all active:scale-95 group flex items-center justify-center gap-4 shadow-3xl" 
                                        onClick={handleDownload}
                                    >
                                        <StarIcons />
                                        <Download className="mr-3 size-8 group-hover:translate-y-1 transition-transform" /> 
                                        <span className="uppercase tracking-tighter text-lg">SAVE AUDIO FILE</span>
                                    </Button>
                                )}
                                
                                <div className="flex items-center justify-between w-full pt-2">
                                    <Button variant="ghost" onClick={handleReset} className="h-10 border-2 px-6 font-black uppercase text-[10px] rounded-xl hover:bg-destructive/5 hover:text-destructive transition-all">
                                        <RefreshCcw className="mr-1.5 size-3" /> Start Over
                                    </Button>
                                    <div className="flex items-center gap-2 text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">
                                        <ShieldCheck className="size-3.5 text-green-500" /> 100% LOCAL
                                    </div>
                                </div>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
