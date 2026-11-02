import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import {
  Upload,
  Image as ImageIcon,
  AlertCircle,
  X,
  Sparkles,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import {
  setUploadedImage,
  setAnalysisResult,
  setAnalysisPhase,
  setUploadProgress,
  setError,
  selectAnalysisPhase,
  selectUploadProgress,
  selectError,
  resetImageState,
} from '../redux/imageSlice';
import { optimizeImage } from '../utils/imageOptimizer';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 16 * 1024 * 1024; // 16MB
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

const Uploading = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const phase = useSelector(selectAnalysisPhase);
  const uploadProgress = useSelector(selectUploadProgress);
  const errorMessage = useSelector(selectError);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageMetadata, setImageMetadata] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadController, setUploadController] = useState(null);

  const fileInputRef = useRef(null);

  // Clean up object URLs on unmount or URL replacement
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelection = useCallback(async (file) => {
    dispatch(setError(null));

    // 1. MIME type validation
    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      dispatch(setError('Unsupported format. Please upload a JPEG, PNG, or WebP photograph.'));
      return;
    }

    // 2. File size validation
    if (file.size > MAX_FILE_SIZE_BYTES) {
      dispatch(setError(`File is too large (${formatBytes(file.size)}). Maximum supported size is 16MB.`));
      return;
    }

    // Create local preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setSelectedFile(file);

    // Read natural dimensions
    const img = new Image();
    img.onload = () => {
      setImageMetadata({
        width: img.width,
        height: img.height,
        size: file.size,
        type: file.type,
      });
    };
    img.src = objectUrl;
  }, [dispatch]);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelection(e.dataTransfer.files[0]);
      }
    },
    [handleFileSelection]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleRemoveImage = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setImageMetadata(null);
    dispatch(resetImageState());
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [dispatch]);

  const handleStartAnalysis = useCallback(async () => {
    if (!selectedFile) return;

    dispatch(setError(null));
    dispatch(setAnalysisPhase('preparing'));

    let fileToUpload = selectedFile;

    // 1. Client-Side Image Pre-Processing & Optimization
    try {
      const optimizationResult = await optimizeImage(selectedFile);
      if (optimizationResult.wasOptimized) {
        fileToUpload = optimizationResult.file;
      }
    } catch (e) {
      console.warn('Client optimization skipped, using original file:', e);
    }

    // 2. Network Upload Phase
    dispatch(setAnalysisPhase('uploading'));
    dispatch(setUploadProgress(0));

    const formData = new FormData();
    formData.append('file', fileToUpload);

    const controller = new AbortController();
    setUploadController(controller);

    // Save image preview in Redux for the critique screen
    const reader = new FileReader();
    reader.onloadend = () => {
      dispatch(setUploadedImage(reader.result));
    };
    reader.readAsDataURL(fileToUpload);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/v2/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        signal: controller.signal,
        timeout: 120000, // 120 second timeout for deep multimodal analysis
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            dispatch(setUploadProgress(percent));
            if (percent >= 100) {
              dispatch(setAnalysisPhase('analyzing'));
            }
          }
        },
      });

      const analysisData = response.data;
      if (!analysisData || !analysisData.summary) {
        throw new Error('Server returned an invalid analysis format.');
      }

      dispatch(setAnalysisResult(analysisData));
      navigate('/feedback');
    } catch (err) {
      if (axios.isCancel(err)) {
        dispatch(setError('Analysis was cancelled.'));
      } else if (!err.response && (err.message === 'Network Error' || err.code === 'ERR_NETWORK')) {
        dispatch(
          setError(
            'Cannot connect to the ArtiSight analysis backend. Please verify your network connection or ensure the local backend server is running on port 5000 (python run.py).'
          )
        );
      } else {
        const errorMsg =
          err.response?.data?.error ||
          err.message ||
          'Failed to complete photography analysis. Please verify your connection and try again.';
        dispatch(setError(errorMsg));
      }
    } finally {
      setUploadController(null);
    }
  }, [selectedFile, dispatch, navigate]);

  const handleCancel = useCallback(() => {
    if (uploadController) {
      uploadController.abort();
    }
    dispatch(setAnalysisPhase('idle'));
    dispatch(setUploadProgress(0));
  }, [uploadController, dispatch]);

  const isProcessing = phase === 'preparing' || phase === 'uploading' || phase === 'analyzing';

  return (
    <div className="w-full bg-slate-50 text-slate-800 py-10 px-4 sm:px-6 lg:px-8">
      {/* Top Breadcrumb & Privacy Badge */}
      <div className="max-w-4xl mx-auto mb-8 flex flex-col sm:flex-row gap-2.5 sm:items-center sm:justify-between">
        <Link
          to="/"
          className="text-sm font-semibold text-slate-600 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none rounded-lg p-1 transition-colors flex items-center gap-1.5 w-fit"
        >
          ← Back to Overview
        </Link>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1 bg-white rounded-full border border-slate-200 text-slate-700 shadow-sm w-fit">
          <ShieldCheck size={14} className="text-emerald-600" />
          Zero Data Retention • GPS Location Stripped
        </div>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200/80">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 block mb-2">
            AI Critique Workspace
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Upload Your Photograph
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            Receive structured 6-dimension evaluation, OpenCV exposure & sharpness metrics, and personalized shooting assignments.
          </p>
        </div>

        {/* Error Alert with Retry Capability */}
        {errorMessage && (
          <div
            className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-red-900 text-sm animate-fade-in"
            role="alert"
          >
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="shrink-0 mt-0.5 text-red-600" />
              <div>
                <strong className="font-semibold block text-red-950">Upload Notice</strong>
                <span className="text-xs sm:text-sm text-red-800 leading-relaxed block">{errorMessage}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              {selectedFile && !isProcessing && (
                <button
                  type="button"
                  onClick={handleStartAnalysis}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                >
                  <RotateCcw size={12} />
                  Retry Analysis
                </button>
              )}
              <button
                type="button"
                onClick={() => dispatch(setError(null))}
                className="text-red-500 hover:text-red-700 p-1 rounded-md"
                aria-label="Dismiss error notification"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Drag and Drop Zone or Preview */}
        {!selectedFile ? (
          <div
            role="button"
            tabIndex={0}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            className={`border-2 border-dashed rounded-3xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isDragActive
                ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
                : 'border-gray-200 hover:border-blue-400 hover:bg-slate-50/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileSelection(e.target.files[0]);
              }}
              className="hidden"
            />
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
              <Upload size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Drag and drop your image here
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              or <span className="text-blue-600 font-semibold underline underline-offset-2">browse files</span> from your device
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs text-slate-600 font-medium">
              <span>Supports JPEG, PNG, WebP</span>
              <span>•</span>
              <span>Up to 16 MB</span>
              <span>•</span>
              <span>Client-side optimization</span>
            </div>
          </div>
        ) : (
          /* Image Selected / Preview State */
          <div className="space-y-6">
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-gray-200 shadow-md flex items-center justify-center max-h-[460px]">
              <img
                src={previewUrl}
                alt="Selected preview"
                className="max-h-[460px] w-auto object-contain block"
              />
              {!isProcessing && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-white"
                  title="Remove image"
                  aria-label="Remove image"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Image Details Bar */}
            <div className="flex flex-wrap items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 gap-3">
              <div className="flex items-center gap-3">
                <ImageIcon size={18} className="text-blue-600" />
                <div>
                  <span className="font-semibold text-slate-900 block truncate max-w-xs">
                    {selectedFile.name}
                  </span>
                  <span>{formatBytes(selectedFile.size)}</span>
                </div>
              </div>

              {imageMetadata && (
                <div className="flex items-center gap-4 text-slate-600">
                  <span>Dimensions: {imageMetadata.width} × {imageMetadata.height}px</span>
                  <span>Format: {selectedFile.type.replace('image/', '').toUpperCase()}</span>
                </div>
              )}
            </div>

            {/* Processing State & Progress Indicator */}
            {isProcessing && (
              <div className="p-6 bg-blue-50/70 border border-blue-100 rounded-2xl space-y-3" role="status" aria-live="polite">
                <div className="flex items-center justify-between text-sm font-semibold text-blue-900">
                  <span className="flex items-center gap-2">
                    <RefreshCw size={16} className="animate-spin text-blue-600" />
                    {phase === 'preparing' && 'Normalizing orientation and optimizing client copy...'}
                    {phase === 'uploading' && `Uploading image (${uploadProgress}%)...`}
                    {phase === 'analyzing' && 'Running OpenCV metrics & Gemini 2.5 Flash rubric critique (~10-15s)...'}
                  </span>
                  <span className="font-mono text-xs text-blue-700">
                    {phase === 'uploading' ? `${uploadProgress}%` : 'Processing'}
                  </span>
                </div>

                <div className="w-full bg-blue-200/60 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      phase === 'analyzing'
                        ? 'w-full bg-gradient-to-r from-blue-500 to-indigo-600 animate-pulse'
                        : 'bg-blue-600'
                    }`}
                    style={phase === 'uploading' ? { width: `${uploadProgress}%` } : undefined}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-blue-700">
                  <span>Multimodal AI evaluation in progress</span>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="text-red-600 hover:text-red-700 font-medium underline focus-visible:ring-1 focus-visible:ring-red-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {!isProcessing && (
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:outline-none transition-colors"
                >
                  Choose Different Photo
                </button>
                <button
                  type="button"
                  onClick={handleStartAnalysis}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg"
                >
                  <Sparkles size={16} />
                  Analyze with ArtiSight 2.0
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Uploading;
