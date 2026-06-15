import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

const UPLOAD_TIMEOUT = 30000;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

export const deleteFromCloudinary = async (publicId) => {
    try {
      if (!publicId) return null;
  
      const result = await cloudinary.uploader.destroy(publicId);
  
      return result;
    } catch (error) {
      console.error("Cloudinary delete failed:", error);
      return null;
    }
};

export const uploadOnCloudinary = (buffer, folder = "uploads") => {
  return new Promise((resolve, reject) => {
    if (!buffer || !Buffer.isBuffer(buffer)) {
      return reject(new Error("Invalid buffer"));
    }

    if (buffer.length === 0) {
      return reject(new Error("Buffer is empty"));
    }

    if (buffer.length > 10 * 1024 * 1024) {
      return reject(new Error("File too large"));
    }

    let isSettled = false;

    const readStream = streamifier.createReadStream(buffer);

    const timeout = setTimeout(() => {
      if (isSettled) return;
      isSettled = true;
      readStream.destroy();
      reject(new Error("Upload timed out"));
    }, UPLOAD_TIMEOUT);

    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "auto", folder },
      (error, result) => {
        if (isSettled) return;
        isSettled = true;
        clearTimeout(timeout);

        if (error) return reject(error);
        resolve(result);
      }
    );

    readStream.on("error", reject);
    stream.on("error", reject);

    readStream.pipe(stream);
  });
};