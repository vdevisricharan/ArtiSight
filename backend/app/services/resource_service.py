"""
Learning resources discovery service for ArtiSight 2.0.
Provides verified, high-quality photography education links:
1. Seamless curated database of industry-standard tutorials (Cambridge in Colour, Photography Life, B&H, etc.)
2. Optional Google Custom Search JSON API integration with automatic fallback
"""

import logging
from typing import List, Dict, Any, Optional
import requests
from app.config import Config
from app.schemas.critique_schema import LearningResource

logger = logging.getLogger(__name__)

# Verified, evergreen educational photography database
CURATED_PHOTOGRAPHY_RESOURCES: Dict[str, List[Dict[str, str]]] = {
    "composition": [
        {
            "title": "Rule of Thirds in Photography: Complete Guide with Visual Examples",
            "link": "https://photographylife.com/rule-of-thirds",
            "snippet": "Learn how the rule of thirds guides the viewer's eye, when to apply it, and when breaking it creates more compelling tension.",
            "displayLink": "photographylife.com",
            "sourceType": "guide",
            "thumbnail": "https://photographylife.com/wp-content/uploads/2019/08/Rule-of-Thirds-Diagram.jpg"
        },
        {
            "title": "Mastering Leading Lines to Direct Viewer Attention",
            "link": "https://digital-photography-school.com/how-to-use-leading-lines-effectively-in-photography/",
            "snippet": "Practical techniques for identifying natural and architectural leading lines to create visual depth and narrative flow.",
            "displayLink": "digital-photography-school.com",
            "sourceType": "tutorial",
            "thumbnail": "https://digital-photography-school.com/wp-content/uploads/2020/05/leading-lines-photography-guide.jpg"
        },
        {
            "title": "Framing and Negative Space in Photographic Composition",
            "link": "https://www.cambridgeincolour.com/tutorials/photographic-composition.htm",
            "snippet": "Understand visual weight, negative space, and natural framing to isolate subjects and eliminate clutter.",
            "displayLink": "cambridgeincolour.com",
            "sourceType": "article",
            "thumbnail": "https://www.cambridgeincolour.com/images/tutorials/composition-thumb.jpg"
        }
    ],
    "lighting": [
        {
            "title": "Understanding the Photographic Exposure Triangle: Aperture, Shutter & ISO",
            "link": "https://photographylife.com/what-is-exposure-triangle",
            "snippet": "A comprehensive primer on balancing aperture, shutter speed, and ISO to achieve optimal exposure and depth.",
            "displayLink": "photographylife.com",
            "sourceType": "guide",
            "thumbnail": "https://photographylife.com/wp-content/uploads/2019/09/Exposure-Triangle-Diagram.jpg"
        },
        {
            "title": "How to Read and Use Histograms to Prevent Clipping",
            "link": "https://www.cambridgeincolour.com/tutorials/histograms1.htm",
            "snippet": "Learn how to analyze luminance and RGB histograms in camera and post-processing to avoid blown highlights and crushed shadows.",
            "displayLink": "cambridgeincolour.com",
            "sourceType": "tutorial",
            "thumbnail": "https://www.cambridgeincolour.com/images/tutorials/histogram-thumb.jpg"
        },
        {
            "title": "Direction and Quality of Light: Hard vs Soft Lighting",
            "link": "https://www.bhphotovideo.com/explora/photography/tips-and-solutions/understanding-direction-and-quality-of-light",
            "snippet": "Discover how light direction, diffusion, and angle sculpt dimension, texture, and mood across photographic subjects.",
            "displayLink": "bhphotovideo.com",
            "sourceType": "article",
            "thumbnail": "https://www.bhphotovideo.com/explora/sites/default/files/styles/top_shot/public/top_shot_light.jpg"
        }
    ],
    "focus": [
        {
            "title": "Understanding Depth of Field and Aperture Control",
            "link": "https://www.cambridgeincolour.com/tutorials/depth-of-field.htm",
            "snippet": "Interactive visual guide calculating how focal length, subject distance, and aperture dictate the plane of critical sharpness.",
            "displayLink": "cambridgeincolour.com",
            "sourceType": "guide",
            "thumbnail": "https://www.cambridgeincolour.com/images/tutorials/dof-thumb.jpg"
        },
        {
            "title": "How to Achieve Tack-Sharp Photos: Focus Modes & Shutter Rules",
            "link": "https://photographylife.com/how-to-take-sharp-photos",
            "snippet": "Eliminate motion blur and focus calibration errors with reciprocal shutter speed guidelines and autofocus tracking modes.",
            "displayLink": "photographylife.com",
            "sourceType": "tutorial",
            "thumbnail": "https://photographylife.com/wp-content/uploads/2018/11/Sharpness-Guide.jpg"
        }
    ],
    "color": [
        {
            "title": "Color Harmony and Color Theory for Photographers",
            "link": "https://petapixel.com/color-theory-photography/",
            "snippet": "Explore complementary, analogous, and triadic color schemes to evoke emotional resonance in color photography.",
            "displayLink": "petapixel.com",
            "sourceType": "article",
            "thumbnail": "https://petapixel.com/assets/uploads/2021/04/color-theory-thumb.jpg"
        },
        {
            "title": "White Balance and Color Temperature Explained",
            "link": "https://www.cambridgeincolour.com/tutorials/white-balance.htm",
            "snippet": "Master Kelvin scales, custom white balances, and color cast removal in mixed lighting environments.",
            "displayLink": "cambridgeincolour.com",
            "sourceType": "tutorial",
            "thumbnail": "https://www.cambridgeincolour.com/images/tutorials/wb-thumb.jpg"
        }
    ],
    "storytelling": [
        {
            "title": "The Decisive Moment: Storytelling and Narrative in Photography",
            "link": "https://www.magnumphotos.com/theory-and-practice/the-decisive-moment-henri-cartier-bresson/",
            "snippet": "Principles of capturing candid emotion, narrative layers, and evocative moments in visual art.",
            "displayLink": "magnumphotos.com",
            "sourceType": "article",
            "thumbnail": "https://www.magnumphotos.com/wp-content/uploads/2017/06/decisive-moment.jpg"
        },
        {
            "title": "Subject Separation and Environmental Context",
            "link": "https://digital-photography-school.com/how-to-create-subject-separation-in-photography/",
            "snippet": "Techniques to distinguish your subject from surrounding elements using contrast, depth, color, and positioning.",
            "displayLink": "digital-photography-school.com",
            "sourceType": "tutorial",
            "thumbnail": "https://digital-photography-school.com/wp-content/uploads/2021/03/subject-separation.jpg"
        }
    ]
}


