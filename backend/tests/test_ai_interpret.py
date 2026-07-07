from unittest.mock import patch

from app.services import ai_interpret


def test_explain_results_no_api_key_returns_fallback_without_raising():
    with patch.object(ai_interpret.settings, "anthropic_api_key", ""):
        result = ai_interpret.explain_results("mutations", {"variants": []})
    assert "no ANTHROPIC_API_KEY" in result


def test_explain_results_api_failure_returns_fallback_instead_of_raising():
    # Regression test: an unhandled exception from the Anthropic call used to
    # propagate out of explain_results, which meant create_analysis's already
    # -correct deterministic results were discarded and the whole save failed.
    with patch.object(ai_interpret.settings, "anthropic_api_key", "sk-test-key"):
        with patch.object(ai_interpret, "_client", side_effect=RuntimeError("boom")):
            result = ai_interpret.explain_results("mutations", {"variants": []})
    assert result == ai_interpret.FALLBACK_MESSAGE


def test_explain_results_success_returns_model_text():
    class FakeBlock:
        type = "text"
        text = "This is a missense mutation."

    class FakeResponse:
        content = [FakeBlock()]

    class FakeMessages:
        def create(self, **kwargs):
            return FakeResponse()

    class FakeClient:
        messages = FakeMessages()

    with patch.object(ai_interpret.settings, "anthropic_api_key", "sk-test-key"):
        with patch.object(ai_interpret, "_client", return_value=FakeClient()):
            result = ai_interpret.explain_results("mutations", {"variants": []}, sequence_label="HBB")
    assert result == "This is a missense mutation."
