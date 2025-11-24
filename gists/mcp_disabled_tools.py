#!/usr/bin/env python3
# /// script
# dependencies = []
# ///
import sqlite3
import json
import os
from pathlib import Path

def get_mcp_disabled_tools():
    db_path = Path.home() / "Library/Application Support/Cursor/User/globalStorage/state.vscdb"
    
    if not db_path.exists():
        print(f"Database file not found at: {db_path}")
        return
    
    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        # Search for the disabled tools configuration
        cursor.execute("""
            SELECT key, value FROM ItemTable 
            WHERE value LIKE '%mcpDisabledTools%'
        """)
        
        results = cursor.fetchall()
        
        for row in results:
            key, value = row[0], row[1]
            try:
                parsed_value = json.loads(value)
                if isinstance(parsed_value, dict) and 'mcpDisabledTools' in parsed_value:
                    disabled_tools = parsed_value['mcpDisabledTools']
                    
                    print(f"Found {len(disabled_tools)} disabled MCP tools:")
                    print()
                    
                    for disabled_tool in disabled_tools:
                        if '|' in disabled_tool:
                            server, tool = disabled_tool.split('|', 1)
                            server_clean = server.replace('user-', '').replace('project-', '')
                            print(f"- {server_clean} → {tool}")
                        else:
                            print(f"- {disabled_tool}")
                    
                    break
            except (json.JSONDecodeError, TypeError):
                continue
        else:
            print("No disabled MCP tools found.")
        
        conn.close()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    get_mcp_disabled_tools()