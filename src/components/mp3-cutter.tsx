
'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';
import { 
    UploadCloud, 
    Loader2, 
    Play, 
    Pause, 
    Scissors, 
    Download, 
    RefreshCcw, 
    Zap, 
    ShieldCheck, 
    Sparkles, 
    Volume2, 
    ZoomIn, 
    ZoomOut, 
    Settings2, 
    CheckCircle2, 
    X,
    Trash2,
    Crop,
    ArrowRightLeft,
    Clock,
    Music,
    MousePointer2,
    Check,
    ListFilter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

type Stage = 'upload' | 'studio' | 'processing';

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

export default function Mp3Cutter() {
    const { toast } = useToast();
    const [stage, setStage] = useState<Stage>('upload');
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isDragOver, setIsDragOver] = useState(false);
    
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [zoom, setZoom] = useState([50]);
    
    // Trimming logic
    const [selection, setSelection] = useState({ start: 0, end: 10 });
    const [fadeIn, setFadeIn] = useState(0);
    const [fadeOut, setFadeOut] = useState(0);
    const [normalize, setNormalize] = useState(false);
    const [keepSelected, setKeepSelected] = useState(true); // true = trim, false = delete section

    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);

    const wavesurferRef = useRef<WaveSurfer | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const regionsPluginRef = useRef<any>(null);

    // --- INITIALIZE WAVESURFER ---
    const initWavesurfer = useCallback((url: string) => {
        if (!containerRef.current) return;
        
        const ws = WaveSurfer.create({
            container: containerRef.current,
            waveColor: '#d1d5db',
            progressColor: '#3b82f6',
            cursorColor: '#ef4444',
            barWidth: 2,
            barRadius: 3,
            height: 200,
            autoCenter: true,
            dragToSeek: true,
            minPxPerSec: zoom[0]
        });

        const regions = ws.registerPlugin(RegionsPlugin.create());
        regionsPluginRef.current = regions;

        ws.on('ready', () => {
            const d = ws.getDuration();
            setDuration(d);
            setSelection({ start: 0, end: Math.min(d, 30) });
            
            // Initial Region
            regions.addRegion({
                start: 0,
                end: Math.min(d, 30),
                color: 'rgba(59, 130, 246, 0.15)',
                drag: true,
                resize: true,
            });
        });

        ws.on('audioprocess', (time) => setCurrentTime(time));
        ws.on('interaction', (time) => setCurrentTime(time));
        ws.on('play', () => setIsPlaying(true));
        ws.on('pause', () => setIsPlaying(false));

        regions.on('region-updated', (region) => {
            setSelection({ start: region.start, end: region.end });
        });

        ws.load(url);
        wavesurferRef.current = ws;
    }, [zoom]);

    useEffect(() => {
        if (audioFile && stage === 'studio' && !wavesurferRef.current) {
            const url = URL.createObjectURL(audioFile);
            initWavesurfer(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [audioFile, stage, initWavesurfer]);

    useEffect(() => {
        if (wavesurferRef.current) {
            wavesurferRef.current.zoom(zoom[0]);
        }
    }, [zoom]);

    // --- FILE HANDLERS ---
    const handleFile = (file: File | null) => {
        if (file && file.type.startsWith('audio/')) {
            setAudioFile(file);
            setStage('studio');
        } else if (file) {
            toast({ variant: 'destructive', title: 'Invalid File', description: 'Please upload an audio file.' });
        }
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
    const onDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };

    // --- STUDIO ACTIONS ---
    const togglePlay = () => wavesurferRef.current?.playPause();
    
    const playSelection = () => {
        if (!wavesurferRef.current) return;
        wavesurferRef.current.play(selection.start, selection.end);
    };

    const handleManualTimeChange = (type: 'start' | 'end', val: string) => {
        const time = parseFloat(val);
        if (isNaN(time)) return;
        
        const newSelection = { ...selection, [type]: Math.max(0, Math.min(duration, time)) };
        if (newSelection.start >= newSelection.end) return;

        setSelection(newSelection);
        const region = regionsPluginRef.current?.getRegions()[0];
        if (region) {
            region.update({ start: newSelection.start, end: newSelection.end });
        }
    };

    // --- PROCESSING ENGINE ---
    const exportAudio = async () => {
        if (!audioFile) return;
        setIsProcessing(true);
        setStage('processing');
        setProgress(10);

        try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const arrayBuffer = await audioFile.arrayBuffer();
            setProgress(30);
            
            const originalBuffer = await audioCtx.decodeAudioData(arrayBuffer);
            setProgress(50);

            const { start, end } = selection;
            const sampleRate = originalBuffer.sampleRate;
            
            let finalBuffer: AudioBuffer;

            if (keepSelected) {
                // TRIM MODE
                const startFrame = Math.floor(start * sampleRate);
                const endFrame = Math.floor(end * sampleRate);
                const frameCount = endFrame - startFrame;
                
                const offlineCtx = new OfflineAudioContext(
                    originalBuffer.numberOfChannels,
                    frameCount,
                    sampleRate
                );

                const source = offlineCtx.createBufferSource();
                source.buffer = originalBuffer;

                const gainNode = offlineCtx.createGain();
                
                // Apply Fades
                if (fadeIn > 0) {
                    gainNode.gain.setValueAtTime(0, 0);
                    gainNode.gain.linearRampToValueAtTime(1, fadeIn);
                }
                if (fadeOut > 0) {
                    const fadeOutStart = (end - start) - fadeOut;
                    gainNode.gain.setValueAtTime(1, Math.max(0, fadeOutStart));
                    gainNode.gain.linearRampToValueAtTime(0, end - start);
                }

                source.connect(gainNode);
                gainNode.connect(offlineCtx.destination);
                
                source.start(0, start, end - start);
                finalBuffer = await offlineCtx.startRendering();
            } else {
                // DELETE SECTION MODE
                const startFrame = Math.floor(start * sampleRate);
                const endFrame = Math.floor(end * sampleRate);
                const totalFrames = originalBuffer.length - (endFrame - startFrame);

                finalBuffer = audioCtx.createBuffer(
                    originalBuffer.numberOfChannels,
                    totalFrames,
                    sampleRate
                );

                for (let channel = 0; channel < originalBuffer.numberOfChannels; channel++) {
                    const originalData = originalBuffer.getChannelData(channel);
                    const newData = finalBuffer.getChannelData(channel);
                    
                    newData.set(originalData.subarray(0, startFrame));
                    newData.set(originalData.subarray(endFrame), startFrame);
                }
            }

            setProgress(80);
            const wavBlob = audioBufferToWav(finalBuffer);
            const url = URL.createObjectURL(wavBlob);
            
            setResultBlob(wavBlob);
            setResultUrl(url);
            setProgress(100);
            
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#3b82f6', '#ffffff']
            });

            toast({ title: "Studio Export Ready!" });
        } catch (e) {
            console.error(e);
            toast({ variant: 'destructive', title: "Studio Error", description: "Could not process audio." });
            setStage('studio');
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
        if (!resultUrl) return;
        const link = document.createElement('a');
        link.href = resultUrl;
        const baseName = audioFile?.name.split('.').slice(0, -1).join('.') || 'audio';
        link.download = `GR7-Cut-${baseName}.wav`;
        link.click();
    };

    const handleReset = () => {
        wavesurferRef.current?.destroy();
        wavesurferRef.current = null;
        setAudioFile(null);
        setResultUrl(null);
        setResultBlob(null);
        setStage('upload');
        setProgress(0);
        setCurrentTime(0);
        setDuration(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="w-full max-w-7xl animate-in fade-in duration-700 px-4 flex flex-col items-center gap-6">
            
            {stage === 'upload' && (
                <div className="w-full max-w-2xl py-10 flex flex-col items-center">
                    <Card 
                        className={cn(
                            "w-full glass-card overflow-hidden transition-all duration-300 border-2 border-dashed shadow-2xl rounded-[3rem] hover:border-primary/50 cursor-pointer select-none",
                            isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.01]"
                        )}
                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={onDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <CardHeader className="bg-muted/30 border-b p-8 text-center">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">AUDIO WORKSPACE</CardTitle>
                        </CardHeader>
                        <CardContent className="p-12 md:p-20">
                            <div className="border-4 border-dashed border-muted-foreground/20 rounded-[2.5rem] p-10 flex flex-col items-center justify-center space-y-6 bg-muted/30 group relative">
                                <div className="relative">
                                    <UploadCloud className="size-20 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <Zap className="absolute -top-1 -right-1 size-8 text-yellow-500 animate-pulse" />
                                </div>
                                <div className="text-center">
                                    <p className="text-xl md:text-2xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Drop Audio File here</p>
                                    <p className="text-[10px] md:text-sm text-muted-foreground mt-2 font-bold opacity-60 uppercase tracking-widest">MP3, WAV, M4A, OGG Supported.</p>
                                </div>
                            </div>
                            <input ref={fileInputRef} type="file" className="hidden" accept="audio/*" onChange={onFileChange} />
                        </CardContent>
                        <CardFooter className="justify-center gap-6 text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 bg-muted/10 pt-6 px-4">
                            <div className="flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-green-500" /> SECURE RAM</div>
                            <div className="flex items-center gap-1.5"><Zap className="size-3.5 text-yellow-500" /> INSTANT VISUALS</div>
                            <div className="flex items-center gap-1.5"><Volume2 className="size-3.5 text-primary" /> HD STUDIO</div>
                        </CardFooter>
                    </Card>
                </div>
            )}

            {stage === 'studio' && audioFile && (
                <div className="w-full grid lg:grid-cols-12 gap-8 items-start animate-in slide-in-from-bottom-6 duration-500 text-left">
                    <div className="lg:col-span-8 space-y-6">
                        <Card className="overflow-hidden border-2 shadow-3xl h-full flex flex-col bg-card/50 rounded-[2.5rem]">
                            <CardHeader className="bg-muted/30 border-b py-4 px-6 flex flex-row items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Volume2 className="h-5 w-5 text-primary" />
                                    <div className="text-left">
                                        <CardTitle className="text-sm font-black uppercase tracking-widest truncate max-w-[200px]">{audioFile.name}</CardTitle>
                                        <CardDescription className="text-[9px] font-bold opacity-60 uppercase">{formatBytes(audioFile.size)} • {formatTime(duration)}</CardDescription>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setZoom([Math.max(10, zoom[0] - 10)])}><ZoomOut className="h-4 w-4"/></Button>
                                    <span className="text-[10px] font-black w-8 text-center">{zoom}%</span>
                                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setZoom([Math.min(200, zoom[0] + 10)])}><ZoomIn className="h-4 w-4"/></Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 md:p-10 bg-slate-50 dark:bg-black/20">
                                <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-inner border-2">
                                    <div ref={containerRef} className="w-full touch-none" onTouchStart={e => e.stopPropagation()} />
                                    <div className="mt-4 flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-40">
                                        <span>00:00.00</span>
                                        <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                                            <Clock className="size-3" /> {formatTime(currentTime)}
                                        </div>
                                        <span>{formatTime(duration)}</span>
                                    </div>
                                </div>

                                <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                                    <Button variant="outline" size="icon" className="size-14 rounded-full border-4 shadow-xl active:scale-95 transition-all" onClick={togglePlay}>
                                        {isPlaying ? <Pause className="size-6" /> : <Play className="size-6 ml-1" />}
                                    </Button>
                                    <Button variant="secondary" className="h-14 px-8 rounded-2xl font-black uppercase text-xs shadow-lg border-2" onClick={playSelection}>
                                        <ListFilter className="mr-2 size-4" /> PLAY SELECTION
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="rounded-[2rem] border-2 shadow-xl bg-card/50">
                                <CardHeader className="p-6 border-b bg-muted/20">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2"><Scissors className="size-3" /> Selection Mode</Label>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className={cn("p-4 rounded-xl border-2 cursor-pointer transition-all", keepSelected ? "border-primary bg-primary/5 shadow-inner" : "border-muted")} onClick={() => setKeepSelected(true)}>
                                            <p className="text-[10px] font-black uppercase">KEEP SELECTION</p>
                                            <p className="text-[8px] font-bold opacity-40 uppercase">Trim edges</p>
                                        </div>
                                        <div className={cn("p-4 rounded-xl border-2 cursor-pointer transition-all", !keepSelected ? "border-rose-500 bg-rose-500/5 shadow-inner" : "border-muted")} onClick={() => setKeepSelected(false)}>
                                            <p className="text-[10px] font-black uppercase">DELETE SELECTION</p>
                                            <p className="text-[8px] font-bold opacity-40 uppercase">Cut middle</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-[2rem] border-2 shadow-xl bg-card/50">
                                <CardHeader className="p-6 border-b bg-muted/20">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2"><Settings2 className="size-3" /> Time Inputs</Label>
                                </CardHeader>
                                <CardContent className="p-6 grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[8px] font-black uppercase opacity-40">Start (sec)</Label>
                                        <Input type="number" step="0.01" value={selection.start.toFixed(2)} onChange={e => handleManualTimeChange('start', e.target.value)} className="h-10 font-black border-2 rounded-xl text-center" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[8px] font-black uppercase opacity-40">End (sec)</Label>
                                        <Input type="number" step="0.01" value={selection.end.toFixed(2)} onChange={e => handleManualTimeChange('end', e.target.value)} className="h-10 font-black border-2 rounded-xl text-center" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                        <Card className="glass-panel border-none shadow-2xl rounded-[2.5rem]">
                            <CardHeader className="bg-primary/5 border-b border-white/10 p-6 md:p-8">
                                <CardTitle className="text-base md:text-lg flex items-center gap-3 font-black uppercase tracking-tighter text-primary text-left">
                                    <Sparkles className="size-5 text-primary" /> Studio Mastering
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 md:p-8 space-y-10 text-left">
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center"><Label className="text-[10px] font-black uppercase opacity-60">FADE IN (SEC)</Label><Badge variant="secondary" className="font-mono text-[9px]">{fadeIn}s</Badge></div>
                                        <Slider min={0} max={5} step={0.1} value={[fadeIn]} onValueChange={v => setFadeIn(v[0])} />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center"><Label className="text-[10px] font-black uppercase opacity-60">FADE OUT (SEC)</Label><Badge variant="secondary" className="font-mono text-[9px]">{fadeOut}s</Badge></div>
                                        <Slider min={0} max={5} step={0.1} value={[fadeOut]} onValueChange={v => setFadeOut(v[0])} />
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border-2 border-dashed">
                                        <div className="flex items-center gap-3"><Volume2 className="size-4 text-primary"/><Label className="text-[10px] font-black uppercase opacity-60">Normalise Audio</Label></div>
                                        <Switch checked={normalize} onCheckedChange={setNormalize} />
                                    </div>
                                </div>

                                <div className="p-5 bg-green-500/5 rounded-2xl border-2 border-green-500/10 flex gap-4 text-left shadow-sm">
                                    <ShieldCheck className="size-6 text-green-600 shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-green-700 uppercase tracking-tight">Studio Quality</p>
                                        <p className="text-[8px] text-green-600/80 font-medium leading-tight uppercase">Lossless buffer rendering active. No quality drop on export.</p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-muted/10 p-6 md:p-8 border-t border-white/10 flex flex-col gap-3">
                                <Button 
                                    className="magic-button w-full h-16 md:h-20 rounded-full bg-primary hover:bg-transparent border-4 border-primary text-white hover:text-primary transition-all active:scale-95 group px-10 flex items-center justify-center gap-4 shadow-2xl" 
                                    onClick={exportAudio}
                                >
                                    <StarIcons />
                                    <Scissors className="size-7 group-hover:rotate-12 transition-transform" />
                                    <span className="uppercase tracking-tighter text-lg font-black">EXPORT AUDIO</span>
                                </Button>
                                <Button variant="outline" onClick={handleReset} className="w-full h-11 border-2 font-black text-[9px] uppercase rounded-xl hover:bg-destructive/5 hover:text-destructive"><RefreshCcw className="mr-2 size-3" /> Start New</Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            )}

            {stage === 'processing' && (
                <div className="w-full max-w-2xl py-20 flex flex-col items-center justify-center gap-10 animate-in zoom-in-95 duration-500 text-center mx-auto">
                    {isProcessing ? (
                        <>
                            <div className="relative">
                                <div className="size-32 md:size-48 rounded-full border-[8px] border-primary/20 border-t-primary animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                     <Volume2 className="size-12 md:size-20 text-primary animate-pulse" />
                                </div>
                            </div>
                            <div className="text-center space-y-4 w-full px-10">
                                <p className="text-2xl md:text-3xl font-black text-primary uppercase tracking-tighter animate-pulse">Mastering Audio Buffer...</p>
                                <Progress value={progress} className="h-2 shadow-inner" />
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.3em] opacity-40">Local Studio Rendering • No Server Upload</p>
                            </div>
                        </>
                    ) : (
                        <div className="w-full space-y-8 animate-in zoom-in-95">
                            <div className="size-24 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto shadow-2xl relative">
                                <CheckCircle2 className="size-12" />
                                <StarIcons />
                                <Sparkles className="absolute -top-2 -right-2 text-yellow-400" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black uppercase tracking-tighter text-green-700">Studio Export Complete</h3>
                                <p className="text-sm text-muted-foreground font-bold uppercase">Your audio is ready for high-fidelity download.</p>
                            </div>
                            
                            {resultUrl && (
                                <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border-2 shadow-xl w-full max-w-md mx-auto">
                                    <audio controls src={resultUrl} className="w-full h-12" />
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-xl mx-auto pt-6">
                                <Button variant="outline" onClick={() => setStage('studio')} className="h-14 px-8 rounded-xl font-black uppercase text-[10px] border-2 flex-1 w-full"><RefreshCcw className="mr-2 size-4" /> Back to Studio</Button>
                                <Button 
                                    size="lg" 
                                    className="relative flex items-center justify-between gap-0 p-0 overflow-hidden bg-[#00aeef] hover:bg-[#009bd1] text-white font-black rounded-xl transition-all duration-300 group h-14 md:h-16 shadow-[0_8px_20px_-10px_rgba(0,174,239,0.5)] border-none flex-[2] w-full" 
                                    onClick={handleDownload}
                                >
                                    <div className="absolute left-4 w-0.5 h-6 bg-white/40 rounded-full" />
                                    <span className="flex-1 px-10 text-center tracking-widest text-[11px] uppercase">DOWNLOAD STUDIO FILE</span>
                                    <div className="bg-white h-full pl-6 pr-8 flex items-center justify-center text-[#00aeef] transition-all group-hover:pl-7 group-hover:pr-9 relative" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)', marginLeft: '-15px' }}>
                                        <Download className="size-6 md:size-8 group-hover:scale-110 transition-transform" />
                                        <div className="absolute right-3 w-0.5 h-6 bg-[#00aeef]/20 rounded-full" />
                                    </div>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
