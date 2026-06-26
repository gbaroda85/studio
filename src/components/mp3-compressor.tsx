
'use client';

import { useState, useRef, useEffect, useMemo, useCallback, type ChangeEvent, type DragEvent } from "react";
import { 
    UploadCloud, 
    Download, 
    Zap, 
    ShieldCheck, 
    Sparkles, 
    RefreshCcw, 
    Settings2,
    CheckCircle2,
    Volume2,
    Loader2,
    X,
    FileAudio,
    TrendingDown,
    Activity,
    Monitor,
    FileOutput,
    Target,
    Cloud
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
import { motion, AnimatePresence } from "framer-motion";
import { useFfmpegLoader } from "@/hooks/use-ffmpeg-loader";
import confetti from 'canvas-confetti';

export const dynamic = "force-dynamic";

interface AudioInfo {
    name: string;
    size: number;
    format: string;
    duration: number;
    bitrate: number;
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

function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function Mp3Compressor() {
    const { toast } = useToast();
    const { ffmpeg, util, loading: isEngineLoading, loaderProgress } = useFfmpegLoader();
    
    const [file, setFile] = useState<File | null>(null);
    const [originalUrl, setOriginalUrl] = useState<string | null>(null);
    const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
    const [audioInfo, setAudioInfo] = useState<AudioInfo | null>(null);
    
    const [mode, setMode] = useState<'easy' | 'advanced'>('easy');
    const [easyQuality, setEasyQuality] = useState<'low' | 'medium' | 'high'>('medium');
    const [bitrate, setBitrate] = useState('128');
    const [sampleRate, setSampleRate] = useState('auto');

    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("");
    const [isDragOver, setIsDragOver] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const estimation = useMemo(() => {
        if (!audioInfo) return null;
        let targetBitrate = 128;
        if (mode === 'easy') {
            if (easyQuality === 'low') targetBitrate = 256;
            else if (easyQuality === 'medium') targetBitrate = 128;
            else targetBitrate = 64;
        } else {
            targetBitrate = parseInt(bitrate);
        }

        const estBytes = (targetBitrate * 1000 * audioInfo.duration) / 8;
        const reduction = ((audioInfo.size - estBytes) / audioInfo.size) * 100;

        return {
            size: estBytes,
            reduction: Math.max(0, reduction),
            bitrate: targetBitrate
        };
    }, [audioInfo, mode, easyQuality, bitrate]);

    const handleFile = async (selectedFile: File | null) => {
        if (!selectedFile) return;
        const validExtensions = ['.mp3', '.wav', '.m4a', '.ogg', '.flac', '.aac', '.webm'];
        const isAudio = selectedFile.type.startsWith('audio/') || validExtensions.some(ext => selectedFile.name.toLowerCase().endsWith(ext));
        
        if (!isAudio) {
            toast({ variant: 'destructive', title: "Invalid Format", description: "Please upload MP3, WAV, M4A or OGG files." });
            return;
        }

        setFile(selectedFile);
        const url = URL.createObjectURL(selectedFile);
        setOriginalUrl(url);
        setCompressedUrl(null);
        setProgress(0);

        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        try {
            const arrayBuffer = await selectedFile.arrayBuffer();
            const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
            
            setAudioInfo({
                name: selectedFile.name,
                size: selectedFile.size,
                format: selectedFile.type.split('/')[1]?.toUpperCase() || 'AUDIO',
                duration: audioBuffer.duration,
                bitrate: Math.round((selectedFile.size * 8) / (audioBuffer.duration * 1000))
            });
        } catch (e) {
            console.error(e);
        } finally {
            await audioCtx.close();
        }
    };

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFile(e.target.files?.[0] || null);
    const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
    const onDragLeave = () => setIsDragOver(false);
    const handleDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFile(e.dataTransfer.files?.[0]); };

    const handleCompress = async () => {
        if (!file || !audioInfo || !ffmpeg || !util) return;
        
        setIsProcessing(true);
        setProgress(0);
        setStatusText("Booting Engine...");

        try {
            const { fetchFile } = util;
            const inputName = 'input' + file.name.substring(file.name.lastIndexOf('.'));
            const outputName = 'output.mp3';

            setStatusText("Mounting File...");
            await ffmpeg.writeFile(inputName, await fetchFile(file));

            setStatusText("Encoding HD Bitstream...");
            const targetBitrate = estimation?.bitrate || 128;
            const args = ['-i', inputName, '-b:a', `${targetBitrate}k`];
            
            if (sampleRate !== 'auto') {
                args.push('-ar', sampleRate);
            }
            
            args.push(outputName);

            await ffmpeg.exec(args);

            const data = await ffmpeg.readFile(outputName);
            const blob = new Blob([data], { type: 'audio/mp3' });
            setCompressedUrl(URL.createObjectURL(blob));
            
            setProgress(100);
            setStatusText("Success");
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            toast({ title: "Compression Success!" });
        } catch (error: any) {
            console.error("Compression Final Error:", error);
            toast({ variant: 'destructive', title: "Process Failed", description: "Engine failed to initialize." });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (!compressedUrl || !file) return;
        const link = document.createElement("a");
        link.href = compressedUrl;
        const name = file.name.split('.')[0];
        link.download = `Optimized-${name}.mp3`;
        link.click();
    };

    const handleReset = () => {
        if (originalUrl) URL.revokeObjectURL(originalUrl);
        if (compressedUrl) URL.revokeObjectURL(compressedUrl);
        setFile(null);
        setAudioInfo(null);
        setCompressedUrl(null);
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="w-full max-w-7xl px-4 flex flex-col gap-8 pb-32 animate-in fade-in duration-700 mx-auto text-left">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                <div className="lg:col-span-5 flex flex-col gap-6 no-print">
                    <Card className="border-2 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950 border-primary/10 transition-all hover:border-primary/30">
                        <CardHeader className="bg-primary/5 border-b p-6 md:p-8 text-left">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                        <Volume2 className="size-7" />
                                    </div>
                                    <div className="text-left">
                                        <CardTitle className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-none">Studio Setup</CardTitle>
                                        <CardDescription className="text-[10px] font-bold uppercase opacity-50 tracking-widest mt-1">Industrial WASM Engine</CardDescription>
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
                                    onDragOver={onDragOver}
                                    onDragLeave={onDragLeave}
                                    onDrop={handleDrop}
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
                                                <p className="text-xl md:text-2xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Drop Audio to Shrink</p>
                                                <p className="text-[10px] md:text-sm text-muted-foreground mt-1 font-bold opacity-60 uppercase">MP3, WAV, M4A Support</p>
                                            </>
                                        )}
                                    </div>
                                    <input ref={fileInputRef} type="file" className="hidden" accept="audio/*" onChange={onFileChange} disabled={isEngineLoading} />
                                </div>
                            ) : (
                                <div className="space-y-10 animate-in slide-in-from-left duration-300">
                                    <div className="bg-primary/5 p-6 rounded-[2.5rem] border-2 border-primary/10 shadow-inner relative overflow-hidden group text-left">
                                        <div className="absolute top-0 right-0 size-24 bg-primary/5 blur-2xl rounded-full" />
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="size-14 rounded-2xl bg-white dark:bg-slate-900 border flex items-center justify-center shadow-lg"><FileAudio className="size-8 text-primary" /></div>
                                            <div className="flex-1 truncate">
                                                <p className="text-sm font-black uppercase tracking-tight truncate">{audioInfo?.name}</p>
                                                <div className="flex items-center gap-3 mt-0.5">
                                                    <Badge className="bg-primary text-white text-[8px] font-black">{audioInfo?.format || 'LOADING'}</Badge>
                                                    <span className="text-[10px] font-mono opacity-40">{audioInfo ? formatBytes(audioInfo.size) : '---'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                                            <div className="flex flex-col gap-0.5"><span className="text-[8px] font-black uppercase text-muted-foreground/50">Duration</span><span className="text-xs font-black uppercase tracking-tight">{audioInfo ? formatTime(audioInfo.duration) : '---'}</span></div>
                                            <div className="flex flex-col gap-0.5"><span className="text-[8px] font-black uppercase text-muted-foreground/50">Bitrate</span><span className="text-xs font-black uppercase tracking-tight">{audioInfo?.bitrate || '---'} kbps</span></div>
                                        </div>
                                    </div>

                                    <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
                                        <div className="flex items-center justify-between mb-4 px-1">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                                                <Settings2 className="size-3" /> Configuration
                                            </Label>
                                            <TabsList className="bg-muted p-1 rounded-xl border h-9">
                                                <TabsTrigger value="easy" className="text-[9px] font-black uppercase px-4">EASY</TabsTrigger>
                                                <TabsTrigger value="advanced" className="text-[9px] font-black uppercase px-4">PRO</TabsTrigger>
                                            </TabsList>
                                        </div>

                                        <TabsContent value="easy" className="m-0 space-y-4 animate-in fade-in duration-300">
                                            <div className="grid grid-cols-3 gap-3">
                                                {['low', 'medium', 'high'].map(q => (
                                                    <button 
                                                        key={q} 
                                                        onClick={() => setEasyQuality(q as any)}
                                                        className={cn(
                                                            "btn-pos-uiverse h-12 transition-all !ring-[3px] !ring-slate-950 dark:!ring-white",
                                                            easyQuality === q && "active-uiverse"
                                                        )}
                                                        data-label={q === 'low' ? 'BEST' : q === 'medium' ? 'BALANCED' : 'SHRINK'}
                                                    />
                                                ))}
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="advanced" className="m-0 space-y-6 animate-in fade-in duration-300">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-[9px] font-black uppercase opacity-60">Target Bitrate</Label>
                                                    <Select value={bitrate} onValueChange={v => setBitrate(v)}>
                                                        <SelectTrigger className="h-11 border-2 font-black rounded-xl bg-background shadow-sm"><SelectValue /></SelectTrigger>
                                                        <SelectContent className="rounded-xl border-2 shadow-2xl z-[150]">
                                                            {['320', '256', '192', '128', '96', '64', '48'].map(b => <SelectItem key={b} value={b} className="font-bold py-2">{b} kbps</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[9px] font-black uppercase opacity-60">Sample Rate</Label>
                                                    <Select value={sampleRate} onValueChange={v => setSampleRate(v)}>
                                                        <SelectTrigger className="h-11 border-2 font-black rounded-xl bg-background shadow-sm"><SelectValue /></SelectTrigger>
                                                        <SelectContent className="rounded-xl border-2 shadow-2xl z-[150]">
                                                            <SelectItem value="auto" className="font-bold py-2">Auto (Keep Original)</SelectItem>
                                                            <SelectItem value="44100" className="font-bold py-2">44.1 kHz</SelectItem>
                                                            <SelectItem value="22050" className="font-bold py-2">22.0 kHz</SelectItem>
                                                            <SelectItem value="16000" className="font-bold py-2">16.0 kHz</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="bg-muted/10 p-6 md:p-8 border-t flex flex-col gap-4 shrink-0">
                             {file && !compressedUrl && (
                                <Button 
                                    className="magic-button w-full h-16 md:h-18 rounded-[1.5rem] bg-primary hover:bg-transparent border-4 border-primary text-white hover:text-primary transition-all active:scale-95 disabled:opacity-50 group px-10 flex items-center justify-center gap-4 shadow-xl border-none" 
                                    onClick={handleCompress}
                                    disabled={isProcessing || isEngineLoading}
                                >
                                    <StarIcons />
                                    {isProcessing ? (
                                        <div className="flex items-center gap-3">
                                            <Loader2 className="size-6 md:size-8 animate-spin" />
                                            <span className="uppercase font-black text-sm md:text-base tracking-tighter">RENDERING WASM...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <Zap className="size-6 md:size-8 text-yellow-400 fill-yellow-400 group-hover:scale-125 transition-transform" />
                                            <span className="uppercase tracking-tighter text-lg md:text-xl font-black">START COMPRESSION</span>
                                        </div>
                                    )}
                                </Button>
                             )}
                             {compressedUrl && (
                                <Button 
                                    size="lg" 
                                    className="relative flex items-center justify-between gap-0 p-0 overflow-hidden bg-[#00aeef] hover:bg-[#009bd1] text-white font-black rounded-xl transition-all duration-300 group h-14 md:h-18 shadow-[0_8px_20px_-10px_rgba(0,174,239,0.5)] hover:shadow-[0_12px_25px_-10px_rgba(0,174,239,0.6)] hover:-translate-y-1 active:scale-95 border-none w-full" 
                                    onClick={handleDownload} 
                                >
                                    <div className="absolute left-6 w-0.5 h-10 bg-white/40 rounded-full" />
                                    <span className="flex-1 px-12 text-center tracking-widest text-lg md:text-xl uppercase">DOWNLOAD MP3</span>
                                    <div className="bg-white h-full pl-10 pr-12 flex items-center justify-center text-[#00aeef] transition-all group-hover:pl-11 group-hover:pr-13 relative" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)', marginLeft: '-15px' }}>
                                        <Download className="size-8 group-hover:scale-110 transition-transform" />
                                        <div className="absolute right-4 w-0.5 h-10 bg-[#00aeef]/20 rounded-full" />
                                    </div>
                                </Button>
                             )}
                             <div className="flex items-center gap-6 text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mx-auto">
                                <div className="flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-green-500" /> SECURE RAM</div>
                                <div className="flex items-center gap-1.5"><Cloud className="size-3.5 text-blue-500" /> ON-DEMAND CORE</div>
                            </div>
                        </CardFooter>
                    </Card>
                </div>

                <div className="lg:col-span-7 space-y-6">
                    {file ? (
                        <div className="space-y-6 animate-in zoom-in-95 duration-500 text-left">
                             <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white dark:bg-slate-900 border-2 border-primary/20 relative group">
                                <div className="absolute top-0 right-0 size-80 bg-primary/5 blur-3xl rounded-full" />
                                <CardHeader className="bg-primary/5 p-4 border-b text-center shrink-0">
                                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] text-primary flex items-center justify-center gap-2">
                                    <Activity className="size-3" /> PRECISION METRICS
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 md:p-12 space-y-10 relative z-10 text-left">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-muted/20 p-8 rounded-[2.5rem] border-2 shadow-inner">
                                        <div className="text-center md:text-left space-y-1">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Estimated Savings</p>
                                            <p className="text-5xl md:text-6xl font-black text-primary tracking-tighter leading-none">-{estimation?.reduction.toFixed(0) || 0}%</p>
                                        </div>
                                        <div className="size-32 rounded-3xl bg-primary text-white flex flex-col items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                                            <TrendingDown className="size-10 mb-1" />
                                            <p className="text-[9px] font-black uppercase">REDUCED</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-white dark:bg-slate-800 rounded-[1.5rem] border shadow-sm space-y-2 group hover:border-primary/30 transition-all hover:-translate-y-0.5 text-left overflow-hidden">
                                            <div className="flex items-center justify-between"><Zap className="size-4 opacity-40 group-hover:opacity-100 transition-opacity text-primary" /><Badge variant="outline" className="text-[7px] font-black border-none opacity-40 uppercase">Verified</Badge></div>
                                            <div className="truncate"><p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Source Bitrate</p><p className={cn("text-xs font-black tracking-tight truncate", "text-primary")}>{audioInfo?.bitrate} kbps</p></div>
                                        </div>
                                        <div className="p-4 bg-white dark:bg-slate-800 rounded-[1.5rem] border shadow-sm space-y-2 group hover:border-primary/30 transition-all hover:-translate-y-0.5 text-left overflow-hidden">
                                            <div className="flex items-center justify-between"><Target className="size-4 opacity-40 group-hover:opacity-100 transition-opacity text-emerald-500" /><Badge variant="outline" className="text-[7px] font-black border-none opacity-40 uppercase">Verified</Badge></div>
                                            <div className="truncate"><p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Target Bitrate</p><p className={cn("text-xs font-black tracking-tight truncate", "text-emerald-500")}>{estimation?.bitrate} kbps</p></div>
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {isProcessing && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-4 pt-6 border-t-2 border-dashed">
                                                <div className="flex justify-between items-center px-1">
                                                    <span className="text-[10px] font-black uppercase text-primary animate-pulse">{statusText}</span>
                                                    <span className="text-[10px] font-black">{progress}%</span>
                                                </div>
                                                <Progress value={progress} className="h-1.5 shadow-inner" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </CardContent>
                             </Card>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
