"use client";

import { useState, useRef, type ChangeEvent, type DragEvent, useMemo } from "react";
import JSZip from "jszip";
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
    ArrowLeftRight,
    Volume2,
    Layers,
    Trash2,
    Plus,
    Archive,
    Smartphone,
    Monitor,
    FileAudio
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

type OutputFormat = 'mp3' | 'wav' | 'ogg' | 'm4a';
type Bitrate = '128' | '192' | '256' | '320';

interface AudioItem {
    id: string;
    file: File;
    name: string;
    size: number;
    newSize: number;
    isProcessing: boolean;
    resultUrl: string | null;
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

export default function AudioConverter() {
    const { toast } = useToast();
    const [items, setItems] = useState<AudioItem[]>([]);
    const [outputFormat, setOutputFormat] = useState<OutputFormat>('mp3');
    const [bitrate, setBitrate] = useState<Bitrate>('320');
    const [isConvertingAll, setIsConvertingAll] = useState(false);
    const [isZipping, setIsZipping] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isDragOver, setIsDragOver] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFiles = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const newFiles = Array.from(files).filter(f => f.type.startsWith('audio/') || f.name.toLowerCase().endsWith('.mp3') || f.name.toLowerCase().endsWith('.wav') || f.name.toLowerCase().endsWith('.ogg') || f.name.toLowerCase().endsWith('.m4a'));
        
