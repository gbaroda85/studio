"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Download, Loader2, FileOutput, ShieldCheck, Zap, Sparkles, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type OutputFormat = 'jpeg' | 'png' | 'webp';

type ImageConverterProps = {
  targetFormat: OutputFormat;
};

export default function ImageConverter({ targetFormat }: ImageConverterProps) {
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [convertedSrc, setConvertedSrc] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>(targetFormat);
  const [isConverting, setIsConverting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const title = `IMAGE TO ${outputFormat === 'jpeg' ? 'JPG' : outputFormat.toUpperCase()} CONVERTER`;
  const mimeType = `image/${outputFormat}`;

  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target?.result as string);
        setConvertedSrc(null);
      };
      reader.readAsDataURL(file);
    } else {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please select an image file.",
      });
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };

  const handleConvert = () => {
    if (!imageSrc) return;
    setIsConverting(true);
    
    const img = new window.Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        if (outputFormat === 'jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL(mimeType, 0.92);
        setConvertedSrc(dataUrl);
      }
      setIsConverting(false);
      toast({ title: "Success!", description: `Image transformed to ${outputFormat.toUpperCase()} perfectly.` });
    };
    img.onerror = () => {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load image.' });
        setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!convertedSrc || !imageFile) return;
    const link = document.createElement("a");
    link.href = convertedSrc;
    const name = imageFile.name.split(".").slice(0, -1).join(".");
    link.download = `${name}.${outputFormat === 'jpeg' ? 'jpg' : outputFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (!imageSrc) {
    return (
      <Card
        className={cn("w-full max-w-2xl text-center transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/20 hover:ring-2 hover:ring-primary/50 dark:hover:shadow-primary/10 border-2 border-dashed", isDragOver && "border-primary ring-4 ring-primary/20")}
        onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
      >
        <CardHeader>
          <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
            <FileOutput className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-black uppercase tracking-tight">{title}</CardTitle>
          <CardDescription>Drag & drop or Click to convert image to {outputFormat.toUpperCase()}.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-3 border-dashed border-muted-foreground/30 rounded-3xl p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group" onClick={() => fileInputRef.current?.click()}>
            <UploadCloud className="h-16 w-16 text-muted-foreground group-hover:text-primary transition-colors" />
            <div>
                <p className="text-xl font-bold">Drop photo here to begin</p>
                <p className="text-sm text-muted-foreground mt-2">100% Secure local processing. Instant output.</p>
            </div>
          </div>
          <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={onFileChange} />
        </CardContent>
        <CardFooter className="justify-center gap-6 text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8">
            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-green-500" /> NO SERVER UPLOADS</div>
            <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> INSTANT CONVERSION</div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl transition-all duration-300 hover:border-primary/50 hover:shadow-xl border-2 overflow-hidden">
      <CardHeader className="bg-muted/30 border-b">
        <CardTitle className="text-xl font-black flex items-center justify-between">
            <span className="uppercase tracking-tighter">{title}</span>
            {convertedSrc && <Badge className="bg-green-500 text-white font-black">CONVERTED</Badge>}
        </CardTitle>
        <CardDescription>Fine-tune format and download your result.</CardDescription>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-white border-2 shadow-inner group flex items-center justify-center">
            {convertedSrc ? (
                 <Image src={convertedSrc} alt="Converted" fill className="object-contain p-4 animate-in zoom-in-95 duration-500" />
            ) : (
                <Image src={imageSrc} alt="Original" fill className="object-contain p-4 grayscale opacity-40" />
            )}
            {isConverting && (
                <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary stroke-[3]" />
                    <p className="text-xs font-black text-primary uppercase tracking-widest">Transforming Pixels...</p>
                </div>
            )}
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 items-end">
            <div className="space-y-3">
                <Label htmlFor="format" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Target Format</Label>
                <Select value={outputFormat} onValueChange={(v) => { setOutputFormat(v as OutputFormat); setConvertedSrc(null); }} disabled={isConverting}>
                    <SelectTrigger id="format" className="h-12 font-bold border-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="jpeg" className="font-bold">JPEG (Universal)</SelectItem>
                        <SelectItem value="png" className="font-bold">PNG (Lossless)</SelectItem>
                        <SelectItem value="webp" className="font-bold">WEBP (Optimized)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {!convertedSrc ? (
                <Button onClick={handleConvert} disabled={isConverting} className="h-12 w-full text-lg font-black bg-primary shadow-lg">
                    {isConverting ? <Loader2 className="animate-spin mr-2"/> : <Zap className="mr-2 h-5 w-5 text-yellow-400 fill-yellow-400"/>}
                    START CONVERSION
                </Button>
            ) : (
                <Button onClick={handleDownload} className="h-12 w-full text-lg font-black bg-green-600 hover:bg-green-700 shadow-lg">
                    <Download className="mr-2 h-5 w-5"/>
                    DOWNLOAD FILE
                </Button>
            )}
        </div>
      </CardContent>
      <CardFooter className="bg-muted/10 border-t p-4 flex justify-between">
        <Button variant="ghost" onClick={() => { setImageSrc(null); setConvertedSrc(null); setImageFile(null); }} className="font-bold">
            <RefreshCcw className="mr-2 h-4 w-4" /> Change Image
        </Button>
        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase">
            <ShieldCheck className="h-4 w-4 text-green-500" /> Secure RAM Processing
        </div>
      </CardFooter>
    </Card>
  )
}
