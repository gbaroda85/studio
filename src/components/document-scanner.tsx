
"use client";

import React, { useState, useRef, useEffect, useCallback, type ChangeEvent } from 'react';
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
    FileText,
    ChevronRight,
    Trash2,
    RefreshCcw,
    Settings2,
    Plus,
    FileStack,
    Layers,
    Smartphone,
    Wand2,
    Eye,
    Highlighter,
    Scan,
    Monitor,
    ImageIcon,
    ShieldCheck,
    Archive,
    FileArchive,
    RotateCw,
    ChevronLeft,
    Sun,
    Contrast,
    ArrowLeft,
    LayoutGrid,
    Move,
    Share2,
    Copyright,
    Type,
    Lock,
    EyeOff,
    Square
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { lockPdf } from "@/lib/pdf-utils";

// --- TYPES ---
export type FilterType = 'original' | 'photo' | 'bw' | 'document' | 'magic';
export type WatermarkPosition = 
    | 'top-left' | 'top-center' | 'top-right' 
    | 'center-left' | 'center-center' | 'center-right' 
    | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface Point {
  x: number;
  y: number;
}

interface ScannedPage {
    id: string;
    processedSrc: string;
    originalSrc: string;
    points: Point[];
    isScanned: boolean;
    originalIndex: number;
    rotation: number;
    hasBorder?: boolean;
    borderSize?: number;
}

type Stage = 'viewfinder' | 'camera' | 'adjust' | 'studio';

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

const WATERMARK_POSITIONS: WatermarkPosition[] = [
    'top-left', 'top-center', 'top-right',
    'center-left', 'center-center', 'center-right',
    'bottom-left', 'bottom-center', 'bottom-right'
];

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

