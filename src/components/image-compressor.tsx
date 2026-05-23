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
  Zip,
  CheckCircle2,
  Trash2,
  FileOutput,
  Layers,
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
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "./ui/scroll-area";

type CompressionResult = {
  id: string;
  name: string;
  originalSize: number;
  newSize: number;
  savings: number;
  dataUrl: string;
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
  const [targetSizeKb, setTargetSizeKb] = useState<string>("100");
  const [quality, setQuality] = useState<number[]>([70]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('jpeg');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).filter(f => f.type.startsWith("image/"));
    
    const newResults: CompressionResult[] = newFiles.map(f => ({
        id: Math.random().toString(36).substr(2, 9),
        name: f.name,
        originalSize: f.size,
        newSize: 0,
        savings: 0,
        dataUrl: URL.createObjectURL(f), // Temporary preview
        isProcessing: false
    }));

    setResults(prev => [...prev, ...newResults]);
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFiles(e.target.files);
  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFiles(e.dataTransfer.files); };

  const compressSingleFile = async (item: CompressionResult): Promise<CompressionResult> => {
    return new Promise((resolve) => {
        const img = new window.Image();
        img.src = item.dataUrl;
        img.onload = async () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) return resolve(item);

            const mimeType = `image/${outputFormat}`;
            let finalUrl = "";
            let finalSize = 0;

            if (compressionMode === 'manual') {
                canvas.width = img.width;
                canvas.height = img.height;
                if (outputFormat === 'jpeg') { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
                ctx.drawImage(img, 0, 0);
                finalUrl = canvas.toDataURL(mimeType, quality[0] / 100);
                const blob = await (await fetch(finalUrl)).blob();
                finalSize = blob.size;
            } else {
                // Target Size Logic
                const targetBytes = parseInt(targetSizeKb, 10) * 1024;
                let low = 0.05, high = 1.0, bestQ = 0.5;
                let bestBlob: Blob | null = null;

                canvas.width = img.width;
                canvas.height = img.height;
                
                for (let i = 0; i < 7; i++) {
                    const q = (low + high) / 2;
                    const tempUrl = canvas.toDataURL(mimeType, q);
                    const tempBlob = await (await fetch(tempUrl)).blob();
                    if (tempBlob.size <= targetBytes) {
                        bestBlob = tempBlob;
                        bestQ = q;
                        low = q;
                    } else {
                        high = q;
                    }
                }
                
                if (!bestBlob) {
                   const fallbackUrl = canvas.toDataURL(mimeType, 0.1);
                   bestBlob = await (await fetch(fallbackUrl)).blob();
                }
                
                finalSize = bestBlob.size;
                finalUrl = await new Promise(r => {
                    const reader = new FileReader();
                    reader.onloadend = () => r(reader.result as string);
                    reader.readAsDataURL(bestBlob!);
                });
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
    const updatedResults = [...results];

    for (let i = 0; i < updatedResults.length; i++) {
        if (updatedResults[i].newSize > 0) continue; // Skip already done
        
        setResults(prev => prev.map((item, idx) => i === idx ? { ...item, isProcessing: true } : item));
        const res = await compressSingleFile(updatedResults[i]);
        setResults(prev => prev.map((item, idx) => i === idx ? res : item));
    }

    setIsBulkProcessing(false);
    toast({ title: "Bulk Compression Done!", description: `${results.length} images optimized.` });
  };

  const downloadAll = async () => {
    const zip = new JSZip();
    results.forEach(res => {
        const base64Data = res.dataUrl.split(",")[1];
        zip.file(`compressed-${res.name.split('.')[0]}.${outputFormat}`, base64Data, { base64: true });
    });
    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = "optimized-images-gr7.zip";
    link.click();
  };

  const removeFile = (id: string) => {
    setResults(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="w-full max-w-6xl animate-in fade-in duration-500">
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left: List & Upload */}
        <div className="lg:col-span-7 space-y-6">
            <Card 
                className={cn("border-2 border-dashed transition-all", isDragOver && "border-primary bg-primary/5", results.length > 0 ? "p-4" : "p-20 text-center")}
                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            >
                {results.length === 0 ? (
                    <div className="flex flex-col items-center gap-4 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="size-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
                            <UploadCloud className="size-10" />
                        </div>
                        <div>
                            <p className="text-xl font-black uppercase">Drop images for Bulk Compression</p>
                            <p className="text-sm text-muted-foreground">Select up to 50 photos at once. 100% Secure.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-2">
                            <Badge variant="secondary" className="font-black text-[10px] uppercase">{results.length} Files Queued</Badge>
                            <Button variant="ghost" size="sm" onClick={() => setResults([])} className="text-destructive font-bold h-8"><Trash2 className="size-3 mr-1"/> Clear All</Button>
                        </div>
                        <ScrollArea className="h-[400px] pr-4">
                            <div className="grid gap-3">
                                {results.map((res) => (
                                    <div key={res.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border group hover:border-primary/30 transition-colors">
                                        <div className="flex items-center gap-4 truncate">
                                            <div className="size-12 rounded-lg overflow-hidden bg-white border shrink-0 relative">
                                                <Image src={res.dataUrl} alt="prev" fill className="object-cover" />
                                            </div>
                                            <div className="truncate">
                                                <p className="text-xs font-bold truncate max-w-[150px]">{res.name}</p>
                                                <p className="text-[10px] text-muted-foreground font-mono">{formatBytes(res.originalSize)}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 shrink-0">
                                            {res.isProcessing ? (
                                                <Loader2 className="size-4 animate-spin text-primary" />
                                            ) : res.newSize > 0 ? (
                                                <div className="text-right">
                                                    <Badge className="bg-green-500 text-white text-[9px] font-black">-{res.savings.toFixed(0)}%</Badge>
                                                    <p className="text-[10px] font-bold text-green-600 mt-1">{formatBytes(res.newSize)}</p>
                                                </div>
                                            ) : null}
                                            <Button variant="ghost" size="icon" className="size-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeFile(res.id)}>
                                                <X className="size-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                        <Button variant="outline" className="w-full border-2 border-dashed h-12" onClick={() => fileInputRef.current?.click()}>
                            <Layers className="size-4 mr-2" /> ADD MORE PHOTOS
                        </Button>
                    </div>
                )}
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" multiple onChange={onFileChange} />
            </Card>

            {results.some(r => r.newSize > 0) && (
                <Card className="bg-green-500/5 border-green-500/20">
                    <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg">
                                <CheckCircle2 className="size-6" />
                            </div>
                            <div>
                                <p className="text-sm font-black uppercase text-green-700">All Images Optimized</p>
                                <p className="text-xs text-green-600 font-medium">Ready to download in a single archive.</p>
                            </div>
                        </div>
                        <Button size="lg" className="bg-green-600 hover:bg-green-700 font-black shadow-xl" onClick={downloadAll}>
                            <Download className="mr-2 size-5" /> DOWNLOAD AS ZIP
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>

        {/* Right: Controls */}
        <div className="lg:col-span-5 space-y-6">
            <Card className="border-2 shadow-2xl border-primary/10 overflow-hidden sticky top-24">
                <CardHeader className="bg-primary/5 border-b">
                    <CardTitle className="text-lg flex items-center gap-2 font-black uppercase">
                        <Settings2 className="size-5 text-primary" /> Compression Suite
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-8">
                    <Tabs value={compressionMode} onValueChange={(v) => setCompressionMode(v as CompressionMode)}>
                        <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-muted rounded-xl">
                            <TabsTrigger value="target" className="font-bold text-xs uppercase">Fixed KB (Auto)</TabsTrigger>
                            <TabsTrigger value="manual" className="font-bold text-xs uppercase">Manual Quality</TabsTrigger>
                        </TabsList>

                        <TabsContent value="target" className="pt-6 space-y-4 animate-in fade-in duration-300">
                             <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Target Size per image</Label>
                             <div className="relative group">
                                <Input 
                                    type="number" 
                                    value={targetSizeKb} 
                                    onChange={(e) => setTargetSizeKb(e.target.value)} 
                                    className="h-14 text-2xl font-black focus-visible:ring-primary border-2 pl-6 pr-16"
                                />
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-muted-foreground">KB</div>
                             </div>
                             <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                                <span className="text-primary font-bold">Smart Algorithm:</span> We intelligently adjust quality to fit under {targetSizeKb}KB while keeping edges sharp.
                             </p>
                        </TabsContent>

                        <TabsContent value="manual" className="pt-6 space-y-6 animate-in fade-in duration-300">
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <Label className="text-xs font-black uppercase">Image Quality</Label>
                                    <span className="text-primary font-mono font-black">{quality[0]}%</span>
                                </div>
                                <Slider min={5} max={100} step={1} value={quality} onValueChange={setQuality} className="py-4" />
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="space-y-2 pt-4 border-t">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground">Export Format</Label>
                        <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as OutputFormat)}>
                            <SelectTrigger className="h-12 font-bold border-2"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="jpeg" className="font-bold">JPEG (Recommended)</SelectItem>
                                <SelectItem value="webp" className="font-bold">WEBP (Modern)</SelectItem>
                                <SelectItem value="png" className="font-bold">PNG (Lossless)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/10 p-6 border-t">
                    <Button 
                        className="w-full h-16 text-xl font-black bg-primary hover:bg-primary/90 shadow-xl group" 
                        disabled={results.length === 0 || isBulkProcessing}
                        onClick={startBulkCompression}
                    >
                        {isBulkProcessing ? <Loader2 className="mr-3 size-6 animate-spin" /> : <FileOutput className="mr-3 size-6 group-hover:scale-110 transition-transform" />}
                        {isBulkProcessing ? "PROCESSING..." : "COMPRESS ALL"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  );
}
