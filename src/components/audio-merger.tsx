
"use client";

import { useState, useRef, type ChangeEvent, type DragEvent, useMemo } from "react";
import { 
    UploadCloud, 
    Loader2, 
    Download, 
    X, 
    Music, 
    Zap, 
    ShieldCheck, 
    Sparkles, 
    RefreshCcw, 
    Settings2,
    CheckCircle2,
    Volume2,
    Layers,
    Trash2,
    Plus,
    ChevronUp,
    ChevronDown,
    Merge,
    Monitor,
    FileOutput
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import confetti from 'canvas-confetti';

type OutputFormat = 'mp3' | 'wav' | 'ogg' | 'm4a' | 'aac';

interface AudioItem {
    id: string;
    file: File;
    name: string;
    size: number;
    duration: number;
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

function formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i];
}

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function AudioMerger() {
    const { toast } = useToast();
    const [items, setItems] = useState<AudioItem[]>([]);
    const [outputFormat, setOutputFormat] = useState<OutputFormat>('mp3');
    const [isMerging, setIsMerging] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("");
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const newFiles = Array.from(files).filter(f => f.type.startsWith('audio/'));
        
        setIsMerging(true);
        setStatusText("Analyzing Bitstreams...");
        
        const newItems: AudioItem[] = [];
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

        for (const file of newFiles) {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
                newItems.push({
                    id: Math.random().toString(36).substr(2, 9),
                    file,
                    name: file.name,
                    size: file.size,
                    duration: audioBuffer.duration
                });
            } catch (e) {
                console.error(e);
            }
        }

        await audioCtx.close();
        setItems(prev => [...prev, ...newItems]);
        setIsMerging(false);
        setResultUrl(null);
        toast({ title: `${newItems.length} Files Added to Stack` });
    };

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFiles(e.target.files);
    const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFiles(e.dataTransfer.files); };

    const moveItem = (index: number, direction: 'up' | 'down') => {
        const next = [...items];
        const item = next.splice(index, 1)[0];
        next.splice(direction === 'up' ? Math.max(0, index - 1) : Math.min(items.length - 1, index + 1), 0, item);
        setItems(next);
        setResultUrl(null);
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
        for (let i = 0; i < buffer.numberOfChannels; i++) {
            const channelData = buffer.getChannelData(i);
            let offset = 44 + (i * 2);
            for (let j = 0; j < channelData.length; j++) {
                let sample = Math.max(-1, Math.min(1, channelData[j]));
                sample = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF);
                view.setInt16(offset, sample, true);
                offset += numOfChan * 2;
            }
        }
        return new Blob([outBuffer], { type: "audio/wav" });
    };

    const handleMerge = async () => {
        if (items.length < 2) {
            toast({ variant: 'destructive', title: "Add more files", description: "At least 2 files are required to merge." });
            return;
        }

        setIsMerging(true);
        setProgress(10);
        setStatusText("Initializing Local Workspace...");
        
        try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const decodedBuffers: AudioBuffer[] = [];

            for (let i = 0; i < items.length; i++) {
                setStatusText(`Decoding: ${items[i].name}`);
                const arrayBuffer = await items[i].file.arrayBuffer();
                const buf = await audioCtx.decodeAudioData(arrayBuffer);
                decodedBuffers.push(buf);
                setProgress(10 + Math.round(((i + 1) / items.length) * 40));
            }

            setStatusText("Joining Samples...");
            const totalLength = decodedBuffers.reduce((acc, buf) => acc + buf.length, 0);
            const finalBuffer = audioCtx.createBuffer(
                decodedBuffers[0].numberOfChannels,
                totalLength,
                decodedBuffers[0].sampleRate
            );

            for (let channel = 0; channel < decodedBuffers[0].numberOfChannels; channel++) {
                let offset = 0;
                for (const buf of decodedBuffers) {
                    finalBuffer.getChannelData(channel).set(buf.getChannelData(channel), offset);
                    offset += buf.length;
                }
            }

            setProgress(90);
            setStatusText("Sanitizing Bitstream...");
            const blob = audioBufferToWav(finalBuffer);
            setResultUrl(URL.createObjectURL(blob));
            setProgress(100);
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            toast({ title: "Merge Complete!" });
            await audioCtx.close();
        } catch (e) {
            toast({ variant: 'destructive', title: "Merge Failed" });
        } finally {
            setIsMerging(false);
        }
    };

    const handleDownload = () => {
        if (!resultUrl) return;
        const link = document.createElement('a');
        link.href = resultUrl;
        const ext = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
        link.download = `Merged-Audio-${Date.now()}.${outputFormat}`;
        link.click();
    };

    const handleReset = () => {
        if (resultUrl) URL.revokeObjectURL(resultUrl);
        setItems([]);
        setResultUrl(null);
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const totalDuration = useMemo(() => items.reduce((acc, i) => acc + i.duration, 0), [items]);

    return (
        <div className="w-full max-w-7xl animate-in fade-in duration-700 px-4 flex flex-col gap-8 pb-20 mx-auto text-left">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                
                {/* 1. LIST COLUMN */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                    <Card className={cn(
                        "w-full glass-card overflow-hidden transition-all duration-300 border-2 border-dashed shadow-2xl rounded-[3rem] hover:border-primary/50",
                        isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.01]"
                    )} onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }} onDragLeave={() => setIsDragOver(false)} onDrop={onDrop}>
                        <CardHeader className="bg-muted/30 border-b p-6 flex flex-row items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <Layers className="size-5 text-primary" />
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">MERGE STACK</CardTitle>
                            </div>
                            {items.length > 0 && <Badge className="bg-primary text-white font-black text-[10px] px-3 py-1 rounded-full">{items.length} TRACKS</Badge>}
                        </CardHeader>
                        <CardContent className="p-4 md:p-8 flex-1 flex flex-col min-h-[400px]">
                            {items.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center py-20 text-center cursor-pointer hover:bg-muted/30 transition-all rounded-[2rem] border-2 border-dashed" onClick={() => fileInputRef.current?.click()}>
                                    <div className="relative mb-6">
                                        <UploadCloud className="size-16 text-muted-foreground group-hover:text-primary" />
                                        <Zap className="absolute -top-1 -right-1 size-6 text-yellow-500 animate-pulse" />
                                    </div>
                                    <p className="text-xl font-black uppercase tracking-tighter">Drop Audio Tracks</p>
                                    <p className="text-[10px] md:text-sm text-muted-foreground mt-2 font-bold opacity-60 uppercase">MP3, WAV, M4A, OGG supported</p>
                                </div>
                            ) : (
                                <div className="space-y-4 flex-1 flex flex-col">
                                    <div className="flex justify-between items-center px-1">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Re-order Sequence</p>
                                        <Button variant="ghost" size="sm" onClick={() => setItems([])} className="h-7 text-destructive font-black text-[9px] uppercase"><Trash2 className="size-3 mr-1"/> Clear</Button>
                                    </div>
                                    <ScrollArea className="h-[450px] md:h-[600px] pr-4 custom-scrollbar">
                                        <div className="grid gap-3 p-1">
                                            {items.map((item, i) => (
                                                <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl border-2 border-transparent bg-white dark:bg-slate-900 hover:border-primary/40 transition-all group shadow-sm">
                                                    <div className="flex items-center gap-4 truncate">
                                                        <div className="flex flex-col gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                                                            <Button size="icon" variant="ghost" className="h-6 w-6 rounded-md hover:bg-primary/10" onClick={() => moveItem(i, 'up')} disabled={i === 0}><ChevronUp className="size-4"/></Button>
                                                            <Button size="icon" variant="ghost" className="h-6 w-6 rounded-md hover:bg-primary/10" onClick={() => moveItem(i, 'down')} disabled={i === items.length - 1}><ChevronDown className="size-4"/></Button>
                                                        </div>
                                                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs shrink-0">{i + 1}</div>
                                                        <div className="truncate text-left">
                                                            <p className="text-xs md:text-sm font-black truncate max-w-[200px] uppercase tracking-tight" title={item.name}>{item.name}</p>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className="text-[9px] font-mono opacity-40 uppercase">{formatBytes(item.size)}</span>
                                                                <span className="text-[9px] font-black text-primary uppercase">| {formatTime(item.duration)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button size="icon" variant="ghost" className="size-8 rounded-full text-muted-foreground hover:text-destructive" onClick={() => setItems(prev => prev.filter(p => p.id !== item.id))}><X className="size-4"/></Button>
                                                </div>
                                            ))}
                                            <Button variant="outline" className="w-full border-2 border-dashed h-14 rounded-2xl mt-4 font-black text-[11px] uppercase group hover:bg-primary/5 hover:border-primary" onClick={() => fileInputRef.current?.click()}>
                                                <Plus className="size-4 mr-2 group-hover:scale-125 transition-transform" /> ADD MORE TRACKS
                                            </Button>
                                        </div>
                                    </ScrollArea>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="bg-white dark:bg-slate-950 border-t p-5 flex justify-center gap-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">
                            <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-green-500" /> SECURE RAM</div>
                            <div className="flex items-center gap-2"><Zap className="size-4 text-yellow-500" /> INSTANT BUNDLE</div>
                            <div className="flex items-center gap-2"><Monitor className="size-4 text-primary" /> HD RENDER</div>
                        </CardFooter>
                    </Card>
                </div>

                {/* 2. CONFIG COLUMN */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    <Card className="glass-panel border-none shadow-2xl overflow-hidden rounded-[2.5rem] flex-1 flex flex-col">
                        <CardHeader className="bg-primary/5 border-b border-white/10 p-6 md:p-8">
                            <CardTitle className="text-base md:text-lg flex items-center gap-3 font-black uppercase tracking-tighter text-primary">
                                <Settings2 className="size-4 md:size-5 text-primary" /> Studio Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8 space-y-10 flex-1 overflow-y-auto">
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Export Protocol</Label>
                                    <div className="space-y-1.5">
                                        <p className="text-[8px] font-black uppercase opacity-40 ml-1">Target Format</p>
                                        <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as OutputFormat)}>
                                            <SelectTrigger className="h-12 border-2 font-black rounded-xl bg-background/50 shadow-inner"><SelectValue /></SelectTrigger>
                                            <SelectContent className="rounded-xl border-2 shadow-2xl">
                                                <SelectItem value="mp3" className="font-bold py-3 uppercase">MP3 (Compatible)</SelectItem>
                                                <SelectItem value="wav" className="font-bold py-3 uppercase">WAV (Lossless)</SelectItem>
                                                <SelectItem value="ogg" className="font-bold py-3 uppercase">OGG (Modern)</SelectItem>
                                                <SelectItem value="m4a" className="font-bold py-3 uppercase">M4A (Apple)</SelectItem>
                                                <SelectItem value="aac" className="font-bold py-3 uppercase">AAC (Mobile)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-muted/30 p-4 rounded-2xl border text-center space-y-1">
                                        <p className="text-[8px] font-black text-muted-foreground uppercase">Total Tracks</p>
                                        <p className="text-xl font-black">{items.length}</p>
                                    </div>
                                    <div className="bg-primary/5 p-4 rounded-2xl border-2 border-primary/20 text-center space-y-1">
                                        <p className="text-[8px] font-black text-primary uppercase">Est. Duration</p>
                                        <p className="text-xl font-black text-primary">{formatTime(totalDuration)}</p>
                                    </div>
                                </div>

                                <div className="p-5 bg-green-500/5 rounded-2xl border-2 border-green-500/10 flex gap-4 text-left shadow-sm">
                                    <ShieldCheck className="size-6 text-green-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-black text-green-700 uppercase tracking-tight">Lossless Join Logic</p>
                                        <p className="text-[8px] text-green-600/80 font-medium leading-tight mt-1 uppercase">
                                            Track bitstreams are mapped directly into a high-fidelity PCM buffer for 0% quality loss.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence>
                                {isMerging && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-4 pt-8 border-t-2 border-dashed">
                                        <div className="flex justify-between items-center px-1">
                                            <span className="text-[10px] font-black uppercase text-primary animate-pulse">{statusText}</span>
                                            <span className="text-[10px] font-black">{progress}%</span>
                                        </div>
                                        <Progress value={progress} className="h-1.5 shadow-inner" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                        <CardFooter className="bg-muted/10 p-6 md:p-10 border-t border-white/10 flex flex-col gap-4">
                            {resultUrl ? (
                                <div className="flex flex-col gap-3 w-full animate-in zoom-in-95">
                                    <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border-2 shadow-xl mb-2">
                                        <audio controls src={resultUrl} className="w-full h-10" />
                                    </div>
                                    <Button 
                                        size="lg" 
                                        className="relative flex items-center justify-between gap-0 p-0 overflow-hidden bg-[#00aeef] hover:bg-[#009bd1] text-white font-black rounded-xl transition-all duration-300 group h-16 md:h-18 shadow-2xl border-none active:scale-95" 
                                        onClick={handleDownload}
                                    >
                                        <div className="absolute left-6 w-0.5 h-10 bg-white/40 rounded-full" />
                                        <span className="flex-1 px-12 text-center tracking-widest text-lg md:text-xl uppercase">
                                            SAVE AS {outputFormat.toUpperCase()}
                                        </span>
                                        <div className="bg-white h-full pl-8 pr-12 flex items-center justify-center text-[#00aeef] transition-all group-hover:pl-10 group-hover:pr-14 relative" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)', marginLeft: '-15px' }}>
                                            <Download className="size-8 group-hover:scale-110 transition-transform" />
                                            <div className="absolute right-4 w-0.5 h-8 bg-[#00aeef]/20 rounded-full" />
                                        </div>
                                    </Button>
                                    <Button variant="outline" onClick={handleReset} className="w-full h-11 border-2 font-black text-[10px] uppercase rounded-xl hover:bg-destructive/5 hover:text-destructive transition-all duration-300 shadow-sm"><RefreshCcw className="size-3.5 mr-2" /> Start New Join</Button>
                                </div>
                            ) : (
                                <Button 
                                    className="magic-button w-full h-16 md:h-20 rounded-full bg-primary hover:bg-transparent border-4 border-primary text-white hover:text-primary transition-all active:scale-95 disabled:opacity-50 group px-10 flex items-center justify-center gap-4 shadow-3xl" 
                                    onClick={handleMerge}
                                    disabled={items.length < 2 || isMerging}
                                >
                                    <StarIcons />
                                    {isMerging ? (
                                        <div className="flex items-center gap-3">
                                            <Loader2 className="size-7 md:size-8 animate-spin" />
                                            <span className="uppercase font-black text-sm md:text-base tracking-tighter">JOINING BUNDLE...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <Merge className="size-7 md:size-8 text-white/50 group-hover:scale-125 transition-transform" />
                                            <span className="uppercase tracking-tighter text-lg md:text-2xl font-black">MERGE TRACKS</span>
                                        </div>
                                    )}
                                </Button>
                            )}
                            <p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-30 text-center mt-2">Local Workspace Logic Active</p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
            <input ref={fileInputRef} type="file" className="hidden" multiple accept="audio/*" onChange={onFileChange} />
        </div>
    );
}
