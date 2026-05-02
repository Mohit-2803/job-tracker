"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Save, User, Briefcase, GraduationCap, Code, Rocket, Award, Languages, ChevronRight, Sparkles } from "lucide-react";
import { ResumeSchema, type ParsedResume } from "@/lib/ai/schema";
import { cn } from "@/lib/utils";

type Props = {
  resumeId: string;
  initialData: ParsedResume;
};

export default function ResumeEditForm({ resumeId, initialData }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("personal");

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ParsedResume>({
    resolver: zodResolver(ResumeSchema),
    defaultValues: {
      name: initialData.name ?? "",
      email: initialData.email ?? "",
      phone: initialData.phone ?? "",
      location: initialData.location ?? "",
      linkedin: initialData.linkedin ?? "",
      summary: initialData.summary ?? "",
      skills: initialData.skills ?? [],
      experience: initialData.experience ?? [],
      education: initialData.education ?? [],
      projects: initialData.projects ?? [],
      certifications: initialData.certifications ?? [],
      languages: initialData.languages ?? [],
    },
  });

  // ScrollSpy Implementation
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-100px 0px -70% 0px", // Calibrated for the new tight header
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const sections = document.querySelectorAll("section[id]");
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const skillsArray = useFieldArray({ control, name: "skills" as never });
  const experienceArray = useFieldArray({ control, name: "experience" });
  const educationArray = useFieldArray({ control, name: "education" });
  const projectsArray = useFieldArray({ control, name: "projects" });
  const certificationsArray = useFieldArray({ control, name: "certifications" as never });
  const languagesArray = useFieldArray({ control, name: "languages" as never });

  const onSubmit = async (data: ParsedResume) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/resumes/${resumeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parsedData: data }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        toast.error(error ?? "Failed to save");
        return;
      }
      toast.success("Intelligence Asset Re-calibrated Successfully.");
      router.refresh();
    } catch {
      toast.error("Critical Save Error. Please retry.");
    } finally {
      setSaving(false);
    }
  };

  const navItems = [
    { id: "personal", label: "Identity", icon: <User className="w-4 h-4" /> },
    { id: "skills", label: "Arsenal", icon: <Code className="w-4 h-4" /> },
    { id: "experience", label: "Trajectory", icon: <Briefcase className="w-4 h-4" /> },
    { id: "education", label: "Foundation", icon: <GraduationCap className="w-4 h-4" /> },
    { id: "projects", label: "Deployments", icon: <Rocket className="w-4 h-4" /> },
    { id: "other", label: "Signals", icon: <Award className="w-4 h-4" /> },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="pb-32">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left: Sticky Sidebar Navigation */}
        <div className="lg:col-span-3">
          <div className="sticky top-[100px] space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveSection(item.id);
                  const el = document.getElementById(item.id);
                  if (el) {
                    const offset = 100;
                    const bodyRect = document.body.getBoundingClientRect().top;
                    const elementRect = el.getBoundingClientRect().top;
                    const elementPosition = elementRect - bodyRect;
                    const offsetPosition = elementPosition - offset;

                    window.scrollTo({
                      top: offsetPosition,
                      behavior: "smooth"
                    });
                  }
                }}
                className={cn(
                  "w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all group",
                  activeSection === item.id 
                    ? "bg-indigo-500/10 border border-indigo-500/20 text-white shadow-[0_0_20px_rgba(99,102,241,0.05)]" 
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    activeSection === item.id ? "text-indigo-400 bg-indigo-500/10" : "text-zinc-600 group-hover:text-zinc-400"
                  )}>
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                </div>
                {activeSection === item.id && <ChevronRight className="w-3 h-3 text-indigo-400" />}
              </button>
            ))}
          </div>
        </div>

        {/* Right: The Data Forge */}
        <div className="lg:col-span-9 space-y-20">
          
          {/* Personal Info */}
          <section id="personal" className="scroll-mt-40">
            <SectionHeader title="Personal Identity" icon={<User className="w-4 h-4 text-indigo-400" />} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-zinc-900/30 p-8 rounded-[2.5rem] border border-zinc-800/50 backdrop-blur-sm">
              <Field label="Full Name" {...register("name")} error={errors.name?.message} />
              <Field label="Email Address" {...register("email")} error={errors.email?.message} />
              <Field label="Phone Contact" {...register("phone")} error={errors.phone?.message} />
              <Field label="Location Base" {...register("location")} error={errors.location?.message} />
              <div className="md:col-span-2">
                <Field label="LinkedIn Signal" {...register("linkedin")} error={errors.linkedin?.message} />
              </div>
              <div className="md:col-span-2">
                <TextArea label="Executive Summary" {...register("summary")} error={errors.summary?.message} />
              </div>
            </div>
          </section>

          {/* Skills Arsenal */}
          <section id="skills" className="scroll-mt-40">
            <SectionHeader title="Technical Arsenal" icon={<Code className="w-4 h-4 text-emerald-400" />} />
            <div className="bg-zinc-900/30 p-8 rounded-[2.5rem] border border-zinc-800/50">
              <div className="flex flex-wrap gap-3">
                {skillsArray.fields.map((field, i) => (
                  <div
                    key={field.id}
                    className="group flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 hover:border-indigo-500/50 transition-all shadow-inner"
                  >
                    <input
                      {...register(`skills.${i}` as const)}
                      className="bg-transparent text-[10px] font-black uppercase tracking-widest text-zinc-300 outline-none w-28 focus:text-white transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => skillsArray.remove(i)}
                      className="text-zinc-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => skillsArray.append("" as never)}
                  className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400 hover:text-indigo-300 px-4 py-2 border border-dashed border-indigo-500/30 rounded-xl hover:bg-indigo-500/5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Node
                </button>
              </div>
            </div>
          </section>

          {/* Experience Trajectory */}
          <section id="experience" className="scroll-mt-40">
            <SectionHeader title="Professional Trajectory" icon={<Briefcase className="w-4 h-4 text-amber-400" />} />
            <div className="space-y-6">
              {experienceArray.fields.map((field, i) => (
                <div key={field.id} className="group relative bg-zinc-900/30 border border-zinc-800/50 rounded-[2rem] p-8 hover:border-zinc-700/50 transition-all">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-500">
                        0{i + 1}
                      </div>
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Experience Node</span>
                    </div>
                    <button type="button" onClick={() => experienceArray.remove(i)} className="p-2 text-zinc-600 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="Company / Entity" {...register(`experience.${i}.company`)} />
                    <Field label="Role / Designation" {...register(`experience.${i}.role`)} />
                    <Field label="Start Cycle" {...register(`experience.${i}.startDate`)} />
                    <Field label="End Cycle" {...register(`experience.${i}.endDate`)} />
                    <div className="md:col-span-2">
                      <TextArea label="Mission Achievements" {...register(`experience.${i}.description`)} />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => experienceArray.append({ company: "", role: "", startDate: "", endDate: "", description: "" })}
                className="w-full flex items-center justify-center gap-3 py-6 border-2 border-dashed border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900/20 rounded-[2rem] transition-all group"
              >
                <Plus className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 group-hover:text-white">Initialize New Experience Node</span>
              </button>
            </div>
          </section>

          {/* Education Foundation */}
          <section id="education" className="scroll-mt-40">
            <SectionHeader title="Academic Foundation" icon={<GraduationCap className="w-4 h-4 text-purple-400" />} />
            <div className="space-y-6">
              {educationArray.fields.map((field, i) => (
                <div key={field.id} className="bg-zinc-900/30 border border-zinc-800/50 rounded-[2rem] p-8">
                  <div className="flex justify-between items-center mb-8">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Academic Node 0{i + 1}</span>
                    <button type="button" onClick={() => educationArray.remove(i)} className="text-zinc-600 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="Institution" {...register(`education.${i}.institution`)} />
                    <Field label="Degree / Focus" {...register(`education.${i}.degree`)} />
                    <Field label="Start" {...register(`education.${i}.startDate`)} />
                    <Field label="End" {...register(`education.${i}.endDate`)} />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => educationArray.append({ institution: "", degree: "", startDate: "", endDate: "" })}
                className="w-full flex items-center justify-center gap-3 py-6 border-2 border-dashed border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900/20 rounded-[2rem] transition-all text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white"
              >
                <Plus className="w-5 h-5" /> Initialize Academic Node
              </button>
            </div>
          </section>

          {/* Projects */}
          <section id="projects" className="scroll-mt-40">
            <SectionHeader title="Strategic Deployments" icon={<Rocket className="w-4 h-4 text-blue-400" />} />
            <div className="space-y-6">
              {projectsArray.fields.map((field, i) => (
                <div key={field.id} className="bg-zinc-900/30 border border-zinc-800/50 rounded-[2.5rem] p-8">
                  <div className="flex justify-between items-center mb-8">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Project 0{i + 1}</span>
                    <button type="button" onClick={() => projectsArray.remove(i)} className="text-zinc-600 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-6">
                    <Field label="Project Name" {...register(`projects.${i}.name`)} />
                    <TextArea label="Overview" {...register(`projects.${i}.description`)} />
                    <Field label="External Link" {...register(`projects.${i}.link`)} />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => projectsArray.append({ name: "", description: "", technologies: [], link: "" })}
                className="w-full flex items-center justify-center gap-3 py-6 border-2 border-dashed border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900/20 rounded-[2rem] transition-all text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white"
              >
                <Plus className="w-5 h-5" /> Initialize Deployment
              </button>
            </div>
          </section>

          {/* Signals: Certs & Languages */}
          <section id="other" className="scroll-mt-40">
            <SectionHeader title="Auxiliary Signals" icon={<Award className="w-4 h-4 text-indigo-400" />} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="bg-zinc-900/30 p-8 rounded-[2rem] border border-zinc-800/50">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
                  <Award className="w-3.5 h-3.5" /> Certifications
                </p>
                <SimpleArrayEditor fieldArray={certificationsArray} register={register} name="certifications" label="Certification Node" />
              </div>
              <div className="bg-zinc-900/30 p-8 rounded-[2rem] border border-zinc-800/50">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
                  <Languages className="w-3.5 h-3.5" /> Languages
                </p>
                <SimpleArrayEditor fieldArray={languagesArray} register={register} name="languages" label="Language Node" />
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* The Floating Command Dock */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-lg px-6">
        <div className="bg-zinc-900/80 backdrop-blur-2xl border border-white/10 p-3 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 pl-4">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest leading-none">Draft Mode</span>
              <span className="text-[10px] font-bold text-white tracking-tight">Unsaved Calibrations</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className={cn(
              "flex items-center gap-3 bg-white text-zinc-950 px-8 py-3 rounded-2xl transition-all font-black text-[10px] uppercase tracking-[0.15em] hover:bg-zinc-200 active:scale-95 shadow-xl disabled:opacity-50",
              saving && "animate-pulse"
            )}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Syncing..." : "Commit Intelligence"}
          </button>
        </div>
      </div>
    </form>
  );
}

function SectionHeader({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-10 border-b border-zinc-800 pb-6">
      <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-black text-white tracking-tighter uppercase">{title}</h3>
    </div>
  );
}

const Field = ({ label, error, ...props }: { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="space-y-2">
    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">{label}</span>
    <input
      {...props}
      className="w-full bg-zinc-950/50 border border-zinc-800/80 rounded-xl px-4 py-3.5 text-sm font-medium text-white placeholder-zinc-700 outline-none focus:border-indigo-500/50 focus:bg-zinc-950 transition-all shadow-inner"
    />
    {error && <span className="text-[10px] font-bold text-red-500 ml-1">{error}</span>}
  </div>
);

const TextArea = ({ label, error, ...props }: { label: string; error?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <div className="space-y-2">
    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">{label}</span>
    <textarea
      {...props}
      rows={4}
      className="w-full bg-zinc-950/50 border border-zinc-800/80 rounded-xl px-4 py-3.5 text-sm font-medium text-white placeholder-zinc-700 outline-none focus:border-indigo-500/50 focus:bg-zinc-950 transition-all shadow-inner resize-none"
    />
    {error && <span className="text-[10px] font-bold text-red-500 ml-1">{error}</span>}
  </div>
);

function SimpleArrayEditor({ fieldArray, register, name, label }: any) {
  return (
    <div className="space-y-3">
      {fieldArray.fields.map((field: any, i: number) => (
        <div key={field.id} className="flex gap-2 group">
          <input
            {...register(`${name}.${i}` as never)}
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs font-bold text-zinc-300 focus:text-white focus:border-indigo-500/50 outline-none transition-all shadow-inner"
          />
          <button
            type="button"
            onClick={() => fieldArray.remove(i)}
            className="p-3 text-zinc-700 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => fieldArray.append("" as never)}
        className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400 hover:text-indigo-300 transition-colors p-2"
      >
        <Plus className="w-3.5 h-3.5" /> Add Node
      </button>
    </div>
  );
}

function Loader2(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2v4" />
      <path d="m16.2 7.8 2.9-2.9" />
      <path d="M18 12h4" />
      <path d="m16.2 16.2 2.9 2.9" />
      <path d="M12 18v4" />
      <path d="m4.9 19.1 2.9-2.9" />
      <path d="M2 12h4" />
      <path d="m4.9 4.9 2.9 2.9" />
    </svg>
  );
}
