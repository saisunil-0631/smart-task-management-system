from fastapi.middleware.cors import CORSMiddleware
from datetime import date
from typing import Literal

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from mysql.connector import Error

from backend.Database import get_db_connection

app = FastAPI(title="Smart Task Management System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type"],
)



class Task(BaseModel):
    title: str
    description: str | None = None
    priority: Literal["low", "medium", "high"] = "medium"
    status: Literal["pending", "completed"] = "pending"
    due_date: date | None = None
    category: Literal["Work", "Personal", "Study", "Other"] = "Other"


@app.get("/")
def home():
    return {"message": "Smart Task Management API is running"}


@app.get("/test-db")
def test_database():
    connection = None
    try:
        connection = get_db_connection()
        return {"message": "MySQL connected successfully!"}
    except Error:
        raise HTTPException(
            status_code=500,
            detail="Database connection failed"
        )
    finally:
        if connection is not None:
            connection.close()


@app.post("/tasks", status_code=201)
def create_task(task: Task):
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            INSERT INTO tasks
            (title, description, priority, status, due_date, category)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                task.title,
                task.description,
                task.priority,
                task.status,
                task.due_date,
                task.category
            )
        )

        connection.commit()
        return {
            "message": "Task created successfully",
            "task_id": cursor.lastrowid
        }

    except Error:
        raise HTTPException(status_code=500, detail="Could not create task")
    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None:
            connection.close()


@app.get("/tasks")
def get_tasks():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM tasks ORDER BY id DESC")

        return {"tasks": cursor.fetchall()}

    except Error:
        raise HTTPException(status_code=500, detail="Could not fetch tasks")
    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None:
            connection.close()


@app.put("/tasks/{task_id}")
def update_task(task_id: int, task: Task):
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            UPDATE tasks
            SET title=%s, description=%s, priority=%s,
                status=%s, due_date=%s, category=%s
            WHERE id=%s
            """,
            (
                task.title,
                task.description,
                task.priority,
                task.status,
                task.due_date,
                task.category,
                task_id
            )
        )

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Task not found")

        connection.commit()
        return {"message": "Task updated successfully"}

    except Error:
        raise HTTPException(status_code=500, detail="Could not update task")
    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None:
            connection.close()


@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            "DELETE FROM tasks WHERE id=%s",
            (task_id,)
        )

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Task not found")

        connection.commit()
        return {"message": "Task deleted successfully"}

    except Error:
        raise HTTPException(status_code=500, detail="Could not delete task")
    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None:
            connection.close()