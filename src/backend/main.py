from fastapi import FastAPI
from app.core.config import settings
from app.api.main import api_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title=settings.PROJECT_NAME)

print("CORS origins:", settings.all_cors_origins)

# Set all CORS enabled origins
if settings.all_cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.all_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Print all CORS origins on startup

app.include_router(api_router, prefix=f"{settings.API_STR}")