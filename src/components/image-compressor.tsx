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
  ArrowLeftRight
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
import { ScrollArea } from "@/components/ui/scroll-area";
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

const QUICK_SIZES = ["20", "50", "100", "500"];

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
  const [targetSizeKb, setTargetSizeKb] = useState<string>("50");
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
                const targetBytes = parseInt(targetSizeKb, 10) * 1024;
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
    link.download = `optimized-${res.name.split('.')[0]}.${outputFormat}`;
    link.click();
  };

  const downloadAllAsZip = async () => {
    const zip = new JSZip();
    results.forEach(res => {
        if (res.newSize > 0) {
            const base64Data = res.dataUrl.split(",")[1];
            zip.file(`optimized-${res.name.split('.')[0]}.${outputFormat}`, base64Data, { base64: true });
        }
    });
    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = "optimized-batch.zip";
    link.click();
  };

  const removeFile = (id: string) => {
    setResults(prev => prev.filter(r => r.id !== id));
  };

  const allProcessed = results.length > 0 && results.every(r => r.newSize > 0);

  return (
    <div className="w-full max-w-7xl animate-in fade-in duration-500 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Workspace Area */}
        <div className="lg:col-span-7 space-y-6">
            <Card 
                className={cn(
                    "border-2 border-dashed transition-all duration-300 relative overflow-hidden bg-card/50",
                    "hover:-translate-y-1 hover:scale-[1.01] hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/10",
                    isDragOver && "border-primary bg-primary/5", 
                    results.length > 0 ? "p-3 md:p-4" : "p-6 md:p-24 text-center"
                )}
                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            >
                {results.length === 0 ? (
                    <div className="flex flex-col items-center gap-6 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="size-20 md:size-24 rounded-[2rem] md:rounded-[2.5rem] bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                            <UploadCloud className="size-10 md:size-12" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-xl md:text-2xl font-black uppercase tracking-tighter">Bulk Compression Workspace</p>
                            <p className="text-sm text-muted-foreground font-medium">
                                <span className="text-primary font-black">Drag and drop</span> or Click to upload photos
                            </p>
                            <p className="text-[10px] md:text-xs text-muted-foreground italic opacity-70">Up to 50 images at once. Private local processing.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-2">
                            <Badge variant="secondary" className="font-black text-[10px] px-3 py-1 rounded-full uppercase bg-primary/10 text-primary border-primary/20">
                                {results.length} Files Queued
                            </Badge>
                            <Button variant="ghost" size="sm" onClick={() => setResults([])} className="text-destructive font-black h-8 text-[10px] uppercase hover:bg-destructive/10">
                                <Trash2 className="size-3 mr-1.5"/> Clear All
                            </Button>
                        </div>
                        <ScrollArea className="h-[400px] md:h-[500px] pr-2 md:pr-4">
                            <div className="grid gap-3">
                                {results.map((res) => (
                                    <div key={res.id} className="flex items-center justify-between p-2 md:p-4 bg-white dark:bg-slate-900 rounded-2xl border-2 hover:border-primary/40 transition-all group shadow-sm">
                                        <div className="flex items-center gap-3 md:gap-4 truncate">
                                            <div className="size-12 md:size-16 rounded-xl overflow-hidden bg-muted border-2 shrink-0 relative shadow-sm">
                                                <Image src={res.originalDataUrl} alt="prev" fill className="object-cover" />
                                            </div>
                                            <div className="truncate">
                                                <p className="text-[10px] md:text-xs font-black truncate max-w-[80px] md:max-w-[200px] uppercase tracking-tight">{res.name}</p>
                                                <div className="flex flex-wrap items-center gap-1.5 mt-0.5 md:mt-1">
                                                    <span className="text-[8px] md:text-[10px] text-muted-foreground font-mono">{formatBytes(res.originalSize)}</span>
                                                    {res.newSize > 0 && (
                                                        <>
                                                            <span className="text-muted-foreground scale-75">→</span>
                                                            <span className="text-[8px] md:text-[10px] font-black text-green-600 font-mono">{formatBytes(res.newSize)}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 md:gap-2 shrink-0">
                                            {res.isProcessing ? (
                                                <Loader2 className="size-4 md:size-5 animate-spin text-primary" />
                                            ) : res.newSize > 0 ? (
                                                <div className="flex items-center gap-1 md:gap-2">
                                                    <Badge className="bg-green-500 hover:bg-green-500 text-white text-[7px] md:text-[9px] font-black">-{res.savings.toFixed(0)}%</Badge>
                                                    
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button size="icon" variant="outline" className="size-7 md:size-9 rounded-lg md:rounded-xl border-2 hover:bg-primary/5">
                                                                <Eye className="size-3.5 md:size-4 text-primary" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-4 md:p-6">
                                                            <DialogHeader>
                                                                <DialogTitle className="flex items-center gap-2 uppercase font-black tracking-tighter text-sm md:text-lg">
                                                                    <ArrowLeftRight className="text-primary size-4 md:size-5" /> Quality Check
                                                                </DialogTitle>
                                                            </DialogHeader>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 py-4">
                                                                <div className="space-y-2 md:space-y-3">
                                                                    <div className="flex justify-between items-center bg-muted/30 p-2 rounded-lg">
                                                                        <span className="text-[8px] md:text-[10px] font-black uppercase text-muted-foreground">ORIGINAL</span>
                                                                        <Badge variant="outline" className="font-mono text-[9px]">{formatBytes(res.originalSize)}</Badge>
                                                                    </div>
                                                                    <div className="aspect-square relative rounded-xl overflow-hidden border-2 bg-white flex items-center justify-center">
                                                                        <Image src={res.originalDataUrl} alt="original" fill className="object-contain p-2" />
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-2 md:space-y-3">
                                                                    <div className="flex justify-between items-center bg-green-500/10 p-2 rounded-lg">
                                                                        <Badge className="bg-green-500 text-white font-mono text-[9px]">OPTIMIZED</Badge>
                                                                        <span className="text-[8px] md:text-[10px] font-black uppercase text-green-700">{formatBytes(res.newSize)} (-{res.savings.toFixed(1)}%)</span>
                                                                    </div>
                                                                    <div className="aspect-square relative rounded-xl overflow-hidden border-2 border-green-500/20 bg-white flex items-center justify-center">
                                                                        <Image src={res.dataUrl} alt="optimized" fill className="object-contain p-2" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <CardFooter className="p-0 pt-2">
                                                                <Button className="w-full h-12 md:h-14 bg-green-600 hover:bg-green-700 font-black text-sm md:text-lg" onClick={() => downloadFile(res)}>
                                                                    DOWNLOAD IMAGE <Download className="ml-2 size-4 md:size-5" />
                                                                </Button>
                                                            </CardFooter>
                                                        </DialogContent>
                                                    </Dialog>

                                                    <Button size="icon" variant="outline" className="size-7 md:size-9 rounded-lg md:rounded-xl border-2 border-green-500/50 hover:bg-green-500/5" onClick={() => downloadFile(res)}>
                                                        <Download className="size-3.5 md:size-4 text-green-600" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Badge variant="outline" className="text-[7px] md:text-[9px] font-black uppercase opacity-40">Ready</Badge>
                                            )}
                                            <Button variant="ghost" size="icon" className="size-6 md:size-8 rounded-full text-muted-foreground hover:text-destructive" onClick={() => removeFile(res.id)}>
                                                <X className="size-3.5 md:size-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                        <Button variant="outline" className="w-full border-2 border-dashed h-12 md:h-14 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase text-primary border-primary/20 hover:bg-primary/5" onClick={() => fileInputRef.current?.click()}>
                            <Layers className="size-4 mr-2" /> ADD MORE FILES
                        </Button>
                    </div>
                )}
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" multiple onChange={onFileChange} />
            </Card>

            {allProcessed && results.length > 1 && (
                <Card className="bg-green-500/5 border-2 border-dashed border-green-500/30 rounded-2xl md:rounded-[2rem] animate-in zoom-in-95 duration-500">
                    <CardContent className="p-4 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 md:gap-8">
                        <div className="flex items-center gap-3 md:gap-5 text-center sm:text-left">
                            <div className="size-12 md:size-16 rounded-full bg-green-500 text-white flex items-center justify-center shadow-xl shadow-green-500/30 shrink-0 mx-auto sm:mx-0">
                                <CheckCircle2 className="size-6 md:size-8" />
                            </div>
                            <div>
                                <p className="text-base md:text-lg font-black uppercase tracking-tighter text-green-800">Batch Complete!</p>
                                <p className="text-[10px] md:text-xs text-green-700 font-medium">Download everything in one ZIP archive.</p>
                            </div>
                        </div>
                        <Button size="lg" className="w-full sm:w-auto h-14 md:h-16 px-6 md:px-10 bg-green-600 hover:bg-green-700 font-black text-sm md:text-lg shadow-2xl rounded-xl md:rounded-2xl transition-all active:scale-95" onClick={downloadAllAsZip}>
                            <Download className="mr-2 md:mr-3 size-5 md:size-6" /> DOWNLOAD ZIP
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>

        {/* Right: Settings & Optimizer Suite */}
        <div className="lg:col-span-5 space-y-6">
            <Card className="border-2 shadow-2xl border-primary/10 overflow-hidden sticky top-24 rounded-2xl md:rounded-[2rem] bg-white dark:bg-slate-950">
                <CardHeader className="bg-primary/5 border-b p-4 md:p-6">
                    <CardTitle className="text-lg md:text-xl flex items-center gap-3 font-black uppercase tracking-tighter">
                        <Settings2 className="size-5 md:size-6 text-primary" /> Optimizer Panel
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-8 space-y-6 md:space-y-8">
                    <Tabs value={compressionMode} onValueChange={(v) => setCompressionMode(v as CompressionMode)} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 h-12 md:h-14 p-1 md:p-1.5 bg-muted/50 rounded-xl md:rounded-2xl border-2">
                            <TabsTrigger value="target" className="font-black text-[9px] md:text-[10px] uppercase rounded-lg md:rounded-xl">
                                <Target className="size-3 mr-1.5 md:mr-2" /> Target Size
                            </TabsTrigger>
                            <TabsTrigger value="manual" className="font-black text-[9px] md:text-[10px] uppercase rounded-lg md:rounded-xl">
                                <Settings2 className="size-3 mr-1.5 md:mr-2" /> Quality %
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="target" className="pt-4 md:pt-8 space-y-4 md:space-y-6 animate-in fade-in duration-500">
                             <div className="space-y-4">
                                <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    Target KB per image
                                </Label>
                                <div className="grid grid-cols-4 gap-1.5 md:gap-2 mb-2">
                                    {QUICK_SIZES.map((size) => (
                                        <Button
                                            key={size}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setTargetSizeKb(size)}
                                            className={cn(
                                                "rounded-lg md:rounded-xl font-black text-[9px] md:text-[10px] uppercase h-8 md:h-9 transition-all border-2",
                                                targetSizeKb === size ? "bg-primary text-white border-primary shadow-lg" : "hover:border-primary/50"
                                            )}
                                        >
                                            {size}K
                                        </Button>
                                    ))}
                                </div>
                                <div className="relative group">
                                    <Input 
                                        type="number" 
                                        value={targetSizeKb} 
                                        onChange={(e) => setTargetSizeKb(e.target.value)} 
                                        className="h-12 md:h-16 text-2xl md:text-3xl font-black focus-visible:ring-primary border-2 rounded-xl md:rounded-2xl pl-6 md:pl-8 pr-16 md:pr-20 bg-muted/10"
                                    />
                                    <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 font-black text-base md:text-xl text-primary/40 tracking-tighter uppercase">KB</div>
                                </div>
                                <div className="p-3 md:p-4 bg-primary/5 rounded-xl md:rounded-2xl border-2 border-primary/10">
                                    <p className="text-[9px] md:text-[10px] text-primary/80 font-bold leading-relaxed">
                                        <span className="font-black uppercase mr-1">Pro Engine:</span> Adaptive scaling active to prevent pixelation at small sizes.
                                    </p>
                                </div>
                             </div>
                        </TabsContent>

                        <TabsContent value="manual" className="pt-4 md:pt-8 space-y-6 md:space-y-8 animate-in fade-in duration-500">
                            <div className="space-y-4 md:space-y-6">
                                <div className="flex justify-between items-center">
                                    <Label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground">Quality</Label>
                                    <Badge className="font-mono font-black text-sm md:text-base px-3 md:px-4 py-0.5 md:py-1 bg-primary text-white rounded-lg shadow-md">{quality[0]}%</Badge>
                                </div>
                                <Slider min={5} max={100} step={1} value={quality} onValueChange={setQuality} className="py-2 md:py-4" />
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="space-y-3 md:space-y-4 pt-4 border-t-2 border-dashed">
                        <Label className="text-[9px] md:text-[10px] font-black uppercase text-muted-foreground tracking-widest">Output Format</Label>
                        <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as OutputFormat)}>
                            <SelectTrigger className="h-12 md:h-14 font-black text-xs md:text-sm border-2 rounded-xl md:rounded-2xl bg-background"><SelectValue /></SelectTrigger>
                            <SelectContent className="rounded-xl border-2">
                                <SelectItem value="jpeg" className="font-bold py-2 md:py-3">JPEG (Best for Photos)</SelectItem>
                                <SelectItem value="webp" className="font-bold py-2 md:py-3">WEBP (Next-Gen)</SelectItem>
                                <SelectItem value="png" className="font-bold py-2 md:py-3">PNG (High Clarity)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/10 p-4 md:p-8 border-t-2">
                    <Button 
                        className="w-full h-14 md:h-18 text-lg md:text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-xl md:rounded-2xl transition-all active:scale-95 disabled:opacity-50" 
                        disabled={results.length === 0 || isBulkProcessing}
                        onClick={startBulkCompression}
                    >
                        {isBulkProcessing ? (
                            <div className="flex items-center gap-2 md:gap-3">
                                <Loader2 className="size-5 md:size-7 animate-spin" />
                                <span className="uppercase text-sm md:text-base">OPTIMIZING...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 md:gap-3">
                                <Zap className="size-5 md:size-7 text-yellow-400 fill-yellow-400" />
                                <span className="uppercase text-sm md:text-base tracking-tighter">PROCESS QUEUE</span>
                            </div>
                        )}
                    </Button>
                </CardFooter>
            </Card>

            {/* Privacy Promise */}
            <div className="p-4 md:p-6 bg-green-500/5 rounded-xl md:rounded-[2rem] border-2 border-green-500/10 flex gap-3 md:gap-4 items-center shadow-sm">
                <div className="size-10 md:size-12 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="size-5 md:size-6 text-green-600" />
                </div>
                <div>
                    <p className="text-[10px] md:text-[11px] font-black text-green-700 uppercase tracking-tight">Security Lock Active</p>
                    <p className="text-[8px] md:text-[10px] text-green-600/80 font-medium leading-tight">Processing happens locally in RAM. No cloud storage.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
