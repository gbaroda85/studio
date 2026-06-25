
"use client";

import React from 'react';
import { ResumeData } from './resume-builder-main';
import { Mail, Phone, MapPin, Linkedin, Globe, Calendar, Award, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TemplateProps {
    data: ResumeData;
}

/**
 * @fileOverview Professional A4 Resume Templates (15 Variations)
 * Optimized for ATS readability and high-quality printing.
 */

export default function ResumeTemplates({ type, data }: { type: string, data: ResumeData }) {
    switch (type) {
        case 'modern-corporate': return <ModernCorporate data={data} />;
        case 'ats-professional': return <ATSProfessional data={data} />;
        case 'executive-minimal': return <ExecutiveMinimal data={data} />;
        case 'fresher-standard': return <FresherStandard data={data} />;
        case 'tech-developer': return <TechDeveloper data={data} />;
        case 'creative-sidebar': return <CreativeSidebar data={data} />;
        case 'classic-elegant': return <ClassicElegant data={data} />;
        case 'government-job': return <GovernmentJob data={data} />;
        case 'vibrant-edge': return <VibrantEdge data={data} />;
        case 'minimal-clean': return <MinimalClean data={data} />;
        case 'business-pro': return <BusinessPro data={data} />;
        case 'teacher-standard': return <TeacherStandard data={data} />;
        case 'accountant-pro': return <AccountantPro data={data} />;
        case 'sales-executive': return <SalesExecutive data={data} />;
        case 'premium-dark': return <PremiumDark data={data} />;
        default: return <ModernCorporate data={data} />;
    }
}

// --- SHARED UI COMPONENTS ---

const SectionTitle = ({ title, color = "#1e293b", icon: Icon }: { title: string, color?: string, icon?: any }) => (
    <div className="flex items-center gap-3 mb-4 border-b-2 pb-1" style={{ borderColor: `${color}33` }}>
        {Icon && <Icon className="size-4" style={{ color }} />}
        <h3 className="text-sm font-black uppercase tracking-widest" style={{ color }}>{title}</h3>
    </div>
);

const ContactItem = ({ icon: Icon, text, color = "#64748b" }: { icon: any, text: string, color?: string }) => (
    <div className="flex items-center gap-2 text-[10px] font-bold" style={{ color }}>
        <Icon className="size-3 shrink-0" />
        <span className="truncate">{text}</span>
    </div>
);

// --- 1. MODERN CORPORATE (Template 1) ---
function ModernCorporate({ data }: TemplateProps) {
    const primary = "#004a99";
    return (
        <div className="w-full h-full p-12 bg-white flex flex-col text-left font-sans">
            <header className="flex justify-between items-start mb-10 pb-10 border-b-4 border-slate-900">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tighter uppercase text-slate-900">{data.personal.fullName}</h1>
                    <p className="text-xl font-bold text-blue-700 tracking-wide uppercase">{data.personal.title}</p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 pt-4">
                        <ContactItem icon={Mail} text={data.personal.email} />
                        <ContactItem icon={Phone} text={data.personal.phone} />
                        <ContactItem icon={MapPin} text={`${data.personal.city}, ${data.personal.state}`} />
                        <ContactItem icon={Linkedin} text={data.personal.linkedin} />
                    </div>
                </div>
                {data.personal.photo && (
                    <div className="size-28 rounded-2xl overflow-hidden border-4 border-white shadow-2xl shrink-0">
                        <img src={data.personal.photo} className="size-full object-cover" alt="p" />
                    </div>
                )}
            </header>

            <div className="grid grid-cols-12 gap-10">
                <div className="col-span-8 space-y-10">
                    <section>
                        <SectionTitle title="Professional Profile" color={primary} />
                        <p className="text-xs leading-relaxed text-slate-600 font-medium text-justify">{data.summary}</p>
                    </section>

                    <section>
                        <SectionTitle title="Work Experience" color={primary} />
                        <div className="space-y-6">
                            {data.experience.map(exp => (
                                <div key={exp.id} className="space-y-1">
                                    <div className="flex justify-between items-baseline">
                                        <h4 className="text-sm font-black uppercase text-slate-800">{exp.position}</h4>
                                        <span className="text-[10px] font-black text-slate-400">{exp.startDate} - {exp.endDate}</span>
                                    </div>
                                    <p className="text-[11px] font-bold text-blue-600 uppercase">{exp.company} | {exp.location}</p>
                                    <p className="text-[11px] leading-relaxed text-slate-500 whitespace-pre-line pt-2">{exp.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="col-span-4 space-y-10">
                    <section>
                        <SectionTitle title="Core Skills" color={primary} />
                        <div className="flex flex-wrap gap-1.5">
                            {data.skills.technical.map(s => <Badge key={s} variant="outline" className="text-[9px] border-slate-200 font-black uppercase px-2 py-0.5">{s}</Badge>)}
                            {data.skills.tools.map(s => <Badge key={s} variant="outline" className="text-[9px] border-slate-200 font-black uppercase px-2 py-0.5">{s}</Badge>)}
                        </div>
                    </section>

                    <section>
                        <SectionTitle title="Education" color={primary} />
                        <div className="space-y-4">
                            {data.education.map(edu => (
                                <div key={edu.id} className="space-y-0.5 text-left">
                                    <p className="text-[11px] font-black uppercase text-slate-800 leading-tight">{edu.degree}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{edu.school}</p>
                                    <p className="text-[9px] font-black text-blue-600">{edu.startYear} - {edu.endYear}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

// --- 2. ATS PROFESSIONAL (Template 2) ---
function ATSProfessional({ data }: TemplateProps) {
    return (
        <div className="w-full h-full p-12 bg-white flex flex-col text-left font-serif leading-normal" style={{ color: '#000' }}>
            <header className="text-center mb-10 space-y-2 border-b-2 border-black pb-6">
                <h1 className="text-4xl font-bold tracking-tight">{data.personal.fullName}</h1>
                <div className="flex flex-wrap justify-center gap-4 text-xs font-medium">
                    <span>{data.personal.phone}</span> | <span>{data.personal.email}</span> | <span>{data.personal.linkedin}</span> | <span>{data.personal.location}</span>
                </div>
            </header>
            
            <div className="space-y-8">
                <section>
                    <h3 className="text-sm font-bold border-b border-black uppercase mb-3">Professional Summary</h3>
                    <p className="text-xs leading-relaxed text-justify">{data.summary}</p>
                </section>

                <section>
                    <h3 className="text-sm font-bold border-b border-black uppercase mb-3">Experience</h3>
                    <div className="space-y-6">
                        {data.experience.map(exp => (
                            <div key={exp.id} className="space-y-1">
                                <div className="flex justify-between items-baseline font-bold text-[13px]">
                                    <span>{exp.company}, {exp.location}</span>
                                    <span>{exp.startDate} – {exp.endDate}</span>
                                </div>
                                <p className="italic text-xs font-medium">{exp.position}</p>
                                <p className="text-[11px] whitespace-pre-line mt-1">{exp.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h3 className="text-sm font-bold border-b border-black uppercase mb-3">Education</h3>
                    <div className="space-y-4">
                        {data.education.map(edu => (
                            <div key={edu.id} className="flex justify-between items-baseline text-xs">
                                <div><span className="font-bold">{edu.school}</span>, {edu.board}</div>
                                <span>{edu.startYear} – {edu.endYear}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h3 className="text-sm font-bold border-b border-black uppercase mb-3">Technical Skills</h3>
                    <p className="text-[11px]"><span className="font-bold">Core Skills:</span> {data.skills.technical.join(', ')}</p>
                    <p className="text-[11px] mt-1"><span className="font-bold">Tools:</span> {data.skills.tools.join(', ')}</p>
                </section>
            </div>
        </div>
    );
}

// --- 3. EXECUTIVE MINIMAL (Template 3) ---
function ExecutiveMinimal({ data }: TemplateProps) {
    const accent = "#444";
    return (
        <div className="w-full h-full p-[15mm] bg-white flex flex-col text-left">
            <header className="flex flex-col items-center text-center mb-16 gap-4">
                <h1 className="text-5xl font-light tracking-[0.2em] uppercase text-slate-800">{data.personal.fullName}</h1>
                <div className="h-0.5 w-40 bg-slate-200" />
                <p className="text-lg font-bold tracking-[0.4em] opacity-40 uppercase">{data.personal.title}</p>
                <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400 mt-4">
                    <span>{data.personal.email}</span>
                    <span>{data.personal.phone}</span>
                    <span>{data.personal.location}</span>
                </div>
            </header>

            <div className="space-y-12 max-w-4xl mx-auto w-full">
                <section className="grid grid-cols-12 gap-10">
                    <div className="col-span-3 text-right"><h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">About Me</h3></div>
                    <div className="col-span-9"><p className="text-sm leading-relaxed text-slate-600 font-medium">{data.summary}</p></div>
                </section>

                <section className="grid grid-cols-12 gap-10">
                    <div className="col-span-3 text-right"><h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Experience</h3></div>
                    <div className="col-span-9 space-y-10">
                        {data.experience.map(exp => (
                            <div key={exp.id} className="space-y-2">
                                <div className="flex justify-between items-center"><h4 className="text-lg font-black text-slate-800">{exp.position}</h4><span className="text-[10px] font-bold opacity-30">{exp.duration}</span></div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{exp.company}</p>
                                <p className="text-xs text-slate-500 whitespace-pre-line mt-4 leading-relaxed">{exp.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="grid grid-cols-12 gap-10">
                    <div className="col-span-3 text-right"><h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Expertise</h3></div>
                    <div className="col-span-9"><div className="flex flex-wrap gap-y-3 gap-x-8">{data.skills.technical.map(s => <span key={s} className="text-xs font-black uppercase tracking-wider text-slate-700">{s}</span>)}</div></div>
                </section>
            </div>
        </div>
    );
}

// --- 4. FRESHER STANDARD (Template 4) ---
function FresherStandard({ data }: TemplateProps) {
    return (
        <div className="w-full h-full p-12 bg-white flex flex-col text-left font-sans">
            <header className="bg-slate-50 p-10 rounded-[2rem] border-2 border-slate-100 flex items-center justify-between mb-10">
                <div className="space-y-1 text-left">
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900">{data.personal.fullName}</h1>
                    <p className="text-lg font-bold text-emerald-600 uppercase tracking-widest">{data.personal.title}</p>
                    <div className="flex gap-4 text-[10px] font-bold text-slate-400 uppercase pt-4">
                        <span className="flex items-center gap-1.5"><Mail className="size-3" /> {data.personal.email}</span>
                        <span className="flex items-center gap-1.5"><Phone className="size-3" /> {data.personal.phone}</span>
                    </div>
                </div>
                {data.personal.photo && <div className="size-24 rounded-2xl border-4 border-white shadow-xl overflow-hidden"><img src={data.personal.photo} className="size-full object-cover" /></div>}
            </header>
            
            <div className="grid grid-cols-12 gap-10 flex-1">
                <div className="col-span-12 space-y-10">
                    <section className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600 border-b-2 border-emerald-100 pb-2">Academic Credentials</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {data.education.map(edu => (
                                <div key={edu.id} className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100">
                                    <p className="text-xs font-black text-slate-800 uppercase">{edu.degree}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{edu.school}</p>
                                    <div className="flex justify-between items-center mt-3"><span className="text-[9px] font-black text-emerald-600">{edu.startYear} - {edu.endYear}</span><Badge className="bg-white text-slate-900 text-[9px] border-none shadow-sm">{edu.score}</Badge></div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600 border-b-2 border-emerald-100 pb-2">Technical Projects</h3>
                        <div className="space-y-6">
                            {data.projects.map(proj => (
                                <div key={proj.id} className="space-y-1.5">
                                    <div className="flex justify-between items-center"><h4 className="font-black text-slate-800 text-sm uppercase">{proj.title}</h4><span className="text-[9px] font-bold text-emerald-500">{proj.tech}</span></div>
                                    <p className="text-[11px] leading-relaxed text-slate-500">{proj.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

// --- 5. TECH DEVELOPER (Template 5) ---
function TechDeveloper({ data }: TemplateProps) {
    const accent = "#6366f1";
    return (
        <div className="w-full h-full flex bg-[#fafafa]" style={{ width: '210mm', minHeight: '297mm' }}>
            <div className="w-[30%] bg-[#1e293b] text-white p-10 flex flex-col gap-10">
                <div className="flex flex-col items-center gap-6">
                    <div className="size-32 rounded-3xl border-4 border-white/10 overflow-hidden bg-white/5">
                        {data.personal.photo ? <img src={data.personal.photo} className="size-full object-cover" /> : <User2 className="size-full p-6 opacity-20" />}
                    </div>
                    <div className="text-center space-y-1">
                        <h2 className="text-sm font-black uppercase tracking-widest">{data.personal.fullName}</h2>
                        <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">{data.personal.title}</p>
                    </div>
                </div>
                <section className="space-y-4">
                    <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400">Expertise</h3>
                    <div className="flex flex-col gap-2">
                        {data.skills.technical.map(s => (
                            <div key={s} className="flex flex-col gap-1">
                                <span className="text-[9px] font-bold uppercase opacity-80">{s}</span>
                                <div className="h-1 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 w-[80%]" /></div>
                            </div>
                        ))}
                    </div>
                </section>
                <section className="space-y-3 text-left">
                    <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400">Contact</h3>
                    <div className="space-y-2 text-[8px] font-bold opacity-60 uppercase tracking-tighter">
                         <p>{data.personal.email}</p><p>{data.personal.phone}</p><p>{data.personal.location}</p>
                    </div>
                </section>
            </div>
            <div className="flex-1 p-12 flex flex-col text-left gap-10">
                <section className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-indigo-600">Employment Summary</h3>
                    <div className="space-y-10">
                        {data.experience.map(exp => (
                            <div key={exp.id} className="relative pl-6 border-l-2 border-indigo-100 space-y-2">
                                <div className="absolute -left-[5px] top-1 size-2 rounded-full bg-indigo-500" />
                                <div className="flex justify-between items-center"><h4 className="text-base font-black text-slate-900">{exp.position}</h4><span className="text-[9px] font-black text-slate-400">{exp.duration}</span></div>
                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{exp.company}</p>
                                <p className="text-xs text-slate-500 leading-relaxed pt-2 whitespace-pre-line">{exp.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
                <section className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-indigo-600">Featured Projects</h3>
                    <div className="grid grid-cols-2 gap-6">
                        {data.projects.map(p => (
                            <div key={p.id} className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                                <h5 className="text-[11px] font-black uppercase text-slate-800">{p.title}</h5>
                                <p className="text-[8px] font-bold text-indigo-400 mt-1">{p.tech}</p>
                                <p className="text-[9px] text-slate-400 mt-2 leading-tight">{p.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

// --- 6-15. OTHER TEMPLATES (Simplified for scope) ---
function CreativeSidebar({ data }: TemplateProps) { return <TemplateBase data={data} theme="creative" />; }
function ClassicElegant({ data }: TemplateProps) { return <TemplateBase data={data} theme="classic" />; }
function GovernmentJob({ data }: TemplateProps) { return <TemplateBase data={data} theme="gov" />; }
function VibrantEdge({ data }: TemplateProps) { return <TemplateBase data={data} theme="vibrant" />; }
function MinimalClean({ data }: TemplateProps) { return <TemplateBase data={data} theme="minimal" />; }
function BusinessPro({ data }: TemplateProps) { return <TemplateBase data={data} theme="business" />; }
function TeacherStandard({ data }: TemplateProps) { return <TemplateBase data={data} theme="teacher" />; }
function AccountantPro({ data }: TemplateProps) { return <TemplateBase data={data} theme="accountant" />; }
function SalesExecutive({ data }: TemplateProps) { return <TemplateBase data={data} theme="sales" />; }
function PremiumDark({ data }: TemplateProps) { return <TemplateBase data={data} theme="dark" />; }

// --- REUSABLE TEMPLATE BASE FOR REMAINING ---
function TemplateBase({ data, theme }: { data: ResumeData, theme: string }) {
    const isDark = theme === 'dark';
    const accent = theme === 'vibrant' ? '#e11d48' : theme === 'gov' ? '#1e3a8a' : '#0f172a';
    
    return (
        <div className={cn("w-full h-full p-12 flex flex-col text-left", isDark ? "bg-[#111] text-white" : "bg-white text-slate-900")}>
            <header className="mb-10 space-y-2 border-b-2 border-slate-100 pb-8">
                <h1 className="text-4xl font-black tracking-tighter uppercase">{data.personal.fullName}</h1>
                <p className="text-lg font-bold opacity-60 uppercase tracking-widest" style={{ color: accent }}>{data.personal.title}</p>
                <div className="flex gap-4 text-[10px] font-bold opacity-40 uppercase pt-4">
                    <span>{data.personal.email}</span> • <span>{data.personal.phone}</span> • <span>{data.personal.location}</span>
                </div>
            </header>
            <div className="flex-1 space-y-10">
                <section>
                    <SectionTitle title="Profile Summary" color={accent} />
                    <p className="text-xs leading-relaxed opacity-70">{data.summary}</p>
                </section>
                <section>
                    <SectionTitle title="Key Experience" color={accent} />
                    <div className="space-y-6">
                        {data.experience.map(exp => (
                            <div key={exp.id} className="space-y-1">
                                <h4 className="text-sm font-black">{exp.position} | {exp.company}</h4>
                                <p className="text-[9px] font-bold opacity-50">{exp.duration}</p>
                                <p className="text-[11px] opacity-70 mt-2">{exp.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
                <div className="grid grid-cols-2 gap-10">
                    <section>
                        <SectionTitle title="Education" color={accent} />
                        <div className="space-y-3">
                            {data.education.map(edu => (
                                <div key={edu.id} className="space-y-0.5">
                                    <p className="text-[10px] font-black uppercase">{edu.degree}</p>
                                    <p className="text-[9px] opacity-50">{edu.school}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                    <section>
                        <SectionTitle title="Skills" color={accent} />
                        <div className="flex flex-wrap gap-1">
                            {data.skills.technical.map(s => <Badge key={s} variant="outline" className="text-[8px] font-black uppercase">{s}</Badge>)}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
