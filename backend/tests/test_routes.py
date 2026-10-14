"""Integration tests for Flask API routes."""

import io
import pytest
from PIL import Image
from app import create_app


@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "healthy"
    assert data["version"] == "2.0.0"
    assert "model" in data
    assert "searchProvider" in data


def test_analyze_no_file(client):
    response = client.post("/api/v2/analyze")
    assert response.status_code == 400
    data = response.get_json()
    assert "error" in data


def test_analyze_invalid_extension(client):
    data = {
        "file": (io.BytesIO(b"fake script"), "test.exe")
    }
    response = client.post(
        "/api/v2/analyze",
        data=data,
        content_type="multipart/form-data"
    )
    assert response.status_code == 400
    assert "Unsupported format" in response.get_json()["error"]


def test_analyze_corrupted_image(client):
    data = {
        "file": (io.BytesIO(b"this is definitely not a real image"), "fake.jpg")
    }
    response = client.post(
        "/api/v2/analyze",
        data=data,
        content_type="multipart/form-data"
    )
    assert response.status_code == 400
    assert "corrupted" in response.get_json()["error"].lower()


def test_legacy_suggest_endpoint(client):
    response = client.post(
        "/suggest",
        json={"critique": "The composition is well balanced."}
    )
    assert response.status_code == 200
    data = response.get_json()
    assert "suggestions" in data


def test_legacy_resources_endpoint(client):
    response = client.post(
        "/resources",
        json={
            "critique": "Highlights are slightly blown.",
            "suggestions": "Lower exposure compensation."
        }
    )
    assert response.status_code == 200
    data = response.get_json()
    assert "webResults" in data
    assert len(data["webResults"]) > 0
