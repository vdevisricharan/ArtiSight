from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import io
import os
import google.generativeai as genai

app = Flask(__name__)
CORS(app)  # This is to allow cross-origin requests from your React frontend

API_KEY = os.getenv('API_KEY')
genai.configure(api_key=API_KEY)

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
            vision_model = genai.GenerativeModel('gemini-pro-vision')
            response = vision_model.generate_content(
                ["Give a critique of the photo and how the photographer could have improved the shot or how the photographer could have edited the shot to make it look better. Use Technical terms like ISO, Aperture, Shutter Speed, Focal Length, Exposure, etc.", image]
            )
            return jsonify({'critique': response.text})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
