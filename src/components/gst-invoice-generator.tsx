"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
    FileText,
    Building2,
    User2,
    Calendar,
    IndianRupee,
    Printer,
    Monitor,
    Baseline,
    Info,
    Smartphone,
    LayoutGrid,
    Receipt,
    ListFilter,
    ChevronRight,
    SearchCode
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';

interface InvoiceItem {
    id: string;
    description: string;
    hsn: string;
    qty: number;
    rate: number;
    gstRate: number;
}

const INITIAL_ITEM = (): InvoiceItem => ({
    id: Math.random().toString(36).substr(2, 9),
    description: "",
    hsn: "",
    qty: 1,
    rate: 0,
    gstRate: 18
});

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
    const [isExporting, setIsExporting] = useState(false);
    
    // Business Info
    const [businessName, setBusinessName] = useState("GR7 TOOLS HUB");
    const [businessGstin, setBusinessGstin] = useState("29ABCDE1234F1Z5");
    const [businessAddress, setBusinessAddress] = useState("123 Tech Park, HSR Layout, Bangalore, Karnataka");
    
    // Customer Info
    const [customerName, setCustomerName] = useState("");
    const [customerGstin, setCustomerGstin] = useState("");
    const [customerAddress, setCustomerAddress] = useState("");
    
    // Invoice Info
    const [invoiceNo, setInvoiceNo] = useState(`INV-${Date.now().toString().slice(-6)}`);
    const [invoiceDate, setInvoiceNoDate] = useState(new Date().toISOString().split('T')[0]);
    const [isInterState, setIsInterState] = useState(false); // True means IGST, False means CGST/SGST

    // Items
    const [items, setItems] = useState<InvoiceItem[]>([INITIAL_ITEM()]);

    const previewRef = useRef<HTMLDivElement>(null);

    const addItem = () => setItems([...items, INITIAL_ITEM()]);
    const removeItem = (id: string) => {
        if (items.length > 1) {
            setItems(items.filter(i => i.id !== id));
        }
    };

    const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    // CALCULATIONS
    const totals = items.reduce((acc, item) => {
        const taxable = item.qty * item.rate;
        const gst = (taxable * item.gstRate) / 100;
        return {
            taxable: acc.taxable + taxable,
            gst: acc.gst + gst,
            total: acc.total + taxable + gst
        };
    }, { taxable: 0, gst: 0, total: 0 });

    const formatCurrency = (val: number) => 
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

    const handleExport = async () => {
        if (!previewRef.current) return;
        setIsExporting(true);
        try {
            const canvas = await html2canvas(previewRef.current, {
                scale: 3,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
            });
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
            pdf.save(`GST_Invoice_${invoiceNo}.pdf`);
            
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            toast({ title: "Invoice Generated!", description: "High-quality PDF has been saved." });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Export Failed' });
        } finally {
            setIsExporting(false);
        }
    };

    const handleReset = () => {
        setCustomerName(""); setCustomerGstin(""); setCustomerAddress("");
        setItems([INITIAL_ITEM()]);
        toast({ title: "Form Cleared" });
    };

    return (
        <div className="w-full max-w-[1800px] grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 items-start px-4 pb-32">
            
            {/* LEFT: INPUTS */}
            <div className="lg:col-span-5 space-y-6 no-print max-h-[90vh] overflow-y-auto custom-scrollbar pr-2">
                <Card className="border-2 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950 border-primary/10">
                    <CardHeader className="bg-primary/5 border-b p-6 md:p-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                    <Receipt className="size-7" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl md:text-2xl font-black uppercase tracking-tighter">Invoice Panel</CardTitle>
                                    <CardDescription className="text-[10px] font-bold uppercase opacity-50 tracking-widest">GST Compliant Billing</CardDescription>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 text-[9px] font-black uppercase text-muted-foreground"><RefreshCcw className="size-3 mr-1" /> Clear</Button>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="p-6 md:p-8 space-y-10">
                        
                        {/* 1. SELLER INFO */}
                        <div className="space-y-6">
                            <Badge className="bg-primary text-white font-black text-[9px] px-3 py-1 uppercase tracking-widest">Business Details (Seller)</Badge>
                            <div className="grid gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Company Name</Label>
                                    <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="h-10 rounded-xl font-bold border-2" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">GSTIN</Label>
                                    <Input value={businessGstin} onChange={(e) => setBusinessGstin(e.target.value)} className="h-10 rounded-xl font-bold border-2" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Address</Label>
                                    <Textarea value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} className="rounded-xl border-2 font-medium" />
                                </div>
                            </div>
                        </div>

                        {/* 2. CUSTOMER INFO */}
                        <div className="space-y-6">
                            <Badge className="bg-blue-600 text-white font-black text-[9px] px-3 py-1 uppercase tracking-widest">Billing To (Customer)</Badge>
                            <div className="grid gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Customer Name</Label>
                                    <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="h-10 rounded-xl font-bold border-2" placeholder="Recipient Name" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Customer GSTIN (Optional)</Label>
                                    <Input value={customerGstin} onChange={(e) => setCustomerGstin(e.target.value)} className="h-10 rounded-xl font-bold border-2" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Customer Address</Label>
                                    <Textarea value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} className="rounded-xl border-2 font-medium" />
                                </div>
                            </div>
                        </div>

                        {/* 3. INVOICE INFO */}
                        <div className="space-y-6">
                            <Badge className="bg-indigo-600 text-white font-black text-[9px] px-3 py-1 uppercase tracking-widest">Invoice Settings</Badge>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Invoice No.</Label>
                                    <Input value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} className="h-10 rounded-xl font-bold border-2" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Date</Label>
                                    <Input type="date" value={invoiceDate} onChange={(e) => setInvoiceNoDate(e.target.value)} className="h-10 rounded-xl font-bold border-2" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border-2 border-dashed border-primary/10">
                                <div className="flex items-center gap-3">
                                    <LayoutGrid className="size-5 text-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Tax Type (IGST)</span>
                                </div>
                                <Select value={isInterState ? "igst" : "cgst"} onValueChange={(v) => setIsInterState(v === "igst")}>
                                    <SelectTrigger className="w-40 h-10 border-2 font-black text-[10px] uppercase"><SelectValue /></SelectTrigger>
                                    <SelectContent className="rounded-xl border-2 shadow-2xl">
                                        <SelectItem value="cgst" className="font-bold text-[10px] uppercase">CGST + SGST (Local)</SelectItem>
                                        <SelectItem value="igst" className="font-bold text-[10px] uppercase">IGST (Interstate)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* 4. ITEMS LIST */}
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <Badge className="bg-emerald-600 text-white font-black text-[9px] px-3 py-1 uppercase tracking-widest">Line Items</Badge>
                                <Button size="sm" onClick={addItem} className="h-8 text-[9px] font-black bg-primary rounded-lg uppercase"><Plus className="size-3 mr-1" /> Add Product</Button>
                            </div>
                            <div className="space-y-4">
                                {items.map((item, idx) => (
                                    <Card key={item.id} className="p-4 border-2 border-primary/10 rounded-2xl bg-muted/5 relative animate-in slide-in-from-bottom-2">
                                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 size-7 text-destructive hover:bg-destructive/10" onClick={() => removeItem(item.id)}><Trash2 className="size-4"/></Button>
                                        <div className="grid grid-cols-12 gap-4">
                                            <div className="col-span-12 space-y-1">
                                                <Label className="text-[8px] font-black uppercase opacity-40">Description</Label>
                                                <Input value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} placeholder="Product/Service Name" className="h-9 font-bold" />
                                            </div>
                                            <div className="col-span-6 space-y-1">
                                                <Label className="text-[8px] font-black uppercase opacity-40">HSN/SAC</Label>
                                                <Input value={item.hsn} onChange={(e) => updateItem(item.id, 'hsn', e.target.value)} placeholder="9983" className="h-9 font-bold" />
                                            </div>
                                            <div className="col-span-3 space-y-1">
                                                <Label className="text-[8px] font-black uppercase opacity-40">Qty</Label>
                                                <Input type="number" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', Number(e.target.value))} className="h-9 font-bold" />
                                            </div>
                                            <div className="col-span-3 space-y-1">
                                                <Label className="text-[8px] font-black uppercase opacity-40">Rate</Label>
                                                <Input type="number" value={item.rate} onChange={(e) => updateItem(item.id, 'rate', Number(e.target.value))} className="h-9 font-bold" />
                                            </div>
                                            <div className="col-span-6 space-y-1">
                                                <Label className="text-[8px] font-black uppercase opacity-40">GST Slab (%)</Label>
                                                <Select value={String(item.gstRate)} onValueChange={(v) => updateItem(item.id, 'gstRate', Number(v))}>
                                                    <SelectTrigger className="h-9 border-2 font-bold text-[10px]"><SelectValue /></SelectTrigger>
                                                    <SelectContent className="rounded-lg border-2">
                                                        {[0, 5, 12, 18, 28].map(s => <SelectItem key={s} value={String(s)} className="font-bold text-[10px]">{s}% GST</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="col-span-6 flex items-end">
                                                <div className="w-full bg-primary/5 p-2 rounded-lg text-center border border-dashed border-primary/20">
                                                    <span className="text-[10px] font-black text-primary uppercase">Amt: {formatCurrency(item.qty * item.rate)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>

                    </CardContent>
                    <CardFooter className="bg-muted/10 p-8 border-t flex flex-col gap-4">
                        <Button onClick={handleExport} disabled={isExporting} className="w-full h-16 md:h-20 text-lg md:text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-[1.5rem] transition-all active:scale-95 group border-4 border-primary hover:bg-transparent hover:text-primary">
                            {isExporting ? <Loader2 className="animate-spin mr-3 size-8" /> : <Printer className="mr-3 size-8 group-hover:rotate-12 transition-transform" />}
                            GENERATE INVOICE PDF
                        </Button>
                        <p className="text-[10px] text-center text-muted-foreground font-bold uppercase tracking-widest opacity-60">Strict GST-Rule Compliance Enforced</p>
                    </CardFooter>
                </Card>
            </div>

            {/* RIGHT: A4 PREVIEW */}
            <div className="lg:col-span-7 flex flex-col items-center w-full">
                
                <div className="w-full flex items-center justify-between mb-4 px-4 no-print">
                    <div className="flex items-center gap-2">
                        <Eye className="size-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Live Invoice View</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-600 text-white font-black text-[10px] px-3 py-1 rounded-full border-2 border-white shadow-lg animate-pulse">A4 LAYOUT</Badge>
                </div>

                <div className="w-full flex justify-center bg-slate-300/30 dark:bg-slate-950/50 rounded-[3rem] p-4 md:p-12 shadow-inner border-[6px] border-white/5 transition-all">
                    <div className="relative transform-gpu scale-[0.5] sm:scale-[0.8] lg:scale-[0.9] xl:scale-100 origin-top h-auto shadow-[0_60px_120px_-20px_rgba(0,0,0,0.6)]">
                         
                         {/* THE ACTUAL INVOICE CONTAINER */}
                         <div 
                            ref={previewRef}
                            className="bg-white p-[15mm] flex flex-col text-slate-900 shadow-none border-0"
                            style={{ width: '210mm', minHeight: '297mm', fontFamily: 'Inter, sans-serif' }}
                         >
                            {/* Header */}
                            <header className="flex justify-between items-start mb-10 pb-6 border-b-2 border-slate-900">
                                <div className="space-y-1 max-w-[60%]">
                                    <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">{businessName}</h1>
                                    <p className="text-xs font-black text-primary">GSTIN: {businessGstin}</p>
                                    <p className="text-[11px] font-bold text-slate-500 uppercase leading-relaxed mt-2">{businessAddress}</p>
                                </div>
                                <div className="text-right space-y-1">
                                    <h2 className="text-4xl font-black uppercase tracking-tight text-slate-200">TAX INVOICE</h2>
                                    <div className="pt-4 space-y-0.5">
                                        <p className="text-[10px] font-black uppercase text-slate-400">Invoice No: <span className="text-slate-900">{invoiceNo}</span></p>
                                        <p className="text-[10px] font-black uppercase text-slate-400">Date: <span className="text-slate-900">{invoiceDate}</span></p>
                                    </div>
                                </div>
                            </header>

                            {/* Billing Section */}
                            <div className="grid grid-cols-2 gap-10 mb-10">
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b pb-1">BILL TO (Customer)</p>
                                    <div className="space-y-1">
                                        <p className="text-sm font-black uppercase">{customerName || "Customer Name"}</p>
                                        {customerGstin && <p className="text-[10px] font-black text-blue-600">GSTIN: {customerGstin}</p>}
                                        <p className="text-[11px] font-bold text-slate-500 uppercase leading-relaxed whitespace-pre-line">{customerAddress || "No Address Provided"}</p>
                                    </div>
                                </div>
                                <div className="space-y-3 bg-slate-50 p-6 rounded-2xl border">
                                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b pb-1">SUMMARY</p>
                                     <div className="grid grid-cols-2 gap-y-2 pt-2">
                                        <span className="text-[10px] font-bold uppercase">Taxable Value</span>
                                        <span className="text-[10px] font-black text-right">{formatCurrency(totals.taxable)}</span>
                                        <span className="text-[10px] font-bold uppercase">Total GST</span>
                                        <span className="text-[10px] font-black text-right">{formatCurrency(totals.gst)}</span>
                                        <span className="text-sm font-black uppercase text-primary border-t pt-2 mt-1">Net Amount</span>
                                        <span className="text-sm font-black text-primary text-right border-t pt-2 mt-1">{formatCurrency(totals.total)}</span>
                                     </div>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="flex-1">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                                            <th className="p-3 text-left w-12 border border-slate-900">SN</th>
                                            <th className="p-3 text-left border border-slate-900">Description</th>
                                            <th className="p-3 text-center w-24 border border-slate-900">HSN</th>
                                            <th className="p-3 text-center w-16 border border-slate-900">Qty</th>
                                            <th className="p-3 text-right w-24 border border-slate-900">Rate</th>
                                            <th className="p-3 text-center w-16 border border-slate-900">GST%</th>
                                            <th className="p-3 text-right w-32 border border-slate-900">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item, i) => (
                                            <tr key={item.id} className="text-[11px] font-bold text-slate-700 border-b">
                                                <td className="p-3 text-center border">{i + 1}</td>
                                                <td className="p-3 border uppercase">{item.description || "Product Item"}</td>
                                                <td className="p-3 text-center border uppercase">{item.hsn || "---"}</td>
                                                <td className="p-3 text-center border">{item.qty}</td>
                                                <td className="p-3 text-right border">{item.rate.toLocaleString()}</td>
                                                <td className="p-3 text-center border">{item.gstRate}%</td>
                                                <td className="p-3 text-right border font-black text-slate-900">{(item.qty * item.rate).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Footer Breakdown */}
                            <div className="mt-10 grid grid-cols-12 gap-8 items-start">
                                <div className="col-span-7 space-y-6">
                                    <div className="p-6 bg-slate-50 border rounded-2xl">
                                        <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest border-b pb-1">Tax Analysis</p>
                                        <div className="space-y-2">
                                            {isInterState ? (
                                                <div className="flex justify-between items-center text-[11px] font-bold">
                                                    <span className="uppercase">Integrated GST (IGST)</span>
                                                    <span className="font-black">{formatCurrency(totals.gst)}</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex justify-between items-center text-[11px] font-bold">
                                                        <span className="uppercase">Central GST (CGST)</span>
                                                        <span className="font-black">{formatCurrency(totals.gst / 2)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-[11px] font-bold">
                                                        <span className="uppercase">State GST (SGST)</span>
                                                        <span className="font-black">{formatCurrency(totals.gst / 2)}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-4 border-l-4 border-slate-900 bg-slate-50">
                                         <p className="text-[9px] font-black uppercase text-slate-400">Declarations</p>
                                         <p className="text-[10px] font-bold leading-relaxed mt-1">We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.</p>
                                    </div>
                                </div>
                                <div className="col-span-5 space-y-4">
                                     <div className="flex justify-between items-center p-3 bg-slate-900 text-white rounded-xl">
                                         <span className="text-[10px] font-black uppercase tracking-widest">Grand Total</span>
                                         <span className="text-xl font-black">{formatCurrency(totals.total)}</span>
                                     </div>
                                     <div className="pt-10 flex flex-col items-center">
                                         <div className="w-32 h-12 border-b-2 border-slate-200 mb-2" />
                                         <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Authorized Signatory</p>
                                         <p className="text-[8px] font-bold opacity-30 mt-4 uppercase">Digitally Generated Invoice</p>
                                     </div>
                                </div>
                            </div>

                         </div>

                    </div>
                </div>

                <div className="mt-8 flex items-center gap-6 text-muted-foreground/40 text-[10px] font-black uppercase tracking-widest no-print">
                    <div className="flex items-center gap-2"><ShieldCheck className="size-3 text-green-500" /> SECURE RAM</div>
                    <div className="flex items-center gap-2"><Zap className="size-3 text-yellow-500" /> INSTANT BUNDLING</div>
                    <div className="flex items-center gap-2"><Sparkles className="size-3 text-primary" /> HD RENDER</div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
            `}</style>
        </div>
    );
}