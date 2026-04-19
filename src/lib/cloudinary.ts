import { v2 as cloudinary } from "cloudinary";
import { z } from "zod";
import { env } from "@/env";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

const UploadResultSchema = z.object({
  secure_url: z.url(),
  public_id: z.string(),
  bytes: z.number(),
  format: z.string().optional(),
  resource_type: z.string(),
});

export type UploadResult = z.infer<typeof UploadResultSchema>;

export async function uploadResumeFile(
  buffer: Buffer,
  userId: string,
  filename: string
): Promise<UploadResult> {
  const raw = await new Promise<unknown>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: `resumes/${userId}`,
          resource_type: "raw",
          public_id: `${Date.now()}-${filename.replace(/\.[^/.]+$/, "")}`,
          use_filename: true,
          unique_filename: false,
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error("Empty Cloudinary response"));
          resolve(result);
        }
      )
      .end(buffer);
  });

  return UploadResultSchema.parse(raw);
}
