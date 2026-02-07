import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // robust resource type detection
    let resource_type = "auto";
    if (file.mimetype.startsWith('application/') && !file.mimetype.includes('pdf')) {
      // Force raw for non-PDF application files (like docs, zips) to avoid Cloudinary trying to convert them
      resource_type = "raw";
    }

    return {
      folder: "opticam/community",
      resource_type: resource_type,
      public_id: `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")}` // Clean filename
    };
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

export default upload;
