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
    ArchiveRestore, 
    File as FileIcon, 
    X, 
    ShieldCheck, 
    Zap, 
    RefreshCcw, 
    CheckCircle2, 
    Sparkles,
    Eye,
    FileArchive,
    SearchCode,
    Plus,
    Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';

type ExtractedFile = {
    id: string;
    name: string;
    url: string;
    size: number;
};

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export default function Unzipper() {
    const { toast } = useToast();
    const [zipFile, setZipFile] = useState<File | null>(null);
    const [extractedFiles, setExtractedFiles] = useState<ExtractedFile[]>([]);
    const [isUnzipping, setIsUnzipping] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (file: File | null) => {
        if (!file) return;
        
        // Broader ZIP check for various browsers
        const isZip = file.type.includes('zip') || 
                      file.type.includes('octet-stream') || 
                      file.name.toLowerCase().endsWith('.zip') ||
                      file.name.toLowerCase().endsWith('.zipx');

        if (isZip) {
            if (file.size > 800 * 1024 * 1024) { 
                toast({ variant: 'destructive', title: 'File Too Large', description: 'Max 800MB supported for local extraction.' });
                return;
            }
            setZipFile(file);
            handleUnzip(file);
        } else {
            toast({ variant: 'destructive', title: 'Invalid File', description: 'Please upload a valid .zip archive.' });
        }
    };

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
    const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
    const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
    const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };

    const handleUnzip = async (file: File) => {
        setIsUnzipping(true);
        setProgress(5);
        setExtractedFiles([]);
        try {
            // Read as ArrayBuffer for maximum robustness
            const arrayBuffer = await file.arrayBuffer();
            setProgress(20);
            
            const zip = await JSZip.loadAsync(arrayBuffer);
            const files: ExtractedFile[] = [];
            const filenames = Object.keys(zip.files).filter(name => !zip.files[name].dir);
            
            setProgress(30);
            for (let i = 0; i < filenames.length; i++) {
                const filename = filenames[i];
                const zipEntry = zip.files[filename];
                
                // Extract file content as blob
                const fileData = await zipEntry.async('blob');
                const url = URL.createObjectURL(fileData);
                
                files.push({ 
                    id: Math.random().toString(36).substr(2, 9), 
                    name: filename, 
                    url, 
                    size: fileData.size 
                });
                
                setProgress(30 + Math.round(((i + 1) / filenames.length) * 70));
            }
            setExtractedFiles(files);
            toast({ title: 'Extraction Success!', description: `Successfully extracted ${files.length} files.` });
        } catch (error: any) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: "Could not process zip archive." });
            setZipFile(null);
        } finally {
            setIsUnzipping(false);
        }
    };
    
    const handleDownload = (url: string, name: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    const resetState = () => {
        extractedFiles.forEach(f => URL.revokeObjectURL(f.url));
        setZipFile(null);
        setExtractedFiles([]);
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    return (
        <div className="w-full max-w-7xl animate-in fade-in duration-500 px-4 flex flex-col items-center gap-6">
            {!zipFile && (
                <div className="w-full max-w-4xl py-4 flex flex-col items-center justify-center gap-6">
                    <div className="text-center space-y-2 animate-in fade-in slide-in-from-top-4 duration-500 mb-4">
                        <div className="mx-auto mb-2 grid size-16 place-items-center rounded-[2rem] bg-primary/10 text-primary shadow-xl relative">
                            <ArchiveRestore className="size-8" />
                            <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground size-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                                <Sparkles className="size-2.5" />
                            </div>
                        </div>
                        <h1 className="text-2xl md:text-4xl font-black font-headline tracking-tighter uppercase leading-none">
                            Secure <span className="text-gradient-hero">Unzip Pro</span>
                        </h1>
                        <p className="text-xs md:text-sm text-muted-foreground font-semibold max-xl mx-auto">
                            Extract ZIP archives instantly without server uploads. <br/>100% Private local RAM processing.
                        </p>
                    </div>

                    <Card
                        className={cn(
                            "w-full max-w-2xl glass-card overflow-hidden transition-all duration-300 border-2 border-dashed shadow-2xl rounded-[2.5rem] hover:-translate-y-1 hover:border-primary/50 dark:hover:shadow-primary/20",
                            isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.02]"
                        )}
                        onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <CardHeader className="bg-muted/30 border-b p-6 text-center">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">ARCHIVE STUDIO</CardTitle>
                        </CardHeader>
                        <CardContent className="p-10 md:p-12">
                            <div className="border-4 border-dashed border-muted-foreground/20 rounded-[2rem] p-12 md:p-16 flex flex-col items-center justify-center space-y-6 bg-muted/30 group cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}>
                                <div className="relative">
                                    <UploadCloud className="size-16 md:size-20 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <Zap className="absolute -top-1 -right-1 size-6 md:size-8 text-yellow-500 animate-pulse" />
                                </div>
                                <div className="text-center">
                                    <p className="text-xl md:text-2xl font-black uppercase tracking-tighter">Drop ZIP File here</p>
                                    <p className="text-[10px] md:text-sm text-muted-foreground mt-2 font-bold opacity-60 uppercase tracking-widest">Sanitization & Extract active.</p>
                                </div>
                            </div>
                            <input ref={fileInputRef} type="file" className="hidden" accept=".zip,application/zip,application/x-zip,application/x-zip-compressed" onChange={onFileChange} />
                        </CardContent>
                        <CardFooter className="justify-center gap-6 text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 bg-muted/10 pt-6 px-4">
                            <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-600" /> SECURE RAM</div>
                            <div className="flex items-center gap-1.5"><SearchCode className="size-3 text-primary" /> INDEX SCAN</div>
                            <div className="flex items-center gap-1.5"><Zap className="size-3 text-yellow-500" /> INSTANT UNZIP</div>
                        </CardFooter>
                    </Card>
                </div>
            )}

            {zipFile && (
                <div className="w-full grid lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-5 space-y-6">
                        <Card className="border-2 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950 border-primary/10 transition-all hover:border-primary/30">
                            <CardHeader className="bg-primary/5 border-b p-6">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-3">
                                        <FileArchive className="size-6 text-primary" /> Source Archive
                                    </CardTitle>
                                    <Button variant="ghost" size="icon" onClick={resetState} className="h-8 w-8 text-destructive hover:bg-destructive/5"><X className="size-5" /></Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                <div className="p-6 bg-muted/20 border-2 border-dashed border-muted-foreground/20 rounded-2xl flex flex-col items-center gap-4 text-center">
                                    <div className="size-14 rounded-2xl bg-white dark:bg-slate-900 border flex items-center justify-center shadow-lg"><FileIcon className="size-8 text-primary" /></div>
                                    <div>
                                        <p className="text-sm font-black uppercase tracking-tight truncate max-w-[250px]" title={zipFile.name}>{zipFile.name}</p>
                                        <p className="text-[10px] font-mono opacity-50 uppercase mt-1">{formatBytes(zipFile.size)}</p>
                                    </div>
                                </div>
                                {isUnzipping ? (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        <div className="relative flex flex-col items-center gap-4">
                                            <Loader2 className="size-12 animate-spin text-primary stroke-[3]" />
                                            <div className="text-center">
                                                <p className="text-xs font-black uppercase tracking-widest text-primary animate-pulse">Decompressing Stack...</p>
                                                <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase">Local RAM logic active</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Progress value={progress} className="h-1.5 shadow-inner" />
                                            <div className="flex justify-between text-[8px] font-black uppercase opacity-40">
                                                <span>SCANNING BLOCKS</span>
                                                <span>{progress}%</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-5 bg-green-500/5 rounded-2xl border-2 border-green-500/10 flex gap-4 animate-in zoom-in-95">
                                        <CheckCircle2 className="size-6 text-green-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] font-black text-green-700 uppercase tracking-tight">Archive Ready</p>
                                            <p className="text-[8px] text-green-600/80 font-medium leading-relaxed mt-1 uppercase">
                                                {extractedFiles.length} files extracted.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="bg-muted/10 p-6 border-t-2 border-dashed flex justify-center">
                                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Secured Digital Workspace</p>
                            </CardFooter>
                        </Card>
                    </div>

                    <div className="lg:col-span-7 flex flex-col">
                        <Card className="border-2 shadow-2xl rounded-[2.5rem] overflow-hidden bg-card/50 flex flex-col h-full min-h-[500px]">
                            <CardHeader className="bg-muted/30 border-b p-6 flex flex-row items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20"><Plus className="size-5" /></div>
                                    <CardTitle className="text-sm font-black uppercase tracking-[0.2em]">EXTRACTED FILES</CardTitle>
                                </div>
                                <Badge variant="secondary" className="font-mono text-[10px] font-black">{extractedFiles.length}</Badge>
                            </CardHeader>
                            <CardContent className="flex-1 p-0 bg-slate-50 dark:bg-slate-900/50 shadow-inner">
                                <ScrollArea className="h-[450px] md:h-[600px] w-full p-4 md:p-8">
                                    <div className="grid gap-3">
                                        {extractedFiles.length === 0 && !isUnzipping ? (
                                            <div className="flex flex-col items-center justify-center py-20 opacity-20 gap-4">
                                                <X className="size-16" />
                                                <p className="text-[10px] font-black uppercase tracking-widest">Waiting for process</p>
                                            </div>
                                        ) : (
                                            extractedFiles.map((file) => (
                                                <motion.div 
                                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                                                    key={file.id} 
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
                                                    <Button 
                                                        size="lg" 
                                                        className="h-10 md:h-12 px-6 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-xl font-black text-[10px] uppercase group-hover:scale-105 transition-all shrink-0" 
                                                        onClick={() => handleDownload(file.url, file.name)}
                                                    >
                                                        <Download className="mr-2 size-4" /> <span className="hidden sm:inline">DOWNLOAD</span>
                                                    </Button>
                                                </motion.div>
                                            ))
                                        )}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                            <CardFooter className="bg-muted/20 border-t p-6 md:p-8 flex justify-between items-center">
                                <Button variant="ghost" onClick={resetState} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-destructive/5 hover:text-destructive h-10 px-6 rounded-xl border-2">
                                    <RefreshCcw className="size-3.5 mr-2" /> Start New Unzip
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
