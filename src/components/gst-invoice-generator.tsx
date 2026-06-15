
"use client";

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
    Plus, 
    Trash2, 
    Download, 
    RefreshCcw, 
    Eye, 
    CheckCircle2, 
    ShieldCheck, 
    Zap, 
    Sparkles, 
    Settings2,
    Building2,
    Receipt,
    Loader2,
    ImageIcon,
    Eraser,
    Globe,
    CreditCard,
    LayoutGrid,
    Printer,
    ArrowLeftRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import html2canvas from 'html2canvas';
import { PDFDocument, PDFName, rgb } from 'pdf-lib';
import confetti from 'canvas-confetti';

// --- TYPES ---

interface InvoiceItem {
    id: string;
    description: string;
    hsn: string;
    qty: number;
    rate: number;
    gstRate: number;
}

interface InvoiceData {
    company: {
        name: string;
        address: string;
        gstin: string;
    };
    customer: {
        name: string;
        address: string;
        gstin: string;
    };
    invoice: {
        no: string;
        date: string;
        isInterState: boolean;
    };
    items: InvoiceItem[];
}

const INITIAL_ITEM = (): InvoiceItem => ({
    id: Math.random().toString(36).substr(2, 9),
    description: "",
    hsn: "",
    qty: 1,
    rate: 0,
    gstRate: 18
});