def search_google_cse(query: str, num_results: int = 2) -> List[LearningResource]:
    """Execute live Google Custom Search JSON API if configured."""
    if not Config.SEARCH_ENABLED:
        return []

    url = "https://customsearch.googleapis.com/customsearch/v1"
    params = {
        "key": Config.GOOGLE_API_KEY,
        "cx": Config.GOOGLE_CSE_ID,
        "q": query,
        "num": min(num_results, 5),
        "safe": "medium",
        "fields": "items(title,link,snippet,displayLink,pagemap)"
    }

    try:
        response = requests.get(url, params=params, timeout=8)
        if response.status_code != 200:
            logger.warning(f"Google CSE returned HTTP {response.status_code} for '{query}'")
            return []

        data = response.json()
        items = data.get("items", [])
        resources = []
        for item in items:
            link = item.get("link", "")
            if not link or not link.startswith("http"):
                continue

            thumbnail = None
            pagemap = item.get("pagemap", {})
            for key in ("cse_thumbnail", "cse_image"):
                if key in pagemap and pagemap[key]:
                    src = pagemap[key][0].get("src")
                    if src and src.startswith("http"):
                        thumbnail = src
                        break

            resources.append(
                LearningResource(
                    title=item.get("title", "Photography Resource"),
                    link=link,
                    snippet=item.get("snippet", ""),
                    displayLink=item.get("displayLink", ""),
                    sourceType="video" if "youtube.com" in link else "tutorial",
                    thumbnail=thumbnail,
                    searchQuery=query
                )
            )
        return resources
    except Exception as e:
        logger.warning(f"Google CSE lookup error: {e}")
        return []


def get_personalized_resources(
    learning_topics: List[str],
    weaknesses: List[str],
    max_resources: int = 6
) -> List[LearningResource]:
    """
    Produce personalized learning resources tailored to identified weaknesses.
    Combines live search (if active) with curated expert photography guides.
    Guarantees non-empty, high-quality, verified results.
    """
    results: List[LearningResource] = []
    seen_urls = set()

    # 1. Match topics against curated resources
    # Check lowercase keyword matching
    all_tags = [t.lower() for t in learning_topics] + [w.lower() for w in weaknesses]

    for category, category_items in CURATED_PHOTOGRAPHY_RESOURCES.items():
        is_relevant = any(category in tag for tag in all_tags)
        # If relevant, prioritize this category
        if is_relevant:
            for item in category_items:
                if item["link"] not in seen_urls:
                    seen_urls.add(item["link"])
                    results.append(
                        LearningResource(
                            title=item["title"],
                            link=item["link"],
                            snippet=item["snippet"],
                            displayLink=item["displayLink"],
                            sourceType=item.get("sourceType", "article"),
                            thumbnail=item.get("thumbnail"),
                            searchQuery=category.capitalize()
                        )
                    )

    # 2. Try Google CSE if configured for specific specific queries
    if Config.SEARCH_ENABLED and len(results) < max_resources:
        for topic in learning_topics[:2]:
            live_items = search_google_cse(f"photography tutorial {topic}", num_results=2)
            for item in live_items:
                if item.link not in seen_urls:
                    seen_urls.add(item.link)
                    results.append(item)

    # 3. If still under target, fill from remaining curated categories to ensure rich experience
    for category_items in CURATED_PHOTOGRAPHY_RESOURCES.values():
        for item in category_items:
            if len(results) >= max_resources:
                break
            if item["link"] not in seen_urls:
                seen_urls.add(item["link"])
                results.append(
                    LearningResource(
                        title=item["title"],
                        link=item["link"],
                        snippet=item["snippet"],
                        displayLink=item["displayLink"],
                        sourceType=item.get("sourceType", "article"),
                        thumbnail=item.get("thumbnail"),
                        searchQuery="Photography Fundamentals"
                    )
                )

    return results[:max_resources]
