"use client";

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, Loader2, Download, FileUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { convertPdfToDocx } from '@/actions/convert';

export default function PdfToWordConverter() {
    const { toast } = useToast();
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [convertedDocxUrl, setConvertedDocxUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        return () => {
            if (convertedDocxUrl) {
                URL.revokeObjectURL(convertedDocxUrl);
            }
        };
    }, [convertedDocxUrl]);

    const handleFileChange = (file: File | null) => {
        const validTypes = ['application/pdf'];
        if (file && validTypes.includes(file.type)) {
            setPdfFile(file);
            setConvertedDocxUrl(null);
            handleConvert(file);
        } else if (file) {
            toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please select a .pdf file.' });
        }
    };

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
    const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
    const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
    const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };
    
    const resetState = () => {
        setPdfFile(null);
        setIsProcessing(false);
        if (convertedDocxUrl) URL.revokeObjectURL(convertedDocxUrl);
        setConvertedDocxUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    const handleConvert = async (file: File) => {
        if (!file) return;
        setIsProcessing(true);
        setConvertedDocxUrl(null);
        toast({ title: 'Processing PDF...', description: 'Your file is being converted. This might take a moment.' });
        
        try {
            const arrayBuffer = await file.arrayBuffer();
            const docxBuffer = await convertPdfToDocx(arrayBuffer);
            
            const docxBlob = new Blob([docxBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
            const url = URL.createObjectURL(docxBlob);
            setConvertedDocxUrl(url);

            toast({ title: 'Success!', description: 'Your PDF has been converted to Word.' });
        } catch (error: any) {
            console.error(error);
            const errorMessage = error.message || 'An unknown error occurred during conversion.';
            toast({ variant: 'destructive', title: 'Conversion Error', description: errorMessage });
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleDownload = () => {
        if (!convertedDocxUrl || !pdfFile) return;
        const link = document.createElement('a');
        link.href = convertedDocxUrl;
        const originalName = pdfFile.name.replace(/\.pdf$/i, '');
        link.download = `${originalName}.docx`;
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
                    <CardTitle>PDF to Word Converter</CardTitle>
                    <CardDescription>Upload a .pdf file to convert it to an editable Word document.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-12 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => fileInputRef.current?.click()}>
                        <UploadCloud className="h-16 w-16 text-muted-foreground" />
                        <p className="text-muted-foreground"><span className="text-primary font-semibold">Click to upload</span> or drag and drop</p>
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,application/pdf" onChange={onFileChange} />
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card className="w-full max-w-lg">
            <CardHeader>
                <CardTitle>PDF to Word</CardTitle>
                <CardDescription>File: {pdfFile.name}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-12 gap-6">
                <FileUp className="h-24 w-24 text-primary" />
                {isProcessing && <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="animate-spin h-5 w-5"/><span>Converting...</span></div>}
                {convertedDocxUrl && <p className="text-green-600 font-semibold">Conversion successful!</p>}
            </CardContent>
            <CardFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <Button variant="outline" onClick={resetState}>Convert Another</Button>
                <Button onClick={handleDownload} disabled={isProcessing || !convertedDocxUrl}>
                    <Download className="mr-2" />
                    Download .docx
                </Button>
            </CardFooter>
        </Card>
    );
}
