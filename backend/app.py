from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import os
import google.generativeai as genai
import requests

app = Flask(__name__)
CORS(app)  # This is to allow cross-origin requests from your React frontend

API_KEY = os.getenv('API_KEY')
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
GOOGLE_CSE_ID = os.getenv('GOOGLE_CSE_ID')
genai.configure(api_key=API_KEY)

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
        # Check if the post request has the file part
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400

        file = request.files['file']

        # If the user does not select a file, the browser submits an
        # empty file without a filename.
        
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        if file:
            image = Image.open(file.stream)
            vision_model = genai.GenerativeModel(model_name='gemini-1.5-pro-latest',generation_config=generation_config,safety_settings=safety_settings)
            # Define the detailed critique prompt
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

            response = vision_model.generate_content([critique_prompt, image])
            return jsonify({'critique': response.text})

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/suggest', methods=['POST'])
def suggest_improvements():
    try:
        # Parsing the critique from the request JSON
        data = request.get_json()
        if not data or 'critique' not in data:
            return jsonify({'error': 'Critique text is missing'}), 400

        critique_text = data['critique']
        
        # Assuming the use of an appropriate model to generate suggestions
        suggestion_model = genai.GenerativeModel('gemini-1.5-pro-latest')
        response = suggestion_model.generate_content(
            ["Provide bullet points on how to improve based on the following critique:", critique_text]
        )

        return jsonify({'suggestions': response.text})
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
    genai.configure(api_key=API_KEY)
    model = genai.GenerativeModel('gemini-1.0-pro')
    response = model.generate_content(
        ["Give five google search queries in bullet points to learn from, according the photo critique and suggestions on improving", data['critique'], data['suggestions']]
    )
    return response.text

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
