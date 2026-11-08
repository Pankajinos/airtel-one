const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary if credentials exist
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
  console.log('[Storage] Cloudinary configured with cloud:', process.env.CLOUDINARY_CLOUD_NAME);
} else {
  console.log('[Storage] Cloudinary credentials not fully set; using local upload storage as primary fallback.');
}

async function uploadFile(fileBuffer, originalname, mimetype) {
  const isCloudinaryActive = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

  if (isCloudinaryActive) {
    try {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'udyam_digital_kyc',
            resource_type: 'auto'
          },
          (error, res) => {
            if (error) return reject(error);
            resolve(res);
          }
        );
        stream.end(fileBuffer);
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        storageType: 'cloudinary',
        filename: originalname,
        size: result.bytes || fileBuffer.length
      };
    } catch (err) {
      console.warn('[Storage] Cloudinary upload error:', err.message, '- falling back to local storage.');
    }
  }

  // Local storage fallback
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const cleanName = `${Date.now()}_${originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const filePath = path.join(uploadsDir, cleanName);
  fs.writeFileSync(filePath, fileBuffer);

  return {
    url: `/uploads/${cleanName}`,
    localPath: filePath,
    storageType: 'local',
    filename: originalname,
    size: fileBuffer.length
  };
}

module.exports = {
  uploadFile
};
