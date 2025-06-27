
"use client";

import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Download, Loader2, FileCode } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const initialHtml = `<!DOCTYPE html>
<html>
<head>
    <title>Sample HTML</title>
    <style>
        body { font-family: sans-serif; padding: 20px; }
        h1 { color: #333; }
        p { line-height: 1.6; }
        .highlight { background-color: yellow; }
    </style>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>This is a sample HTML document that will be converted to a PDF.</p>
    <p>You can include <strong>bold text</strong>, <em>italic text</em>, and even <span class="highlight">highlighted text</span>.</p>
    <ul>
        <li>First item</li>
        <li>Second item</li>
        <li>Third item</li>
    </ul>
</body>
</html>`;

export default function HtmlToPdfConverter() {
    const { toast } = useToast();
    const [htmlContent, setHtmlContent] = useState<string>(initialHtml);
    const [isConverting, setIsConverting] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const previewRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Cleanup blob URL
        return () => {
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [pdfUrl]);

    const handleConvert = async () => {
        if (!htmlContent.trim()) {
            toast({ variant: 'destructive', title: 'Empty HTML', description: 'Please provide some HTML content to convert.' });
            return;
        }

        if (!previewRef.current) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not access the preview element.' });
            return;
        }

        setIsConverting(true);
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
        toast({ title: 'Converting HTML...', description: 'Please wait while the PDF is being generated.' });

        // A short timeout to allow the DOM to update with the new HTML content
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            const canvas = await html2canvas(previewRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                width: previewRef.current.scrollWidth,
                height: previewRef.current.scrollHeight,
            });
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF({
                orientation: canvas.width > canvas.height ? 'l' : 'p',
                unit: 'px',
                format: [canvas.width, canvas.height],
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            
            const pdfBlob = pdf.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            setPdfUrl(url);

            toast({ title: 'Success!', description: 'Your PDF is ready. Check the preview below.' });
        } catch (error) {
            console.error("PDF generation error:", error);
            toast({ variant: 'destructive', title: 'Conversion Error', description: 'Failed to generate PDF. The HTML might contain unsupported elements.' });
        } finally {
            setIsConverting(false);
        }
    };
    
    const handleDownload = () => {
        if (!pdfUrl) return;
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = 'document.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    return (
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8">
            {/* Hidden div for rendering HTML for html2canvas */}
            <div className="fixed top-0 -left-[9999px] -z-10 opacity-0 bg-white p-4">
                <div ref={previewRef} dangerouslySetInnerHTML={{ __html: htmlContent }} className="w-auto inline-block" />
            </div>

            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileCode /> HTML Editor</CardTitle>
                    <CardDescription>Enter or paste your HTML code below.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                    <Textarea
                        value={htmlContent}
                        onChange={(e) => setHtmlContent(e.target.value)}
                        placeholder="<html>...</html>"
                        className="w-full flex-1 font-mono text-xs resize-none"
                    />
                </CardContent>
                <CardFooter>
                    <Button onClick={handleConvert} disabled={isConverting} className="w-full">
                        {isConverting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        {isConverting ? 'Converting...' : 'Convert to PDF'}
                    </Button>
                </CardFooter>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>PDF Preview</CardTitle>
                    <CardDescription>Your generated PDF will appear here.</CardDescription>
                </CardHeader>
                <CardContent className="aspect-[1/1.414] bg-muted rounded-md overflow-hidden">
                   {isConverting && !pdfUrl && (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                   )}
                   {pdfUrl ? (
                        <iframe
                            src={pdfUrl}
                            className="w-full h-full"
                            title="PDF Preview"
                        />
                    ) : (
                        !isConverting && <div className="flex items-center justify-center h-full text-muted-foreground"><p>Preview will be shown here</p></div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button onClick={handleDownload} disabled={!pdfUrl || isConverting} className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
