"""
Performance benchmark script for ArtiSight 2.0.
Measures latency across real sample photographs:
- Image dimensions & loading
- EXIF extraction latency
- OpenCV deterministic analysis latency
- Gemini 2.5 Flash multimodal critique latency
- Educational resources lookup latency
- Total pipeline latency
Generates reproducible metrics for docs/PERFORMANCE.md.
"""

import os
import sys
import time
import statistics
from pathlib import Path

# Add backend directory to path
backend_path = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from app.services.vision_service import compute_opencv_metrics
from app.services.exif_service import extract_exif_metadata
from app.services.critique_service import analyze_photo
from app.services.resource_service import get_personalized_resources

SAMPLE_DIR = Path(__file__).resolve().parent.parent / "artisight" / "src" / "assets"
SAMPLE_FILES = [
    SAMPLE_DIR / "14_determined-solitude.jpg",
    SAMPLE_DIR / "14_pretty-yellow-bird.jpg",
    SAMPLE_DIR / "24_giza.jpg",
]


def run_benchmark():
    print("=" * 60)
    print("ARTISIGHT 2.0 PERFORMANCE BENCHMARK SUITE")
    print("=" * 60)

    cv_times = []
    exif_times = []
    total_pipeline_times = []
    resource_times = []

    for file_path in SAMPLE_FILES:
        if not file_path.exists():
            print(f"Skipping missing sample: {file_path.name}")
            continue

        print(f"\nEvaluating: {file_path.name} ({os.path.getsize(file_path) / 1024:.1f} KB)")

        # 1. Benchmark EXIF
        t0 = time.perf_counter()
        exif = extract_exif_metadata(str(file_path))
        t_exif = (time.perf_counter() - t0) * 1000
        exif_times.append(t_exif)
        print(f"  • EXIF Extraction: {t_exif:.2f} ms (hasExif: {exif.hasExif})")

        # 2. Benchmark OpenCV
        t0 = time.perf_counter()
        cv_res = compute_opencv_metrics(str(file_path))
        t_cv = (time.perf_counter() - t0) * 1000
        cv_times.append(t_cv)
        print(f"  • OpenCV Metrics:  {t_cv:.2f} ms (Sharpness: {cv_res.sharpnessIndex})")

        # 3. Benchmark Resources
        t0 = time.perf_counter()
        res = get_personalized_resources(["Composition", "Lighting"], ["Clipping"], max_resources=4)
        t_res = (time.perf_counter() - t0) * 1000
        resource_times.append(t_res)
        print(f"  • Resource Lookup: {t_res:.2f} ms (Found: {len(res)})")

        # 4. Benchmark Full Pipeline (including Gemini API)
        t0 = time.perf_counter()
        full_res = analyze_photo(str(file_path))
        t_full = (time.perf_counter() - t0) * 1000
        total_pipeline_times.append(t_full)
        print(f"  • End-to-End Pipeline: {t_full / 1000:.2f} s (Score: {full_res.scores.overall.value})")

    print("\n" + "=" * 60)
    print("SUMMARY BENCHMARK REPORT")
    print("=" * 60)
    print(f"Sample Count: {len(total_pipeline_times)} images")
    print(f"EXIF Extraction:      p50 = {statistics.median(exif_times):.1f} ms | mean = {statistics.mean(exif_times):.1f} ms")
    print(f"OpenCV Analysis:      p50 = {statistics.median(cv_times):.1f} ms | mean = {statistics.mean(cv_times):.1f} ms")
    print(f"Resource Retrieval:   p50 = {statistics.median(resource_times):.1f} ms | mean = {statistics.mean(resource_times):.1f} ms")
    print(f"Full End-to-End:      p50 = {statistics.median(total_pipeline_times) / 1000:.2f} s | mean = {statistics.mean(total_pipeline_times) / 1000:.2f} s")
    print("=" * 60)


if __name__ == "__main__":
    run_benchmark()
