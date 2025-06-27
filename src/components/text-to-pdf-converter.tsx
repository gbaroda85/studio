"use client";

import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Download, Loader2, FileText, Settings } from 'lucide-react';
import jsPDF from 'jspdf';

type Font = 'helvetica' | 'times' | 'courier';

export default function TextToPdfConverter() {
    const { toast } = useToast();
    const [text, setText] = useState("Hello, World!\n\nThis is some sample text that will be converted into a PDF document. You can type your own text here.");
    const [fontSize, setFontSize] = useState(12);
    const [font, setFont] = useState<Font>('helvetica');
    const [margin, setMargin] = useState(20);
    const [isConverting, setIsConverting] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    useEffect(() => {
        return () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); };
    }, [pdfUrl]);
    
    useEffect(() => {
        if(pdfUrl) URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [text, fontSize, font, margin]);

    const handleGeneratePdf = async () => {
        if (!text.trim()) {
            toast({ variant: 'destructive', title: 'Empty Text', description: 'Please provide some text to convert.' });
            return;
        }
        setIsConverting(true);
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
        toast({ title: 'Generating PDF...', description: 'Please wait while your document is being created.' });
        
        await new Promise(resolve => setTimeout(resolve, 100)); // allow UI to update

        try {
            const doc = new jsPDF({
                orientation: "p",
                unit: "mm",
                format: "a4"
            });
            
            doc.setFont(font, 'normal');
            doc.setFontSize(fontSize);
            
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const marginSize = margin;
            const maxLineWidth = pageWidth - marginSize * 2;
            
            const lines = doc.splitTextToSize(text, maxLineWidth);
            
            let cursorY = marginSize;
            
            lines.forEach((line: string, index: number) => {
                if (cursorY + (fontSize * 0.35) > pageHeight - marginSize) {
                    doc.addPage();
                    cursorY = marginSize;
                }
                doc.text(line, marginSize, cursorY);
                cursorY += (fontSize * 0.5); // Adjust line height factor as needed
            });
            
            const pdfBlob = doc.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            setPdfUrl(url);

            toast({ title: 'Success!', description: 'Your PDF is ready. Check the preview.' });
        } catch (error) {
            console.error("PDF generation error:", error);
            toast({ variant: 'destructive', title: 'Conversion Error', description: 'Failed to generate PDF.' });
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
            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Settings /> PDF Options</CardTitle>
                    <CardDescription>Enter your text and customize the PDF settings.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4">
                    <Textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Type or paste your text here..."
                        className="w-full flex-1 text-base resize-none min-h-[300px]"
                        disabled={isConverting}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                         <div className="space-y-2">
                             <Label htmlFor="font">Font</Label>
                             <Select value={font} onValueChange={(v) => setFont(v as Font)} disabled={isConverting}>
                                <SelectTrigger id="font"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="helvetica">Helvetica</SelectItem>
                                    <SelectItem value="times">Times New Roman</SelectItem>
                                    <SelectItem value="courier">Courier</SelectItem>
                                </SelectContent>
                            </Select>
                         </div>
                         <div className="space-y-2">
                             <Label htmlFor="font-size">Font Size (pt)</Label>
                             <Input id="font-size" type="number" value={fontSize} onChange={(e) => setFontSize(Math.max(6, Number(e.target.value)))} disabled={isConverting} />
                         </div>
                          <div className="space-y-2">
                             <Label htmlFor="margin">Margin (mm)</Label>
                             <Input id="margin" type="number" value={margin} onChange={(e) => setMargin(Math.max(5, Number(e.target.value)))} disabled={isConverting} />
                         </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleGeneratePdf} disabled={isConverting} className="w-full">
                        {isConverting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                        {isConverting ? 'Creating PDF...' : 'Create PDF'}
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
                        !isConverting && <div className="flex items-center justify-center h-full text-muted-foreground"><p>PDF Preview will be shown here</p></div>
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
