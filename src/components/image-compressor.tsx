"use client";

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect } from "react";
import Image from "next/image";
import JSZip from "jszip";
import {
  UploadCloud,
  Loader2,
  Download,
  X,
  FileImage,
  Settings2,
  Target,
  CheckCircle2,
  Trash2,
  FileOutput,
  Layers,
  Sparkles,
  ShieldCheck,
  Zap,
  Eye,
  ArrowLeftRight,
  Plus,
  ChevronRight,
  RefreshCcw
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type CompressionResult = {
  id: string;
  name: string;
  originalSize: number;
  newSize: number;
  savings: number;
  dataUrl: string;
  originalDataUrl: string;
  isProcessing: boolean;
};

type OutputFormat = 'jpeg' | 'png' | 'webp';
type CompressionMode = 'manual' | 'target';
type TargetUnit = 'kb' | 'mb';

const QUICK_SIZES = ["20", "50", "100", "500"];

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

export default function ImageCompressor() {
  const { toast } = useToast();
  const [results, setResults] = useState<CompressionResult[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [compressionMode, setCompressionMode] = useState<CompressionMode>('target');
  const [targetSizeValue, setTargetSizeValue] = useState<string>("50");
  const [targetUnit, setTargetUnit] = useState<TargetUnit>('kb');
  const [quality, setQuality] = useState<number[]>([75]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('jpeg');
  const [isDragOver, setIsDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).filter(f => f.type.startsWith("image/"));
    
    const newResults: CompressionResult[] = newFiles.map(f => {
        const url = URL.createObjectURL(f);
        return {
            id: Math.random().toString(36).substr(2, 9),
            name: f.name,
            originalSize: f.size,
            newSize: 0,
            savings: 0,
            dataUrl: url, 
            originalDataUrl: url,
            isProcessing: false
        };
    });

    setResults(prev => [...prev, ...newResults]);
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFiles(e.target.files);
  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFiles(e.dataTransfer.files); };

  const compressSingleFile = async (item: CompressionResult): Promise<CompressionResult> => {
    return new Promise((resolve) => {
        const img = new window.Image();
        img.src = item.originalDataUrl;
        img.onload = async () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            if (!ctx) return resolve(item);

            const mimeType = `image/${outputFormat}`;
            let finalUrl = "";
            let finalSize = 0;

            const renderToCanvas = (q: number, scale = 1.0) => {
                const tw = img.width * scale;
                const th = img.height * scale;
                canvas.width = tw;
                canvas.height = th;
                
                ctx.clearRect(0, 0, tw, th);
                if (outputFormat === 'jpeg') {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, tw, th);
                }
                ctx.drawImage(img, 0, 0, tw, th);
                return canvas.toDataURL(mimeType, q);
            };

            if (compressionMode === 'manual') {
                finalUrl = renderToCanvas(quality[0] / 100, 1.0);
                const blob = await (await fetch(finalUrl)).blob();
                finalSize = blob.size;
            } else {
                const multiplier = targetUnit === 'mb' ? 1024 * 1024 : 1024;
                const targetBytes = parseFloat(targetSizeValue) * multiplier;
                
                let currentScale = 1.0;
                let bestUrl = "";
                let bestSize = 0;

                const scalesToTry = [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1];
                
                for (const scale of scalesToTry) {
                    let low = 0.2, high = 0.95; 
                    let stepBestUrl = "";
                    let stepBestSize = 0;

                    for (let i = 0; i < 6; i++) {
                        const mid = (low + high) / 2;
                        const testUrl = renderToCanvas(mid, scale);
                        const testBlob = await (await fetch(testUrl)).blob();
                        
                        if (testBlob.size <= targetBytes) {
                            stepBestUrl = testUrl;
                            stepBestSize = testBlob.size;
                            low = mid; 
                        } else {
                            high = mid; 
                        }
                    }

                    if (stepBestUrl) {
                        bestUrl = stepBestUrl;
                        bestSize = stepBestSize;
                        break; 
                    }
                }
                
                if (!bestUrl) {
                   bestUrl = renderToCanvas(0.1, 0.1); 
                   const fb = await (await fetch(bestUrl)).blob();
                   bestSize = fb.size;
                }
                
                finalUrl = bestUrl;
                finalSize = bestSize;
            }

            resolve({
                ...item,
                newSize: finalSize,
                savings: ((item.originalSize - finalSize) / item.originalSize) * 100,
                dataUrl: finalUrl,
                isProcessing: false
            });
        };
    });
  };

  const startBulkCompression = async () => {
    setIsBulkProcessing(true);
    const pending = results.filter(r => r.newSize === 0);
    
    for (const item of pending) {
        setResults(prev => prev.map(r => r.id === item.id ? { ...r, isProcessing: true } : r));
        const res = await compressSingleFile(item);
        setResults(prev => prev.map(r => r.id === item.id ? res : r));
    }

    setIsBulkProcessing(false);
    toast({ title: "Batch Complete!", description: "All images optimized with smart-adaptive scaling." });
  };

  const downloadFile = (res: CompressionResult) => {
    const link = document.createElement("a");
    link.href = res.dataUrl;
    const ext = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
    const baseName = res.name.includes('.') ? res.name.split('.').slice(0, -1).join('.') : res.name;
    link.download = `GR7-Tools-${baseName}.${ext}`;
    link.click();
  };

  const downloadAllAsZip = async () => {
    const zip = new JSZip();
    const ext = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
    results.forEach(res => {
        if (res.newSize > 0) {
            const base64Data = res.dataUrl.split(",")[1];
            const baseName = res.name.includes('.') ? res.name.split('.').slice(0, -1).join('.') : res.name;
            zip.file(`GR7-Tools-${baseName}.${ext}`, base64Data, { base64: true });
        }
    });
    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = "GR7-Tools-optimized-batch.zip";
    link.click();
  };

  const removeFile = (id: string) => {
    setResults(prev => prev.filter(r => r.id !== id));
  };

  const handleReset = () => {
    setResults([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const allProcessed = results.length > 0 && results.every(r => r.newSize > 0);

  return (
    <div className="w-full max-w-7xl animate-in fade-in duration-500 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Workspace Area */}
        <div className="lg:col-span-7 space-y-4">
            <Card 
                className={cn(
                    "glass-card overflow-hidden transition-all duration-300 border-2 border-dashed shadow-2xl rounded-[2.5rem] hover:border-primary/50 select-none",
                    isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.01]"
                )}
                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            >
                <CardHeader className="bg-muted/30 border-b p-6 text-center">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">STUDIO WORKSPACE</CardTitle>
                        {results.length > 0 && <Badge className="bg-primary text-white font-black text-[10px] uppercase px-3 py-1 rounded-full">{results.length} IMAGES</Badge>}
                    </div>
                </CardHeader>
                <CardContent className={cn(results.length === 0 ? "p-10 md:p-12" : "p-4 md:p-6")}>
                    {results.length === 0 ? (
                        <div 
                            className="border-4 border-dashed border-muted-foreground/20 rounded-[2rem] p-12 md:p-16 flex flex-col items-center justify-center space-y-6 bg-muted/30 group cursor-pointer hover:bg-muted/40 transition-all"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="relative">
                                <UploadCloud className="size-16 md:size-20 text-muted-foreground group-hover:text-primary transition-colors" />
                                <Zap className="absolute -top-1 -right-1 size-5 md:size-8 text-yellow-500 animate-pulse" />
                            </div>
                            <div className="text-center">
                                <p className="text-xl md:text-2xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Drop Images to Optimize</p>
                                <p className="text-[10px] md:text-sm text-muted-foreground mt-2 font-bold opacity-60 uppercase tracking-widest">Adaptive scaling & batching active.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-1">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Optimization Stack</p>
                                <Button variant="ghost" size="sm" onClick={() => setResults([])} className="btn-uiverse-secondary h-7">
                                    <Trash2 className="size-3 mr-1"/> Clear All
                                </Button>
                            </div>
                            <ScrollArea className="h-[300px] md:h-[450px] pr-2 custom-scrollbar">
                                <div className="grid gap-2">
                                    {results.map((res) => (
                                        <div key={res.id} className="flex items-center justify-between p-3 rounded-2xl border-2 border-transparent bg-white dark:bg-slate-900 hover:border-primary/40 transition-all group shadow-md animate-in slide-in-from-bottom-2">
                                            <div className="flex items-center gap-4 truncate">
                                                <div className="size-12 rounded-xl overflow-hidden bg-muted border shrink-0 relative shadow-inner">
                                                    <Image src={res.originalDataUrl} alt="prev" fill className="object-cover" />
                                                </div>
                                                <div className="truncate text-left">
                                                    <p className="text-xs md:text-sm font-black truncate max-w-[150px] md:max-w-[300px] uppercase tracking-tight" title={res.name}>{res.name}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[8px] md:text-[9px] text-muted-foreground font-mono">{formatBytes(res.originalSize)}</span>
                                                        {res.newSize > 0 && (
                                                            <>
                                                                <span className="text-muted-foreground text-[10px]">→</span>
                                                                <span className="text-[8px] md:text-[9px] font-black text-green-600 font-mono">{formatBytes(res.newSize)}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                {res.isProcessing ? (
                                                    <Loader2 className="size-4 md:size-5 animate-spin text-primary" />
                                                ) : res.newSize > 0 ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <Badge className="bg-green-500 text-white text-[8px] font-black">-{res.savings.toFixed(0)}%</Badge>
                                                        
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button size="icon" variant="outline" className="size-8 rounded-lg border-2 hover:bg-primary/5">
                                                                    <Eye className="size-4 text-primary" />
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="max-w-4xl max-h-[90vh] top-[55%] overflow-hidden p-0 rounded-[2.5rem] border-none shadow-3xl bg-white dark:bg-slate-950 flex flex-col">
                                                                <DialogHeader className="p-6 md:p-8 border-b bg-muted/30">
                                                                    <DialogTitle className="flex items-center gap-2 uppercase font-black tracking-tighter text-sm md:text-lg">
                                                                        <ArrowLeftRight className="text-primary size-5" /> Precision Analysis
                                                                    </DialogTitle>
                                                                </DialogHeader>
                                                                <ScrollArea className="flex-1 w-full">
                                                                    <div className="p-6 md:p-10 space-y-8">
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                                                                            <div className="space-y-3">
                                                                                <div className="flex justify-between items-center bg-muted/30 p-2 rounded-xl">
                                                                                    <span className="text-[10px] font-black uppercase text-muted-foreground">Original</span>
                                                                                    <Badge variant="outline" className="font-mono text-[10px]">{formatBytes(res.originalSize)}</Badge>
                                                                                </div>
                                                                                <div className="aspect-square relative rounded-2xl overflow-hidden border-2 bg-white flex items-center justify-center shadow-inner">
                                                                                    <Image src={res.originalDataUrl} alt="original" fill className="object-contain p-4" />
                                                                                </div>
                                                                            </div>
                                                                            <div className="space-y-3">
                                                                                <div className="flex justify-between items-center bg-green-500/10 p-2 rounded-xl">
                                                                                    <Badge className="bg-green-500 text-white font-mono text-[10px]">Optimized</Badge>
                                                                                    <span className="text-[10px] font-black uppercase text-green-700">{formatBytes(res.newSize)}</span>
                                                                                </div>
                                                                                <div className="aspect-square relative rounded-2xl overflow-hidden border-2 border-green-500/20 bg-white flex items-center justify-center shadow-2xl">
                                                                                    <Image src={res.dataUrl} alt="optimized" fill className="object-contain p-4" />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <ScrollBar />
                                                                </ScrollArea>
                                                                <div className="p-6 md:p-8 border-t bg-muted/10 mt-auto">
                                                                    <Button 
                                                                        className="magic-button magic-button-success w-full h-14 md:h-16 bg-green-600 hover:bg-transparent border-4 border-green-600 text-white hover:text-green-600 font-black rounded-full transition-all active:scale-95 group flex items-center justify-center gap-3" 
                                                                        onClick={() => downloadFile(res)}
                                                                    >
                                                                        <StarIcons />
                                                                        <Download className="size-7 md:size-8 group-hover:translate-y-1 transition-transform" />
                                                                        <span className="uppercase tracking-tighter text-base md:text-lg">DOWNLOAD OPTIMIZED</span>
                                                                    </Button>
                                                                </div>
                                                            </DialogContent>
                                                        </Dialog>

                                                        <Button size="icon" variant="outline" className="size-8 rounded-lg border-2 border-green-500/50 hover:bg-green-500/5" onClick={() => downloadFile(res)}>
                                                            <Download className="size-4 text-green-600" />
                                                        </Button>
                                                    </div>
                                                ) : null}
                                                <Button variant="ghost" size="icon" className="size-8 rounded-full text-muted-foreground hover:text-destructive" onClick={() => removeFile(res.id)}>
                                                    <X className="size-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    <Button variant="outline" className="w-full border-2 border-dashed h-12 rounded-xl mt-4 font-black text-[10px] uppercase text-primary border-primary/20 hover:bg-primary/5 transition-all group" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                                        <Plus className="size-4 mr-2 group-hover:scale-125 transition-transform" /> ADD MORE IMAGES
                                    </Button>
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="justify-center gap-6 text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 bg-muted/10 pt-6 px-4 shrink-0">
                    <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-600" /> SECURE RAM</div>
                    <div className="flex items-center gap-1.5"><Sparkles className="size-3 text-primary" /> ADAPTIVE SCALE</div>
                    <div className="flex items-center gap-1.5"><Layers className="size-3 text-purple-500" /> BATCH READY</div>
                </CardFooter>
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" multiple onChange={onFileChange} />
            </Card>

            {allProcessed && results.length > 1 && (
                <Card className="bg-green-500/5 border-2 border-dashed border-green-500/30 rounded-[2.5rem] animate-in zoom-in-95 duration-500 shadow-xl hover:-translate-y-1 transition-all overflow-hidden">
                    <CardContent className="p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                            <div className="size-16 md:size-20 rounded-3xl bg-green-500 text-white flex items-center justify-center shadow-2xl relative shrink-0 overflow-hidden">
                                <CheckCircle2 className="size-10 md:size-12 z-10" />
                                <Sparkles className="absolute -top-1 -right-1 text-yellow-300 size-8 opacity-40" />
                            </div>
                            <div className="text-left">
                                <p className="text-2xl md:text-3xl font-black text-green-900 uppercase tracking-tighter leading-none">Complete!</p>
                                <p className="text-[10px] md:text-xs text-green-700 font-bold mt-2 uppercase tracking-widest opacity-60">Archive bundle ready for download</p>
                            </div>
                        </div>
                        <Button 
                            size="lg" 
                            className="magic-button magic-button-success w-full md:w-auto h-14 md:h-16 px-10 bg-green-600 hover:bg-transparent border-4 border-green-600 text-white hover:text-green-600 font-black rounded-full transition-all active:scale-95 group flex items-center justify-center gap-3" 
                            onClick={downloadAllAsZip}
                        >
                            <StarIcons />
                            <Download className="size-7 md:size-8 group-hover:translate-y-1 transition-transform" />
                            <span className="uppercase tracking-tighter text-base md:text-lg">DOWNLOAD ZIP BUNDLE</span>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>

        {/* Right: Settings Area */}
        <div className="lg:col-span-5 space-y-4">
            <Card className="border-2 shadow-xl border-primary/10 overflow-hidden sticky top-24 rounded-[2.5rem] bg-white dark:bg-slate-950 transition-all hover:border-primary/30">
                <CardHeader className="bg-primary/5 border-b p-5 md:p-8">
                    <CardTitle className="text-lg md:text-xl flex items-center gap-3 font-black uppercase tracking-tighter">
                        <Settings2 className="size-6 text-primary" /> Optimizer Settings
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 space-y-4">
                    <Tabs value={compressionMode} onValueChange={(v) => setCompressionMode(v as CompressionMode)} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-2 h-10 p-1 bg-muted rounded-xl border-2">
                            <TabsTrigger value="target" className="font-black text-[10px] uppercase rounded-xl transition-all">
                                <Target className="h-4 w-4 mr-2" /> Target Size
                            </TabsTrigger>
                            <TabsTrigger value="manual" className="font-black text-[10px] uppercase rounded-xl transition-all">
                                <Settings2 className="h-4 w-4 mr-2" /> Quality Mode
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="target" className="space-y-4 animate-in fade-in duration-500">
                             <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-1">
                                        <Zap className="size-3 text-yellow-500" /> Government Form Presets
                                    </Label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {QUICK_SIZES.map((size) => (
                                            <button
                                                key={size}
                                                onClick={() => {
                                                    setTargetSizeValue(size);
                                                    setTargetUnit('kb');
                                                }}
                                                className={cn(
                                                    "btn-pos-uiverse h-10",
                                                    targetSizeValue === size && targetUnit === 'kb' && "active-uiverse"
                                                )}
                                                data-label={`${size}K`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2 pt-2 border-t border-dashed">
                                    <Label htmlFor="target-val" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Custom Limit</Label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 group">
                                            <Input 
                                                id="target-val" 
                                                type="number" 
                                                value={targetSizeValue} 
                                                onChange={(e) => setTargetSizeValue(e.target.value)} 
                                                className="h-10 text-xl font-black focus-visible:ring-primary border-2 rounded-xl bg-background px-4"
                                            />
                                        </div>
                                        <Select value={targetUnit} onValueChange={(v) => setTargetUnit(v as TargetUnit)}>
                                            <SelectTrigger className="w-24 h-10 font-black text-base border-2 rounded-xl shadow-sm">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-2 shadow-2xl">
                                                <SelectItem value="kb" className="font-black py-3">KB</SelectItem>
                                                <SelectItem value="mb" className="font-black py-3">MB</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                             </div>
                        </TabsContent>

                        <TabsContent value="manual" className="space-y-4 animate-in fade-in duration-500">
                            <div className="space-y-6 py-2">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center px-1">
                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Compression Strength</Label>
                                        <Badge className="font-mono font-black text-base px-4 py-1 bg-primary text-white rounded-xl shadow-lg">{quality[0]}%</Badge>
                                    </div>
                                    <Slider min={5} max={100} step={1} value={quality} onValueChange={setQuality} className="py-2" />
                                    <div className="flex justify-between text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                                        <span>Max Shrink</span>
                                        <span>Best Quality</span>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="space-y-2 pt-4 border-t border-dashed border-primary/10">
                        <Label htmlFor="format" className="text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-60">Target Format</Label>
                        <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as OutputFormat)}>
                            <SelectTrigger id="format" className="h-10 font-black text-xs border-2 rounded-xl bg-background"><SelectValue /></SelectTrigger>
                            <SelectContent className="rounded-xl border-2 shadow-2xl">
                                <SelectItem value="jpeg" className="font-bold py-2">JPEG (Universal - Smallest)</SelectItem>
                                <SelectItem value="webp" className="font-bold py-2">WEBP (Modern - HD)</SelectItem>
                                <SelectItem value="png" className="font-bold py-2">PNG (Lossless - Clean)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="p-3 md:p-4 bg-green-500/5 rounded-xl md:rounded-2xl border-2 border-green-500/10 flex gap-3 items-center shadow-sm">
                        <div className="size-8 md:size-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                            <ShieldCheck className="size-4 md:size-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-[9px] md:text-[10px] font-black text-green-700 uppercase tracking-tight">100% Secure Local RAM</p>
                            <p className="text-[7px] md:text-[8px] text-muted-foreground font-medium leading-tight">Your photos never touch any server. All processing is local.</p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/10 p-6 md:p-8 border-t border-dashed gap-3 flex flex-col">
                    <Button 
                        className="magic-button w-full h-16 md:h-18 rounded-full bg-primary hover:bg-transparent border-4 border-primary text-white hover:text-primary transition-all active:scale-95 disabled:opacity-50 group px-10 flex items-center gap-4" 
                        disabled={results.length === 0 || isBulkProcessing}
                        onClick={startBulkCompression}
                    >
                        <StarIcons />
                        {isBulkProcessing ? (
                            <div className="flex items-center justify-center w-full gap-3">
                                <Loader2 className="size-7 md:size-8 animate-spin" />
                                <span className="uppercase font-black text-base md:text-lg tracking-tighter">PROCESSING...</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center w-full gap-3">
                                <Zap className="size-7 md:size-8 text-yellow-400 fill-yellow-400 group-hover:scale-125 transition-transform" />
                                <span className="uppercase font-black text-base md:text-lg tracking-tighter">OPTIMIZE NOW</span>
                            </div>
                        )}
                    </Button>
                    {results.length > 0 && (
                        <Button variant="outline" onClick={handleReset} className="btn-uiverse-secondary w-full h-11">
                            <RefreshCcw className="mr-2 h-4 w-4" /> Start Over
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  );
}
