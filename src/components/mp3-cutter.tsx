'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
    Clock,
    MousePointer2,
    ListFilter,
    Activity,
    Info,
    ChevronRight,
    Music,
    Plus,
    Square
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
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

type Stage = 'upload' | 'studio' | 'processing';

interface RegionData {
    id: string;
    start: number;
    end: number;
}

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
    
    const [regionsList, setRegionsList] = useState<RegionData[]>([]);
    const [activeRegionId, setActiveRegionId] = useState<string | null>(null);
    
    const [fadeIn, setFadeIn] = useState(0);
    const [fadeOut, setFadeOut] = useState(0);
    const [normalize, setNormalize] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);

    const wavesurferRef = useRef<WaveSurfer | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const regionsPluginRef = useRef<any>(null);

    // Ref to access state inside events without stale closures
    const stateRef = useRef({ activeRegionId, regionsList });
    useEffect(() => {
        stateRef.current = { activeRegionId, regionsList };
    }, [activeRegionId, regionsList]);

    // --- INITIALIZE WAVESURFER ---
    const initWavesurfer = useCallback((url: string) => {
        if (!containerRef.current) return;
        
        const ws = WaveSurfer.create({
            container: containerRef.current,
            waveColor: '#94a3b8',
            progressColor: '#3b82f6',
            cursorColor: '#ef4444',
            barWidth: 2,
            barGap: 3,
            height: 200,
            autoCenter: true,
            autoScroll: true,
            dragToSeek: true,
            minPxPerSec: zoom[0],
            normalize: true,
        });

        const regions = ws.registerPlugin(RegionsPlugin.create());
        regionsPluginRef.current = regions;

        ws.on('ready', () => {
            const d = ws.getDuration();
            setDuration(d);
            
            // Initial selection
            const initialEnd = Math.min(d, 30);
            const r = regions.addRegion({
                id: 'region-1',
                start: 0,
                end: initialEnd,
                color: 'rgba(255, 201, 40, 0.1)',
                drag: true,
                resize: true,
            });
            setRegionsList([{ id: r.id, start: r.start, end: r.end }]);
            setActiveRegionId(r.id);
        });

        ws.on('audioprocess', (time) => {
            setCurrentTime(time);
            
            // Auto-stop at end of active region
            const currentActiveId = stateRef.current.activeRegionId;
            if (currentActiveId) {
                const active = stateRef.current.regionsList.find(r => r.id === currentActiveId);
                if (active && time >= active.end) {
                    ws.pause();
                    ws.setTime(active.start); // Seek back to start for next play
                }
            }
        });
        
        ws.on('interaction', (time) => setCurrentTime(time));
        ws.on('play', () => setIsPlaying(true));
        ws.on('pause', () => setIsPlaying(false));

        regions.on('region-updated', (region: any) => {
            setRegionsList(prev => prev.map(r => r.id === region.id ? { ...r, start: region.start, end: region.end } : r));
            // SYNC FIX: Jump cursor to start when handles are moved
            ws.setTime(region.start);
        });

        regions.on('region-clicked', (region: any) => {
            setActiveRegionId(region.id);
            // SYNC FIX: Jump cursor to start when selection is clicked
            ws.setTime(region.start);
        });

        ws.load(url);
        wavesurferRef.current = ws;
    }, []);

    useEffect(() => {
        if (audioFile && stage === 'studio' && !wavesurferRef.current) {
            const url = URL.createObjectURL(audioFile);
            initWavesurfer(url);
            return () => {
                URL.revokeObjectURL(url);
                wavesurferRef.current?.destroy();
                wavesurferRef.current = null;
            };
        }
    }, [audioFile, stage, initWavesurfer]);

    useEffect(() => {
        if (wavesurferRef.current) {
            wavesurferRef.current.zoom(zoom[0]);
        }
    }, [zoom]);

    const handleFileChange = (file: File | null) => {
        if (file && file.type.startsWith('audio/')) {
            setAudioFile(file);
            setStage('studio');
            setResultUrl(null);
            setRegionsList([]);
            setActiveRegionId(null);
        } else if (file) {
            toast({ variant: 'destructive', title: 'Invalid File', description: 'Please upload a valid audio file.' });
        }
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
    const onDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };

    const togglePlay = () => {
        if (!wavesurferRef.current) return;

        const active = regionsList.find(r => r.id === activeRegionId);
        if (active) {
            const time = wavesurferRef.current.getCurrentTime();
            // If we're not playing and we're at the end or outside selection, reset to start
            if (!isPlaying && (time >= active.end || time < active.start)) {
                wavesurferRef.current.setTime(active.start);
            }
        }
        
        wavesurferRef.current.playPause();
    };
    
    const playRegion = (r: RegionData) => {
        if (!wavesurferRef.current) return;
        wavesurferRef.current.setTime(r.start);
        wavesurferRef.current.play();
    };

    const addNewSegment = () => {
        if (!wavesurferRef.current || !regionsPluginRef.current) return;
        const d = wavesurferRef.current.getDuration();
        const start = Math.min(currentTime, d - 5);
        const end = Math.min(start + 10, d);
        
        const r = regionsPluginRef.current.addRegion({
            id: `region-${Math.random().toString(36).substr(2, 5)}`,
            start,
            end,
            color: 'rgba(255, 201, 40, 0.1)',
            drag: true,
            resize: true,
        });
        setRegionsList(prev => [...prev, { id: r.id, start: r.start, end: r.end }]);
        setActiveRegionId(r.id);
        wavesurferRef.current.setTime(start);
        toast({ title: "New Segment Added" });
    };

    const removeRegion = (id: string) => {
        if (regionsList.length <= 1) return;
        const region = regionsPluginRef.current?.getRegions().find((r: any) => r.id === id);
        if (region) {
            region.remove();
            const updated = regionsList.filter(r => r.id !== id);
            setRegionsList(updated);
            if (activeRegionId === id) setActiveRegionId(updated[0].id);
        }
    };

    const handleManualTimeChange = (type: 'start' | 'end', val: string) => {
        if (!activeRegionId) return;
        const time = parseFloat(val);
        if (isNaN(time)) return;
        
        const region = regionsPluginRef.current?.getRegions().find((r: any) => r.id === activeRegionId);
        if (region) {
            const start = type === 'start' ? Math.max(0, Math.min(region.end - 0.1, time)) : region.start;
            const end = type === 'end' ? Math.max(region.start + 0.1, Math.min(duration, time)) : region.end;
            // FIX: WaveSurfer v7 uses setOptions instead of update
            region.setOptions({ start, end });
        }
    };

    const concatenateAudioBuffers = (audioCtx: AudioContext, buffers: AudioBuffer[]): AudioBuffer => {
        const totalLength = buffers.reduce((acc, buf) => acc + buf.length, 0);
        const out = audioCtx.createBuffer(buffers[0].numberOfChannels, totalLength, buffers[0].sampleRate);
        
        for (let channel = 0; channel < buffers[0].numberOfChannels; channel++) {
            let offset = 0;
            for (const buf of buffers) {
                out.getChannelData(channel).set(buf.getChannelData(channel), offset);
                offset += buf.length;
            }
        }
        return out;
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

    const exportAudio = async () => {
        if (!audioFile || regionsList.length === 0) return;
        setIsProcessing(true);
        setStage('processing');
        setProgress(10);

        try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const arrayBuffer = await audioFile.arrayBuffer();
            const originalBuffer = await audioCtx.decodeAudioData(arrayBuffer);
            setProgress(30);

            const sortedRegions = [...regionsList].sort((a, b) => a.start - b.start);
            const segmentBuffers: AudioBuffer[] = [];

            for (let i = 0; i < sortedRegions.length; i++) {
                const { start, end } = sortedRegions[i];
                const sampleRate = originalBuffer.sampleRate;
                const startFrame = Math.floor(start * sampleRate);
                const endFrame = Math.floor(end * sampleRate);
                const frameCount = Math.max(1, endFrame - startFrame);
                
                const offlineCtx = new OfflineAudioContext(originalBuffer.numberOfChannels, frameCount, sampleRate);
                const source = offlineCtx.createBufferSource();
                source.buffer = originalBuffer;

                const gainNode = offlineCtx.createGain();
                
                if (fadeIn > 0 && i === 0) {
                    gainNode.gain.setValueAtTime(0, 0);
                    gainNode.gain.linearRampToValueAtTime(1, fadeIn);
                }
                if (fadeOut > 0 && i === sortedRegions.length - 1) {
                    gainNode.gain.setValueAtTime(1, Math.max(0, (end - start) - fadeOut));
                    gainNode.gain.linearRampToValueAtTime(0, end - start);
                }

                source.connect(gainNode);
                gainNode.connect(offlineCtx.destination);
                source.start(0, start, end - start);
                
                const renderedSegment = await offlineCtx.startRendering();
                segmentBuffers.push(renderedSegment);
                setProgress(30 + Math.round(((i + 1) / sortedRegions.length) * 40));
            }

            const finalBuffer = concatenateAudioBuffers(audioCtx, segmentBuffers);
            setProgress(80);
            
            const wavBlob = audioBufferToWav(finalBuffer);
            setResultUrl(URL.createObjectURL(wavBlob));
            setProgress(100);
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            toast({ title: "Multi-Part Join Complete!" });
        } catch (e) {
            console.error(e);
            toast({ variant: 'destructive', title: "Extraction Error" });
            setStage('studio');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReset = () => {
        wavesurferRef.current?.destroy();
        wavesurferRef.current = null;
        setAudioFile(null);
        setResultUrl(null);
        setStage('upload');
        setProgress(0);
        setRegionsList([]);
        setActiveRegionId(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const activeRegion = regionsList.find(r => r.id === activeRegionId);

    return (
        <div className="w-full max-w-7xl animate-in fade-in duration-700 px-4 flex flex-col items-center gap-6 pb-20">
            <style jsx global>{`
                .wavesurfer-region {
                    border-top: 4px solid #FFC928 !important;
                    border-bottom: 4px solid #FFC928 !important;
                    z-index: 10 !important;
                    background-color: rgba(255, 201, 40, 0.15) !important;
                    cursor: move !important;
                }
                .wavesurfer-handle {
                    width: 20px !important;
                    background-color: #FFC928 !important;
                    opacity: 1 !important;
                    z-index: 20 !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    cursor: ew-resize !important;
                    box-shadow: 0 0 10px rgba(0,0,0,0.3) !important;
                }
                .wavesurfer-handle::after {
                    content: "|||" !important;
                    color: rgba(0,0,0,0.4) !important;
                    font-size: 10px !important;
                    font-weight: 900 !important;
                    letter-spacing: -1px !important;
                }
            `}</style>

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
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">AUDIO STUDIO</CardTitle>
                        </CardHeader>
                        <CardContent className="p-12 md:p-20">
                            <div className="border-4 border-dashed border-muted-foreground/20 rounded-[2.5rem] p-10 flex flex-col items-center justify-center space-y-6 bg-muted/30 group relative">
                                <div className="relative">
                                    <UploadCloud className="size-20 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <Zap className="absolute -top-1 -right-1 size-8 text-yellow-500 animate-pulse" />
                                </div>
                                <div className="text-center">
                                    <p className="text-xl md:text-2xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Drop Audio File</p>
                                    <p className="text-[10px] md:text-sm text-muted-foreground mt-2 font-bold opacity-60 uppercase">MP3, WAV, M4A Support</p>
                                </div>
                            </div>
                            <input ref={fileInputRef} type="file" className="hidden" accept="audio/*" onChange={onFileChange} />
                        </CardContent>
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
                                    <span className="text-sm font-black w-8 text-center">{zoom[0]}%</span>
                                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setZoom([Math.min(300, zoom[0] + 10)])}><ZoomIn className="h-4 w-4"/></Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 md:p-10 bg-slate-50 dark:bg-black/20">
                                
                                {activeRegion && (
                                    <div className="mb-6 grid grid-cols-3 gap-4 animate-in slide-in-from-top-2">
                                        <div className="bg-white dark:bg-slate-900 border-2 rounded-2xl p-3 text-center shadow-sm">
                                            <p className="text-[8px] font-black uppercase opacity-40 mb-1">Start Point</p>
                                            <Input 
                                                type="number" 
                                                step="0.01"
                                                value={activeRegion.start.toFixed(2)} 
                                                onChange={(e) => handleManualTimeChange('start', e.target.value)}
                                                className="h-8 text-center font-black text-primary border-none shadow-none focus-visible:ring-0 text-sm font-mono p-0"
                                            />
                                        </div>
                                        <div className="bg-white dark:bg-slate-900 border-2 rounded-2xl p-3 text-center shadow-sm">
                                            <p className="text-[8px] font-black uppercase opacity-40 mb-1">End Point</p>
                                            <Input 
                                                type="number" 
                                                step="0.01"
                                                value={activeRegion.end.toFixed(2)} 
                                                onChange={(e) => handleManualTimeChange('end', e.target.value)}
                                                className="h-8 text-center font-black text-primary border-none shadow-none focus-visible:ring-0 text-sm font-mono p-0"
                                            />
                                        </div>
                                        <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-3 text-center shadow-inner">
                                            <p className="text-[8px] font-black uppercase text-primary opacity-60 mb-1">Clip Length</p>
                                            <p className="text-xs md:text-sm font-black text-primary font-mono py-1.5">{formatTime(activeRegion.end - activeRegion.start)}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-inner border-2 overflow-x-auto custom-scrollbar">
                                    <div ref={containerRef} className="w-full min-w-full" style={{ touchAction: 'none' }} />
                                    <div className="mt-4 flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-40">
                                        <span>00:00.00</span>
                                        <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                                            <Activity className="size-3 animate-pulse" /> {formatTime(currentTime)}
                                        </div>
                                        <span>{formatTime(duration)}</span>
                                    </div>
                                </div>

                                <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                                    <Button variant="outline" size="icon" className="size-14 rounded-full border-4 shadow-xl active:scale-95 transition-all" onClick={togglePlay}>
                                        {isPlaying ? <Pause className="size-6" /> : <Play className="size-6 ml-1" />}
                                    </Button>
                                    <Button className="h-14 px-8 rounded-2xl bg-primary text-white font-black uppercase text-xs shadow-lg group" onClick={addNewSegment}>
                                        <Plus className="mr-2 size-4 group-hover:scale-125 transition-transform" /> ADD NEW SEGMENT
                                    </Button>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-muted/10 p-6 border-t">
                                <ScrollArea className="w-full h-auto">
                                    <div className="flex gap-3 pb-2">
                                        {regionsList.map((r, i) => (
                                            <div key={r.id} onClick={() => { setActiveRegionId(r.id); playRegion(r); }}
                                                 className={cn("flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all", activeRegionId === r.id ? "bg-primary/10 border-primary" : "bg-white border-transparent hover:border-primary/20")}>
                                                <Badge variant="secondary" className="bg-primary/20 text-primary">#{i + 1}</Badge>
                                                <div className="flex flex-col text-[10px] font-bold">
                                                    <span>{formatTime(r.start)} - {formatTime(r.end)}</span>
                                                </div>
                                                <Button size="icon" variant="ghost" className="size-6 rounded-full text-destructive" onClick={(e) => { e.stopPropagation(); removeRegion(r.id); }}><Trash2 className="size-3" /></Button>
                                            </div>
                                        ))}
                                    </div>
                                    <ScrollBar orientation="horizontal" />
                                </ScrollArea>
                            </CardFooter>
                        </Card>
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                        <Card className="glass-panel border-none shadow-2xl overflow-hidden rounded-[2.5rem]">
                            <CardHeader className="bg-primary/5 border-b border-white/10 p-6 md:p-8">
                                <CardTitle className="text-base md:text-lg flex items-center gap-3 font-black uppercase tracking-tighter text-primary text-left">
                                    <Settings2 className="size-4 md:size-5 text-primary" /> Multi-Part Logic
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
                                </div>

                                <div className="p-5 bg-blue-500/5 rounded-2xl border-2 border-blue-500/10 flex gap-4 text-left shadow-sm">
                                    <ShieldCheck className="size-6 text-green-600 shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-green-700 uppercase tracking-tight">Multi-Trim Active</p>
                                        <p className="text-[8px] text-green-600/80 font-medium leading-tight uppercase">Segments will be joined seamlessly into one file.</p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-muted/10 p-6 md:p-8 border-t border-white/10 flex flex-col gap-3">
                                <Button 
                                    className="magic-button w-full h-16 md:h-20 rounded-full bg-primary hover:bg-transparent border-4 border-primary text-white hover:text-primary transition-all active:scale-95 group px-10 flex items-center justify-center gap-4 shadow-2xl" 
                                    onClick={exportAudio}
                                    disabled={regionsList.length === 0}
                                >
                                    <StarIcons />
                                    <Scissors className="size-7 group-hover:rotate-12 transition-transform" />
                                    <span className="uppercase tracking-tighter text-lg font-black">EXTRACT & JOIN</span>
                                </Button>
                                <Button variant="outline" onClick={handleReset} className="w-full h-11 border-2 font-black text-[9px] uppercase rounded-xl hover:bg-destructive/5 hover:text-destructive transition-all duration-300"><RefreshCcw className="size-3" /> Start Over</Button>
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
                                <p className="text-2xl md:text-3xl font-black text-primary uppercase tracking-tighter animate-pulse">Processing Multi-Parts...</p>
                                <Progress value={progress} className="h-2 shadow-inner" />
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.3em] opacity-40">Local Workspace Join Rendering</p>
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
                                <h3 className="text-3xl font-black uppercase tracking-tighter text-green-700">Studio Join Complete</h3>
                                <p className="text-sm text-muted-foreground font-bold uppercase">Your multi-part join is ready for download.</p>
                            </div>
                            
                            {resultUrl && (
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border-2 shadow-xl w-full max-w-md mx-auto">
                                    <audio controls src={resultUrl} className="w-full h-12" />
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-xl mx-auto pt-6">
                                <Button variant="outline" onClick={() => setStage('studio')} className="h-14 px-8 rounded-xl font-black uppercase text-[10px] border-2 flex-1 w-full"><RefreshCcw className="mr-2 size-4" /> Back to Studio</Button>
                                <Button 
                                    size="lg" 
                                    className="relative flex items-center justify-between gap-0 p-0 overflow-hidden bg-[#00aeef] hover:bg-[#009bd1] text-white font-black rounded-xl transition-all duration-300 group h-14 md:h-16 shadow-[0_8px_20px_-10px_rgba(0,174,239,0.5)] hover:shadow-[0_12px_25px_-10px_rgba(0,174,239,0.6)] hover:-translate-y-1 active:scale-95 border-none flex-[2] w-full" 
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = resultUrl!;
                                        link.download = `GR7-Joined-${audioFile?.name || 'result'}.wav`;
                                        link.click();
                                    }}
                                >
                                    <div className="absolute left-4 w-0.5 h-6 md:h-8 bg-white/40 rounded-full" />
                                    <span className="flex-1 px-10 text-center tracking-widest text-[11px] uppercase">SAVE JOINED FILE</span>
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
