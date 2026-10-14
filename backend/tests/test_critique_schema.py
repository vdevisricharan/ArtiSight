"""Unit tests for Pydantic schema validation."""

import pytest
from app.schemas.critique_schema import (
    ScoreDimension,
    CategoryScores,
    CritiqueSummary,
    ActionableRecommendation,
    FullCritiqueResponse,
    ImageDimensions,
    OpenCVAnalysis,
    ExifMetadata,
    AnalysisMetadata
)
from app.services.critique_service import render_markdown_critique


def test_score_dimension_validation():
    # Valid score
    score = ScoreDimension(value=8.54, rationale="Great framing")
    assert score.value == 8.5
    assert score.rationale == "Great framing"

    # Score out of bounds should raise ValidationError
    with pytest.raises(Exception):
        ScoreDimension(value=11.0, rationale="Too high")

    with pytest.raises(Exception):
        ScoreDimension(value=-1.0, rationale="Negative")


def test_render_markdown_critique():
    summary = CritiqueSummary(
        title="Dramatic Coastal Scene",
        observations=["Clean horizon", "Strong foreground rocks"],
        strengths=["Excellent exposure balance"],
        improvements=["Consider shifting camera slightly lower"]
    )
    scores = CategoryScores(
        composition=ScoreDimension(value=8.0, rationale="Good use of thirds"),
        lighting=ScoreDimension(value=7.5, rationale="Gentle golden hour light"),
        focus=ScoreDimension(value=9.0, rationale="Pin sharp foreground to horizon"),
        color=ScoreDimension(value=8.5, rationale="Natural marine hues"),
        storytelling=ScoreDimension(value=7.0, rationale="Evocative solitary atmosphere"),
        overall=ScoreDimension(value=8.0, rationale="Strong landscape image")
    )
    recs = [
        ActionableRecommendation(
            problem="Horizon slightly tilts 1 degree",
            evidence="Sea level drops toward the right frame",
            why_it_matters="Level horizons maintain visual equilibrium in seascapes",
            recommendation="Enable electronic level in viewfinder or rotate in post",
            exercise="Shoot 5 consecutive seascapes using a grid overlay",
            expected_outcome="Instinctive horizon leveling",
            learning_topic="Composition"
        )
    ]

    md = render_markdown_critique(summary, scores, recs)
    assert "# Dramatic Coastal Scene" in md
    assert "**Overall Score:** 8.0/10" in md
    assert "Composition (8.0/10)" in md
    assert "Recommended Practice Exercises" in md
