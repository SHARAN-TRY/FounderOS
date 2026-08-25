import sqlite3

conn = sqlite3.connect("c:/Users/shara/Downloads/yv/backend/founderos.db")
cursor = conn.cursor()

def add_col(table, col, col_type):
    try:
        cursor.execute(f"ALTER TABLE {table} ADD COLUMN {col} {col_type}")
        print(f"Added {col} to {table}")
    except Exception as e:
        print(f"Note on {table}.{col}: {e}")

# Add timestamp columns across all tables
for tbl in ["users", "goals", "tasks", "delegations", "approvals", "agent_activities", "audit_logs", "agent_messages"]:
    add_col(tbl, "created_at", "DATETIME")
    add_col(tbl, "updated_at", "DATETIME")

conn.commit()
conn.close()
print("Timestamps added successfully.")
