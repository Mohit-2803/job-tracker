import ResumeUpload from "@/components/resume/ResumeUpload";

export default function ResumesPage() {
  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">My Resumes</h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload a PDF or DOCX resume to get started.
        </p>
      </div>
      <ResumeUpload />
    </div>
  );
}
