
"use client";

import { useState, useRef, type ChangeEvent, type DragEvent, useCallback, useEffect, useMemo } from "react";
import { 
    UploadCloud, 
    Printer, 
    X, 
    Loader2, 
    ShieldCheck, 
    Zap, 
    RotateCcw,
    CheckCircle2,
    FileText,
    ChevronRight,
    Lock,
    Eye,
    EyeOff,
    LayoutGrid,
    Smartphone,
    RefreshCcw,
    ArrowLeft,
    Move,
    Scan,
    Maximize,
    Settings2,
    Download,
    AlignVerticalJustifyStart,
    AlignVerticalJustifyCenter,
    AlignVerticalJustifyEnd,
    Square,
    Sparkles,
    Trash2,
    Monitor,
    AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import * as pdfjs from 'pdfjs-dist';
import ReactCrop, { type Crop as CropType, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';

if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.mjs`;
}

// --- PHYSICAL CONSTANTS (MM) ---
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const CARD_WIDTH_MM = 85.6;
const CARD_HEIGHT_MM = 54;
const GAP_MM = 4;
const PRINT_MARGIN_MM = 20;

type Workflow = 'a4' | 'separate';
type Stage = 'selection' | 'upload' | 'password' | 'refine' | 'preview';
type CropMode = 'rect' | 'scanner';
type VAlign = 'top' | 'center' | 'bottom';

interface Point { x: number; y: number; }

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

export default function AadhaarPrinter() {
  const { toast } = useToast();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [stage, setStage] = useState<Stage>('selection');
  const [cropMode, setCropMode] = useState<CropMode>('scanner');
  const [vAlign, setVAlign] = useState<VAlign>('center');
  const [showBorder, setShowBorder] = useState(true);
  
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [originalA4Src, setOriginalA4Src] = useState<string | null>(null);

  const [frontRaw, setFrontRaw] = useState<string | null>(null);
  const [backRaw, setBackRaw] = useState<string | null>(null);
  const [refiningSide, setRefiningSide] = useState<'front' | 'back' | null>(null);

  const [frontFinal, setFrontFinal] = useState<string | null>(null);
  const [backFinal, setBackFinal] = useState<string | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const [rectCrop, setRectCrop] = useState<CropType>();
  const [completedRectCrop, setCompletedRectCrop] = useState<PixelCrop>();

  const [points, setPoints] = useState<Point[]>([
    { x: 15, y: 15 }, { x: 50, y: 15 }, { x: 85, y: 15 }, 
    { x: 85, y: 50 }, { x: 85, y: 85 },                   
    { x: 50, y: 85 }, { x: 15, y: 85 },                   
    { x: 15, y: 50 }                                      
  ]);
  const [draggingPoint, setDraggingPoint] = useState<number | null>(null);
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const studioPrintRef = useRef<HTMLDivElement>(null);

  const calculateA4Positions = useCallback((alignment: VAlign) => {
      const totalContentH = (CARD_HEIGHT_MM * 2) + GAP_MM;
      const x = (A4_WIDTH_MM - CARD_WIDTH_MM) / 2;
      let y = 0;

      if (alignment === 'top') {
          y = PRINT_MARGIN_MM;
      } else if (alignment === 'bottom') {
          y = A4_HEIGHT_MM - totalContentH - PRINT_MARGIN_MM;
      } else {
          y = (A4_HEIGHT_MM - totalContentH) / 2;
      }

      return {
          front: { x, y },
          back: { x, y: y + CARD_HEIGHT_MM + GAP_MM },
          page: { w: A4_WIDTH_MM, h: A4_HEIGHT_MM }
      };
  }, []);

  const pos = useMemo(() => calculateA4Positions(vAlign), [vAlign, calculateA4Positions]);

  const handleSelection = (mode: Workflow) => {
    setWorkflow(mode);
    setStage('upload');
  };

  const processPdfWithPassword = async (buffer: ArrayBuffer, pass: string = "") => {
    setIsProcessing(true);
    try {
        const bufferCopy = buffer.slice(0);
        const loadingTask = pdfjs.getDocument({ 
            data: new Uint8Array(bufferCopy),
            password: pass,
            cMapUrl: 'https://unpkg.com/pdfjs-dist@4.2.67/cmaps/',
            cMapPacked: true
        });
        
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 3.0 }); 
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Canvas init failed");

        canvas.height = viewport.height;
        canvas.width = viewport.width;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        await page.render({ canvasContext: ctx, viewport }).promise;
        setOriginalA4Src(canvas.toDataURL('image/jpeg', 0.98));
        setStage('refine');
        resetPoints();
    } catch (error: any) {
        if (error.name === 'PasswordException' || error.message?.toLowerCase().includes('password')) {
            setStage('password');
            toast({ title: "Locked PDF", description: "Password required for decryption." });
        } else {
            toast({ variant: 'destructive', title: 'Processing Failed' });
        }
    } finally {
        setIsProcessing(false);
    }
  };

  const handleFile = (file: File, side?: 'front' | 'back') => {
    if (workflow === 'a4') {
        if (file.type === 'application/pdf') {
            const reader = new FileReader();
            reader.onload = (e) => {
                const buffer = e.target?.result as ArrayBuffer;
                setPdfBuffer(buffer);
                processPdfWithPassword(buffer);
            };
            reader.readAsArrayBuffer(file);
        } else if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setOriginalA4Src(e.target?.result as string);
                setStage('refine');
                resetPoints();
            };
            reader.readAsDataURL(file);
        }
    } else {
        const reader = new FileReader();
        reader.onload = (e) => {
            const src = e.target?.result as string;
            if (side === 'front') setFrontRaw(src);
            else setBackRaw(src);
        };
        reader.readAsDataURL(file);
    }
  };

  const resetPoints = () => {
    setPoints([
        { x: 15, y: 15 }, { x: 50, y: 15 }, { x: 85, y: 15 },
        { x: 85, y: 50 }, { x: 85, y: 85 },
        { x: 50, y: 85 }, { x: 15, y: 85 },
        { x: 15, y: 50 }
    ]);
  };

  const solvePerspective = (src: Point[], dst: Point[]) => {
    const p = [];
    for (let i = 0; i < 4; i++) {
        p.push([src[i].x, src[i].y, 1, 0, 0, 0, -src[i].x * dst[i].x, -src[i].y * dst[i].x, dst[i].x]);
        p.push([0, 0, 0, src[i].x, src[i].y, 1, -src[i].x * dst[i].y, -src[i].y * dst[i].y, dst[i].y]);
    }
    const n = 8;
    for (let i = 0; i < n; i++) {
        let max = i;
        for (let j = i + 1; j < n; j++) if (Math.abs(p[j][i]) > Math.abs(p[max][i])) max = j;
        const temp = p[i]; p[i] = p[max]; p[max] = temp;
        for (let j = i + 1; j < n; j++) {
            const f = p[j][i] / p[i][i];
            for (let k = i; k <= n; k++) p[j][k] -= f * p[i][k];
        }
    }
    const x = new Array(n);
    for (let i = n - 1; i >= 0; i--) {
        let s = 0;
        for (let j = i + 1; j < n; j++) s += p[i][j] * x[j];
        x[i] = (p[i][n] - s) / p[i][i];
    }
    return x;
  };

  const handleFinalizeCrop = async () => {
    const image = imgRef.current;
    if (!image || !image.naturalWidth) return;
    setIsProcessing(true);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let finalData = "";
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    if (cropMode === 'scanner') {
        const srcPoints = [points[0], points[2], points[4], points[6]].map(p => ({ 
            x: p.x * (image.naturalWidth / 100), 
            y: p.y * (image.naturalHeight / 100) 
        }));
        
        const w1 = Math.hypot(srcPoints[1].x - srcPoints[0].x, srcPoints[1].y - srcPoints[0].y);
        const w2 = Math.hypot(srcPoints[2].x - srcPoints[3].x, srcPoints[2].y - srcPoints[3].y);
        const h1 = Math.hypot(srcPoints[3].x - srcPoints[0].x, srcPoints[3].y - srcPoints[0].y);
        const h2 = Math.hypot(srcPoints[2].x - srcPoints[1].x, srcPoints[2].y - srcPoints[1].y);
        
        const targetWidth = Math.max(10, Math.floor(Math.max(w1, w2)));
        const targetHeight = Math.max(10, Math.floor(Math.max(h1, h2)));
        
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const dstPoints = [{ x: 0, y: 0 }, { x: targetWidth, y: 0 }, { x: targetWidth, y: targetHeight }, { x: 0, y: targetHeight }];
        const h = solvePerspective(dstPoints, srcPoints);
        const imgData = ctx.createImageData(targetWidth, targetHeight);
        
        const srcCanvas = document.createElement('canvas');
        srcCanvas.width = image.naturalWidth; srcCanvas.height = image.naturalHeight;
        srcCanvas.getContext('2d')?.drawImage(image, 0, 0);
        const srcPixels = srcCanvas.getContext('2d')?.getImageData(0, 0, image.naturalWidth, image.naturalHeight).data;

        if (srcPixels) {
            for (let y = 0; y < targetHeight; y++) {
                for (let x = 0; x < targetWidth; x++) {
                    const z = h[6] * x + h[7] * y + 1;
                    const sx = Math.floor((h[0] * x + h[1] * y + h[2]) / z);
                    const sy = Math.floor((h[3] * x + h[4] * y + h[5]) / z);
                    if (sx >= 0 && sx < image.naturalWidth && sy >= 0 && sy < image.naturalHeight) {
                        const di = (y * targetWidth + x) * 4, si = (sy * image.naturalWidth + sx) * 4;
                        imgData.data[di] = srcPixels[si]; imgData.data[di+1] = srcPixels[si+1]; imgData.data[di+2] = srcPixels[si+2]; imgData.data[di+3] = srcPixels[si+3];
                    }
                }
            }
            ctx.putImageData(imgData, 0, 0);
        }
        finalData = canvas.toDataURL("image/png");
    } else {
        if (!completedRectCrop) return;
        canvas.width = Math.max(10, completedRectCrop.width * scaleX);
        canvas.height = Math.max(10, completedRectCrop.height * scaleY);
        ctx.drawImage(image, completedRectCrop.x * scaleX, completedRectCrop.y * scaleY, completedRectCrop.width * scaleX, completedRectCrop.height * scaleY, 0, 0, canvas.width, canvas.height);
        finalData = canvas.toDataURL("image/png");
    }

    if (workflow === 'a4') {
        const cardImg = new window.Image();
        cardImg.src = finalData;
        cardImg.onload = () => {
            const halfWidth = cardImg.width / 2;
            const fCanvas = document.createElement("canvas");
            fCanvas.width = halfWidth; fCanvas.height = cardImg.height;
            fCanvas.getContext("2d")?.drawImage(cardImg, 0, 0, halfWidth, cardImg.height, 0, 0, halfWidth, cardImg.height);
            setFrontFinal(fCanvas.toDataURL("image/png"));
            const bCanvas = document.createElement("canvas");
            bCanvas.width = halfWidth; bCanvas.height = cardImg.height;
            bCanvas.getContext("2d")?.drawImage(cardImg, halfWidth, 0, halfWidth, cardImg.height, 0, 0, halfWidth, cardImg.height);
            setBackFinal(bCanvas.toDataURL("image/png"));
            setStage('preview');
        };
    } else {
        if (refiningSide === 'front') setFrontFinal(finalData);
        else setBackFinal(finalData);
        setRefiningSide(null);
        setStage('upload');
    }
    setIsProcessing(false);
  };

  const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (draggingPoint === null || !containerRef.current || !points[draggingPoint]) return;
    const rect = containerRef.current.getBoundingClientRect();
    let cx, cy;
    if ('touches' in e) { cx = e.touches[0].clientX; cy = e.touches[0].clientY; }
    else { cx = (e as React.MouseEvent).clientX; cy = (e as React.MouseEvent).clientY; }
    const x = Math.max(0, Math.min(100, ((cx - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((cy - rect.top) / rect.height) * 100));
    setMagnifierPos({ x, y });
    setPoints(prev => {
        const next = [...prev];
        const idx = draggingPoint;
        if (idx === null || !next[idx]) return prev;
        if ([0, 2, 4, 6].includes(idx)) next[idx] = { x, y };
        else {
            if (idx === 1) { next[0].y = y; next[2].y = y; } 
            else if (idx === 3) { next[2].x = x; next[4].x = x; } 
            else if (idx === 5) { next[6].y = y; next[4].y = y; } 
            else if (idx === 7) { next[0].x = x; next[6].x = x; } 
        }
        next[1] = { x: (next[0].x + next[2].x) / 2, y: (next[0].y + next[2].y) / 2 };
        next[3] = { x: (next[2].x + next[4].x) / 2, y: (next[2].y + next[4].y) / 2 };
        next[5] = { x: (next[4].x + next[6].x) / 2, y: (next[4].y + next[6].y) / 2 };
        next[7] = { x: (next[6].x + next[0].x) / 2, y: (next[6].y + next[0].y) / 2 };
        return next;
    });
  }, [draggingPoint, points]);

  const handlePointDown = (idx: number, e: React.MouseEvent | React.TouchEvent) => {
    setDraggingPoint(idx);
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    let cx, cy;
    if ('touches' in e) { cx = e.touches[0].clientX; cy = e.touches[0].clientY; }
    else { cx = (e as React.MouseEvent).clientX; cy = (e as React.MouseEvent).clientY; }
    setMagnifierPos({ x: ((cx - rect.left) / rect.width) * 100, y: ((cy - rect.top) / rect.height) * 100 });
  };

  const handleReset = () => {
    setWorkflow(null); setStage('selection'); setOriginalA4Src(null); setFrontRaw(null); setBackRaw(null);
    setFrontFinal(null); setBackFinal(null); setRefiningSide(null); setPdfBuffer(null); setPassword("");
  };

  const executeFinalPrint = async () => {
      if (!studioPrintRef.current) return;
      setIsExporting(true);
      
      try {
          const canvas = await html2canvas(studioPrintRef.current, {
              scale: 3, 
              useCORS: true,
              backgroundColor: '#ffffff',
              imageTimeout: 0,
              logging: false
          });

          const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
          
          const iframe = document.createElement('iframe');
          iframe.style.position = 'fixed';
          iframe.style.right = '0';
          iframe.style.bottom = '0';
          iframe.style.width = '0';
          iframe.style.height = '0';
          iframe.style.border = '0';
          document.body.appendChild(iframe);

          const doc = iframe.contentWindow?.document;
          if (doc) {
              doc.open();
              doc.write(`
                  <html>
                  <head>
                      <style>
                          @page { size: A4 portrait; margin: 0; }
                          body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; }
                          img { width: 100%; height: auto; display: block; }
                      </style>
                  </head>
                  <body>
                      <img src="${dataUrl}" onload="setTimeout(() => { window.print(); }, 200);">
                  </body>
                  </html>
              `);
              doc.close();
          }

          setTimeout(() => {
              document.body.removeChild(iframe);
              setIsExporting(false);
          }, 2000);

      } catch (err) {
          toast({ variant: 'destructive', title: "Print Failed" });
          setIsExporting(false);
      }
  };

  const executePdfExport = async () => {
      if (!studioPrintRef.current) return;
      setIsExporting(true);
      try {
          const canvas = await html2canvas(studioPrintRef.current, { scale: 3, useCORS: true, backgroundColor: '#ffffff' });
          const imgData = canvas.toDataURL('image/jpeg', 1.0);
          const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
          pdf.addImage(imgData, 'JPEG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);
          pdf.save(`ID_Card_${Date.now()}.pdf`);
          confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
          toast({ title: "PDF Ready" });
      } catch (err) {
          toast({ variant: 'destructive', title: "Export Error" });
      } finally {
          setIsExporting(false);
      }
  };

  return (
    <div className="w-full flex flex-col items-center animate-in fade-in duration-500 pb-24 overflow-x-hidden relative">
      
      {/* HIDDEN RENDER TARGET FOR COORDINATE MAPPING (A4 SCALE) */}
      <div className="fixed top-0 -left-[5000px] z-[-1] pointer-events-none">
          <div ref={studioPrintRef} style={{ width: `${A4_WIDTH_MM}mm`, height: `${A4_HEIGHT_MM}mm`, background: 'white', position: 'relative' }}>
                <div 
                    className={cn("absolute bg-white overflow-hidden flex items-center justify-center", showBorder && "border-[0.25mm] border-black")}
                    style={{ width: `${CARD_WIDTH_MM}mm`, height: `${CARD_HEIGHT_MM}mm`, left: `${pos.front.x}mm`, top: `${pos.front.y}mm` }}
                >
                    {frontFinal && <img src={frontFinal || undefined} className="w-full h-full object-contain" alt="front" />}
                </div>
                <div 
                    className={cn("absolute bg-white overflow-hidden flex items-center justify-center", showBorder && "border-[0.25mm] border-black")}
                    style={{ width: `${CARD_WIDTH_MM}mm`, height: `${CARD_HEIGHT_MM}mm`, left: `${pos.back.x}mm`, top: `${pos.back.y}mm` }}
                >
                    {backFinal && <img src={backFinal || undefined} className="w-full h-full object-contain" alt="back" />}
                </div>
          </div>
      </div>

      {stage === 'selection' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 px-4 w-full max-w-4xl">
            <Card className="group border-2 border-dashed hover:border-primary hover:shadow-2xl transition-all cursor-pointer rounded-[2.5rem] overflow-hidden" onClick={() => handleSelection('a4')}>
                <CardHeader className="p-10 text-center">
                    <div className="mx-auto mb-6 grid size-20 place-items-center rounded-3xl bg-primary/10 text-primary shadow-xl transition-transform group-hover:scale-110">
                        <FileText className="size-10" />
                    </div>
                    <CardTitle className="text-2xl font-black uppercase">e-Aadhaar A4 File</CardTitle>
                    <CardDescription className="text-sm font-bold opacity-60">Straighten e-Aadhaar strip for perfect results.</CardDescription>
                </CardHeader>
                <CardFooter className="bg-primary/5 py-4 justify-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">SELECT A4 WORKFLOW <ChevronRight className="inline size-3" /></span>
                </CardFooter>
            </Card>

            <Card className="group border-2 border-dashed hover:border-emerald-500 hover:shadow-2xl transition-all cursor-pointer rounded-[2.5rem] overflow-hidden" onClick={() => handleSelection('separate')}>
                <CardHeader className="p-10 text-center">
                    <div className="mx-auto mb-6 grid size-20 place-items-center rounded-3xl bg-emerald-500/10 text-emerald-600 shadow-xl transition-transform group-hover:scale-110">
                        <LayoutGrid className="size-10" />
                    </div>
                    <CardTitle className="text-2xl font-black uppercase">Individual Sides</CardTitle>
                    <CardDescription className="text-sm font-bold opacity-60">Straighten PAN, DL or Voter ID photos taken at angles.</CardDescription>
                </CardHeader>
                <CardFooter className="bg-emerald-500/5 py-4 justify-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">SELECT INDIVIDUAL WORKFLOW <ChevronRight className="inline size-3" /></span>
                </CardFooter>
            </Card>
        </div>
      )}

      {stage === 'upload' && workflow === 'a4' && (
        <Card className={cn("w-full max-w-2xl border-2 border-dashed bg-card/50 text-center rounded-[2.5rem] overflow-hidden shadow-xl mx-4", isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.01]")}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }} onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragOver(false); if(e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
        >
            <CardHeader className="pt-12 relative text-center">
                <Button variant="ghost" size="sm" onClick={handleReset} className="absolute top-6 left-6 font-black text-[10px] uppercase text-left"><ArrowLeft className="mr-1 size-3" /> Back</Button>
                <div className="mx-auto mb-6 grid size-20 place-items-center rounded-3xl bg-primary/10 text-primary shadow-xl"><UploadCloud className="size-10" /></div>
                <CardTitle className="text-3xl font-black uppercase text-center">e-Aadhaar Upload</CardTitle>
            </CardHeader>
            <CardContent className="pb-12 px-6">
                <div className="border-4 border-dashed border-muted-foreground/20 rounded-[2rem] p-20 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-muted/30 transition-all group relative" onClick={() => fileInputRef.current?.click()}>
                    <Zap className="size-8 text-yellow-500 animate-pulse" />
                    <p className="font-black uppercase text-lg text-slate-800 dark:text-slate-100">Drop Original PDF here</p>
                    <Badge variant="outline">AUTO-DECRYPT ACTIVE</Badge>
                </div>
                <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </CardContent>
        </Card>
      )}

      {stage === 'upload' && workflow === 'separate' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 px-4 w-full max-w-5xl">
              <div className="flex flex-col sm:flex-row items-center justify-between no-print gap-4">
                   <Button variant="ghost" onClick={handleReset} className="font-black text-[10px] uppercase tracking-widest self-start md:self-center bg-white/50 dark:bg-slate-900/50 rounded-full border shadow-sm px-6 h-10 transition-all hover:bg-destructive/5 hover:text-destructive"><ArrowLeft className="mr-1 size-3" /> Back to Selection</Button>
                   <div className="flex items-center gap-3">
                        {frontFinal && backFinal && (
                            <Button onClick={() => setStage('preview')} className="bg-primary text-primary-foreground font-black uppercase text-xs h-11 px-10 rounded-2xl shadow-xl animate-bounce border-none">GENERATE PRINT SHEET <ChevronRight className="ml-1 size-4" /></Button>
                        )}
                   </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 no-print">
                  {[ { side: 'front' as const, raw: frontRaw, final: frontFinal, setRaw: setFrontRaw, setFinal: setFrontFinal, inputRef: frontInputRef },
                     { side: 'back' as const, raw: backRaw, final: backFinal, setRaw: setBackRaw, setFinal: setBackFinal, inputRef: backInputRef }
                  ].map(s => (
                    <Card key={s.side} className={cn(
                        "border-2 border-dashed rounded-[3rem] overflow-hidden transition-all duration-300 group relative",
                        "hover:-translate-y-2 hover:shadow-2xl hover:border-primary/40",
                        s.final ? "border-green-500/30 bg-green-500/5 shadow-2xl" : "bg-card/50"
                    )}>
                      <CardHeader className="text-center p-6 bg-muted/20 border-b border-dashed">
                        <CardTitle className="text-xs font-black uppercase text-muted-foreground tracking-[0.2em] flex items-center justify-center gap-2">
                           {s.side === 'front' ? <Smartphone className="size-3.5 text-primary" /> : <RefreshCcw className="size-3.5 text-emerald-500" />}
                           {s.side === 'front' ? 'FRONT SIDE VIEW' : 'BACK SIDE VIEW'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-8 md:p-12 flex flex-col items-center justify-center min-h-[350px] gap-6">
                          {s.final ? (
                              <div className="relative group/preview w-full flex flex-col items-center gap-6 animate-in zoom-in-95">
                                  <div className={cn("relative shadow-2xl rounded-xl overflow-hidden bg-white w-full max-w-[320px] aspect-[85.6/54] transform transition-transform group-hover/preview:scale-[1.02]", showBorder && "border-2 border-black")}>
                                      <img src={s.final || undefined} alt={s.side} className="w-full h-full object-contain" />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                                          <Button size="sm" variant="secondary" className="font-black text-[9px] uppercase px-4 h-9 rounded-lg shadow-xl" onClick={() => { setRefiningSide(s.side); resetPoints(); setStage('refine'); }}><Scan className="size-3 mr-1.5" /> Adjust</Button>
                                          <Button size="icon" variant="destructive" className="h-9 w-9 rounded-lg shadow-xl" onClick={() => { s.setFinal(null); s.setRaw(null); }}><Trash2 className="size-4" /></Button>
                                      </div>
                                  </div>
                              </div>
                          ) : s.raw ? (
                              <Button className="font-black uppercase text-[10px] bg-primary text-primary-foreground h-11 px-8 rounded-xl shadow-xl" onClick={() => { setRefiningSide(s.side); resetPoints(); setStage('refine'); }}>Start Adjustment</Button>
                          ) : (
                              <div className="flex flex-col items-center gap-6 text-center cursor-pointer" onClick={() => s.inputRef.current?.click()}>
                                  <div className="size-20 rounded-[2rem] bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 transition-colors shadow-inner"><UploadCloud className="size-10" /></div>
                                  <input ref={s.inputRef} type="file" className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f, s.side); }} />
                              </div>
                          )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
          </div>
      )}

      {stage === 'password' && (
        <Card className="w-full max-w-sm shadow-2xl rounded-[2rem] overflow-hidden bg-card/50 border-2">
            <CardHeader className="bg-primary/5 p-4 border-b text-center">
                <CardTitle className="text-lg font-black uppercase flex items-center justify-center gap-2">
                    <Lock className="size-4 text-primary" /> Password
                </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-left">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50 ml-1">Enter PDF Password</Label>
                <div className="relative group text-left">
                    <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 text-xl font-black tracking-[0.1em] text-center border-2 rounded-xl pr-12 bg-background shadow-inner" placeholder="••••••••" autoFocus />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">{showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}</button>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 flex gap-3 text-left shadow-inner">
                    <AlertCircle className="size-5 text-blue-500 shrink-0" />
                    <p className="text-[10px] text-blue-700 dark:text-blue-300 font-bold leading-tight uppercase">Format: FIRST 4 Letters of NAME (CAPS) + Year of Birth.</p>
                </div>
            </CardContent>
            <CardFooter className="p-4 bg-muted/5 border-t">
                <Button onClick={() => processPdfWithPassword(pdfBuffer!, password)} disabled={isProcessing || !password} className="w-full h-11 bg-primary text-white font-black rounded-xl text-sm shadow-xl hover:scale-[1.02] transition-all">
                    {isProcessing ? <Loader2 className="animate-spin mr-2"/> : <Zap className="mr-2 h-4 w-4 text-yellow-400 fill-yellow-400" />} UNLOCK & RENDER
                </Button>
            </CardFooter>
        </Card>
      )}

      {stage === 'refine' && (
          <Card className="w-full max-w-5xl mx-4 shadow-3xl rounded-[2.5rem] overflow-hidden bg-card border-none">
              <CardHeader className="bg-muted/30 border-b p-6">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-2"><Settings2 className="size-5 text-primary" /> Adjustment Studio</CardTitle>
                    <div className="flex items-center gap-3">
                        <Tabs value={cropMode} onValueChange={(v) => setCropMode(v as CropMode)} className="bg-background/50 p-1 rounded-lg border shadow-sm">
                            <TabsList className="h-9"><TabsTrigger value="rect" className="text-[10px] font-black uppercase px-4"><Maximize className="size-3 mr-1.5" /> Rect</TabsTrigger><TabsTrigger value="scanner" className="text-[10px] font-black uppercase px-4"><Scan className="size-3 mr-1.5" /> Scanner</TabsTrigger></TabsList>
                        </Tabs>
                        <Button variant="ghost" size="icon" onClick={() => setStage('upload')} className="text-destructive h-9 w-9 rounded-lg hover:bg-destructive/5"><X /></Button>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 bg-slate-200 dark:bg-slate-900 flex flex-col items-center justify-center min-h-[600px] relative overflow-hidden select-none shadow-inner"
                           onMouseMove={handleMouseMove} onTouchMove={handleMouseMove} onMouseUp={() => setDraggingPoint(null)} onTouchEnd={() => setDraggingPoint(null)}>
                  {isProcessing && <div className="absolute inset-0 z-40 bg-white/80 dark:bg-slate-950/80 flex flex-col items-center justify-center gap-4"><Loader2 className="h-12 w-12 animate-spin text-primary" /><p className="text-[10px] font-black uppercase">Processing Pixels...</p></div>}
                  <div ref={containerRef} className="relative cursor-crosshair shadow-3xl border-4 border-white transform-gpu bg-white my-10 max-w-[95vw]" style={{ touchAction: 'none' }}>
                    {cropMode === 'rect' ? (
                        <ReactCrop crop={rectCrop} onChange={c => setRectCrop(c)} onComplete={c => setCompletedRectCrop(c)} className="max-h-[70vh]">
                            {(originalA4Src || (refiningSide === 'front' ? frontRaw : backRaw)) ? <img ref={imgRef} src={(workflow === 'a4' ? originalA4Src : (refiningSide === 'front' ? frontRaw : backRaw)) || undefined} alt="crop" className="max-h-[70vh] w-auto object-contain" /> : null}
                        </ReactCrop>
                    ) : (
                        <div className="relative">
                            {(originalA4Src || (refiningSide === 'front' ? frontRaw : backRaw)) ? <img ref={imgRef} src={(workflow === 'a4' ? originalA4Src : (refiningSide === 'front' ? frontRaw : backRaw)) || undefined} alt="scanner" className="max-h-[70vh] w-auto object-contain pointer-events-none" /> : null}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points={`${points[0].x},${points[0].y} ${points[2].x},${points[2].y} ${points[4].x},${points[4].y} ${points[6].x},${points[6].y}`} className="fill-primary/10 stroke-primary stroke-[0.5]" /></svg>
                            {points.map((p, i) => (
                                <div key={i} className={cn("absolute size-10 -ml-5 -mt-5 rounded-full border-4 border-white shadow-2xl cursor-grab active:cursor-grabbing z-20 flex items-center justify-center transition-transform", draggingPoint === i ? "bg-primary scale-125" : "bg-primary/80")}
                                    style={{ left: `${p.x}%`, top: `${p.y}%`, touchAction: 'none' }} onMouseDown={(e) => handlePointDown(i, e)} onTouchStart={(e) => handlePointDown(i, e)}><div className="size-2.5 bg-white rounded-full" /></div>
                            ))}
                            {draggingPoint !== null && (
                                <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-50 overflow-hidden size-40 rounded-full border-4 border-green-500 shadow-3xl bg-white animate-in zoom-in-50 ring-4 ring-white/50">
                                    <img src={(workflow === 'a4' ? originalA4Src : (refiningSide === 'front' ? frontRaw : backRaw)) || undefined} alt="mag" className="absolute max-w-none origin-top-left"
                                        style={{ width: `${(imgRef.current?.width || 0) * 4}px`, height: `${(imgRef.current?.height || 0) * 4}px`, left: `calc(50% - ${(magnifierPos.x / 100) * (imgRef.current?.width || 0) * 4}px)`, top: `calc(50% - ${(magnifierPos.y / 100) * (imgRef.current?.height || 0) * 4}px)` }} />
                                    {/* CROSSHAIR ADDED HERE */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-full h-0.5 bg-green-500/50 absolute" />
                                        <div className="h-full w-0.5 bg-green-500/50 absolute" />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                  </div>
              </CardContent>
              <CardFooter className="p-6 bg-white dark:bg-slate-950 border-t flex justify-between gap-4">
                  <Button variant="outline" onClick={() => setStage('upload')} className="font-black text-[10px] uppercase h-12 px-6 rounded-xl border-2">CANCEL</Button>
                  <Button className="h-14 px-12 bg-primary text-white font-black rounded-xl shadow-xl text-base hover:scale-[1.02] transition-all" onClick={handleFinalizeCrop}>CONFIRM ADJUSTMENT</Button>
              </CardFooter>
          </Card>
      )}

      {stage === 'preview' && frontFinal && backFinal && (
          <div className="w-full max-w-6xl space-y-10 animate-in slide-in-from-bottom-4 duration-500 px-4">
              
              <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 no-print bg-white/40 dark:bg-slate-900/40 p-6 rounded-[2.5rem] border shadow-2xl backdrop-blur-xl text-left">
                  <div className="flex items-center gap-4">
                      <div className="size-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600 shadow-md border border-green-500/20">
                          <CheckCircle2 className="size-7" />
                      </div>
                      <div className="text-left">
                          <h3 className="text-xl font-black uppercase tracking-tighter leading-none">PRINT READY</h3>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 tracking-widest mt-1">A4 ID-1 ALIGNMENT</p>
                      </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                      <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-2xl border-2 shadow-inner">
                          <Square className="size-4 text-muted-foreground" />
                          <span className="text-[10px] font-black uppercase opacity-60">Border</span>
                          <Switch checked={showBorder} onCheckedChange={setShowBorder} />
                      </div>
                      
                      <div className="flex bg-muted p-1 rounded-2xl border-2 shadow-inner">
                          <button type="button" onClick={() => setVAlign('top')} className={cn("p-2.5 rounded-xl transition-all", vAlign === 'top' ? "!ring-[3px] !ring-slate-950 dark:!ring-white bg-background shadow-lg" : "opacity-30 hover:opacity-60")}><AlignVerticalJustifyStart className="size-4"/></button>
                          <button type="button" onClick={() => setVAlign('center')} className={cn("p-2.5 rounded-xl transition-all mx-1", vAlign === 'center' ? "!ring-[3px] !ring-slate-950 dark:!ring-white bg-background shadow-lg" : "opacity-30 hover:opacity-60")}><AlignVerticalJustifyCenter className="size-4"/></button>
                          <button type="button" onClick={() => setVAlign('bottom')} className={cn("p-2.5 rounded-xl transition-all", vAlign === 'bottom' ? "!ring-[3px] !ring-slate-950 dark:!ring-white bg-background shadow-lg" : "opacity-30 hover:opacity-60")}><AlignVerticalJustifyEnd className="size-4"/></button>
                      </div>

                      <Button variant="outline" onClick={() => setStage('upload')} className="h-12 border-2 px-6 font-black text-[10px] uppercase rounded-2xl shadow-sm hover:bg-primary/5">
                          <RefreshCcw className="mr-2 size-4" /> RE-ALIGN
                      </Button>

                      <Button onClick={executeFinalPrint} disabled={isExporting} className="magic-button h-12 px-10 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl shadow-2xl active:scale-95 transition-all border-none">
                          <StarIcons />
                          {isExporting ? <Loader2 className="mr-2 size-5 animate-spin" /> : <Printer className="mr-2 size-5" />} 
                          PRINT NOW
                      </Button>
                  </div>
              </div>

              <div className="no-print w-full">
                  <Card className="border-none shadow-3xl bg-slate-300/30 dark:bg-slate-900/40 rounded-[3rem] p-6 md:p-14 overflow-hidden relative group backdrop-blur-sm">
                      <div className="absolute top-6 left-1/2 -translate-x-1/2">
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-60">STUDIO RENDER PREVIEW</p>
                      </div>
                      
                      <div className="flex flex-col md:flex-row items-center justify-center gap-12 pt-10">
                          <div className="flex flex-col items-center gap-6">
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">FRONT</p>
                              <div className={cn("relative shadow-2xl rounded-2xl overflow-hidden bg-white w-full max-w-[350px] aspect-[85.6/54] transition-all hover:scale-105 duration-500", showBorder && "ring-2 ring-black")}>
                                  <img src={frontFinal || undefined} alt="front" className="size-full object-contain" />
                              </div>
                          </div>

                          <div className="flex flex-col items-center gap-6">
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">BACK</p>
                              <div className={cn("relative shadow-2xl rounded-2xl overflow-hidden bg-white w-full max-w-[350px] aspect-[85.6/54] transition-all hover:scale-105 duration-500", showBorder && "ring-2 ring-black")}>
                                  <img src={backFinal || undefined} alt="back" className="size-full object-contain" />
                              </div>
                          </div>
                      </div>

                      <div className="absolute top-6 right-8 flex flex-col gap-2">
                           <Button 
                                size="lg" 
                                className="relative flex items-center justify-between gap-0 p-0 overflow-hidden bg-[#00aeef] hover:bg-[#009bd1] text-white font-black rounded-xl transition-all duration-300 group h-12 shadow-xl border-none" 
                                onClick={executePdfExport}
                                disabled={isExporting}
                            >
                                <div className="absolute left-4 w-0.5 h-6 bg-white/40 rounded-full" />
                                <span className="flex-1 px-8 text-center tracking-widest text-[10px] uppercase">SAVE PDF</span>
                                <div className="bg-white h-full pl-5 pr-7 flex items-center justify-center text-[#00aeef] transition-all group-hover:pl-6 group-hover:pr-8 relative" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)', marginLeft: '-15px' }}>
                                    <Download className="size-5 group-hover:scale-110 transition-transform" />
                                    <div className="absolute right-3 w-0.5 h-6 bg-[#00aeef]/20 rounded-full" />
                                </div>
                            </Button>
                      </div>
                  </Card>
              </div>

              <div className="flex items-center justify-center gap-8 no-print pt-4 text-muted-foreground/30 text-[9px] font-black uppercase tracking-[0.3em]">
                  <div className="flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-green-500" /> SECURE RAM</div>
                  <div className="flex items-center gap-1.5"><Monitor className="size-3.5" /> WYSIWYG</div>
                  <div className="flex items-center gap-1.5"><Zap className="size-3.5 text-yellow-500" /> HD RENDER</div>
              </div>
          </div>
      )}

      <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
    </div>
  );
}
