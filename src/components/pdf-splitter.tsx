"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, Loader2, Download, Scissors } from 'lucide-react';
import { cn } from '@/lib/utils';

function parsePageRanges(ranges: string, maxPage: number): number[] {
    const result = new Set<number>();
    if (!ranges) return [];

    const parts = ranges.split(',');
    for (const part of parts) {
        const trimmedPart = part.trim();
        if (trimmedPart.includes('-')) {
            const [startStr, endStr] = trimmedPart.split('-');
            const start = parseInt(startStr, 10);
            const end = parseInt(endStr, 10);
            if (!isNaN(start) && !isNaN(end) && start <= end && start > 0 && end <= maxPage) {
                for (let i = start; i <= end; i++) {
                    result.add(i);
                }
            } else {
                return []; // Invalid range
            }
        } else {
            const page = parseInt(trimmedPart, 10);
            if (!isNaN(page) && page > 0 && page <= maxPage) {
                result.add(page);
            } else if (trimmedPart !== '') {
                 return []; // Invalid page number
            }
        }
    }
    return Array.from(result).sort((a, b) => a - b);
}


export default function PdfSplitter() {
    const { toast } = useToast();
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [totalPages, setTotalPages] = useState(0);
    const [pageRanges, setPageRanges] = useState('');
    const [isSplitting, setIsSplitting] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (file: File | null) => {
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
            setPageRanges('');
            setIsSplitting(true); // Show loader while getting page count
            try {
                const pdfBytes = await file.arrayBuffer();
                const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
                setTotalPages(pdfDoc.getPageCount());
            } catch (e) {
                toast({ variant: 'destructive', title: 'Error Reading PDF', description: 'Could not read the PDF file. It might be corrupted.' });
                setPdfFile(null);
                setTotalPages(0);
            } finally {
                setIsSplitting(false);
            }
        } else if (file) {
            toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please select a PDF file.' });
        }
    };

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
    const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
    const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
    const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };

    const handleSplitPdf = async () => {
        if (!pdfFile) return;
        
        const pagesToExtract = parsePageRanges(pageRanges, totalPages);
        if (pagesToExtract.length === 0) {
            toast({ variant: 'destructive', title: 'Invalid Pages', description: 'Please enter valid page numbers or ranges.' });
            return;
        }
        
        setIsSplitting(true);

        try {
            const pdfBytes = await pdfFile.arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes);
            const newPdfDoc = await PDFDocument.create();

            const pageIndices = pagesToExtract.map(p => p - 1); // convert to 0-based index
            const copiedPages = await newPdfDoc.copyPages(pdfDoc, pageIndices);
            copiedPages.forEach(page => newPdfDoc.addPage(page));

            const newPdfBytes = await newPdfDoc.save();
            
            const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `split-${pdfFile.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            toast({title: 'Success!', description: `Created a new PDF with ${pagesToExtract.length} pages.`});

        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error Splitting PDF', description: 'Could not split the PDF. It might be corrupted or encrypted.' });
        } finally {
            setIsSplitting(false);
        }
    };
    
    if (!pdfFile) {
        return (
            <Card
                className={cn("w-full max-w-2xl text-center transition-all duration-300 ease-in-out", isDragOver && "border-primary ring-4 ring-primary/20")}
                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            >
                <CardHeader>
                    <CardTitle>Split PDF</CardTitle>
                    <CardDescription>Upload a PDF to extract specific pages.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-12 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => fileInputRef.current?.click()}>
                        <UploadCloud className="h-16 w-16 text-muted-foreground" />
                        <p className="text-muted-foreground"><span className="text-primary font-semibold">Click to upload</span> or drag and drop a PDF</p>
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={onFileChange} />
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Split PDF</CardTitle>
                <CardDescription>Enter the pages or ranges you want to extract.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="font-medium text-sm">File: {pdfFile.name}</div>
                <div className="font-medium text-sm text-muted-foreground">Total pages: {totalPages}</div>
                <div className="space-y-2">
                    <Label htmlFor="pages">Pages to extract</Label>
                    <Input 
                        id="pages" 
                        type="text" 
                        value={pageRanges} 
                        onChange={(e) => setPageRanges(e.target.value)}
                        placeholder="e.g., 1-3, 5, 8-10"
                        disabled={isSplitting}
                    />
                     <p className="text-xs text-muted-foreground">
                        Use commas to separate pages or ranges.
                    </p>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                <Button onClick={handleSplitPdf} disabled={isSplitting || !pageRanges} className="w-full">
                    {isSplitting ? <Loader2 className="animate-spin mr-2"/> : <Scissors className="mr-2"/>}
                    Split & Download
                </Button>
                <Button variant="ghost" onClick={() => {setPdfFile(null); setTotalPages(0);}}>Split another file</Button>
            </CardFooter>
        </Card>
    );
}
