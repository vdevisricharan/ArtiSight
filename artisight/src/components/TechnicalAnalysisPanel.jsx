import PropTypes from 'prop-types';
import { Camera, Aperture, Timer, Zap, Focus, SunMedium, Info } from 'lucide-react';

const TechnicalAnalysisPanel = ({ cvMetrics, exifData }) => {
  return (
    <div className="w-full space-y-6 mt-6">
      {/* EXIF Metadata Card */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-gray-200/80 shadow-md">
        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-gray-900 text-sm tracking-wide uppercase">
              Capture & Camera Metadata
            </h3>
          </div>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
            exifData?.hasExif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {exifData?.hasExif ? 'EXIF Detected' : 'No EXIF (Web Export)'}
          </span>
        </div>

        {exifData?.hasExif ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            {exifData.cameraModel && (
              <div className="bg-gray-50/70 p-2.5 rounded-xl border border-gray-100">
                <span className="text-xs text-gray-500 block">Camera</span>
                <span className="font-semibold text-gray-800 truncate block">
                  {exifData.cameraMake ? `${exifData.cameraMake} ` : ''}{exifData.cameraModel}
                </span>
              </div>
            )}
            {exifData.lensModel && (
              <div className="bg-gray-50/70 p-2.5 rounded-xl border border-gray-100">
                <span className="text-xs text-gray-500 block">Lens</span>
                <span className="font-semibold text-gray-800 truncate block">
                  {exifData.lensModel}
                </span>
              </div>
            )}
            {exifData.focalLength && (
              <div className="bg-gray-50/70 p-2.5 rounded-xl border border-gray-100 flex items-center gap-2">
                <Focus className="w-4 h-4 text-indigo-500 shrink-0" />
                <div>
                  <span className="text-xs text-gray-500 block">Focal Length</span>
                  <span className="font-semibold text-gray-800">{exifData.focalLength}</span>
                </div>
              </div>
            )}
            {exifData.aperture && (
              <div className="bg-gray-50/70 p-2.5 rounded-xl border border-gray-100 flex items-center gap-2">
                <Aperture className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <span className="text-xs text-gray-500 block">Aperture</span>
                  <span className="font-semibold text-gray-800">{exifData.aperture}</span>
                </div>
              </div>
            )}
            {exifData.shutterSpeed && (
              <div className="bg-gray-50/70 p-2.5 rounded-xl border border-gray-100 flex items-center gap-2">
                <Timer className="w-4 h-4 text-blue-500 shrink-0" />
                <div>
                  <span className="text-xs text-gray-500 block">Shutter</span>
                  <span className="font-semibold text-gray-800">{exifData.shutterSpeed}</span>
                </div>
              </div>
            )}
            {exifData.iso && (
              <div className="bg-gray-50/70 p-2.5 rounded-xl border border-gray-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-500 shrink-0" />
                <div>
                  <span className="text-xs text-gray-500 block">ISO</span>
                  <span className="font-semibold text-gray-800">{exifData.iso}</span>
                </div>
              </div>
            )}
            {exifData.captureDate && (
              <div className="bg-gray-50/70 p-2.5 rounded-xl border border-gray-100 col-span-2">
                <span className="text-xs text-gray-500 block">Captured</span>
                <span className="font-medium text-gray-700 text-xs truncate block">
                  {exifData.captureDate}
                </span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-500 italic leading-relaxed">
            Standard web exports, social uploads, and screenshots strip EXIF metadata tags to conserve bandwidth and protect location privacy. Technical evaluation continues using OpenCV deterministic signals.
          </p>
        )}
      </div>

      {/* OpenCV Deterministic Computer Vision Card */}
      {cvMetrics && (
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-gray-200/80 shadow-md">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <SunMedium className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold text-gray-900 text-sm tracking-wide uppercase">
                OpenCV Technical Signals
              </h3>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">
              Deterministic Vision
            </span>
          </div>

          {/* Histogram Visualization */}
          {cvMetrics.luminanceHistogram && cvMetrics.luminanceHistogram.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                <span>Shadows (0)</span>
                <span className="font-medium text-gray-700">32-Bin Exposure Luminance Histogram</span>
                <span>Highlights (255)</span>
              </div>
              <div className="h-16 w-full bg-slate-900 rounded-xl p-2 flex items-end gap-[2px] overflow-hidden border border-slate-800">
                {cvMetrics.luminanceHistogram.map((heightPercent, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-gradient-to-t from-blue-400 to-indigo-200 rounded-t-[1px] hover:from-amber-400 hover:to-amber-200 transition-colors"
                    style={{ height: `${Math.max(heightPercent, 3)}%` }}
                    title={`Bin ${idx + 1}: ${heightPercent}%`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-2 font-medium">
                {cvMetrics.exposureEvaluation}
              </p>
            </div>
          )}

          {/* Signal Gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            {/* Sharpness Index */}
            <div className="bg-slate-50 p-3 rounded-xl border border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Laplacian Sharpness</span>
                <span className="font-mono text-xs font-bold text-indigo-600">
                  {cvMetrics.sharpnessIndex}
                </span>
              </div>
              <p className="text-xs text-gray-700 mt-1.5 leading-snug font-medium">
                {cvMetrics.sharpnessAssessment}
              </p>
            </div>

            {/* Highlight Clipping */}
            <div className="bg-slate-50 p-3 rounded-xl border border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Highlight Clipping</span>
                <span className={`font-mono text-xs font-bold ${
                  cvMetrics.highlightClippingPercent > 5 ? 'text-red-600' : 'text-emerald-600'
                }`}>
                  {cvMetrics.highlightClippingPercent}%
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1.5 leading-snug">
                {cvMetrics.highlightClippingPercent > 5
                  ? 'High overexposure risk in highlights'
                  : 'Well-controlled highlight details'}
              </p>
            </div>

            {/* Shadow Clipping */}
            <div className="bg-slate-50 p-3 rounded-xl border border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Shadow Clipping</span>
                <span className={`font-mono text-xs font-bold ${
                  cvMetrics.shadowClippingPercent > 5 ? 'text-red-600' : 'text-emerald-600'
                }`}>
                  {cvMetrics.shadowClippingPercent}%
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1.5 leading-snug">
                {cvMetrics.shadowClippingPercent > 5
                  ? 'Deep crushed black regions detected'
                  : 'Preserved shadow gradations'}
              </p>
            </div>
          </div>

          {/* Objective vs Subjective Disclaimer */}
          <div className="mt-4 flex items-start gap-2 bg-blue-50/70 p-3 rounded-xl border border-blue-100 text-xs text-blue-900 leading-relaxed">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong>Signal Methodology:</strong> OpenCV metrics measure mathematical pixel properties (Laplacian edge energy, luminance clipping, contrast RMS). These provide objective bounds to corroborate the multimodal AI aesthetic critique.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

TechnicalAnalysisPanel.propTypes = {
  cvMetrics: PropTypes.shape({
    sharpnessIndex: PropTypes.number,
    sharpnessAssessment: PropTypes.string,
    brightnessMean: PropTypes.number,
    contrastRms: PropTypes.number,
    highlightClippingPercent: PropTypes.number,
    shadowClippingPercent: PropTypes.number,
    exposureEvaluation: PropTypes.string,
    luminanceHistogram: PropTypes.arrayOf(PropTypes.number),
    dominantColorHex: PropTypes.string,
  }),
  exifData: PropTypes.shape({
    hasExif: PropTypes.bool,
    cameraMake: PropTypes.string,
    cameraModel: PropTypes.string,
    lensModel: PropTypes.string,
    focalLength: PropTypes.string,
    aperture: PropTypes.string,
    shutterSpeed: PropTypes.string,
    iso: PropTypes.string,
    captureDate: PropTypes.string,
  }),
};

export default TechnicalAnalysisPanel;
