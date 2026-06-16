
"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
    CreditCard, 
    Download, 
    RefreshCcw, 
    Eye, 
    CheckCircle2, 
    ShieldCheck, 
    Zap, 
    Sparkles, 
    Settings2,
    Building2,
    Loader2,
    ImageIcon,
    UserCircle,
    Globe,
    Printer,
    ArrowLeftRight,
    Plus,
    Trash2,
    LayoutGrid,
    Smartphone,
    FileSpreadsheet,
    Scan,
    Palette,
    Layers,
    Type,
    Phone,
    Mail,
    MapPin,
    RotateCw,
    X,
    Grid3X3,
    Maximize,
    ChevronRight,
    PenTool,
    UploadCloud,
    FileDigit,
    Heart,
    Shield
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import * as XLSX from 'xlsx';
import JsBarcode from 'jsbarcode';
import QRCodeStyling from 'qr-code-styling';
import { toPng, toJpeg, toSvg } from 'html-to-image';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

// --- TYPES ---

type Orientation = 'vertical' | 'horizontal';
type ThemeMode = 'modern' | 'classic' | 'minimal' | 'corporate' | 'hospital' | 'security';

interface IdCardData {
    organization: {
        name: string;
        address: string;
        logo: string | null;
        seal: string | null;
    };
    personal: {
        name: string;
        id: string;
        designation: string;
        department: string;
        bloodGroup: string;
        dob: string;
        mobile: string;
        emergency: string;
        address: string;
        photo: string | null;
        signature: string | null;
    };
    config: {
        orientation: Orientation;
        theme: ThemeMode;
        primaryColor: string;
        accentColor: string;
        textColor: string;
        showQr: boolean;
        showBarcode: boolean;
        borderRadius: number;
    };
}

const INITIAL_DATA: IdCardData = {
    organization: {
        name: "GR7 TECH SOLUTIONS",
        address: "CYBER CITY, BANGALORE - 560102",
        logo: null,
        seal: null
    },
    personal: {
        name: "RAHUL KUMAR",
        id: "GR7-2025-01",
        designation: "SENIOR DEVELOPER",
        department: "ENGINEERING",
        bloodGroup: "O+",
        dob: "15-AUG-1995",
        mobile: "+91 9876543210",
        emergency: "+91 9999999999",
        address: "HSR LAYOUT, BANGALORE",
        photo: "https://picsum.photos/seed/p1/400/500",
        signature: null
    },
    config: {
        orientation: 'vertical',
        theme: 'modern',
        primaryColor: '#043873',
        accentColor: '#4F9CF9',
        textColor: '#FFFFFF',
        showQr: true,
        showBarcode: true,
        borderRadius: 20
    }
};

const THEMES: { id: ThemeMode, name: string }[] = [
    { id: 'modern', name: 'Modern Pro' },
    { id: 'corporate', name: 'Corporate High' },
    { id: 'minimal', name: 'Minimal Soft' },
    { id: 'classic', name: 'Classic School' },
    { id: 'hospital', name: 'Health Professional' },
    { id: 'security', name: 'Security Grade' },
];

const COLORS = [
    { name: "Navy Blue", value: "#043873" },
    { name: "Royal Blue", value: "#1e40af" },
    { name: "Deep Rose", value: "#be123c" },
    { name: "Forest Green", value: "#15803d" },
    { name: "Slate Grey", value: "#334155" },
    { name: "Pure Black", value: "#000000" },
    { name: "Purple", value: "#6d28d9" },
    { name: "Orange", value: "#ea580c" },
];

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

