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
            if (file.size > 200 * 1024 * 1024) { 
                toast({ variant: 'destructive', title: 'File Too Large', description: 'Max 200MB supported.' });
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
        const channels = [];
        let offset = 0;
        let pos = 0;
        const setUint32 = (data: number) => { view.setUint32(pos, data, true); pos += 4; };
        const setUint16 = (data: number) => { view.setUint16(pos, data, true); pos += 2; };
        setUint32(0x46464952); setUint32(length - 8); setUint32(0x45564157); setUint32(0x20746d66); setUint32(16); setUint16(1); setUint16(numOfChan); setUint32(buffer.sampleRate); setUint32(buffer.sampleRate * 2 * numOfChan); setUint16(numOfChan * 2); setUint16(16); setUint32(0x61746164); setUint32(length - pos - 4);
        for (let i = 0; i < buffer.numberOfChannels; i++) channels.push(buffer.getChannelData(i));
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
        <div className="w-full max-w-7xl animate-in fade-in duration-500 px-4 flex flex-col gap-8 pb-20 mx-auto">
            {!videoFile ? (
                <div className="w-full max-w-4xl py-4 flex flex-col items-center justify-center gap-6 mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4 mb-6">
                        <div className="mx-auto mb-2 grid size-16 place-items-center rounded-[2rem] bg-indigo-500/10 text-indigo-600 shadow-xl relative">
                            <Music className="size-8" />
                            <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground size-5 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                                <Sparkles className="size-3" />
                            </div>
                        </div>
                        <h1 className="text-2xl md:text-5xl font-black font-headline tracking-tighter uppercase leading-none">
                            Video to <span className="text-gradient-hero">MP3 Studio</span>
                        </h1>
                        <p className="text-xs md:text-sm text-muted-foreground font-semibold max-xl mx-auto">
                            Extract high-fidelity audio from any video instantly. <br/>100% Private local RAM extraction.
                        </p>
                    </motion.div>

                    <Card className={cn(
                        "w-full max-w-2xl glass-card overflow-hidden transition-all duration-300 border-2 border-dashed shadow-2xl rounded-[2.5rem] hover:-translate-y-1 hover:border-primary/50",
                        isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.02]"
                    )}
                        onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <CardHeader className="bg-muted/30 border-b p-6 text-center">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">MEDIA WORKSPACE</CardTitle>
                        </CardHeader>
                        <CardContent className="p-10 md:p-16">
                            <div className="border-4 border-dashed border-muted-foreground/20 rounded-[2rem] p-8 md:p-12 flex flex-col items-center justify-center space-y-6 bg-muted/30 group relative">
                                <div className="relative">
                                    <UploadCloud className="size-14 md:size-16 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <Zap className="absolute -top-1 -right-1 size-5 md:size-6 text-yellow-500 animate-pulse" />
                                </div>
                                <div className="text-center px-4">
                                    <p className="text-lg md:text-xl font-black uppercase tracking-tighter">Drop Video File here</p>
                                    <p className="text-[10px] md:text-sm text-muted-foreground mt-2 font-bold opacity-60 uppercase">Extraction happens locally in RAM.</p>
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
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-7">
                        <Card className="overflow-hidden border-2 shadow-3xl h-full flex flex-col bg-card/50 rounded-[2.5rem]">
                            <CardHeader className="bg-muted/30 border-b py-3 px-6 flex flex-row items-center justify-between">
                                <div className="flex items-center gap-2 truncate pr-4">
                                    <FileVideo className="h-4 w-4 text-primary shrink-0" />
                                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground truncate">{videoFile.name}</CardTitle>
                                </div>
                                <Badge className="font-mono text-[9px]">{formatBytes(videoFile.size)}</Badge>
                            </CardHeader>
                            <CardContent className="p-4 md:p-8 flex-1 bg-black/10 dark:bg-black/40 min-h-[400px] flex items-center justify-center relative shadow-inner">
                                <AnimatePresence mode="wait">
                                    {isProcessing ? (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-6 text-center">
                                            <div className="relative">
                                                <Loader2 className="h-16 w-16 animate-spin text-primary stroke-[3]" />
                                                <Volume2 className="absolute inset-0 m-auto h-7 w-7 text-primary/30 animate-pulse" />
                                            </div>
                                            <div className="space-y-3 w-full max-w-[200px]">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">Extracting Audio Buffer...</p>
                                                <Progress value={progress} className="h-1" />
                                            </div>
                                        </motion.div>
                                    ) : audioUrl ? (
                                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md flex flex-col items-center gap-10">
                                            <div className="size-40 rounded-full bg-green-500/10 flex items-center justify-center border-4 border-dashed border-green-500/30 animate-pulse shadow-2xl relative">
                                                <Music className="size-20 text-green-600" />
                                                <Sparkles className="absolute -top-2 -right-2 text-yellow-400 size-8" />
                                            </div>
                                            <div className="w-full space-y-4">
                                                <p className="text-center font-black uppercase tracking-widest text-green-700 text-lg">Audio Stack Ready!</p>
                                                <audio controls src={audioUrl} className="w-full h-14 rounded-full shadow-2xl border-4 border-white" />
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <video src={videoUrl!} controls className="w-full max-h-[55vh] rounded-xl shadow-2xl border-4 border-white dark:border-slate-800" />
                                    )}
                                </AnimatePresence>
                            </CardContent>
                            <CardFooter className="bg-white dark:bg-slate-950 border-t p-6 md:p-8">
                                <div className="flex items-center justify-center gap-10 w-full text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">
                                    <div className="flex items-center gap-2"><ShieldCheck className="size-4" /> SECURE RAM</div>
                                    <div className="flex items-center gap-2"><MonitorPlay className="size-4" /> PREVIEW SYNC</div>
                                    <div className="flex items-center gap-2"><Zap className="size-4" /> NATIVE RENDER</div>
                                </div>
                            </CardFooter>
                        </Card>
                    </div>

                    <div className="lg:col-span-5 space-y-6">
                        <Card className="glass-panel border-none shadow-2xl overflow-hidden rounded-[2.5rem]">
                            <CardHeader className="bg-primary/5 border-b border-white/10 p-6">
                                <CardTitle className="text-lg md:text-xl flex items-center gap-3 font-black uppercase tracking-tighter">
                                    <Settings2 className="size-6 text-primary" /> Extraction Panel
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Engine Protocol</Label>
                                    <div className="p-5 bg-primary/5 rounded-[1.5rem] border-2 border-primary/10 flex gap-4">
                                        <Zap className="size-6 text-yellow-500 shrink-0 mt-0.5" />
                                        <p className="text-[10px] text-primary/80 font-bold leading-relaxed uppercase">
                                            <span className="font-black block mb-1 text-primary">PCM DECODING:</span>
                                            We decode the video's audio track into 32-bit float buffers for maximum fidelity before encoding.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-white/5">
                                     {!audioUrl ? (
                                        <Button 
                                            className="magic-button w-full h-16 md:h-20 text-lg md:text-xl font-black bg-primary hover:bg-transparent border-4 border-primary text-white hover:text-primary rounded-full transition-all active:scale-95 disabled:opacity-50 group flex items-center justify-center gap-4 px-10" 
                                            onClick={extractAudio}
                                            disabled={isProcessing}
                                        >
                                            <StarIcons />
                                            {isProcessing ? (
                                                <div className="flex items-center gap-3">
                                                    <Loader2 className="size-6 md:size-8 animate-spin" />
                                                    <span className="uppercase text-sm tracking-tighter">DECODING...</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <Volume2 className="size-7 md:size-8 group-hover:scale-110 transition-transform" />
                                                    <span className="uppercase tracking-tighter">EXTRACT AUDIO</span>
                                                </div>
                                            )}
                                        </Button>
                                     ) : (
                                        <div className="space-y-4 animate-in zoom-in-95">
                                             <Button 
                                                className="magic-button magic-button-success w-full h-16 md:h-20 text-lg md:text-xl font-black bg-green-600 hover:bg-transparent border-4 border-green-600 text-white hover:text-green-600 rounded-full transition-all active:scale-95 flex items-center justify-center gap-4 px-10" 
                                                onClick={handleDownload}
                                            >
                                                <StarIcons />
                                                <Download className="mr-3 size-7 md:size-8 group-hover:translate-y-1 transition-transform" /> 
                                                <span className="uppercase tracking-tighter">SAVE AUDIO FILE</span>
                                            </Button>
                                            <Button variant="ghost" onClick={handleReset} className="w-full h-10 font-black uppercase text-[10px] opacity-40 hover:opacity-100"><RefreshCcw className="size-3" /> Load Another Video</Button>
                                        </div>
                                     )}
                                </div>
                            </CardContent>
                            <CardFooter className="bg-muted/10 p-4 border-t border-white/10 flex justify-center">
                                <p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-30">GR7 INDUSTRIAL MEDIA ENGINE</p>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}