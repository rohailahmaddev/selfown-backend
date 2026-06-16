import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

const UPLOAD_TIMEOUT = 30000;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});
console.log(process.env.CLOUD_NAME);
console.log(process.env.CLOUDINARY_API_KEY);
console.log(process.env.CLOUDINARY_SECRET_KEY);

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
        console.log("Callback reached");
    
        if (error) {
          console.log("Cloudinary Error:", error);
          return safeReject(error);
        }
    
        console.log("Cloudinary Success:", result);
        safeResolve(result);
      }
    );
    
    stream.on("error", (err) => {
      console.log("Stream Error:", err);
      safeReject(err);
    });
    
    readStream.on("error", (err) => {
      console.log("Read Stream Error:", err);
      safeReject(err);
    });
    
    readStream.on("end", () => {
      console.log("Read Stream Ended");
    });
    
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