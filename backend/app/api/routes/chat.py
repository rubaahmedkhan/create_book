"""Chat API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID

from app.models.conversation import QueryRequest, QueryResponse
from app.services.openai_service import OpenAIService
from app.services.qdrant_service import QdrantService
from app.services.postgres_service import PostgresService
from app.services.rag_service import RAGService
from app.api.dependencies import get_openai_client, get_qdrant_client, get_postgres_pool
from app.utils.logging import get_logger
from app.utils.error_handlers import (
    ChatbotError,
    OpenAIError,
    QdrantError,
    PostgresError,
    ValidationError,
    ServiceUnavailableError,
    RateLimitError
)

router = APIRouter()
logger = get_logger("chat")


async def get_rag_service(
    openai_client=Depends(get_openai_client),
    qdrant_client=Depends(get_qdrant_client),
    postgres_pool=Depends(get_postgres_pool)
) -> RAGService:
    """
    Dependency injection for RAG service.

    Returns:
        Configured RAGService instance
    """
    openai_service = OpenAIService(openai_client)
    qdrant_service = QdrantService(qdrant_client)
    postgres_service = PostgresService(postgres_pool)

    return RAGService(
        openai_service=openai_service,
        qdrant_service=qdrant_service,
        postgres_service=postgres_service
    )


@router.post("/api/chat/query", response_model=QueryResponse)
async def query_chatbot(
    request: QueryRequest,
    rag_service: RAGService = Depends(get_rag_service)
):
    """
    Submit a question to the chatbot and receive an answer with citations.

    Args:
        request: Query request with question and optional context

    Returns:
        QueryResponse with answer, citations, and conversation ID

    Raises:
        HTTPException: For various error conditions
    """
    try:
        logger.info(f"[IN] Received query: '{request.question[:50]}...'")

        # Validate request
        if not request.question.strip():
            raise ValidationError("Question cannot be empty")

        # Process query through RAG pipeline
        response = await rag_service.orchestrate_query(request)

        logger.info(f"[OUT] Returning response with {len(response.citations)} citations")
        return response

    except ValidationError as e:
        logger.error(f"Validation error: {e.message}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=e.message
        )

    except RateLimitError as e:
        logger.error(f"Rate limit exceeded: {e.message}")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=e.message
        )

    except (OpenAIError, QdrantError, PostgresError, ServiceUnavailableError) as e:
        logger.error(f"Service error: {e.message}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Service temporarily unavailable: {e.message}"
        )

    except ChatbotError as e:
        logger.error(f"Chatbot error: {e.message}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=e.message
        )

    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )


@router.get("/api/chat/conversations/{conversation_id}")
async def get_conversation_history(
    conversation_id: UUID,
    rag_service: RAGService = Depends(get_rag_service)
):
    """
    Get conversation history by ID.

    Args:
        conversation_id: Conversation UUID

    Returns:
        Conversation with message history

    Raises:
        HTTPException: If conversation not found or error occurs
    """
    try:
        # Get conversation
        conversation = await rag_service.postgres_service.get_conversation(conversation_id)

        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Conversation {conversation_id} not found"
            )

        # Get messages
        messages = await rag_service.postgres_service.get_conversation_history(
            conversation_id=conversation_id,
            limit=50
        )

        return {
            "conversation": conversation.model_dump(),
            "messages": [msg.model_dump() for msg in messages]
        }

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Failed to get conversation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve conversation"
        )


@router.delete("/api/chat/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: UUID,
    rag_service: RAGService = Depends(get_rag_service)
):
    """
    Delete a conversation and all its messages.

    Args:
        conversation_id: Conversation UUID

    Returns:
        Success message

    Raises:
        HTTPException: If deletion fails
    """
    try:
        # Note: Messages will be deleted automatically via CASCADE
        async with rag_service.postgres_service.pool.acquire() as conn:
            result = await conn.execute(
                "DELETE FROM conversations WHERE id = $1",
                conversation_id
            )

            if result == "DELETE 0":
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Conversation {conversation_id} not found"
                )

            logger.info(f"[OK] Deleted conversation: {conversation_id}")
            return {"message": "Conversation deleted successfully"}

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Failed to delete conversation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete conversation"
        )
