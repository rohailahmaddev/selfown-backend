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

const uploadOnCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "blogs" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

export {uploadOnCloudinary}