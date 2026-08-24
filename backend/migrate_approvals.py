import sqlite3

conn = sqlite3.connect("c:/Users/shara/Downloads/yv/backend/founderos.db")
cursor = conn.cursor()

def add_col(table, col, col_type):
    try:
        cursor.execute(f"ALTER TABLE {table} ADD COLUMN {col} {col_type}")
        print(f"Added {col} to {table}")
    except Exception as e:
        print(f"Note on {table}.{col}: {e}")

add_col("approvals", "decision", "VARCHAR DEFAULT 'APPROVED'")
add_col("approvals", "feedback", "TEXT")
add_col("approvals", "task_id", "INTEGER")
add_col("approvals", "delegation_id", "INTEGER")

conn.commit()
conn.close()
print("Approvals table updated.")
