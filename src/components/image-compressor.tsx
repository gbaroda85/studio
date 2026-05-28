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
type TargetUnit = 'kb' | 'mb';

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
        <div className="lg:col-span-7 space-y-4">
            <Card 
                className={cn(
                    "border-2 border-dashed transition-all duration-300 relative overflow-hidden bg-card/50",
                    "hover:border-primary/80 hover:shadow-xl hover:shadow-primary/5",
                    isDragOver && "border-primary bg-primary/5", 
                    results.length > 0 ? "p-2 md:p-3" : "p-4 md:p-8 text-center"
                )}
                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            >
                {results.length === 0 ? (
                    <div className="flex flex-col items-center gap-4 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="size-12 md:size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <UploadCloud className="size-6 md:size-8" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-lg md:text-xl font-black uppercase tracking-tighter">Bulk Compression</p>
                            <p className="text-xs text-muted-foreground font-medium">
                                <span className="text-primary font-black">Drop images</span> or Click to upload
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-2">
                            <Badge variant="secondary" className="font-black text-[9px] px-2 py-0.5 rounded-full uppercase bg-primary/10 text-primary border-primary/20">
                                {results.length} Files
                            </Badge>
                            <Button variant="ghost" size="sm" onClick={() => setResults([])} className="text-destructive font-black h-7 text-[9px] uppercase">
                                <Trash2 className="size-3 mr-1"/> Clear
                            </Button>
                        </div>
                        <ScrollArea className="h-[250px] md:h-[300px] pr-2">
                            <div className="grid gap-2">
                                {results.map((res) => (
                                    <div key={res.id} className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded-xl border-2 hover:border-primary/40 transition-all shadow-sm">
                                        <div className="flex items-center gap-3 truncate">
                                            <div className="size-10 md:size-12 rounded-lg overflow-hidden bg-muted border shrink-0 relative">
                                                <Image src={res.originalDataUrl} alt="prev" fill className="object-cover" />
                                            </div>
                                            <div className="truncate">
                                                <p className="text-[9px] md:text-[10px] font-black truncate max-w-[80px] md:max-w-[200px] uppercase">{res.name}</p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="text-[7px] md:text-[8px] text-muted-foreground font-mono">{formatBytes(res.originalSize)}</span>
                                                    {res.newSize > 0 && (
                                                        <>
                                                            <span className="text-muted-foreground">→</span>
                                                            <span className="text-[7px] md:text-[8px] font-black text-green-600 font-mono">{formatBytes(res.newSize)}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 md:gap-2 shrink-0">
                                            {res.isProcessing ? (
                                                <Loader2 className="size-3 md:size-4 animate-spin text-primary" />
                                            ) : res.newSize > 0 ? (
                                                <div className="flex items-center gap-1">
                                                    <Badge className="bg-green-500 text-white text-[6px] md:text-[8px] font-black">-{res.savings.toFixed(0)}%</Badge>
                                                    
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button size="icon" variant="outline" className="size-6 md:size-8 rounded-lg border hover:bg-primary/5">
                                                                <Eye className="size-3 md:size-3.5 text-primary" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4">
                                                            <DialogHeader>
                                                                <DialogTitle className="flex items-center gap-2 uppercase font-black tracking-tighter text-sm">
                                                                    <ArrowLeftRight className="text-primary size-4" /> Quality Check
                                                                </DialogTitle>
                                                            </DialogHeader>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
                                                                <div className="space-y-2">
                                                                    <div className="flex justify-between items-center bg-muted/30 p-1.5 rounded-lg">
                                                                        <span className="text-[8px] font-black uppercase text-muted-foreground">ORIGINAL</span>
                                                                        <Badge variant="outline" className="font-mono text-[8px]">{formatBytes(res.originalSize)}</Badge>
                                                                    </div>
                                                                    <div className="aspect-square relative rounded-lg overflow-hidden border bg-white flex items-center justify-center">
                                                                        <Image src={res.originalDataUrl} alt="original" fill className="object-contain p-1" />
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <div className="flex justify-between items-center bg-green-500/10 p-1.5 rounded-lg">
                                                                        <Badge className="bg-green-500 text-white font-mono text-[8px]">OPTIMIZED</Badge>
                                                                        <span className="text-[8px] font-black uppercase text-green-700">{formatBytes(res.newSize)}</span>
                                                                    </div>
                                                                    <div className="aspect-square relative rounded-lg overflow-hidden border-green-500/20 bg-white flex items-center justify-center">
                                                                        <Image src={res.dataUrl} alt="optimized" fill className="object-contain p-1" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <CardFooter className="p-0 pt-2">
                                                                <Button className="w-full h-10 bg-green-600 hover:bg-green-700 font-black text-xs" onClick={() => downloadFile(res)}>
                                                                    DOWNLOAD <Download className="ml-2 size-3" />
                                                                </Button>
                                                            </CardFooter>
                                                        </DialogContent>
                                                    </Dialog>

                                                    <Button size="icon" variant="outline" className="size-6 md:size-8 rounded-lg border border-green-500/50 hover:bg-green-500/5" onClick={() => downloadFile(res)}>
                                                        <Download className="size-3 md:size-3.5 text-green-600" />
                                                    </Button>
                                                </div>
                                            ) : null}
                                            <Button variant="ghost" size="icon" className="size-6 rounded-full text-muted-foreground hover:text-destructive" onClick={() => removeFile(res.id)}>
                                                <X className="size-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                        <Button variant="outline" className="w-full border-dashed h-10 rounded-xl font-black text-[9px] uppercase text-primary border-primary/20 hover:bg-primary/5" onClick={() => fileInputRef.current?.click()}>
                            <Layers className="size-3 mr-2" /> ADD IMAGES
                        </Button>
                    </div>
                )}
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" multiple onChange={onFileChange} />
            </Card>

            {allProcessed && results.length > 1 && (
                <Card className="bg-green-500/5 border-2 border-dashed border-green-500/30 rounded-xl animate-in zoom-in-95 duration-500">
                    <CardContent className="p-3 md:p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0">
                                <CheckCircle2 className="size-5" />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-tighter text-green-800">Complete</p>
                                <p className="text-[8px] text-green-700 font-medium">ZIP Download ready.</p>
                            </div>
                        </div>
                        <Button size="sm" className="h-10 px-6 bg-green-600 hover:bg-green-700 font-black text-xs rounded-xl shadow-lg" onClick={downloadAllAsZip}>
                            <Download className="mr-2 size-4" /> DOWNLOAD ALL
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>

        {/* Right: Settings */}
        <div className="lg:col-span-5 space-y-4">
            <Card className="border-2 shadow-xl border-primary/10 overflow-hidden sticky top-24 rounded-2xl bg-white dark:bg-slate-950">
                <CardHeader className="bg-primary/5 border-b p-3 md:p-4">
                    <CardTitle className="text-sm flex items-center gap-2 font-black uppercase tracking-tighter">
                        <Settings2 className="size-4 text-primary" /> Settings
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 space-y-6">
                    <Tabs value={compressionMode} onValueChange={(v) => setCompressionMode(v as CompressionMode)} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 h-10 p-1 bg-muted rounded-xl border">
                            <TabsTrigger value="target" className="font-black text-[8px] md:text-[9px] uppercase rounded-lg">
                                <Target className="size-2.5 mr-1" /> Target Size
                            </TabsTrigger>
                            <TabsTrigger value="manual" className="font-black text-[8px] md:text-[9px] uppercase rounded-lg">
                                <Settings2 className="size-2.5 mr-1" /> Quality
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="target" className="pt-4 space-y-4 animate-in fade-in duration-500">
                             <div className="space-y-3">
                                <Label className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                    Target Size
                                </Label>
                                <div className="grid grid-cols-4 gap-1">
                                    {QUICK_SIZES.map((size) => (
                                        <Button
                                            key={size}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setTargetSizeValue(size)}
                                            className={cn(
                                                "rounded-lg font-black text-[8px] md:text-[9px] uppercase h-7 border",
                                                targetSizeValue === size ? "bg-primary text-white border-primary shadow-sm" : ""
                                            )}
                                        >
                                            {size}K
                                        </Button>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Input 
                                            type="number" 
                                            value={targetSizeValue} 
                                            onChange={(e) => setTargetSizeValue(e.target.value)} 
                                            className="h-10 text-xl font-black border-2 rounded-xl pl-4 bg-muted/5 w-full"
                                        />
                                    </div>
                                    <Select value={targetUnit} onValueChange={(v) => setTargetUnit(v as TargetUnit)}>
                                        <SelectTrigger className="w-20 h-10 font-black text-xs border-2 rounded-xl uppercase">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-2">
                                            <SelectItem value="kb" className="font-bold py-1 uppercase">KB</SelectItem>
                                            <SelectItem value="mb" className="font-bold py-1 uppercase">MB</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                             </div>
                        </TabsContent>

                        <TabsContent value="manual" className="pt-4 space-y-4 animate-in fade-in duration-500">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label className="text-[9px] font-black uppercase text-muted-foreground">Quality</Label>
                                    <Badge className="font-mono font-black text-[10px] px-2 bg-primary text-white rounded shadow-sm">{quality[0]}%</Badge>
                                </div>
                                <Slider min={5} max={100} step={1} value={quality} onValueChange={setQuality} className="py-2" />
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="space-y-2 pt-2 border-t border-dashed">
                        <Label className="text-[8px] md:text-[9px] font-black uppercase text-muted-foreground tracking-widest">Output Format</Label>
                        <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as OutputFormat)}>
                            <SelectTrigger className="h-10 font-black text-[10px] border-2 rounded-xl bg-background"><SelectValue /></SelectTrigger>
                            <SelectContent className="rounded-xl border-2">
                                <SelectItem value="jpeg" className="font-bold py-1">JPEG (Smallest)</SelectItem>
                                <SelectItem value="webp" className="font-bold py-1">WEBP (Modern)</SelectItem>
                                <SelectItem value="png" className="font-bold py-1">PNG (Lossless)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/10 p-4 border-t">
                    <Button 
                        className="w-full h-12 md:h-14 text-sm md:text-base font-black bg-primary hover:bg-primary/90 shadow-xl rounded-xl transition-all active:scale-95 disabled:opacity-50" 
                        disabled={results.length === 0 || isBulkProcessing}
                        onClick={startBulkCompression}
                    >
                        {isBulkProcessing ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="size-4 animate-spin" />
                                <span className="uppercase text-xs">PROCESSING...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Zap className="size-4 text-yellow-400 fill-yellow-400" />
                                <span className="uppercase tracking-tighter">OPTIMIZE NOW</span>
                            </div>
                        )}
                    </Button>
                </CardFooter>
            </Card>

            <div className="p-3 bg-green-500/5 rounded-xl border border-green-500/10 flex gap-3 items-center">
                <ShieldCheck className="size-4 text-green-600" />
                <p className="text-[9px] text-green-700 font-bold uppercase">100% Secure Local RAM Processing</p>
            </div>
        </div>
      </div>
    </div>
  );
}
