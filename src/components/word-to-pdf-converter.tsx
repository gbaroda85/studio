
"use client";

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, Loader2, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import mammoth from 'mammoth';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function WordToPdfConverter() {
    const { toast } = useToast();
    const [wordFile, setWordFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [convertedPdfUrl, setConvertedPdfUrl] = useState<string | null>(null);
    const [previewHtml, setPreviewHtml] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    
    // Effect to run the PDF conversion after the HTML preview is rendered
    useEffect(() => {
        if (!isProcessing || !previewHtml || !previewRef.current) {
            return;
        }

        const createPdf = async () => {
            try {
                const canvas = await html2canvas(previewRef.current as HTMLDivElement, {
                    scale: 2, // Higher scale for better quality
                    useCORS: true,
                    width: previewRef.current.scrollWidth,
                    height: previewRef.current.scrollHeight
                });
                const imgData = canvas.toDataURL('image/png');
                
                const pdf = new jsPDF({
                    orientation: 'p',
                    unit: 'mm',
                    format: 'a4',
                });

                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                const ratio = canvasWidth / canvasHeight;

                const imgWidth = pdfWidth;
                const imgHeight = imgWidth / ratio;
                
                let heightLeft = imgHeight;
                let position = 0;

                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;

                while (heightLeft > 0) {
                    position -= pdfHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pdfHeight;
                }

                const pdfBlob = pdf.output('blob');
                const url = URL.createObjectURL(pdfBlob);
                setConvertedPdfUrl(url);
                toast({ title: 'Success!', description: 'Your Word document has been converted to PDF.' });
            } catch (error) {
                console.error("PDF generation error:", error);
                toast({ variant: 'destructive', title: 'Conversion Error', description: 'Failed to generate PDF from the document preview.' });
            } finally {
                setIsProcessing(false);
                setPreviewHtml(null); // Clean up the hidden div content
            }
        };

        // A small timeout helps ensure the browser has fully painted the HTML before html2canvas runs.
        const timerId = setTimeout(createPdf, 200);
        
        return () => clearTimeout(timerId);

    }, [isProcessing, previewHtml, toast]);

    // Cleanup blob URL
    useEffect(() => {
        return () => {
            if (convertedPdfUrl) {
                URL.revokeObjectURL(convertedPdfUrl);
            }
        };
    }, [convertedPdfUrl]);

    const handleFileChange = (file: File | null) => {
        const validTypes = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (file && validTypes.includes(file.type)) {
            resetState(); // Reset everything for the new file
            setWordFile(file);
            handleConvert(file);
        } else if (file) {
            toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please select a .docx file.' });
        }
    };

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
    const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
    const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
    const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };
    
    const resetState = () => {
        setWordFile(null);
        setIsProcessing(false);
        if (convertedPdfUrl) URL.revokeObjectURL(convertedPdfUrl);
        setConvertedPdfUrl(null);
        setPreviewHtml(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    const handleConvert = async (file: File) => {
        if (!file) return;
        setIsProcessing(true);
        toast({ title: 'Processing Word File...', description: 'Extracting content. This might take a moment.' });
        
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const arrayBuffer = e.target?.result as ArrayBuffer;

                const mammothOptions = {
                    convertImage: mammoth.images.imgElement(function(image) {
                        return image.read("base64").then(function(imageBuffer) {
                            return {
                                src: "data:" + image.contentType + ";base64," + imageBuffer
                            };
                        });
                    })
                };

                const result = await mammoth.convertToHtml({ arrayBuffer }, mammothOptions);
                
                const styledHtml = `
                    <style>
                        body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.4; margin: 0; }
                        h1, h2, h3, h4, h5, h6 { font-weight: bold; margin-bottom: 0.5em; }
                        h1 { font-size: 22pt; }
                        h2 { font-size: 18pt; }
                        h3 { font-size: 14pt; }
                        p { margin: 0 0 1em 0; text-align: justify; }
                        ul, ol { margin: 0 0 1em 2em; padding: 0; }
                        li { margin-bottom: 0.5em; }
                        table { border-collapse: collapse; width: 100%; margin-bottom: 1em; page-break-inside: avoid; }
                        td, th { border: 1px solid #cccccc; padding: 0.5em; text-align: left; }
                        th { font-weight: bold; background-color: #f0f0f0; }
                        img { max-width: 100%; height: auto; display: block; margin: 1em 0; }
                        a { color: #0000ee; text-decoration: underline; }
                        strong, b { font-weight: bold; }
                        em, i { font-style: italic; }
                        blockquote { border-left: 4px solid #cccccc; margin-left: 1.5em; padding-left: 1em; font-style: italic; }
                        pre { background-color: #f5f5f5; padding: 1em; white-space: pre-wrap; font-family: 'Courier New', Courier, monospace; }
                        code { font-family: 'Courier New', Courier, monospace; }
                    </style>
                    ${result.value}
                `;
                setPreviewHtml(styledHtml); // This will trigger the useEffect
            } catch (error) {
                console.error(error);
                toast({ variant: 'destructive', title: 'Parsing Error', description: 'Could not parse the .docx file. It might be corrupt or unsupported.' });
                setIsProcessing(false);
            }
        };
        reader.onerror = () => {
            toast({ variant: 'destructive', title: 'File Read Error', description: 'There was an error reading your file.' });
            setIsProcessing(false);
        }
        reader.readAsArrayBuffer(file);
    };
    
    const handleDownload = () => {
        if (!convertedPdfUrl || !wordFile) return;
        const link = document.createElement('a');
        link.href = convertedPdfUrl;
        const originalName = wordFile.name.replace(/\.docx$/i, '');
        link.download = `${originalName}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <>
            <Card
                className={cn("w-full max-w-2xl text-center transition-all duration-300 ease-in-out", !wordFile && "hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/20 hover:ring-2 hover:ring-primary/50 dark:hover:shadow-primary/10", isDragOver && "border-primary ring-4 ring-primary/20")}
                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            >
                <CardHeader>
                    <CardTitle>Word to PDF Converter</CardTitle>
                    <CardDescription>
                        {wordFile ? `File: ${wordFile.name}` : 'Upload a .docx file to convert it to PDF.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!wordFile ? (
                        <div className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-12 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => fileInputRef.current?.click()}>
                            <UploadCloud className="h-16 w-16 text-muted-foreground" />
                            <p className="text-muted-foreground"><span className="text-primary font-semibold">Click to upload</span> or drag and drop</p>
                        </div>
                    ) : isProcessing ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="animate-spin h-8 w-8 text-primary"/>
                            <span className="ml-4 text-muted-foreground">Converting...</span>
                        </div>
                    ) : (
                        <div className="w-full h-96 border rounded-md overflow-hidden bg-white">
                           {convertedPdfUrl ? (
                                <iframe
                                    src={convertedPdfUrl}
                                    className="w-full h-full"
                                    title="PDF Preview"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    <p>An error occurred, or conversion is pending.</p>
                                </div>
                            )}
                        </div>
                    )}
                    <input ref={fileInputRef} type="file" className="hidden" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={onFileChange} />
                </CardContent>
                {wordFile && (
                    <CardFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                        <Button variant="outline" onClick={resetState}>Convert Another</Button>
                        <Button onClick={handleDownload} disabled={isProcessing || !convertedPdfUrl}>
                            <Download className="mr-2" />
                            Download PDF
                        </Button>
                    </CardFooter>
                )}
            </Card>

            {/* Hidden div for rendering HTML for html2canvas */}
            {previewHtml && (
                <div className="fixed top-0 -left-[9999px] -z-10 opacity-0">
                    <div ref={previewRef} dangerouslySetInnerHTML={{ __html: previewHtml }} className="w-[210mm] bg-white p-[20mm]" />
                </div>
            )}
        </>
    );
}
