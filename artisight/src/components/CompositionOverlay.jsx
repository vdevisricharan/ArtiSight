import { useState } from 'react';
import PropTypes from 'prop-types';
import { Grid, Eye, Crosshair, SplitSquareVertical } from 'lucide-react';

/**
 * Interactive composition grid overlay for photo analysis.
 * Renders classical photographic guides directly over the image:
 * - Rule of Thirds (3x3 with power points)
 * - Golden Ratio / Phi Grid
 * - Center Crosshair alignment
 * - Dynamic Diagonal guides
 */
const CompositionOverlay = ({ imageSrc, altText = 'Photograph preview' }) => {
  const [overlayMode, setOverlayMode] = useState('thirds'); // 'none' | 'thirds' | 'phi' | 'center' | 'diagonals'

  return (
    <div className="flex flex-col items-center w-full">
      {/* Relative container holding image and SVG overlay */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200/80 bg-slate-900 group max-w-full">
        <img
          src={imageSrc}
          alt={altText}
          className="w-full h-auto max-h-[580px] object-contain block transition-transform duration-300"
          loading="eager"
        />

        {/* SVG Composition Guides */}
        {overlayMode !== 'none' && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Rule of Thirds */}
            {overlayMode === 'thirds' && (
              <g stroke="rgba(255, 255, 255, 0.75)" strokeWidth="0.4" strokeDasharray="1,1">
                {/* Vertical lines */}
                <line x1="33.33" y1="0" x2="33.33" y2="100" />
                <line x1="66.67" y1="0" x2="66.67" y2="100" />
                {/* Horizontal lines */}
                <line x1="0" y1="33.33" x2="100" y2="33.33" />
                <line x1="0" y1="66.67" x2="100" y2="66.67" />

                {/* Power Points (Intersections) */}
                {[
                  [33.33, 33.33],
                  [66.67, 33.33],
                  [33.33, 66.67],
                  [66.67, 66.67],
                ].map(([cx, cy], i) => (
                  <circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r="1.8"
                    fill="rgba(245, 158, 11, 0.9)"
                    stroke="rgba(255, 255, 255, 0.95)"
                    strokeWidth="0.3"
                  />
                ))}
              </g>
            )}

            {/* Golden Ratio (Phi Grid) */}
            {overlayMode === 'phi' && (
              <g stroke="rgba(251, 191, 36, 0.8)" strokeWidth="0.4" strokeDasharray="1.5,1">
                {/* 38.2% and 61.8% lines */}
                <line x1="38.2" y1="0" x2="38.2" y2="100" />
                <line x1="61.8" y1="0" x2="61.8" y2="100" />
                <line x1="0" y1="38.2" x2="100" y2="38.2" />
                <line x1="0" y1="61.8" x2="100" y2="61.8" />
              </g>
            )}

            {/* Center Crosshair */}
            {overlayMode === 'center' && (
              <g stroke="rgba(59, 130, 246, 0.85)" strokeWidth="0.4">
                <line x1="50" y1="0" x2="50" y2="100" strokeDasharray="2,1" />
                <line x1="0" y1="50" x2="100" y2="50" strokeDasharray="2,1" />
                <circle cx="50" cy="50" r="3.5" fill="none" strokeWidth="0.4" />
                <circle cx="50" cy="50" r="0.8" fill="rgba(59, 130, 246, 1)" />
              </g>
            )}

            {/* Diagonal Dynamic Guides */}
            {overlayMode === 'diagonals' && (
              <g stroke="rgba(236, 72, 153, 0.75)" strokeWidth="0.35" strokeDasharray="1,1">
                <line x1="0" y1="0" x2="100" y2="100" />
                <line x1="100" y1="0" x2="0" y2="100" />
                <line x1="50" y1="0" x2="100" y2="50" />
                <line x1="0" y1="50" x2="50" y2="100" />
                <line x1="0" y1="50" x2="50" y2="0" />
                <line x1="50" y1="100" x2="100" y2="50" />
              </g>
            )}
          </svg>
        )}

        {/* Active Overlay Badge */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white border border-white/20">
          Guide: {overlayMode === 'none' ? 'Clean' : overlayMode === 'thirds' ? 'Rule of Thirds' : overlayMode === 'phi' ? 'Phi / Golden Ratio' : overlayMode === 'center' ? 'Center Axis' : 'Diagonals'}
        </div>
      </div>

      {/* Overlay Toolbar Controls */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-gray-200 shadow-sm">
        <button
          type="button"
          onClick={() => setOverlayMode('none')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            overlayMode === 'none'
              ? 'bg-gray-900 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Eye size={14} />
          Clean
        </button>

        <button
          type="button"
          onClick={() => setOverlayMode('thirds')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            overlayMode === 'thirds'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Grid size={14} />
          Rule of Thirds
        </button>

        <button
          type="button"
          onClick={() => setOverlayMode('phi')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            overlayMode === 'phi'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <SplitSquareVertical size={14} />
          Phi Ratio
        </button>

        <button
          type="button"
          onClick={() => setOverlayMode('center')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            overlayMode === 'center'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Crosshair size={14} />
          Center
        </button>

        <button
          type="button"
          onClick={() => setOverlayMode('diagonals')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            overlayMode === 'diagonals'
              ? 'bg-pink-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Grid size={14} className="rotate-45" />
          Diagonals
        </button>
      </div>
    </div>
  );
};

CompositionOverlay.propTypes = {
  imageSrc: PropTypes.string.isRequired,
  altText: PropTypes.string,
};

export default CompositionOverlay;
