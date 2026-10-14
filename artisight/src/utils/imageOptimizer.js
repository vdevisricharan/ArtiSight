/**
 * Client-side image pre-processing and optimization for ArtiSight 2.0.
 * Safely scales oversized photographs while preserving visual fidelity
 * for accurate AI critique and OpenCV edge analysis.
 */

const MAX_DIMENSION = 2048; // Maximum width or height for analysis
const QUALITY = 0.90; // High JPEG quality to preserve detail, texture, and noise

/**
 * Optimizes an uploaded image file on the client before network upload.
 * If the image is smaller than MAX_DIMENSION, it returns the original file.
 * Otherwise, it scales it using HTML5 Canvas with bicubic interpolation.
 *
 * @param {File} file - Original user-selected file
 * @returns {Promise<{file: File, originalSize: number, optimizedSize: number, width: number, height: number, wasOptimized: boolean}>}
 */
export async function optimizeImage(file) {
  return new Promise((resolve, reject) => {
    // Only optimize JPEG, PNG, or WebP
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      resolve({
        file,
        originalSize: file.size,
        optimizedSize: file.size,
        width: 0,
        height: 0,
        wasOptimized: false,
      });
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const { width, height } = img;

      // If dimensions are within the analysis threshold, keep original file
      if (width <= MAX_DIMENSION && height <= MAX_DIMENSION && file.size <= 4 * 1024 * 1024) {
        resolve({
          file,
          originalSize: file.size,
          optimizedSize: file.size,
          width,
          height,
          wasOptimized: false,
        });
        return;
      }

      // Calculate constrained dimensions
      let newWidth = width;
      let newHeight = height;

      if (width > height) {
        if (width > MAX_DIMENSION) {
          newHeight = Math.round((height * MAX_DIMENSION) / width);
          newWidth = MAX_DIMENSION;
        }
      } else {
        if (height > MAX_DIMENSION) {
          newWidth = Math.round((width * MAX_DIMENSION) / height);
          newHeight = MAX_DIMENSION;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve({
          file,
          originalSize: file.size,
          optimizedSize: file.size,
          width,
          height,
          wasOptimized: false,
        });
        return;
      }

      // Enable smooth image rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      // Export as JPEG Blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({
              file,
              originalSize: file.size,
              optimizedSize: file.size,
              width,
              height,
              wasOptimized: false,
            });
            return;
          }

          const optimizedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });

          resolve({
            file: optimizedFile,
            originalSize: file.size,
            optimizedSize: optimizedFile.size,
            width: newWidth,
            height: newHeight,
            wasOptimized: true,
          });
        },
        'image/jpeg',
        QUALITY
      );
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };

    img.src = objectUrl;
  });
}
