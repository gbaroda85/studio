
"use client";

import { useState, useRef, type ChangeEvent, type DragEvent, useCallback, useEffect } from "react";
import { 
    UploadCloud, 
    Printer, 
    X, 
    Loader2, 
    ShieldCheck, 
    Zap, 
    RotateCcw,
    CheckCircle2,
    Crop,
    AlertCircle,
    FileText,
    ChevronRight,
    Lock,
    Eye,
    LayoutGrid,
    CreditCard,
    Smartphone,
    ArrowRightLeft,
    RefreshCcw,
    ArrowLeft,
    Move,
    Scan,
    Maximize,
    Grid3X3,
    Settings2,
    Download,
    AlignVerticalJustifyStart,
    AlignVerticalJustifyCenter,
    AlignVerticalJustifyEnd,
    Square,
    Sparkles,
    ChevronRight as ChevronRightIcon,
    RotateCw
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
import jsPDF from 'jspdf';
import ReactCrop, { type Crop as CropType, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// Initialize PDF.js worker
if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.mjs`;
}

type Workflow = 'a4' | 'separate';
type Stage = 'selection' | 'upload' | 'password' | 'refine' | 'preview';
type CropMode = 'rect' | 'scanner';
type VAlign = 'top' | 'center' | 'bottom';

interface Point {
    x: number;
    y: number;
}

export default function AadhaarPrinter() {
  const { toast } = useToast();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [stage, setStage] = useState<Stage>('selection');
  const [cropMode, setCropMode] = useState<CropMode>('scanner');
  const [vAlign, setVAlign] = useState<VAlign>('center');
  const [showBorder, setShowBorder] = useState(true);
  const [autoEnhance, setAutoEnhance] = useState(true); 
  
  // A4 Workflow States
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null);
  const [password, setPassword] = useState("");
  const [originalA4Src, setOriginalA4Src] = useState<string | null>(null);

  // Separate Workflow States
  const [frontRaw, setFrontRaw] = useState<string | null>(null);
  const [backRaw, setBackRaw] = useState<string | null>(null);
  const [refiningSide, setRefiningSide] = useState<'front' | 'back' | null>(null);

  // Final Cropped Results
  const [frontFinal, setFrontFinal] = useState<string | null>(null);
  const [backFinal, setBackFinal] = useState<string | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBuildingPdf, setIsBuildingPdf] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Rect Mode States
  const [rectCrop, setRectCrop] = useState<CropType>();
  const [completedRectCrop, setCompletedRectCrop] = useState<PixelCrop>();

  // 8-Dot Scanner States (Corners + Midpoints)
  // Indices: 0: TL, 1: TC, 2: TR, 3: RC, 4: BR, 5: BC, 6: BL, 7: LC
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
        });
        
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 2.2 }); 
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        if (!ctx) throw new Error("Could not initialize canvas context");

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        await page.render({ 
            canvasContext: ctx, 
            viewport,
            intent: 'print'
        }).promise;
        
        setOriginalA4Src(canvas.toDataURL('image/jpeg', 0.95));
        setStage('refine');
        resetPoints();
    } catch (error: any) {
        if (error.name === 'PasswordException' || error.message?.toLowerCase().includes('password')) {
            setStage('password');
        } else {
            console.error("PDF Processing Error:", error);
            toast({ 
                variant: 'destructive', 
                title: 'Processing Failed', 
                description: 'Failed to render document.' 
            });
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
        } else {
            toast({ variant: 'destructive', title: 'Invalid File', description: 'Please upload a PDF or Image.' });
        }
    } else {
        if (!file.type.startsWith('image/')) {
            toast({ variant: 'destructive', title: 'Image Required', description: 'Please upload a JPG or PNG photo.' });
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const src = e.target?.result as string;
            if (side === 'front') {
                setFrontRaw(src);
                setFrontFinal(null);
            } else {
                setBackRaw(src);
                setBackFinal(null);
            }
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

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(
        { unit: '%', width: 90, height: 90 },
        width,
        height
    );
    setRectCrop(initialCrop);
  };

  const handlePdfRenderWithPassword = async () => {
    if (!pdfBuffer) return;
    await processPdfWithPassword(pdfBuffer, password);
  };

  const solvePerspective = (src: Point[], dst: Point[]) => {
    const corners = [src[0], src[2], src[4], src[6]];
    const p = [];
    for (let i = 0; i < 4; i++) {
        p.push([corners[i].x, corners[i].y, 1, 0, 0, 0, -corners[i].x * dst[i].x, -corners[i].y * dst[i].x, dst[i].x]);
        p.push([0, 0, 0, corners[i].x, corners[i].y, 1, -corners[i].x * dst[i].y, -corners[i].y * dst[i].y, dst[i].y]);
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
    if (!image) return;
    setIsProcessing(true);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let finalData = "";

    if (cropMode === 'scanner') {
        const w1 = Math.hypot(points[2].x - points[0].x, points[2].y - points[0].y);
        const w2 = Math.hypot(points[4].x - points[6].x, points[4].y - points[6].y);
        const h1 = Math.hypot(points[6].x - points[0].x, points[6].y - points[0].y);
        const h2 = Math.hypot(points[4].x - points[2].x, points[4].y - points[2].y);
        
        const targetWidth = Math.floor(Math.max(w1, w2) * (image.naturalWidth / 100));
        const targetHeight = Math.floor(Math.max(h1, h2) * (image.naturalHeight / 100));
        
        canvas.width = Math.max(targetWidth, 10);
        canvas.height = Math.max(targetHeight, 10);

        const srcPoints = points.map(p => ({ 
            x: p.x * (image.naturalWidth / 100), 
            y: p.y * (image.naturalHeight / 100) 
        }));
        const dstPoints = [
            { x: 0, y: 0 }, 
            { x: canvas.width, y: 0 }, 
            { x: canvas.width, y: canvas.height }, 
            { x: 0, y: canvas.height }
        ];

        const h = solvePerspective(srcPoints, dstPoints);
        const imgData = ctx.createImageData(canvas.width, canvas.height);
        
        const srcCanvas = document.createElement('canvas');
        srcCanvas.width = image.naturalWidth;
        srcCanvas.height = image.naturalHeight;
        const srcCtx = srcCanvas.getContext('2d');
        if (srcCtx) {
            if (autoEnhance) {
                srcCtx.filter = 'brightness(1.05) contrast(1.15) saturate(1.1) contrast(1.05)';
            }
            srcCtx.drawImage(image, 0, 0);
            srcCtx.filter = 'none';
        }
        const srcData = srcCtx?.getImageData(0, 0, image.naturalWidth, image.naturalHeight).data;

        if (srcData) {
            for (let y = 0; y < canvas.height; y++) {
                for (let x = 0; x < canvas.width; x++) {
                    const z = h[6] * x + h[7] * y + 1;
                    const sx = Math.floor((h[0] * x + h[1] * y + h[2]) / z);
                    const sy = Math.floor((h[3] * x + h[4] * y + h[5]) / z);
                    
                    if (sx >= 0 && sx < image.naturalWidth && sy >= 0 && sy < image.naturalHeight) {
                        const dstIdx = (y * canvas.width + x) * 4;
                        const srcIdx = (sy * image.naturalWidth + sx) * 4;
                        imgData.data[dstIdx] = srcData[srcIdx];
                        imgData.data[dstIdx+1] = srcData[srcIdx+1];
                        imgData.data[dstIdx+2] = srcData[srcIdx+2];
                        imgData.data[dstIdx+3] = srcData[srcIdx+3];
                    }
                }
            }
            ctx.putImageData(imgData, 0, 0);
        }
        finalData = canvas.toDataURL("image/png");
    } else {
        if (!completedRectCrop) return;
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = Math.max(completedRectCrop.width * scaleX, 10);
        canvas.height = Math.max(completedRectCrop.height * scaleY, 10);
        
        if (autoEnhance) {
            ctx.filter = 'brightness(1.05) contrast(1.15) saturate(1.1) contrast(1.05)';
        }
        
        ctx.drawImage(
            image,
            completedRectCrop.x * scaleX,
            completedRectCrop.y * scaleY,
            completedRectCrop.width * scaleX,
            completedRectCrop.height * scaleY,
            0,
            0,
            canvas.width,
            canvas.height
        );
        ctx.filter = 'none';
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
            setIsProcessing(false);
        };
    } else {
        if (refiningSide === 'front') setFrontFinal(finalData);
        else setBackFinal(finalData);
        setRefiningSide(null);
        setStage('upload');
        setIsProcessing(false);
    }
    
    toast({ title: "Adjustment Applied", description: `Image processed.` });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (draggingPoint === null || !containerRef.current) return;
    
    if (e.cancelable) e.preventDefault();

    let clientX, clientY;
    if ('touches' in e) {
        clientX = e.touches[0].clientX; clientY = e.touches[0].clientY;
    } else {
        clientX = (e as React.MouseEvent).clientX; clientY = (e as React.MouseEvent).clientY;
    }
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));

    setMagnifierPos({ x, y });
    
    setPoints(prev => {
        const next = [...prev];
        const idx = draggingPoint;
        const dx = x - prev[idx].x;
        const dy = y - prev[idx].y;
        
        // Update the point being dragged
        next[idx] = { x, y };

        // SYNC LOGIC for 8 Points: 0(TL), 1(TC), 2(TR), 3(RC), 4(BR), 5(BC), 6(BL), 7(LC)
        if (idx === 0) { // TL
            next[1].x = (next[0].x + next[2].x) / 2; next[1].y = (next[0].y + next[2].y) / 2;
            next[7].x = (next[0].x + next[6].x) / 2; next[7].y = (next[0].y + next[6].y) / 2;
        } else if (idx === 2) { // TR
            next[1].x = (next[0].x + next[2].x) / 2; next[1].y = (next[0].y + next[2].y) / 2;
            next[3].x = (next[2].x + next[4].x) / 2; next[3].y = (next[2].y + next[4].y) / 2;
        } else if (idx === 4) { // BR
            next[3].x = (next[2].x + next[4].x) / 2; next[3].y = (next[2].y + next[4].y) / 2;
            next[5].x = (next[4].x + next[6].x) / 2; next[5].y = (next[4].y + next[6].y) / 2;
        } else if (idx === 6) { // BL
            next[5].x = (next[4].x + next[6].x) / 2; next[5].y = (next[4].y + next[6].y) / 2;
            next[7].x = (next[0].x + next[6].x) / 2; next[7].y = (next[0].y + next[6].y) / 2;
        } else if (idx === 1) { // TC (Top Mid): Move TL and TR synchronously
            next[0].y += dy; next[2].y += dy;
            // Update midpoints connected to moved corners
            next[7].x = (next[0].x + next[6].x) / 2; next[7].y = (next[0].y + next[6].y) / 2;
            next[3].x = (next[2].x + next[4].x) / 2; next[3].y = (next[2].y + next[4].y) / 2;
        } else if (idx === 3) { // RC (Right Mid): Move TR and BR synchronously
            next[2].x += dx; next[4].x += dx;
            // Update midpoints connected to moved corners
            next[1].x = (next[0].x + next[2].x) / 2; next[1].y = (next[0].y + next[2].y) / 2;
            next[5].x = (next[4].x + next[6].x) / 2; next[5].y = (next[4].y + next[6].y) / 2;
        } else if (idx === 5) { // BC (Bottom Mid): Move BL and BR synchronously
            next[6].y += dy; next[4].y += dy;
            // Update midpoints connected to moved corners
            next[7].x = (next[0].x + next[6].x) / 2; next[7].y = (next[0].y + next[6].y) / 2;
            next[3].x = (next[2].x + next[4].x) / 2; next[3].y = (next[2].y + next[4].y) / 2;
        } else if (idx === 7) { // LC (Left Mid): Move TL and BL synchronously
            next[0].x += dx; next[6].x += dx;
            // Update midpoints connected to moved corners
            next[1].x = (next[0].x + next[2].x) / 2; next[1].y = (next[0].y + next[2].y) / 2;
            next[5].x = (next[4].x + next[6].x) / 2; next[5].y = (next[4].y + next[6].y) / 2;
        }

        return next;
    });
  }, [draggingPoint]);

  const handlePointMouseDown = (index: number, e: React.MouseEvent | React.TouchEvent) => {
    setDraggingPoint(index);
    
    let clientX, clientY;
    if ('touches' in e) {
        clientX = e.touches[0].clientX; clientY = e.touches[0].clientY;
    } else {
        clientX = (e as React.MouseEvent).clientX; clientY = (e as React.MouseEvent).clientY;
    }
    
    if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
        const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
        setMagnifierPos({ x, y });
    }
  };

  const handleMouseUp = () => setDraggingPoint(null);

  const handlePrint = () => {
      window.print();
  }

  const handleDownloadPdf = async () => {
    if (!frontFinal || !backFinal) return;
    setIsBuildingPdf(true);
    try {
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        const photoW = 85.6; 
        const photoH = 54.0;
        const gap = 10;
        const totalH = (photoH * 2) + gap;

        let startY;
        if (vAlign === 'top') startY = 10;
        else if (vAlign === 'bottom') startY = pageHeight - totalH - 10;
        else startY = (pageHeight - totalH) / 2;

        const startX = (pageWidth - photoW) / 2;

        pdf.addImage(frontFinal, 'PNG', startX, startY, photoW, photoH);
        pdf.addImage(backFinal, 'PNG', startX, startY + photoH + gap, photoW, photoH);

        pdf.save(`ID-Card-Ready-${Date.now()}.pdf`);
        toast({ title: "PDF Downloaded" });
    } catch (e) {
        toast({ variant: 'destructive', title: "Error" });
    } finally {
        setIsBuildingPdf(false);
    }
  };

  const handleReset = () => {
    setWorkflow(null);
    setStage('selection');
    setOriginalA4Src(null);
    setFrontRaw(null);
    setBackRaw(null);
    setFrontFinal(null);
    setBackFinal(null);
    setRefiningSide(null);
    setPdfBuffer(null);
    setPassword("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (frontInputRef.current) frontInputRef.current.value = "";
    if (backInputRef.current) backInputRef.current.value = "";
  };

  return (
    <div className="w-full flex flex-col items-center animate-in fade-in duration-500 pb-24 overflow-x-hidden relative">
      
      {/* STAGE 0: SELECTION */}
      {stage === 'selection' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 px-4 w-full max-w-5xl justify-center">
            <Card className="group border-2 border-dashed hover:border-primary hover:shadow-2xl transition-all cursor-pointer rounded-[2.5rem] overflow-hidden" onClick={() => handleSelection('a4')}>
                <CardHeader className="p-6 md:p-10 text-center">
                    <div className="mx-auto mb-6 grid size-16 md:size-20 place-items-center rounded-3xl bg-primary/10 text-primary shadow-xl transition-transform group-hover:scale-110">
                        <FileText className="size-8 md:size-10" />
                    </div>
                    <CardTitle className="text-xl md:text-2xl font-black uppercase tracking-tighter">e-Aadhaar A4 File</CardTitle>
                    <CardDescription className="text-[10px] md:text-sm font-bold opacity-60">Straighten e-Aadhaar strip for perfect results.</CardDescription>
                </CardHeader>
                <CardFooter className="bg-primary/5 py-4 justify-center">
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-primary">SELECT A4 WORKFLOW <ChevronRight className="inline size-3" /></span>
                </CardFooter>
            </Card>

            <Card className="group border-2 border-dashed hover:border-emerald-500 hover:shadow-2xl transition-all cursor-pointer rounded-[2.5rem] overflow-hidden" onClick={() => handleSelection('separate')}>
                <CardHeader className="p-6 md:p-10 text-center">
                    <div className="mx-auto mb-6 grid size-16 md:size-20 place-items-center rounded-3xl bg-emerald-500/10 text-emerald-600 shadow-xl transition-transform group-hover:scale-110">
                        <LayoutGrid className="size-8 md:size-10" />
                    </div>
                    <CardTitle className="text-xl md:text-2xl font-black uppercase tracking-tighter">Individual Sides</CardTitle>
                    <CardDescription className="text-[10px] md:text-sm font-bold opacity-60">Straighten PAN, DL or Voter ID photos taken at angles.</CardDescription>
                </CardHeader>
                <CardFooter className="bg-emerald-500/5 py-4 justify-center">
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">SELECT INDIVIDUAL WORKFLOW <ChevronRight className="inline size-3" /></span>
                </CardFooter>
            </Card>
        </div>
      )}

      {/* STAGE 1: UPLOAD (A4) */}
      {stage === 'upload' && workflow === 'a4' && (
        <Card className={cn(
            "w-full max-w-4xl border-2 border-dashed bg-card/50 text-center transition-all duration-300 rounded-[2.5rem] overflow-hidden shadow-xl mx-4",
            isDragOver && "border-primary bg-primary/5"
        )}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragOver(false); if(e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
        >
            <CardHeader className="pt-8 md:pt-12 relative">
                <Button variant="ghost" size="sm" onClick={handleReset} className="absolute top-4 left-4 md:top-6 md:left-6 font-black text-[9px] md:text-[10px] uppercase"><ArrowLeft className="mr-1 size-3" /> Back</Button>
                <div className="mx-auto mb-6 grid size-16 md:size-20 place-items-center rounded-3xl bg-primary/10 text-primary">
                    <UploadCloud className="size-8 md:size-10" />
                </div>
                <CardTitle className="text-2xl md:text-3xl font-black uppercase tracking-tighter">e-Aadhaar Upload</CardTitle>
                <CardDescription className="text-xs md:text-sm">Select the PDF file downloaded from UIDAI portal.</CardDescription>
            </CardHeader>
            <CardContent className="pb-8 md:pb-12 px-4 md:px-6">
                <div className="border-4 border-dashed border-muted-foreground/20 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-20 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-muted/30 transition-all" onClick={() => fileInputRef.current?.click()}>
                    <Zap className="size-6 md:size-8 text-yellow-500 animate-pulse" />
                    <p className="font-black uppercase tracking-tighter text-center text-sm md:text-base">Drop Original PDF here</p>
                    <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">Auto-Decrypt Logic Active</p>
                </div>
                <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </CardContent>
        </Card>
      )}

      {/* STAGE 1: UPLOAD (SEPARATE SIDES) */}
      {stage === 'upload' && workflow === 'separate' && (
          <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4 duration-500 px-4 w-full max-w-5xl">
              <div className="flex flex-col sm:flex-row items-center justify-between no-print gap-4">
                   <Button variant="ghost" onClick={handleReset} className="font-black text-[9px] md:text-[10px] uppercase tracking-widest self-start md:self-center"><ArrowLeft className="mr-1 size-3" /> Selection</Button>
                   <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Badge variant="outline" className="hidden sm:inline-flex font-black text-primary border-primary/20 bg-primary/5 uppercase text-[9px] px-3">Standard ID-1 Format</Badge>
                        {frontFinal && backFinal && (
                            <Button onClick={() => setStage('preview')} className="flex-1 sm:flex-none bg-primary font-black uppercase text-[10px] md:text-xs h-10 px-6 md:px-8 rounded-xl shadow-xl animate-bounce">GENERATE PRINT <ChevronRight className="ml-1 size-4" /></Button>
                        )}
                   </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 no-print justify-center">
                  <Card className={cn("border-2 border-dashed rounded-[2rem] md:rounded-[2.5rem] overflow-hidden transition-all", frontFinal ? "border-green-500/50 bg-green-500/5" : "hover:border-primary")}>
                      <CardHeader className="pb-2 md:pb-4 text-center">
                          <CardTitle className="text-[10px] md:text-sm font-black uppercase text-muted-foreground flex items-center justify-center gap-2">
                             {frontFinal ? <CheckCircle2 className="size-3 md:size-4 text-green-500" /> : <CreditCard className="size-3 md:size-4" />} FRONT SIDE
                          </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 md:p-8 flex flex-col items-center gap-6 min-h-[200px] md:min-h-[300px] justify-center">
                          {frontFinal ? (
                              <div className={cn("relative group shadow-2xl rounded-lg overflow-hidden bg-white max-w-full aspect-[85.6/54] h-28 md:h-40", showBorder && "border-[1px] md:border-2 border-black")}>
                                  <img src={frontFinal} alt="front" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                      <Button size="sm" variant="secondary" className="font-black text-[8px] md:text-[9px] uppercase h-7 md:h-8 px-2 md:px-4" onClick={() => { setRefiningSide('front'); resetPoints(); setStage('refine'); }}><Scan className="size-3 mr-1.5" /> Adjust</Button>
                                      <Button size="icon" variant="destructive" className="h-7 w-7 md:h-8 md:w-8" onClick={() => { setFrontFinal(null); setFrontRaw(null); }}><X className="size-3 md:size-4" /></Button>
                                  </div>
                              </div>
                          ) : frontRaw ? (
                              <div className="flex flex-col items-center gap-3 text-center">
                                  <div className="size-12 md:size-16 rounded-full bg-primary/20 flex items-center justify-center text-primary animate-pulse"><Move className="size-6 md:size-8" /></div>
                                  <p className="text-[10px] font-bold text-primary uppercase">Straighten Needed</p>
                                  <Button className="font-black uppercase text-[10px] bg-primary rounded-xl" onClick={() => { setRefiningSide('front'); resetPoints(); setStage('refine'); }}>Start Smart Scanner</Button>
                                  <Button variant="ghost" onClick={() => setFrontRaw(null)} className="text-[8px] font-bold uppercase opacity-50">Clear</Button>
                              </div>
                          ) : (
                              <div className="flex flex-col items-center gap-4 text-center cursor-pointer opacity-40 hover:opacity-100 transition-opacity" onClick={() => frontInputRef.current?.click()}>
                                  <UploadCloud className="size-10 md:size-12" />
                                  <p className="text-[10px] font-black uppercase tracking-tighter">Upload Front Photo</p>
                                  <input ref={frontInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0], 'front')} />
                              </div>
                          )}
                      </CardContent>
                  </Card>

                  <Card className={cn("border-2 border-dashed rounded-[2rem] md:rounded-[2.5rem] overflow-hidden transition-all", backFinal ? "border-green-500/50 bg-green-500/5" : "hover:border-primary")}>
                      <CardHeader className="pb-2 md:pb-4 text-center">
                          <CardTitle className="text-[10px] md:text-sm font-black uppercase text-muted-foreground flex items-center justify-center gap-2">
                             {backFinal ? <CheckCircle2 className="size-3 md:size-4 text-green-500" /> : <CreditCard className="size-3 md:size-4" />} BACK SIDE
                          </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 md:p-8 flex flex-col items-center gap-6 min-h-[200px] md:min-h-[300px] justify-center">
                          {backFinal ? (
                              <div className={cn("relative group shadow-2xl rounded-lg overflow-hidden bg-white max-w-full aspect-[85.6/54] h-28 md:h-40", showBorder && "border-[1px] md:border-2 border-black")}>
                                  <img src={backFinal} alt="back" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                      <Button size="sm" variant="secondary" className="font-black text-[8px] md:text-[9px] uppercase h-7 md:h-8 px-2 md:px-4" onClick={() => { setRefiningSide('back'); resetPoints(); setStage('refine'); }}><Scan className="size-3 mr-1.5" /> Adjust</Button>
                                      <Button size="icon" variant="destructive" className="h-7 w-7 md:h-8 md:w-8" onClick={() => { setBackFinal(null); setBackRaw(null); }}><X className="size-3 md:size-4" /></Button>
                                  </div>
                              </div>
                          ) : backRaw ? (
                              <div className="flex flex-col items-center gap-3 text-center">
                                  <div className="size-12 md:size-16 rounded-full bg-primary/20 flex items-center justify-center text-primary animate-pulse"><Move className="size-6 md:size-8" /></div>
                                  <p className="text-[10px] font-bold text-primary uppercase">Straighten Needed</p>
                                  <Button className="font-black uppercase text-[10px] bg-primary rounded-xl" onClick={() => { setRefiningSide('back'); resetPoints(); setStage('refine'); }}>Start Smart Scanner</Button>
                                  <Button variant="ghost" onClick={() => setBackRaw(null)} className="text-[8px] font-bold uppercase opacity-50">Clear</Button>
                              </div>
                          ) : (
                              <div className="flex flex-col items-center gap-4 text-center cursor-pointer opacity-40 hover:opacity-100 transition-opacity" onClick={() => backInputRef.current?.click()}>
                                  <UploadCloud className="size-10 md:size-12" />
                                  <p className="text-[10px] font-black uppercase tracking-tighter">Upload Back Photo</p>
                                  <input ref={backInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0], 'back')} />
                              </div>
                          )}
                      </CardContent>
                  </Card>
              </div>
          </div>
      )}

      {/* STAGE 2: PASSWORD (A4 ONLY) */}
      {stage === 'password' && (
        <Card className="w-full max-w-md mx-4 shadow-2xl rounded-[2rem] md:rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-primary/5 p-5 md:p-6 border-b text-center">
                <CardTitle className="text-lg md:text-xl font-black uppercase flex items-center justify-center gap-3">
                    <Lock className="size-5 text-primary" /> Aadhaar Password
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-6">
                <div className="space-y-4">
                    <Label className="text-[9px] md:text-[10px] font-black uppercase opacity-50">Enter PDF Open Password</Label>
                    <Input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="h-12 md:h-14 text-xl md:text-2xl font-black tracking-[0.3em] text-center border-2 rounded-2xl"
                        placeholder="••••••••"
                        autoFocus
                    />
                    <div className="bg-blue-50 p-3 md:p-4 rounded-xl border border-blue-100 flex gap-3">
                        <AlertCircle className="size-4 md:size-5 text-blue-500 shrink-0" />
                        <p className="text-[9px] md:text-[10px] text-blue-700 font-bold leading-tight">
                            Format: FIRST 4 Letters of NAME (CAPS) + Year of Birth. <br/>Example: <strong>ANIS1995</strong>
                        </p>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-5 md:p-6 bg-muted/5 border-t">
                <Button onClick={handlePdfRenderWithPassword} disabled={isProcessing || !password} className="w-full h-12 md:h-14 bg-primary font-black rounded-xl text-base md:text-lg shadow-xl">
                    {isProcessing ? <Loader2 className="animate-spin mr-2"/> : <Zap className="mr-2 h-5 w-5 text-yellow-400 fill-yellow-400" />}
                    UNLOCK & RENDER
                </Button>
            </CardFooter>
        </Card>
      )}

      {/* STAGE 3: REFINE WITH MODES */}
      {stage === 'refine' && (
          <Card className="w-full max-w-5xl mx-4 shadow-2xl rounded-2xl md:rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-muted/30 border-b p-3 md:p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-center md:text-left">
                        <CardTitle className="text-lg md:text-xl font-black uppercase tracking-tighter flex items-center justify-center md:justify-start gap-2">
                            <Settings2 className="size-4 md:size-5 text-primary" /> Adjustment Studio
                        </CardTitle>
                        <CardDescription className="text-[8px] md:text-[10px] font-black uppercase opacity-60">Pick mode and align corners of {refiningSide || 'Aadhaar'} portion.</CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
                        <div className="flex items-center gap-2 bg-primary/5 px-2 md:px-3 py-1 md:py-1.5 rounded-lg border border-primary/20">
                            <Sparkles className={cn("size-3 md:size-3.5", autoEnhance ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground")} />
                            <span className="text-[8px] md:text-[10px] font-black uppercase">AI Enhance</span>
                            <Switch checked={autoEnhance} onCheckedChange={setAutoEnhance} className="scale-75 md:scale-100" />
                        </div>
                         <Tabs value={cropMode} onValueChange={(v) => setCropMode(v as CropMode)} className="bg-background/50 p-1 rounded-lg border">
                            <TabsList className="h-7 md:h-9">
                                <TabsTrigger value="rect" className="text-[8px] md:text-[10px] font-black uppercase px-2 md:px-4">
                                    <Maximize className="size-2.5 md:size-3 mr-1 md:mr-1.5" /> Rect
                                </TabsTrigger>
                                <TabsTrigger value="scanner" className="text-[8px] md:text-[10px] font-black uppercase px-2 md:px-4">
                                    <Scan className="size-2.5 md:size-3 mr-1 md:mr-1.5" /> Scanner
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <Button variant="ghost" size="icon" onClick={() => setStage('upload')} className="text-destructive h-8 w-8 md:h-10 md:w-10"><X className="size-4 md:size-5" /></Button>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 bg-slate-200 dark:bg-slate-900 flex flex-col items-center justify-center min-h-[350px] md:min-h-[600px] relative overflow-hidden select-none"
                           onMouseMove={handleMouseMove} onTouchMove={handleMouseMove} onMouseUp={handleMouseUp} onTouchEnd={handleMouseUp}>
                  
                  {isProcessing && (
                      <div className="absolute inset-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                          <Loader2 className="h-10 w-10 md:h-12 md:w-12 animate-spin text-primary stroke-[3]" />
                          <p className="text-[10px] font-black uppercase animate-pulse">Processing Pixels...</p>
                      </div>
                  )}

                  <div ref={containerRef} className="relative cursor-crosshair shadow-2xl border-[2px] md:border-4 border-white transform-gpu bg-white my-6 md:my-10 max-w-[95vw]" style={{ touchAction: 'none' }}>
                    {cropMode === 'rect' ? (
                        <ReactCrop crop={rectCrop} onChange={c => setRectCrop(c)} onComplete={c => setCompletedRectCrop(c)} className="max-h-[60vh] md:max-h-[70vh]">
                            <img ref={imgRef} src={workflow === 'a4' ? originalA4Src! : (refiningSide === 'front' ? frontRaw! : backRaw!)} alt="aadhaar adjustment" className="max-h-[60vh] md:max-h-[70vh] w-auto object-contain" onLoad={onImageLoad} />
                        </ReactCrop>
                    ) : (
                        <div className="relative">
                            <img ref={imgRef} src={workflow === 'a4' ? originalA4Src! : (refiningSide === 'front' ? frontRaw! : backRaw!)} alt="scanner adjustment" className="max-h-[60vh] md:max-h-[70vh] w-auto object-contain pointer-events-none" />
                            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <polygon points={`${points[0].x},${points[0].y} ${points[2].x},${points[2].y} ${points[4].x},${points[4].y} ${points[6].x},${points[6].y}`} className="fill-primary/20 stroke-primary stroke-[0.5]" />
                            </svg>
                            {points.map((p, i) => (
                                <div key={i} className={cn("absolute size-8 md:size-10 -ml-4 md:-ml-5 -mt-4 md:-mt-5 rounded-full border-2 md:border-4 border-white shadow-2xl cursor-grab active:cursor-grabbing z-20 flex items-center justify-center transition-transform transform-gpu", draggingPoint === i ? "bg-primary scale-125 ring-4 ring-primary/20" : "bg-primary/80 hover:bg-primary")}
                                    style={{ left: `${p.x}%`, top: `${p.y}%`, touchAction: 'none', willChange: 'transform' }}
                                    onMouseDown={(e) => handlePointMouseDown(i, e)} onTouchStart={(e) => handlePointMouseDown(i, e)}>
                                    <div className="size-2 md:size-3 bg-white rounded-full shadow-inner" />
                                </div>
                            ))}
                        </div>
                    )}

                    {draggingPoint !== null && cropMode === 'scanner' && (
                        <div className="absolute top-2 md:top-4 left-1/2 -translate-x-1/2 pointer-events-none z-50 overflow-hidden size-24 md:size-48 rounded-full border-2 md:border-4 border-green-500 shadow-3xl bg-white animate-in zoom-in-50 ring-2 md:ring-4 ring-white/50">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="absolute size-full flex items-center justify-center pointer-events-none z-10">
                                    <div className="w-full h-0.5 bg-green-500/50 absolute" />
                                    <div className="h-full w-0.5 bg-green-500/50 absolute" />
                                    <div className="size-2 md:size-4 border-2 border-red-500 rounded-full bg-white/50 shadow-sm" />
                                </div>
                            </div>
                            <img 
                                src={workflow === 'a4' ? originalA4Src! : (refiningSide === 'front' ? frontRaw! : backRaw!)} 
                                alt="magnify" 
                                className="absolute max-w-none origin-top-left"
                                style={{ 
                                    width: `${(imgRef.current?.width || 0) * 4}px`,
                                    height: `${(imgRef.current?.height || 0) * 4}px`,
                                    left: `calc(50% - ${(magnifierPos.x / 100) * (imgRef.current?.width || 0) * 4}px)`,
                                    top: `calc(50% - ${(magnifierPos.y / 100) * (imgRef.current?.height || 0) * 4}px)`
                                }} 
                            />
                        </div>
                    )}
                  </div>

                  <div className="w-full py-4 md:py-10 flex justify-center bg-slate-100 dark:bg-slate-950 border-t relative z-10">
                       <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-8 py-1.5 md:py-3 bg-black/70 backdrop-blur-xl rounded-full text-white text-[8px] md:text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-2xl">
                          <Move className="h-3 w-3 md:h-4 md:w-4 text-primary animate-pulse" /> 
                          {cropMode === 'rect' ? "Drag box to any area" : "Drag dots to corners"}
                      </div>
                  </div>
              </CardContent>
              <CardFooter className="p-3 md:p-6 bg-white dark:bg-slate-950 border-t flex flex-col md:flex-row justify-between gap-3 md:gap-4">
                  <Button variant="ghost" onClick={() => setStage('upload')} className="w-full md:w-auto font-black text-[9px] md:text-[10px] uppercase h-10 md:h-12 px-6 rounded-xl border-2 order-2 md:order-1">CANCEL</Button>
                  <Button className="w-full md:w-auto h-11 md:h-14 px-8 md:px-12 bg-primary font-black rounded-xl shadow-xl group order-1 md:order-2 text-xs md:text-base" onClick={handleFinalizeCrop}>
                      CONFIRM ADJUSTMENT <ChevronRightIcon className="ml-2 size-4 md:size-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
              </CardFooter>
          </Card>
      )}

      {/* STAGE 4: PREVIEW & PRINT */}
      {stage === 'preview' && frontFinal && backFinal && (
        <div className="space-y-6 md:space-y-10 animate-in slide-in-from-bottom-4 duration-500 px-4 w-full max-w-5xl">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 no-print">
                <div className="flex items-center gap-4 text-center md:text-left">
                    <div className="size-10 md:size-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600 shadow-md border border-green-500/20">
                        <CheckCircle2 className="size-6 md:size-7" />
                    </div>
                    <div>
                        <h3 className="text-lg md:text-xl font-black uppercase tracking-tighter">Print Ready</h3>
                        <p className="text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase opacity-60">Professional Studio Alignment</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
                    <div className="flex items-center gap-2 bg-muted px-3 md:px-4 py-1.5 md:py-2 rounded-xl border-2">
                        <Square className="size-2.5 md:size-3 text-muted-foreground" />
                        <span className="text-[8px] md:text-[10px] font-black uppercase">Border</span>
                        <Switch checked={showBorder} onCheckedChange={setShowBorder} className="scale-75 md:scale-100" />
                    </div>
                    <Tabs value={vAlign} onValueChange={(v) => setVAlign(v as VAlign)} className="bg-muted p-1 rounded-xl border-2">
                        <TabsList className="h-7 md:h-9">
                            <TabsTrigger value="top" className="px-2 md:px-3"><AlignVerticalJustifyStart className="size-3 md:size-4"/></TabsTrigger>
                            <TabsTrigger value="center" className="px-2 md:px-3"><AlignVerticalJustifyCenter className="size-3 md:size-4"/></TabsTrigger>
                            <TabsTrigger value="bottom" className="px-2 md:px-3"><AlignVerticalJustifyEnd className="size-3 md:size-4"/></TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <Button variant="outline" onClick={() => setStage('upload')} className="h-9 md:h-12 border-2 px-3 md:px-4 font-black text-[8px] md:text-[9px] uppercase rounded-xl hover:bg-primary/5">
                        <RefreshCcw className="mr-1 md:mr-2 size-2.5 md:size-3" /> Re-align
                    </Button>
                    <Button onClick={handleDownloadPdf} disabled={isBuildingPdf} className="h-9 md:h-12 px-4 md:px-6 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-xl active:scale-95 transition-all text-[10px] md:text-xs">
                        {isBuildingPdf ? <Loader2 className="animate-spin mr-1 md:mr-2 size-3 md:size-4"/> : <Download className="mr-1 md:mr-2 size-3 md:size-4" />} DOWNLOAD PDF
                    </Button>
                    <Button onClick={handlePrint} className="h-9 md:h-12 px-6 md:px-8 bg-primary hover:bg-primary/90 text-white font-black rounded-xl shadow-2xl active:scale-95 transition-all text-[10px] md:text-xs">
                        <Printer className="mr-1 md:mr-2 size-3 md:size-4" /> PRINT NOW
                    </Button>
                </div>
            </div>

            <div className="no-print">
                <Card className="border-2 shadow-2xl bg-slate-100 dark:bg-slate-900 rounded-2xl md:rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="bg-white/50 dark:bg-black/20 border-b p-3 md:p-4 text-center">
                        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground">STUDIO RENDER PREVIEW</span>
                    </CardHeader>
                    <CardContent className="p-6 md:p-12 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
                        <div className="space-y-4">
                            <span className="text-[8px] md:text-[9px] font-black uppercase text-muted-foreground tracking-widest block text-center opacity-60">FRONT PORTION</span>
                            <div className={cn("relative shadow-2xl rounded-xl overflow-hidden bg-white group hover:scale-[1.05] transition-all w-[240px] h-[151px] md:w-[320px] md:h-[202px]", showBorder ? "border-[1px] md:border-[2px] border-black" : "border-[4px] md:border-[6px] border-white")}>
                                <img src={frontFinal} alt="Front" className="w-full h-full object-contain" />
                                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Badge className="bg-primary shadow-lg border-2 border-white font-black text-[8px] md:text-xs">ID-1 STANDARD</Badge>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <span className="text-[8px] md:text-[9px] font-black uppercase text-muted-foreground tracking-widest block text-center opacity-60">BACK PORTION</span>
                            <div className={cn("relative shadow-2xl rounded-xl overflow-hidden bg-white group hover:scale-[1.05] transition-all w-[240px] h-[151px] md:w-[320px] md:h-[202px]", showBorder ? "border-[1px] md:border-[2px] border-black" : "border-[4px] md:border-[6px] border-white")}>
                                <img src={backFinal} alt="Back" className="w-full h-full object-contain" />
                                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Badge className="bg-primary shadow-lg border-2 border-white font-black text-[8px] md:text-xs">ID-1 STANDARD</Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-primary/5 p-4 md:p-6 border-t flex gap-4">
                        <ShieldCheck className="size-4 md:size-5 text-primary shrink-0" />
                        <p className="text-[9px] md:text-[11px] font-bold leading-relaxed text-primary/80 uppercase">
                            <strong>Safe & Private:</strong> Processing happens 100% locally in your RAM. Your ID details never touch any external server.
                        </p>
                    </CardFooter>
                </Card>
            </div>

            {/* PRINT WRAPPER - STRICT 1 PAGE FIX */}
            <div className={cn(
                "hidden print:flex flex-col items-center w-full min-h-[297mm] p-0 m-0 bg-white",
                vAlign === 'top' ? 'justify-start pt-10' : vAlign === 'bottom' ? 'justify-end pb-10' : 'justify-center'
            )} id="printable-area">
                <div className="flex flex-col items-center gap-12">
                    <div className={cn("bg-white flex items-center justify-center overflow-hidden", showBorder && "border-[0.5pt] border-black")} style={{ width: '85.6mm', height: '54mm' }}>
                        <img src={frontFinal} className="max-w-full max-h-full object-contain" alt="Front Print" />
                    </div>

                    <div className={cn("bg-white flex items-center justify-center overflow-hidden", showBorder && "border-[0.5pt] border-black")} style={{ width: '85.6mm', height: '54mm' }}>
                        <img src={backFinal} className="max-w-full max-h-full object-contain" alt="Back Print" />
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Global CSS for Print - ABSOLUTE 1 PAGE LOCK */}
      <style jsx global>{`
        @media print {
          html, body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            height: 297mm !important;
            width: 210mm !important;
            overflow: hidden !important;
          }
          body * {
            visibility: hidden !important;
            margin: 0 !important;
          }
          #printable-area, #printable-area * {
            visibility: visible !important;
          }
          #printable-area {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            background: white !important;
            z-index: 9999999 !important;
            page-break-after: avoid !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}</style>
      <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
    </div>
  );
}

