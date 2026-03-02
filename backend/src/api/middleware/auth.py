from fastapi import Request, HTTPException, status
from sqlalchemy import text
from src.db.database import SessionLocal

async def validate_session(request: Request) -> str:
    """
    Validate session by querying the session table shared with Better Auth.
    Returns user_id if session is valid, raises HTTPException if not.
    """
    # Extract session token from cookie
    session_token_full = request.cookies.get("better-auth.session_token")

    print(f"DEBUG: All cookies: {request.cookies}")
    print(f"DEBUG: Session token full: {session_token_full}")

    if not session_token_full:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No active session"
        )

    # Better Auth cookie format is: token.signature
    # Database only stores the token part
    session_token = session_token_full.split(".")[0]
    print(f"DEBUG: Session token (first part): {session_token}")
    
    # Query session table (managed by Better Auth)
    db = SessionLocal()
    try:
        result = db.execute(
            text('SELECT "userId" FROM session WHERE token = :token AND "expiresAt" > NOW()'),
            {"token": session_token}
        )
        session = result.fetchone()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired session"
            )
        
        return session[0]  # user_id
    finally:
        db.close()
