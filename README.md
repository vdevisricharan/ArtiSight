# ArtiSight

ArtiSight is a full-stack web application that combines a React frontend with a Python backend to provide an interactive art analysis and visualization platform.

## Project Structure

```
ArtiSight/
├── artisight/          # Frontend (React + Vite)
├── backend/           # Backend (Python)
└── README.md         # This file
```

## Prerequisites

- Node.js (v16 or higher)
- Python 3.8 or higher
- Docker and Docker Compose (for containerized deployment)

## Development Setup

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd artisight
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the backend server:
   ```bash
   python app.py
   ```

## Docker Deployment

You can run the entire application using Docker Compose:

1. Build and start the containers:
   ```bash
   docker-compose up --build
   ```

2. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## Environment Variables

### Backend
Create a `.env` file in the backend directory with:
```
FLASK_ENV=development
FLASK_APP=app.py
```

### Frontend
Create a `.env` file in the artisight directory with:
```
VITE_API_URL=http://localhost:5000
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

## Additional Resources
- [Presentation Slides](ArtiSight%20Presentation.pdf)
- [Project Report](ArtiSight%20Report.pdf)
- [Video Demo](ArtiSight%20Demo.mp4)
