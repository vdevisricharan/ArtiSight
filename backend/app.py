from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import os
from google import genai
from google.genai import types
import requests
import base64
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)  # This is to allow cross-origin requests from your React frontend

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
GOOGLE_CSE_ID = os.getenv('GOOGLE_CSE_ID')

if not GEMINI_API_KEY:
    raise RuntimeError('GEMINI_API_KEY environment variable not set')

gemini_client = genai.Client(api_key=GEMINI_API_KEY)
GEMINI_MODEL = "gemini-2.5-flash-preview-05-20"

# Set up the model
generation_config = {
  "temperature": 0.9,
  "top_p": 1,
  "top_k": 1,
  "max_output_tokens": 2048,
}

safety_settings = [
  {
    "category": "HARM_CATEGORY_HARASSMENT",
    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
  },
  {
    "category": "HARM_CATEGORY_HATE_SPEECH",
    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
  },
  {
    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
  },
  {
    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
  },
]
# This is the route that will be called when the user visits the home page

@app.route('/')
def hello_world():
    return 'Hello, World!'

# This is the route that will be called when the user uploads a file
@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        if file:
            # Save the file to a temporary location
            temp_path = "temp_uploaded_image.jpg"
            file.save(temp_path)
            try:
                # Upload the file to Gemini
                gemini_file = gemini_client.files.upload(file=temp_path)
            except Exception as e:
                return jsonify({'error': f'Gemini file upload failed: {str(e)}'}), 500

            critique_prompt = """
            Please provide a detailed critique of the uploaded photo following these specific steps:
            1. Look: Examine the photograph closely and note any significant details or elements.
            2. Interpretation: Describe your emotional response and what the photo might be conveying. Mention any symbolism or themes that appear evident to you.
            3. Technical Points: Evaluate technical aspects like exposure, focus, color accuracy, and contrast. Comment on the use of lighting, the chosen aperture, and any visible issues like dust or unwanted blur.
            4. Artistic Points: Discuss the composition, crop, and aspect ratio. Share your thoughts on the balance between the foreground and background, the choice of color or black and white, and the overall aesthetic decisions.
            5. Good Points: Identify and explain what you particularly like about the photograph, focusing on why these elements work well within the context of the image.
            6. Points Worth Improving: Suggest specific improvements or changes that could enhance the photograph. These could include adjustments that might be possible in post-processing or general photographic advice for future consideration.
            7. Overall Impression: Sum up your overall impression of the photograph and its impact.
            """

            contents = [
                critique_prompt,
                gemini_file
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
                    response_text += chunk.text or ""
                return jsonify({'critique': response_text})
            except Exception as e:
                return jsonify({'error': f'Gemini API error: {str(e)}'}), 500
            finally:
                # Clean up the temp file
                if os.path.exists(temp_path):
                    os.remove(temp_path)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/suggest', methods=['POST'])
def suggest_improvements():
    try:
        data = request.get_json()
        if not data or 'critique' not in data:
            return jsonify({'error': 'Critique text is missing'}), 400
        critique_text = data['critique']
        contents = [
            types.Content(
                role="user",
                parts=[
                    types.Part.from_text(text=f"Provide bullet points on how to improve based on the following critique:\n{critique_text}"),
                ],
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
                response_text += chunk.text or ""
            return jsonify({'suggestions': response_text})
        except Exception as e:
            return jsonify({'error': f'Gemini API error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def google_search(query, search_type=None):
    url = "https://www.googleapis.com/customsearch/v1"
    params = {
        'key': GOOGLE_API_KEY,
        'cx': GOOGLE_CSE_ID,
        'q': query,
        'num': 2
    }
    if search_type:
        params['searchType'] = search_type
    response = requests.get(url, params=params)
    results = response.json()
    return results

def build_search_query(data):
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text=f"Give five google search queries in bullet points to learn from, according the photo critique and suggestions on improving\nCritique: {data['critique']}\nSuggestions: {data['suggestions']}")
            ],
        ),
    ]
    generate_content_config = types.GenerateContentConfig(
        response_mime_type="text/plain",
    )
    response_text = ""
    for chunk in gemini_client.models.generate_content_stream(
        model=GEMINI_MODEL,
        contents=contents,
        config=generate_content_config,
    ):
        response_text += chunk.text or ""
    return response_text

@app.route('/resources', methods=['POST'])
def get_resources():
    try:
        data = request.get_json()
        if not data or 'critique' not in data or 'suggestions' not in data:
            return jsonify({'error': 'Missing required data'}), 400

        search_queries = build_search_query(data)
        print(search_queries)
        top_results = []
        for query in search_queries.strip().split('\n'):
            if query.startswith("- "):
                cleaned_query = query[2:]
            else:
                cleaned_query = query
            
            try:
                web_results = google_search(cleaned_query).get('items', [])
                for result in web_results:
                    if 'pagemap' in result and 'cse_thumbnail' in result['pagemap'] and result['pagemap']['cse_thumbnail']:
                        thumbnail_src = result['pagemap']['cse_thumbnail'][0]['src']
                        top_results.append({
                            'title': result.get('title', 'No title available'),
                            'link': result.get('link', '#'),
                            'thumbnail': thumbnail_src
                        })
            except Exception as e:
                print(f"Error processing query {cleaned_query}: {str(e)}")
        return jsonify({
            'webResults': top_results,
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
