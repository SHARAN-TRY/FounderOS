import sqlite3

conn = sqlite3.connect("c:/Users/shara/Downloads/yv/backend/founderos.db")
cursor = conn.cursor()

def add_col(table, col, col_type):
    try:
        cursor.execute(f"ALTER TABLE {table} ADD COLUMN {col} {col_type}")
        print(f"Added {col} to {table}")
    except Exception as e:
        print(f"Note on {table}.{col}: {e}")

# Task columns
add_col("tasks", "progress", "INTEGER DEFAULT 0")
add_col("tasks", "summary", "TEXT")
add_col("tasks", "plan_data", "TEXT")

# Delegation columns
add_col("delegations", "order_index", "INTEGER DEFAULT 1")
add_col("delegations", "dependencies", "TEXT")
add_col("delegations", "context_input", "TEXT")
add_col("delegations", "decision_summary", "TEXT")
add_col("delegations", "result_output", "TEXT")
add_col("delegations", "actions_available", "TEXT")
add_col("delegations", "actions_taken", "TEXT")
add_col("delegations", "error_message", "TEXT")
add_col("delegations", "approved_at", "DATETIME")

# Approval columns
add_col("approvals", "approval_level", "VARCHAR DEFAULT 'RESULT'")
add_col("approvals", "action_name", "VARCHAR")
add_col("approvals", "action_payload", "TEXT")

conn.commit()
conn.close()
print("Migration script finished on founderos.db.")
