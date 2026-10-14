# ArtiSight 2.0 — Performance & Latency Benchmark Report

## 1. Executive Summary

Previous documentation and portfolio artifacts asserted a "sub-4 second end-to-end multimodal critique turnaround" without empirical measurement or hardware specification.

This benchmark establishes reproducible, empirical ground truth using the standardized evaluation harness (`scripts/benchmark.py`). We measured sub-component execution durations across authentic photographic test fixtures under production-like conditions.

---

## 2. Benchmark Environment

| Parameter | Specification |
|---|---|
| OS | Windows 11 (Build 26100) |
| Runtime | Python 3.11.9 (64-bit) |
| Multimodal Engine | Google Gemini 2.5 Flash (`google-genai` SDK v2.30.1) |
| Thinking Budget | 512 tokens |
| CV Engine | OpenCV (`opencv-python-headless` v5.0.0.93) |
| Imaging Engine | Pillow (v12.3.0) |
| Test Dataset | 3 representative photographic fixtures (Landscape, Wildlife, Architecture) |

---

## 3. Sub-Component Latency Breakdown

| Pipeline Stage | p50 Latency | Mean Latency | Architectural Role |
|---|---|---|---|
| **EXIF Metadata Extraction** | 9.0 ms | 13.1 ms | Camera, lens, focal length, ISO, aperture, shutter extraction (GPS stripped) |
| **OpenCV Deterministic Analysis** | 42.9 ms | 46.1 ms | 32-bin luminance histogram, RMS contrast, Laplacian sharpness, clipping gauges |
| **Personalized Resource Retrieval** | 0.1 ms | 0.1 ms | Curated database matching + domain deduplication |
| **Multimodal Vision & Rubric Reasoning** | 13.21 s | 14.12 s | Multimodal Gemini 2.5 Flash visual critique across 6 dimensions |
| **Total End-to-End Turnaround** | **13.26 s** | **14.18 s** | Upload, pre-processing, CV analysis, LLM inference, JSON schema validation |

---

## 4. Test Sample Results

### Sample 1: `14_determined-solitude.jpg` (169.5 KB)
- **Category**: Landscape / Seascape
- **EXIF Extraction**: 2.73 ms
- **OpenCV Analysis**: 42.89 ms (Laplacian Sharpness: 438.4)
- **Resource Matching**: 0.23 ms (4 curated resources)
- **Total Pipeline**: 13.02 s
- **Overall Score**: 7.7 / 10

### Sample 2: `14_pretty-yellow-bird.jpg` (208.4 KB)
- **Category**: Wildlife / Telephoto
- **EXIF Extraction**: 27.59 ms
- **OpenCV Analysis**: 41.95 ms (Laplacian Sharpness: 85.1)
- **Resource Matching**: 0.06 ms (4 curated resources)
- **Total Pipeline**: 16.26 s
- **Overall Score**: 7.7 / 10

### Sample 3: `24_giza.jpg` (169.8 KB)
- **Category**: Monument / Architectural
- **EXIF Extraction**: 9.02 ms
- **OpenCV Analysis**: 53.42 ms (Laplacian Sharpness: 241.4)
- **Resource Matching**: 0.14 ms (4 curated resources)
- **Total Pipeline**: 13.26 s
- **Overall Score**: 7.9 / 10

---

## 5. Architectural Findings & Trade-Offs

1. **Deterministic vs. Generative Latency**:
   - Deterministic computer vision (OpenCV) and EXIF extraction execute in **under 50 milliseconds**, contributing less than 0.5% of total pipeline latency.
   - Multimodal LLM reasoning represents 99.5% of the total wall-clock duration.
2. **Analysis of the "Sub-4s" Claim**:
   - The historical "sub-4s" claim was unmeasured speculation from a student presentation.
   - High-fidelity visual critique requires transmitting high-resolution pixels to a multimodal vision model, allowing the model to perform internal spatial thinking across 6 dimensions, and generating ~1,000 tokens of structured JSON.
   - Forcing sub-4s turnaround would require disabling model reasoning or downsampling images to tiny thumbnails, which severely damages critique accuracy on noise, sharpness, and subtle exposure clipping.
   - A p50 latency of ~13.3 seconds is fully practical for an educational platform where users value thorough, structured critique and personalized practice exercises over instant, shallow remarks.
3. **Client-Side Optimization**:
   - For client uploads larger than 2048px (e.g., 24MP-60MP raw exports ranging from 10MB to 30MB), client-side Canvas optimization downsamples the image to max 2048px at 90% quality. This slashes cellular upload times by up to 80% while retaining edge clarity for OpenCV analysis.
