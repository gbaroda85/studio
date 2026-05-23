
"use client";

import { useState, useRef, type ChangeEvent, type DragEvent, useEffect } from "react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import { UploadCloud, Download, FileDigit, X, Loader2, ShieldCheck, Zap, Layers, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function ImageToPdfConverter() {
  const { toast } = useToast();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageSrcs, setImageSrcs] = useState<string[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [convertedPdfUrl, setConvertedPdfUrl] = useState<string | null>(null);
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

  const handleConvertToPdf = () => {
    if (imageFiles.length === 0) return;
    setIsConverting(true);

    const pdf = new jsPDF();
    let processedImages = 0;
    
    new Promise<string>((resolve) => {
        imageSrcs.forEach((src, index) => {
            const img = new window.Image();
            img.src = src;
            img.onload = () => {
                if (index > 0) {
                    pdf.addPage();
                }
                const imgProps = pdf.getImageProperties(img);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const widthRatio = pdfWidth / imgProps.width;
                const heightRatio = pdfHeight / imgProps.height;
                const ratio = Math.min(widthRatio, heightRatio);
                const imgWidth = imgProps.width * ratio;
                const imgHeight = imgProps.height * ratio;
                const x = (pdfWidth - imgWidth) / 2;
                const y = (pdfHeight - imgHeight) / 2;
                pdf.addImage(img, 'PNG', x, y, imgWidth, imgHeight, undefined, 'FAST');
                
                processedImages++;
                if (processedImages === imageFiles.length) {
                    const pdfBlob = pdf.output('blob');
                    const url = URL.createObjectURL(pdfBlob);
                    resolve(url);
                }
            }
            img.onerror = () => {
                processedImages++;
                if (processedImages === imageFiles.length) {
                    const pdfBlob = pdf.output('blob');
                    const url = URL.createObjectURL(pdfBlob);
                    resolve(url);
                }
            }
        });
    }).then(url => {
        setConvertedPdfUrl(url);
        toast({ title: "Success!", description: "Combined into a single PDF." });
        setIsConverting(false);
    });
  };
  
  const handleDownload = () => {
      if (!convertedPdfUrl) return;
      const link = document.createElement('a');
      link.href = convertedPdfUrl;
      link.download = `combined-images-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  }

  return (
    <Card className={cn("w-full max-w-4xl transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.01] hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/20 hover:ring-2 hover:ring-primary/50 dark:hover:shadow-primary/10 border-2 overflow-hidden", isDragOver && "border-primary ring-4 ring-primary/20")}
      onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
      <CardHeader className="bg-muted/30 border-b">
        <CardTitle className="text-2xl font-black flex items-center justify-between">
            <span className="uppercase tracking-tighter">IMAGE TO PDF CONVERTER</span>
            {imageSrcs.length > 0 && <Badge variant="secondary" className="font-bold">{imageSrcs.length} Files Selected</Badge>}
        </CardTitle>
        <CardDescription>Combine multiple photos into one secure document.</CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        {imageSrcs.length === 0 ? (
          <div className="border-3 border-dashed border-muted-foreground/30 rounded-3xl p-20 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group" onClick={() => fileInputRef.current?.click()}>
            <UploadCloud className="h-16 w-16 text-muted-foreground group-hover:text-primary transition-colors" />
            <div className="text-center">
                <p className="text-xl font-bold">Drop multiple images or Click to upload</p>
                <p className="text-sm text-muted-foreground mt-2">Compatible with JPG, PNG, and WebP.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {imageSrcs.map((src, index) => (
                <div key={index} className="relative group aspect-square rounded-2xl overflow-hidden border-2 shadow-sm bg-white">
                    <Image src={src} alt={`preview-${index}`} fill className="object-cover p-1" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full" onClick={() => handleRemoveImage(index)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded font-bold">Page {index + 1}</div>
                </div>
                ))}
                <button className="border-2 border-dashed border-muted-foreground/30 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-muted/50 hover:border-primary transition-all aspect-square" onClick={() => fileInputRef.current?.click()}>
                    <UploadCloud className="h-6 w-6 text-muted-foreground" />
                    <span className="text-[10px] font-black uppercase text-muted-foreground">Add More</span>
                </button>
            </div>
            
            <div className="p-4 bg-primary/5 rounded-2xl border-2 border-primary/10 flex items-center gap-3">
                <Zap className="size-5 text-yellow-500 fill-yellow-500" />
                <p className="text-xs font-bold text-primary/80">Tip: Drag or add files in the order you want them to appear in the PDF document.</p>
            </div>
          </div>
        )}
        <input ref={fileInputRef} type="file" className="hidden" accept="image/*" multiple onChange={onFileChange} />
      </CardContent>
      <CardFooter className="bg-muted/10 border-t p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
         <div className="flex items-center gap-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            <div className="flex items-center gap-1.5"><ShieldCheck className="size-4 text-green-500" /> 100% PRIVATE</div>
            <div className="flex items-center gap-1.5"><Layers className="size-4 text-blue-500" /> BUNDLE SUPPORT</div>
         </div>
         <div className="flex gap-3 w-full sm:w-auto">
            {imageSrcs.length > 0 && <Button variant="outline" onClick={handleReset} className="h-12 border-2 font-black uppercase text-xs">Clear Workspace</Button>}
            
            {!convertedPdfUrl ? (
                <Button onClick={handleConvertToPdf} disabled={isConverting || imageFiles.length === 0} className="h-12 flex-1 sm:flex-none px-10 text-lg font-black bg-primary shadow-xl">
                    {isConverting ? <Loader2 className="mr-2 animate-spin" /> : <FileDigit className="mr-2 h-5 w-5" />}
                    {isConverting ? "GENERATING..." : "CREATE PDF"}
                </Button>
            ) : (
                <Button onClick={handleDownload} className="h-12 flex-1 sm:flex-none px-10 text-lg font-black bg-green-600 hover:bg-green-700 shadow-xl animate-in zoom-in-95">
                    <Download className="mr-2 h-5 w-5" />
                    DOWNLOAD PDF
                </Button>
            )}
         </div>
      </CardFooter>
    </Card>
  );
}