const INITIAL_DATA: InvoiceData = {
    company: {
        name: "GR7 TECH SOLUTIONS PVT LTD",
        address: "7th Floor, Innovation Tower, Cyber City, Bangalore - 560102",
        gstin: "29ABCDE1234F1Z5"
    },
    customer: {
        name: "RAHUL KUMAR",
        address: "123 Tech Park, HSR Layout, Bangalore, Karnataka",
        gstin: "29AABCC1234F1Z1"
    },
    invoice: {
        no: `INV-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString().split('T')[0],
        isInterState: false
    },
    items: [INITIAL_ITEM()]
};

const StarIcons = () => (
    <>
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`star-${i}`}>
                <svg viewBox="0 0 784.11 815.53" className="fill-white">
                    <path d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
                </svg>
            </div>
        ))}
    </>
);

export default function GstInvoiceGenerator() {
    const { toast } = useToast();
    const [data, setData] = useState<InvoiceData>(INITIAL_DATA);
    const [isExporting, setIsExporting] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);
    
    const exportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const saved = localStorage.getItem('gr7_gst_invoice_v2_persisted');
        if (saved) {
            try { setData(JSON.parse(saved)); } catch (e) { console.error(e); }
        }
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (isHydrated) {
            localStorage.setItem('gr7_gst_invoice_v2_persisted', JSON.stringify(data));
        }
    }, [data, isHydrated]);

    const totals = useMemo(() => {
        return data.items.reduce((acc, item) => {
            const taxable = (item.qty || 0) * (item.rate || 0);
            const gst = (taxable * (item.gstRate || 0)) / 100;
            return {
                taxable: acc.taxable + taxable,
                gst: acc.gst + gst,
                total: acc.total + taxable + gst
            };
        }, { taxable: 0, gst: 0, total: 0 });
    }, [data.items]);

    const formatCurrency = (val: number) => 
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

    const updateNested = (section: keyof InvoiceData, field: string, value: any) => {
        setData(prev => ({
            ...prev, [section]: { ...(prev[section] as object), [field]: value }
        } as any));
    };

    const addItem = () => setData(prev => ({ ...prev, items: [...prev.items, INITIAL_ITEM()] }));
    const removeItem = (id: string) => data.items.length > 1 && setData(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));
    const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
        setData(prev => ({
            ...prev,
            items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
        }));
    };

    const handleClearAll = () => {
        setData({
            company: { ...data.company },
            customer: { name: "", gstin: "", address: "" },
            invoice: { no: `INV-${Date.now().toString().slice(-6)}`, date: new Date().toISOString().split('T')[0], isInterState: false },
            items: [INITIAL_ITEM()]
        });
        localStorage.removeItem('gr7_gst_invoice_v2_persisted');
        toast({ title: "Form Cleared" });
    };

    const handleExport = async (type: 'pdf' | 'image' = 'pdf') => {
        if (!exportRef.current) return;
        setIsExporting(true);
        
        try {
            await document.fonts.ready;
            const canvas = await html2canvas(exportRef.current, {
                scale: 3, 
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
                onclone: (clonedDoc) => {
                    const el = clonedDoc.querySelector('[data-export-container]');
                    if (el) {
                        (el as HTMLElement).style.transform = 'none';
                        const all = el.getElementsByTagName('*');
                        for (let i = 0; i < all.length; i++) {
                            const node = all[i] as HTMLElement;
                            node.style.letterSpacing = 'normal';
                            node.style.wordSpacing = 'normal';
                            node.style.fontVariantLigatures = 'none';
                        }
                    }
                }
            });

            const dataUrl = canvas.toDataURL('image/jpeg', 1.0);

            if (type === 'pdf') {
                const pdfDoc = await PDFDocument.create();
                
                // Standard A4 in points (pt)
                const pdfWidth = 595.28;
                const pdfHeight = 841.89;
                const page = pdfDoc.addPage([pdfWidth, pdfHeight]);

                const imgBuffer = await fetch(dataUrl).then(res => res.arrayBuffer());
                const embeddedImage = await pdfDoc.embedJpg(imgBuffer);

                page.drawImage(embeddedImage, {
                    x: 0,
                    y: 0,
                    width: pdfWidth,
                    height: pdfHeight
                });

                // Force browser to fit window on open
                const catalog = pdfDoc.catalog;
                catalog.set(PDFName.of('ViewerPreferences'), pdfDoc.context.obj({
                    FitWindow: true,
                    CenterWindow: true,
                    DisplayDocTitle: true
                }));
                const dest = pdfDoc.context.obj([page.ref, PDFName.of('Fit')]);
                catalog.set(PDFName.of('OpenAction'), dest);

                const pdfBytes = await pdfDoc.save();
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `GST_Invoice_${data.invoice.no}.pdf`;
                link.click();
            } else {
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = `GST_Invoice_${data.invoice.no}.jpg`;
                link.click();
            }
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            toast({ title: "Export Successful!" });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Export Failed' });
        } finally {
            setIsExporting(false);
        }
    };

    if (!isHydrated) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin size-10 text-primary opacity-20" /></div>;

    return (
        <div className="w-full max-w-[1800px] grid grid-cols-1 lg:grid-cols-12 gap-10 items-start px-4 pb-32 overflow-x-hidden text-left">
            
            {/* HIDDEN EXPORT CANVAS */}
            <div className="fixed top-0 -left-[5000px] z-[-1] pointer-events-none">
                <div ref={exportRef} data-export-container style={{ width: '794px', height: '1123px', background: 'white', position: 'relative', overflow: 'hidden' }}>
                    <InvoiceTemplate data={data} totals={totals} formatCurrency={formatCurrency} isExport />
                </div>
            </div>

            {/* SIDEBAR EDITOR */}
            <div className="lg:col-span-5 space-y-6 no-print max-h-[90vh] overflow-y-auto custom-scrollbar pr-2 text-left">
                <Card className="border-2 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950 border-primary/10">
                    <CardHeader className="bg-primary/5 border-b p-6 md:p-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-left">
                                <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                    <Receipt className="size-7" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl md:text-2xl font-black uppercase leading-none">Invoice Panel</CardTitle>
                                    <CardDescription className="text-[10px] font-bold uppercase opacity-50 tracking-widest mt-1">Industrial Billing Engine</CardDescription>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={handleClearAll} className="h-8 text-[9px] font-black uppercase text-rose-600 hover:bg-rose-50"><Eraser className="size-3 mr-1" /> Clear All</Button>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="p-6 md:p-8 space-y-10">
                        <div className="space-y-6">
                            <Badge className="bg-primary text-white font-black text-[9px] px-3 py-1 uppercase tracking-widest">Business Details</Badge>
                            <div className="grid gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Company Name</Label>
                                    <Input value={data.company.name} onChange={(e) => updateNested('company', 'name', e.target.value)} className="h-10 rounded-xl font-bold border-2" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">GSTIN</Label>
                                    <Input value={data.company.gstin} onChange={(e) => updateNested('company', 'gstin', e.target.value)} className="h-10 rounded-xl font-bold border-2" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Address</Label>
                                    <Textarea value={data.company.address} onChange={(e) => updateNested('company', 'address', e.target.value)} className="rounded-xl border-2 font-medium" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <Badge className="bg-blue-600 text-white font-black text-[9px] px-3 py-1 uppercase tracking-widest">Recipient Details</Badge>
                            <div className="grid gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Customer Name</Label>
                                    <Input value={data.customer.name} onChange={(e) => updateNested('customer', 'name', e.target.value)} className="h-10 rounded-xl font-bold border-2" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Address</Label>
                                    <Textarea value={data.customer.address} onChange={(e) => updateNested('customer', 'address', e.target.value)} className="rounded-xl border-2 font-medium" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                             <div className="flex justify-between items-center">
                                <Badge className="bg-emerald-600 text-white font-black text-[9px] px-3 py-1 uppercase tracking-widest">Line Items</Badge>
                                <Button size="sm" variant="ghost" onClick={addItem} className="h-7 text-[8px] font-black uppercase text-primary"><Plus className="size-3 mr-1" /> Add Item</Button>
                            </div>
                            <div className="space-y-4">
                                {data.items.map((item) => (
                                    <Card key={item.id} className="p-4 border-2 border-primary/10 rounded-2xl bg-muted/5 relative">
                                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 size-7 text-destructive" onClick={() => removeItem(item.id)}><Trash2 className="size-4"/></Button>
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-12 space-y-1"><Label className="text-[8px] font-black uppercase opacity-40">Description</Label><Input value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} className="h-9 font-bold" /></div>
                                            <div className="col-span-4 space-y-1"><Label className="text-[8px] font-black uppercase opacity-40">Qty</Label><Input type="number" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', Number(e.target.value))} className="h-9 font-bold text-center" /></div>
                                            <div className="col-span-4 space-y-1"><Label className="text-[8px] font-black uppercase opacity-40">Rate</Label><Input type="number" value={item.rate} onChange={(e) => updateItem(item.id, 'rate', Number(e.target.value))} className="h-9 font-bold text-center" /></div>
                                            <div className="col-span-4 space-y-1"><Label className="text-[8px] font-black uppercase opacity-40">GST %</Label><Input type="number" value={item.gstRate} onChange={(e) => updateItem(item.id, 'gstRate', Number(e.target.value))} className="h-9 font-bold text-center" /></div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-muted/10 p-8 border-t flex flex-col gap-4">
                        <Button onClick={() => handleExport('pdf')} disabled={isExporting} className="w-full h-16 md:h-20 text-lg md:text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-[1.5rem] group border-4 border-primary">
                            {isExporting ? <Loader2 className="animate-spin mr-3 size-8" /> : <Printer className="mr-3 size-8 group-hover:rotate-12 transition-transform" />}
                            GENERATE INVOICE PDF
                        </Button>
                        <Button onClick={() => handleExport('image')} disabled={isExporting} variant="outline" className="w-full h-12 text-xs font-black rounded-xl border-2 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all">
                            <ImageIcon className="mr-2 size-4" /> SAVE AS IMAGE (JPG)
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* LIVE PREVIEW A4 */}
            <div className="lg:col-span-7 flex flex-col items-center w-full">
                <div className="w-full flex items-center justify-between mb-4 px-4 no-print">
                    <div className="flex items-center gap-2">
                        <Eye className="size-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Studio Live View</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-600 text-white font-black text-[10px] px-3 py-1 rounded-full border-2 border-white shadow-lg animate-pulse uppercase">A4 LAYOUT</Badge>
                </div>

                <div className="w-full flex justify-center bg-slate-300/30 dark:bg-slate-950/50 rounded-[3rem] p-4 md:p-12 shadow-inner border-[6px] border-white/5 transition-all overflow-visible min-h-[1000px]">
                    <div className="relative transform-gpu scale-[0.45] sm:scale-[0.7] lg:scale-[0.85] xl:scale-100 origin-top h-auto shadow-[0_60px_120px_-20px_rgba(0,0,0,0.6)]">
                         <InvoiceTemplate data={data} totals={totals} formatCurrency={formatCurrency} />
                    </div>
                </div>

                <div className="mt-8 flex items-center gap-6 text-muted-foreground/40 text-[10px] font-black uppercase tracking-widest no-print">
                    <div className="flex items-center gap-2"><ShieldCheck className="size-3 text-green-500" /> SECURE RAM</div>
                    <div className="flex items-center gap-2"><Zap className="size-3 text-yellow-500" /> WYSIWYG ENGINE</div>
                    <div className="flex items-center gap-2"><Sparkles className="size-3 text-primary" /> HD OUTPUT</div>
                </div>
            </div>

        </div>
    );
}

// --- PIXEL PERFECT TEMPLATE ---

function InvoiceTemplate({ data, totals, formatCurrency, isExport }: { data: InvoiceData, totals: any, formatCurrency: (v: number) => string, isExport?: boolean }) {
    return (
        <div 
            className={cn("bg-white flex flex-col text-slate-900", !isExport && "shadow-none border-0")}
            style={{ 
                width: '794px', height: '1123px', padding: '50px 50px 70px 50px',
                fontFamily: 'Arial, sans-serif', position: 'relative', boxSizing: 'border-box',
                letterSpacing: 'normal', overflow: 'hidden'
            }}
        >
            <header className="flex justify-between items-start mb-6 pb-6 border-b-4 border-slate-900">
                <div className="space-y-1 max-w-[60%] text-left">
                    <h1 className="text-3xl font-black uppercase leading-tight">{data.company.name || "COMPANY NAME"}</h1>
                    <p className="text-xs font-black text-primary">GSTIN: {data.company.gstin}</p>
                    <p className="text-[11px] font-bold text-slate-500 uppercase leading-relaxed mt-2">{data.company.address}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-4xl font-black uppercase text-slate-200">TAX INVOICE</h2>
                    <div className="mt-4 space-y-1">
                        <p className="text-[11px] font-black uppercase text-slate-400">Invoice No: <span className="text-slate-900">{data.invoice.no}</span></p>
                        <p className="text-[11px] font-black uppercase text-slate-400">Date: <span className="text-slate-900">{data.invoice.date}</span></p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-2 gap-10 mb-8 items-stretch">
                <div className="space-y-3 text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b pb-1">BILL TO (Customer)</p>
                    <div className="space-y-1">
                        <p className="text-sm font-black uppercase">{data.customer.name || "Customer Name"}</p>
                        <p className="text-[11px] font-bold text-slate-500 uppercase leading-relaxed whitespace-pre-line">{data.customer.address || "Address not provided"}</p>
                    </div>
                </div>
                <div className="space-y-3 bg-slate-50 p-6 rounded-2xl border text-left">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b pb-1">SUMMARY</p>
                     <div className="grid grid-cols-2 gap-y-2 pt-2">
                        <span className="text-[11px] font-bold uppercase">Taxable Value</span>
                        <span className="text-[11px] font-black text-right">{formatCurrency(totals.taxable)}</span>
                        <span className="text-[11px] font-bold uppercase">Total GST</span>
                        <span className="text-[11px] font-black text-right">{formatCurrency(totals.gst)}</span>
                        <span className="text-sm font-black uppercase text-primary border-t pt-2 mt-1">Net Amount</span>
                        <span className="text-sm font-black text-primary text-right border-t pt-2 mt-1">{formatCurrency(totals.total)}</span>
                     </div>
                </div>
            </div>

            <div className="flex-1 overflow-visible">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                            <th className="p-3 text-center w-12 border border-slate-900">SN</th>
                            <th className="p-3 text-left border border-slate-900">Description</th>
                            <th className="p-3 text-center w-16 border border-slate-900">Qty</th>
                            <th className="p-3 text-right w-28 border border-slate-900">Rate</th>
                            <th className="p-3 text-center w-16 border border-slate-900">GST%</th>
                            <th className="p-3 text-right w-32 border border-slate-900">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.items.map((item, i) => (
                            <tr key={item.id} className="text-[11px] font-bold text-slate-700 border-b">
                                <td className="p-3 text-center border">{i + 1}</td>
                                <td className="p-3 border uppercase whitespace-normal leading-normal">{item.description || "---"}</td>
                                <td className="p-3 text-center border">{item.qty}</td>
                                <td className="p-3 text-right border">{item.rate.toLocaleString()}</td>
                                <td className="p-3 text-center border">{item.gstRate}%</td>
                                <td className="p-3 text-right border font-black text-slate-900">{(item.qty * item.rate).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 grid grid-cols-12 gap-10 items-end shrink-0">
                <div className="col-span-7 space-y-6 text-left">
                    <div className="p-5 bg-slate-50 border rounded-2xl">
                        <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest border-b pb-1">Tax Breakdown Analysis</p>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-[11px] font-bold">
                                <span className="uppercase">Central GST (CGST)</span>
                                <span className="font-black">{formatCurrency(totals.gst / 2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px] font-bold">
                                <span className="uppercase">State GST (SGST)</span>
                                <span className="font-black">{formatCurrency(totals.gst / 2)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border-l-4 border-slate-900 bg-slate-50">
                         <p className="text-[9px] font-black uppercase text-slate-400">Declaration Notice</p>
                         <p className="text-[10px] font-medium leading-relaxed italic text-slate-600 mt-1">This is a computer-generated tax invoice. All details are true and correct.</p>
                    </div>
                </div>
                <div className="col-span-5 space-y-12">
                     <div className="flex justify-between items-center p-4 bg-slate-900 text-white rounded-2xl shadow-xl">
                         <span className="text-[11px] font-black uppercase tracking-widest">Grand Total</span>
                         <span className="text-2xl font-black">{formatCurrency(totals.total)}</span>
                     </div>
                     <div className="flex flex-col items-center">
                         <div className="w-56 h-14 border-b-2 border-slate-200 mb-2" />
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Authorized Personnel</p>
                     </div>
                </div>
            </div>

            <footer className="mt-auto pt-6 text-center border-t border-slate-100 shrink-0">
                <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-200">PIXEL-PERFECT INVOICING BY WWW.GR7IMAGEPDF.COM</p>
            </footer>
        </div>
    );
}
