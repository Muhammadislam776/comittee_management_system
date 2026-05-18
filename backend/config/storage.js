const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Multer memory storage allows us to inspect buffer and upload to Cloudinary OR write locally
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Configure Cloudinary if credentials exist
const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('Cloudinary storage engine configured successfully.');
} else {
  console.log('Cloudinary credentials missing. Falling back to local disk uploads.');
}

/**
 * Uploads file buffer. Either to Cloudinary or writes locally to server uploads folder.
 * Returns { url: String, fileName: String }
 */
const uploadFile = async (file) => {
  const fileExt = path.extname(file.originalname);
  const cleanName = path.basename(file.originalname, fileExt).replace(/[^a-zA-Z0-9]/g, '_');
  const uniqueName = `${cleanName}_${Date.now()}${fileExt}`;

  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          public_id: path.basename(uniqueName, fileExt),
          folder: 'committee_documents'
        },
        (error, result) => {
          if (error) return reject(error);
          resolve({
            url: result.secure_url,
            fileName: file.originalname
          });
        }
      );
      uploadStream.end(file.buffer);
    });
  } else {
    // Local File fallback
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, uniqueName);
    fs.writeFileSync(filePath, file.buffer);

    // Return relative URL for static hosting
    const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
    return {
      url: `${serverUrl}/uploads/${uniqueName}`,
      fileName: file.originalname
    };
  }
};

module.exports = {
  upload,
  uploadFile
};
