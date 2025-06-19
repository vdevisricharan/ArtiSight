from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import os
from google import genai
from google.genai import types
import requests
import base64
from dotenv import load_dotenv
from flask import send_from_directory
from flasgger import Swagger, swag_from
from flask import render_template
import logging
from werkzeug.utils import secure_filename
import uuid
from pathlib import Path
import re
import nltk

# Ensure the Punkt tokenizer is available the first time you run
try:
    nltk.data.find("tokenizers/punkt")
except LookupError:
    nltk.download("punkt")
    
# Accepts: “- ”, “* ”, Unicode bullets, “1. ”, “1) ” …
_BULLET_RE = re.compile(
    r"""^\s*                      # leading whitespace
        (?:[-*•‣▪–]               # common bullet characters
        |\d+\s*[.):-])            # or numbered list variants
        \s*(.+?)\s*$              # the query itself (captured)
    """,
    re.VERBOSE,
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'temp_uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Create upload directory if it doesn't exist
Path(UPLOAD_FOLDER).mkdir(exist_ok=True)

swagger_template = {
    "info": {
        "title": "Photo-Critique API",
        "description": "Upload a photo → Gemini critique → improvement tips → learning resources",
        "version": "1.1.0"
    },
    "host": "localhost:5000",
    "schemes": ["http"],
    "consumes": ["application/json", "multipart/form-data"],
    "produces": ["application/json"]
}
swagger = Swagger(app, template=swagger_template)

# Environment variables validation
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
GOOGLE_CSE_ID = os.getenv('GOOGLE_CSE_ID')

required_env_vars = {
    'GEMINI_API_KEY': GEMINI_API_KEY,
    'GOOGLE_API_KEY': GOOGLE_API_KEY,
    'GOOGLE_CSE_ID': GOOGLE_CSE_ID
}

missing_vars = [var for var, value in required_env_vars.items() if not value]
if missing_vars:
    raise RuntimeError(f'Missing environment variables: {", ".join(missing_vars)}')

# Initialize Gemini client
try:
    gemini_client = genai.Client(api_key=GEMINI_API_KEY)
    GEMINI_MODEL = "gemini-2.5-flash-preview-05-20"
except Exception as e:
    logger.error(f"Failed to initialize Gemini client: {e}")
    raise

# Gemini configuration
generation_config = {
    "temperature": 0.7,  # Slightly more focused responses
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 2048,
}

safety_settings = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
]

