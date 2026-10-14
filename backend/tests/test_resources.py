"""Unit tests for educational resources service."""

from app.services.resource_service import get_personalized_resources, CURATED_PHOTOGRAPHY_RESOURCES


def test_get_personalized_resources_fallback():
    # Should return relevant curated resources based on topics
    resources = get_personalized_resources(
        learning_topics=["Composition", "Rule of Thirds"],
        weaknesses=["Subject placement could be stronger"],
        max_resources=4
    )

    assert len(resources) > 0
    assert len(resources) <= 4
    for r in resources:
        assert r.title
        assert r.link.startswith("http")
        assert r.displayLink
        assert r.snippet


def test_get_personalized_resources_deduplication():
    # Repeated calls or duplicate topics should not duplicate URLs
    resources = get_personalized_resources(
        learning_topics=["Lighting", "Lighting", "Exposure"],
        weaknesses=["Blown highlights"],
        max_resources=6
    )
    urls = [r.link for r in resources]
    assert len(urls) == len(set(urls))
