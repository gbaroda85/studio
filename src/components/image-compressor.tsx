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
  RefreshCcw,
  Monitor
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
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger,
    DialogFooter 
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import confetti from 'canvas-confetti';

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
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`star-${i}`}>
                <svg viewBox="0 0 784.11 815.53" style={{ shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision', imageRendering: 'optimizeQuality', fillRule: 'evenodd', clipRule: 'evenodd' }}>
                    <path className="fil0" d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
                </svg>
            </div>
        ))}
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
  const [viewItem, setViewItem] = useState<CompressionResult | null>(null);
  
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
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
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
                    for (let i = 0; i < 6; i++) {
                        const mid = (low + high) / 2;
                        const testUrl = renderToCanvas(mid, scale);
                        const testBlob = await (await fetch(testUrl)).blob();
                        if (testBlob.size <= targetBytes) {
                            stepBestUrl = testUrl;
                            bestSize = testBlob.size;
                            low = mid; 
                        } else {
                            high = mid; 
                        }
                    }
                    if (stepBestUrl) {
                        bestUrl = stepBestUrl;
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
    toast({ title: "Batch Complete!" });
  };

  const downloadFile = (res: CompressionResult) => {
    const link = document.createElement("a");
    link.href = res.dataUrl;
    const ext = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
    link.download = `Optimized-${res.name.split('.')[0]}.${ext}`;
    link.click();
  };

  const downloadAllAsZip = async () => {
    const zip = new JSZip();
    const ext = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
    results.forEach(res => {
        if (res.newSize > 0) {
            const base64Data = res.dataUrl.split(",")[1];
            zip.file(`Optimized-${res.name.split('.')[0]}.${ext}`, base64Data, { base64: true });
        }
    });
    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = "Optimized-Batch.zip";
    link.click();
  };

  const removeFile = (id: string) => {
    setResults(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="w-full max-w-7xl animate-in fade-in duration-500 px-2 md:px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
        
        <div className="lg:col-span-7 space-y-4">
            <Card className={cn("glass-card overflow-hidden transition-all duration-300 border-2 border-dashed shadow-2xl rounded-[2rem] md:rounded-[2.5rem] hover:border-primary/50 select-none h-full flex flex-col", isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.01]")} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
                <CardHeader className="bg-muted/30 border-b p-4 md:p-6 text-center shrink-0">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-[10px] md:text-sm font-black uppercase tracking-widest text-muted-foreground">STUDIO WORKSPACE</CardTitle>
                        {results.length > 0 && <Badge className="bg-primary text-white font-black text-[9px] px-3 py-1 rounded-full">{results.length} FILES</Badge>}
                    </div>
                </CardHeader>
                <CardContent className={cn("flex-1", results.length === 0 ? "p-10 md:p-12" : "p-3 md:p-6")}>
                    {results.length === 0 ? (
                        <div className="border-4 border-dashed border-muted-foreground/20 rounded-[1.5rem] md:rounded-[2rem] p-10 md:p-16 flex flex-col items-center justify-center space-y-6 bg-muted/30 group cursor-pointer hover:bg-muted/40 transition-all" onClick={() => fileInputRef.current?.click()}>
                            <div className="relative"><UploadCloud className="size-12 md:size-16 text-muted-foreground group-hover:text-primary transition-colors" /><Zap className="absolute -top-1 -right-1 size-5 md:size-8 text-yellow-500 animate-pulse" /></div>
                            <div className="text-center px-4"><p className="text-lg md:text-xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Drop Images to Shrink</p><p className="text-[9px] md:text-sm text-muted-foreground mt-2 font-bold opacity-60 uppercase">100% Private local engine.</p></div>
                        </div>
                    ) : (
                        <div className="space-y-4 h-full flex flex-col">
                            <div className="flex justify-between items-center px-1 shrink-0">
                                <p className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest">Processing Queue</p>
                                <Button variant="ghost" size="sm" onClick={() => setResults([])} className="h-7 text-rose-500 font-black text-[9px] uppercase"><Trash2 className="size-3 mr-1"/> Clear</Button>
                            </div>
                            <ScrollArea className="flex-1 h-[300px] md:h-[450px] pr-2 custom-scrollbar border rounded-2xl bg-muted/5">
                                <div className="grid gap-2 p-3">
                                    {results.map((res) => (
                                        <div key={res.id} className="flex items-center justify-between p-2 md:p-3 rounded-xl md:rounded-2xl border-2 border-transparent bg-white dark:bg-slate-900 shadow-sm animate-in slide-in-from-bottom-2">
                                            <div className="flex items-center gap-3 truncate">
                                                <div className="size-10 md:size-12 rounded-lg overflow-hidden bg-muted border shrink-0 relative"><Image src={res.originalDataUrl} alt="prev" fill className="object-cover" /></div>
                                                <div className="truncate text-left">
                                                    <p className="text-[10px] md:text-xs font-black truncate max-w-[120px] md:max-w-[250px] uppercase">{res.name}</p>
                                                    <div className="flex items-center gap-2 mt-0.5"><span className="text-[7px] md:text-[8px] opacity-40 font-mono">{formatBytes(res.originalSize)}</span>{res.newSize > 0 && <><span className="text-muted-foreground text-[8px]">→</span><span className="text-[7px] md:text-[8px] font-black text-green-600 font-mono">{formatBytes(res.newSize)}</span></>}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {res.isProcessing ? (
                                                  <Loader2 className="size-4 animate-spin text-primary" />
                                                ) : (
                                                  <div className="flex items-center gap-1.5">
                                                      {res.newSize > 0 && <Badge className="bg-green-500 text-white text-[7px] font-black">-{res.savings.toFixed(0)}%</Badge>}
                                                      
                                                      <Button size="icon" variant="outline" className="size-7 rounded-lg border-2 hover:bg-primary/5 text-primary" onClick={() => setViewItem(res)}>
                                                          <Eye className="size-3.5" />
                                                      </Button>

                                                      {res.newSize > 0 && (
                                                          <Button size="icon" variant="outline" className="size-7 rounded-lg border-2 hover:bg-green-50 text-green-600" onClick={() => downloadFile(res)}>
                                                              <Download className="size-3.5" />
                                                          </Button>
                                                      )}
                                                  </div>
                                                )}
                                                <Button variant="ghost" size="icon" className="size-7 rounded-full" onClick={() => removeFile(res.id)}><X className="size-3" /></Button>
                                            </div>
                                        </div>
                                    ))}
                                    <Button variant="outline" className="w-full border-2 border-dashed h-10 rounded-xl mt-2 font-black text-[9px] uppercase text-primary border-primary/20 hover:bg-primary/5" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}><Plus className="size-3 mr-2" /> ADD MORE</Button>
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="justify-center gap-4 md:gap-8 text-[7px] md:text-[9px] text-muted-foreground font-black uppercase tracking-widest pb-6 md:pb-8 bg-muted/10 pt-4 md:pt-6 px-4">
                    <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-600" /> SECURE RAM</div>
                    <div className="flex items-center gap-1.5"><Zap className="size-3 text-yellow-500" /> INSTANT RENDER</div>
                </CardFooter>
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" multiple onChange={onFileChange} />
            </Card>

            {results.length > 1 && results.every(r => r.newSize > 0) && (
                <Card className="bg-green-500/5 border-2 border-dashed border-green-500/20 rounded-[2rem] md:rounded-[2.5rem] animate-in zoom-in-95 shadow-xl">
                    <CardContent className="p-5 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                        <div className="flex items-center gap-4">
                            <div className="size-12 md:size-16 rounded-2xl bg-green-500 text-white flex items-center justify-center shadow-xl shrink-0"><CheckCircle2 className="size-8 md:size-10" /></div>
                            <div><p className="text-xl md:text-2xl font-black text-green-900 uppercase tracking-tighter">Ready!</p><p className="text-[9px] md:text-xs text-green-700 font-bold uppercase">Bundle available for download</p></div>
                        </div>
                        <Button className="magic-button magic-button-success w-full md:w-auto h-12 md:h-14 px-8 bg-green-600 rounded-full transition-all active:scale-95 flex items-center justify-center gap-3 border-none shadow-2xl text-white" onClick={downloadAllAsZip}>
                            <StarIcons /><Download className="size-5" /><span className="uppercase tracking-tighter text-xs font-black">SAVE ALL ZIP</span>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>

        <div className="lg:col-span-5 space-y-4">
            <Card className="border-2 shadow-xl border-primary/10 overflow-hidden sticky top-24 rounded-[2rem] md:rounded-[2.5rem] bg-card/50">
                <CardHeader className="bg-primary/5 border-b p-5 md:p-8 text-left">
                    <CardTitle className="text-base md:text-lg flex items-center gap-3 font-black uppercase tracking-tighter"><Settings2 className="size-5 md:size-6 text-primary" /> Configuration</CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8 space-y-8">
                    <Tabs value={compressionMode} onValueChange={(v) => setCompressionMode(v as CompressionMode)} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6 h-11 bg-background p-1 rounded-xl border-2">
                            <TabsTrigger value="target" className="font-black text-[9px] uppercase">Strict Limit</TabsTrigger>
                            <TabsTrigger value="manual" className="font-black text-[9px] uppercase">Manual Scale</TabsTrigger>
                        </TabsList>
                        <TabsContent value="target" className="space-y-6 animate-in fade-in duration-300 text-left">
                             <div className="space-y-3">
                                <Label className="text-[9px] md:text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2"><Zap className="size-3 text-yellow-500" /> Presets</Label>
                                <div className="grid grid-cols-4 gap-2">
                                    {QUICK_SIZES.map((size) => (
                                        <button 
                                            key={size} 
                                            onClick={() => { setTargetSizeValue(size); setTargetUnit('kb'); }} 
                                            className={cn(
                                                "btn-pos-uiverse h-10 transition-all !ring-[3px] !ring-slate-950 dark:!ring-white", 
                                                targetSizeValue === size && targetUnit === 'kb' && "active-uiverse"
                                            )} 
                                            data-label={`${size}K`} 
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-3 pt-4 border-t border-dashed text-left">
                                <Label className="text-[9px] md:text-[10px] font-black uppercase text-muted-foreground">Custom Size Limit</Label>
                                <div className="flex gap-2">
                                    <Input type="number" value={targetSizeValue} onChange={(e) => setTargetSizeValue(e.target.value)} className="h-12 text-lg font-black border-2 rounded-xl flex-1 bg-background shadow-inner" />
                                    <Select value={targetUnit} onValueChange={(v) => setTargetUnit(v as TargetUnit)}><SelectTrigger className="w-20 md:w-24 h-12 font-black border-2 rounded-xl"><SelectValue /></SelectTrigger><SelectContent className="rounded-xl font-black"><SelectItem value="kb">KB</SelectItem><SelectItem value="mb">MB</SelectItem></SelectContent></Select>
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="manual" className="space-y-6 animate-in fade-in duration-300 text-left">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-1"><Label className="text-[10px] font-black uppercase">Compression</Label><Badge variant="secondary" className="font-black text-[11px] px-3 py-1 bg-primary text-white shadow-lg">{quality[0]}%</Badge></div>
                                <Slider min={5} max={100} step={1} value={quality} onValueChange={setQuality} className="py-2" />
                            </div>
                        </TabsContent>
                    </Tabs>
                    <div className="space-y-3 pt-4 border-t border-dashed text-left">
                        <Label className="text-[9px] md:text-[10px] font-black uppercase text-muted-foreground opacity-60">Output Format</Label>
                        <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as OutputFormat)}><SelectTrigger className="h-11 font-black text-xs border-2 rounded-xl bg-background"><SelectValue /></SelectTrigger><SelectContent className="rounded-xl border-2"><SelectItem value="jpeg" className="font-bold py-2">JPEG (Universal)</SelectItem><SelectItem value="webp" className="font-bold py-2">WEBP (Modern HD)</SelectItem><SelectItem value="png" className="font-bold py-2">PNG (Lossless)</SelectItem></SelectContent></Select>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/10 p-6 md:p-8 border-t border-dashed">
                    <Button className="magic-button w-full h-16 md:h-18 text-lg font-black bg-primary hover:bg-primary/90 text-white rounded-full transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 px-10 border-none shadow-2xl" disabled={results.length === 0 || isBulkProcessing} onClick={startBulkCompression}>
                        <StarIcons />
                        {isBulkProcessing ? <Loader2 className="size-7 md:size-8 animate-spin" /> : <Zap className="size-7 md:size-8 text-yellow-400 fill-yellow-400 group-hover:scale-125 transition-transform" />}
                        <span className="uppercase tracking-tighter text-sm md:text-lg">{isBulkProcessing ? "PROCESSING..." : "OPTIMIZE NOW"}</span>
                    </Button>
                </CardFooter>
            </Card>
        </div>
      </div>

      {/* VIEW MODAL */}
      <Dialog open={!!viewItem} onOpenChange={(o) => !o && setViewItem(null)}>
          <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden rounded-[2.5rem] border-none shadow-3xl bg-white dark:bg-slate-950 flex flex-col top-[54%] z-[2000]">
              <DialogHeader className="bg-primary/5 p-4 border-b shrink-0">
                  <DialogTitle className="text-center font-black uppercase tracking-widest text-[10px] text-muted-foreground flex items-center justify-center gap-2">
                       <Eye className="size-4 text-primary" /> Visual Studio Preview
                  </DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center bg-slate-100 dark:bg-slate-900 shadow-inner custom-scrollbar text-center">
                  <div className="flex flex-col items-center gap-6 w-full">
                      <div className="relative shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-[8px] md:border-[12px] border-white bg-white rounded-sm animate-in zoom-in-95 duration-500 overflow-hidden w-full max-w-[650px] mt-4 mb-4 transform-gpu">
                          <img 
                              src={viewItem?.dataUrl || viewItem?.originalDataUrl} 
                              className="w-full h-auto block" 
                              alt="preview" 
                          />
                          <div className="absolute top-2 right-2 opacity-20 pointer-events-none">
                              <Badge variant="outline" className="text-[8px] font-black uppercase border-black">
                                {viewItem?.newSize && viewItem.newSize > 0 ? 'COMPRESSED' : 'ORIGINAL'}
                              </Badge>
                          </div>
                      </div>
                      <div className="flex items-center gap-4 bg-black/80 backdrop-blur-xl px-8 py-3 rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-3xl z-40 transition-all hover:scale-105 mb-10">
                          <Sparkles className="size-4 text-primary animate-pulse" /> High-Fidelity Rendering Ready
                      </div>
                  </div>
              </div>
              <DialogFooter className="p-5 bg-muted/10 border-t flex justify-center shrink-0">
                  <Button variant="outline" onClick={() => setViewItem(null)} className="font-black text-[10px] uppercase tracking-widest px-10 h-12 border-2 rounded-xl hover:bg-slate-900 hover:text-white transition-all">
                      <X className="mr-2 size-4" /> Close Studio View
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
