import { useState, useCallback, useRef, useEffect } from 'react';
import { CheckCircle, X, Upload, Image as ImageIcon } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { cameraImage } from '../assets';
import { useDispatch, useSelector } from 'react-redux';
import { setUploadedImage, setCritique, selectUploadedImage } from '../redux/imageSlice';
import axios from 'axios';
import PropTypes from 'prop-types';

// Constants
const VALID_FILE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;
const SUPPORTED_FORMATS = 'JPEG, PNG, WebP';

// Utility functions
const isValidFileType = (fileType) => VALID_FILE_TYPES.includes(fileType.toLowerCase());

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FilePreview = ({ file, onRemove, uploadProgress, uploaded }) => (
  <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
          <ImageIcon size={24} className="text-blue-600" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">{file.name}</p>
          <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
        </div>
      </div>
      {!uploaded && (
        <button
          onClick={onRemove}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200"
          aria-label="Remove file"
        >
          <X size={20} />
        </button>
      )}
    </div>

    {/* Enhanced Progress Bar */}
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm font-medium">
        <span className={uploaded ? 'text-green-600' : 'text-blue-600'}>
          {uploaded ? '✓ Complete' : 'Uploading...'}
        </span>
        <span className="text-gray-600">{uploadProgress}%</span>
      </div>
      <div
        className="bg-gray-200 rounded-full h-3 overflow-hidden"
        role="progressbar"
        aria-valuenow={uploadProgress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${uploaded
            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
            : 'bg-gradient-to-r from-blue-500 to-purple-500'
            }`}
          style={{ width: `${uploadProgress}%` }}
        />
      </div>
    </div>
  </div>
);

FilePreview.propTypes = {
  file: PropTypes.shape({
    name: PropTypes.string.isRequired,
    size: PropTypes.number.isRequired,
    type: PropTypes.string,
  }).isRequired,
  onRemove: PropTypes.func.isRequired,
  uploadProgress: PropTypes.number.isRequired,
  uploaded: PropTypes.bool.isRequired,
};

// Drag and Drop Zone Component
const DropZone = ({ isDragActive, onBrowseClick, children }) => (
  <div
    className={`
      border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300
      ${isDragActive
        ? 'border-blue-500 bg-blue-50/50 scale-105 shadow-lg'
        : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50/50 hover:shadow-md'
      }
    `}
  >
    <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${isDragActive ? 'bg-blue-100' : 'bg-gray-100'
      }`}>
      <Upload
        size={32}
        className={`${isDragActive ? 'text-blue-500' : 'text-gray-400'}`}
      />
    </div>
    <div className="space-y-3">
      <p className="text-xl font-semibold text-gray-800">
        {isDragActive ? 'Drop your image here' : 'Drag & drop your image here'}
      </p>
      <p className="text-gray-500">or</p>
      <button
        type="button"
        onClick={onBrowseClick}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-300"
      >
        <ImageIcon size={20} />
        Browse Files
      </button>
    </div>
    <p className="text-sm text-gray-500 mt-6">
      Supports {SUPPORTED_FORMATS} up to {MAX_FILE_SIZE_MB}MB
    </p>
    {children}
  </div>
);

DropZone.propTypes = {
  isDragActive: PropTypes.bool.isRequired,
  onBrowseClick: PropTypes.func.isRequired,
  children: PropTypes.node,
};