def allowed_file(filename):
    """Check if uploaded file has allowed extension"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_image(file_path):
    """Validate that the uploaded file is a valid image"""
    try:
        with Image.open(file_path) as img:
            img.verify()
        return True
    except Exception as e:
        logger.warning(f"Invalid image file: {e}")
        return False

def generate_unique_filename(original_filename):
    """Generate a unique filename to prevent conflicts"""
    ext = original_filename.rsplit('.', 1)[1].lower() if '.' in original_filename else 'jpg'
    return f"{uuid.uuid4().hex}.{ext}"

def cleanup_file(file_path):
    """Safely remove a file"""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"Cleaned up file: {file_path}")
    except Exception as e:
        logger.warning(f"Failed to cleanup file {file_path}: {e}")

@app.route('/')
def index():
    """Serve the main page"""
    return render_template("index.html")

@app.route('/favicon.ico')
def favicon():
    """Serve favicon"""
    return send_from_directory(
        os.path.join(app.root_path, ''), 
        'favicon.ico', 
        mimetype='image/vnd.microsoft.icon'
    )

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'version': '1.1.0'})

@app.route('/upload', methods=['POST'])
@swag_from({
    "summary": "Upload an image and get a detailed critique",
    "description": "Upload a photo to receive a comprehensive 7-step critique from Gemini AI",
    "consumes": ["multipart/form-data"],
    "parameters": [
        {
            "name": "file",
            "in": "formData",
            "type": "file",
            "required": True,
            "description": "Image file (JPEG, PNG, GIF, BMP, WebP - max 16MB)"
        }
    ],
    "responses": {
        200: {
            "description": "Critique generated successfully",
            "schema": {
                "type": "object",
                "properties": {
                    "critique": {"type": "string", "description": "Detailed photo critique"},
                    "filename": {"type": "string", "description": "Original filename"}
                }
            }
        },
        400: {"description": "Invalid request or file format"},
        413: {"description": "File too large"},
        500: {"description": "Server error"}
    }
})
def upload_file():
    """Handle photo upload and generate critique"""
    temp_path = None
    
    try:
        # Validate request
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({
                'error': f'Unsupported file type. Allowed: {", ".join(ALLOWED_EXTENSIONS)}'
            }), 400
        
        # Save file with unique name
        filename = secure_filename(file.filename)
        unique_filename = generate_unique_filename(filename)
        temp_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        
        file.save(temp_path)
        logger.info(f"File saved: {temp_path}")
        
        # Validate image
        if not validate_image(temp_path):
            return jsonify({'error': 'Invalid or corrupted image file'}), 400
        
        # Upload to Gemini
        try:
            gemini_file = gemini_client.files.upload(file=temp_path)
            logger.info(f"File uploaded to Gemini: {gemini_file.name}")
        except Exception as e:
            logger.error(f"Gemini upload failed: {e}")
            return jsonify({'error': f'Failed to process image: {str(e)}'}), 500
        
        # Enhanced critique prompt
        critique_prompt = """
        Please provide a comprehensive critique of this photograph following these specific steps:
        
        1. **Initial Observation**: Examine the photograph closely. What is the main subject? What catches your eye first? Note significant details, elements, and overall composition.
        
        2. **Emotional Impact & Interpretation**: Describe your emotional response to the image. What story does it tell? What mood or atmosphere does it convey? Are there any symbolic elements or themes?
        
        3. **Technical Analysis**: Evaluate the technical execution:
           - Exposure (highlights, shadows, overall brightness)
           - Focus and depth of field
           - Color accuracy and saturation
           - Contrast and tonal range
           - Lighting quality and direction
           - Any technical issues (blur, noise, distortion)
        
        4. **Artistic Composition**: Analyze the creative decisions:
           - Rule of thirds, leading lines, framing
           - Balance between foreground, middle ground, and background
           - Color harmony or black & white treatment
           - Cropping and aspect ratio choices
           - Visual flow and eye movement through the image
        
        5. **Strengths**: Identify what works exceptionally well in this photograph. Be specific about why these elements are effective and how they contribute to the overall impact.
        
        6. **Areas for Improvement**: Suggest specific, actionable improvements:
           - Post-processing adjustments that could enhance the image
           - Composition or framing alternatives
           - Technical considerations for future shots
           - Creative suggestions to strengthen the visual narrative
        
        7. **Overall Assessment**: Provide your final impression. What is the photograph's strongest quality? How would you rate its overall impact and effectiveness?
        
        Please be constructive, specific, and educational in your critique. Aim to help the photographer grow their skills.
        """
        
        contents = [critique_prompt, gemini_file]
        
        generate_content_config = types.GenerateContentConfig(
            response_mime_type="text/plain",
        )
        
        # Generate critique
        try:
            response_text = ""
            for chunk in gemini_client.models.generate_content_stream(
                model=GEMINI_MODEL,
                contents=contents,
                config=generate_content_config,
            ):
                if chunk.text:
                    response_text += chunk.text
            
            logger.info("Critique generated successfully")
            return jsonify({
                'critique': response_text.strip(),
                'filename': filename
            })
            
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            return jsonify({'error': f'Failed to generate critique: {str(e)}'}), 500
    
    except Exception as e:
        logger.error(f"Upload error: {e}")
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500
    
    finally:
        # Always cleanup temp file
        if temp_path:
            cleanup_file(temp_path)

@app.route('/suggest', methods=['POST'])
@swag_from({
    "summary": "Generate improvement suggestions from critique",
    "description": "Convert a photo critique into actionable improvement recommendations",
    "parameters": [
        {
            "name": "body",
            "in": "body",
            "required": True,
            "schema": {
                "type": "object",
                "properties": {
                    "critique": {"type": "string", "description": "The photo critique text"}
                },
                "required": ["critique"]
            }
        }
    ],
    "responses": {
        200: {
            "description": "Suggestions generated successfully",
            "schema": {
                "type": "object",
                "properties": {
                    "suggestions": {"type": "string", "description": "Bullet-point improvement suggestions"}
                }
            }
        },
        400: {"description": "Missing critique text"},
        500: {"description": "Server error"}
    }
})
def suggest_improvements():
    """Generate improvement suggestions based on critique"""
    try:
        data = request.get_json()
        if not data or 'critique' not in data:
            return jsonify({'error': 'Critique text is required'}), 400
        
        critique_text = data['critique'].strip()
        if not critique_text:
            return jsonify({'error': 'Critique text cannot be empty'}), 400
        
        suggestion_prompt = f"""
        Based on the following photo critique, provide specific, actionable improvement suggestions organized as clear bullet points. Focus on:
        
        - Technical improvements (camera settings, exposure, focus)
        - Composition enhancements (framing, positioning, angles)
        - Post-processing recommendations (editing techniques, adjustments)
        - Creative suggestions (alternative approaches, artistic techniques)
        - Equipment or technique recommendations for future shoots
        
        Make each suggestion practical and achievable. Group similar suggestions together and prioritize the most impactful improvements.
        
        CRITIQUE:
        {critique_text}
        """
        
        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=suggestion_prompt)],
            ),
        ]
        
        generate_content_config = types.GenerateContentConfig(
            response_mime_type="text/plain",
        )
        
        try:
            response_text = ""
            for chunk in gemini_client.models.generate_content_stream(
                model=GEMINI_MODEL,
                contents=contents,
                config=generate_content_config,
            ):
                if chunk.text:
                    response_text += chunk.text
            
            logger.info("Suggestions generated successfully")
            return jsonify({'suggestions': response_text.strip()})
            
        except Exception as e:
            logger.error(f"Gemini API error in suggestions: {e}")
            return jsonify({'error': f'Failed to generate suggestions: {str(e)}'}), 500
    
    except Exception as e:
        logger.error(f"Suggestion error: {e}")
        return jsonify({'error': str(e)}), 500

def google_search(query, search_type=None, num_results=3, start_index=1):
    """Perform Google Custom Search using the latest API format"""
    url = "https://customsearch.googleapis.com/customsearch/v1"
    params = {
        'key': GOOGLE_API_KEY,
        'cx': GOOGLE_CSE_ID,
        'q': query,
        'num': min(num_results, 10),  # API limit is 10
        'start': start_index,
        'safe': 'medium',  # Safe search
        'fields': 'items(title,link,snippet,displayLink,formattedUrl,pagemap),searchInformation,queries'
    }
    
    if search_type:
        params['searchType'] = search_type
    
    try:
        response = requests.get(url, params=params, timeout=15)
        response.raise_for_status()
        result = response.json()
        
        # Log search information
        if 'searchInformation' in result:
            search_info = result['searchInformation']
            logger.info(f"Search completed: {search_info.get('formattedTotalResults', 0)} results in {search_info.get('formattedSearchTime', 0)}s")
        
        return result
    except requests.RequestException as e:
        logger.error(f"Google Search API error for query '{query}': {e}")
        return {'items': [], 'error': str(e)}

def build_search_queries(critique, suggestions):
    """Generate focused search queries for learning resources"""
    prompt = f"""
    Based on the photo critique and improvement suggestions below, generate 5 specific Google search queries that would help the photographer learn and improve their skills.
    
    Focus on:
    - Photography techniques mentioned in the critique
    - Specific technical issues that need improvement  
    - Artistic concepts that could be developed
    - Equipment or software recommendations
    - Tutorial topics for the identified skill gaps
    
    Format each query as a bullet point (starting with "- ") and make them specific enough to find high-quality educational content.
    
    CRITIQUE: {critique}
    
    SUGGESTIONS: {suggestions}
    """
    
    contents = [
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=prompt)],
        ),
    ]
    
    generate_content_config = types.GenerateContentConfig(
        response_mime_type="text/plain",
    )
    
    try:
        response_text = ""
        for chunk in gemini_client.models.generate_content_stream(
            model=GEMINI_MODEL,
            contents=contents,
            config=generate_content_config,
        ):
            if chunk.text:
                response_text += chunk.text
        
        return response_text.strip()
    except Exception as e:
        logger.error(f"Failed to generate search queries: {e}")
        return ""

def parse_search_queries(llm_output: str,
                         max_queries: int = 4,
                         min_len: int = 4) -> list[str]:
    """
    Robustly extract and clean search queries from LLM-generated text.

    1. Handles bullet and numbered lists with many Unicode variants.
    2. Falls back to sentence tokenisation when no bullets are found.
    3. Strips surrounding quotes / punctuation and deduplicates.
    """
    queries: list[str] = []

    # 1️⃣  First pass: look for bullets / numbered lines
    for line in llm_output.splitlines():
        m = _BULLET_RE.match(line)
        if m:
            q = (
                m.group(1)
                 .strip("“”\"'«»")         # strip quotes
                 .rstrip(".,;:")           # trailing punctuation
            )
            if len(q) >= min_len:
                queries.append(q)

    # 2️⃣  Fallback: treat each sentence as a potential query
    if not queries:
        for sent in nltk.tokenize.sent_tokenize(llm_output):
            q = (
                sent.strip("“”\"'«»")
                    .rstrip(".,;:")
            )
            if len(q) >= min_len:
                queries.append(q)

    # 3️⃣  Deduplicate while preserving order
    seen = set()
    deduped = [q for q in queries if not (q in seen or seen.add(q))]

    return deduped[:max_queries]

@app.route('/resources', methods=['POST'])
@swag_from({
    "summary": "Get learning resources based on critique and suggestions",
    "description": "Generate Google search results for photography learning resources using Custom Search JSON API",
    "parameters": [
        {
            "name": "body",
            "in": "body",
            "required": True,
            "schema": {
                "type": "object",
                "properties": {
                    "critique": {"type": "string", "description": "The photo critique"},
                    "suggestions": {"type": "string", "description": "Improvement suggestions"},
                    "maxResults": {"type": "integer", "description": "Maximum results per query (default: 2)", "minimum": 1, "maximum": 5}
                },
                "required": ["critique", "suggestions"]
            }
        }
    ],
    "responses": {
        200: {
            "description": "Resources found successfully",
            "schema": {
                "type": "object",
                "properties": {
                    "webResults": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "title": {"type": "string"},
                                "link": {"type": "string"},
                                "snippet": {"type": "string"},
                                "displayLink": {"type": "string"},
                                "formattedUrl": {"type": "string"},
                                "thumbnail": {"type": "string"},
                                "searchQuery": {"type": "string"}
                            }
                        }
                    },
                    "searchQueries": {
                        "type": "array",
                        "items": {"type": "string"}
                    },
                    "searchSummary": {
                        "type": "object",
                        "properties": {
                            "totalResults": {"type": "integer"},
                            "totalSearchTime": {"type": "string"},
                            "queriesExecuted": {"type": "integer"}
                        }
                    }
                }
            }
        },
        400: {"description": "Missing required data"},
        500: {"description": "Server error"}
    }
})
def get_resources():
    """Get learning resources based on critique and suggestions using Google Custom Search JSON API"""
    try:
        data = request.get_json()
        if not data or 'critique' not in data or 'suggestions' not in data:
            return jsonify({'error': 'Both critique and suggestions are required'}), 400
        
        critique = data['critique'].strip()
        suggestions = data['suggestions'].strip()
        max_results_per_query = data.get('maxResults', 2)
        
        if not critique or not suggestions:
            return jsonify({'error': 'Critique and suggestions cannot be empty'}), 400
        
        # Generate search queries
        search_queries_text = build_search_queries(critique, suggestions)
        if not search_queries_text:
            return jsonify({'error': 'Failed to generate search queries'}), 500
        
        # Parse queries
        queries = parse_search_queries(search_queries_text, max_queries=4)
        
        if not queries:
            return jsonify({'error': 'No valid search queries generated'}), 500
        
        # Limit to top 4 queries to avoid API limits and costs
        queries = queries[:4]
        
        top_results = []
        total_results_found = 0
        total_search_time = 0.0
        queries_executed = 0
        
        for query in queries:
            try:
                logger.info(f"Searching for: {query}")
                search_results = google_search(query, num_results=max_results_per_query)
                
                # Handle API errors
                if 'error' in search_results:
                    logger.warning(f"Search failed for '{query}': {search_results['error']}")
                    continue
                
                queries_executed += 1
                
                # Extract search information
                if 'searchInformation' in search_results:
                    search_info = search_results['searchInformation']
                    if 'totalResults' in search_info:
                        total_results_found += int(search_info['totalResults'])
                    if 'searchTime' in search_info:
                        total_search_time += float(search_info['searchTime'])
                
                items = search_results.get('items', [])
                
                for item in items:
                    result = {
                        'title': item.get('title', 'No title available'),
                        'link': item.get('link', '#'),
                        'snippet': item.get('snippet', ''),
                        'displayLink': item.get('displayLink', ''),
                        'formattedUrl': item.get('formattedUrl', item.get('link', '')),
                        'searchQuery': query,
                        'thumbnail': None
                    }
                    
                    # Extract thumbnail from pagemap following your API structure
                    if 'pagemap' in item:
                        pagemap = item['pagemap']
                        
                        # Try different thumbnail sources in order of preference
                        thumbnail_sources = [
                            ('cse_thumbnail', 'src'),
                            ('cse_image', 'src'),
                            ('imageobject', 'image')
                        ]
                        
                        for source_key, url_key in thumbnail_sources:
                            if source_key in pagemap and pagemap[source_key]:
                                thumbnail_data = pagemap[source_key][0]
                                if isinstance(thumbnail_data, dict) and url_key in thumbnail_data:
                                    result['thumbnail'] = thumbnail_data[url_key]
                                    break
                                elif isinstance(thumbnail_data, str):
                                    result['thumbnail'] = thumbnail_data
                                    break
                        
                        # Extract additional metadata if available
                        if 'metatags' in pagemap and pagemap['metatags']:
                            metatag = pagemap['metatags'][0]
                            if not result['thumbnail'] and 'og:image' in metatag:
                                result['thumbnail'] = metatag['og:image']
                    
                    # Validate thumbnail URL
                    if result['thumbnail'] and not result['thumbnail'].startswith(('http://', 'https://')):
                        result['thumbnail'] = None
                    
                    top_results.append(result)
                    
            except Exception as e:
                logger.warning(f"Error processing search query '{query}': {e}")
                continue
        
        # Remove duplicates based on URL
        seen_urls = set()
        unique_results = []
        for result in top_results:
            if result['link'] not in seen_urls:
                seen_urls.add(result['link'])
                unique_results.append(result)
        
        search_summary = {
            'totalResults': total_results_found,
            'totalSearchTime': f"{total_search_time:.2f}s",
            'queriesExecuted': queries_executed,
            'uniqueResults': len(unique_results)
        }
        
        logger.info(f"Resource search completed: {len(unique_results)} unique results from {queries_executed} queries")
        
        response_data = {
            'webResults': unique_results,
            'searchQueries': queries,
            'searchSummary': search_summary
        }
        
        # Add next page information if available
        if top_results and 'queries' in search_results and 'nextPage' in search_results['queries']:
            response_data['hasNextPage'] = True
            response_data['nextPageInfo'] = search_results['queries']['nextPage'][0]
        
        return jsonify(response_data)
    
    except Exception as e:
        logger.error(f"Resources endpoint error: {e}")
        return jsonify({'error': f'Failed to fetch resources: {str(e)}'}), 500

@app.errorhandler(413)
def request_entity_too_large(error):
    """Handle file too large error"""
    return jsonify({'error': f'File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB'}), 413

@app.errorhandler(500)
def internal_server_error(error):
    """Handle internal server errors"""
    logger.error(f"Internal server error: {error}")
    return jsonify({'error': 'Internal server error. Please try again later.'}), 500

if __name__ == '__main__':
    logger.info("Starting Photo-Critique API server...")
    app.run(debug=True, host='0.0.0.0', port=5000)
    # critique="This photograph offers a warm and intimate glimpse into a moment of affection between two individuals. Here's a detailed critique:\n\n---\n\n### Comprehensive Critique of the Photograph\n\n**1. Initial Observation**:\nThe photograph immediately draws the eye to a couple embracing. The man is holding the woman from behind, and she is holding his arms, both with gentle, contented smiles. They are positioned slightly to the left of the frame's center. The setting appears to be a cozy indoor space, likely a bedroom, with a patterned curtain on the left and a warm-toned wall on the right. On the right wall, there's a large mirror reflecting a blurred interior, two wall sconces providing ambient light, and two drawings (an elephant and a fox) taped to the wall, suggesting a child's presence. A wooden structure, possibly a crib or bedside table, is visible in the foreground on the right. The overall impression is one of quiet intimacy and domestic comfort.\n\n**2. Emotional Impact & Interpretation**:\nThe image evokes a strong sense of warmth, tenderness, and profound intimacy. The expressions on both faces, particularly the woman's closed eyes and the man's soft gaze, convey deep contentment, love, and emotional security. It tells a story of a quiet, private moment shared between two people who are deeply connected and comfortable with each other. The presence of what appear to be children's drawings and a crib-like structure subtly adds another layer to the narrative, hinting at a family and possibly parental love, making the embrace feel even more grounded and meaningful within the context of a shared life. The mood is serene, peaceful, and incredibly cozy, almost inviting the viewer into their private world.\n\n**3. Technical Analysis**:\n*   **Exposure**: The exposure is well-managed. The subjects' faces are appropriately lit, with good detail in both highlights and shadows. The overall brightness contributes to the warm and inviting atmosphere without any areas being significantly over or underexposed. The light from the wall sconces is bright but not blown out, retaining some detail.\n*   **Focus and Depth of Field**: The focus is sharp on the couple, which is crucial for the emotional impact. The shallow depth of field effectively isolates them from the background. The curtains, mirror reflection, wall art, and furniture are all gently blurred, ensuring they provide context without distracting from the main subjects. This selective focus is executed very well.\n*   **Color Accuracy and Saturation**: The color palette is dominated by warm tones—the terracotta of the wall, the golden light from the sconces, and the rich green of the woman's sari, complemented by her maroon blouse. Skin tones are natural and healthy. The saturation feels balanced, leaning slightly towards a cinematic, warm grade, which enhances the cozy and intimate mood.\n*   **Contrast and Tonal Range**: The image displays good contrast, providing depth and separation between subjects and background. The tonal range is well-preserved, allowing for detail in both brighter and darker areas without feeling flat. The overall impression is soft but not lacking in definition, contributing to the gentle atmosphere.\n*   **Lighting Quality and Direction**: The lighting is soft, warm, and flattering. It appears to be a mix of natural light diffused by the curtains on the left and artificial light sources (the wall sconces and possibly an off-camera key light). The main light source seems to be from the front-left, casting soft shadows that define the contours of their faces and bodies. The wall sconces add practical, ambient warmth to the scene. The quality of light significantly enhances the emotional tone.\n*   **Any Technical Issues**: There are no significant technical issues like motion blur, excessive noise, or noticeable distortion. The \"WIN\" watermarks indicate this is likely a still from a video or film, which explains the specific aspect ratio and possibly the controlled lighting setup.\n\n**4. Artistic Composition**:\n*   **Rule of Thirds, Leading Lines, Framing**: The couple is positioned roughly along the left vertical third line, effectively using the rule of thirds to place the primary subject. Their faces are near the upper-left intersection point, drawing the eye. While there are no strong leading lines, the natural framing provided by the curtains on the left and the mirror/wall elements on the right gently contains the scene.\n*   **Balance between foreground, middle ground, and background**: The middle ground, occupied by the couple, is the clear focal point. The background elements (curtains, wall decor) are softly blurred, providing contextual information without competing. The shallow depth of field maintains this separation effectively. The wooden structure in the extreme foreground on the right adds a subtle layer of depth.\n*   **Color harmony or black & white treatment**: The color harmony is exceptional. The earthy tones of the wall and clothing, combined with the warm artificial light, create a cohesive and inviting palette that perfectly underscores the intimate mood.\n*   **Cropping and Aspect Ratio Choices**: The wide cinematic aspect ratio (likely 16:9) is well-utilized, allowing for ample negative space around the subjects. This space is not empty but filled with elements that contribute to the story and atmosphere, such as the children's drawings, without feeling cramped. The cropping feels intentional and balanced.\n*   **Visual flow and eye movement through the image**: The eye is immediately drawn to the sharply focused faces of the couple and their embracing forms. From there, it gently explores the surrounding elements, particularly the warm glow of the wall sconces and the intriguing blur of the mirror, before returning to the emotional core of the image. The composition subtly guides the viewer's gaze.\n\n**5. Strengths**:\n*   **Powerful Emotional Connection**: The image's strongest asset is its ability to convey profound love, comfort, and intimacy. The subjects' expressions and their embrace are incredibly genuine and relatable.\n*   **Masterful Use of Light and Color**: The warm, soft lighting and harmonious color palette create an incredibly inviting, cozy, and serene atmosphere that perfectly complements the subject matter.\n*   **Effective Depth of Field**: The shallow depth of field beautifully isolates the subjects, ensuring they remain the undeniable focal point while allowing the background to provide rich, subtle context.\n*   **Subtle Storytelling**: The inclusion of elements like children's drawings and a crib/bedside table in the background adds layers of narrative, suggesting a family and a shared life, enhancing the emotional depth of the embrace.\n*   **Strong Composition**: The balance between the subjects and the environment is well-achieved, providing visual interest and guiding the viewer's eye without feeling cluttered.\n\n**6. Areas for Improvement**:\n*   **Watermark Removal**: For a standalone photograph, the \"WIN\" watermarks are distracting. While likely a result of the image's source (film/video still), for a portfolio piece, these would ideally be removed or cropped out.\n*   **Foreground Element Refinement**: The very dark, indistinct wooden element in the extreme bottom-right foreground is slightly distracting and doesn't add significantly to the narrative. A slightly tighter crop from the right, or a different angle that excludes it entirely, could subtly improve the composition.\n*   **Highlight Control in Sconces (Minor)**: While not blown out, the light from the sconces is quite bright. A very subtle local adjustment in post-processing to gently pull back their highlights could ensure they don't compete for attention quite as much with the subjects' faces, though they do contribute well to the ambiance.\n*   **Mirror Reflection Clarity (Contextual)**: While the blurred reflection works to maintain focus on the couple, if there was an opportunity to have a slightly more discernible, yet still subtle, element within the mirror that contributed even more directly to the narrative (e.g., a faint reflection of the child's room), it could add another layer. However, this is a very specific creative choice and not a flaw in the current execution.\n\n**7. Overall Assessment**:\nThis is a truly beautiful and impactful photograph. Its strongest quality is its ability to capture and convey a deep sense of emotional connection and intimate comfort between the subjects. The exceptional use of warm lighting, color harmony, and selective focus makes it an incredibly inviting and visually appealing image. It effectively tells a story of love, family, and domestic peace in a very subtle yet powerful way.\n\n**Overall Impact and Effectiveness Rating**: Highly effective. It achieves its emotional and artistic goals with significant success, creating a memorable and heartwarming visual narrative. The photographer (or cinematographer) demonstrated a strong understanding of how to use light, composition, and environmental cues to evoke a rich emotional response.",
    # suggestions="Based on the comprehensive critique, here are specific, actionable improvement suggestions for the photograph, organized by category:\n\n---\n\n### Specific, Actionable Improvement Suggestions\n\n#### **Technical Improvements (Minor Refinements & Future Considerations):**\n\n*   **Subtle Highlight Control:** While the highlights in the wall sconces are not blown out, apply a very subtle localized adjustment (e.g., using a brush or radial filter in editing software) to gently reduce their brightness. This ensures they continue to provide warm ambient light but do not compete for attention with the subjects' faces.\n*   **Optimize Source for Stills:** If this image was indeed extracted from a video, for future dedicated still photography, prioritize using a camera and settings specifically optimized for high-resolution, high-quality stills. This ensures maximum detail and dynamic range, avoiding potential artifacts or resolution limitations inherent in video extracts.\n\n#### **Composition Enhancements:**\n\n*   **Refine Foreground Element:**\n    *   **During Shoot:** Pay meticulous attention to elements in the extreme foreground. The dark, indistinct wooden structure in the bottom-right corner is slightly distracting. In future shoots, consider repositioning the subjects or adjusting your camera angle to either exclude such ambiguous elements entirely or ensure they are clearly identifiable and contribute positively to the narrative.\n    *   **Post-processing:** Implement a very subtle, clean crop from the bottom-right corner to eliminate or minimize the visual impact of the indistinct wooden element. This will subtly clean up the frame and ensure the viewer's eye remains focused on the emotional core.\n*   **Experiment with Framing for Intimacy:** While the current framing is strong, for future shoots, consider slightly tighter crops or alternative angles that focus even more intensely on the couple's expressions and embrace. This could involve filling more of the frame with their forms, potentially leading to an even more immersive and intimate viewer experience.\n\n#### **Post-processing Recommendations:**\n\n*   **Remove Distracting Watermarks:** For any image intended for a portfolio, public display, or competition, diligently remove the \"WIN\" watermarks using cloning, healing, or content-aware fill tools in your editing software. This is the single most impactful post-processing step for professional presentation.\n*   **Selective Clarity/Texture Adjustments:** While the overall softness is intentional, consider a very subtle increase in clarity or texture specifically on the subjects' faces and hands (if desired) to slightly enhance detail and make their expressions pop even more, without losing the overall gentle atmosphere.\n*   **Refine Color Grade (Optional Exploration):** The current warm, cinematic grade is effective. However, for future variations, experiment with slightly different color grading techniques (e.g., cooler tones for a different mood, or a more vibrant, high-key look) to broaden your artistic range while maintaining a similar emotional impact.\n\n#### **Creative Suggestions:**\n\n*   **Leverage Reflections for Narrative Depth:** If a mirror is present in future settings, explore creative ways to use its reflection to add specific, even if subtly blurred, narrative elements. For instance, a faint reflection of a child's toy, a significant family object, or a wider view of the cozy room could subtly deepen the story and provide additional context without distracting from the main subjects.\n*   **Explore Varied Emotional Moments:** While this image beautifully captures quiet intimacy, challenge yourself to capture different facets of love and connection within a similar domestic setting. This could include moments of shared laughter, playful interaction, or quiet contemplation, expanding the emotional range of your storytelling.\n*   **Dynamic Posing and Interaction:** Encourage the subjects to engage in slightly more dynamic interactions if appropriate for the story, such as leaning into each other more profoundly, a gentle touch of their foreheads, or hands intertwined. These subtle shifts can convey different layers of their relationship.\n\n#### **Equipment or Technique Recommendations for Future Shoots:**\n\n*   **Mastering Ambient & Artificial Light Blending:** Continue to refine your technique for blending natural and artificial light sources (like the wall sconces) to create soft, flattering, and atmospheric illumination. Experiment with light modifiers (e.g., diffusers, softboxes) to control the quality and direction of light precisely, replicating the warm, cozy glow achieved here.\n*   **Lens Selection for Desired Depth of Field:** Continue to utilize lenses with wide apertures (e.g., f/1.8, f/2.8) to achieve the beautiful shallow depth of field that isolates your subjects so effectively. Experiment with different prime focal lengths (e.g., 50mm, 85mm) to understand how they influence subject compression and background blur, tailoring the look to your artistic vision.\n*   **Controlled Environment Setup:** For intimate indoor shoots, maintain a focus on thoughtfully arranging your environment. This includes strategic placement of background elements (like curtains, wall art) and foreground props to enhance the story and mood without creating clutter. Every element should serve a purpose in reinforcing the narrative.\n*   **Tripod for Maximum Sharpness:** Although not explicitly stated as an issue, using a tripod, especially in lower light or when aiming for absolute critical sharpness, can help eliminate any subtle camera shake and ensure the sharpest possible image, particularly for the focal point."
    # llm_output = build_search_queries(critique,suggestions)
    # print(llm_output)
    # print(parse_search_queries(llm_output))