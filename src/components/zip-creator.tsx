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
    FileArchive,
    SearchCode,
    Plus,
    Trash2,
    Layers,
    Settings2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';

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

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFilesChange(e.target.files);
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
            // Process files one by one for better reliability
            for (let i = 0; i < filesToZip.length; i++) {
                const file = filesToZip[i];
                // Read as ArrayBuffer for standard compatibility
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
        <div className="w-full flex flex-col items-center gap-6 animate-in fade-in duration-500">
            {filesToZip.length === 0 ? (
                <div className="w-full max-w-4xl py-4 flex flex-col items-center justify-center gap-6">
                    <Card
                        className={cn(
                            "w-full max-w-2xl glass-card overflow-hidden transition-all duration-300 border-2 border-dashed shadow-2xl rounded-[2.5rem] hover:-translate-y-1 hover:border-primary/50",
                            isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.02]"
                        )}
                        onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                    >
                        <CardHeader className="bg-muted/30 border-b p-6 text-center">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">ZIP STUDIO WORKSPACE</CardTitle>
                        </CardHeader>
                        <CardContent className="p-10 md:p-12">
                            <div 
                                className="border-4 border-dashed border-muted-foreground/20 rounded-[2rem] p-12 md:p-16 flex flex-col items-center justify-center space-y-6 bg-muted/30 group cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="relative">
                                    <UploadCloud className="size-16 md:size-20 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <Zap className="absolute -top-2 -right-2 size-5 md:size-8 text-yellow-500 animate-pulse" />
                                </div>
                                <div className="text-center">
                                    <p className="text-xl md:text-2xl font-black uppercase tracking-tighter">Drop Files to Bundle</p>
                                    <p className="text-[10px] md:text-sm text-muted-foreground mt-2 font-bold opacity-60 uppercase tracking-widest">WASM-based local archiving active.</p>
                                </div>
                            </div>
                            <input ref={fileInputRef} type="file" className="hidden" multiple onChange={onFileChange} />
                        </CardContent>
                        <CardFooter className="justify-center gap-6 text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 bg-muted/10 pt-6 px-4">
                            <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-600" /> SECURE RAM</div>
                            <div className="flex items-center gap-1.5"><SearchCode className="size-3 text-primary" /> INDEX SCAN</div>
                            <div className="flex items-center gap-1.5"><Zap className="size-3 text-yellow-500" /> INSTANT ZIP</div>
                        </CardFooter>
                    </Card>
                </div>
            ) : (
                <div className="w-full max-w-7xl grid lg:grid-cols-12 gap-8 items-start px-4">
                    {/* LEFT PANEL: CONFIG & ACTIONS */}
                    <div className="lg:col-span-5 space-y-6">
                        <Card className="border-2 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950 border-primary/10 transition-all hover:border-primary/30">
                            <CardHeader className="bg-primary/5 border-b p-6">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-3">
                                        <Settings2 className="size-6 text-primary" /> Bundle Panel
                                    </CardTitle>
                                    <Button variant="ghost" size="icon" onClick={handleReset} className="h-8 w-8 text-destructive hover:bg-destructive/5"><X className="size-5" /></Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                <div className="p-6 bg-muted/20 border-2 border-dashed border-muted-foreground/20 rounded-2xl flex flex-col items-center gap-4 text-center">
                                    <div className="size-14 rounded-2xl bg-white dark:bg-slate-900 border flex items-center justify-center shadow-lg"><Layers className="size-8 text-primary" /></div>
                                    <div>
                                        <p className="text-sm font-black uppercase tracking-tight">{filesToZip.length} Files Selected</p>
                                        <p className="text-[10px] font-mono opacity-50 uppercase mt-1">Ready for Bundling</p>
                                    </div>
                                </div>

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
                                    <div className="p-5 bg-primary/5 rounded-2xl border-2 border-primary/10 flex gap-4">
                                        <Zap className="size-6 text-yellow-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] font-black text-primary uppercase tracking-tight">Local Speed</p>
                                            <p className="text-[9px] text-primary/80 font-medium leading-relaxed mt-1 uppercase">
                                                Using 32-bit hardware acceleration for instant bundling.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="bg-muted/10 p-6 border-t flex flex-col gap-3">
                                {!zippedFileUrl ? (
                                    <Button 
                                        className="w-full h-16 text-lg md:text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-2xl transition-all active:scale-95 disabled:opacity-50 group" 
                                        onClick={handleCreateZip}
                                        disabled={isZipping || filesToZip.length === 0}
                                    >
                                        {isZipping ? (
                                            <div className="flex items-center gap-3">
                                                <Loader2 className="size-6 animate-spin" />
                                                <span className="uppercase text-sm tracking-tighter">BUNDLING...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <Archive className="size-6 text-white/50 group-hover:scale-125 transition-transform" />
                                                <span className="uppercase tracking-tighter">CREATE ZIP ARCHIVE</span>
                                            </div>
                                        )}
                                    </Button>
                                ) : (
                                    <Button size="lg" className="w-full h-16 bg-green-600 hover:bg-green-700 text-lg font-black rounded-2xl shadow-2xl transition-all active:scale-95 group" onClick={handleDownload}>
                                        <Download className="mr-3 size-6 group-hover:translate-y-1 transition-transform" /> SAVE ZIP ARCHIVE
                                    </Button>
                                )}
                                <Button variant="ghost" onClick={handleReset} className="w-full h-10 font-black uppercase text-[10px] tracking-widest text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5 rounded-xl border-2 border-dashed">
                                    <RefreshCcw className="size-3.5 mr-2" /> Start New Bundle
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>

                    {/* RIGHT PANEL: SELECTED FILES LIST */}
                    <div className="lg:col-span-7 flex flex-col h-full min-h-[500px]">
                        <Card className="border-2 shadow-2xl rounded-[2.5rem] overflow-hidden bg-card/50 flex flex-col h-full">
                            <CardHeader className="bg-muted/30 border-b p-6 flex flex-row items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20"><Plus className="size-5" /></div>
                                    <CardTitle className="text-sm font-black uppercase tracking-[0.2em]">FILE QUEUE</CardTitle>
                                </div>
                                <Badge variant="secondary" className="font-mono text-[10px] font-black">{filesToZip.length}</Badge>
                            </CardHeader>
                            <CardContent className="flex-1 p-0 bg-slate-50 dark:bg-slate-900/50 shadow-inner">
                                <ScrollArea className="h-[450px] md:h-[600px] w-full p-4 md:p-8">
                                    <div className="grid gap-3">
                                        {filesToZip.map((file, index) => (
                                            <motion.div 
                                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                                                key={`${file.name}-${index}`} 
                                                className="flex items-center justify-between p-3 md:p-4 rounded-2xl border-2 border-transparent bg-white dark:bg-slate-900 hover:border-primary/40 transition-all group shadow-md"
                                            >
                                                <div className="flex items-center gap-4 truncate pr-4">
                                                    <div className="size-10 md:size-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0 border border-primary/10 shadow-inner">
                                                        <FileIcon className="size-5 md:size-6" />
                                                    </div>
                                                    <div className="truncate text-left">
                                                        <p className="text-xs md:text-sm font-black truncate max-w-[150px] md:max-w-[350px] uppercase tracking-tight" title={file.name}>{file.name}</p>
                                                        <p className="text-[8px] md:text-[9px] font-mono text-muted-foreground/60 uppercase mt-0.5">{formatBytes(file.size)}</p>
                                                    </div>
                                                </div>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-full" onClick={() => handleRemoveFile(index)}>
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </motion.div>
                                        ))}
                                        <button 
                                            className="border-2 border-dashed border-primary/20 rounded-xl flex flex-col items-center justify-center gap-3 hover:bg-primary/5 hover:border-primary/50 transition-all h-24 shadow-inner group"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <div className="size-10 rounded-full bg-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Plus className="size-5 text-primary" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase text-primary tracking-widest">Add More Files</span>
                                        </button>
                                    </div>
                                </ScrollArea>
                            </CardContent>
                            <CardFooter className="bg-muted/20 border-t p-6 md:p-8 flex justify-center gap-10 text-[8px] md:text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
                                <div className="flex items-center gap-2"><ShieldCheck className="size-3.5 text-green-500" /> SECURE RAM</div>
                                <div className="flex items-center gap-2"><Zap className="size-3.5 text-yellow-500" /> WASM SPEED</div>
                                <div className="flex items-center gap-2"><Sparkles className="size-3.5 text-primary" /> HD BUNDLE</div>
                            </CardFooter>
                            <input ref={fileInputRef} type="file" className="hidden" multiple onChange={onFileChange} />
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