const Uploading = () => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploaded, setUploaded] = useState(false);
  const [fileError, setFileError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const dispatch = useDispatch();
  const uploadedImage = useSelector(selectUploadedImage);
  const navigate = useNavigate();
  const inputRef = useRef();
  const uploadIntervalRef = useRef();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (uploadIntervalRef.current) {
        clearInterval(uploadIntervalRef.current);
      }
      // Clean up object URLs to prevent memory leaks
      if (uploadedImage && uploadedImage.startsWith('blob:')) {
        URL.revokeObjectURL(uploadedImage);
      }
    };
  }, [uploadedImage]);

  // Enhanced upload simulation with more realistic progress
  const simulateFileUpload = useCallback((newFile) => {
    let progress = 0;
    setUploadProgress(0);

    // Clear any existing interval
    if (uploadIntervalRef.current) {
      clearInterval(uploadIntervalRef.current);
    }

    uploadIntervalRef.current = setInterval(() => {
      progress += Math.random() * 15; // Variable progress increments
      progress = Math.min(progress, 100);
      setUploadProgress(Math.round(progress));

      if (progress >= 100) {
        clearInterval(uploadIntervalRef.current);
        setUploaded(true);
        const imageSrc = URL.createObjectURL(newFile);
        dispatch(setUploadedImage(imageSrc));
      }
    }, 200);
  }, [dispatch]);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragActive(true);
    }
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFile = e.dataTransfer.files[0];

      // Validate file type
      if (!isValidFileType(newFile.type)) {
        setFileError(`Unsupported file format. Please upload ${SUPPORTED_FORMATS} images.`);
        return;
      }

      // Validate file size
      if (newFile.size > MAX_FILE_SIZE) {
        setFileError(`File is too large (${formatFileSize(newFile.size)}). Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
        return;
      }

      // Check if file is actually an image by trying to create an image object
      const img = new Image();
      const objectUrl = URL.createObjectURL(newFile);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        setFile(newFile);
        simulateFileUpload(newFile);
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        setFileError('Invalid image file. Please select a valid image.');
      };

      img.src = objectUrl;
    }
  }, [simulateFileUpload]);

  // Validate and set file helper
  const validateAndSetFile = useCallback((newFile) => {
    // Validate file type
    if (!isValidFileType(newFile.type)) {
      setFileError(`Unsupported file format. Please upload ${SUPPORTED_FORMATS} images.`);
      return;
    }

    // Validate file size
    if (newFile.size > MAX_FILE_SIZE) {
      setFileError(`File is too large (${formatFileSize(newFile.size)}). Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    // Check if file is actually an image by trying to create an image object
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(newFile);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      setFile(newFile);
      simulateFileUpload(newFile);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setFileError('Invalid image file. Please select a valid image.');
    };

    img.src = objectUrl;
  }, [simulateFileUpload]);

  // File input change handler
  const handleFileChange = useCallback((e) => {
    const newFile = e.target.files[0];
    if (newFile) {
      validateAndSetFile(newFile);
    }
  }, [validateAndSetFile]);

  // Remove file handler
  const handleRemoveFile = useCallback(() => {
    setFile(null);
    setUploaded(false);
    setUploadProgress(0);
    setFileError('');
    if (uploadIntervalRef.current) {
      clearInterval(uploadIntervalRef.current);
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    // Clean up the object URL
    if (uploadedImage && uploadedImage.startsWith('blob:')) {
      URL.revokeObjectURL(uploadedImage);
      dispatch(setUploadedImage(null));
    }
  }, [uploadedImage, dispatch]);

  // Enhanced form submit with better error handling
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!file) {
      setFileError('Please select a file to upload.');
      return;
    }

    if (!uploaded) {
      setFileError('Please wait for the file to finish uploading.');
      return;
    }

    setIsGenerating(true);
    setFileError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // 60 second timeout
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log('Upload progress:', percentCompleted);
          },
        }
      );

      // Updated to match new API response structure
      const { critique } = response.data;
      if (!critique) {
        throw new Error('No critique received from server');
      }

      dispatch(setCritique(critique));
      navigate('/feedback');
    } catch (error) {
      let errorMessage = 'Failed to upload image. Please try again.';

      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please try again with a smaller image.';
      } else if (error.response?.status === 413) {
        errorMessage = 'File is too large for the server. Please try a smaller image.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setFileError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [file, uploaded, dispatch, navigate]);

  // Browse button click handler
  const handleBrowseClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className='flex flex-col lg:flex-row items-start justify-center p-8 lg:px-20 max-w-7xl mx-auto gap-12'>
          {/* Image Preview Section */}
          <div className='flex flex-col items-center lg:items-start justify-start w-full lg:w-1/2'>
            <div className="text-center lg:text-left mb-8">
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-gray-800 via-gray-900 to-blue-800 bg-clip-text text-transparent">
                Your Vision
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto lg:mx-0 mb-8"></div>
            </div>

            <div className="max-w-md relative group">
              {uploaded && uploadedImage ? (
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                  <div className="relative bg-white p-4 rounded-3xl shadow-2xl">
                    <img
                      src={uploadedImage}
                      alt="Uploaded preview"
                      className="rounded-2xl max-w-full h-auto shadow-lg transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                    <div className="absolute top-6 right-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-2 shadow-lg">
                      <CheckCircle size={24} color="white" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-gray-200/50 to-gray-300/50 rounded-3xl blur-lg"></div>
                  <div className="relative bg-white p-4 rounded-3xl shadow-xl opacity-75">
                    <img
                      src={cameraImage}
                      alt="Upload illustration"
                      className="rounded-2xl max-w-full h-auto"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Upload Form Section */}
          <div className='flex flex-col items-center lg:items-start justify-start w-full lg:w-1/2'>
            <div className="text-center lg:text-left mb-8">
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-gray-800 via-gray-900 to-blue-800 bg-clip-text text-transparent">
                AI Analysis
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto lg:mx-0"></div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200/50 p-8">
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Get Instant AI Critique
              </h1>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                Upload your photograph and receive detailed feedback with resources to improve your skills
              </p>

              <form
                onSubmit={handleSubmit}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className="space-y-6"
              >
                <input
                  ref={inputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept={VALID_FILE_TYPES.join(',')}
                  aria-label="Upload image file"
                />

                {!file ? (
                  <DropZone
                    isDragActive={isDragActive}
                    onBrowseClick={handleBrowseClick}
                  />
                ) : (
                  <FilePreview
                    file={file}
                    onRemove={handleRemoveFile}
                    uploadProgress={uploadProgress}
                    uploaded={uploaded}
                  />
                )}

                {/* Error Message */}
                {fileError && (
                  <div className="p-6 bg-gradient-to-br from-red-50 to-pink-50 border border-red-200/50 rounded-2xl backdrop-blur-sm">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <p className="text-red-600 font-medium" role="alert">
                        {fileError}
                      </p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!uploaded || isGenerating}
                  className={`
    w-full py-4 px-8 rounded-full font-semibold text-lg transition-all duration-300
    focus:outline-none focus:ring-4 focus:ring-purple-300 transform hover:scale-105
    ${uploaded && !isGenerating
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }
  `}
                  aria-busy={isGenerating}
                >
                  <div className="flex items-center justify-center space-x-3">
                    {isGenerating && (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    )}
                    <span>
                      {isGenerating ? 'Analyzing Image...' : 'Get AI Critique'}
                    </span>
                    {!isGenerating && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )}
                  </div>
                </button>

                {/* Help Text */}
                {uploaded && (
                  <div className="text-center p-4 bg-green-50/50 rounded-xl border border-green-200/50">
                    <p className="text-green-700 font-medium">
                      ✨ Your image is ready for AI analysis. Click the button above to get started.
                    </p>
                  </div>
                )}
              </form>
            </div>
          </div>
      </div>
    </div>
  );
};

export default Uploading;