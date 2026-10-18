
import os
from pathlib import Path

import mysql.connector
from dotenv import load_dotenv

# Load database credentials from .env
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


def get_db_connection():
    connection = mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", "3306")),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME", "task_management")
    )
    return connection


# Test the MySQL connection
if __name__ == "__main__":
    try:
        db = get_db_connection()
        print("MySQL database connected successfully!")
        db.close()
    except mysql.connector.Error as error:
        print("Database connection failed:", error)
