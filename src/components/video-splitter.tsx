
'use client';

import { useState, useRef, useEffect, useCallback, useMemo, type ChangeEvent, type DragEvent } from "react";
import { 
    UploadCloud, 
    Loader2, 
    Download, 
    RefreshCcw, 
    Zap, 
    ShieldCheck, 
    Sparkles, 
    CheckCircle2,
    Settings2,
    MonitorPlay,
    Plus,
    X,
    Scissors,
    Monitor,
    FileVideo,
    Archive,
    History
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { useFfmpegLoader } from "@/hooks/use-ffmpeg-loader";
import JSZip from "jszip";
import confetti from 'canvas-confetti';

type SplitMode = 'equal' | 'duration' | 'custom';

interface SplitPart {
    id: string;
    index: number;
    start: number;
    end: number;
    url: string | null;
    status: 'pending' | 'processing' | 'done' | 'error';
}

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
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default function VideoSplitter() {
    const { toast } = useToast();
    const { ffmpeg, util, loading: isEngineLoading, error: engineError, loaderProgress } = useFfmpegLoader();

    const [file, setFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [duration, setDuration] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("");
    const [isDragOver, setIsDragOver] = useState(false);

    // Split Config
    const [splitMode, setSplitMode] = useState<SplitMode>('equal');
    const [numParts, setNumParts] = useState("2");
    const [partDuration, setPartDuration] = useState("30");
    const [customTimestamps, setCustomTimestamps] = useState("");

    const [parts, setParts] = useState<SplitPart[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = (selectedFile: File | null) => {
        if (!selectedFile) return;
        if (!selectedFile.type.startsWith('video/')) {
            toast({ variant: 'destructive', title: "Invalid Format", description: "Please upload a video file." });
            return;
        }

        setFile(selectedFile);
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        const url = URL.createObjectURL(selectedFile);
        setVideoUrl(url);
        setParts([]);
        setProgress(0);

        const tempVideo = document.createElement('video');
        tempVideo.src = url;
        tempVideo.onloadedmetadata = () => {
            setDuration(tempVideo.duration);
        };
    };

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFile(e.target.files?.[0] || null);
    const handleDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFile(e.dataTransfer.files?.[0]); };

    const calculateParts = (): SplitPart[] => {
        if (duration <= 0) return [];
        const result: SplitPart[] = [];
        
        if (splitMode === 'equal') {
            const n = parseInt(numParts) || 2;
            const partDur = duration / n;
            for (let i = 0; i < n; i++) {
                result.push({ id: `p-${i}`, index: i + 1, start: i * partDur, end: (i + 1) * partDur, url: null, status: 'pending' });
            }
        } else if (splitMode === 'duration') {
            const d = parseFloat(partDuration) || 30;
            const n = Math.ceil(duration / d);
            for (let i = 0; i < n; i++) {
                result.push({ id: `p-${i}`, index: i + 1, start: i * d, end: Math.min((i + 1) * d, duration), url: null, status: 'pending' });
            }
        } else {
            const ts = customTimestamps.split(',').map(s => {
                if (s.includes(':')) {
                    const parts = s.trim().split(':').map(Number);
                    if (parts.length === 2) return parts[0] * 60 + parts[1];
                    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
                }
                return parseFloat(s.trim());
            }).filter(n => !isNaN(n)).sort((a, b) => a - b);
            
            if (ts.length === 0) return [];
            const markers = [0, ...ts.filter(t => t > 0 && t < duration), duration];
            for (let i = 0; i < markers.length - 1; i++) {
                result.push({ id: `p-${i}`, index: i + 1, start: markers[i], end: markers[i+1], url: null, status: 'pending' });
            }
        }
        return result;
    };

    const handleSplit = async () => {
        if (!file || !ffmpeg || !util) return;
        
        const splitParts = calculateParts();
        if (splitParts.length === 0) {
            toast({ variant: 'destructive', title: "Invalid Settings", description: "Please check your split points." });
            return;
        }
        
        setParts(splitParts);
        setIsProcessing(true);
        setProgress(0);

        try {
            const { fetchFile } = util;
            const inputName = 'input.' + file.name.split('.').pop();
            await ffmpeg.writeFile(inputName, await fetchFile(file));

            for (let i = 0; i < splitParts.length; i++) {
                const part = splitParts[i];
                setStatusText(`Processing Part ${part.index}/${splitParts.length}...`);
                setParts(prev => prev.map(p => p.id === part.id ? { ...p, status: 'processing' } : p));
                
                const outputName = `part_${i}.mp4`;
                const start = part.start;
                const len = part.end - part.start;

                // Lossless bitstream copy for extreme speed (-c copy)
                await ffmpeg.exec([
                    '-ss', start.toFixed(3),
                    '-i', inputName,
                    '-t', len.toFixed(3),
                    '-c', 'copy',
                    '-avoid_negative_ts', '1',
                    outputName
                ]);

                const data = await ffmpeg.readFile(outputName);
                const url = URL.createObjectURL(new Blob([data], { type: 'video/mp4' }));
                
                setParts(prev => prev.map(p => p.id === part.id ? { ...p, url, status: 'done' } : p));
                setProgress(Math.round(((i + 1) / splitParts.length) * 100));
            }

            setStatusText("All parts ready");
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            toast({ title: "Split Complete!" });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: "Process Error", description: "Failed to split video locally." });
        } finally {
            setIsProcessing(false);
            setStatusText("");
        }
    };

    const handleDownloadAllZip = async () => {
        setIsProcessing(true);
        setStatusText("Creating Archive...");
        const zip = new JSZip();
        
        try {
            for (const part of parts) {
                if (part.url) {
                    const response = await fetch(part.url);
                    const blob = await response.blob();
                    zip.file(`Part_${part.index}.mp4`, blob);
                }
            }
            const content = await zip.generateAsync({ type: "blob" });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `GR7-Split-Videos-${Date.now()}.zip`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch (e) {
            toast({ variant: 'destructive', title: 'Export Failed' });
        } finally {
            setIsProcessing(false);
            setStatusText("");
        }
    };

    const handleReset = () => {
        parts.forEach(p => p.url && URL.revokeObjectURL(p.url));
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        setFile(null);
        setVideoUrl(null);
        setParts([]);
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="w-full max-w-7xl px-4 flex flex-col gap-8 pb-32 animate-in fade-in duration-700 mx-auto text-left">
            
            {engineError && (
                <Card className="bg-destructive/5 border-destructive/20 rounded-2xl p-6">
                    <div className="flex items-center gap-4 text-destructive">
                        <X className="size-6" />
                        <div>
                            <p className="font-black uppercase text-sm">Engine Error</p>
                            <p className="text-xs font-medium mt-1">{engineError}</p>
                            <Button variant="outline" size="sm" className="mt-4 h-8 text-[10px] uppercase" onClick={() => window.location.reload()}>Retry Load</Button>
                        </div>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* 1. CONFIG COLUMN */}
                <div className="lg:col-span-5 flex flex-col gap-6 no-print">
                    <Card className="border-2 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950 border-primary/10 transition-all hover:border-primary/30">
                        <CardHeader className="bg-primary/5 border-b p-6 md:p-8 text-left">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20">
                                        <Scissors className="size-7" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-none">Split Settings</CardTitle>
                                        <CardDescription className="text-[10px] font-bold uppercase opacity-50 tracking-widest mt-1">Industrial Grade Logic</CardDescription>
                                    </div>
                                </div>
                                {file && <Button variant="ghost" size="icon" onClick={handleReset} className="size-8 w-8 text-destructive hover:bg-destructive/5"><X className="size-5" /></Button>}
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8 space-y-8">
                            {!file ? (
                                <div 
                                    className={cn(
                                        "border-4 border-dashed border-muted-foreground/20 rounded-[2rem] p-16 flex flex-col items-center justify-center space-y-6 bg-muted/30 group cursor-pointer hover:bg-primary/5 transition-all",
                                        isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.01]"
                                    )}
                                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                                    onDragLeave={() => setIsDragOver(false)}
                                    onDrop={onDrop}
                                    onClick={() => !isEngineLoading && fileInputRef.current?.click()}
                                >
                                    <div className="relative">
                                        <UploadCloud className="size-16 text-muted-foreground group-hover:text-primary transition-colors" />
                                        <Zap className="absolute -top-1 -right-1 size-6 text-yellow-500 animate-pulse" />
                                    </div>
                                    <div className="text-center px-4">
                                        {isEngineLoading ? (
                                            <div className="flex flex-col items-center gap-4">
                                                <Loader2 className="size-10 animate-spin text-primary stroke-[3]" />
                                                <div className="space-y-2 w-full max-w-[200px]">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">Initializing Engine...</p>
                                                    <Progress value={loaderProgress} className="h-1 shadow-inner" />
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="text-xl md:text-2xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Drop Video File</p>
                                                <p className="text-[10px] md:text-sm text-muted-foreground mt-1 font-bold opacity-60 uppercase">MP4, WebM, MOV • Max 800MB</p>
                                            </>
                                        )}
                                    </div>
                                    <input ref={fileInputRef} type="file" className="hidden" accept="video/*" onChange={onFileChange} disabled={isEngineLoading} />
                                </div>
                            ) : (
                                <div className="space-y-8 animate-in slide-in-from-left duration-300">
                                    <Tabs value={splitMode} onValueChange={(v) => { setSplitMode(v as SplitMode); setParts([]); }} className="w-full">
                                        <div className="flex items-center justify-between mb-4 px-1">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                                                <Settings2 className="size-3" /> Config Mode
                                            </Label>
                                            <TabsList className="bg-muted p-1 rounded-xl border h-10">
                                                <TabsTrigger value="equal" className="text-[9px] font-black uppercase px-4">EQUAL</TabsTrigger>
                                                <TabsTrigger value="duration" className="text-[9px] font-black uppercase px-4">CLIP</TabsTrigger>
                                                <TabsTrigger value="custom" className="text-[9px] font-black uppercase px-4">CUSTOM</TabsTrigger>
                                            </TabsList>
                                        </div>

                                        <TabsContent value="equal" className="m-0 space-y-4 animate-in fade-in duration-300">
                                            <div className="space-y-3">
                                                <Label className="text-[9px] font-black uppercase opacity-60">Number of Equal Parts</Label>
                                                <Select value={numParts} onValueChange={setNumParts}>
                                                    <SelectTrigger className="h-12 border-2 font-black rounded-xl bg-background/50 shadow-sm"><SelectValue /></SelectTrigger>
                                                    <SelectContent className="rounded-xl border-2 shadow-2xl z-[150]">
                                                        {[2, 3, 4, 5, 6, 8, 10, 15, 20].map(n => <SelectItem key={n} value={n.toString()} className="font-bold py-3 uppercase">{n} Segments</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="duration" className="m-0 space-y-4 animate-in fade-in duration-300">
                                            <div className="space-y-3">
                                                <Label className="text-[9px] font-black uppercase opacity-60">Split every X seconds</Label>
                                                <div className="relative group">
                                                    <Input type="number" value={partDuration} onChange={(e) => setPartDuration(e.target.value)} className="h-12 border-2 rounded-xl font-black text-xl text-center pr-12" />
                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase opacity-30">SEC</span>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="custom" className="m-0 space-y-4 animate-in fade-in duration-300">
                                            <div className="space-y-3">
                                                <Label className="text-[9px] font-black uppercase opacity-60">Split Points (Seconds or MM:SS)</Label>
                                                <Textarea value={customTimestamps} onChange={(e) => setCustomTimestamps(e.target.value)} className="min-h-[120px] border-2 rounded-2xl font-bold p-4 text-sm shadow-inner" placeholder="e.g. 10, 30, 1:20" />
                                                <p className="text-[8px] font-bold text-muted-foreground uppercase px-1 opacity-50">Separate each point with a comma.</p>
                                            </div>
                                        </TabsContent>
                                    </Tabs>

                                    <div className="p-5 bg-green-500/5 rounded-[1.5rem] border-2 border-green-500/10 flex gap-4 text-left shadow-sm">
                                        <ShieldCheck className="size-6 text-green-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] md:text-[11px] font-black text-green-700 uppercase tracking-tight">Direct Stream Copy</p>
                                            <p className="text-[8px] text-green-600/80 font-medium leading-tight mt-1 uppercase">
                                                Lossless extraction enabled. Original bitrate and resolution remain untouched.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="bg-muted/10 p-6 md:p-8 border-t flex flex-col gap-4 shrink-0">
                             {file && (
                                <Button 
                                    className="magic-button w-full h-16 md:h-20 rounded-[1.5rem] bg-primary hover:bg-transparent border-4 border-primary text-white hover:text-primary transition-all active:scale-95 disabled:opacity-50 group px-10 flex items-center justify-center gap-4 shadow-xl border-none" 
                                    onClick={handleSplit}
                                    disabled={isProcessing || isEngineLoading}
                                >
                                    <StarIcons />
                                    {isProcessing ? (
                                        <div className="flex items-center gap-3">
                                            <Loader2 className="size-7 md:size-8 animate-spin" />
                                            <span className="uppercase font-black text-sm md:text-base tracking-tighter">{statusText}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <Scissors className="size-6 md:size-7 text-yellow-400 fill-yellow-400 group-hover:scale-125 transition-transform" />
                                            <span className="uppercase tracking-tighter text-lg md:text-xl font-black">START SPLITTING</span>
                                        </div>
                                    )}
                                </Button>
                             )}
                             <div className="flex items-center gap-6 text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mx-auto">
                                <div className="flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-green-500" /> SECURE RAM</div>
                                <div className="flex items-center gap-1.5"><Zap className="size-3.5 text-yellow-500" /> NATIVE WASM</div>
                            </div>
                        </CardFooter>
                    </Card>
                </div>

                {/* 2. PREVIEW COLUMN */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                    {file ? (
                        <div className="space-y-6 animate-in zoom-in-95 duration-500 flex flex-col h-full">
                             <Card className="overflow-hidden border-2 shadow-3xl flex-1 flex flex-col bg-card/50 rounded-[2.5rem]">
                                <CardHeader className="bg-muted/30 border-b py-4 px-6 flex flex-row items-center justify-between shrink-0">
                                    <div className="flex items-center gap-3">
                                        <MonitorPlay className="h-5 w-5 text-primary" />
                                        <div className="text-left">
                                            <CardTitle className="text-[10px] font-black uppercase tracking-widest truncate max-w-[200px]">{file.name}</CardTitle>
                                            <CardDescription className="text-[9px] font-bold opacity-60 uppercase">{formatBytes(file.size)} • {formatTime(duration)}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 md:p-8 flex-1 bg-slate-50 dark:bg-black/20 shadow-inner flex flex-col gap-8">
                                    <div className="w-full relative group">
                                        <video src={videoUrl!} controls className="w-full max-h-[40vh] rounded-2xl shadow-2xl border-4 border-white dark:border-slate-800 bg-black" />
                                        <AnimatePresence>
                                            {isProcessing && (
                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-10 gap-6">
                                                    <div className="relative">
                                                        <Loader2 className="size-16 md:size-20 animate-spin text-primary stroke-[3]" />
                                                        <Scissors className="absolute inset-0 m-auto size-7 md:size-9 text-primary animate-pulse" />
                                                    </div>
                                                    <div className="space-y-4 w-full max-w-xs text-center px-6">
                                                        <p className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter animate-pulse">{statusText}</p>
                                                        <Progress value={progress} className="h-1.5 shadow-inner" />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {parts.length > 0 && (
                                        <div className="space-y-4 animate-in slide-in-from-bottom-4 flex-1 flex flex-col">
                                            <div className="flex justify-between items-center px-1 shrink-0">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Output segments ({parts.length})</Label>
                                                {parts.every(p => p.status === 'done') && (
                                                    <Button variant="ghost" size="sm" onClick={handleDownloadAllZip} className="h-7 text-primary font-black text-[9px] uppercase"><Archive className="size-3 mr-1.5" /> Bundle ZIP</Button>
                                                )}
                                            </div>
                                            <ScrollArea className="flex-1 h-[300px] md:h-[450px] rounded-2xl border-2 border-dashed p-4 bg-muted/10">
                                                <div className="grid gap-3 pr-4">
                                                    {parts.map((part) => (
                                                        <div key={part.id} className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-transparent hover:border-primary/20 shadow-sm transition-all group">
                                                            <div className="flex items-center gap-4 truncate">
                                                                <div className={cn(
                                                                    "size-10 rounded-xl flex items-center justify-center font-black text-xs border-2 shrink-0",
                                                                    part.status === 'done' ? "bg-green-500/10 text-green-600" : "bg-primary/5 text-primary"
                                                                )}>
                                                                    {part.status === 'processing' ? <Loader2 className="size-5 animate-spin" /> : part.index}
                                                                </div>
                                                                <div className="text-left truncate">
                                                                    <p className="text-xs md:text-sm font-black uppercase tracking-tight truncate">Clip {part.index}</p>
                                                                    <p className="text-[10px] font-bold text-muted-foreground opacity-60 uppercase">{formatTime(part.start)} → {formatTime(part.end)}</p>
                                                                </div>
                                                            </div>
                                                            {part.url && (
                                                                <Button size="sm" variant="ghost" className="h-10 px-4 rounded-xl font-black text-[9px] uppercase bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all shadow-md shrink-0" asChild>
                                                                    <a href={part.url} download={`Clip-${part.index}-${file.name}`}>
                                                                        <Download className="size-4 mr-2" /> SAVE
                                                                    </a>
                                                                </Button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                                <ScrollBar />
                                            </ScrollArea>
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="bg-white dark:bg-slate-950 border-t p-5 flex justify-center gap-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 shrink-0">
                                     <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-green-500" /> SECURE RAM</div>
                                     <div className="flex items-center gap-2"><Monitor className="size-4 text-primary" /> HD EXTRACTION</div>
                                </CardFooter>
                             </Card>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center py-24 md:py-48 opacity-10 gap-8 rounded-[3rem] bg-muted/20 border-4 border-dashed border-primary/20">
                            <FileVideo className="size-32 md:size-48" />
                            <div className="space-y-1 text-center">
                                <p className="text-3xl font-black uppercase tracking-tighter leading-none">Studio Viewport</p>
                                <p className="text-xs font-bold uppercase tracking-widest text-center">Select a file to start the engine</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
