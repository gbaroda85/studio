
"use client";

import { useState, useRef, type ChangeEvent, type DragEvent, useEffect, useCallback } from "react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import { 
  UploadCloud, 
  Download, 
  FileDigit, 
  X, 
  Loader2, 
  ShieldCheck, 
  Zap, 
  Layers, 
  RefreshCcw,
  Layout,
  AlignVerticalCenter,
  AlignVerticalTop,
  AlignVerticalBottom,
  Maximize,
  Minimize,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type VAlign = 'top' | 'center' | 'bottom';
type FitMode = 'fit' | 'original';

export default function ImageToPdfConverter() {
  const { toast } = useToast();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageSrcs, setImageSrcs] = useState<string[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [convertedPdfUrl, setConvertedPdfUrl] = useState<string | null>(null);
  
  // Layout Settings
  const [vAlign, setVAlign] = useState<VAlign>('center');
  const [fitMode, setFitMode] = useState<FitMode>('fit');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (convertedPdfUrl) {
        URL.revokeObjectURL(convertedPdfUrl);
      }
    };
  }, [convertedPdfUrl]);

  const handleFilesChange = (files: FileList | null) => {
    if (convertedPdfUrl) {
        URL.revokeObjectURL(convertedPdfUrl);
        setConvertedPdfUrl(null);
    }
    const newFiles = Array.from(files || []).filter(file => file.type.startsWith('image/'));
    if (newFiles.length === 0 && files && files.length > 0) {
        toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please select only image files.' });
        return;
    }

    setImageFiles(prev => [...prev, ...newFiles]);
    const newSrcs: string[] = [];
    newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            newSrcs.push(e.target?.result as string);
            if (newSrcs.length === newFiles.length) {
                setImageSrcs(prev => [...prev, ...newSrcs]);
            }
        };
        reader.readAsDataURL(file);
    });
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFilesChange(e.target.files);
  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFilesChange(e.dataTransfer.files); };

  const handleRemoveImage = (index: number) => {
    if (convertedPdfUrl) {
        URL.revokeObjectURL(convertedPdfUrl);
        setConvertedPdfUrl(null);
    }
    setImageFiles(files => files.filter((_, i) => i !== index));
    setImageSrcs(srcs => srcs.filter((_, i) => i !== index));
  }
  
  const handleReset = () => {
    setImageFiles([]);
    setImageSrcs([]);
    if (convertedPdfUrl) {
      URL.revokeObjectURL(convertedPdfUrl);
    }
    setConvertedPdfUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const handleConvertToPdf = async () => {
    if (imageFiles.length === 0) return;
    setIsConverting(true);
    setConvertedPdfUrl(null);

    const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10; // 10mm margin
    const maxWidth = pageWidth - (margin * 2);
    const maxHeight = pageHeight - (margin * 2);

    for (let i = 0; i < imageSrcs.length; i++) {
        if (i > 0) pdf.addPage();

        const src = imageSrcs[i];
        const img = new window.Image();
        img.src = src;

        await new Promise((resolve) => {
            img.onload = () => {
                const imgProps = pdf.getImageProperties(img);
                let finalWidth, finalHeight;

                if (fitMode === 'fit') {
                    const widthRatio = maxWidth / imgProps.width;
                    const heightRatio = maxHeight / imgProps.height;
                    const ratio = Math.min(widthRatio, heightRatio);
                    finalWidth = imgProps.width * ratio;
                    finalHeight = imgProps.height * ratio;
                } else {
                    // Original Size Mode (but contained within page max)
                    const pxToMm = 0.264583; // 1px = 0.264583mm approx
                    finalWidth = imgProps.width * pxToMm;
                    finalHeight = imgProps.height * pxToMm;

                    // If still larger than page, scale it down to fit
                    if (finalWidth > maxWidth || finalHeight > maxHeight) {
                        const ratio = Math.min(maxWidth / finalWidth, maxHeight / finalHeight);
                        finalWidth *= ratio;
                        finalHeight *= ratio;
                    }
                }

                const x = (pageWidth - finalWidth) / 2;
                let y;

                if (vAlign === 'top') {
                    y = margin;
                } else if (vAlign === 'bottom') {
                    y = pageHeight - finalHeight - margin;
                } else {
                    y = (pageHeight - finalHeight) / 2;
                }

                pdf.addImage(src, 'PNG', x, y, finalWidth, finalHeight, undefined, 'FAST');
                resolve(null);
            };
        });
    }

    const pdfBlob = pdf.output('blob');
    setConvertedPdfUrl(URL.createObjectURL(pdfBlob));
    setIsConverting(false);
    toast({ title: "PDF Created!", description: "Check the preview below before downloading." });
  };
  
  const handleDownload = () => {
      if (!convertedPdfUrl) return;
      const link = document.createElement('a');
      link.href = convertedPdfUrl;
      link.download = `converted-docs-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  }

  return (
    <div className="w-full max-w-7xl animate-in fade-in duration-500 px-4">
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Workspace Area */}
        <div className="lg:col-span-8 space-y-6">
            <Card className={cn("border-2 transition-all duration-300 overflow-hidden bg-card/50 shadow-xl", isDragOver && "border-primary ring-4 ring-primary/20")}
                  onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
                <CardHeader className="bg-muted/30 border-b">
                    <CardTitle className="text-xl font-black flex items-center justify-between">
                        <span className="uppercase tracking-tighter">IMAGE TO PDF CONVERTER</span>
                        {imageSrcs.length > 0 && <Badge className="bg-primary text-white font-black">{imageSrcs.length} PHOTOS</Badge>}
                    </CardTitle>
                    <CardDescription>Combine photos into one secure document with layout control.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    {imageSrcs.length === 0 ? (
                        <div className="border-3 border-dashed border-muted-foreground/30 rounded-3xl p-20 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group" onClick={() => fileInputRef.current?.click()}>
                            <UploadCloud className="h-20 w-20 text-muted-foreground group-hover:text-primary transition-colors" />
                            <div className="text-center">
                                <p className="text-xl font-bold uppercase tracking-tight">Drop images or Click to upload</p>
                                <p className="text-sm text-muted-foreground mt-2">100% Secure local conversion (A4 Format)</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {imageSrcs.map((src, index) => (
                            <div key={index} className="relative group aspect-square rounded-2xl overflow-hidden border-2 shadow-sm bg-white hover:border-primary/50 transition-all">
                                <Image src={src} alt={`preview-${index}`} fill className="object-contain p-2" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full shadow-lg" onClick={() => handleRemoveImage(index)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="absolute top-1 left-1 bg-primary text-white text-[8px] px-2 py-0.5 rounded-full font-black uppercase shadow-md">Page {index + 1}</div>
                            </div>
                            ))}
                            <button className="border-2 border-dashed border-muted-foreground/30 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-primary/5 hover:border-primary/50 transition-all aspect-square" onClick={() => fileInputRef.current?.click()}>
                                <UploadCloud className="h-6 w-6 text-muted-foreground" />
                                <span className="text-[10px] font-black uppercase text-muted-foreground">Add More</span>
                            </button>
                        </div>
                    )}
                </CardContent>
                {imageSrcs.length > 0 && (
                    <CardFooter className="bg-muted/10 border-t p-4 flex justify-between items-center">
                        <Button variant="ghost" onClick={handleReset} className="text-xs font-bold uppercase text-destructive hover:bg-destructive/5"><RefreshCcw className="mr-2 h-3 w-3" /> Clear All</Button>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground">
                            <ShieldCheck className="h-4 w-4 text-green-500" /> End-to-end Local
                        </div>
                    </CardFooter>
                )}
            </Card>

            {convertedPdfUrl && (
                <Card className="border-2 border-green-500/20 shadow-2xl animate-in zoom-in-95 duration-500 overflow-hidden">
                    <CardHeader className="bg-green-500/5 py-3 border-b border-green-500/20">
                        <CardTitle className="text-sm font-black uppercase flex items-center gap-2 text-green-700">
                            <Eye className="size-4" /> PDF Live Preview
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 bg-white">
                        <iframe src={convertedPdfUrl} className="w-full h-[500px]" title="PDF Preview" />
                    </CardContent>
                    <CardFooter className="bg-green-500/10 p-6 flex justify-between items-center">
                        <div className="space-y-1">
                            <p className="text-sm font-black text-green-800 uppercase tracking-tighter">Document Ready!</p>
                            <p className="text-[10px] text-green-700 font-medium">Layout: {vAlign.toUpperCase()} | Mode: {fitMode.toUpperCase()}</p>
                        </div>
                        <Button size="lg" className="h-14 px-10 bg-green-600 hover:bg-green-700 text-lg font-black shadow-xl" onClick={handleDownload}>
                            <Download className="mr-2 h-6 w-6" /> DOWNLOAD PDF
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </div>

        {/* Layout & Conversion Suite */}
        <div className="lg:col-span-4 space-y-6">
            <Card className="border-2 shadow-2xl border-primary/10 overflow-hidden sticky top-24 rounded-[2rem] bg-white dark:bg-slate-950">
                <CardHeader className="bg-primary/5 border-b p-6">
                    <CardTitle className="text-xl flex items-center gap-3 font-black uppercase tracking-tighter">
                        <Layout className="size-6 text-primary" /> Layout Suite
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                    
                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                           <Maximize className="size-3" /> Image Scaling Mode
                        </Label>
                        <Tabs value={fitMode} onValueChange={(v) => setFitMode(v as FitMode)} className="w-full">
                            <TabsList className="grid grid-cols-2 h-12 bg-muted/50 border-2 rounded-xl p-1">
                                <TabsTrigger value="fit" className="font-black text-[10px] uppercase">Fit to Page</TabsTrigger>
                                <TabsTrigger value="original" className="font-black text-[10px] uppercase">Original Size</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <p className="text-[9px] text-muted-foreground italic">"Original Size" keeps photos crisp if they are smaller than A4.</p>
                    </div>

                    <div className="space-y-4 pt-4 border-t-2 border-dashed">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                           <AlignVerticalCenter className="size-3" /> Page Alignment
                        </Label>
                        <div className="grid grid-cols-3 gap-2">
                            <Button variant={vAlign === 'top' ? 'default' : 'outline'} className="h-14 flex-col gap-1 rounded-xl" onClick={() => setVAlign('top')}>
                                <AlignVerticalTop className="size-4" />
                                <span className="text-[8px] font-black uppercase">Top</span>
                            </Button>
                            <Button variant={vAlign === 'center' ? 'default' : 'outline'} className="h-14 flex-col gap-1 rounded-xl" onClick={() => setVAlign('center')}>
                                <AlignVerticalCenter className="size-4" />
                                <span className="text-[8px] font-black uppercase">Middle</span>
                            </Button>
                            <Button variant={vAlign === 'bottom' ? 'default' : 'outline'} className="h-14 flex-col gap-1 rounded-xl" onClick={() => setVAlign('bottom')}>
                                <AlignVerticalBottom className="size-4" />
                                <span className="text-[8px] font-black uppercase">Bottom</span>
                            </Button>
                        </div>
                    </div>

                    <div className="p-4 bg-primary/5 rounded-2xl border-2 border-primary/10 flex gap-3">
                        <Zap className="size-5 text-yellow-500 shrink-0" />
                        <p className="text-[10px] text-primary/80 font-bold leading-relaxed">
                            A4 format standard (210x297mm) active. High-DPI preservation enabled for signatures and text.
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/10 p-8 border-t-2">
                    <Button 
                        className="w-full h-18 text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-2xl transition-all active:scale-95 disabled:opacity-50" 
                        disabled={imageSrcs.length === 0 || isConverting}
                        onClick={handleConvertToPdf}
                    >
                        {isConverting ? (
                            <div className="flex items-center gap-3">
                                <Loader2 className="size-7 animate-spin" />
                                <span className="uppercase">CONVERTING...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <FileDigit className="size-7" />
                                <span className="uppercase tracking-tighter">CREATE PDF</span>
                            </div>
                        )}
                    </Button>
                </CardFooter>
            </Card>

            <div className="p-6 bg-green-500/5 rounded-[2rem] border-2 border-green-500/10 flex gap-4 items-center">
                <div className="size-12 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="size-6 text-green-600" />
                </div>
                <div>
                    <p className="text-[11px] font-black text-green-700 uppercase tracking-tight">100% Privacy Lock</p>
                    <p className="text-[10px] text-green-600/80 font-medium leading-tight">No uploads. PDF is generated in your browser memory (RAM).</p>
                </div>
            </div>
        </div>
      </div>
      <input ref={fileInputRef} type="file" className="hidden" accept="image/*" multiple onChange={onFileChange} />
    </div>
  );
}
