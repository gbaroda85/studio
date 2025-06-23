"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, Loader2, Download, Merge, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PdfMerger() {
    const { toast } = useToast();
    const [pdfFiles, setPdfFiles] = useState<File[]>([]);
    const [isMerging, setIsMerging] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFilesChange = (files: FileList | null) => {
        const newFiles = Array.from(files || []).filter(file => file.type === 'application/pdf');
        if (newFiles.length === 0 && files && files.length > 0) {
            toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please select only PDF files.' });
            return;
        }
        setPdfFiles(prev => [...prev, ...newFiles]);
    };

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFilesChange(e.target.files);
    const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
    const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
    const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFilesChange(e.dataTransfer.files); };

    const handleRemoveFile = (index: number) => {
        setPdfFiles(files => files.filter((_, i) => i !== index));
    };

    const handleMergePdfs = async () => {
        if (pdfFiles.length < 2) {
            toast({ variant: 'destructive', title: 'Not enough files', description: 'Please upload at least two PDFs to merge.' });
            return;
        }
        setIsMerging(true);

        try {
            const mergedPdf = await PDFDocument.create();
            for (const file of pdfFiles) {
                const pdfBytes = await file.arrayBuffer();
                const pdfDoc = await PDFDocument.load(pdfBytes);
                const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }
            const mergedPdfBytes = await mergedPdf.save();
            
            const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'merged.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            toast({title: 'Success!', description: 'Your PDFs have been merged and downloaded.'});

        } catch (error) {
            toast({ variant: 'destructive', title: 'Error Merging', description: 'Could not merge the PDFs. One or more files might be corrupt or password-protected.' });
        } finally {
            setIsMerging(false);
        }
    };
    
    return (
        <Card className={cn("w-full max-w-4xl transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.01] hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/20 hover:ring-2 hover:ring-primary/50 dark:hover:shadow-primary/10", isDragOver && "border-primary ring-4 ring-primary/20")}
            onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
            <CardHeader>
                <CardTitle>Merge PDFs</CardTitle>
                <CardDescription>Upload multiple PDF files to combine them into one.</CardDescription>
            </CardHeader>
            <CardContent>
                {pdfFiles.length === 0 ? (
                    <div className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-12 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => fileInputRef.current?.click()}>
                        <UploadCloud className="h-16 w-16 text-muted-foreground" />
                        <p className="text-muted-foreground"><span className="text-primary font-semibold">Click to upload</span> or drag and drop PDFs</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {pdfFiles.map((file, index) => (
                             <div key={index} className="flex items-center justify-between p-2 border rounded-md bg-muted/30">
                                 <div className="flex items-center gap-3">
                                    <FileText className="h-6 w-6 text-primary" />
                                    <span className="text-sm font-medium">{file.name}</span>
                                 </div>
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleRemoveFile(index)}><X className="h-4 w-4" /></Button>
                             </div>
                        ))}
                        <div className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-4 flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => fileInputRef.current?.click()}>
                            <UploadCloud className="h-6 w-6 text-muted-foreground mr-2" />
                            <span className="text-sm">Add more files...</span>
                        </div>
                    </div>
                )}
                <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" multiple onChange={onFileChange} />
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                {pdfFiles.length > 0 && <Button variant="outline" onClick={() => setPdfFiles([])}>Clear All</Button>}
                <Button onClick={handleMergePdfs} disabled={isMerging || pdfFiles.length < 2}>
                    {isMerging ? <Loader2 className="mr-2 animate-spin" /> : <Merge className="mr-2" />}
                    {isMerging ? 'Merging...' : 'Merge & Download'}
                </Button>
            </CardFooter>
        </Card>
    )
}
