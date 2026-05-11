
"use client";

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, Loader2, Download, Unlock, AlertCircle, ShieldAlert, Info, RefreshCcw, Zap, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

// Fixed worker path with direct unpkg URL
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PdfUnlocker() {
    const { toast } = useToast();
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [password, setPassword] = useState('');
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("");
    const [isDragOver, setIsDragOver] = useState(false);
    const [unlockedPdfUrl, setUnlockedPdfUrl] = useState<string | null>(null);
    const [errorDetails, setErrorDetails] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isAadhaar = pdfFile?.name.toLowerCase().includes('aadhaar') || pdfFile?.name.toLowerCase().includes('eaadhaar');
    
    useEffect(() => {
        return () => {
            if (unlockedPdfUrl) URL.revokeObjectURL(unlockedPdfUrl);
        }
    }, [unlockedPdfUrl]);
    
    const clearUnlockedFile = () => {
        if (unlockedPdfUrl) {
            URL.revokeObjectURL(unlockedPdfUrl);
            setUnlockedPdfUrl(null);
        }
        setErrorDetails(null);
        setProgress(0);
        setStatusText("");
    }

    const handleFileChange = (file: File | null) => {
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
            setPassword('');
            clearUnlockedFile();
        } else if (file) {
            toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please select a PDF file.' });
        }
    };

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
    const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
    const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
    const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };

    const resetState = () => {
        setPdfFile(null);
        setPassword('');
        clearUnlockedFile();
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    const handlePowerUnlock = async (arrayBuffer: ArrayBuffer) => {
        setStatusText("Activating Universal Power Mode...");
        setProgress(10);

        try {
            const pdf = await pdfjs.getDocument({ 
                data: new Uint8Array(arrayBuffer),
                password: password
            }).promise;

            const totalPages = pdf.numPages;
            const newPdf = new jsPDF({
                orientation: 'p',
                unit: 'pt',
                compress: true
            });

            for (let i = 1; i <= totalPages; i++) {
                setStatusText(`Decrypting Page ${i} of ${totalPages}...`);
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2.0 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                if (context) {
                    context.fillStyle = '#FFFFFF';
                    context.fillRect(0, 0, canvas.width, canvas.height);
                    await page.render({ canvasContext: context, viewport: viewport }).promise;
                    const imgData = canvas.toDataURL('image/jpeg', 0.8);
                    
                    if (i > 1) newPdf.addPage([viewport.width, viewport.height], 'p');
                    else {
                        newPdf.deletePage(1);
                        newPdf.addPage([viewport.width, viewport.height], 'p');
                    }
                    newPdf.addImage(imgData, 'JPEG', 0, 0, viewport.width, viewport.height);
                }
                setProgress(10 + Math.round((i / totalPages) * 85));
            }

            const pdfBlob = newPdf.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            setUnlockedPdfUrl(url);
            setProgress(100);
            setStatusText("Success!");
            toast({ title: 'Success!', description: 'High-Security PDF Unlocked via Power Mode.' });

        } catch (error: any) {
            console.error("Power Mode Error:", error);
            if (error.name === 'PasswordException') {
                setErrorDetails("Incorrect Password. For Aadhaar, use CAPITALS (e.g., ANIS1990).");
            } else {
                setErrorDetails("Could not unlock even in Power Mode. The file might be extremely restricted or corrupt.");
            }
        }
    };

    const handleUnlockPdf = async () => {
        if (!pdfFile || !password) return;
        
        setIsUnlocking(true);
        setErrorDetails(null);
        clearUnlockedFile();
        setStatusText("Analyzing Security Level...");
        setProgress(5);

        try {
            const pdfBytes = await pdfFile.arrayBuffer();

            try {
                const pdfDoc = await PDFDocument.load(pdfBytes, { userPassword: password });
                const unlockedDoc = await PDFDocument.create();
                const copiedPages = await unlockedDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
                copiedPages.forEach((page) => unlockedDoc.addPage(page));
                const finalBytes = await unlockedDoc.save();
                const url = URL.createObjectURL(new Blob([finalBytes], { type: 'application/pdf' }));
                setUnlockedPdfUrl(url);
                setProgress(100);
                setIsUnlocking(false);
                toast({ title: 'Success!', description: 'PDF Unlocked (Fast Mode).' });
                return;
            } catch (libError: any) {
                const msg = libError.message?.toLowerCase() || "";
                if (msg.includes('encryption') || msg.includes('unsupported') || msg.includes('aes') || isAadhaar) {
                    await handlePowerUnlock(pdfBytes);
                    setIsUnlocking(false);
                    return;
                }
                if (msg.includes('password')) {
                    setErrorDetails("The password you entered is incorrect.");
                    setIsUnlocking(false);
                    return;
                }
                await handlePowerUnlock(pdfBytes);
            }
        } catch (error: any) {
            console.error("Critical Error:", error);
            setErrorDetails("Technical failure while reading the file.");
        } finally {
            setIsUnlocking(false);
        }
    };
    
    const handleDownload = () => {
        if (!unlockedPdfUrl || !pdfFile) return;
        const link = document.createElement('a');
        link.href = unlockedPdfUrl;
        link.download = `unlocked-${pdfFile.name}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    if (!pdfFile) {
        return (
            <Card
                className={cn("w-full max-w-2xl text-center transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/20 hover:ring-2 hover:ring-primary/50 dark:hover:shadow-primary/10", isDragOver && "border-primary ring-4 ring-primary/20")}
                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            >
                <CardHeader>
                    <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                        <Unlock className="text-primary h-6 w-6" /> Universal PDF Unlocker
                    </CardTitle>
                    <CardDescription>Upload any protected PDF, including Aadhaar and Bank Statements.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border-2 border-dashed border-muted-foreground/50 rounded-xl p-12 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-muted/50 transition-all group" onClick={() => fileInputRef.current?.click()}>
                        <div className="relative">
                            <UploadCloud className="h-16 w-16 text-muted-foreground group-hover:text-primary transition-colors" />
                            <Zap className="absolute -top-2 -right-2 h-6 w-6 text-yellow-500 animate-pulse" />
                        </div>
                        <p className="text-muted-foreground font-medium">Drop High-Security PDF here</p>
                        <p className="text-xs text-muted-foreground">Works for Aadhaar, Bank Bills, & more.</p>
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={onFileChange} />
                </CardContent>
                <CardFooter className="justify-center text-[10px] text-muted-foreground bg-muted/5 py-4 gap-4">
                    <div className="flex items-center"><ShieldAlert className="h-3 w-3 mr-1 text-green-500" /> 100% Local Decryption</div>
                    <div className="flex items-center"><Zap className="h-3 w-3 mr-1 text-yellow-500" /> AES-256 Supported</div>
                </CardFooter>
            </Card>
        );
    }
    
    return (
        <Card className="w-full max-w-md shadow-2xl border-primary/10 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                    {isAadhaar ? <ShieldAlert className="text-primary h-5 w-5" /> : <Unlock className="text-primary h-5 w-5" />}
                    Unlock Document
                </CardTitle>
                <CardDescription className="truncate font-mono text-[10px]">File: {pdfFile.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                {!unlockedPdfUrl && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Document Password</Label>
                            <input 
                                id="password" 
                                type="password" 
                                value={password} 
                                onChange={(e) => { setPassword(e.target.value); setErrorDetails(null); }}
                                placeholder="Enter password..."
                                disabled={isUnlocking}
                                className="flex h-12 w-full rounded-md border-2 border-input bg-background px-3 py-2 text-lg font-bold tracking-widest ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-inner disabled:opacity-50"
                            />
                        </div>
                        
                        {isAadhaar && !errorDetails && !isUnlocking && (
                            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800 flex gap-3 animate-in slide-in-from-left duration-500">
                                <Info className="h-5 w-5 text-blue-500 shrink-0" />
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-blue-700 dark:text-blue-300 uppercase tracking-tighter">Aadhaar Password Tip</p>
                                    <p className="text-[11px] text-blue-600 dark:text-blue-400 leading-tight">
                                        FIRST 4 LETTERS of Name (CAPS) + Birth Year. 
                                        <br/>Ex: <span className="font-mono font-bold bg-blue-100 dark:bg-blue-900 px-1 rounded">GAUR1995</span>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {isUnlocking && (
                    <div className="space-y-4 py-4 text-center">
                        <div className="relative inline-block">
                             <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20" />
                             <Zap className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <p className="font-black text-primary uppercase tracking-tighter text-sm animate-pulse">{statusText}</p>
                            <Progress value={progress} className="h-2" />
                            <p className="text-[10px] text-muted-foreground font-bold">This might take a minute for large files.</p>
                        </div>
                    </div>
                )}

                {errorDetails && (
                    <Alert variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 animate-in shake-1">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle className="text-xs font-bold uppercase">Processing Failed</AlertTitle>
                        <AlertDescription className="text-[11px] font-medium leading-relaxed mt-1">
                            {errorDetails}
                        </AlertDescription>
                    </Alert>
                )}

                {unlockedPdfUrl && (
                    <div className="p-8 bg-green-500/10 border-2 border-dashed border-green-500/30 rounded-2xl flex flex-col items-center gap-4 animate-in zoom-in-95">
                        <div className="size-16 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-500/20">
                            <Download className="h-8 w-8" />
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-green-700">Decryption Successful!</p>
                            <p className="text-xs text-green-600/80">The security has been removed.</p>
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex flex-col gap-3 bg-muted/10 border-t p-6">
                {!unlockedPdfUrl ? (
                    <Button onClick={handleUnlockPdf} disabled={isUnlocking || !password} className="w-full h-14 text-lg font-black bg-primary hover:bg-primary/90 shadow-xl">
                        {isUnlocking ? <Loader2 className="animate-spin mr-2"/> : <Sparkles className="mr-2 h-5 w-5"/>}
                        {isUnlocking ? "DECRYPTING..." : "UNLOCK PDF"}
                    </Button>
                ) : (
                    <Button onClick={handleDownload} className="w-full h-14 text-lg font-black bg-green-600 hover:bg-green-700 shadow-xl shadow-green-500/20 animate-bounce">
                        <Download className="mr-2" />
                        DOWNLOAD UNLOCKED PDF
                    </Button>
                )}
                <Button variant="ghost" onClick={resetState} className="w-full text-xs" disabled={isUnlocking}>
                    <RefreshCcw className="h-3 w-3 mr-1" /> {unlockedPdfUrl ? "Unlock Another File" : "Select Different File"}
                </Button>
            </CardFooter>
        </Card>
    );
}
