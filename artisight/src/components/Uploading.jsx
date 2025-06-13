import React, { useState, useCallback, useRef, useEffect } from 'react';
import { CheckCircle, X, Upload, Image as ImageIcon } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { cameraImage } from '../assets';
import { useDispatch, useSelector } from 'react-redux';
import { setUploadedImage, setCritique, selectUploadedImage } from '../redux/imageSlice';
import axios from 'axios';

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

// Enhanced Loading Spinner
const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

// File Preview Component
const FilePreview = ({ file, onRemove, uploadProgress, uploaded }) => (
  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 mt-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <ImageIcon size={24} className="text-primary" />
        <div>
          <p className="text-sm font-medium text-gray-900">{file.name}</p>
          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
        </div>
      </div>
      {!uploaded && (
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-red-500 transition-colors"
          aria-label="Remove file"
        >
          <X size={20} />
        </button>
      )}
    </div>
    
    {/* Progress Bar */}
    <div className="mt-3">
      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
        <span>{uploaded ? 'Complete' : 'Uploading'}</span>
        <span>{uploadProgress}%</span>
      </div>
      <div 
        className="bg-gray-200 rounded-full h-2" 
        role="progressbar" 
        aria-valuenow={uploadProgress} 
        aria-valuemin={0} 
        aria-valuemax={100}
      >
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            uploaded ? 'bg-green-500' : 'bg-primary'
          }`}
          style={{ width: `${uploadProgress}%` }}
        />
      </div>
    </div>
  </div>
);

// Drag and Drop Zone Component
const DropZone = ({ isDragActive, onBrowseClick, children }) => (
  <div 
    className={`
      border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
      ${isDragActive 
        ? 'border-primary bg-blue-50 scale-105' 
        : 'border-gray-300 hover:border-primary hover:bg-gray-50'
      }
    `}
  >
    <Upload 
      size={48} 
      className={`mx-auto mb-4 ${isDragActive ? 'text-primary' : 'text-gray-400'}`} 
    />
    <div className="space-y-2">
      <p className="text-lg font-medium text-gray-700">
        {isDragActive ? 'Drop your image here' : 'Drag & drop your image here'}
      </p>
      <p className="text-sm text-gray-500">or</p>
      <button
        type="button"
        onClick={onBrowseClick}
        className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-full hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
      >
        Browse Files
      </button>
    </div>
    <p className="text-xs text-gray-500 mt-4">
      Supports {SUPPORTED_FORMATS} up to {MAX_FILE_SIZE_MB}MB
    </p>
    {children}
  </div>
);

const Uploading = () => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploaded, setUploaded] = useState(false);
  const [fileError, setFileError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  
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

  // Enhanced drag handlers with counter to handle nested elements
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragActive(true);
    }
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => {
      const newCounter = prev - 1;
      if (newCounter === 0) {
        setIsDragActive(false);
      }
      return newCounter;
    });
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    setDragCounter(0);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFile = e.dataTransfer.files[0];
      validateAndSetFile(newFile);
    }
  }, []);

  // Enhanced file validation with better error messages
  const validateAndSetFile = useCallback((newFile) => {
    // Reset previous states
    setFileError('');
    setFile(null);
    setUploaded(false);
    setUploadProgress(0);

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
  }, []);

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
          timeout: 30000, // 30 second timeout
          onUploadProgress: (progressEvent) => {
            // Real upload progress if needed
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log('Upload progress:', percentCompleted);
          },
        }
      );

      const data = response.data;
      dispatch(setCritique(data.critique));
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
    <div className="bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
          {/* Image Preview Section */}
          <div className="w-full lg:w-1/2 flex justify-center">
            <div className="max-w-md">
              {uploaded && uploadedImage ? (
                <div className="relative">
                  <img 
                    src={uploadedImage} 
                    alt="Uploaded preview" 
                    className="rounded-2xl shadow-lg max-w-full h-auto"
                  />
                  <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                    <CheckCircle size={24} color="white" />
                  </div>
                </div>
              ) : (
                <img 
                  src={cameraImage} 
                  alt="Upload illustration" 
                  className="rounded-2xl opacity-75 max-w-full h-auto"
                />
              )}
            </div>
          </div>

          {/* Upload Form Section */}
          <div className="w-full lg:w-1/2">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h1 className="text-3xl font-bold mb-2 text-primary">
                Get Instant AI Critique
              </h1>
              <p className="text-gray-600 mb-8">
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
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm" role="alert">
                      {fileError}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!uploaded || isGenerating}
                  className={`
                    w-full py-4 px-6 rounded-full font-semibold text-lg transition-all duration-200
                    focus:outline-none focus:ring-4 focus:ring-purple-300
                    ${uploaded && !isGenerating
                      ? 'bg-primary text-white hover:bg-secondary shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }
                  `}
                  aria-busy={isGenerating}
                >
                  <div className="flex items-center justify-center space-x-2">
                    {isGenerating && <LoadingSpinner />}
                    <span>
                      {isGenerating ? 'Analyzing Image...' : 'Get AI Critique'}
                    </span>
                  </div>
                </button>

                {/* Help Text */}
                {uploaded && (
                  <p className="text-sm text-gray-600 text-center">
                    Your image is ready for AI analysis. Click the button above to get started.
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Uploading;