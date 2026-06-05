
"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import JSZip from 'jszip';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    UploadCloud, 
    Loader2, 
    Download, 
    Archive, 
    FileText, 
    X, 
    ShieldCheck, 
    Zap, 
    Sparkles, 
    Layers, 
    Plus, 
    Trash2,
    CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ZipCreator() {
    const { toast } = useToast();
    const [filesToZip, setFilesToZip] = useState<File[]>([]);
    const [isZipping, setIsZipping] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [zippedFileUrl, setZippedFileUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFilesChange = (fileList: FileList | null) => {
        if (zippedFileUrl) {
            URL.revokeObjectURL(zippedFileUrl);
            setZippedFileUrl(null);
        }
        const newFiles = Array.from(fileList || []);
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
        setFilesToZip([]);
        if (zippedFileUrl) {
            URL.revokeObjectURL(zippedFileUrl);
            setZippedFileUrl(null);
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleCreateZip = async () => {
        if (filesToZip.length === 0) {
            toast({ variant: 'destructive', title: 'No files selected', description: 'Please add at least one file to create a zip.' });
            return;
        }
        setIsZipping(true);

        try {
            const zip = new JSZip();
            filesToZip.forEach(file => {
                zip.file(file.name, file);
            });

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(zipBlob);
            setZippedFileUrl(url);
            
            toast({title: 'Success!', description: 'Your zip archive has been created.'});

        } catch (error) {
            toast({ variant: 'destructive', title: 'Error Creating Zip', description: 'Failed to bundle files.' });
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
        <Card className={cn(
            "w-full max-w-2xl glass-card overflow-hidden transition-all duration-300 border-2 border-dashed shadow-2xl rounded-[2.5rem] hover:-translate-y-1 hover:border-primary/50 dark:hover:shadow-primary/20",
            isDragOver && "border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.01]"
        )}
            onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
        >
            <CardHeader className="bg-muted/30 border-b p-6 text-center">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">ZIP STUDIO WORKSPACE</CardTitle>
                    {filesToZip.length > 0 && <Badge className="bg-primary text-white font-black text-[10px] uppercase px-3 py-1 rounded-full">{filesToZip.length} FILES</Badge>}
                </div>
            </CardHeader>
            <CardContent className={cn("p-6 md:p-8", filesToZip.length === 0 ? "py-20 md:py-32" : "py-6")}>
                {filesToZip.length === 0 ? (
                    <div 
                        className="border-4 border-dashed border-muted-foreground/20 rounded-[2rem] p-12 md:p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group bg-muted/30"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="relative">
                            <UploadCloud className="size-16 md:size-20 text-muted-foreground group-hover:text-primary transition-colors" />
                            <Zap className="absolute -top-1 -right-1 size-5 md:size-8 text-yellow-500 animate-pulse" />
                        </div>
                        <div className="text-center px-4">
                            <p className="text-xl md:text-2xl font-black uppercase tracking-tighter">Drop Files to Bundle</p>
                            <p className="text-[10px] md:text-sm text-muted-foreground mt-2 font-bold opacity-60 uppercase tracking-widest">WASM-based local archiving active.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Queue List</p>
                            <Button variant="ghost" size="sm" onClick={handleReset} className="text-destructive font-black h-7 text-[9px] uppercase">
                                <Trash2 className="size-3 mr-1"/> Clear All
                            </Button>
                        </div>
                        <ScrollArea className="h-[300px] md:h-[400px] pr-2 custom-scrollbar">
                            <div className="space-y-2">
                                {filesToZip.map((file, index) => (
                                     <div key={`${file.name}-${index}`} className="flex items-center justify-between p-3 rounded-2xl border-2 border-transparent bg-white dark:bg-slate-900 hover:border-primary/40 transition-all group shadow-md animate-in slide-in-from-bottom-2">
                                         <div className="flex items-center gap-3 truncate">
                                            <div className="size-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0 border border-primary/10 shadow-inner">
                                                <FileText className="size-5" />
                                            </div>
                                            <div className="truncate">
                                                <p className="text-xs md:text-sm font-black truncate max-w-[200px] md:max-w-[350px] uppercase tracking-tight" title={file.name}>{file.name}</p>
                                                <p className="text-[8px] md:text-[9px] font-mono text-muted-foreground/60 uppercase">{(file.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                         </div>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-full" onClick={() => handleRemoveFile(index)}><X className="h-4 w-4" /></Button>
                                     </div>
                                ))}
                                <Button variant="outline" className="w-full border-2 border-dashed h-12 rounded-xl mt-4 font-black text-[10px] uppercase text-primary border-primary/20 hover:bg-primary/5 transition-all group" onClick={() => fileInputRef.current?.click()}>
                                    <Plus className="size-4 mr-2 group-hover:scale-125 transition-transform" /> ADD MORE FILES
                                </Button>
                            </div>
                        </ScrollArea>
                    </div>
                )}
                <input ref={fileInputRef} type="file" className="hidden" multiple onChange={onFileChange} />
            </CardContent>
            
            <CardFooter className="bg-muted/10 p-6 md:p-8 border-t flex flex-col gap-4">
                {!zippedFileUrl ? (
                    <Button 
                        onClick={handleCreateZip} 
                        disabled={isZipping || filesToZip.length === 0}
                        className="w-full h-16 md:h-20 text-lg md:text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-2xl md:rounded-[1.5rem] group transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isZipping ? (
                            <div className="flex items-center gap-3">
                                <Loader2 className="size-6 md:size-8 animate-spin" />
                                <span className="uppercase text-sm md:text-base tracking-tighter">BUNDLING...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Archive className="size-6 md:size-8 text-white/50 group-hover:scale-125 transition-transform" />
                                <span className="uppercase tracking-tighter text-lg md:text-2xl">CREATE ZIP ARCHIVE</span>
                            </div>
                        )}
                    </Button>
                ) : (
                    <div className="w-full space-y-4 animate-in zoom-in-95">
                        <div className="p-5 bg-green-500/5 rounded-2xl border-2 border-dashed border-green-500/20 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-full bg-green-500 text-white flex items-center justify-center shadow-xl relative">
                                    <CheckCircle2 className="size-7" />
                                    <Sparkles className="absolute -top-1 -right-1 text-yellow-400 size-4" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-black text-green-800 uppercase tracking-tight">BUNDLE READY!</p>
                                    <p className="text-[9px] text-green-700 font-bold uppercase opacity-60">Archive created in local RAM</p>
                                </div>
                            </div>
                            <Button size="lg" className="h-12 px-8 bg-green-600 hover:bg-green-700 text-white font-black text-xs rounded-xl shadow-xl uppercase group" onClick={handleDownload}>
                                <Download className="mr-2 size-4 group-hover:translate-y-1 transition-transform" /> DOWNLOAD ZIP
                            </Button>
                        </div>
                        <Button variant="ghost" onClick={handleReset} className="w-full h-10 font-black uppercase text-[10px] tracking-widest text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5 rounded-xl border-2 border-dashed">
                             <RefreshCcw className="size-3.5 mr-2" /> Start New Bundle
                        </Button>
                    </div>
                )}

                <div className="flex items-center justify-center gap-8 w-full text-[8px] md:text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest pt-4">
                    <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-600" /> SECURE RAM</div>
                    <div className="flex items-center gap-1.5"><Zap className="size-3 text-yellow-500" /> WASM SPEED</div>
                    <div className="flex items-center gap-1.5"><Layers className="size-3 text-purple-500" /> FAST BUNDLE</div>
                </div>
            </CardFooter>
        </Card>
    );
}
