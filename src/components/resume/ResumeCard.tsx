import Link from "next/link";
import { FileText, Calendar } from "lucide-react";

type ResumeCardProps = {
  id: string;
  title: string;
  createdAt: Date;
  skillCount?: number;
};

export default function ResumeCard({ id, title, createdAt, skillCount }: ResumeCardProps) {
  return (
    <Link
      href={`/dashboard/resumes/${id}`}
      className="block border rounded-lg p-4 bg-white hover:border-gray-400 hover:shadow-sm transition"
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 rounded-md bg-blue-50 p-2">
          <FileText className="w-5 h-5 text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{title}</h3>
          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {createdAt.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            {skillCount !== undefined && (
              <span>
                {skillCount} {skillCount === 1 ? "skill" : "skills"} extracted
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