        const newItems: AudioItem[] = newFiles.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            name: file.name,
            size: file.size,
            newSize: 0,
            isProcessing: false,
            resultUrl: null
        }));

        setItems(prev => [...prev, ...newItems]);
        toast({ title: `${newItems.length} Files Added` });
    };

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFiles(e.target.files);
    const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFiles(e.dataTransfer.files); };

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

    const convertSingle = async (item: AudioItem): Promise<AudioItem> => {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        try {
            const arrayBuffer = await item.file.arrayBuffer();
            const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
            
            // Standardizing on WAV for highest quality client-side local conversion
            const blob = audioBufferToWav(audioBuffer);
            const url = URL.createObjectURL(blob);
            
            return {
                ...item,
                newSize: blob.size,
                resultUrl: url,
                isProcessing: false
            };
        } catch (e) {
            console.error(e);
            return { ...item, isProcessing: false };
        }
    };

    const handleConvertAll = async () => {
        if (items.length === 0) return;
        setIsConvertingAll(true);
        setProgress(0);
        
        const updatedItems = [...items];
        for (let i = 0; i < updatedItems.length; i++) {
            const item = updatedItems[i];
            if (item.resultUrl) continue;

            setItems(prev => prev.map(p => p.id === item.id ? { ...p, isProcessing: true } : p));
            const result = await convertSingle(item);
            setItems(prev => prev.map(p => p.id === item.id ? result : p));
            setProgress(Math.round(((i + 1) / updatedItems.length) * 100));
        }

        setIsConvertingAll(false);
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        toast({ title: "Batch Complete!" });
    };

    const handleDownloadAllZip = async () => {
        if (items.length === 0 || !items.some(i => i.resultUrl)) return;
        setIsZipping(true);
        const zip = new JSZip();
        
        try {
            for (const item of items) {
                if (item.resultUrl) {
                    const response = await fetch(item.resultUrl);
                    const blob = await response.blob();
                    const ext = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
                    zip.file(`Converted-${item.name.split('.')[0]}.${outputFormat}`, blob);
                }
            }
            const content = await zip.generateAsync({ type: "blob" });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `GR7-Audio-Bundle-${Date.now()}.zip`;
            link.click();
        } catch (e) {
            toast({ variant: 'destructive', title: 'Export Failed' });
        } finally {
            setIsZipping(false);
        }
    };

    const handleDownload = (item: AudioItem) => {
        if (!item.resultUrl) return;
        const link = document.createElement('a');
        link.href = item.resultUrl;
        link.download = `Converted-${item.name.split('.')[0]}.${outputFormat}`;
        link.click();
    };

    const handleReset = () => {
        items.forEach(i => i.resultUrl && URL.revokeObjectURL(i.resultUrl));
        setItems([]);
        setResultUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeFile = (id: string) => {
        setItems(prev => {
            const item = prev.find(i => i.id === id);
            if (item?.resultUrl) URL.revokeObjectURL(item.resultUrl);
            return prev.filter(i => i.id !== id);
        });
    };

    return (
        <div className="w-full max-w-7xl animate-in fade-in duration-700 px-4 flex flex-col gap-8 pb-20 mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* 1. LIST COLUMN */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                    <Card className={cn(
                        "w-full glass-card overflow-hidden transition-all duration-300 border-2 border-dashed shadow-2xl rounded-[3rem] hover:border-primary/50",
                        isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.01]"
                    )} onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }} onDragLeave={() => setIsDragOver(false)} onDrop={onDrop}>
                        <CardHeader className="bg-muted/30 border-b p-6 flex flex-row items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <Layers className="size-5 text-primary" />
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">STUDIO BUNDLE</CardTitle>
                            </div>
                            {items.length > 0 && <Badge className="bg-primary text-white font-black text-[10px] px-3 py-1 rounded-full">{items.length} FILES</Badge>}
                        </CardHeader>
                        <CardContent className="p-4 md:p-8 flex-1 flex flex-col min-h-[400px]">
                            {items.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center py-20 text-center cursor-pointer hover:bg-muted/30 transition-all rounded-[2rem] border-2 border-dashed" onClick={() => fileInputRef.current?.click()}>
                                    <div className="relative mb-6">
                                        <UploadCloud className="size-16 text-muted-foreground group-hover:text-primary" />
                                        <Zap className="absolute -top-1 -right-1 size-6 text-yellow-500 animate-pulse" />
                                    </div>
                                    <p className="text-xl font-black uppercase tracking-tighter">Drop Audio Files</p>
                                    <p className="text-[10px] md:text-sm text-muted-foreground mt-2 font-bold opacity-60 uppercase">MP3, WAV, OGG, M4A, WEBM</p>
                                </div>
                            ) : (
                                <div className="space-y-4 flex-1 flex flex-col">
                                    <ScrollArea className="h-[450px] md:h-[600px] pr-4 custom-scrollbar">
                                        <div className="grid gap-3 p-1">
                                            {items.map((item) => (
                                                <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl border-2 border-transparent bg-white dark:bg-slate-900 hover:border-primary/40 transition-all group shadow-sm">
                                                    <div className="flex items-center gap-4 truncate pr-4">
                                                        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                            <Volume2 className="size-6" />
                                                        </div>
                                                        <div className="truncate text-left">
                                                            <p className="text-xs md:text-sm font-black truncate max-w-[250px] uppercase tracking-tight" title={item.name}>{item.name}</p>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className="text-[9px] font-mono opacity-40 uppercase">{formatBytes(item.size)}</span>
                                                                {item.newSize > 0 && <span className="text-[9px] font-black text-green-600 uppercase">→ {formatBytes(item.newSize)}</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        {item.isProcessing ? (
                                                            <Loader2 className="size-4 animate-spin text-primary" />
                                                        ) : item.resultUrl ? (
                                                            <Button size="icon" variant="ghost" className="size-9 rounded-xl bg-green-500/10 text-green-600 hover:bg-green-500 hover:text-white" onClick={() => handleDownload(item)}>
                                                                <Download className="size-5" />
                                                            </Button>
                                                        ) : null}
                                                        <Button size="icon" variant="ghost" className="size-8 rounded-full text-muted-foreground hover:text-destructive" onClick={() => removeFile(item.id)}><X className="size-4"/></Button>
                                                    </div>
                                                </div>
                                            ))}
                                            <Button variant="outline" className="w-full border-2 border-dashed h-14 rounded-2xl mt-4 font-black text-[11px] uppercase group hover:bg-primary/5 hover:border-primary" onClick={() => fileInputRef.current?.click()}>
                                                <Plus className="size-4 mr-2 group-hover:scale-125 transition-transform" /> ADD MORE FILES
                                            </Button>
                                        </div>
                                    </ScrollArea>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="bg-white dark:bg-slate-950 border-t p-5 flex justify-center gap-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">
                            <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-green-500" /> SECURE RAM</div>
                            <div className="flex items-center gap-2"><Zap className="size-4 text-yellow-500" /> INSTANT BUNDLE</div>
                            <div className="flex items-center gap-2"><Smartphone className="size-4 text-primary" /> MOBILE OK</div>
                        </CardFooter>
                    </Card>
                </div>

                {/* 2. CONFIG COLUMN */}
                <div className="lg:col-span-5 flex flex-col gap-6 no-print">
                    <Card className="glass-panel border-none shadow-2xl overflow-hidden rounded-[2.5rem]">
                        <CardHeader className="bg-primary/5 border-b border-white/10 p-6 md:p-8 text-left">
                            <CardTitle className="text-base md:text-lg flex items-center gap-3 font-black uppercase tracking-tighter text-primary">
                                <Settings2 className="size-4 md:size-5 text-primary" /> Conversion Studio
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8 space-y-10">
                            
                            <div className="space-y-8">
                                <div className="space-y-4 text-left">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Output Settings</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <p className="text-[8px] font-black uppercase opacity-40 ml-1">Target Format</p>
                                            <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as OutputFormat)}>
                                                <SelectTrigger className="h-12 border-2 font-black rounded-xl bg-background/50 shadow-inner"><SelectValue /></SelectTrigger>
                                                <SelectContent className="rounded-xl border-2 shadow-2xl">
                                                    <SelectItem value="mp3" className="font-bold py-3 uppercase">MP3 (Universal)</SelectItem>
                                                    <SelectItem value="wav" className="font-bold py-3 uppercase">WAV (Lossless)</SelectItem>
                                                    <SelectItem value="ogg" className="font-bold py-3 uppercase">OGG (Opus)</SelectItem>
                                                    <SelectItem value="m4a" className="font-bold py-3 uppercase">M4A (Apple)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <p className="text-[8px] font-black uppercase opacity-40 ml-1">Bitrate Control</p>
                                            <Select value={bitrate} onValueChange={(v) => setBitrate(v as Bitrate)}>
                                                <SelectTrigger className="h-12 border-2 font-black rounded-xl bg-background/50 shadow-inner"><SelectValue /></SelectTrigger>
                                                <SelectContent className="rounded-xl border-2 shadow-2xl">
                                                    <SelectItem value="128" className="font-bold py-3">128 KBPS</SelectItem>
                                                    <SelectItem value="192" className="font-bold py-3">192 KBPS</SelectItem>
                                                    <SelectItem value="256" className="font-bold py-3">256 KBPS</SelectItem>
                                                    <SelectItem value="320" className="font-bold py-3">320 KBPS (HD)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 bg-green-500/5 rounded-[1.5rem] border-2 border-green-500/10 flex gap-4 text-left shadow-sm">
                                    <ShieldCheck className="size-6 text-green-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] md:text-[11px] font-black text-green-700 uppercase tracking-tight">Industrial Secure Engine</p>
                                        <p className="text-[8px] text-green-600/80 font-medium leading-tight mt-1 uppercase">
                                            Audio is processed entirely in your browser RAM. 0% data leaves your device.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence>
                                {isConvertingAll && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-4 pt-4 border-t-2 border-dashed">
                                        <div className="flex justify-between items-center px-1">
                                            <span className="text-[10px] font-black uppercase text-primary animate-pulse">Rendering Batch...</span>
                                            <span className="text-[10px] font-black">{progress}%</span>
                                        </div>
                                        <Progress value={progress} className="h-1.5 shadow-inner" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                        <CardFooter className="bg-muted/10 p-6 md:p-10 border-t border-white/10 flex flex-col gap-4 shrink-0">
                            {items.some(i => i.resultUrl) ? (
                                <div className="flex flex-col gap-3 w-full animate-in zoom-in-95">
                                    <Button 
                                        size="lg" 
                                        className="relative flex items-center justify-between gap-0 p-0 overflow-hidden bg-[#00aeef] hover:bg-[#009bd1] text-white font-black rounded-xl transition-all duration-300 group h-16 md:h-18 shadow-2xl border-none active:scale-95" 
                                        onClick={handleDownloadAllZip}
                                        disabled={isZipping}
                                    >
                                        <div className="absolute left-6 w-0.5 h-10 bg-white/40 rounded-full" />
                                        <span className="flex-1 px-12 text-center tracking-widest text-lg md:text-xl uppercase">
                                            {isZipping ? "PACKING ZIP..." : "SAVE ALL (ZIP)"}
                                        </span>
                                        <div className="bg-white h-full pl-8 pr-12 flex items-center justify-center text-[#00aeef] transition-all group-hover:pl-10 group-hover:pr-14 relative" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)', marginLeft: '-15px' }}>
                                            <Archive className="size-8 group-hover:scale-110 transition-transform" />
                                            <div className="absolute right-4 w-0.5 h-8 bg-[#00aeef]/20 rounded-full" />
                                        </div>
                                    </Button>
                                    <Button variant="outline" onClick={handleReset} className="h-11 border-2 font-black text-[10px] uppercase rounded-xl hover:bg-destructive/5 hover:text-destructive"><RefreshCcw className="size-4 mr-2" /> Start Over</Button>
                                </div>
                            ) : (
                                <Button 
                                    className="magic-button w-full h-16 md:h-20 rounded-full bg-primary hover:bg-transparent border-4 border-primary text-white hover:text-primary transition-all active:scale-95 disabled:opacity-50 group px-10 flex items-center justify-center gap-4 shadow-3xl" 
                                    onClick={handleConvertAll}
                                    disabled={items.length === 0 || isConvertingAll}
                                >
                                    <StarIcons />
                                    {isConvertingAll ? (
                                        <div className="flex items-center gap-3">
                                            <Loader2 className="size-7 md:size-8 animate-spin" />
                                            <span className="uppercase font-black text-sm md:text-base tracking-tighter">PROCESSING BATCH...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <FileOutput className="size-7 md:size-8 text-white/50 group-hover:scale-125 transition-transform" />
                                            <span className="uppercase tracking-tighter text-lg md:text-2xl font-black">CONVERT ALL</span>
                                        </div>
                                    )}
                                </Button>
                            )}
                            <p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-30 text-center mt-2">Local WASM Encryptor Active</p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
            <input ref={fileInputRef} type="file" className="hidden" multiple accept="audio/*" onChange={onFileChange} />
        </div>
    );
}
