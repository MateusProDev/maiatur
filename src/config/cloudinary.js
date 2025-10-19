/**
 * Cloudinary Configuration
 * Centralized configuration for all Cloudinary operations
 */

export const CLOUDINARY_CONFIG = {
  cloudName: 'dqejvdl8w',
  uploadPreset: 'maiatur',
  apiUrl: 'https://api.cloudinary.com/v1_1/dqejvdl8w/image/upload'
};

/**
 * Upload an image to Cloudinary
 * @param {File} file - The image file to upload
 * @param {string} folder - Optional folder name in Cloudinary
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
export const uploadToCloudinary = async (file, folder = '') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  
  if (folder) {
    formData.append('folder', folder);
  }

  const response = await fetch(CLOUDINARY_CONFIG.apiUrl, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error('Erro ao fazer upload da imagem');
  }

  const data = await response.json();
  return data.secure_url;
};

export default CLOUDINARY_CONFIG;
