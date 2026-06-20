
"use client";

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect, useMemo } from "react";
import Image from "next/image";
import { createWorker } from 'tesseract.js';
import * as pdfjs from 'pdfjs-dist';
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { 
    UploadCloud, 
    Loader2, 
    X, 
    FileScan, 
    Clipboard, 
    CheckCircle2, 
    Zap, 
    ShieldCheck, 
    Sparkles, 
    RefreshCcw, 
    SearchCode, 
    FileText, 
    Settings2, 
    Eye, 
    RotateCcw, 
    Languages, 
    BrainCircuit, 
    Wand2, 
    ImageIcon,
    Download,
    ArrowLeftRight,
    FileDigit,
    ListFilter,
    Clock,
    FileJson,
    Save,
    AlertCircle,
    CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import confetti from 'canvas-confetti';

const PDF_JS_VERSION = '4.2.67';
if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${PDF_JS_VERSION}/build/pdf.worker.min.mjs`;
}

const StarIcons = () => (
    <>
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`star-${i}`}>
                <svg viewBox="0 0 784.11 815.53" className="fill-white">
                    <path d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
                </svg>
            </div>
        ))}
    </>
);

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i];
}

/**
 * ADVANCED LOCAL CORRECTION ENGINE
 */
const correctOcrText = (text: string): string => {
    if (!text) return "";

    // 1. Protect Special Patterns (Email, Phone, GST, PAN, etc.)
    const placeholders: { [key: string]: string } = {};
    let counter = 0;
    
    const patterns = {
        email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        phone: /\b(\+?\d{1,3}[- ]?)?\d{10}\b/g,
        gstin: /\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}\b/g,
        pan: /\b[A-Z]{5}\d{4}[A-Z]{1}\b/g,
        currency: /[₹$£€]\s?\d+(?:,\d{3})*(?:\.\d{2})?/g,
        url: /\b(?:https?:\/\/|www\.)\S+\b/g
    };

    let cleaned = text;
    
    // Replace valid patterns with placeholders to prevent corruption
    Object.values(patterns).forEach(regex => {
        cleaned = cleaned.replace(regex, (match) => {
            const id = `__TOKEN_${counter++}__`;
            placeholders[id] = match;
            return id;
        });
    });

    // 2. OCR Character Confusion Fixes
    cleaned = cleaned
        // Fix O vs 0
        .replace(/([0-9])O([0-9])/g, '$10$2')
        .replace(/([A-Za-z])0([A-Za-z])/g, '$1O$2')
        // Fix I/l vs 1
        .replace(/([0-9])[Il]([0-9])/g, '$11$2')
        .replace(/([A-Za-z])1([A-Za-z])/g, '$1l$2')
        // Fix S vs 5
        .replace(/([0-9])S([0-9])/g, '$15$2')
        .replace(/([A-Za-z])5([A-Za-z])/g, '$1S$2')
        // Fix B vs 8
        .replace(/([0-9])B([0-9])/g, '$18$2')
        .replace(/([A-Za-z])8([A-Za-z])/g, '$1B$2');

    // 3. Punctuation & Spacing
    cleaned = cleaned
        .replace(/\s+/g, ' ')               // Remove multiple spaces
        .replace(/\s([.,!?;:])/g, '$1')      // Remove space before punctuation
        .replace(/([.,!?;:])(?=[A-Za-z])/g, '$1 ') // Ensure space after punctuation
        .replace(/([.,!?;:])\1+/g, '$1')     // Remove duplicate symbols (.... -> .)
        .replace(/(\n\s*){2,}/g, '\n\n');    // Preserve paragraph spacing

    // 4. Case Correction (Start of sentences)
    cleaned = cleaned.replace(/(^\s*|[.!?]\s+)([a-z])/g, (m) => m.toUpperCase());

    // 5. Restore Placeholders
    Object.keys(placeholders).forEach(id => {
        cleaned = cleaned.replace(id, placeholders[id]);
    });

    return cleaned.trim();
};

export default function ImageToTextConverter() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [rawText, setRawText] = useState<string | null>(null);
  const [correctedText, setCorrectedText] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [activeView, setActiveView] = useState<'corrected' | 'raw'>('corrected');
  
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [avgConfidence, setAvgConfidence] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const startTimeRef = useRef<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    if (file) {
      setFile(file);
      setRawText(null);
      setCorrectedText(null);
      setProgress(0);
      setStatusText("");
      setAvgConfidence(null);
      
      const reader = new FileReader();
      if (file.type === 'application/pdf') {
          setOriginalImageSrc(null); 
      } else {
          reader.onload = (e) => setOriginalImageSrc(e.target?.result as string);
          reader.readAsDataURL(file);
      }
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };

  const preprocessImage = (canvas: HTMLCanvasElement) => {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      let totalLuma = 0;
      for (let i = 0; i < data.length; i += 4) {
          totalLuma += (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      }
      const avgLuma = totalLuma / (data.length / 4);
      const threshold = avgLuma > 180 ? 190 : avgLuma < 80 ? 70 : 128;
      for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;
          const val = luma > threshold ? 255 : 0;
          data[i] = data[i + 1] = data[i + 2] = val;
      }
      ctx.putImageData(imageData, 0, 0);
  };

  const performOcr = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setRawText("");
    setCorrectedText("");
    setProgress(0);
    startTimeRef.current = Date.now();

    const worker = await createWorker('eng+hin+guj+mar', 1, {
        logger: (m) => {
            if (m.status === 'recognizing text') {
                const p = Math.round(m.progress * 100);
                setProgress(p);
                const elapsed = (Date.now() - startTimeRef.current) / 1000;
                if (p > 5) {
                    const totalEst = elapsed / (p / 100);
                    const remaining = Math.max(0, Math.round(totalEst - elapsed));
                    setTimeRemaining(`${remaining}s`);
                }
            }
        },
    });

    try {
        let finalOutput = "";
        let totalConfidence = 0;
        let confidenceCounts = 0;

        if (file.type === 'application/pdf') {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjs.getDocument({ 
                data: new Uint8Array(arrayBuffer),
                cMapUrl: `https://unpkg.com/pdfjs-dist@${PDF_JS_VERSION}/cmaps/`,
                cMapPacked: true
            }).promise;
            
            setTotalPages(pdf.numPages);
            
            for (let i = 1; i <= pdf.numPages; i++) {
                setCurrentPage(i);
                setStatusText(`Scanning Page ${i} of ${pdf.numPages}...`);
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2.5 }); 
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d', { willReadFrequently: true });
                if (context) {
                    canvas.height = viewport.height; canvas.width = viewport.width;
                    context.fillStyle = '#FFFFFF'; context.fillRect(0, 0, canvas.width, canvas.height);
                    await page.render({ canvasContext: context, viewport }).promise;
                    preprocessImage(canvas);
                    const { data: { text, confidence } } = await worker.recognize(canvas);
                    finalOutput += `--- PAGE ${i} ---\n\n${text}\n\n`;
                    totalConfidence += confidence;
                    confidenceCounts++;
                    canvas.width = 0; canvas.height = 0;
                }
            }
            setAvgConfidence(Math.round(totalConfidence / confidenceCounts));
        } else {
            setTotalPages(1);
            setCurrentPage(1);
            setStatusText("Enhancing Resolution...");
            const img = new window.Image();
            img.src = originalImageSrc!;
            await new Promise(r => img.onload = r);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (ctx) {
                const scale = Math.max(1, 2000 / Math.max(img.width, img.height));
                canvas.width = img.width * scale; canvas.height = img.height * scale;
                ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                preprocessImage(canvas);
                setStatusText("Reading Text...");
                const { data: { text, confidence } } = await worker.recognize(canvas);
                finalOutput = text;
                setAvgConfidence(confidence);
            }
        }

        setRawText(finalOutput);
        setStatusText("Applying Advanced Correction...");
        const corrected = correctOcrText(finalOutput);
        setCorrectedText(corrected);
        
        setProgress(100);
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        toast({ title: "Clean Extraction Success" });
    } catch (error: any) {
        console.error(error);
        toast({ variant: "destructive", title: "OCR Error" });
    } finally {
        await worker.terminate();
        setIsProcessing(false);
        setStatusText("");
        setTimeRemaining(null);
    }
  };

  const activeText = activeView === 'corrected' ? correctedText : rawText;

  const handleCopyToClipboard = () => {
    if (!activeText) return;
    navigator.clipboard.writeText(activeText);
    setHasCopied(true);
    toast({ title: 'Copied!' });
    setTimeout(() => setHasCopied(false), 2000);
  };

  const downloadTxt = () => {
      if (!activeText) return;
      const blob = new Blob([activeText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `GR7-OCR-${activeView.toUpperCase()}-${Date.now()}.txt`;
      link.click();
  };

  const downloadPdf = () => {
      if (!activeText) return;
      const doc = new jsPDF();
      const splitText = doc.splitTextToSize(activeText, 180);
      doc.text(splitText, 15, 20);
      doc.save(`GR7-OCR-${activeView.toUpperCase()}-${Date.now()}.pdf`);
  };

  const downloadDocx = async () => {
      if (!activeText) return;
      const doc = new Document({
          sections: [{
              children: activeText.split('\n').map(line => new Paragraph({
                  children: [new TextRun(line)]
              }))
          }]
      });
      const buffer = await Packer.toBlob(doc);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(buffer);
      link.download = `GR7-OCR-Export-${Date.now()}.docx`;
      link.click();
  };

  const stats = useMemo(() => {
    const target = activeText || "";
    return {
        chars: target.length,
        words: target.trim().split(/\s+/).filter(w => w.length > 0).length,
        lines: target.split('\n').filter(l => l.trim().length > 0).length
    };
  }, [activeText]);

  return (
    <div className="w-full max-w-7xl animate-in fade-in duration-700 px-4 flex flex-col gap-6 mx-auto">
      
      {!file ? (
          <div className="w-full max-w-4xl py-10 flex flex-col items-center justify-center gap-6 mx-auto text-left">
            <Card className={cn(
                "w-full max-w-2xl glass-card overflow-hidden transition-all duration-300 border-2 border-dashed shadow-2xl rounded-[3rem] hover:border-primary/50 cursor-pointer select-none",
                isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.01]"
            )}
                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <CardHeader className="bg-muted/30 border-b p-6 text-center">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">STUDIO WORKSPACE</CardTitle>
                </CardHeader>
                <CardContent className="p-8 md:p-12">
                    <div className="border-4 border-dashed border-muted-foreground/20 rounded-[2rem] p-6 md:p-12 flex flex-col items-center justify-center space-y-4 bg-muted/30 group relative">
                        <div className="relative">
                            <UploadCloud className="size-14 md:size-20 text-muted-foreground group-hover:text-primary transition-colors" />
                            <Zap className="absolute -top-1 -right-1 size-5 md:size-6 text-yellow-500 animate-pulse" />
                        </div>
                        <div className="text-center px-4">
                            <p className="text-lg md:text-xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Drop File or Image here</p>
                            <p className="text-[10px] md:text-sm text-muted-foreground mt-2 font-bold opacity-60 uppercase">PDF, JPG, PNG & more. 100% Private.</p>
                        </div>
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,image/*" onChange={onFileChange} />
                </CardContent>
                <CardFooter className="justify-center gap-6 text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 bg-muted/10 pt-6 px-4">
                    <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-600" /> SECURE RAM</div>
                    <div className="flex items-center gap-1.5"><SearchCode className="size-3 text-primary" /> LOCAL ENGINE</div>
                    <div className="flex items-center gap-1.5"><Languages className="size-3 text-purple-500" /> MULTI-LANG</div>
                </CardFooter>
            </Card>
          </div>
      ) : (
          <div className="w-full flex flex-col gap-6 animate-in slide-in-from-bottom-6 duration-500">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                <div className="flex items-center gap-3">
                    <div className="size-10 md:size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-lg border border-primary/20 shrink-0">
                        <Settings2 className="size-5 md:size-6" />
                    </div>
                    <div className="text-left">
                        <h2 className="text-lg md:text-2xl font-black uppercase tracking-tighter leading-none">Studio <span className="text-primary">Panel</span></h2>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-40 mt-1">Unlimited Browser OCR</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button variant="outline" onClick={handleReset} className="flex-1 md:flex-none h-11 md:h-12 border-2 font-black text-[9px] md:text-[10px] uppercase px-6 rounded-xl hover:bg-destructive/5 hover:text-destructive">
                        <RotateCcw className="mr-1.5 size-3 md:size-4" /> Change File
                    </Button>
                    <Button 
                        size="lg" 
                        className="relative flex items-center justify-between gap-0 p-0 overflow-hidden bg-[#00aeef] hover:bg-[#009bd1] text-white font-black rounded-xl transition-all duration-300 group h-14 md:h-12 flex-[2] md:flex-none shadow-[0_8px_20px_-10px_rgba(0,174,239,0.5)] border-none" 
                        onClick={handleCopyToClipboard} 
                        disabled={!activeText}
                    >
                        <div className="absolute left-4 w-0.5 h-6 md:h-8 bg-white/40 rounded-full" />
                        <span className="flex-1 px-10 text-center tracking-widest text-[10px] md:text-xs uppercase">{hasCopied ? "COPIED" : "COPY TEXT"}</span>
                        <div className="bg-white h-full pl-6 pr-8 flex items-center justify-center text-[#00aeef] transition-all group-hover:pl-7 group-hover:pr-9 relative" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)', marginLeft: '-15px' }}>
                            <Clipboard className="size-6 group-hover:scale-110 transition-transform" />
                        </div>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7">
                    <Card className="overflow-hidden border-2 shadow-3xl h-full flex flex-col bg-card/50 rounded-[2.5rem]">
                        <CardHeader className="bg-muted/30 border-b py-3 px-6 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4 text-primary" />
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">SCANNING VIEWPORT</CardTitle>
                            </div>
                            <Badge className="bg-primary text-white font-black text-[9px] px-3 py-1 rounded-full border-2 border-white shadow-md uppercase">{file.name}</Badge>
                        </CardHeader>
                        <CardContent className="p-6 md:p-10 lg:p-12 flex-1 bg-slate-100 dark:bg-slate-900/50 shadow-inner min-h-[500px] flex flex-col items-center justify-center relative">
                            {isProcessing ? (
                                <div className="w-full max-w-sm space-y-8 animate-in zoom-in-95">
                                    <div className="relative flex flex-col items-center justify-center gap-4">
                                        <div className="relative">
                                            <Loader2 className="size-20 md:size-24 animate-spin text-primary stroke-[3] opacity-20" />
                                            <BrainCircuit className="absolute inset-0 m-auto size-8 md:size-10 text-primary animate-pulse" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xl md:text-2xl font-black text-primary uppercase tracking-tighter animate-pulse">{statusText}</p>
                                            {timeRemaining && <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">EST. TIME: {timeRemaining}</p>}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Progress value={progress} className="h-1.5 shadow-inner" />
                                        <div className="flex justify-between text-[8px] font-black uppercase opacity-40 tracking-widest">
                                            <span>MAPPING VECTORS</span>
                                            <span>{progress}%</span>
                                        </div>
                                    </div>
                                    {totalPages > 1 && (
                                        <div className="flex justify-center gap-1.5">
                                            {Array.from({ length: totalPages }).map((_, i) => (
                                                <div key={i} className={cn("size-2 rounded-full transition-all", i + 1 === currentPage ? "bg-primary scale-125 shadow-lg" : "bg-muted")} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : originalImageSrc ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative w-full h-full max-h-[600px] flex items-center justify-center">
                                    <img src={originalImageSrc} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border-4 border-white" alt="source" />
                                </motion.div>
                            ) : file.type === 'application/pdf' ? (
                                <div className="flex flex-col items-center gap-6 opacity-30 text-center">
                                    <FileDigit className="size-24 md:size-32 text-primary/20" />
                                    <div className="space-y-1">
                                        <p className="text-xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">PDF Multi-Page Ready</p>
                                        <p className="text-[10px] md:text-sm font-bold uppercase">Click 'Extract' to scan all pages.</p>
                                    </div>
                                </div>
                            ) : null}
                        </CardContent>
                        <CardFooter className="bg-white dark:bg-slate-950 border-t p-6 md:p-8 flex justify-center gap-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 shrink-0">
                             <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-green-500" /> SECURE LOCAL HANDSHAKE</div>
                             <div className="flex items-center gap-2"><ImageIcon className="size-4 text-primary" /> NO DATA LOGS</div>
                        </CardFooter>
                    </Card>
                </div>

                <div className="lg:col-span-5 space-y-6">
                    <Card className="glass-panel border-none shadow-2xl overflow-hidden rounded-[2.5rem]">
                        <CardHeader className="bg-primary/5 border-b border-white/10 p-6 md:p-8 text-left">
                             <div className="flex items-center justify-between">
                                <CardTitle className="text-base md:text-lg flex items-center gap-3 font-black uppercase tracking-tighter text-primary">
                                    <Settings2 className="size-4 md:size-5 text-primary" /> Text Studio
                                </CardTitle>
                                {avgConfidence !== null && (
                                    <div className={cn(
                                        "px-3 py-1 rounded-full border-2 text-[8px] font-black uppercase flex items-center gap-1.5",
                                        avgConfidence > 85 ? "bg-green-500/10 text-green-700 border-green-500/20" : 
                                        avgConfidence > 65 ? "bg-yellow-500/10 text-yellow-700 border-yellow-500/20" : 
                                        "bg-rose-500/10 text-rose-700 border-rose-500/20"
                                    )}>
                                        <ShieldCheck className="size-3" /> {avgConfidence}% Accuracy
                                    </div>
                                )}
                             </div>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8 space-y-8">
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Engine Actions</Label>
                                    <Button 
                                        className="magic-button w-full h-16 md:h-20 text-lg font-black bg-primary hover:bg-transparent border-4 border-primary text-white hover:text-primary rounded-full transition-all active:scale-95 disabled:opacity-50 group flex items-center justify-center gap-4 px-10 shadow-2xl" 
                                        onClick={performOcr}
                                        disabled={isProcessing || !!rawText}
                                    >
                                        <StarIcons />
                                        {isProcessing ? "PROCESSING PIXELS..." : (
                                            <div className="flex items-center gap-3">
                                                <Wand2 className="size-7 md:size-8 text-yellow-400 fill-yellow-400 group-hover:scale-125 transition-transform" />
                                                <span className="uppercase tracking-tighter text-lg md:text-2xl font-black">EXTRACT TEXT</span>
                                            </div>
                                        )}
                                    </Button>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-white/10 text-left">
                                    <div className="flex justify-between items-center px-1">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Result Content</Label>
                                        {activeText && <Badge variant="secondary" className="bg-primary/10 text-primary font-black text-[8px] uppercase">{stats.words} WORDS</Badge>}
                                    </div>
                                    
                                    <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)} className="w-full">
                                        <TabsList className="grid w-full grid-cols-2 h-11 bg-muted/20 border-2 rounded-xl mb-4">
                                            <TabsTrigger value="corrected" className="text-[9px] font-black uppercase flex items-center gap-2">
                                                <CheckCircle className="size-3 text-green-500" /> CLEANED VIEW
                                            </TabsTrigger>
                                            <TabsTrigger value="raw" className="text-[9px] font-black uppercase flex items-center gap-2">
                                                <FileText className="size-3 text-muted-foreground" /> RAW OUTPUT
                                            </TabsTrigger>
                                        </TabsList>
                                        
                                        <div className="relative group">
                                            <Textarea 
                                                value={activeText || ""} 
                                                readOnly={!activeText || isProcessing}
                                                onChange={(e) => activeView === 'corrected' ? setCorrectedText(e.target.value) : setRawText(e.target.value)}
                                                placeholder={isProcessing ? "Optimizing characters..." : "Text will appear here after extraction..."}
                                                className={cn(
                                                    "min-h-[300px] md:min-h-[400px] text-sm font-bold border-2 rounded-[1.5rem] bg-background/50 focus-visible:ring-primary/20 shadow-inner p-5 custom-scrollbar text-slate-800 dark:text-slate-100",
                                                    activeView === 'corrected' && "bg-green-500/[0.02]"
                                                )}
                                            />
                                            {activeText && (
                                                <div className="absolute bottom-4 right-4 flex flex-col gap-2 animate-in fade-in slide-in-from-right-2">
                                                    <Button size="icon" variant="secondary" className="h-10 w-10 rounded-xl shadow-xl bg-white dark:bg-slate-800 border-2" onClick={handleCopyToClipboard}>
                                                        {hasCopied ? <CheckCircle2 className="size-5 text-green-600" /> : <Clipboard className="size-5" />}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </Tabs>
                                </div>
                                
                                {activeText && (
                                    <div className="space-y-4 pt-4 border-t border-white/10 text-left animate-in slide-in-from-bottom-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                            <Download className="size-3" /> Export Cleaned File
                                        </Label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <Button variant="outline" className="h-10 text-[9px] font-black uppercase rounded-lg border-2" onClick={downloadTxt}>TXT</Button>
                                            <Button variant="outline" className="h-10 text-[9px] font-black uppercase rounded-lg border-2" onClick={downloadPdf}>PDF</Button>
                                            <Button variant="outline" className="h-10 text-[9px] font-black uppercase rounded-lg border-2" onClick={downloadDocx}>DOCX</Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-5 bg-green-500/5 rounded-[1.5rem] border-2 border-green-500/10 flex gap-4 text-left shadow-sm">
                                <ShieldCheck className="size-6 text-green-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-black text-green-700 uppercase tracking-tight">Active Cleanup Engine</p>
                                    <p className="text-[8px] text-green-600/80 font-medium leading-relaxed uppercase mt-1">
                                        Spelling, punctuation, and character confusion (O/0) are auto-corrected using local patterns.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/10 p-6 md:p-8 border-t border-white/10 flex flex-col gap-4">
                             <div className="grid grid-cols-3 gap-4 w-full text-center">
                                <div><p className="text-[8px] font-black opacity-30 uppercase">Chars</p><p className="text-xs font-black">{stats.chars}</p></div>
                                <div><p className="text-[8px] font-black opacity-30 uppercase">Words</p><p className="text-xs font-black">{stats.words}</p></div>
                                <div><p className="text-[8px] font-black opacity-30 uppercase">Lines</p><p className="text-xs font-black">{stats.lines}</p></div>
                             </div>
                             <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-30 text-center">Local Neural Pipeline Active</p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
          </div>
      )}

    </div>
  );
}

