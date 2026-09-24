/**
 * Cloudinary Configuration
 * Centralized configuration for all Cloudinary operations
 */

export const CLOUDINARY_CONFIG = {
  cloudName: 'dqejvdl8w',
  uploadPreset: 'maiatur',
  apiUrl: 'https://api.cloudinary.com/v1_1/dqejvdl8w/image/upload'
};

const createImagePublicId = (file) => {
  const originalName = file?.name?.replace(/\.[^/.]+$/, '') || 'imagem';
  const publicId = originalName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' e ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return publicId || 'imagem';
};

export const createCloudinaryUploadFormData = (file, folder = '') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('public_id', createImagePublicId(file));
  formData.append('unique_filename', 'false');

  if (folder) {
    formData.append('folder', folder);
  }

  return formData;
};

/**
 * Upload an image to Cloudinary
 * @param {File} file - The image file to upload
 * @param {string} folder - Optional folder name in Cloudinary
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
export const uploadToCloudinary = async (file, folder = '') => {
  const formData = createCloudinaryUploadFormData(file, folder);

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
