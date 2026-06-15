import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

const UPLOAD_TIMEOUT = 30000;

export const uploadOnCloudinary = (buffer, folder = "uploads") => {
  return new Promise((resolve, reject) => {
    // Input validation
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

    const safeResolve = (result) => {
      if (isSettled) return;
      isSettled = true;
      clearTimeout(timeout);
      resolve(result);
    };

    const safeReject = (error) => {
      if (isSettled) return;
      isSettled = true;
      clearTimeout(timeout);
      reject(error);
    };

    const readStream = streamifier.createReadStream(buffer);

    const timeout = setTimeout(() => {
      safeReject(new Error("Upload timed out"));
      readStream.destroy();
    }, UPLOAD_TIMEOUT);

    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "auto", folder },
      (error, result) => {
        if (error) return safeReject(error);
        safeResolve(result);
      }
    );

    // Handle errors from BOTH streams
    stream.on("error", safeReject);
    readStream.on("error", safeReject);
    
    readStream.pipe(stream);
  });
};

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