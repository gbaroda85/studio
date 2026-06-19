
"use client";

import 'react-image-crop/dist/ReactCrop.css';
import React, { useState, useRef, useEffect, useCallback, type SyntheticEvent, type ChangeEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import * as pdfjs from 'pdfjs-dist';
import { 
    Camera, 
    Download, 
    X, 
    Loader2, 
    UploadCloud,
    CheckCircle2,
    Zap, 
    ScanLine,
    Sparkles,
    Maximize,
    Move,
    FileText,
    ChevronRight,
    ChevronLeft,
    Trash2,
    RefreshCcw,
    Settings2,
    Plus,
    FileStack,
    Layers,
    Smartphone,
    Wand2,
    Eye,
    Droplets,
    Highlighter,
    Scan,
    Monitor,
    ImageIcon,
    ShieldCheck,
    Share2,
    Archive,
    FileArchive,
    Edit3,
    CheckCircle,
    LayoutGrid,
    BrainCircuit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import { motion, AnimatePresence } from 'framer-motion';
import { enhancePhoto } from '@/ai/flows/enhance-photo-flow';

const PDF_JS_VERSION = '4.2.67';
if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDF_JS_VERSION}/pdf.worker.min.mjs`;
}

interface Point { x: number; y: number; }

function solvePerspective(src: Point[], dst: Point[]) {
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
}

type ScanFilter = 'original' | 'magic' | 'document' | 'bw' | 'photo' | 'gray' | 'ai_enhance';
type Stage = 'viewfinder' | 'camera' | 'adjust';

interface ScannedPage {
    id: string;
    processedSrc: string;
    originalSrc: string;
    points: Point[];
    isScanned: boolean;
    originalIndex: number;
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

export default function DocumentScanner() {
  const { toast } = useToast();
  const [stage, setStage] = useState<Stage>('viewfinder');
  
  const [pendingPages, setPendingPages] = useState<ScannedPage[]>([]);
  const [scannedPages, setScannedPages] = useState<ScannedPage[]>([]);
  
  const [cropMode, setCropMode] = useState<'rect' | 'scanner'>('scanner');
  const [activeFilter, setActiveFilter] = useState<ScanFilter>('document');
  
  const [brightness, setBrightness] = useState([145]);
  const [contrast, setContrast] = useState([96]);
  const [saturation, setSaturation] = useState([70]);
  const [sharpness, setSharpness] = useState([2.5]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const [currentRawImage, setCurrentRawImage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [liveResultSrc, setLiveResultSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isImageReady, setIsImageReady] = useState(false);
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{current: number, total: number} | null>(null);

  // Initialize with 8 points for the magnet logic
  const [points, setPoints] = useState<Point[]>([
    { x: 10, y: 10 }, { x: 50, y: 10 }, { x: 90, y: 10 }, 
    { x: 90, y: 50 }, { x: 90, y: 90 },                   
    { x: 50, y: 90 }, { x: 10, y: 90 },                   
    { x: 10, y: 50 }                                      
  ]);
  const [draggingPoint, setDraggingPoint] = useState<number | null>(null);
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 });
  
  const [rectCrop, setRectCrop] = useState<Crop>();
  const [completedRectCrop, setCompletedRectCrop] = useState<PixelCrop>();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const startCamera = async () => {
    setIsCameraStarting(true);
    setStage('camera');
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } 
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
        toast({ variant: 'destructive', title: 'Camera Error', description: 'Using native camera app.' });
        cameraInputRef.current?.click();
    } finally {
        setIsCameraStarting(false);
    }
  };

  const stopCamera = () => {
      if (videoRef.current?.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
      }
  };

  const captureFrame = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.drawImage(video, 0, 0);
        const data = canvas.toDataURL('image/jpeg', 1.0);
        setCurrentRawImage(data);
        setEditingId(null);
        setIsImageReady(false);
        stopCamera();
        setStage('adjust');
    }
  };

  const resetAdjustments = () => {
      setBrightness([100]); setContrast([100]); setSaturation([100]); setSharpness([0]);
      setActiveFilter('original');
  };

  const handleFilesUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const filesList = e.target.files;
    if (!filesList || filesList.length === 0) return;

    setIsProcessing(true);
    const filesArray = Array.from(filesList);
    setBatchProgress({ current: 0, total: filesArray.length });

    const newPages: ScannedPage[] = [];

    for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        setBatchProgress({ current: i + 1, total: filesArray.length });

        if (file.type === 'application/pdf') {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjs.getDocument({ 
                    data: new Uint8Array(arrayBuffer),
                    cMapUrl: `https://unpkg.com/pdfjs-dist@${PDF_JS_VERSION}/cmaps/`,
                    cMapPacked: true
                }).promise;

                for (let p = 1; p <= pdf.numPages; p++) {
                    const page = await pdf.getPage(p);
                    const viewport = page.getViewport({ scale: 2.0 });
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        canvas.width = viewport.width; canvas.height = viewport.height;
                        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, canvas.width, canvas.height);
                        await page.render({ canvasContext: ctx, viewport }).promise;
                        const data = canvas.toDataURL('image/jpeg', 0.9);
                        newPages.push({
                            id: Math.random().toString(36).substr(2, 9),
                            originalSrc: data, processedSrc: data, isScanned: false,
                            originalIndex: p, 
                            points: [{ x: 10, y: 10 }, { x: 50, y: 10 }, { x: 90, y: 10 }, { x: 90, y: 50 }, { x: 90, y: 90 }, { x: 50, y: 90 }, { x: 10, y: 90 }, { x: 10, y: 50 }]
                        });
                    }
                }
            } catch (err) {
                toast({ variant: 'destructive', title: 'PDF Error' });
            }
        } else if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            const dataUrl = await new Promise<string>((resolve) => {
                reader.onload = (ev) => resolve(ev.target?.result as string);
                reader.readAsDataURL(file);
            });
            newPages.push({
                id: Math.random().toString(36).substr(2, 9),
                originalSrc: dataUrl, processedSrc: dataUrl, isScanned: false,
                originalIndex: pendingPages.length + scannedPages.length + newPages.length + 1,
                points: [{ x: 10, y: 10 }, { x: 50, y: 10 }, { x: 90, y: 10 }, { x: 90, y: 50 }, { x: 90, y: 90 }, { x: 50, y: 90 }, { x: 10, y: 90 }, { x: 10, y: 50 }]
            });
        }
    }

    setPendingPages(prev => [...prev, ...newPages]);
    setIsProcessing(false);
    setBatchProgress(null);
  };

  const handleEditPage = (page: ScannedPage) => {
      setCurrentRawImage(page.originalSrc);
      setEditingId(page.id);
      setPoints(page.points);
      setStage('adjust');
      setIsImageReady(false);
  };

  const handleAiEnhance = async () => {
    if (!currentRawImage) return;
    setIsAiProcessing(true);
    try {
        const result = await enhancePhoto({ photoDataUri: currentRawImage });
        if (result?.imageDataUri) {
            setCurrentRawImage(result.imageDataUri);
            setActiveFilter('ai_enhance');
            toast({ title: "AI Enhancement Ready", description: "Image optimized using Neural details." });
        }
    } catch (error) {
        toast({ variant: 'destructive', title: "AI Error", description: "Could not enhance image via cloud." });
    } finally {
        setIsAiProcessing(false);
    }
  };

  const applyIntelligentScan = useCallback(async (isHighRes = false): Promise<string> => {
    const image = imgRef.current;
    if (!image || !currentRawImage || !image.naturalWidth) return "";
    const cropCanvas = document.createElement('canvas');
    const cCtx = cropCanvas.getContext('2d', { willReadFrequently: true });
    if (!cCtx) return "";

    const originalWidth = image.naturalWidth;
    const originalHeight = image.naturalHeight;
    const activeScale = isHighRes ? 1 : Math.min(1, 1200 / Math.max(originalWidth, originalHeight));
    const workW = Math.round(originalWidth * activeScale);
    const workH = Math.round(originalHeight * activeScale);

    if (cropMode === 'rect') {
        const c = completedRectCrop;
        if (!c) return "";
        const scaleX = originalWidth / image.width;
        const scaleY = originalHeight / image.height;
        cropCanvas.width = Math.max(10, Math.round(c.width * scaleX * activeScale));
        cropCanvas.height = Math.max(10, Math.round(c.height * scaleY * activeScale));
        cCtx.drawImage(image, c.x * scaleX, c.y * scaleY, c.width * scaleX, c.height * scaleY, 0, 0, cropCanvas.width, cropCanvas.height);
    } else {
        const corners = [points[0], points[2], points[4], points[6]].map(p => ({ x: (p.x / 100) * workW, y: (p.y / 100) * workH }));
        const w1 = Math.hypot(corners[1].x - corners[0].x, corners[1].y - corners[0].y);
        const w2 = Math.hypot(corners[2].x - corners[3].x, corners[2].y - corners[3].y);
        const h1 = Math.hypot(corners[3].x - corners[0].x, corners[3].y - corners[0].y);
        const h2 = Math.hypot(corners[2].x - corners[1].x, corners[2].y - corners[1].y);
        const tw = Math.max(10, Math.floor(Math.max(w1, w2)));
        const th = Math.max(10, Math.floor(Math.max(h1, h2)));
        cropCanvas.width = tw; cropCanvas.height = th;
        const dstPoints = [{ x: 0, y: 0 }, { x: tw, y: 0 }, { x: tw, y: th }, { x: 0, y: th }];
        const h = solvePerspective(dstPoints, corners);
        const imgData = cCtx.createImageData(tw, th);
        const srcCanvas = document.createElement('canvas');
        srcCanvas.width = workW; srcCanvas.height = workH;
        const srcCtx = srcCanvas.getContext('2d');
        srcCtx?.drawImage(image, 0, 0, workW, workH);
        const srcPixels = srcCtx?.getImageData(0, 0, workW, workH).data;
        if (srcPixels) {
            for (let y = 0; y < th; y++) {
                for (let x = 0; x < tw; x++) {
                    const z = h[6] * x + h[7] * y + 1;
                    const sx = Math.floor((h[0] * x + h[1] * y + h[2]) / z);
                    const sy = Math.floor((h[3] * x + h[4] * y + h[5]) / z);
                    if (sx >= 0 && sx < workW && sy >= 0 && sy < workH) {
                        const di = (y * tw + x) * 4, si = (sy * workW + sx) * 4;
                        imgData.data[di] = srcPixels[si]; imgData.data[di+1] = srcPixels[si+1]; imgData.data[di+2] = srcPixels[si+2]; imgData.data[di+3] = srcPixels[si+3];
                    }
                }
            }
            cCtx.putImageData(imgData, 0, 0);
        }
    }

    if (draggingPoint === null || isHighRes) {
        const imageData = cCtx.getImageData(0, 0, cropCanvas.width, cropCanvas.height);
        const pixels = imageData.data;
        const bF = brightness[0] / 100, cF = contrast[0] / 100, sF = saturation[0] / 100;
        for (let i = 0; i < pixels.length; i += 4) {
            let r = pixels[i], g = pixels[i+1], b = pixels[i+2];
            const luma = 0.299 * r + 0.587 * g + 0.114 * b;
            if (activeFilter === 'bw') r = g = b = luma > 128 ? 255 : 0;
            else if (activeFilter === 'document') { r = g = b = luma > 180 ? 255 : luma < 100 ? luma * 0.7 : luma; }
            else if (activeFilter === 'gray') { r = g = b = luma; }
            else if (activeFilter === 'photo') { r = Math.min(255, r * 1.05); g = Math.min(255, g * 1.05); b = Math.min(255, b * 1.05); }
            else if (activeFilter === 'magic' || activeFilter === 'ai_enhance') { r = Math.min(255, r * 1.15); g = Math.min(255, g * 1.15); b = Math.min(255, b * 1.15); }
            
            if (activeFilter !== 'bw' && activeFilter !== 'gray') { r = luma + (r - luma) * sF; g = luma + (g - luma) * sF; b = luma + (b - luma) * sF; }
            pixels[i] = Math.max(0, Math.min(255, ((r / 255 - 0.5) * cF + 0.5) * 255 * bF));
            pixels[i+1] = Math.max(0, Math.min(255, ((g / 255 - 0.5) * cF + 0.5) * 255 * bF));
            pixels[i+2] = Math.max(0, Math.min(255, ((b / 255 - 0.5) * cF + 0.5) * 255 * bF));
        }
        cCtx.putImageData(imageData, 0, 0);
        if (sharpness[0] > 0) {
            const factor = sharpness[0] / 3.0;
            const weights = [0, -factor, 0, -factor, 1 + (4 * factor), -factor, 0, -factor, 0];
            const curData = cCtx.getImageData(0, 0, cropCanvas.width, cropCanvas.height);
            const src = curData.data, out = cCtx.createImageData(cropCanvas.width, cropCanvas.height), dst = out.data;
            for (let y = 0; y < cropCanvas.height; y++) {
                for (let x = 0; x < cropCanvas.width; x++) {
                    const i = (y * cropCanvas.width + x) * 4;
                    let r = 0, g = 0, b = 0;
                    for (let ky = -1; ky <= 1; ky++) {
                        for (let kx = -1; kx <= 1; kx++) {
                            const sy = Math.min(cropCanvas.height - 1, Math.max(0, y + ky)), sx = Math.min(cropCanvas.width - 1, Math.max(0, x + kx));
                            const si = (sy * cropCanvas.width + sx) * 4, wt = weights[(ky + 1) * 3 + (kx + 1)];
                            r += src[si] * wt; g += src[si + 1] * wt; b += src[si + 2] * wt;
                        }
                    }
                    dst[i] = Math.max(0, Math.min(255, r)); dst[i+1] = Math.max(0, Math.min(255, g)); dst[i+2] = Math.max(0, Math.min(255, b)); dst[i+3] = src[i+3];
                }
            }
            cCtx.putImageData(out, 0, 0);
        }
    }
    return cropCanvas.toDataURL('image/jpeg', isHighRes ? 0.95 : 0.6);
  }, [currentRawImage, cropMode, points, activeFilter, completedRectCrop, brightness, contrast, saturation, sharpness, draggingPoint]);

  useEffect(() => {
    if (stage === 'adjust' && currentRawImage && isImageReady) {
        const timer = setTimeout(async () => {
            const res = await applyIntelligentScan(false);
            setLiveResultSrc(res);
        }, 10); 
        return () => clearTimeout(timer);
    }
  }, [points, activeFilter, cropMode, completedRectCrop, stage, currentRawImage, isImageReady, applyIntelligentScan, brightness, contrast, saturation, sharpness]);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop({ unit: '%', width: 90, height: 90 }, width, height);
    setRectCrop(initialCrop);
    setCompletedRectCrop({
        unit: 'px',
        x: (initialCrop.x / 100) * width,
        y: (initialCrop.y / 100) * height,
        width: (initialCrop.width / 100) * width,
        height: (initialCrop.height / 100) * height
    });
    setPoints([{ x: 10, y: 10 }, { x: 50, y: 10 }, { x: 90, y: 10 }, { x: 90, y: 50 }, { x: 90, y: 90 }, { x: 50, y: 90 }, { x: 10, y: 90 }, { x: 10, y: 50 }]);
    setIsImageReady(true);
  };

  const handleConfirmAdd = async (goToNext = false) => {
    setIsProcessing(true);
    const highRes = await applyIntelligentScan(true);
    const id = editingId || Math.random().toString(36).substr(2, 9);
    
    const sourceData = pendingPages.find(p => p.id === id) || scannedPages.find(p => p.id === id);
    const originalIndex = sourceData?.originalIndex || (scannedPages.length + 1);

    const newPage: ScannedPage = { id, originalSrc: currentRawImage!, processedSrc: highRes, points, isScanned: true, originalIndex };
    
    const remainingPending = pendingPages.filter(p => p.id !== id);
    setPendingPages(remainingPending);
    
    setScannedPages(prev => {
        const filtered = prev.filter(p => p.id !== id);
        return [...filtered, newPage].sort((a,b) => a.originalIndex - b.originalIndex);
    });
    
    if (goToNext && remainingPending.length > 0) {
        const next = remainingPending[0];
        setCurrentRawImage(next.originalSrc);
        setEditingId(next.id);
        setPoints(next.points);
        setIsImageReady(false);
        setLiveResultSrc(null);
        toast({ title: "Saved", description: "Loading next pending page..." });
    } else {
        setCurrentRawImage(null); setLiveResultSrc(null); setStage('viewfinder');
        toast({ title: "Scanning Complete" });
    }
    setIsProcessing(false);
  };

  const handleNavigate = (direction: number) => {
      if (pendingPages.length <= 1 || !editingId) return;
      
      const updatedPending = pendingPages.map(p => p.id === editingId ? { ...p, points } : p);
      setPendingPages(updatedPending);

      const currentIndex = updatedPending.findIndex(p => p.id === editingId);
      const nextIndex = (currentIndex + direction + updatedPending.length) % updatedPending.length;
      const nextItem = updatedPending[nextIndex];

      setEditingId(nextItem.id);
      setCurrentRawImage(nextItem.originalSrc);
      setPoints(nextItem.points);
      setIsImageReady(false);
      setLiveResultSrc(null);
  };

  const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (draggingPoint === null || !containerRef.current || !points[draggingPoint]) return;
    if (e.cancelable) e.preventDefault();
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

  const handleDownloadPdf = async () => {
    if (scannedPages.length === 0) return;
    setIsProcessing(true);
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth(), pageHeight = pdf.internal.pageSize.getHeight();
    for (let i = 0; i < scannedPages.length; i++) {
        if (i > 0) pdf.addPage();
        const p = scannedPages[i];
        const img = new window.Image(); img.src = p.processedSrc;
        await new Promise((resolve) => {
            img.onload = () => {
                const props = pdf.getImageProperties(img);
                const ratio = Math.min(pageWidth / props.width, pageHeight / props.height);
                const fw = props.width * ratio, fh = props.height * ratio;
                pdf.addImage(p.processedSrc, 'JPEG', (pageWidth - fw) / 2, (pageHeight - fh) / 2, fw, fh, undefined, 'FAST');
                resolve(null);
            };
        });
    }
    pdf.save(`Scan-Bundle-${Date.now()}.pdf`);
    setIsProcessing(false);
  };

  const handleDownloadIndividualJpg = (page: ScannedPage, index: number) => {
      const link = document.createElement('a');
      link.href = page.processedSrc; link.download = `Scanned-Page-${page.originalIndex}.jpg`;
      link.click();
  };

  const handleDownloadJpgAll = async () => {
    if (scannedPages.length === 0) return;
    setIsProcessing(true);
    if (scannedPages.length === 1) handleDownloadIndividualJpg(scannedPages[0], 0);
    else {
        const zip = new JSZip();
        scannedPages.forEach((p) => zip.file(`Page-${p.originalIndex}.jpg`, p.processedSrc.split(',')[1], { base64: true }));
        const blob = await zip.generateAsync({ type: "blob" });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob); link.download = `Scans-${Date.now()}.zip`;
        link.click();
    }
    setIsProcessing(false);
  };

  const handleShare = async () => {
      if (scannedPages.length === 0 || !navigator.share) return;
      setIsSharing(true);
      try {
          const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
          const pageWidth = pdf.internal.pageSize.getWidth(), pageHeight = pdf.internal.pageSize.getHeight();
          for (let i = 0; i < scannedPages.length; i++) {
              if (i > 0) pdf.addPage();
              const p = scannedPages[i];
              const img = new window.Image(); img.src = p.processedSrc;
              await new Promise((r) => { img.onload = () => {
                  const props = pdf.getImageProperties(img);
                  const ratio = Math.min(pageWidth / props.width, pageHeight / props.height);
                  pdf.addImage(p.processedSrc, 'JPEG', (pageWidth - props.width * ratio) / 2, (pageHeight - props.height * ratio) / 2, props.width * ratio, props.height * ratio, undefined, 'FAST');
                  r(null);
              }; });
          }
          const blob = pdf.output('blob');
          const file = new File([blob], "Scanned_Document.pdf", { type: "application/pdf" });
          await navigator.share({ 
              files: [file], 
              title: "Scanned Document", 
              text: "Sent via GR7 Tools - https://www.gr7imagepdf.com/" 
          });
      } catch (e) { console.error(e); } finally { setIsSharing(false); }
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-700 relative mt-4 overflow-x-hidden">
        
        {stage === 'viewfinder' && (
            <div className="grid lg:grid-cols-12 gap-8 items-stretch w-full px-4 min-h-[70vh]">
                
                <div className="lg:col-span-4 flex flex-col">
                    <Card className="border-2 shadow-lg flex flex-col bg-card/50 rounded-[3rem] flex-1">
                        <CardHeader className="bg-muted/30 border-b p-6 flex items-center justify-between">
                            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                <LayoutGrid className="size-4 text-primary" /> PAGES TO SCAN ({pendingPages.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-6">
                            {pendingPages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                                    <ImageIcon className="size-12 mb-4" />
                                    <p className="text-[10px] font-black uppercase">Import PDF to see pages</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                    {pendingPages.map((p) => (
                                        <Card key={p.id} className="relative group overflow-hidden border-2 bg-white dark:bg-slate-900 shadow-sm flex flex-col rounded-2xl animate-in slide-in-from-bottom-2">
                                            <div className="relative aspect-[3/4] overflow-hidden bg-slate-100 cursor-pointer" onClick={() => handleEditPage(p)}>
                                                <img src={p.originalSrc} className="size-full object-cover grayscale opacity-60 transition-all group-hover:grayscale-0 group-hover:opacity-100" alt="p" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                                    <Button size="sm" variant="secondary" className="font-black text-[9px] uppercase px-3 h-8 rounded-lg shadow-xl"><Scan className="size-3 mr-1" /> Scan</Button>
                                                </div>
                                                <div className="absolute top-2 left-2 size-6 rounded-md bg-black/60 backdrop-blur-md flex items-center justify-center text-[8px] font-black text-white">#{p.originalIndex}</div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="p-6 border-t flex flex-col gap-3 shrink-0">
                            <Button variant="outline" className="w-full h-12 border-2 border-dashed font-black uppercase text-[10px] rounded-xl hover:bg-primary/5 text-primary border-primary/20" onClick={() => fileInputRef.current?.click()}>
                                <Plus className="size-4 mr-2" /> Import PDF / Images
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                <div className="lg:col-span-4 flex flex-col">
                    <Card className="w-full border-2 border-dashed bg-card/50 text-center rounded-[3rem] overflow-hidden shadow-lg hover:border-primary/40 transition-all flex-1 flex flex-col justify-center">
                        <CardHeader className="pt-8 pb-4 shrink-0">
                            <div className="mx-auto mb-4 grid size-16 place-items-center rounded-3xl bg-primary/10 text-primary shadow-xl"><ScanLine className="size-8" /></div>
                            <CardTitle className="text-3xl font-black uppercase tracking-tighter">Capture <span className="text-primary">Studio</span></CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col items-center justify-center gap-6 p-10">
                             <div className="grid gap-4 w-full max-w-xs">
                                <Button className="h-16 rounded-2xl bg-primary text-white font-black text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all group" onClick={startCamera}>
                                    <Camera className="size-6 mr-3 group-hover:rotate-12 transition-transform" /> LIVE CAMERA
                                </Button>
                                <Button variant="secondary" className="h-14 rounded-2xl bg-white dark:bg-slate-900 border-2 font-black text-xs shadow-xl" onClick={() => fileInputRef.current?.click()}>
                                    <Plus className="size-5 mr-3 text-emerald-500" /> IMPORT PDF / IMAGES
                                </Button>
                             </div>
                             <div className="p-4 bg-muted/20 rounded-2xl border border-dashed text-center">
                                 <p className="text-[9px] font-bold text-muted-foreground uppercase leading-relaxed tracking-widest">Scanner moves pages from left box to right box upon confirmation.</p>
                             </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-4 flex flex-col">
                    <Card className="border-2 shadow-lg flex flex-col bg-card/50 rounded-[3rem] flex-1">
                        <CardHeader className="bg-emerald-500/5 border-b p-6 flex items-center justify-between">
                            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-emerald-600"><CheckCircle className="size-4" /> SCANNED RESULTS ({scannedPages.length})</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-6">
                            {scannedPages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                                    <FileArchive className="size-12 mb-4" />
                                    <p className="text-[10px] font-black uppercase">No Scanned Results Yet</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar pr-2">
                                    {scannedPages.map((p) => (
                                        <Card key={p.id} className="relative group overflow-hidden border-2 bg-white dark:bg-slate-900 shadow-xl flex flex-col rounded-2xl animate-in zoom-in-95">
                                            <div className="relative aspect-[3/4] overflow-hidden bg-slate-100 cursor-pointer" onClick={() => handleEditPage(p)}>
                                                <img src={p.processedSrc} className="size-full object-cover" alt="p" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                                    <Button size="sm" variant="secondary" className="font-black text-[9px] uppercase px-3 h-8 rounded-lg shadow-xl"><Edit3 className="size-3 mr-1" /> Edit</Button>
                                                </div>
                                                <div className="absolute top-2 left-2 size-6 rounded-md bg-green-600 backdrop-blur-md flex items-center justify-center text-[8px] font-black text-white border border-white/10 shadow-lg">✓ P{p.originalIndex}</div>
                                            </div>
                                            <div className="p-2 bg-emerald-500/5 border-t border-emerald-500/20 flex flex-col gap-2">
                                                <Button 
                                                    size="sm" 
                                                    className="w-full h-9 text-[9px] font-black uppercase rounded-lg shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white" 
                                                    onClick={() => handleDownloadIndividualJpg(p, 0)}
                                                >
                                                    <Download className="size-3 mr-1.5" /> SAVE JPG
                                                </Button>
                                                <div className="flex gap-1">
                                                    <Button size="icon" variant="ghost" className="flex-1 h-7 rounded-md hover:bg-rose-50 text-rose-500" onClick={() => setScannedPages(prev => prev.filter(pg => pg.id !== p.id))}><Trash2 className="size-3" /></Button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="p-6 border-t flex flex-col gap-3 shrink-0 bg-muted/5">
                            <Button disabled={scannedPages.length === 0} className="magic-button w-full h-14 bg-primary font-black rounded-2xl shadow-xl transition-all text-white hover:text-primary-foreground border-4 border-primary" onClick={handleDownloadPdf}>
                                <StarIcons />
                                <FileText className="size-4 mr-2" />
                                <span className="uppercase text-xs tracking-widest">DOWNLOAD FULL PDF</span>
                            </Button>
                            <div className="grid grid-cols-2 gap-3 w-full">
                                <Button variant="outline" disabled={scannedPages.length === 0} className="h-12 border-2 font-black uppercase text-[10px] rounded-xl hover:bg-emerald-600 hover:text-white text-emerald-600 border-emerald-100 transition-colors" onClick={handleDownloadJpgAll}><Archive className="mr-2 size-3" /> ZIP BUNDLE</Button>
                                <Button variant="outline" disabled={scannedPages.length === 0} className="h-12 border-2 font-black uppercase text-[10px] rounded-xl hover:bg-blue-600 hover:text-white text-blue-600 border-blue-100 transition-colors" onClick={handleShare}>{isSharing ? <Loader2 className="animate-spin size-3 mr-2" /> : <Share2 className="mr-2 size-3" />} SHARE</Button>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        )}

        {stage === 'camera' && (
            <div className="flex flex-col items-center justify-center px-4 animate-in zoom-in-95 duration-500 min-h-[60vh]">
                <Card className="w-full max-w-3xl border-none shadow-3xl rounded-[3rem] overflow-hidden bg-black relative">
                    <div className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-xl rounded-full border border-white/10 text-white text-[10px] font-black uppercase tracking-widest"><ScanLine className="size-3 text-primary animate-pulse" /> Live Viewfinder</div>
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-auto object-contain max-h-[75vh]" />
                    {isCameraStarting && <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-4"><Loader2 className="size-12 animate-spin text-primary" /><p className="text-[10px] font-black uppercase text-white">Opening Camera...</p></div>}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-6">
                        <Button className="size-20 rounded-full bg-white text-black p-0 shadow-3xl hover:scale-110 active:scale-95 transition-all ring-8 ring-white/20 border-8 border-slate-900" onClick={captureFrame}><Camera className="size-10"/></Button>
                        <Button variant="ghost" onClick={() => { stopCamera(); setStage('viewfinder'); }} className="bg-black/40 text-white hover:bg-black/60 rounded-full px-6 font-black uppercase text-[10px] border border-white/10">Cancel</Button>
                    </div>
                </Card>
            </div>
        )}

        {stage === 'adjust' && currentRawImage && (
            <div className="grid lg:grid-cols-12 gap-8 items-stretch animate-in slide-in-from-bottom-6 duration-500 w-full px-4 max-w-[1800px] mx-auto h-auto">
                <Card className="lg:col-span-7 border-2 shadow-xl overflow-hidden rounded-[3rem] bg-card flex flex-col h-full">
                    <CardHeader className="bg-muted/30 border-b p-4 md:p-5 flex flex-row items-center justify-between shrink-0">
                        <div className="flex items-center gap-4"><div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shadow-lg border border-primary/20"><ScanLine className="size-5" /></div><CardTitle className="text-xl font-black uppercase tracking-tighter">1. CORNER MAPPING</CardTitle></div>
                        <div className="flex items-center gap-4">
                            <Tabs value={cropMode} onValueChange={(v) => setCropMode(v as any)} className="bg-background/50 p-1 rounded-xl border">
                                <TabsList className="h-9 w-[160px]">
                                    <TabsTrigger value="rect" className="text-[10px] font-black uppercase">RECT</TabsTrigger>
                                    <TabsTrigger value="scanner" className="text-[10px] font-black uppercase">SCANNER</TabsTrigger>
                                </TabsList>
                            </Tabs>
                            <Button variant="ghost" className="h-9 w-9 rounded-full text-destructive" onClick={() => setStage('viewfinder')}><X className="size-5"/></Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex flex-col items-center justify-center relative overflow-hidden select-none bg-slate-200 dark:bg-black/40 flex-1"
                                 onMouseMove={handleMouseMove} onTouchMove={handleMouseMove} onMouseUp={() => setDraggingPoint(null)} onTouchEnd={() => setDraggingPoint(null)}>
                        <div ref={containerRef} className="relative cursor-crosshair transform-gpu bg-white max-w-[95%] my-10 shadow-3xl border-4 border-white" style={{ touchAction: 'none' }}>
                            {cropMode === 'rect' ? (
                                <ReactCrop crop={crop} onChange={(c) => setCrop(c)} onComplete={c => setCompletedRectCrop(c)}>
                                    <img ref={imgRef} src={currentRawImage} alt="s" className="max-h-[65vh] w-auto block" onLoad={onImageLoad} />
                                </ReactCrop>
                            ) : (
                                <div className="relative">
                                    <img ref={imgRef} src={currentRawImage} alt="s" className="max-h-[65vh] w-auto pointer-events-none block" onLoad={onImageLoad} />
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                        <polygon points={`${points[0].x},${points[0].y} ${points[2].x},${points[2].y} ${points[4].x},${points[4].y} ${points[6].x},${points[6].y}`} className="fill-primary/10 stroke-primary stroke-[0.8] dash-array-[5,5]" />
                                    </svg>
                                    {points.map((p, i) => (
                                        <div key={i} className={cn("absolute size-10 -ml-5 -mt-5 rounded-full border-4 border-primary shadow-2xl cursor-grab transition-transform z-20 flex items-center justify-center", draggingPoint === i ? "bg-white scale-125" : "bg-white/90")}
                                            style={{ left: `${p.x}%`, top: `${p.y}%`, touchAction: 'none' }} onMouseDown={(e) => handlePointDown(i, e)} onTouchStart={(e) => handlePointDown(i, e)}><div className="size-2.5 bg-primary rounded-full" /></div>
                                    ))}
                                    {draggingPoint !== null && (
                                        <div className="absolute top-2 left-1/2 -translate-x-1/2 pointer-events-none z-50 overflow-hidden size-40 rounded-full border-4 border-primary shadow-3xl bg-white animate-in zoom-in-50">
                                            <img src={currentRawImage} alt="m" className="absolute max-w-none origin-top-left" style={{ width: `${(imgRef.current?.width || 0) * 4}px`, height: `${(imgRef.current?.height || 0) * 4}px`, left: `calc(50% - ${(magnifierPos.x / 100) * (imgRef.current?.width || 0) * 4}px)`, top: `calc(50% - ${(magnifierPos.y / 100) * (imgRef.current?.height || 0) * 4}px)` }} />
                                            <div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-px bg-primary/40 absolute"/><div className="h-full w-px bg-primary/40 absolute"/></div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="bg-muted/10 p-6 border-t shrink-0 flex justify-center gap-4">
                        <Button variant="outline" className="h-14 px-8 rounded-2xl border-2 font-black text-xs uppercase" onClick={() => handleNavigate(-1)} disabled={pendingPages.length <= 1}>
                            <ChevronLeftIcon className="mr-1.5 size-4" /> PREVIOUS
                        </Button>
                        <Button className="h-14 px-12 rounded-2xl bg-primary text-primary-foreground font-black text-lg shadow-2xl active:scale-95 transition-all group" onClick={() => handleConfirmAdd(false)}>
                            <CheckCircle2 className="mr-2 size-5" /> CONFIRM & ADD
                        </Button>
                        <Button variant="outline" className="h-14 px-8 rounded-2xl border-2 font-black text-xs uppercase" onClick={() => handleConfirmAdd(true)} disabled={pendingPages.length <= 1}>
                            NEXT <ChevronRightIcon className="ml-1.5 size-4" />
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="lg:col-span-5 border-2 shadow-xl overflow-hidden rounded-[3rem] bg-card flex flex-col h-full">
                    <CardHeader className="bg-[#f0f9f9] dark:bg-slate-800 border-b p-4 md:p-5 shrink-0"><CardTitle className="text-xl font-black uppercase tracking-tighter">2. HD PREVIEW & FINE-TUNE</CardTitle></CardHeader>
                    <CardContent className="flex-1 p-4 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 shadow-inner relative overflow-hidden h-full">
                        <div className="relative bg-white shadow-lg border-[6px] border-white w-full max-w-[400px] flex items-center justify-center overflow-hidden">
                            {liveResultSrc ? <img src={liveResultSrc} className="max-w-full max-h-[65vh] object-contain block animate-in fade-in zoom-in-95 duration-500" alt="r" /> : <Loader2 className="animate-spin size-12 text-primary opacity-20" />}
                            {(isProcessing || isAiProcessing) && (
                                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-10">
                                    <Loader2 className="animate-spin size-8 text-primary" />
                                    <p className="text-[8px] font-black uppercase tracking-widest text-primary animate-pulse">
                                        {isAiProcessing ? 'AI Enhancing...' : 'Rendering...'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="p-4 md:p-6 border-t bg-[#f0f9f9] dark:bg-slate-800 flex-col gap-6 shrink-0">
                        <div className="w-full space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-[10px] font-black uppercase opacity-60">Fidelity Filters</Label>
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={handleAiEnhance} 
                                    disabled={isAiProcessing}
                                    className={cn("h-7 px-4 rounded-full border-2 font-black text-[8px] uppercase", activeFilter === 'ai_enhance' ? "bg-primary text-white border-primary" : "bg-primary/5 text-primary border-primary/20")}
                                >
                                    {isAiProcessing ? <Loader2 className="size-2.5 animate-spin mr-1" /> : <BrainCircuit className="size-2.5 mr-1" />}
                                    AI ENHANCE
                                </Button>
                            </div>
                            <div className="grid grid-cols-6 gap-1 w-full">
                                <FilterBtn active={activeFilter === 'document'} label="Doc" icon={FileText} onClick={() => { setActiveFilter('document'); setBrightness([145]); setContrast([96]); setSaturation([70]); }} />
                                <FilterBtn active={activeFilter === 'magic'} label="Magic" icon={Sparkles} onClick={() => { setActiveFilter('magic'); setBrightness([165]); setContrast([127]); setSaturation([107]); }} />
                                <FilterBtn active={activeFilter === 'bw'} label="BW" icon={Highlighter} onClick={() => { setActiveFilter('bw'); setBrightness([120]); setContrast([150]); }} />
                                <FilterBtn active={activeFilter === 'photo'} label="Photo" icon={ImageIcon} onClick={() => { setActiveFilter('photo'); setBrightness([100]); setContrast([110]); setSaturation([105]); }} />
                                <FilterBtn active={activeFilter === 'gray'} label="Gray" icon={Droplets} onClick={() => { setActiveFilter('gray'); setBrightness([110]); setContrast([115]); setSaturation([0]); }} />
                                <FilterBtn active={activeFilter === 'original'} label="None" icon={ImageIcon} onClick={() => { setActiveFilter('original'); setBrightness([100]); setContrast([100]); setSaturation([100]); }} />
                            </div>
                        </div>
                        <div className="w-full space-y-4 pt-4 border-t border-white/10">
                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                <div className="space-y-1.5"><div className="flex justify-between text-[8px] font-black uppercase text-muted-foreground"><span>Exposure</span><span>{brightness[0]}%</span></div><Slider min={50} max={250} step={1} value={brightness} onValueChange={setBrightness} /></div>
                                <div className="space-y-1.5"><div className="flex justify-between text-[8px] font-black uppercase text-muted-foreground"><span>Saturation</span><span>{saturation[0]}%</span></div><Slider min={0} max={200} step={1} value={saturation} onValueChange={setSaturation} /></div>
                                <div className="space-y-1.5"><div className="flex justify-between text-[8px] font-black uppercase text-muted-foreground"><span>Sharpness</span><span>{sharpness[0]}x</span></div><Slider min={0} max={10} step={0.1} value={sharpness} onValueChange={setSharpness} /></div>
                                <div className="space-y-1.5"><div className="flex justify-between text-[8px] font-black uppercase text-muted-foreground"><span>Contrast</span><span>{contrast[0]}%</span></div><Slider min={50} max={250} step={1} value={contrast} onValueChange={setContrast} /></div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button variant="outline" size="sm" onClick={resetAdjustments} className="w-full h-10 text-[9px] font-black uppercase border-2 rounded-lg"><RefreshCcw className="size-3 mr-2" /> Reset Tuning</Button>
                            </div>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        )}

        <input ref={cameraInputRef} type="file" className="hidden" accept="image/*" capture="environment" onChange={handleFilesUpload} />
        <input ref={fileInputRef} type="file" className="hidden" accept="image/*,application/pdf" multiple onChange={handleFilesUpload} />
    </div>
  );
}

function FilterBtn({ active, label, icon: Icon, onClick }: { active: boolean, label: string, icon: any, onClick: () => void }) {
    return (
        <div className="flex flex-col items-center gap-1">
            <Button variant={active ? 'default' : 'outline'} size="icon" className={cn("h-10 w-10 rounded-xl shadow-md border-2 transition-all", active ? "bg-primary border-primary text-white scale-105" : "bg-white/50 border-white/20 hover:border-primary/40")} onClick={onClick}><Icon className="size-5"/></Button>
            <span className={cn("text-[7px] font-black uppercase", active ? "text-primary" : "text-muted-foreground")}>{label}</span>
        </div>
    );
}
