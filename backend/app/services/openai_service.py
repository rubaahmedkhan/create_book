"""OpenAI service for embeddings and completions."""

from typing import List
from openai import AsyncOpenAI

from app.config import get_settings
from app.utils.logging import get_logger
from app.utils.error_handlers import OpenAIError

logger = get_logger("openai_service")
settings = get_settings()


class OpenAIService:
    """Service for interacting with OpenAI API."""

    def __init__(self, client: AsyncOpenAI):
        self.client = client

    async def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding vector for given text.

        Args:
            text: Input text to embed

        Returns:
            Embedding vector (1536-dimensional for text-embedding-3-small)

        Raises:
            OpenAIError: If embedding generation fails
        """
        try:
            logger.info(f"Generating embedding for text (length: {len(text)})")

            response = await self.client.embeddings.create(
                model=settings.embedding_model,
                input=text,
                dimensions=settings.embedding_dimensions
            )

            embedding = response.data[0].embedding
            logger.info(f"[OK] Generated embedding (dimension: {len(embedding)})")

            return embedding

        except Exception as e:
            logger.error(f"[ERROR] Failed to generate embedding: {e}")
            raise OpenAIError("Failed to generate embedding", {"error": str(e)})

    async def generate_response(
        self,
        prompt: str,
        retrieved_chunks: List[dict],
        conversation_history: List[dict] = None
    ) -> str:
        """
        Generate chatbot response using OpenAI API.

        Args:
            prompt: User question
            retrieved_chunks: List of retrieved textbook chunks
            conversation_history: Previous messages for context

        Returns:
            Generated response text

        Raises:
            OpenAIError: If response generation fails
        """
        try:
            logger.info(f"Generating response for prompt (chunks: {len(retrieved_chunks)})")

            # Construct context from retrieved chunks
            context_parts = []
            for i, chunk in enumerate(retrieved_chunks, 1):
                source = chunk.get("metadata", {})
                content = chunk.get("content", "")
                context_parts.append(f"[Source {i}]\n{content}")

            context = "\n\n".join(context_parts)

            # System prompt with strict grounding instruction
            system_prompt = """You are a helpful AI assistant for the Physical AI & Humanoid Robotics textbook.

CRITICAL RULES:
1. Answer questions ONLY using the provided textbook excerpts below
2. NEVER use external knowledge or information not in the excerpts
3. If the excerpts don't contain enough information, say "I don't have enough information in the textbook to answer this question"
4. Always cite sources using [Source N] notation when referencing information
5. Be concise but accurate

Your goal is to help students learn by providing accurate answers grounded in the textbook content."""

            # Build messages
            messages = [
                {"role": "system", "content": system_prompt},
            ]

            # Add conversation history if available
            if conversation_history:
                messages.extend(conversation_history[-3:])  # Last 3 messages for context

            # Add current query with context
            user_message = f"""EXCERPTS FROM TEXTBOOK:
{context}

QUESTION: {prompt}

Please answer the question using ONLY the information in the excerpts above. Cite your sources using [Source N] notation."""

            messages.append({"role": "user", "content": user_message})

            # Generate response using OpenRouter
            response = await self.client.chat.completions.create(
                model=settings.completion_model,  # deepseek/deepseek-chat (free unlimited)
                messages=messages,
                temperature=0.3,  # Lower temperature for more factual responses
                max_tokens=1000
            )

            answer = response.choices[0].message.content
            logger.info(f"[OK] Generated response (length: {len(answer)})")

            return answer

        except Exception as e:
            logger.error(f"[ERROR] Failed to generate response: {e}")
            raise OpenAIError("Failed to generate response", {"error": str(e)})
