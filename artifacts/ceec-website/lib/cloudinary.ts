import { v2 as cloudinary } from "cloudinary";

function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  return cloudinary;
}

export async function uploadImageToCloudinary(buffer: Buffer, mimetype: string): Promise<string> {
  const cld = configureCloudinary();
  return new Promise((resolve, reject) => {
    const stream = cld.uploader.upload_stream(
      { resource_type: "image", folder: "ceec/images" },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Upload failed"));
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

export async function uploadVideoToCloudinary(buffer: Buffer, mimetype: string): Promise<string> {
  const cld = configureCloudinary();
  return new Promise((resolve, reject) => {
    const stream = cld.uploader.upload_stream(
      { resource_type: "video", folder: "ceec/videos" },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Upload failed"));
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}
