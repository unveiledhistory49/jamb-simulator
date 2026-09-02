import sqlite3
import json
import os

DB_PATH = "/root/jamb-simulator/data/jamb.db"
conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

questions = []
for row in c.execute("SELECT id, subject_id, section, topic, question, option_a, option_b, option_c, option_d, correct_answer, explanation, year, difficulty, passage_id, has_image, image_url FROM questions"):
    questions.append({
        "id": row[0],
        "subject_id": row[1],
        "section": row[2],
        "topic": row[3],
        "question": row[4],
        "option_a": row[5],
        "option_b": row[6],
        "option_c": row[7],
        "option_d": row[8],
        "correct_answer": row[9],
        "explanation": row[10],
        "year": row[11],
        "difficulty": row[12],
        "passage_id": row[13],
        "has_image": row[14],
        "image_url": row[15]
    })

passages = {}
for row in c.execute("SELECT id, subject_id, title, type, text FROM passages"):
    passages[row[0]] = {
        "id": row[0],
        "subject_id": row[1],
        "title": row[2],
        "type": row[3],
        "text": row[4]
    }

data = {
    "version": "1.0",
    "total_questions": len(questions),
    "passages": passages,
    "questions": questions
}

# Write to client/public/questions_bank.json
os.makedirs("/root/jamb-simulator/client/public", exist_ok=True)
with open("/root/jamb-simulator/client/public/questions_bank.json", "w", encoding="utf-8") as f:
    json.dump(data, f)

# Also write to data/questions_bank.json
with open("/root/jamb-simulator/data/questions_bank.json", "w", encoding="utf-8") as f:
    json.dump(data, f)

print(f"Exported {len(questions)} questions and {len(passages)} passages to questions_bank.json successfully.")
