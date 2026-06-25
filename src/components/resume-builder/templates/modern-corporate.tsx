
"use client";

import React from 'react';
import { ResumeData } from '../../resume-builder-main';
import { Mail, Phone, MapPin, Linkedin, Globe, Calendar, Award, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ModernCorporate({ data }: { data: ResumeData }) {
    const primary = "#004a99";
    return (
        <div className="w-full h-full p-12 bg-white flex flex-col text-left font-sans text-slate-900" style={{ width: '210mm', minHeight: '297mm' }}>
            <header className="flex justify-between items-start mb-10 pb-10 border-b-4 border-slate-900">
                <div className="space-y-2 flex-1">
                    <h1 className="text-4xl font-black tracking-tighter uppercase">{data.personal.fullName}</h1>
                    <p className="text-xl font-bold text-blue-700 tracking-wide uppercase">{data.personal.title}</p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 pt-4 text-[10px] font-bold text-slate-500">
                        <div className="flex items-center gap-2"><Mail className="size-3" /> {data.personal.email}</div>
                        <div className="flex items-center gap-2"><Phone className="size-3" /> {data.personal.phone}</div>
                        <div className="flex items-center gap-2"><MapPin className="size-3" /> {data.personal.city}, {data.personal.state}</div>
                        <div className="flex items-center gap-2"><Linkedin className="size-3" /> {data.personal.linkedin}</div>
                    </div>
                </div>
                {data.personal.photo && (
                    <div className="size-28 rounded-2xl overflow-hidden border-4 border-white shadow-2xl shrink-0 ml-8">
                        <img src={data.personal.photo} className="size-full object-cover" alt="p" />
                    </div>
                )}
            </header>

            <div className="grid grid-cols-12 gap-10 flex-1">
                <div className="col-span-8 space-y-10">
                    <section>
                        <h3 className="text-sm font-black uppercase tracking-widest text-blue-700 border-b-2 border-blue-50 pb-1 mb-4">Professional Profile</h3>
                        <p className="text-xs leading-relaxed text-slate-600 font-medium text-justify">{data.summary}</p>
                    </section>

                    <section>
                        <h3 className="text-sm font-black uppercase tracking-widest text-blue-700 border-b-2 border-blue-50 pb-1 mb-4">Work Experience</h3>
                        <div className="space-y-6">
                            {data.experience.map(exp => (
                                <div key={exp.id} className="space-y-1">
                                    <div className="flex justify-between items-baseline">
                                        <h4 className="text-sm font-black uppercase text-slate-800">{exp.title}</h4>
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
                        <h3 className="text-sm font-black uppercase tracking-widest text-blue-700 border-b-2 border-blue-50 pb-1 mb-4">Core Skills</h3>
                        <div className="flex flex-wrap gap-1.5">
                            {data.skills.technical.map(s => <span key={s} className="bg-slate-50 text-slate-700 text-[9px] font-black border border-slate-200 uppercase px-2 py-0.5 rounded">{s}</span>)}
                        </div>
                    </section>

                    <section>
                        <h3 className="text-sm font-black uppercase tracking-widest text-blue-700 border-b-2 border-blue-50 pb-1 mb-4">Education</h3>
                        <div className="space-y-4">
                            {data.education.map(edu => (
                                <div key={edu.id} className="space-y-0.5">
                                    <p className="text-[11px] font-black uppercase text-slate-800 leading-tight">{edu.degree}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{edu.school}</p>
                                    <p className="text-[9px] font-black text-blue-600">{edu.startYear} - {edu.endYear}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
            
            <footer className="mt-auto pt-6 border-t border-slate-100 text-center">
                <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-200">GR7 PROFESSIONAL RESUME STUDIO</p>
            </footer>
        </div>
    );
}
