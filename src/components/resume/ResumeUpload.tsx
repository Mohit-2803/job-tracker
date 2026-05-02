"use client";

import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadCloud, FileText, Loader2, Sparkles, Plus, Zap, ShieldCheck, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
};

const MAX_SIZE_MB = 5;

export default function ResumeUpload() {
  const [uploading, setUploading] = useState(false);
  const [parsingStep, setParsingStep] = useState(0);
  const router = useRouter();

  const steps = [
    { label: "Establishing Uplink", icon: <UploadCloud className="w-4 h-4" /> },
    { label: "Initializing Neural Engine", icon: <Zap className="w-4 h-4" /> },
    { label: "Parsing Architecture", icon: <FileText className="w-4 h-4" /> },
    { label: "Extracting Skill Nodes", icon: <Sparkles className="w-4 h-4" /> },
    { label: "Verifying Intelligence", icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  useEffect(() => {
    if (!uploading) {
      setParsingStep(0);
      return;
    }

    const delays = [1200, 1500, 2200, 1800]; // Varied delays for more realistic momentum
    
    const advanceStep = (currentIdx: number) => {
      if (currentIdx < steps.length - 1) {
        const timer = setTimeout(() => {
          setParsingStep(currentIdx + 1);
          advanceStep(currentIdx + 1);
        }, delays[currentIdx] || 1500);
        return timer;
      }
    };

    const timer = advanceStep(0);
    return () => clearTimeout(timer);
  }, [uploading]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/resumes/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Upload failed");
        setUploading(false);
        return;
      }

      // Slightly delay redirect to show final step
      setTimeout(() => {
        toast.success("Intelligence Asset Ingested Successfully.");
        router.push(`/dashboard/resumes/${data.resume.id}`);
      }, 1000);
    } catch {
      toast.error("Critical Ingestion Error. Please retry.");
      setUploading(false);
    }
  }, [router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    maxSize: MAX_SIZE_MB * 1024 * 1024,
    onDropRejected: (fileRejections) => {
      const error = fileRejections[0]?.errors[0];
      if (error?.code === "file-too-large") {
        toast.error(`File too large. Max size is ${MAX_SIZE_MB}MB.`);
      } else if (error?.code === "file-invalid-type") {
        toast.error("Only PDF and DOCX files are accepted.");
      } else {
        toast.error("File rejected. Please try again.");
      }
    },
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative group min-h-[400px] flex items-center justify-center border-2 border-dashed rounded-[2.5rem] p-10 text-center cursor-pointer transition-all duration-700 overflow-hidden",
        isDragActive 
          ? "border-indigo-500 bg-indigo-500/5 shadow-[0_0_80px_rgba(99,102,241,0.15)] scale-[1.02]" 
          : "border-zinc-800 bg-zinc-900/40 backdrop-blur-xl hover:border-zinc-600 hover:bg-zinc-900/60 shadow-2xl",
        uploading && "cursor-default border-indigo-500/30"
      )}
    >
      <input {...getInputProps()} />
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-60 h-60 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-1000" />

      <div className="relative flex flex-col items-center gap-6 z-10 w-full max-w-xs">
        {uploading ? (
          <div className="w-full space-y-8 animate-in fade-in duration-500">
            <div className="space-y-2">
              <p className="text-base font-black uppercase tracking-[0.2em] text-white">Neural Processing</p>
              <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                  style={{ width: `${((parsingStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-3 text-left">
              {steps.map((step, idx) => (
                <div 
                  key={idx}
                  className={cn(
                    "flex items-center gap-3 transition-all duration-500",
                    idx === parsingStep ? "opacity-100 scale-100 translate-x-2" : 
                    idx < parsingStep ? "opacity-50 scale-95" : "opacity-20 scale-90"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-lg border flex items-center justify-center transition-colors",
                    idx === parsingStep ? "border-indigo-500 text-indigo-400 bg-indigo-500/10" :
                    idx < parsingStep ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" :
                    "border-zinc-800 text-zinc-600"
                  )}>
                    {idx < parsingStep ? <CheckCircle2 className="w-3 h-3" /> : 
                     idx === parsingStep ? <Loader2 className="w-3 h-3 animate-spin" /> : 
                     step.icon}
                  </div>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    idx === parsingStep ? "text-white" : 
                    idx < parsingStep ? "text-emerald-500" : "text-zinc-600"
                  )}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : isDragActive ? (
          <div className="space-y-4 animate-in zoom-in duration-300">
            <div className="w-20 h-20 rounded-3xl bg-indigo-500/20 border-2 border-indigo-500/50 flex items-center justify-center text-indigo-400 shadow-[0_0_40px_rgba(99,102,241,0.3)]">
              <Plus className="w-10 h-10" />
            </div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-indigo-400">Lock for Analysis</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="w-20 h-20 mx-auto relative group-hover:scale-110 transition-transform duration-500">
              <div className="absolute inset-0 bg-indigo-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-20 h-20 rounded-[2rem] bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:border-indigo-500/50 group-hover:text-indigo-400 transition-all duration-500">
                <UploadCloud className="w-10 h-10" />
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="text-base font-black uppercase tracking-[0.1em] text-zinc-300 max-w-[200px] mx-auto leading-relaxed">
                Ingest New <span className="text-indigo-400">Intelligence</span> Asset
              </p>
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">
                Drop file or <span className="text-zinc-400">click to browse</span>
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-4 border-t border-zinc-800/50">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
                <FileText className="w-3 h-3 text-zinc-500" />
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">PDF / DOCX</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">AI Ready</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
