
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
  const [previewResult, setPreviewResult] = useState<CompressionResult | null>(null);
  
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
            const ctx = canvas.getContext("2d");
            if (!ctx) return resolve(item);

            canvas.width = img.width;
            canvas.height = img.height;

            const mimeType = `image/${outputFormat}`;
            let finalUrl = "";
            let finalSize = 0;

            const renderToCanvas = (q: number) => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                if (outputFormat === 'jpeg') {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                ctx.drawImage(img, 0, 0);
                return canvas.toDataURL(mimeType, q);
            };

            if (compressionMode === 'manual') {
                finalUrl = renderToCanvas(quality[0] / 100);
                const blob = await (await fetch(finalUrl)).blob();
                finalSize = blob.size;
            } else {
                const targetBytes = parseInt(targetSizeKb, 10) * 1024;
                let low = 0.05, high = 1.0, bestUrl = "";
                let bestSize = 0;

                for (let i = 0; i < 7; i++) {
                    const mid = (low + high) / 2;
                    const testUrl = renderToCanvas(mid);
                    const testBlob = await (await fetch(testUrl)).blob();
                    
                    if (testBlob.size <= targetBytes) {
                        bestUrl = testUrl;
                        bestSize = testBlob.size;
                        low = mid;
                    } else {
                        high = mid;
                    }
                }
                
                if (!bestUrl) {
                   bestUrl = renderToCanvas(0.05);
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
    toast({ title: "Batch Complete!", description: "All images optimized to perfection." });
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
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Workspace Area */}
        <div className="lg:col-span-7 space-y-6">
            <Card 
                className={cn(
                    "border-2 border-dashed transition-all relative overflow-hidden bg-card/50", 
                    isDragOver && "border-primary bg-primary/5", 
                    results.length > 0 ? "p-4" : "p-24 text-center"
                )}
                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            >
                {results.length === 0 ? (
                    <div className="flex flex-col items-center gap-6 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="size-24 rounded-[2.5rem] bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                            <UploadCloud className="size-12" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-2xl font-black uppercase tracking-tighter">Bulk Compression Workspace</p>
                            <p className="text-sm text-muted-foreground font-medium italic">Drop up to 50 photos. Private local processing.</p>
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
                        <ScrollArea className="h-[500px] pr-4">
                            <div className="grid gap-3">
                                {results.map((res) => (
                                    <div key={res.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border-2 hover:border-primary/40 transition-all group shadow-sm">
                                        <div className="flex items-center gap-4 truncate">
                                            <div className="size-16 rounded-xl overflow-hidden bg-muted border-2 shrink-0 relative shadow-sm">
                                                <Image src={res.originalDataUrl} alt="prev" fill className="object-cover" />
                                            </div>
                                            <div className="truncate">
                                                <p className="text-xs font-black truncate max-w-[150px] uppercase tracking-tight">{res.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] text-muted-foreground font-mono">{formatBytes(res.originalSize)}</span>
                                                    {res.newSize > 0 && (
                                                        <>
                                                            <span className="text-muted-foreground">→</span>
                                                            <span className="text-[10px] font-black text-green-600 font-mono">{formatBytes(res.newSize)}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            {res.isProcessing ? (
                                                <Loader2 className="size-5 animate-spin text-primary" />
                                            ) : res.newSize > 0 ? (
                                                <div className="flex items-center gap-2">
                                                    <Badge className="bg-green-500 hover:bg-green-500 text-white text-[9px] font-black">-{res.savings.toFixed(0)}%</Badge>
                                                    
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button size="icon" variant="outline" className="size-9 rounded-xl border-2 hover:bg-primary/5" onClick={() => setPreviewResult(res)}>
                                                                <Eye className="size-4 text-primary" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                                            <DialogHeader>
                                                                <DialogTitle className="flex items-center gap-2 uppercase font-black tracking-tighter">
                                                                    <ArrowLeftRight className="text-primary" /> Before vs After Quality Check
                                                                </DialogTitle>
                                                            </DialogHeader>
                                                            <div className="grid md:grid-cols-2 gap-8 py-6">
                                                                <div className="space-y-3">
                                                                    <div className="flex justify-between items-center bg-muted/30 p-2 rounded-lg">
                                                                        <span className="text-[10px] font-black uppercase text-muted-foreground">ORIGINAL PHOTO</span>
                                                                        <Badge variant="outline" className="font-mono">{formatBytes(res.originalSize)}</Badge>
                                                                    </div>
                                                                    <div className="aspect-square relative rounded-2xl overflow-hidden border-2 bg-white flex items-center justify-center">
                                                                        <Image src={res.originalDataUrl} alt="original" fill className="object-contain p-2" />
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-3 text-right">
                                                                    <div className="flex justify-between items-center bg-green-500/10 p-2 rounded-lg">
                                                                        <Badge className="bg-green-500 text-white font-mono">OPTIMIZED</Badge>
                                                                        <span className="text-[10px] font-black uppercase text-green-700">{formatBytes(res.newSize)} (-{res.savings.toFixed(1)}%)</span>
                                                                    </div>
                                                                    <div className="aspect-square relative rounded-2xl overflow-hidden border-2 border-green-500/20 bg-white flex items-center justify-center">
                                                                        <Image src={res.dataUrl} alt="optimized" fill className="object-contain p-2" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <CardFooter className="p-0 pt-4">
                                                                <Button className="w-full h-14 bg-green-600 hover:bg-green-700 font-black text-lg" onClick={() => downloadFile(res)}>
                                                                    DOWNLOAD THIS IMAGE <Download className="ml-2 size-5" />
                                                                </Button>
                                                            </CardFooter>
                                                        </DialogContent>
                                                    </Dialog>

                                                    <Button size="icon" variant="outline" className="size-9 rounded-xl border-2 border-green-500/50 hover:bg-green-500/5" onClick={() => downloadFile(res)}>
                                                        <Download className="size-4 text-green-600" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Badge variant="outline" className="text-[9px] font-black uppercase opacity-40">Ready</Badge>
                                            )}
                                            <Button variant="ghost" size="icon" className="size-8 rounded-full text-muted-foreground hover:text-destructive" onClick={() => removeFile(res.id)}>
                                                <X className="size-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                        <Button variant="outline" className="w-full border-2 border-dashed h-14 rounded-2xl font-black text-xs uppercase text-primary border-primary/20 hover:bg-primary/5" onClick={() => fileInputRef.current?.click()}>
                            <Layers className="size-4 mr-2" /> ADD MORE FILES
                        </Button>
                    </div>
                )}
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" multiple onChange={onFileChange} />
            </Card>

            {allProcessed && results.length > 1 && (
                <Card className="bg-green-500/5 border-2 border-dashed border-green-500/30 rounded-[2rem] animate-in zoom-in-95 duration-500">
                    <CardContent className="p-8 flex flex-col sm:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-5 text-center sm:text-left">
                            <div className="size-16 rounded-full bg-green-500 text-white flex items-center justify-center shadow-xl shadow-green-500/30 shrink-0 mx-auto sm:mx-0">
                                <CheckCircle2 className="size-8" />
                            </div>
                            <div>
                                <p className="text-lg font-black uppercase tracking-tighter text-green-800">Batch Processing Complete!</p>
                                <p className="text-xs text-green-700 font-medium">All photos optimized. Download them as a single ZIP archive.</p>
                            </div>
                        </div>
                        <Button size="lg" className="h-16 px-10 bg-green-600 hover:bg-green-700 font-black text-lg shadow-2xl rounded-2xl transition-all active:scale-95" onClick={downloadAllAsZip}>
                            <Download className="mr-3 size-6" /> DOWNLOAD ZIP
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>

        {/* Right: Settings & Optimizer Suite */}
        <div className="lg:col-span-5 space-y-6">
            <Card className="border-2 shadow-2xl border-primary/10 overflow-hidden sticky top-24 rounded-[2rem] bg-white dark:bg-slate-950">
                <CardHeader className="bg-primary/5 border-b p-6">
                    <CardTitle className="text-xl flex items-center gap-3 font-black uppercase tracking-tighter">
                        <Settings2 className="size-6 text-primary" /> Optimizer Suite
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                    <Tabs value={compressionMode} onValueChange={(v) => setCompressionMode(v as CompressionMode)} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 h-14 p-1.5 bg-muted/50 rounded-2xl border-2">
                            <TabsTrigger 
                                value="target" 
                                className="font-black text-[10px] uppercase rounded-xl transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg"
                            >
                                <Target className="size-3 mr-2" /> Target Size
                            </TabsTrigger>
                            <TabsTrigger 
                                value="manual" 
                                className="font-black text-[10px] uppercase rounded-xl transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg"
                            >
                                <Settings2 className="size-3 mr-2" /> Manual Quality
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="target" className="pt-8 space-y-6 animate-in fade-in duration-500">
                             <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    Target KB per image
                                </Label>
                                <div className="relative group">
                                    <Input 
                                        type="number" 
                                        value={targetSizeKb} 
                                        onChange={(e) => setTargetSizeKb(e.target.value)} 
                                        className="h-16 text-3xl font-black focus-visible:ring-primary border-2 rounded-2xl pl-8 pr-20 bg-muted/10"
                                    />
                                    <div className="absolute right-8 top-1/2 -translate-y-1/2 font-black text-xl text-primary/40 tracking-tighter uppercase">KB</div>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-2xl border-2 border-primary/10">
                                    <p className="text-[10px] text-primary/80 font-bold leading-relaxed">
                                        <span className="font-black uppercase mr-1">Batch Optimizer:</span> Our logic iterates 7 times to hit your target KB while maintaining maximum visual detail.
                                    </p>
                                </div>
                             </div>
                        </TabsContent>

                        <TabsContent value="manual" className="pt-8 space-y-8 animate-in fade-in duration-500">
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Compression Level</Label>
                                    <Badge className="font-mono font-black text-base px-4 py-1 bg-primary text-white rounded-lg shadow-md">{quality[0]}%</Badge>
                                </div>
                                <Slider min={5} max={100} step={1} value={quality} onValueChange={setQuality} className="py-4" />
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Higher % = Crystal Clear / Lower % = Tiny File Size</p>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="space-y-4 pt-4 border-t-2 border-dashed">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Output Format</Label>
                        <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as OutputFormat)}>
                            <SelectTrigger className="h-14 font-black text-sm border-2 rounded-2xl focus:ring-primary/20 bg-background"><SelectValue /></SelectTrigger>
                            <SelectContent className="rounded-xl border-2 shadow-2xl">
                                <SelectItem value="jpeg" className="font-bold py-3">JPEG (Best for Photos)</SelectItem>
                                <SelectItem value="webp" className="font-bold py-3">WEBP (Next-Gen Web)</SelectItem>
                                <SelectItem value="png" className="font-bold py-3">PNG (High Clarity)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/10 p-8 border-t-2">
                    <Button 
                        className="w-full h-18 text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-2xl group transition-all active:scale-95 disabled:opacity-50" 
                        disabled={results.length === 0 || isBulkProcessing}
                        onClick={startBulkCompression}
                    >
                        {isBulkProcessing ? (
                            <div className="flex items-center gap-3">
                                <Loader2 className="size-7 animate-spin" />
                                <span className="uppercase tracking-tighter">OPTIMIZING BATCH...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Zap className="size-7 text-yellow-400 fill-yellow-400 group-hover:scale-110 transition-transform" />
                                <span className="uppercase tracking-tighter">PROCESS QUEUE</span>
                            </div>
                        )}
                    </Button>
                </CardFooter>
            </Card>

            {/* Privacy Promise */}
            <div className="p-6 bg-green-500/5 rounded-[2rem] border-2 border-green-500/10 flex gap-4 items-center shadow-sm">
                <div className="size-12 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="size-6 text-green-600" />
                </div>
                <div>
                    <p className="text-[11px] font-black text-green-700 uppercase tracking-tight">Security Lock Active</p>
                    <p className="text-[10px] text-green-600/80 font-medium leading-tight">All processing occurs locally in RAM. Your images never touch our cloud servers.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
