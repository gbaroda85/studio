"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
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
    SearchCode,
    Plus,
    Trash2,
    Wallet,
    Briefcase,
    Banknote,
    ReceiptText,
    Loader2
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
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';

interface SalaryData {
    company: {
        name: string;
        address: string;
        logo: string | null;
    };
    employee: {
        name: string;
        empId: string;
        designation: string;
        department: string;
        doj: string;
        pan: string;
        bankName: string;
        bankAccount: string;
        ifsc: string;
    };
    payPeriod: {
        month: string;
        year: string;
        workingDays: string;
        leavesTaken: string;
    };
    earnings: {
        basic: number;
        hra: number;
        conveyance: number;
        medical: number;
        special: number;
        bonus: number;
    };
    deductions: {
        pf: number;
        pt: number;
        tds: number;
        loan: number;
    };
}

const INITIAL_DATA: SalaryData = {
    company: {
        name: "GR7 TECH SOLUTIONS PVT LTD",
        address: "7th Floor, Innovation Tower, Cyber City, Bangalore - 560102",
        logo: null
    },
    employee: {
        name: "RAHUL KUMAR",
        empId: "GR7-1024",
        designation: "SOFTWARE ENGINEER",
        department: "DEVELOPMENT",
        doj: "15-JAN-2022",
        pan: "ABCDE1234F",
        bankName: "HDFC BANK",
        bankAccount: "501004123XXXXX",
        ifsc: "HDFC0000123"
    },
    payPeriod: {
        month: "AUGUST",
        year: "2024",
        workingDays: "22",
        leavesTaken: "0"
    },
    earnings: {
        basic: 45000,
        hra: 18000,
        conveyance: 1600,
        medical: 1250,
        special: 5000,
        bonus: 0
    },
    deductions: {
        pf: 1800,
        pt: 200,
        tds: 2500,
        loan: 0
    }
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

export default function SalarySlipGenerator() {
    const { toast } = useToast();
    const [data, setData] = useState<SalaryData>(INITIAL_DATA);
    const [isExporting, setIsExporting] = useState(false);
    
    const previewRef = useRef<HTMLDivElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setData(prev => ({ ...prev, company: { ...prev.company, logo: ev.target?.result as string } }));
                toast({ title: "Logo Set", description: "Company branding updated." });
            };
            reader.readAsDataURL(file);
        }
    };

    const updateNested = (section: keyof SalaryData, field: string, value: any) => {
        setData(prev => ({
            ...prev,
            [section]: {
                ...(prev[section] as object),
                [field]: value
            }
        }));
    };

    const formatCurrency = (val: number) => 
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

    // CALCULATIONS
    const totalEarnings = Object.values(data.earnings).reduce((a, b) => a + b, 0);
    const totalDeductions = Object.values(data.deductions).reduce((a, b) => a + b, 0);
    const netSalary = totalEarnings - totalDeductions;

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
            pdf.save(`Salary_Slip_${data.employee.name.replace(/\s+/g, '_')}_${data.payPeriod.month}.pdf`);
            
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            toast({ title: "Salary Slip Exported!", description: "High-resolution PDF ready." });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Export Failed' });
        } finally {
            setIsExporting(false);
        }
    };

    const handleReset = () => {
        setData(INITIAL_DATA);
        toast({ title: "Form Restored" });
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
                                    <Banknote className="size-7" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl md:text-2xl font-black uppercase tracking-tighter">Payslip Studio</CardTitle>
                                    <CardDescription className="text-[10px] font-bold uppercase opacity-50 tracking-widest">HR & Payroll Compliant</CardDescription>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 text-[9px] font-black uppercase text-muted-foreground"><RefreshCcw className="size-3 mr-1" /> Reset</Button>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="p-6 md:p-8 space-y-10">
                        
                        {/* 1. EMPLOYER INFO */}
                        <div className="space-y-6">
                            <Badge className="bg-primary text-white font-black text-[9px] px-3 py-1 uppercase tracking-widest">Employer Branding</Badge>
                            <div className="grid gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Company Name</Label>
                                    <Input value={data.company.name} onChange={(e) => updateNested('company', 'name', e.target.value)} className="h-10 rounded-xl font-bold border-2" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Corporate Address</Label>
                                    <Textarea value={data.company.address} onChange={(e) => updateNested('company', 'address', e.target.value)} className="rounded-xl border-2 font-medium" />
                                </div>
                                <Button variant="outline" size="sm" className="w-full h-10 border-2 border-dashed font-black text-[9px] uppercase group" onClick={() => logoInputRef.current?.click()}>
                                    <Plus className="size-3 mr-2 group-hover:scale-125 transition-transform" /> {data.company.logo ? 'Change Logo' : 'Upload Company Logo (PNG)'}
                                </Button>
                                <input ref={logoInputRef} type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                            </div>
                        </div>

                        {/* 2. EMPLOYEE IDENTITY */}
                        <div className="space-y-6 pt-4 border-t border-dashed">
                            <Badge className="bg-blue-600 text-white font-black text-[9px] px-3 py-1 uppercase tracking-widest">Employee Profile</Badge>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Employee Name</Label>
                                    <Input value={data.employee.name} onChange={(e) => updateNested('employee', 'name', e.target.value)} className="h-10 rounded-xl font-bold border-2" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Designation</Label>
                                    <Input value={data.employee.designation} onChange={(e) => updateNested('employee', 'designation', e.target.value)} className="h-10 rounded-xl font-bold border-2" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Employee ID</Label>
                                    <Input value={data.employee.empId} onChange={(e) => updateNested('employee', 'empId', e.target.value)} className="h-10 rounded-xl font-bold border-2" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Bank A/c No.</Label>
                                    <Input value={data.employee.bankAccount} onChange={(e) => updateNested('employee', 'bankAccount', e.target.value)} className="h-10 rounded-xl font-bold border-2" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">IFSC Code</Label>
                                    <Input value={data.employee.ifsc} onChange={(e) => updateNested('employee', 'ifsc', e.target.value)} className="h-10 rounded-xl font-bold border-2" />
                                </div>
                            </div>
                        </div>

                        {/* 3. PAY PERIOD */}
                        <div className="space-y-6 pt-4 border-t border-dashed">
                            <Badge className="bg-indigo-600 text-white font-black text-[9px] px-3 py-1 uppercase tracking-widest">Payment Cycle</Badge>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Salary Month</Label>
                                    <Input value={data.payPeriod.month} onChange={(e) => updateNested('payPeriod', 'month', e.target.value)} className="h-10 rounded-xl font-bold border-2" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Year</Label>
                                    <Input value={data.payPeriod.year} onChange={(e) => updateNested('payPeriod', 'year', e.target.value)} className="h-10 rounded-xl font-bold border-2" />
                                </div>
                            </div>
                        </div>

                        {/* 4. EARNINGS & DEDUCTIONS */}
                        <div className="grid grid-cols-2 gap-8 pt-4 border-t border-dashed">
                            <div className="space-y-4">
                                <Badge className="bg-emerald-600 text-white font-black text-[8px] px-2 py-0.5 uppercase tracking-widest">Earnings</Badge>
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <Label className="text-[8px] font-black uppercase opacity-40">Basic Pay</Label>
                                        <Input type="number" value={data.earnings.basic} onChange={(e) => updateNested('earnings', 'basic', Number(e.target.value))} className="h-9 font-bold" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[8px] font-black uppercase opacity-40">HRA</Label>
                                        <Input type="number" value={data.earnings.hra} onChange={(e) => updateNested('earnings', 'hra', Number(e.target.value))} className="h-9 font-bold" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[8px] font-black uppercase opacity-40">Special Allowance</Label>
                                        <Input type="number" value={data.earnings.special} onChange={(e) => updateNested('earnings', 'special', Number(e.target.value))} className="h-9 font-bold" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <Badge className="bg-rose-600 text-white font-black text-[8px] px-2 py-0.5 uppercase tracking-widest">Deductions</Badge>
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <Label className="text-[8px] font-black uppercase opacity-40">Provident Fund (PF)</Label>
                                        <Input type="number" value={data.deductions.pf} onChange={(e) => updateNested('deductions', 'pf', Number(e.target.value))} className="h-9 font-bold text-rose-600" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[8px] font-black uppercase opacity-40">Professional Tax</Label>
                                        <Input type="number" value={data.deductions.pt} onChange={(e) => updateNested('deductions', 'pt', Number(e.target.value))} className="h-9 font-bold text-rose-600" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[8px] font-black uppercase opacity-40">TDS / Income Tax</Label>
                                        <Input type="number" value={data.deductions.tds} onChange={(e) => updateNested('deductions', 'tds', Number(e.target.value))} className="h-9 font-bold text-rose-600" />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </CardContent>
                    <CardFooter className="bg-muted/10 p-8 border-t flex flex-col gap-4">
                        <Button onClick={handleExport} disabled={isExporting} className="w-full h-16 md:h-20 text-lg md:text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-[1.5rem] transition-all active:scale-95 group border-4 border-primary hover:bg-transparent hover:text-primary">
                            {isExporting ? <Loader2 className="animate-spin mr-3 size-8" /> : <Printer className="mr-3 size-8 group-hover:rotate-12 transition-transform" />}
                            GENERATE SALARY SLIP
                        </Button>
                        <p className="text-[10px] text-center text-muted-foreground font-bold uppercase tracking-widest opacity-60">Compliant with Indian Payroll Standards</p>
                    </CardFooter>
                </Card>
            </div>

            {/* RIGHT: A4 PREVIEW */}
            <div className="lg:col-span-7 flex flex-col items-center w-full">
                
                <div className="w-full flex items-center justify-between mb-4 px-4 no-print">
                    <div className="flex items-center gap-2">
                        <Eye className="size-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Live Studio View</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-600 text-white font-black text-[10px] px-3 py-1 rounded-full border-2 border-white shadow-lg animate-pulse">A4 LAYOUT</Badge>
                </div>

                <div className="w-full flex justify-center bg-slate-300/30 dark:bg-slate-950/50 rounded-[3rem] p-4 md:p-12 shadow-inner border-[6px] border-white/5 transition-all">
                    <div className="relative transform-gpu scale-[0.45] sm:scale-[0.7] lg:scale-[0.85] xl:scale-100 origin-top h-auto shadow-[0_60px_120px_-20px_rgba(0,0,0,0.6)]">
                         
                         {/* THE ACTUAL PAYSILP CONTAINER */}
                         <div 
                            ref={previewRef}
                            className="bg-white p-[15mm] flex flex-col text-slate-900 shadow-none border-0"
                            style={{ width: '210mm', minHeight: '297mm', fontFamily: 'Inter, sans-serif' }}
                         >
                            {/* Header Branding */}
                            <header className="flex justify-between items-center mb-10 pb-8 border-b-4 border-slate-900">
                                <div className="space-y-1 max-w-[70%]">
                                    <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">{data.company.name}</h1>
                                    <p className="text-[11px] font-bold text-slate-500 uppercase leading-relaxed mt-2">{data.company.address}</p>
                                </div>
                                {data.company.logo ? (
                                    <img src={data.company.logo} className="h-16 w-auto object-contain" alt="logo" />
                                ) : (
                                    <div className="size-20 rounded-2xl bg-slate-100 flex items-center justify-center border-2 border-slate-200">
                                        <Building2 className="size-10 text-slate-300" />
                                    </div>
                                )}
                            </header>

                            <div className="text-center mb-10">
                                <h2 className="text-2xl font-black uppercase tracking-[0.3em] inline-block border-y-2 border-slate-900 py-1.5 px-10">Pay Slip</h2>
                                <p className="text-sm font-bold text-slate-500 mt-2">FOR THE MONTH OF {data.payPeriod.month} {data.payPeriod.year}</p>
                            </div>

                            {/* Employee Details Grid */}
                            <div className="grid grid-cols-2 gap-y-4 gap-x-12 mb-10 bg-slate-50 p-8 rounded-3xl border border-slate-200">
                                <Row label="Employee Name" value={data.employee.name} />
                                <Row label="Employee ID" value={data.employee.empId} />
                                <Row label="Designation" value={data.employee.designation} />
                                <Row label="Department" value={data.employee.department} />
                                <Row label="Date of Joining" value={data.employee.doj} />
                                <Row label="PAN Number" value={data.employee.pan} />
                                <Row label="Bank Name" value={data.employee.bankName} />
                                <Row label="Bank Account" value={data.employee.bankAccount} />
                                <Row label="IFSC Code" value={data.employee.ifsc} />
                                <Row label="Working Days" value={data.payPeriod.workingDays} />
                            </div>

                            {/* Table Sections */}
                            <div className="grid grid-cols-2 border-2 border-slate-900 flex-1 min-h-[400px]">
                                {/* Earnings Column */}
                                <div className="border-r-2 border-slate-900">
                                    <div className="bg-slate-900 text-white p-3 text-center text-[10px] font-black uppercase tracking-widest">Earnings (In INR)</div>
                                    <div className="p-4 space-y-4">
                                        <TableItem label="Basic Pay" value={data.earnings.basic} />
                                        <TableItem label="House Rent Allowance (HRA)" value={data.earnings.hra} />
                                        <TableItem label="Conveyance Allowance" value={data.earnings.conveyance} />
                                        <TableItem label="Medical Allowance" value={data.earnings.medical} />
                                        <TableItem label="Special Allowance" value={data.earnings.special} />
                                        {data.earnings.bonus > 0 && <TableItem label="Performance Bonus" value={data.earnings.bonus} />}
                                    </div>
                                </div>
                                
                                {/* Deductions Column */}
                                <div>
                                    <div className="bg-slate-900 text-white p-3 text-center text-[10px] font-black uppercase tracking-widest">Deductions (In INR)</div>
                                    <div className="p-4 space-y-4">
                                        <TableItem label="Provident Fund (PF)" value={data.deductions.pf} isDeduction />
                                        <TableItem label="Professional Tax" value={data.deductions.pt} isDeduction />
                                        <TableItem label="TDS / Income Tax" value={data.deductions.tds} isDeduction />
                                        {data.deductions.loan > 0 && <TableItem label="Loan / Advance" value={data.deductions.loan} isDeduction />}
                                    </div>
                                </div>
                            </div>

                            {/* Totals Row */}
                            <div className="grid grid-cols-2 border-x-2 border-b-2 border-slate-900">
                                <div className="p-4 flex justify-between items-center border-r-2 border-slate-900">
                                    <span className="text-[11px] font-black uppercase">Total Earnings</span>
                                    <span className="text-sm font-black">{formatCurrency(totalEarnings)}</span>
                                </div>
                                <div className="p-4 flex justify-between items-center bg-rose-50/50">
                                    <span className="text-[11px] font-black uppercase">Total Deductions</span>
                                    <span className="text-sm font-black text-rose-600">{formatCurrency(totalDeductions)}</span>
                                </div>
                            </div>

                            {/* Net Salary Section */}
                            <div className="mt-12 p-8 bg-slate-900 text-white rounded-3xl flex justify-between items-center shadow-xl">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-40">Net Monthly Salary</p>
                                    <h3 className="text-4xl font-black tracking-tighter">{formatCurrency(netSalary)}</h3>
                                </div>
                                <div className="text-right">
                                    <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/10">
                                        <Sparkles className="size-4 text-primary" />
                                        <span className="text-[10px] font-black uppercase">Account Credit Successful</span>
                                    </div>
                                </div>
                            </div>

                            {/* Declarations & Signature */}
                            <div className="mt-12 grid grid-cols-2 gap-12 items-end">
                                <div className="p-6 border-l-4 border-primary bg-slate-50 rounded-r-2xl">
                                    <p className="text-[9px] font-black uppercase text-primary mb-2">Notice</p>
                                    <p className="text-[10px] font-medium leading-relaxed italic text-slate-500">
                                        "This is a computer generated salary slip and does not require a physical signature. For any discrepancies, please reach out to the HR department within 48 hours."
                                    </p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="w-48 h-16 border-b-2 border-slate-200 mb-2 relative">
                                        <div className="absolute inset-0 flex items-center justify-center opacity-5">
                                            <span className="text-3xl font-black uppercase tracking-widest">OFFICIAL SEAL</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Authorized Signatory</p>
                                </div>
                            </div>

                            <footer className="mt-auto pt-10 text-center">
                                <p className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-300">© GENERATED BY GR7 IMAGE PDF TOOLS HUB STUDIO</p>
                            </footer>

                         </div>

                    </div>
                </div>

                <div className="mt-8 flex items-center gap-6 text-muted-foreground/40 text-[10px] font-black uppercase tracking-widest no-print">
                    <div className="flex items-center gap-2"><ShieldCheck className="size-3 text-green-500" /> SECURE RAM</div>
                    <div className="flex items-center gap-2"><Zap className="size-3 text-yellow-500" /> INSTANT RENDER</div>
                    <div className="flex items-center gap-2"><Sparkles className="size-3 text-primary" /> HD STUDIO OUTPUT</div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
            `}</style>
        </div>
    );
}

// INTERNAL UTILS
function Row({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex items-baseline gap-4 text-[12px]">
            <span className="w-32 font-black text-slate-400 shrink-0 uppercase text-[9px] tracking-tight">{label}</span>
            <span className="font-bold border-b border-dotted border-slate-200 flex-1 pb-1 text-slate-800 truncate">{value || "---"}</span>
        </div>
    );
}

function TableItem({ label, value, isDeduction }: { label: string, value: number, isDeduction?: boolean }) {
    return (
        <div className="flex justify-between items-center text-[12px]">
            <span className="font-bold text-slate-600 uppercase tracking-tight text-[10px]">{label}</span>
            <span className={cn("font-black", isDeduction ? "text-rose-600" : "text-slate-900")}>
                {isDeduction && value > 0 ? '-' : ''}{value.toLocaleString()}
            </span>
        </div>
    );
}
