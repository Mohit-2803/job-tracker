"use client";

import { useEffect } from "react";
import { X, Download, Loader2, FileText } from "lucide-react";

type Props = {
  applicationId: string;
  open: boolean;
  onClose: () => void;
};

export function PdfPreviewModal({ applicationId, open, onClose }: Props) {
  // Lock body scroll while the modal is open. Restore on close/unmount so we
  // don't leave the page in a stuck state if the modal unmounts mid-transition.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Esc closes — standard modal expectation.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const previewUrl = `/api/applications/${applicationId}/tailor/pdf?inline=true`;
  const downloadUrl = `/api/applications/${applicationId}/tailor/pdf?inline=false`;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 pointer-events-none">
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)] w-full max-w-5xl h-[90vh] flex flex-col pointer-events-auto overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <FileText className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-sm text-white tracking-widest uppercase">
                  Resume Preview
                </h2>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Generated from your saved decisions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Plain anchor — browser handles the download via the route's
                  Content-Disposition: attachment header. No JS fetch needed. */}
              <a
                href={downloadUrl}
                className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(99,102,241,0.25)]"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </a>
              <button
                type="button"
                onClick={onClose}
                className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-all"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Iframe preview */}
          <div className="flex-1 relative bg-zinc-900">
            {/* Loading state shown until the iframe finishes loading. We don't
                explicitly wire onLoad/onError — the iframe's white background
                naturally hides this once content arrives. */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 pointer-events-none">
              <Loader2 className="w-6 h-6 animate-spin mb-3 text-indigo-400" />
              <p className="text-[10px] font-bold uppercase tracking-widest">
                Rendering PDF…
              </p>
            </div>
            <iframe
              key={previewUrl}
              src={previewUrl}
              className="w-full h-full relative bg-white"
              title="Resume PDF preview"
            />
          </div>
        </div>
      </div>
    </>
  );
}
