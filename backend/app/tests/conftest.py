import os

# Dummy settings so the app can be imported without a .env file. Tests never touch a real DB.
os.environ.setdefault("POSTGRES_USER", "test")
os.environ.setdefault("POSTGRES_PASSWORD", "test")
os.environ.setdefault("POSTGRES_DB", "test")
