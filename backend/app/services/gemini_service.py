from google import genai
from app.config.settings import settings


def _get_client():
    if not settings.GEMINI_API_KEY:
        return None
    try:
        return genai.Client(api_key=settings.GEMINI_API_KEY)
    except Exception as e:
        print(f"Failed to initialize Gemini Client: {e}")
        return None


def _generate_with_model(client, prompt: str, model: str) -> str:
    response = client.models.generate_content(
        model=model,
        contents=prompt,
    )

    if not response.text:
        raise RuntimeError(f"{model} returned an empty response.")

    return response.text.strip()


def generate_summary(prompt: str) -> str:
    client = _get_client()
    if not client:
        raise RuntimeError(
            "GEMINI_API_KEY is not configured in backend environment."
        )

    try:
        # Try primary model
        return _generate_with_model(
            client,
            prompt,
            settings.GEMINI_MODEL,
        )

    except Exception as primary_error:
        print(
            f"Primary Gemini model failed "
            f"({settings.GEMINI_MODEL}): {primary_error}"
        )

        try:
            # Try fallback model
            return _generate_with_model(
                client,
                prompt,
                settings.GEMINI_FALLBACK_MODEL,
            )

        except Exception as fallback_error:
            print(
                f"Fallback Gemini model failed "
                f"({settings.GEMINI_FALLBACK_MODEL}): {fallback_error}"
            )

            raise RuntimeError(
                "AI summary generation is temporarily unavailable."
            ) from fallback_error