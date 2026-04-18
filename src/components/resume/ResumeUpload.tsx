"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadCloud, FileText, Loader2 } from "lucide-react";

const ACCEPTED_TYPES = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
};

const MAX_SIZE_MB = 5;

export default function ResumeUpload() {
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

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
        return;
      }

      toast.success("Resume uploaded. Review the extracted data.");
      router.push(`/dashboard/resumes/${data.resume.id}`);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  }, []);

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
      className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
        ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400 bg-white"}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        {uploading ? (
          <>
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-sm text-gray-600">Parsing your resume...</p>
          </>
        ) : isDragActive ? (
          <>
            <FileText className="w-10 h-10 text-blue-500" />
            <p className="text-sm text-blue-600 font-medium">Drop it here</p>
          </>
        ) : (
          <>
            <UploadCloud className="w-10 h-10 text-gray-400" />
            <p className="text-sm text-gray-600">
              Drag & drop your resume here, or{" "}
              <span className="text-blue-500 font-medium">click to browse</span>
            </p>
            <p className="text-xs text-gray-400">PDF or DOCX · Max {MAX_SIZE_MB}MB</p>
          </>
        )}
      </div>
    </div>
  );
}
