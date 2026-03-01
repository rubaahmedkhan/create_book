"""Qdrant service for vector search."""

from typing import List, Dict, Any
from qdrant_client import QdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchValue, SearchParams

from app.config import get_settings
from app.utils.logging import get_logger
from app.utils.error_handlers import QdrantError

logger = get_logger("qdrant_service")
settings = get_settings()


class QdrantService:
    """Service for interacting with Qdrant vector database."""

    def __init__(self, client: QdrantClient):
        self.client = client
        self.collection_name = settings.collection_name

    async def search_chunks(
        self,
        query_vector: List[float],
        limit: int = None,
        score_threshold: float = None,
        filter_conditions: Dict[str, Any] = None
    ) -> List[Dict[str, Any]]:
        """
        Search for relevant textbook chunks using semantic similarity.

        Args:
            query_vector: Embedding vector for the query
            limit: Maximum number of results (default from settings)
            score_threshold: Minimum similarity score (default from settings)
            filter_conditions: Optional metadata filters

        Returns:
            List of matching chunks with metadata and scores

        Raises:
            QdrantError: If search fails
        """
        try:
            limit = limit or settings.search_limit
            score_threshold = score_threshold or settings.score_threshold

            logger.info(f"Searching Qdrant (limit: {limit}, threshold: {score_threshold})")

            # Build filter if conditions provided
            search_filter = None
            if filter_conditions:
                # Example: {"module": "module1-ros2"}
                conditions = [
                    FieldCondition(
                        key=key,
                        match=MatchValue(value=value)
                    )
                    for key, value in filter_conditions.items()
                ]
                search_filter = Filter(must=conditions)

            # Perform search using query_points
            search_results = self.client.query_points(
                collection_name=self.collection_name,
                query=query_vector,
                limit=limit,
                score_threshold=score_threshold,
                query_filter=search_filter,
                with_payload=True
            ).points

            # Format results
            chunks = []
            for result in search_results:
                chunk = {
                    "id": result.id,
                    "content": result.payload.get("content", ""),
                    "score": result.score,
                    "metadata": {
                        "module": result.payload.get("module", ""),
                        "week": result.payload.get("week", ""),
                        "tutorial_file": result.payload.get("tutorial_file", ""),
                        "section_title": result.payload.get("section_title", ""),
                        "url_path": result.payload.get("url_path", ""),
                    }
                }
                chunks.append(chunk)

            logger.info(f"[OK] Found {len(chunks)} matching chunks")

            return chunks

        except Exception as e:
            logger.error(f"[ERROR] Qdrant search failed: {e}")
            raise QdrantError("Failed to search Qdrant", {"error": str(e)})

    def get_collection_info(self) -> Dict[str, Any]:
        """
        Get information about the collection.

        Returns:
            Collection information

        Raises:
            QdrantError: If operation fails
        """
        try:
            collection = self.client.get_collection(self.collection_name)
            return {
                "name": collection.config.params.name,
                "vectors_count": collection.points_count,
                "vector_size": collection.config.params.vectors.size,
                "distance": collection.config.params.vectors.distance.name
            }
        except Exception as e:
            logger.error(f"[ERROR] Failed to get collection info: {e}")
            raise QdrantError("Failed to get collection info", {"error": str(e)})
