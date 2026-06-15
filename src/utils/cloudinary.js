import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

const UPLOAD_TIMEOUT = 30000;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
console.log(process.env.CLOUD_NAME);
console.log(process.env.CLOUDINARY_API_KEY);
console.log(process.env.CLOUDINARY_API_SECRET);

export const uploadOnCloudinary = (buffer, folder = "uploads") => {
  return new Promise((resolve, reject) => {
    // Input validation
    if (!buffer || !Buffer.isBuffer(buffer)) {
      console.log("R")
      return reject(new Error("Invalid buffer"));
    }
     console.log("O")
    if (buffer.length === 0) {
      console.log("H")
      return reject(new Error("Buffer is empty"));
    }
     console.log("H")
    if (buffer.length > 10 * 1024 * 1024) {
      console.log("bufferlength")
      return reject(new Error("File too large"));
    }
    console.log("A")
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
    console.log("rohail")
    const timeout = setTimeout(() => {
      console.log("I")
      safeReject(new Error("Upload timed out"));
      readStream.destroy();
    }, UPLOAD_TIMEOUT);
    console.log("Before upload_stream");

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
    
    console.log("After upload_stream");
    
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
    
    console.log("Pipe initiated");
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