"use client";

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect } from 'react';
import JSZip from 'jszip';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    UploadCloud, 
    Loader2, 
    Download, 
    Archive, 
    File as FileIcon, 
    X, 
    ShieldCheck, 
    Zap, 
    RefreshCcw, 
    CheckCircle2, 
    Sparkles,
    Trash2,
    Layers,
    Settings2,
    Plus,
    SearchCode
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';

const StarIcons = () => (
    <>
        <div className="star-1">
            <svg viewBox="0 0 784.11 815.53" style={{ shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision', imageRendering: 'optimizeQuality', fillRule: 'evenodd', clipRule: 'evenodd' }}>
                <path className="fil0" d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
            </svg>
        </div>
        <div className="star-2">
            <svg viewBox="0 0 784.11 815.53" style={{ shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision', imageRendering: 'optimizeQuality', fillRule: 'evenodd', clipRule: 'evenodd' }}>
                <path className="fil0" d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
            </svg>
        </div>
        <div className="star-3">
            <svg viewBox="0 0 784.11 815.53" style={{ shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision', imageRendering: 'optimizeQuality', fillRule: 'evenodd', clipRule: 'evenodd' }}>
                <path className="fil0" d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
            </svg>
        </div>
        <div className="star-4">
            <svg viewBox="0 0 784.11 815.53" style={{ shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision', imageRendering: 'optimizeQuality', fillRule: 'evenodd', clipRule: 'evenodd' }}>
                <path className="fil0" d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
            </svg>
        </div>
        <div className="star-5">
            <svg viewBox="0 0 784.11 815.53" style={{ shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision', imageRendering: 'optimizeQuality', fillRule: 'evenodd', clipRule: 'evenodd' }}>
                <path className="fil0" d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
            </svg>
        </div>
        <div className="star-6">
            <svg viewBox="0 0 784.11 815.53" style={{ shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision', imageRendering: 'optimizeQuality', fillRule: 'evenodd', clipRule: 'evenodd' }}>
                <path className="fil0" d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
            </svg>
        </div>
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

export default function ZipCreator() {
    const { toast } = useToast();
    const [filesToZip, setFilesToZip] = useState<File[]>([]);
    const [isZipping, setIsZipping] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [zippedFileUrl, setZippedFileUrl] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        return () => {
            if (zippedFileUrl) URL.revokeObjectURL(zippedFileUrl);
        };
    }, [zippedFileUrl]);

    const handleFilesChange = (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return;
        if (zippedFileUrl) {
            URL.revokeObjectURL(zippedFileUrl);
            setZippedFileUrl(null);
        }
        const newFiles = Array.from(fileList);
        setFilesToZip(prev => [...prev, ...newFiles]);
    };

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFilesChange(e.target.files?.[0] || null);
    const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
    const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
    const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFilesChange(e.dataTransfer.files); };

    const handleRemoveFile = (index: number) => {
        if (zippedFileUrl) {
            URL.revokeObjectURL(zippedFileUrl);
            setZippedFileUrl(null);
        }
        setFilesToZip(files => files.filter((_, i) => i !== index));
    };
    
    const handleReset = () => {
        if (zippedFileUrl) URL.revokeObjectURL(zippedFileUrl);
        setFilesToZip([]);
        setZippedFileUrl(null);
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleCreateZip = async () => {
        if (filesToZip.length === 0) {
            toast({ variant: 'destructive', title: 'No files selected', description: 'Please add at least one file.' });
            return;
        }
        setIsZipping(true);
        setProgress(5);

        try {
            const zip = new JSZip();
            for (let i = 0; i < filesToZip.length; i++) {
                const file = filesToZip[i];
                const buffer = await file.arrayBuffer();
                zip.file(file.name, buffer);
                setProgress(10 + Math.round(((i + 1) / filesToZip.length) * 80));
            }

            const zipBlob = await zip.generateAsync({ 
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: { level: 6 }
            });
            const url = URL.createObjectURL(zipBlob);
            setZippedFileUrl(url);
            setProgress(100);
            toast({ title: 'Bundle Ready!', description: 'Your ZIP archive is ready for download.' });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to bundle files.' });
        } finally {
            setIsZipping(false);
        }
    };
    
    const handleDownload = () => {
        if (!zippedFileUrl) return;
        const link = document.createElement('a');
        link.href = zippedFileUrl;
        link.download = `GR7-Archive-${Date.now()}.zip`;
        link.click();
    };

    return (
        <div className="w-full max-w-7xl animate-in fade-in duration-500 px-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left: Workspace Area */}
                <div className="lg:col-span-7 space-y-4">
                    <Card 
                        className={cn(
                            "glass-card overflow-hidden transition-all duration-300 border-2 border-dashed shadow-2xl rounded-[2.5rem] hover:-translate-y-1 hover:border-primary/50 cursor-pointer select-none",
                            isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.01]"
                        )}
                        onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <CardHeader className="bg-muted/30 border-b p-6 text-center">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">STUDIO WORKSPACE</CardTitle>
                                {filesToZip.length > 0 && <Badge className="bg-primary text-white font-black text-[10px] uppercase px-3 py-1 rounded-full">{filesToZip.length} FILES</Badge>}
                            </div>
                        </CardHeader>
                        <CardContent className={cn(filesToZip.length === 0 ? "p-10 md:p-16" : "p-4 md:p-6")}>
                            {filesToZip.length === 0 ? (
                                <div 
                                    className="border-4 border-dashed border-muted-foreground/20 rounded-[2rem] p-12 md:p-16 flex flex-col items-center justify-center space-y-6 bg-muted/30 group cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className="relative">
                                        <UploadCloud className="size-16 md:size-20 text-muted-foreground group-hover:text-primary transition-colors" />
                                        <Zap className="absolute -top-1 -right-1 size-5 md:size-8 text-yellow-500 animate-pulse" />
                                    </div>
                                    <div className="text-center px-4">
                                        <p className="text-xl md:text-2xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Drop Files to Bundle</p>
                                        <p className="text-[10px] md:text-sm text-muted-foreground mt-2 font-bold opacity-60 uppercase tracking-widest">WASM-based local archiving active.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center px-1">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">File Stack</p>
                                        <Button variant="ghost" size="sm" onClick={handleReset} className="text-destructive font-black h-7 text-[9px] uppercase">
                                            <Trash2 className="size-3 mr-1"/> Clear All
                                        </Button>
                                    </div>
                                    <ScrollArea className="h-[300px] md:h-[450px] pr-2 custom-scrollbar">
                                        <div className="grid gap-2">
                                            {filesToZip.map((file, index) => (
                                                <div key={`${file.name}-${index}`} className="flex items-center justify-between p-3 rounded-2xl border-2 border-transparent bg-white dark:bg-slate-900 hover:border-primary/40 transition-all group shadow-md animate-in slide-in-from-bottom-2">
                                                    <div className="flex items-center gap-4 truncate pr-4">
                                                        <div className="size-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0 border border-primary/10 shadow-inner">
                                                            <FileIcon className="size-5" />
                                                        </div>
                                                        <div className="truncate text-left">
                                                            <p className="text-xs md:text-sm font-black truncate max-w-[150px] md:max-w-[350px] uppercase tracking-tight" title={file.name}>{file.name}</p>
                                                            <p className="text-[8px] md:text-[9px] font-mono text-muted-foreground/60 uppercase mt-0.5">{formatBytes(file.size)}</p>
                                                        </div>
                                                    </div>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-full" onClick={(e) => { e.stopPropagation(); handleRemoveFile(index); }}>
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                            <Button variant="outline" className="w-full border-2 border-dashed h-12 rounded-xl mt-4 font-black text-[10px] uppercase text-primary border-primary/20 hover:bg-primary/5 transition-all group" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                                                <Plus className="size-4 mr-2 group-hover:scale-125 transition-transform" /> ADD MORE FILES
                                            </Button>
                                        </div>
                                    </ScrollArea>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="justify-center gap-6 text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 bg-muted/10 pt-6 px-4">
                            <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-600" /> SECURE RAM</div>
                            <div className="flex items-center gap-1.5"><SearchCode className="size-3 text-primary" /> INDEX SCAN</div>
                            <div className="flex items-center gap-1.5"><Zap className="size-3 text-yellow-500" /> INSTANT ZIP</div>
                        </CardFooter>
                        <input ref={fileInputRef} type="file" className="hidden" multiple onChange={onFileChange} />
                    </Card>
                </div>

                {/* Right: Settings Area */}
                <div className="lg:col-span-5 space-y-4">
                    <Card className="border-2 shadow-xl border-primary/10 overflow-hidden sticky top-24 rounded-[2rem] bg-white dark:bg-slate-950 transition-all hover:border-primary/30">
                        <CardHeader className="bg-primary/5 border-b p-5 md:p-6">
                            <CardTitle className="text-lg md:text-xl flex items-center gap-3 font-black uppercase tracking-tighter">
                                <Settings2 className="size-6 text-primary" /> Bundle Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8 space-y-8">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Status Dashboard</Label>
                                {isZipping ? (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        <div className="relative flex flex-col items-center gap-4">
                                            <Loader2 className="size-12 animate-spin text-primary stroke-[3]" />
                                            <div className="text-center">
                                                <p className="text-xs font-black uppercase tracking-widest text-primary animate-pulse">Archiving Files...</p>
                                                <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase">Processing in Local RAM</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Progress value={progress} className="h-1.5 shadow-inner" />
                                            <div className="flex justify-between text-[8px] font-black uppercase opacity-40">
                                                <span>PACKING DATA</span>
                                                <span>{progress}%</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : zippedFileUrl ? (
                                    <div className="p-5 bg-green-500/5 rounded-2xl border-2 border-green-500/10 flex gap-4 animate-in zoom-in-95">
                                        <CheckCircle2 className="size-6 text-green-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] font-black text-green-700 uppercase tracking-tight">Archive Ready!</p>
                                            <p className="text-[8px] text-green-600/80 font-medium leading-relaxed mt-1 uppercase">
                                                Successfully bundled into a clean ZIP.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-5 bg-primary/5 rounded-[1.5rem] border-2 border-primary/10 flex gap-4">
                                        <Zap className="size-6 text-yellow-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] font-black text-primary uppercase tracking-tight">Local Speed</p>
                                            <p className="text-[9px] text-primary/80 font-medium leading-relaxed mt-1 uppercase">
                                                Using 32-bit hardware acceleration for instant bundling.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/10 p-6 md:p-8 border-t border-dashed">
                            {!zippedFileUrl ? (
                                <Button 
                                    className="magic-button w-full h-16 md:h-18 rounded-full bg-primary hover:bg-transparent border-4 border-primary text-white hover:text-primary rounded-full transition-all active:scale-95 disabled:opacity-50 group px-10 flex items-center justify-center gap-4" 
                                    onClick={handleCreateZip}
                                    disabled={isZipping || filesToZip.length === 0}
                                >
                                    <StarIcons />
                                    {isZipping ? (
                                        <div className="flex items-center gap-3">
                                            <Loader2 className="size-6 md:size-8 animate-spin" />
                                            <span className="uppercase text-sm tracking-tighter">BUNDLING...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <Archive className="size-7 md:size-8 text-white/50 group-hover:scale-125 transition-transform" />
                                            <span className="uppercase tracking-tighter text-lg md:text-2xl">CREATE ZIP</span>
                                        </div>
                                    )}
                                </Button>
                            ) : (
                                <Button size="lg" className="magic-button magic-button-success w-full h-16 md:h-18 text-lg font-black bg-green-600 hover:bg-transparent border-4 border-green-600 text-white hover:text-green-600 rounded-full transition-all active:scale-95 flex items-center justify-center gap-4 px-10" onClick={handleDownload}>
                                    <StarIcons />
                                    <Download className="mr-3 size-8 group-hover:translate-y-1 transition-transform" /> 
                                    <span className="uppercase tracking-tighter">SAVE ZIP ARCHIVE</span>
                                </Button>
                            )}
                        </CardFooter>
                    </Card>

                    <div className="p-5 md:p-6 bg-green-500/5 rounded-xl md:rounded-[2rem] border-2 border-green-500/10 flex gap-4 items-center shadow-sm">
                        <div className="size-10 md:size-12 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                            <ShieldCheck className="size-5 md:size-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-[10px] md:text-[11px] font-black text-green-700 uppercase tracking-tight">100% Secure Local RAM</p>
                            <p className="text-[8px] md:text-[10px] text-muted-foreground font-medium leading-tight">Your files never touch any server. All processing is local.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