export default function DocumentScanner() {
  const { toast } = useToast();
  const [stage, setStage] = useState<Stage>('viewfinder');
  
  const [pendingPages, setPendingPages] = useState<ScannedPage[]>([]);
  const [scannedPages, setScannedPages] = useState<ScannedPage[]>([]);
  const [activePendingIndex, setActivePendingIndex] = useState<number>(0);
  
  const [activeFilter, setActiveFilter] = useState<FilterType>('magic');
  const [brightness, setBrightness] = useState([100]);
  const [contrast, setContrast] = useState([100]);
  const [rotation, setRotation] = useState(0);
  const [showBorder, setShowBorder] = useState(false);
  const [borderWidth, setBorderWidth] = useState([5]);

  // Watermark States
  const [watermarkText, setWatermarkText] = useState("");
  const [watermarkOpacity, setWatermarkOpacity] = useState([30]);
  const [watermarkSize, setWatermarkSize] = useState([60]);
  const [watermarkMarginX, setWatermarkMarginX] = useState([40]);
  const [watermarkMarginY, setWatermarkMarginY] = useState([40]);
  const [watermarkRotation, setWatermarkRotation] = useState([45]);
  const [watermarkPosition, setWatermarkPosition] = useState<WatermarkPosition>('center-center');

  // Security States
  const [isSecured, setIsSecuring] = useState(false);
  const [pdfPassword, setPdfPassword] = useState("");
  const [showPdfPassword, setShowPdfPassword] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentRawImage, setCurrentRawImage] = useState<string | null>(null);
  const [flattenedSrc, setFlattenedSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [cvLoaded, setCvLoaded] = useState(false);

  const [points, setPoints] = useState<Point[]>([
    { x: 15, y: 15 }, { x: 85, y: 15 }, { x: 85, y: 85 }, { x: 15, y: 85 }
  ]);
  const [draggingPoint, setDraggingPoint] = useState<number | null>(null);
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [liveResultSrc, setLiveResultSrc] = useState<string | null>(null);

  // --- OPENCV LOADING ---
  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).cv) {
        const script = document.createElement('script');
        script.src = 'https://docs.opencv.org/4.10.0/opencv.js';
        script.async = true;
        script.onload = () => setCvLoaded(true);
        document.head.appendChild(script);
    } else if ((window as any).cv) {
        setCvLoaded(true);
    }
  }, []);

  const autoDetectDocument = async (imageSrc: string): Promise<Point[] | null> => {
    return new Promise((resolve) => {
        if (!(window as any).cv || !(window as any).cv.Mat) return resolve(null);
        const cv = (window as any).cv;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            let src = cv.imread(img);
            let gray = new cv.Mat();
            let blurred = new cv.Mat();
            let edges = new cv.Mat();
            let dilated = new cv.Mat();
            let contours = new cv.MatVector();
            let hierarchy = new cv.Mat();

            cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
            cv.GaussianBlur(gray, blurred, new cv.Size(7, 7), 0);
            cv.Canny(blurred, edges, 50, 150);
            
            const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(5, 5));
            cv.dilate(edges, dilated, kernel);
            cv.findContours(dilated, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

            let maxArea = 0;
            let bestPoints: Point[] | null = null;

            for (let i = 0; i < contours.size(); ++i) {
                let cnt = contours.get(i);
                let perimeter = cv.arcLength(cnt, true);
                let approx = new cv.Mat();
                cv.approxPolyDP(cnt, approx, 0.02 * perimeter, true);

                if (approx.rows === 4) {
                    let area = cv.contourArea(approx);
                    if (area > maxArea && area > (src.rows * src.cols * 0.10)) {
                        maxArea = area;
                        
                        let tempPoints = [];
                        for (let j = 0; j < 4; j++) {
                            tempPoints.push({
                                x: approx.data32S[j * 2],
                                y: approx.data32S[j * 2 + 1]
                            });
                        }

                        tempPoints.sort((a, b) => a.y - b.y);
                        let top = tempPoints.slice(0, 2).sort((a, b) => a.x - b.x);
                        let bottom = tempPoints.slice(2, 4).sort((a, b) => b.x - a.x);
                        
                        bestPoints = [
                            { x: (top[0].x / src.cols) * 100, y: (top[0].y / src.rows) * 100 },
                            { x: (top[1].x / src.cols) * 100, y: (top[1].y / src.rows) * 100 },
                            { x: (bottom[0].x / src.cols) * 100, y: (bottom[0].y / src.rows) * 100 },
                            { x: (bottom[1].x / src.cols) * 100, y: (bottom[1].y / src.rows) * 100 }
                        ];
                    }
                }
                approx.delete();
            }

            src.delete(); gray.delete(); blurred.delete(); edges.delete();
            dilated.delete(); kernel.delete();
            contours.delete(); hierarchy.delete();

            resolve(bestPoints);
        };
        img.src = imageSrc;
    });
  };

  /**
   * IMPROVED FILTER ENGINE
   * Implements advanced illumination mapping, unsharp mask sharpening,
   * and refined logic for Magic, BW, and Document modes.
   */
  const applyFrameDocFilter = async (imageSrc: string, filterType: FilterType): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        try {
            const img = await new Promise<HTMLImageElement>((res, rej) => {
                const i = new Image(); 
                i.crossOrigin = "anonymous";
                i.onload = () => res(i); 
                i.onerror = () => rej(new Error("Load failed"));
                i.src = imageSrc;
            });

            if (img.width === 0 || img.height === 0) {
                return reject(new Error("Source image dimensions are zero"));
            }

            const rot = rotation;
            const br = brightness[0];
            const cr = contrast[0];

            // STEP 1: Rotation
            const rotCanvas = document.createElement('canvas');
            if (rot === 90 || rot === 270) {
                rotCanvas.width = img.height;
                rotCanvas.height = img.width;
            } else {
                rotCanvas.width = img.width;
                rotCanvas.height = img.height;
            }
            const rotCtx = rotCanvas.getContext('2d')!;
            rotCtx.translate(rotCanvas.width / 2, rotCanvas.height / 2);
            rotCtx.rotate((rot * Math.PI) / 180);
            rotCtx.drawImage(img, -img.width / 2, -img.height / 2);

            // STEP 2: Brightness and Contrast
            const adjCanvas = document.createElement('canvas');
            adjCanvas.width = rotCanvas.width;
            adjCanvas.height = rotCanvas.height;
            const adjCtx = adjCanvas.getContext('2d')!;
            adjCtx.filter = `brightness(${br}%) contrast(${cr}%)`;
            adjCtx.drawImage(rotCanvas, 0, 0);

            let finalCanvas: HTMLCanvasElement;

            if (filterType === 'original') {
                finalCanvas = adjCanvas;
            } else if (filterType === 'photo') {
                const photoCanvas = document.createElement('canvas');
                photoCanvas.width = adjCanvas.width;
                photoCanvas.height = adjCanvas.height;
                const photoCtx = photoCanvas.getContext('2d')!;
                photoCtx.filter = 'saturate(1.1) contrast(1.05)';
                photoCtx.drawImage(adjCanvas, 0, 0);
                finalCanvas = photoCanvas;
            } else {
                // STEP 3: Shadow Removal & Advanced Filters (Illumination Mapping)
                const scale = 0.05; // 5% scale for lighting map
                const sw = Math.max(1, Math.floor(adjCanvas.width * scale));
                const sh = Math.max(1, Math.floor(adjCanvas.height * scale));
                
                const smallCanvas = document.createElement('canvas');
                smallCanvas.width = sw; smallCanvas.height = sh;
                const smallCtx = smallCanvas.getContext('2d')!;
                smallCtx.filter = 'blur(4px)';
                smallCtx.drawImage(adjCanvas, 0, 0, sw, sh);

                // Smoothly scale lighting map back
                const blurCanvas = document.createElement('canvas');
                blurCanvas.width = adjCanvas.width; blurCanvas.height = adjCanvas.height;
                const blurCtx = blurCanvas.getContext('2d')!;
                blurCtx.imageSmoothingEnabled = true;
                blurCtx.imageSmoothingQuality = 'high';
                blurCtx.drawImage(smallCanvas, 0, 0, sw, sh, 0, 0, adjCanvas.width, adjCanvas.height);
                const illumData = blurCtx.getImageData(0, 0, adjCanvas.width, adjCanvas.height).data;

                // Unsharp Mask (for sharpness)
                const usmCanvas = document.createElement('canvas');
                usmCanvas.width = adjCanvas.width; usmCanvas.height = adjCanvas.height;
                const usmCtx = usmCanvas.getContext('2d')!;
                usmCtx.filter = 'blur(2px)';
                usmCtx.drawImage(adjCanvas, 0, 0);
                const usmData = usmCtx.getImageData(0, 0, adjCanvas.width, adjCanvas.height).data;

                const origData = adjCtx.getImageData(0, 0, adjCanvas.width, adjCanvas.height).data;

                const normalizedCanvas = document.createElement('canvas');
                normalizedCanvas.width = adjCanvas.width; normalizedCanvas.height = adjCanvas.height;
                const normCtx = normalizedCanvas.getContext('2d')!;
                const outImageData = normCtx.createImageData(adjCanvas.width, adjCanvas.height);
                const data = outImageData.data;

                // Set thresholds based on filter
                let blackPoint = 60;
                let whitePoint = 230;
                if (filterType === 'magic') { blackPoint = 50; whitePoint = 190; }
                else if (filterType === 'bw') { blackPoint = 100; whitePoint = 180; }
                const range = whitePoint - blackPoint;

                // Pixel-by-pixel loop with advanced logic
                for (let i = 0; i < data.length; i += 4) {
                    const r0 = origData[i], g0 = origData[i+1], b0 = origData[i+2];
                    const ur = usmData[i], ug = usmData[i+1], ub = usmData[i+2];

                    // 1. Unsharp Mask (Sharpening)
                    let sharpenAmount = filterType === 'magic' ? 1.5 : (filterType === 'bw' ? 2.0 : 1.0);
                    let r = r0 + (r0 - ur) * sharpenAmount;
                    let g = g0 + (g0 - ug) * sharpenAmount;
                    let b = b0 + (b0 - ub) * sharpenAmount;
                    r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));

                    const ir = illumData[i], ig = illumData[i+1], ib = illumData[i+2];
                    const illumLum = ir * 0.299 + ig * 0.587 + ib * 0.114;
                    const chroma = Math.max(r, g, b) - Math.min(r, g, b); // Color intensity

                    // 2. Blending Factor for shadow removal
                    let illumBlend = (illumLum - 50) / (130 - 50);
                    if (chroma < 20) illumBlend += (20 - chroma) / 40;
                    illumBlend = Math.max(0, Math.min(1, illumBlend));

                    const factorR = (255 / Math.max(ir, 1)) * illumBlend + 1.0 * (1 - illumBlend);
                    const factorG = (255 / Math.max(ig, 1)) * illumBlend + 1.0 * (1 - illumBlend);
                    const factorB = (255 / Math.max(ib, 1)) * illumBlend + 1.0 * (1 - illumBlend);

                    const dr = Math.min(255, r * factorR);
                    const dg = Math.min(255, g * factorG);
                    const db = Math.min(255, b * factorB);

                    const lum = dr * 0.299 + dg * 0.587 + db * 0.114;

                    // 3. Filter specific logic
                    if (filterType === 'bw') {
                        let v = lum < blackPoint ? 0 : lum > whitePoint ? 255 : (lum - blackPoint) * 255 / range;
                        data[i] = data[i+1] = data[i+2] = v;
                    } else if (filterType === 'magic') {
                        const protection = Math.min(90, chroma * 3.0);
                        const activeWhitePoint = Math.min(255, whitePoint + protection);
                        if (lum > activeWhitePoint) {
                            data[i] = data[i+1] = data[i+2] = 255;
                        } else {
                            let whiteFactor = 1.0;
                            if (lum > activeWhitePoint - 15) whiteFactor = (activeWhitePoint - lum) / 15;
                            const adjBlack = blackPoint * Math.max(0, 1 - (chroma / 40));
                            const curRange = activeWhitePoint - adjBlack;
                            let s = (lum - adjBlack) * 255 / (curRange || 1);
                            s = Math.min(255, Math.max(0, s));
                            const satBoost = 1.35;
                            const ratio = s / (lum || 1);
                            let nr = (dr * ratio - s) * satBoost + s;
                            let ng = (dg * ratio - s) * satBoost + s;
                            let nb = (db * ratio - s) * satBoost + s;
                            data[i] = Math.min(255, Math.max(0, nr * whiteFactor + 255 * (1 - whiteFactor)));
                            data[i+1] = Math.min(255, Math.max(0, ng * whiteFactor + 255 * (1 - whiteFactor)));
                            data[i+2] = Math.min(255, Math.max(0, nb * whiteFactor + 255 * (1 - whiteFactor)));
                        }
                    } else {
                        // Document Mode
                        let s = (lum - blackPoint) * 255 / range;
                        s = Math.min(255, Math.max(0, s));
                        const ratio = s / (lum || 1);
                        data[i] = Math.min(255, Math.max(0, dr * ratio));
                        data[i+1] = Math.min(255, Math.max(0, dg * ratio));
                        data[i+2] = Math.min(255, Math.max(0, db * ratio));
                    }
                    data[i+3] = 255;
                }
                normCtx.putImageData(outImageData, 0, 0);
                finalCanvas = normalizedCanvas;
            }

            // RE-APPLY BORDER & WATERMARK
            const finalCtx = finalCanvas.getContext('2d')!;
            finalCtx.globalCompositeOperation = 'source-over';
            if (showBorder) {
                const bp = (borderWidth[0] / 1000) * finalCanvas.width;
                finalCtx.strokeStyle = "#000000";
                finalCtx.lineWidth = bp * 2;
                finalCtx.strokeRect(0, 0, finalCanvas.width, finalCanvas.height);
            }

            if (watermarkText.trim()) {
                finalCtx.setTransform(1, 0, 0, 1, 0, 0);
                finalCtx.filter = 'none';
                const mappedFontSize = Math.floor((watermarkSize[0] / 1000) * finalCanvas.width);
                const mappedMarginX = Math.floor((watermarkMarginX[0] / 1000) * finalCanvas.width);
                const mappedMarginY = Math.floor((watermarkMarginY[0] / 1000) * finalCanvas.width);
                finalCtx.font = `bold ${mappedFontSize}px sans-serif`;
                finalCtx.fillStyle = `rgba(128, 128, 128, ${watermarkOpacity[0] / 100})`;
                finalCtx.textBaseline = 'middle';
                const text = watermarkText.toUpperCase();
                let x = 0, y = 0;
                let textAlign: CanvasTextAlign = 'center';
                switch (watermarkPosition) {
                    case 'top-left': x = mappedMarginX; y = mappedMarginY + mappedFontSize/2; textAlign = 'left'; break;
                    case 'top-center': x = finalCanvas.width / 2; y = mappedMarginY + mappedFontSize/2; textAlign = 'center'; break;
                    case 'top-right': x = finalCanvas.width - mappedMarginX; y = mappedMarginY + mappedFontSize/2; textAlign = 'right'; break;
                    case 'center-left': x = mappedMarginX; y = finalCanvas.height / 2; textAlign = 'left'; break;
                    case 'center-center': x = finalCanvas.width / 2; y = finalCanvas.height / 2; textAlign = 'center'; break;
                    case 'center-right': x = finalCanvas.width - mappedMarginX; y = finalCanvas.height / 2; textAlign = 'right'; break;
                    case 'bottom-left': x = mappedMarginX; y = finalCanvas.height - mappedMarginY - mappedFontSize/2; textAlign = 'left'; break;
                    case 'bottom-center': x = finalCanvas.width / 2; y = finalCanvas.height - mappedMarginY - mappedFontSize/2; textAlign = 'center'; break;
                    case 'bottom-right': x = finalCanvas.width - mappedMarginX; y = finalCanvas.height - mappedMarginY - mappedFontSize/2; textAlign = 'right'; break;
                }
                finalCtx.textAlign = textAlign;
                finalCtx.save();
                finalCtx.translate(x, y);
                finalCtx.rotate((-watermarkRotation[0] * Math.PI) / 180);
                finalCtx.fillText(text, 0, 0);
                finalCtx.restore();
            }

            resolve(finalCanvas.toDataURL('image/jpeg', 0.95));
        } catch (err) { reject(err); }
    });
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
        next[draggingPoint] = { x, y };
        return next;
    });
  }, [draggingPoint]);

  const handlePointDown = (idx: number, e: React.MouseEvent | React.TouchEvent) => {
      setDraggingPoint(idx);
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      let cx, cy;
      if ('touches' in e) { cx = e.touches[0].clientX; cy = e.touches[0].clientY; }
      else { cx = (e as React.MouseEvent).clientX; cy = (e as React.MouseEvent).clientY; }
      setMagnifierPos({ x: ((cx - rect.left) / rect.width) * 100, y: ((cy - rect.top) / rect.height) * 100 });
  };

  const handleFlatten = async () => {
      const image = imgRef.current;
      if (!image || !currentRawImage) return;
      setIsProcessing(true);
      try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
          const w = image.naturalWidth;
          const h = image.naturalHeight;
          const srcPoints = points.map(p => ({ x: p.x * (w / 100), y: p.y * (h / 100) }));
          const w1 = Math.hypot(srcPoints[1].x - srcPoints[0].x, srcPoints[1].y - srcPoints[0].y);
          const w2 = Math.hypot(srcPoints[2].x - srcPoints[3].x, srcPoints[2].y - srcPoints[3].y);
          const h1 = Math.hypot(srcPoints[3].x - srcPoints[0].x, srcPoints[3].y - srcPoints[0].y);
          const h2 = Math.hypot(srcPoints[2].x - srcPoints[1].x, srcPoints[2].y - srcPoints[1].y);
          const tw = Math.max(10, Math.floor(Math.max(w1, w2)));
          const th = Math.max(10, Math.floor(Math.max(h1, h2)));
          canvas.width = tw; canvas.height = th;
          const dstPoints = [{ x: 0, y: 0 }, { x: tw, y: 0 }, { x: tw, y: th }, { x: 0, y: th }];
          const matrix = solvePerspective(dstPoints, srcPoints);
          const imgData = ctx.createImageData(tw, th);
          const srcCanvas = document.createElement('canvas');
          srcCanvas.width = w; srcCanvas.height = h;
          const srcCtx = srcCanvas.getContext('2d')!;
          srcCtx.drawImage(image, 0, 0);
          const srcPixels = srcCtx.getImageData(0, 0, w, h).data;
          for (let y = 0; y < th; y++) {
              for (let x = 0; x < tw; x++) {
                  const z = matrix[6] * x + matrix[7] * y + 1;
                  const sx = Math.floor((matrix[0] * x + matrix[1] * y + matrix[2]) / z);
                  const sy = Math.floor((matrix[3] * x + matrix[4] * y + matrix[5]) / z);
                  if (sx >= 0 && sx < w && sy >= 0 && sy < h) {
                      const di = (y * tw + x) * 4; const si = (sy * w + sx) * 4;
                      imgData.data[di] = srcPixels[si]; imgData.data[di+1] = srcPixels[si+1];
                      imgData.data[di+2] = srcPixels[si+2]; imgData.data[di+3] = srcPixels[si+3];
                  }
              }
          }
          ctx.putImageData(imgData, 0, 0);
          const flattened = canvas.toDataURL('image/jpeg', 1.0);
          setFlattenedSrc(flattened);
          const filtered = await applyFrameDocFilter(flattened, activeFilter);
          setLiveResultSrc(filtered);
          setStage('studio');
      } catch (err) { toast({ variant: 'destructive', title: 'Warp Error' }); } finally { setIsProcessing(false); }
  };

  useEffect(() => {
      if (stage === 'studio' && flattenedSrc) {
          const timer = setTimeout(async () => {
              const res = await applyFrameDocFilter(flattenedSrc, activeFilter);
              setLiveResultSrc(res);
          }, 50);
          return () => clearTimeout(timer);
      }
  }, [activeFilter, brightness, contrast, rotation, showBorder, borderWidth, watermarkText, watermarkOpacity, watermarkSize, watermarkMarginX, watermarkMarginY, watermarkRotation, watermarkPosition, flattenedSrc, stage]);

  const startCamera = async () => {
    setStage('camera');
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } 
        });
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.muted = true; }
    } catch (err) { toast({ variant: 'destructive', title: 'Camera Failed' }); setStage('viewfinder'); }
  };

  const captureFrame = async () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.drawImage(video, 0, 0);
        const src = canvas.toDataURL('image/jpeg', 1.0);
        setCurrentRawImage(src);
        
        setIsProcessing(true);
        const detected = await autoDetectDocument(src);
        const initialPoints = detected || [{ x: 15, y: 15 }, { x: 85, y: 15 }, { x: 85, y: 85 }, { x: 15, y: 85 }];
        setPoints(initialPoints);
        
        const newPage: ScannedPage = { id: Math.random().toString(36).substr(2, 9), originalSrc: src, processedSrc: src, points: [...initialPoints], isScanned: false, originalIndex: scannedPages.length + 1, rotation: 0 };
        setPendingPages([newPage]);
        setActivePendingIndex(0);
        setStage('adjust');
        setIsProcessing(false);
        
        if (video.srcObject) (video.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
  };

  const handleFilesUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const filesList = e.target.files;
    if (!filesList || filesList.length === 0) return;
    setIsProcessing(true);
    const filesArray = Array.from(filesList);
    const newPages: ScannedPage[] = [];
    for (const file of filesArray) {
        const dataUrl = await new Promise<string>((res) => { 
            const reader = new FileReader(); reader.onload = (ev) => res(ev.target?.result as string); reader.readAsDataURL(file); 
        });
        const detected = await autoDetectDocument(dataUrl);
        const initialPoints = detected || [{ x: 15, y: 15 }, { x: 85, y: 15 }, { x: 85, y: 85 }, { x: 15, y: 85 }];
        newPages.push({ 
            id: Math.random().toString(36).substr(2, 9), 
            originalSrc: dataUrl, 
            processedSrc: dataUrl, 
            points: initialPoints, 
            isScanned: false, 
            originalIndex: scannedPages.length + newPages.length + 1, 
            rotation: 0 
        });
    }
    setPendingPages(prev => [...prev, ...newPages]);
    setIsProcessing(false);
  };

  const handleConfirmSave = () => {
      if (!liveResultSrc) return;
      const currentPage = pendingPages[activePendingIndex];
      const newPage: ScannedPage = { ...currentPage, processedSrc: liveResultSrc, isScanned: true, points: [...points], rotation, hasBorder: showBorder, borderSize: borderWidth[0] };
      
      setScannedPages(prev => [...prev, newPage].sort((a,b) => a.originalIndex - b.originalIndex));
      const remainingPending = pendingPages.filter(p => p.id !== currentPage.id);
      setPendingPages(remainingPending);
      
      toast({ title: "Page Saved" });
      
      if (remainingPending.length > 0) {
          const nextIdx = activePendingIndex >= remainingPending.length ? 0 : activePendingIndex;
          setActivePendingIndex(nextIdx);
          setCurrentRawImage(remainingPending[nextIdx].originalSrc);
          setPoints(remainingPending[nextIdx].points);
          setStage('adjust');
          setLiveResultSrc(null); setFlattenedSrc(null);
      } else {
          setStage('viewfinder');
      }
  };

  const handleRescan = (page: ScannedPage) => {
      setScannedPages(prev => prev.filter(p => p.id !== page.id));
      const pPage = { ...page, isScanned: false };
      setPendingPages(prev => [...prev, pPage]);
      setCurrentRawImage(page.originalSrc);
      setPoints(page.points);
      setRotation(page.rotation);
      setShowBorder(!!page.hasBorder);
      setBorderWidth([page.borderSize || 5]);
      setActivePendingIndex(pendingPages.length); 
      setStage('adjust');
      setLiveResultSrc(null); setFlattenedSrc(null);
  };

  const handleDownloadJpg = () => {
      if (!liveResultSrc) return;
      const link = document.createElement('a');
      link.href = liveResultSrc;
      link.download = `GR7-Scan-${Date.now()}.jpg`;
      link.click();
  };

  const handleNextPending = () => {
      if (activePendingIndex < pendingPages.length - 1) {
          const nextIdx = activePendingIndex + 1;
          setActivePendingIndex(nextIdx);
          setCurrentRawImage(pendingPages[nextIdx].originalSrc);
          setPoints(pendingPages[nextIdx].points);
          setStage('adjust');
          setLiveResultSrc(null); setFlattenedSrc(null);
      }
  };

  const handlePrevPending = () => {
      if (activePendingIndex > 0) {
          const prevIdx = activePendingIndex - 1;
          setActivePendingIndex(prevIdx);
          setCurrentRawImage(pendingPages[prevIdx].originalSrc);
          setPoints(pendingPages[prevIdx].points);
          setStage('adjust');
          setLiveResultSrc(null); setFlattenedSrc(null);
      }
  };

  const generatePdfBlob = async (): Promise<Blob | null> => {
    if (scannedPages.length === 0) return null;
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm' });
    for (let i = 0; i < scannedPages.length; i++) {
        const page = scannedPages[i];
        const img = new Image();
        img.src = page.processedSrc;
        await new Promise(r => img.onload = r);
        const isLandscape = img.width > img.height;
        const orientation = isLandscape ? 'l' : 'p';
        const pageWidth = isLandscape ? 297 : 210;
        const pageHeight = isLandscape ? 210 : 297;
        if (i === 0) pdf.deletePage(1); 
        pdf.addPage([pageWidth, pageHeight], orientation);
        pdf.addImage(page.processedSrc, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
    }
    const pdfBlob = pdf.output('blob');
    
    if (isSecured && pdfPassword.trim()) {
        const tempFile = new File([pdfBlob], 'temp.pdf', { type: 'application/pdf' });
        return await lockPdf(tempFile, pdfPassword.trim());
    }
    
    return pdfBlob;
  };

  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    try {
        const blob = await generatePdfBlob();
        if (blob) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `Scan-${Date.now()}.pdf`;
            link.click();
            URL.revokeObjectURL(link.href);
        }
    } catch (e) { toast({ variant: 'destructive', title: 'Export Failed' }); }
    finally { setIsGenerating(false); }
  };

  const handleSharePdf = async () => {
    if (!navigator.share) {
        toast({ title: "Sharing not supported", description: "Browser sharing is disabled." });
        return;
    }
    setIsGenerating(true);
    try {
        const blob = await generatePdfBlob();
        if (blob) {
            const file = new File([blob], `Scan_${Date.now()}.pdf`, { type: 'application/pdf' });
            await navigator.share({
                files: [file],
                title: 'Scanned Document',
                text: 'Shared from GR7 Tools Hub'
            });
        }
    } catch (e) { console.error(e); }
    finally { setIsGenerating(false); }
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-700 relative">
        {stage === 'viewfinder' && (
            <div className="grid lg:grid-cols-12 gap-8 px-4 min-h-[70vh]">
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <Card className="border-2 shadow-lg bg-card/50 rounded-[3rem] flex-1">
                        <CardHeader className="bg-muted/30 border-b p-6 flex justify-between items-center text-left">
                            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2"><LayoutGrid className="size-4 text-primary" /> QUEUE</CardTitle>
                            {pendingPages.length > 0 && <Badge variant="secondary" className="bg-primary/10 text-primary">{pendingPages.length} PENDING</Badge>}
                        </CardHeader>
                        <CardContent className="p-6">
                            {pendingPages.length === 0 ? (
                                <div className="flex flex-col items-center py-20 opacity-20"><ImageIcon className="size-12 mb-4" /><p className="text-[10px] font-black uppercase">Drop Files to Start</p></div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    {pendingPages.map((p, idx) => (
                                        <div key={p.id} className="relative group rounded-2xl overflow-hidden border-2 cursor-pointer" onClick={() => { setCurrentRawImage(p.originalSrc); setPoints(p.points); setActivePendingIndex(idx); setStage('adjust'); }}>
                                            <img src={p.originalSrc} className="size-full object-cover grayscale opacity-50" alt="p" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center backdrop-blur-sm transition-all"><Button size="sm" className="font-black text-[9px] uppercase"><Scan className="size-3 mr-1" /> SCAN</Button></div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-4 flex flex-col justify-center">
                    <Card className="border-2 border-dashed bg-card/50 text-center rounded-[3rem] p-10 flex flex-col items-center gap-8 shadow-2xl">
                        <div className="size-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-xl"><ScanLine className="size-10" /></div>
                        <div className="space-y-4 w-full max-w-xs">
                            <Button className="h-16 w-full rounded-2xl bg-primary text-white font-black text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all group" onClick={startCamera}>
                                <Camera className="size-6 mr-3 group-hover:rotate-12" /> LIVE SCANNER
                            </Button>
                            <Button variant="outline" className="h-14 w-full rounded-2xl border-2 font-black text-xs uppercase" onClick={() => fileInputRef.current?.click()}>
                                <Plus className="size-5 mr-3" /> IMPORT DOCS
                            </Button>
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-6">
                    <Card className="border-2 shadow-lg bg-card/50 rounded-[3rem] flex-1 flex flex-col">
                        <CardHeader className="bg-emerald-500/5 border-b p-6 flex justify-between items-center text-emerald-600 text-left shrink-0">
                            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2"><CheckCircle2 className="size-4" /> FINISHED</CardTitle>
                            {scannedPages.length > 0 && <Badge className="bg-green-600 text-white">{scannedPages.length}</Badge>}
                        </CardHeader>
                        <CardContent className="p-6 flex-1 overflow-y-auto">
                            {scannedPages.length === 0 ? (
                                <div className="flex flex-col items-center py-20 opacity-20"><FileArchive className="size-12 mb-4" /><p className="text-[10px] font-black uppercase">No Results Yet</p></div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    {scannedPages.map((p) => (
                                        <div key={p.id} className="relative group rounded-2xl overflow-hidden border-2 shadow-md">
                                            <img src={p.processedSrc} className="size-full object-cover" alt="p" />
                                            <div className="absolute top-2 left-2 size-6 rounded-md bg-green-600 text-white flex items-center justify-center text-[8px] font-black">✓ P{p.originalIndex}</div>
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 transition-opacity backdrop-blur-xs">
                                                <Button size="icon" className="h-7 w-7 rounded-lg bg-primary" onClick={() => handleRescan(p)}><RefreshCcw className="size-3.5"/></Button>
                                                <Button size="icon" variant="destructive" className="h-7 w-7 rounded-lg" onClick={() => setScannedPages(prev => prev.filter(pg => pg.id !== p.id))}><Trash2 className="size-3.5" /></Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="p-6 border-t bg-muted/5 flex flex-col gap-4 shrink-0 text-left">
                            {scannedPages.length > 0 && (
                                <div className="w-full space-y-4 animate-in slide-in-from-bottom-2">
                                    <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl border shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <Lock className={cn("size-4", isSecured ? "text-primary" : "text-muted-foreground/30")} />
                                            <span className="text-[10px] font-black uppercase opacity-60">Secure PDF</span>
                                        </div>
                                        <Switch checked={isSecured} onCheckedChange={setIsSecuring} />
                                    </div>
                                    
                                    {isSecured && (
                                        <div className="space-y-1.5">
                                            <Label className="text-[8px] font-black uppercase opacity-40 ml-1">PDF Password</Label>
                                            <div className="relative group">
                                                <Input 
                                                    type={showPdfPassword ? "text" : "password"} 
                                                    value={pdfPassword} 
                                                    onChange={(e) => setPdfPassword(e.target.value)}
                                                    placeholder="Enter Password..."
                                                    className="h-10 border-2 rounded-xl font-bold bg-background pr-10"
                                                />
                                                <button onClick={() => setShowPdfPassword(!showPdfPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                    {showPdfPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <Button onClick={handleDownloadPdf} disabled={scannedPages.length === 0} className="w-full h-14 rounded-2xl bg-[#00aeef] text-white font-black uppercase text-xs shadow-xl active:scale-95 border-none">
                                {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Download className="size-4 mr-2" />} SAVE PDF BUNDLE
                            </Button>
                            {scannedPages.length > 0 && (
                                <Button onClick={handleSharePdf} variant="outline" className="w-full h-12 rounded-2xl border-2 font-black uppercase text-[10px] shadow-sm">
                                    <Share2 className="size-4 mr-2" /> SHARE AS PDF
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                </div>
            </div>
        )}

        {stage === 'camera' && (
            <div className="flex flex-col items-center justify-center p-4 animate-in zoom-in-95 duration-500 min-h-[60vh]">
                <Card className="w-full max-w-3xl border-none shadow-3xl rounded-[3rem] overflow-hidden bg-black relative">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-auto object-contain max-h-[75vh]" />
                    <div className="absolute bottom-10 left-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-6">
                        <Button className="size-20 rounded-full bg-white text-black p-0 shadow-3xl hover:scale-110 active:scale-95 border-8 border-slate-900 ring-8 ring-white/10" onClick={captureFrame}><Camera className="size-10"/></Button>
                        <Button variant="ghost" onClick={() => setStage('viewfinder')} className="bg-black/40 text-white rounded-full px-6 uppercase font-black text-[10px] border border-white/10">Cancel</Button>
                    </div>
                </Card>
            </div>
        )}

        {stage === 'adjust' && currentRawImage && (
            <div className="flex flex-col items-center justify-start p-4 animate-in slide-in-from-bottom-6 duration-500">
                <Card className="w-full max-w-5xl border-2 shadow-2xl rounded-[3rem] overflow-hidden bg-card">
                    <CardHeader className="bg-muted/30 border-b p-6 flex justify-between items-center text-left">
                        <div className="flex items-center gap-4">
                            <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3"><ScanLine className="size-5 text-primary" /> 1. CORNER MAPPING</CardTitle>
                            {pendingPages.length > 1 && <Badge variant="secondary" className="font-black text-[10px] px-3 py-1 rounded-full uppercase">ITEM {activePendingIndex + 1} OF {pendingPages.length}</Badge>}
                        </div>
                        <div className="flex items-center gap-2">
                            {pendingPages.length > 1 && (
                                <>
                                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-2" onClick={handlePrevPending} disabled={activePendingIndex === 0}><ChevronLeft className="size-5" /></Button>
                                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-2" onClick={handleNextPending} disabled={activePendingIndex === pendingPages.length - 1}><ChevronRight className="size-5" /></Button>
                                </>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => setStage('viewfinder')} className="text-destructive"><X /></Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex flex-col items-center justify-center bg-slate-200 dark:bg-black/40 min-h-[600px] relative overflow-hidden select-none" 
                                 onMouseMove={handleMouseMove} onTouchMove={handleMouseMove} onMouseUp={() => setDraggingPoint(null)} onTouchEnd={() => setDraggingPoint(null)}>
                        {isProcessing && (
                            <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-4">
                                <Loader2 className="h-12 w-12 animate-spin" />
                                <p className="text-xs font-black uppercase tracking-widest">Processing Edges...</p>
                            </div>
                        )}
                        <div ref={containerRef} className="relative shadow-3xl border-4 border-white transform-gpu bg-white my-10 max-w-[95vw]" style={{ touchAction: 'none' }}>
                            <img ref={imgRef} src={currentRawImage} alt="s" className="max-h-[65vh] w-auto block pointer-events-none" />
                            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 1000" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                                <polygon points={`${points[0].x * 10},${points[0].y * 10} ${points[1].x * 10},${points[1].y * 10} ${points[2].x * 10},${points[2].y * 10} ${points[3].x * 10},${points[3].y * 10}`} className="fill-primary/10 stroke-primary stroke-[2] dash-array-[5,5]" />
                            </svg>
                            {points.map((p, i) => (
                                <div key={i} className={cn("absolute size-10 -ml-5 -mt-5 rounded-full border-4 border-primary shadow-2xl cursor-grab active:cursor-grabbing z-20 flex items-center justify-center bg-white", draggingPoint === i && "scale-125")}
                                    style={{ left: `${p.x}%`, top: `${p.y}%`, touchAction: 'none' }} onMouseDown={(e) => handlePointDown(i, e)} onTouchStart={(e) => handlePointDown(i, e)}><div className="size-2.5 bg-primary rounded-full" /></div>
                            ))}
                            {draggingPoint !== null && (
                                <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-50 overflow-hidden size-40 md:size-48 rounded-full border-4 border-green-500 shadow-3xl bg-white ring-4 ring-white/50 animate-in zoom-in-50">
                                    <img src={currentRawImage} alt="mag" className="absolute max-w-none origin-top-left"
                                        style={{ width: `${(imgRef.current?.width || 0) * 4}px`, height: `${(imgRef.current?.height || 0) * 4}px`, left: `calc(50% - ${(magnifierPos.x / 100) * (imgRef.current?.width || 0) * 4}px)`, top: `calc(50% - ${(magnifierPos.y / 100) * (imgRef.current?.height || 0) * 4}px)` }} />
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-full h-0.5 bg-green-500/50 absolute" />
                                        <div className="h-full w-0.5 bg-green-500/50 absolute" />
                                        <div className="size-6 border-2 border-green-500 rounded-full flex items-center justify-center text-green-500 font-bold text-xl leading-none bg-green-500/10">+</div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-8 py-3 bg-black/80 rounded-full text-white text-[10px] font-black uppercase tracking-widest shadow-3xl"><Move className="size-4 text-primary animate-pulse" /> MAP ALL 4 CORNERS</div>
                    </CardContent>
                    <CardFooter className="bg-muted/10 p-6 border-t flex justify-end">
                        <Button className="h-16 px-16 rounded-2xl bg-primary text-white font-black text-lg shadow-2xl active:scale-95 transition-all" onClick={handleFlatten}>FLATTEN / CROP <ChevronRight className="ml-2 size-6" /></Button>
                    </CardFooter>
                </Card>
            </div>
        )}

        {stage === 'studio' && liveResultSrc && (
            <div className="grid lg:grid-cols-12 gap-8 items-stretch animate-in slide-in-from-bottom-6 duration-500 w-full px-4 max-w-[1800px] mx-auto text-left">
                <Card className="lg:col-span-8 border-2 shadow-xl overflow-hidden rounded-[3rem] bg-card flex flex-col">
                    <CardHeader className="bg-muted/30 border-b p-6 flex justify-between items-center text-left">
                        <div className="flex items-center gap-4">
                            <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3"><Eye className="size-5 text-primary" /> 2. HD PREVIEW</CardTitle>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge className="bg-green-600 text-white font-black text-[9px] px-4 py-1.5 rounded-full border-2 border-white shadow-lg animate-pulse uppercase">RENDER READY</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 md:p-12 flex-1 flex items-center justify-center bg-slate-100 dark:bg-slate-900 shadow-inner relative overflow-hidden">
                        <div className="relative bg-white shadow-3xl border-[12px] border-white max-w-full">
                            {isProcessing ? <Loader2 className="animate-spin size-12 text-primary opacity-20" /> : <img src={liveResultSrc} className="max-h-[65vh] w-auto object-contain block animate-in zoom-in-95 duration-500" alt="result" />}
                        </div>
                    </CardContent>
                    <CardFooter className="bg-white dark:bg-slate-950 p-6 border-t flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-8 text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest">
                             <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-green-500" /> SECURE RAM</div>
                             <div className="flex items-center gap-2"><Zap className="size-4 text-yellow-500" /> INSTANT RENDER</div>
                        </div>
                        <Button variant="outline" onClick={handleDownloadJpg} className="h-12 px-8 border-2 font-black text-[10px] uppercase rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm">
                            <ImageIcon className="mr-2 size-4" /> SAVE THIS AS JPG
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="lg:col-span-4 border-2 shadow-xl overflow-hidden rounded-[3rem] bg-card flex flex-col h-full no-print">
                    <CardHeader className="bg-primary/5 border-b p-6 text-left"><CardTitle className="text-base font-black uppercase tracking-tighter text-primary flex items-center gap-2"><Settings2 className="size-5" /> STUDIO CONTROLS</CardTitle></CardHeader>
                    <CardContent className="p-8 space-y-8 flex-1 text-left overflow-y-auto custom-scrollbar">
                        <div className="space-y-6">
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Fidelity Filters</Label>
                            <div className="grid grid-cols-3 gap-3">
                                <FilterBtn active={activeFilter === 'magic'} label="Magic" icon={Sparkles} onClick={() => setActiveFilter('magic')} />
                                <FilterBtn active={activeFilter === 'document'} label="Docu" icon={FileText} onClick={() => setActiveFilter('document')} />
                                <FilterBtn active={activeFilter === 'bw'} label="BW" icon={Highlighter} onClick={() => setActiveFilter('bw')} />
                                <FilterBtn active={activeFilter === 'photo'} label="Photo" icon={ImageIcon} onClick={() => setActiveFilter('photo')} />
                                <FilterBtn active={activeFilter === 'original'} label="None" icon={X} onClick={() => setActiveFilter('original')} />
                                <div className="flex flex-col items-center gap-2">
                                  <Button variant="outline" className="size-14 rounded-2xl shadow-lg border-2 transition-all p-0 bg-white/50 border-white/20 hover:border-primary/40" onClick={() => setRotation(r => (r + 90) % 360)}><RotateCw className="size-6"/></Button>
                                  <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Rotate</span>
                                </div>
                            </div>
                        </div>

                        <Separator className="opacity-10" />

                        <div className="space-y-6">
                             <div className="space-y-4">
                                <div className="flex justify-between items-center px-1"><Label className="text-[10px] font-black uppercase opacity-60">Exposure</Label><Badge variant="secondary" className="font-mono text-[9px]">{brightness[0]}%</Badge></div>
                                <Slider min={50} max={150} step={1} value={brightness} onValueChange={setBrightness} />
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-1"><Label className="text-[10px] font-black uppercase opacity-60">Contrast</Label><Badge variant="secondary" className="font-mono text-[9px]">{contrast[0]}%</Badge></div>
                                <Slider min={50} max={150} step={1} value={contrast} onValueChange={setContrast} />
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border-2 border-dashed">
                                    <div className="flex items-center gap-3">
                                        <Square className={cn("size-4", showBorder ? "text-primary" : "text-muted-foreground/30")} />
                                        <span className="text-[10px] font-black uppercase opacity-60">Page Border</span>
                                    </div>
                                    <Switch checked={showBorder} onCheckedChange={setShowBorder} />
                                </div>
                                {showBorder && (
                                    <div className="space-y-4 px-2 animate-in slide-in-from-top-2">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-[9px] font-black uppercase opacity-40">Border Thickness</Label>
                                            <Badge variant="secondary" className="font-mono text-[8px]">{borderWidth[0]} units</Badge>
                                        </div>
                                        <Slider min={1} max={25} step={1} value={borderWidth} onValueChange={setBorderWidth} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator className="opacity-10" />

                        <div className="space-y-6">
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-60 flex items-center gap-2"><Copyright className="size-3.5 text-primary" /> Overlay Watermark</Label>
                            <div className="space-y-6">
                                <div className="relative group">
                                    <Input 
                                        placeholder="Enter Watermark Text..." 
                                        value={watermarkText} 
                                        onChange={(e) => setWatermarkText(e.target.value)}
                                        className="h-11 rounded-xl font-bold border-2 focus:ring-primary/20"
                                    />
                                    <Type className="absolute right-4 top-1/2 -translate-y-1/2 size-4 opacity-20" />
                                </div>

                                {watermarkText.trim() && (
                                    <div className="space-y-6 animate-in slide-in-from-top-2">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center px-1"><Label className="text-[9px] font-black uppercase opacity-50">Opacity</Label><Badge className="text-[8px] h-4">{watermarkOpacity[0]}%</Badge></div>
                                            <Slider min={5} max={100} step={5} value={watermarkOpacity} onValueChange={setWatermarkOpacity} />
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center px-1"><Label className="text-[9px] font-black uppercase opacity-50">Text Size</Label><Badge className="text-[8px] h-4">{watermarkSize[0]}</Badge></div>
                                            <Slider min={10} max={200} step={2} value={watermarkSize} onValueChange={setWatermarkSize} />
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center px-1"><Label className="text-[9px] font-black uppercase opacity-50">Rotation</Label><Badge className="text-[8px] h-4">{watermarkRotation[0]}°</Badge></div>
                                            <Slider min={-180} max={180} step={1} value={watermarkRotation} onValueChange={setWatermarkRotation} />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center px-1"><Label className="text-[9px] font-black uppercase opacity-50">Margin X</Label><Badge className="text-[8px] h-4">{watermarkMarginX[0]}</Badge></div>
                                                <Slider min={0} max={500} step={2} value={watermarkMarginX} onValueChange={setWatermarkMarginX} />
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center px-1"><Label className="text-[9px] font-black uppercase opacity-50">Margin Y</Label><Badge className="text-[8px] h-4">{watermarkMarginY[0]}</Badge></div>
                                                <Slider min={0} max={500} step={2} value={watermarkMarginY} onValueChange={setWatermarkMarginY} />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-[9px] font-black uppercase opacity-50">Watermark Position</Label>
                                            <div className="grid grid-cols-3 gap-1.5 p-3 bg-muted/20 border-2 border-dashed rounded-2xl w-fit mx-auto">
                                                {WATERMARK_POSITIONS.map((pos) => (
                                                    <button
                                                        key={pos}
                                                        onClick={() => setWatermarkPosition(pos)}
                                                        className={cn(
                                                            "size-9 rounded-lg border-2 transition-all flex items-center justify-center relative transform active:scale-95 shadow-sm",
                                                            watermarkPosition === pos ? "bg-primary border-primary text-white scale-110 z-10" : "bg-white/50 border-border hover:border-primary/40",
                                                            "!ring-[2px] !ring-slate-950 dark:!ring-white"
                                                        )}
                                                        title={pos}
                                                    >
                                                        <div className={cn("size-1.5 rounded-full", watermarkPosition === pos ? "bg-white" : "bg-muted-foreground/20")} />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-muted/10 p-8 border-t flex flex-col gap-4">
                         <Button onClick={handleConfirmSave} className="magic-button w-full h-16 rounded-[1.5rem] bg-primary text-white font-black text-lg shadow-2xl active:scale-95 transition-all border-none">
                            <StarIcons />
                            <CheckCircle2 className="size-6 mr-3" /> CONFIRM & SAVE
                        </Button>
                        <Button variant="outline" className="w-full h-12 border-2 rounded-xl font-black text-[10px] uppercase" onClick={() => setStage('adjust')}><RefreshCcw className="size-4 mr-2" /> RE-CROP</Button>
                    </CardFooter>
                </Card>
            </div>
        )}

        <input ref={fileInputRef} type="file" className="hidden" accept="image/*,application/pdf" multiple onChange={handleFilesUpload} />
    </div>
  );
}

function FilterBtn({ active, label, icon: Icon, onClick }: { active: boolean, label: string, icon: any, onClick: () => void }) {
    return (
        <div className="flex flex-col items-center gap-2">
            <Button variant={active ? 'default' : 'outline'} className={cn("size-14 rounded-2xl shadow-lg border-2 transition-all p-0", active ? "bg-primary border-primary text-white scale-110" : "bg-white/50 border-white/20 hover:border-primary/40")} onClick={onClick}><Icon className="size-6"/></Button>
            <span className={cn("text-[8px] font-black uppercase tracking-widest", active ? "text-primary" : "text-muted-foreground")}>{label}</span>
        </div>
    );
}