export default function IdCardGenerator() {
    const { toast } = useToast();
    const [data, setData] = useState<IdCardData>(INITIAL_DATA);
    const [bulkData, setBulkData] = useState<any[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);
    const [activeStage, setActiveSection] = useState<'info' | 'style' | 'bulk'>('info');

    const cardRef = useRef<HTMLDivElement>(null);
    const barcodeRef = useRef<SVGSVGElement>(null);
    const qrRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const signInputRef = useRef<HTMLInputElement>(null);
    const sealInputRef = useRef<HTMLInputElement>(null);

    // --- HYDRATION ---
    useEffect(() => {
        const saved = localStorage.getItem('gr7_id_card_v1_persisted');
        if (saved) {
            try { setData(JSON.parse(saved)); } catch (e) { console.error(e); }
        }
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (isHydrated) {
            localStorage.setItem('gr7_id_card_v1_persisted', JSON.stringify(data));
        }
    }, [data, isHydrated]);

    // --- BARCODE & QR UPDATE ---
    useEffect(() => {
        if (data.config.showBarcode && barcodeRef.current) {
            try {
                JsBarcode(barcodeRef.current, data.personal.id || "0000", {
                    format: "CODE128",
                    width: 1.5,
                    height: 35,
                    displayValue: false,
                    margin: 0,
                    lineColor: "#000000"
                });
            } catch (e) {}
        }
    }, [data.personal.id, data.config.showBarcode, data.config.orientation]);

    useEffect(() => {
        if (data.config.showQr && qrRef.current) {
            qrRef.current.innerHTML = "";
            const qrCode = new QRCodeStyling({
                width: 120,
                height: 120,
                data: `ID: ${data.personal.id}\nName: ${data.personal.name}\nOrg: ${data.organization.name}`,
                dotsOptions: { color: data.config.primaryColor, type: "rounded" },
                cornersSquareOptions: { type: "extra-rounded", color: data.config.primaryColor },
                backgroundOptions: { color: "transparent" }
            });
            qrCode.append(qrRef.current);
        }
    }, [data.personal.id, data.personal.name, data.organization.name, data.config.showQr, data.config.primaryColor]);

    const handleFileUpload = (section: 'organization' | 'personal', field: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setData(prev => ({
                    ...prev,
                    [section]: { ...prev[section], [field]: ev.target?.result as string }
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFileChange = (file: File | null) => {
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setData(prev => ({
                    ...prev,
                    personal: { ...prev.personal, photo: ev.target?.result as string }
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const updateNested = (section: keyof IdCardData, field: string, value: any) => {
        setData(prev => ({
            ...prev, [section]: { ...(prev[section] as object), [field]: value }
        } as any));
    };

    const handleBulkImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const data = new Uint8Array(ev.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(sheet);
            setBulkData(json);
            toast({ title: "Import Successful", description: `${json.length} records detected.` });
        };
        reader.readAsArrayBuffer(file);
    };

    const exportSingleCard = async (type: 'png' | 'pdf' = 'png') => {
        if (!cardRef.current) return;
        setIsProcessing(true);
        try {
            if (type === 'png') {
                const dataUrl = await toPng(cardRef.current, { pixelRatio: 3, skipFonts: false });
                const link = document.createElement('a');
                link.download = `ID_Card_${data.personal.name || 'Doc'}.png`;
                link.href = dataUrl;
                link.click();
            } else {
                const dataUrl = await toJpeg(cardRef.current, { pixelRatio: 2 });
                const pdf = new jsPDF({ 
                    orientation: data.config.orientation === 'vertical' ? 'p' : 'l',
                    unit: 'mm',
                    format: [85.6, 53.98]
                });
                pdf.addImage(dataUrl, 'JPEG', 0, 0, 53.98, 85.6);
                pdf.save(`ID_Card_${data.personal.name}.pdf`);
            }
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            toast({ title: "Card Exported!" });
        } catch (e) {
            toast({ variant: 'destructive', title: "Export Failed" });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReset = () => {
        setData(INITIAL_DATA);
        setBulkData([]);
        localStorage.removeItem('gr7_id_card_v1_persisted');
        toast({ title: "Reset Complete" });
    };

    if (!isHydrated) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin size-10 text-primary opacity-20" /></div>;

    return (
        <div className="w-full max-w-[1800px] grid grid-cols-1 lg:grid-cols-12 gap-10 items-start px-4 pb-32 overflow-x-hidden text-left">
            
            {/* LEFT: EDITOR PANEL */}
            <div className="lg:col-span-5 space-y-6 no-print max-h-[90vh] overflow-y-auto custom-scrollbar pr-2 text-left">
                <Card className="border-2 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950 border-primary/10">
                    <CardHeader className="bg-primary/5 border-b p-6 md:p-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-left">
                                <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                    <Settings2 className="size-7" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl md:text-2xl font-black uppercase leading-none">Studio Control</CardTitle>
                                    <CardDescription className="text-[10px] font-bold uppercase opacity-50 tracking-widest mt-1">Industrial Card Engine</CardDescription>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 text-[9px] font-black uppercase text-rose-600 hover:bg-rose-50"><RefreshCcw className="size-3 mr-1" /> Reset</Button>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="p-0">
                        <Tabs value={activeStage} onValueChange={(v) => setActiveSection(v as any)} className="w-full">
                            <TabsList className="grid w-full grid-cols-3 h-14 bg-muted/30 p-1.5 border-b">
                                <TabsTrigger value="info" className="font-black text-[10px] uppercase tracking-widest rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg"><Type className="size-3.5 mr-1.5"/> Info</TabsTrigger>
                                <TabsTrigger value="style" className="font-black text-[10px] uppercase tracking-widest rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg"><Palette className="size-3.5 mr-1.5"/> Styles</TabsTrigger>
                                <TabsTrigger value="bulk" className="font-black text-[10px] uppercase tracking-widest rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg"><FileSpreadsheet className="size-3.5 mr-1.5"/> Bulk</TabsTrigger>
                            </TabsList>

                            <ScrollArea className="h-[600px] p-6 md:p-8">
                                <TabsContent value="info" className="space-y-10 m-0 animate-in slide-in-from-left duration-300">
                                    {/* Organization Section */}
                                    <div className="space-y-6">
                                        <Badge className="bg-primary text-white font-black text-[9px] px-3 py-1 uppercase tracking-widest">Organization Details</Badge>
                                        <div className="grid gap-4">
                                            <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Company / School Name</Label><Input value={data.organization.name} onChange={(e) => updateNested('organization', 'name', e.target.value.toUpperCase())} className="h-10 rounded-xl font-black border-2" /></div>
                                            <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Address</Label><Input value={data.organization.address} onChange={(e) => updateNested('organization', 'address', e.target.value.toUpperCase())} className="h-10 rounded-xl font-bold border-2" /></div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <Button variant="outline" size="sm" className="h-10 rounded-xl border-2 border-dashed font-black text-[10px] uppercase" onClick={() => logoInputRef.current?.click()}><UploadCloud className="size-4 mr-2" /> {data.organization.logo ? "CHANGE LOGO" : "ORG LOGO"}</Button>
                                                <Button variant="outline" size="sm" className="h-10 rounded-xl border-2 border-dashed font-black text-[10px] uppercase" onClick={() => sealInputRef.current?.click()}><Sparkles className="size-4 mr-2" /> ORG SEAL</Button>
                                            </div>
                                            <input ref={logoInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload('organization', 'logo', e)} />
                                            <input ref={sealInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload('organization', 'seal', e)} />
                                        </div>
                                    </div>

                                    {/* Personal Info Section */}
                                    <div className="space-y-6 pt-6 border-t border-dashed">
                                        <Badge className="bg-blue-600 text-white font-black text-[9px] px-3 py-1 uppercase tracking-widest">Candidate Identity</Badge>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2 space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Full Name</Label><Input value={data.personal.name} onChange={(e) => updateNested('personal', 'name', e.target.value.toUpperCase())} className="h-11 rounded-xl font-black border-2 text-primary" /></div>
                                            <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Employee / Student ID</Label><Input value={data.personal.id} onChange={(e) => updateNested('personal', 'id', e.target.value.toUpperCase())} className="h-10 rounded-xl font-bold border-2" /></div>
                                            <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Designation</Label><Input value={data.personal.designation} onChange={(e) => updateNested('personal', 'designation', e.target.value.toUpperCase())} className="h-10 rounded-xl font-bold border-2" /></div>
                                            <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Department</Label><Input value={data.personal.department} onChange={(e) => updateNested('personal', 'department', e.target.value.toUpperCase())} className="h-10 rounded-xl font-bold border-2" /></div>
                                            <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Blood Group</Label><Input value={data.personal.bloodGroup} onChange={(e) => updateNested('personal', 'bloodGroup', e.target.value.toUpperCase())} className="h-10 rounded-xl font-bold border-2" /></div>
                                            <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Date of Birth</Label><Input value={data.personal.dob} onChange={(e) => updateNested('personal', 'dob', e.target.value.toUpperCase())} className="h-10 rounded-xl font-bold border-2" /></div>
                                            <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Mobile No.</Label><Input value={data.personal.mobile} onChange={(e) => updateNested('personal', 'mobile', e.target.value.toUpperCase())} className="h-10 rounded-xl font-bold border-2" /></div>
                                            
                                            <div className="col-span-2 pt-2"><Separator className="opacity-10"/></div>
                                            
                                            <Button variant="outline" className="h-11 rounded-xl border-2 border-dashed font-black text-[9px] uppercase" onClick={() => fileInputRef.current?.click()}><ImageIcon className="size-4 mr-2" /> PHOTO</Button>
                                            <Button variant="outline" className="h-11 rounded-xl border-2 border-dashed font-black text-[9px] uppercase" onClick={() => signInputRef.current?.click()}><PenTool className="size-4 mr-2" /> SIGNATURE</Button>
                                            
                                            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
                                            <input ref={signInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload('personal', 'signature', e)} />
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="style" className="space-y-10 m-0 animate-in slide-in-from-right duration-300">
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                                <Layers className="size-3" /> Visual Theme
                                            </Label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {THEMES.map(t => (
                                                    <button 
                                                        key={t.id}
                                                        onClick={() => updateNested('config', 'theme', t.id)}
                                                        className={cn(
                                                            "p-4 rounded-2xl border-2 text-left transition-all",
                                                            data.config.theme === t.id ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-muted hover:border-primary/40"
                                                        )}
                                                    >
                                                        <p className="font-black text-[10px] uppercase tracking-wider">{t.name}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-dashed">
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase opacity-60">Orientation</Label>
                                                <Select value={data.config.orientation} onValueChange={(v) => updateNested('config', 'orientation', v)}>
                                                    <SelectTrigger className="h-10 font-bold border-2 rounded-xl"><SelectValue /></SelectTrigger>
                                                    <SelectContent className="rounded-xl border-2">
                                                        <SelectItem value="vertical" className="font-bold uppercase text-[10px]">Vertical (Standard)</SelectItem>
                                                        <SelectItem value="horizontal" className="font-bold uppercase text-[10px]">Horizontal</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase opacity-60">Theme Color</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {COLORS.map(c => (
                                                        <button 
                                                            key={c.value} 
                                                            onClick={() => updateNested('config', 'primaryColor', c.value)}
                                                            className={cn(
                                                                "size-7 rounded-lg border-2 transition-all",
                                                                data.config.primaryColor === c.value ? "ring-2 ring-primary scale-110" : "border-white/10"
                                                            )}
                                                            style={{ backgroundColor: c.value }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6 pt-6 border-t border-dashed">
                                             <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-dashed">
                                                <div className="flex items-center gap-3"><Scan className="size-4 text-primary" /><Label className="text-[10px] font-black uppercase opacity-60">Identity QR Code</Label></div>
                                                <Switch checked={data.config.showQr} onCheckedChange={(v) => updateNested('config', 'showQr', v)} />
                                            </div>
                                            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-dashed">
                                                <div className="flex items-center gap-3"><FileDigit className="size-4 text-primary" /><Label className="text-[10px] font-black uppercase opacity-60">Card Barcode</Label></div>
                                                <Switch checked={data.config.showBarcode} onCheckedChange={(v) => updateNested('config', 'showBarcode', v)} />
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="bulk" className="space-y-8 m-0 animate-in zoom-in-95 duration-300">
                                    <div className="p-8 border-4 border-dashed border-primary/20 rounded-[2.5rem] bg-primary/5 flex flex-col items-center justify-center gap-6 text-center group cursor-pointer hover:bg-primary/10 transition-all" onClick={() => fileInputRef.current?.click()}>
                                        <div className="size-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-xl group-hover:scale-110 transition-transform">
                                            <FileSpreadsheet className="size-10" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-xl font-black uppercase tracking-tighter">Import Excel Database</p>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Generate hundreds of cards in one click</p>
                                        </div>
                                        <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls,.csv" onChange={handleBulkImport} />
                                    </div>
                                    
                                    {bulkData.length > 0 && (
                                        <div className="p-5 bg-green-500/5 rounded-2xl border-2 border-green-500/10 flex gap-4 animate-in slide-in-from-bottom-2">
                                            <CheckCircle2 className="size-6 text-green-600 shrink-0 mt-0.5" />
                                            <div className="text-left">
                                                <p className="text-[10px] font-black text-green-700 uppercase tracking-tight">{bulkData.length} Records Imported</p>
                                                <p className="text-[8px] text-green-600 font-bold leading-relaxed uppercase mt-1">Ready for Batch Processing.</p>
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>
                            </ScrollArea>
                        </Tabs>
                    </CardContent>
                    
                    <CardFooter className="bg-muted/10 p-8 border-t flex flex-col gap-4 shrink-0">
                        <Button onClick={() => exportSingleCard('png')} disabled={isProcessing} className="w-full h-16 md:h-20 text-lg md:text-xl font-black bg-primary text-white hover:bg-primary/90 shadow-2xl rounded-[1.5rem] group border-4 border-primary">
                            {isProcessing ? <Loader2 className="animate-spin mr-3 size-8" /> : <Download className="mr-3 size-8 group-hover:translate-y-1 transition-transform" />}
                            GENERATE ID CARD
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* RIGHT: LIVE PREVIEW STUDIO */}
            <div className="lg:col-span-7 flex flex-col items-center w-full">
                <div className="w-full flex items-center justify-between mb-4 px-4 no-print">
                    <div className="flex items-center gap-2">
                        <Eye className="size-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Live HD Viewport</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-600 text-white font-black text-[10px] px-3 py-1 rounded-full border-2 border-white shadow-lg animate-pulse uppercase">CR80 PVC SCALE</Badge>
                </div>

                <div className="w-full flex justify-center bg-slate-300/30 dark:bg-slate-950/50 rounded-[3rem] p-4 md:p-20 shadow-inner border-[6px] border-white/5 transition-all overflow-visible min-h-[900px]">
                    <div className="relative transform-gpu scale-[0.6] sm:scale-[0.8] lg:scale-[1.0] xl:scale-[1.1] origin-top h-auto shadow-[0_60px_120px_-20px_rgba(0,0,0,0.6)]">
                         <IdCardTemplate data={data} barcodeRef={barcodeRef} qrRef={qrRef} cardRef={cardRef} />
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl no-print">
                     <Button variant="outline" className="h-14 border-2 rounded-2xl font-black text-[10px] uppercase shadow-md hover:bg-primary/5" onClick={() => exportSingleCard('pdf')}><Printer className="size-4 mr-2" /> PDF Print</Button>
                     <Button variant="outline" className="h-14 border-2 rounded-2xl font-black text-[10px] uppercase shadow-md hover:bg-primary/5" onClick={() => exportSingleCard('png')}><ImageIcon className="size-4 mr-2" /> PNG High</Button>
                     <Button variant="outline" className="h-14 border-2 rounded-2xl font-black text-[10px] uppercase shadow-md hover:bg-primary/5" onClick={() => { setData(prev => ({ ...prev, config: { ...prev.config, orientation: prev.config.orientation === 'vertical' ? 'horizontal' : 'vertical' } })) }}><ArrowLeftRight className="size-4 mr-2" /> Flip Axis</Button>
                </div>
            </div>

        </div>
    );
}

// --- ID CARD VISUAL TEMPLATE ---

function IdCardTemplate({ data, barcodeRef, qrRef, cardRef }: { data: IdCardData, barcodeRef: any, qrRef: any, cardRef: any }) {
    const isVertical = data.config.orientation === 'vertical';
    const primary = data.config.primaryColor;
    const theme = data.config.theme;
    
    return (
        <div 
            ref={cardRef}
            className="bg-white relative overflow-hidden flex flex-col shadow-none select-none"
            style={{ 
                width: isVertical ? '324px' : '514px', 
                height: isVertical ? '514px' : '324px',
                borderRadius: `${data.config.borderRadius}px`,
                fontFamily: 'Inter, sans-serif'
            }}
        >
            {/* THEME SPECIFIC LAYOUTS */}
            
            {/* HEADER AREA */}
            <div 
                className={cn(
                    "relative z-10 w-full flex flex-col items-center pt-5 pb-3 px-4 text-center transition-all duration-500",
                    theme === 'minimal' ? "bg-white pt-8" : "",
                    theme === 'security' ? "border-b-8 border-yellow-400" : ""
                )} 
                style={{ backgroundColor: theme === 'minimal' ? 'transparent' : primary }}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                
                {/* LOGO */}
                <div className={cn(
                    "size-10 bg-white rounded-lg p-1.5 shadow-xl flex items-center justify-center mb-2",
                    theme === 'hospital' ? "rounded-full" : ""
                )}>
                    {data.organization.logo ? <img src={data.organization.logo} className="size-full object-contain" /> : <Building2 className="size-6" style={{ color: primary }} />}
                </div>

                <h3 className={cn(
                    "text-sm font-black uppercase tracking-tight leading-none drop-shadow-sm",
                    theme === 'minimal' ? "text-slate-900" : "text-white"
                )}>
                    {data.organization.name}
                </h3>
                <p className={cn(
                    "text-[7px] font-bold uppercase mt-1 tracking-widest",
                    theme === 'minimal' ? "text-slate-400" : "text-white/60"
                )}>
                    {data.organization.address}
                </p>

                {theme === 'hospital' && <div className="absolute top-4 right-4"><Heart className="size-4 text-white/40" /></div>}
                {theme === 'security' && <div className="absolute top-4 right-4"><Shield className="size-4 text-white/40" /></div>}
            </div>

            {/* THEME DIVIDERS */}
            {theme !== 'minimal' && (
                <div className="h-4 w-full relative z-0" style={{ backgroundColor: primary }}>
                     <div className={cn(
                         "absolute inset-0 bg-white",
                         theme === 'modern' ? "rounded-t-[3rem]" : "",
                         theme === 'corporate' ? "clip-path-slant" : ""
                     )} />
                </div>
            )}

            {/* MAIN BODY */}
            <div className={cn(
                "flex-1 bg-white relative flex flex-col items-center px-6 pb-6 overflow-hidden",
                isVertical ? "pt-4" : "flex-row justify-between items-start pt-10"
            )}>
                
                <div className={cn("flex flex-col items-center", !isVertical && "w-1/3")}>
                    {/* PHOTO FRAME */}
                    <div className="relative mb-4 group">
                        <div className={cn(
                            "size-28 border-4 bg-slate-50 overflow-hidden shadow-2xl relative z-10 transition-all",
                            theme === 'hospital' ? "rounded-full" : "rounded-2xl",
                            theme === 'security' ? "border-slate-900" : ""
                        )} style={{ borderColor: primary }}>
                            {data.personal.photo ? <img src={data.personal.photo} className="size-full object-cover" /> : <UserCircle className="size-full p-4 opacity-10" />}
                        </div>
                        <div className="absolute -inset-2 bg-gradient-to-br from-primary/10 to-transparent blur-xl opacity-50" />
                    </div>

                    {/* NAME & TITLE */}
                    <div className="text-center space-y-1 mb-6">
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">{data.personal.name || "CANDIDATE NAME"}</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-full inline-block" style={{ backgroundColor: `${primary}15`, color: primary }}>{data.personal.designation || "DESIGNATION"}</p>
                    </div>
                </div>

                {/* INFO GRID */}
                <div className={cn(
                    "grid grid-cols-1 gap-y-1.5 text-left",
                    isVertical ? "w-full" : "w-1/2 pt-4"
                )}>
                    <InfoRow label="ID NUMBER" value={data.personal.id} />
                    <InfoRow label="DEPARTMENT" value={data.personal.department} />
                    <InfoRow label="BLOOD GROUP" value={data.personal.bloodGroup} />
                    <InfoRow label="CONTACT" value={data.personal.mobile} />
                </div>

                {/* FOOTER COMPONENTS */}
                <div className={cn(
                    "mt-auto w-full flex items-end justify-between gap-4",
                    !isVertical && "hidden"
                )}>
                    {data.config.showQr && (
                        <div ref={qrRef} className="size-16 p-1 bg-white border-2 rounded-xl shadow-lg border-slate-100 flex items-center justify-center shrink-0" />
                    )}
                    
                    <div className="flex-1 flex flex-col items-center justify-end pb-1">
                        {data.personal.signature ? (
                            <img src={data.personal.signature} className="h-8 w-auto object-contain mb-1" />
                        ) : (
                            <div className="h-8 w-24 border-b border-dashed border-slate-300 mb-1" />
                        )}
                        <span className="text-[7px] font-black uppercase text-slate-400 tracking-widest">Authorized Signatory</span>
                    </div>

                    {data.organization.seal && (
                        <div className="size-12 opacity-40 shrink-0">
                            <img src={data.organization.seal} className="size-full object-contain" />
                        </div>
                    )}
                </div>
            </div>

            {/* BARCODE AT BOTTOM */}
            {data.config.showBarcode && (
                <div className="h-10 bg-slate-50 border-t flex items-center justify-center p-1 mt-auto">
                    <svg ref={barcodeRef} className="w-full h-full" />
                </div>
            )}

            {theme === 'security' && (
                <div className="absolute top-0 left-0 w-full h-2 bg-yellow-400 z-50 overflow-hidden">
                    <div className="w-full h-full opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(-45deg, #000, #000 10px, transparent 10px, transparent 20px)' }} />
                </div>
            )}
        </div>
    );
}

function InfoRow({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex items-center gap-3 text-[10px]">
            <span className="w-20 font-black uppercase text-slate-300 text-[8px] tracking-tight">{label}</span>
            <span className="font-bold text-slate-700 flex-1 truncate">{value || "---"}</span>
        </div>
    );
}
