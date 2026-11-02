import { useEffect } from 'react';

const DEFAULT_TITLE = 'ArtiSight — AI Photo Critique & Photography Learning Assistant';
const DEFAULT_DESCRIPTION =
  'Master photography with ArtiSight. Get instant, explainable AI photo critiques, 6-dimension rubric scoring, OpenCV exposure histograms, interactive composition overlays, and personalized practice assignments.';
const DEFAULT_CANONICAL = 'https://artisight.netlify.app/';
const DEFAULT_IMAGE = 'https://artisight.netlify.app/og-image.png';
const DEFAULT_ROBOTS = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

const setMetaTag = (selector, attribute, value) => {
  if (!value) return;
  let element = document.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    if (selector.startsWith('meta[name=')) {
      const match = selector.match(/name="([^"]+)"/);
      if (match) element.setAttribute('name', match[1]);
    } else if (selector.startsWith('meta[property=')) {
      const match = selector.match(/property="([^"]+)"/);
      if (match) element.setAttribute('property', match[1]);
    }
    document.head.appendChild(element);
  }
  element.setAttribute(attribute, value);
};

const setCanonical = (href) => {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
};

const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical = DEFAULT_CANONICAL,
  robots = DEFAULT_ROBOTS,
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
}) => {
  useEffect(() => {
    // 1. Dynamic Title
    const fullTitle = title ? `${title} | ArtiSight` : DEFAULT_TITLE;
    document.title = fullTitle;

    // 2. Standard Meta Tags
    setMetaTag('meta[name="description"]', 'content', description);
    setMetaTag('meta[name="title"]', 'content', fullTitle);
    setMetaTag('meta[name="robots"]', 'content', robots);

    // 3. Canonical Link
    if (canonical) {
      setCanonical(canonical);
    }

    // 4. Open Graph Tags
    setMetaTag('meta[property="og:title"]', 'content', fullTitle);
    setMetaTag('meta[property="og:description"]', 'content', description);
    setMetaTag('meta[property="og:url"]', 'content', canonical);
    setMetaTag('meta[property="og:type"]', 'content', ogType);
    setMetaTag('meta[property="og:image"]', 'content', ogImage);

    // 5. Twitter Card Tags
    setMetaTag('meta[name="twitter:title"]', 'content', fullTitle);
    setMetaTag('meta[name="twitter:description"]', 'content', description);
    setMetaTag('meta[name="twitter:url"]', 'content', canonical);
    setMetaTag('meta[name="twitter:image"]', 'content', ogImage);
  }, [title, description, canonical, robots, ogType, ogImage]);

  return null;
};

export default SEO;
