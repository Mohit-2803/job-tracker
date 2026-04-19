"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Save } from "lucide-react";
import { ResumeSchema, type ParsedResume } from "@/lib/ai/schema";

type Props = {
  resumeId: string;
  initialData: ParsedResume;
};

export default function ResumeEditForm({ resumeId, initialData }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const { register, control, handleSubmit, formState: { errors } } = useForm<ParsedResume>({
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
      toast.success("Resume saved");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Personal Info */}
      <Section title="Personal Information">
        <Field label="Name" {...register("name")} error={errors.name?.message} />
        <Field label="Email" {...register("email")} error={errors.email?.message} />
        <Field label="Phone" {...register("phone")} error={errors.phone?.message} />
        <Field label="Location" {...register("location")} error={errors.location?.message} />
        <Field label="LinkedIn" {...register("linkedin")} error={errors.linkedin?.message} />
        <TextArea label="Summary" {...register("summary")} error={errors.summary?.message} />
      </Section>

      {/* Skills */}
      <Section title="Skills">
        <div className="flex flex-wrap gap-2">
          {skillsArray.fields.map((field, i) => (
            <div key={field.id} className="flex items-center gap-1 bg-gray-100 rounded-full pl-3 pr-1 py-1">
              <input
                {...register(`skills.${i}` as const)}
                className="bg-transparent text-sm outline-none min-w-0 w-32"
              />
              <button type="button" onClick={() => skillsArray.remove(i)} className="p-1 hover:bg-gray-200 rounded-full">
                <Trash2 className="w-3 h-3 text-gray-500" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => skillsArray.append("" as never)}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 px-2 py-1"
          >
            <Plus className="w-4 h-4" /> Add skill
          </button>
        </div>
      </Section>

      {/* Experience */}
      <Section title="Experience">
        <div className="space-y-4">
          {experienceArray.fields.map((field, i) => (
            <div key={field.id} className="border rounded-lg p-4 space-y-2 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-500">Experience {i + 1}</span>
                <button type="button" onClick={() => experienceArray.remove(i)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <Field label="Company" {...register(`experience.${i}.company`)} />
              <Field label="Role" {...register(`experience.${i}.role`)} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start Date" {...register(`experience.${i}.startDate`)} />
                <Field label="End Date" {...register(`experience.${i}.endDate`)} />
              </div>
              <TextArea label="Description" {...register(`experience.${i}.description`)} />
            </div>
          ))}
          <button
            type="button"
            onClick={() => experienceArray.append({ company: "", role: "", startDate: "", endDate: "", description: "" })}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4" /> Add experience
          </button>
        </div>
      </Section>

      {/* Education */}
      <Section title="Education">
        <div className="space-y-4">
          {educationArray.fields.map((field, i) => (
            <div key={field.id} className="border rounded-lg p-4 space-y-2 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-500">Education {i + 1}</span>
                <button type="button" onClick={() => educationArray.remove(i)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <Field label="Institution" {...register(`education.${i}.institution`)} />
              <Field label="Degree" {...register(`education.${i}.degree`)} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start Date" {...register(`education.${i}.startDate`)} />
                <Field label="End Date" {...register(`education.${i}.endDate`)} />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => educationArray.append({ institution: "", degree: "", startDate: "", endDate: "" })}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4" /> Add education
          </button>
        </div>
      </Section>

      {/* Projects */}
      <Section title="Projects">
        <div className="space-y-4">
          {projectsArray.fields.map((field, i) => (
            <div key={field.id} className="border rounded-lg p-4 space-y-2 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-500">Project {i + 1}</span>
                <button type="button" onClick={() => projectsArray.remove(i)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <Field label="Name" {...register(`projects.${i}.name`)} />
              <TextArea label="Description" {...register(`projects.${i}.description`)} />
              <Field label="Link" {...register(`projects.${i}.link`)} />
            </div>
          ))}
          <button
            type="button"
            onClick={() => projectsArray.append({ name: "", description: "", technologies: [], link: "" })}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4" /> Add project
          </button>
        </div>
      </Section>

      {/* Certifications & Languages */}
      <Section title="Certifications">
        <SimpleArrayEditor fieldArray={certificationsArray} register={register} name="certifications" label="certification" />
      </Section>

      <Section title="Languages">
        <SimpleArrayEditor fieldArray={languagesArray} register={register} name="languages" label="language" />
      </Section>

      {/* Submit */}
      <div className="sticky bottom-0 bg-white border-t py-4 -mx-6 px-6 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">{title}</h3>
      {children}
    </div>
  );
}

function Field({
  label,
  error,
  ...props
}: { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input
        {...props}
        className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
    </label>
  );
}

function TextArea({
  label,
  error,
  ...props
}: { label: string; error?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <textarea
        {...props}
        rows={3}
        className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
    </label>
  );
}

type SimpleArrayProps = {
  fieldArray: ReturnType<typeof useFieldArray>;
  register: ReturnType<typeof useForm>["register"];
  name: string;
  label: string;
};

function SimpleArrayEditor({ fieldArray, register, name, label }: SimpleArrayProps) {
  return (
    <div className="space-y-2">
      {fieldArray.fields.map((field, i) => (
        <div key={field.id} className="flex gap-2">
          <input
            {...register(`${name}.${i}` as never)}
            className="flex-1 rounded-md border-gray-300 border px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => fieldArray.remove(i)}
            className="text-red-500 hover:text-red-700 p-2"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => fieldArray.append("" as never)}
        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
      >
        <Plus className="w-4 h-4" /> Add {label}
      </button>
    </div>
  );
}
