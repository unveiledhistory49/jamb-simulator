import sqlite3
import json
import re
import os

DB_PATH = "/root/jamb-simulator/data/jamb.db"
os.makedirs("/root/jamb-simulator/data", exist_ok=True)

if os.path.exists(DB_PATH):
    os.remove(DB_PATH)

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Enable WAL mode for high performance
cursor.execute("PRAGMA journal_mode = WAL;")

cursor.execute("""
CREATE TABLE subjects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    question_count INTEGER NOT NULL,
    total_marks INTEGER NOT NULL,
    description TEXT
);
""")

cursor.execute("""
CREATE TABLE passages (
    id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL, -- 'comprehension', 'cloze', 'novel'
    text TEXT NOT NULL
);
""")

cursor.execute("""
CREATE TABLE questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id TEXT NOT NULL REFERENCES subjects(id),
    section TEXT,
    topic TEXT,
    question TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer TEXT NOT NULL, -- 'a', 'b', 'c', or 'd'
    explanation TEXT,
    year INTEGER,
    difficulty TEXT DEFAULT 'Medium',
    passage_id TEXT REFERENCES passages(id),
    has_image INTEGER DEFAULT 0,
    image_url TEXT
);
""")

cursor.execute("""
CREATE TABLE exam_history (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    mode TEXT NOT NULL, -- 'full_mock', 'subject_drill'
    duration_seconds INTEGER NOT NULL,
    time_spent_seconds INTEGER NOT NULL,
    total_score REAL NOT NULL,
    max_score REAL NOT NULL,
    subject_scores TEXT NOT NULL, -- JSON string
    summary TEXT NOT NULL -- JSON string with details
);
""")

# Insert Subjects
subjects_data = [
    ("english", "Use of English", "ENG", 60, 100, "Compulsory: Comprehension, Cloze, Lexis & Structure, Oral Forms"),
    ("biology", "Biology", "BIO", 40, 100, "Cell Biology, Plant & Animal Physiology, Genetics, Ecology"),
    ("physics", "Physics", "PHY", 40, 100, "Mechanics, Heat & Thermodynamics, Waves & Optics, Electricity & Magnetism, Modern Physics"),
    ("chemistry", "Chemistry", "CHM", 40, 100, "Physical, Inorganic, and Organic Chemistry, Chemical Reactions & Stoichiometry")
]

cursor.executemany("INSERT INTO subjects VALUES (?, ?, ?, ?, ?, ?)", subjects_data)

# Helper function to classify topics in Science subjects
def classify_biology_topic(text):
    t = text.lower()
    if any(k in t for k in ["cell", "mitochondria", "nucleus", "membrane", "tissue", "organelle", "chloroplast", "vacuole"]):
        return "Cell Biology & Organization"
    elif any(k in t for k in ["gene", "dna", "chromosome", "allele", "heredity", "genetics", "mutation", "evolution", "mendel"]):
        return "Genetics & Evolution"
    elif any(k in t for k in ["ecosystem", "habitat", "biome", "ecology", "food chain", "population", "pollution", "symbiosis"]):
        return "Ecology & Environmental Biology"
    elif any(k in t for k in ["photosynthesis", "transpiration", "xylem", "phloem", "seed", "germination", "plant", "flower"]):
        return "Plant Anatomy & Physiology"
    elif any(k in t for k in ["kidney", "heart", "blood", "digestion", "respiration", "nervous", "eye", "ear", "brain", "hormone", "excret"]):
        return "Animal Physiology & Organ Systems"
    elif any(k in t for k in ["bacteria", "virus", "fungi", "disease", "parasite", "protozoa", "amoeba", "malaria"]):
        return "Microbiology & Diseases"
    return "General Biology"

def classify_chemistry_topic(text):
    t = text.lower()
    if any(k in t for k in ["hydrocarbon", "alkane", "alkene", "alkyne", "benzene", "alcohol", "ester", "organic", "polymer", "isomer"]):
        return "Organic Chemistry"
    elif any(k in t for k in ["acid", "base", "ph", "neutraliz", "salt", "titrat", "indicator", "buffer"]):
        return "Acids, Bases & Salts"
    elif any(k in t for k in ["periodic", "group", "period", "halogen", "alkali", "transition", "atomic structure", "electron"]):
        return "Atomic Structure & Periodic Table"
    elif any(k in t for k in ["mole", "avogadro", "stoichiometry", "empirical", "molecular mass", "concentration"]):
        return "Stoichiometry & Quantitative Chemistry"
    elif any(k in t for k in ["electrolysis", "electrode", "faraday", "cell", "oxidation", "reduction", "redox"]):
        return "Electrochemistry & Redox Reactions"
    elif any(k in t for k in ["gas law", "boyle", "charles", "ideal gas", "temperature", "pressure", "kinetic theory"]):
        return "States of Matter & Gas Laws"
    elif any(k in t for k in ["rate", "equilibrium", "catalyst", "exothermic", "endothermic", "enthalpy", "le chatelier"]):
        return "Equilibrium, Kinetics & Energetics"
    elif any(k in t for k in ["metal", "extraction", "iron", "copper", "aluminum", "alloy", "non-metal", "nitrogen", "sulfur"]):
        return "Inorganic Chemistry & Metallurgy"
    return "General Chemistry"

def classify_physics_topic(text):
    t = text.lower()
    if any(k in t for k in ["velocity", "acceleration", "force", "momentum", "work", "energy", "power", "friction", "projectile", "motion", "gravity", "mass"]):
        return "Mechanics & Dynamics"
    elif any(k in t for k in ["heat", "temperature", "expansion", "latent", "specific heat", "conduction", "convection", "radiation", "thermodynamics"]):
        return "Thermal Physics & Heat"
    elif any(k in t for k in ["wave", "frequency", "wavelength", "sound", "light", "refraction", "reflection", "lens", "mirror", "diffraction", "interference"]):
        return "Waves, Sound & Optics"
    elif any(k in t for k in ["current", "voltage", "resistance", "ohm", "circuit", "capacitor", "charge", "electric", "magnetic", "induction", "transformer"]):
        return "Electricity & Magnetism"
    elif any(k in t for k in ["atom", "nucleus", "radioactivity", "half-life", "alpha", "beta", "gamma", "quantum", "photoelectric", "x-ray", "isotope"]):
        return "Modern & Nuclear Physics"
    elif any(k in t for k in ["pressure", "density", "archimedes", "surface tension", "viscosity", "upthrust", "bernoulli"]):
        return "Properties of Matter & Fluids"
    return "General Physics"

# Ingest Science Questions
science_files = [
    ("biology", "/tmp/biology_raw.json", classify_biology_topic),
    ("chemistry", "/tmp/chemistry_raw.json", classify_chemistry_topic),
    ("physics", "/tmp/physics_raw.json", classify_physics_topic)
]

for subject_id, filepath, classifier in science_files:
    if not os.path.exists(filepath):
        print(f"Skipping {filepath} (file not found)")
        continue
    
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        raw_data = json.load(f)
    
    qdict = raw_data.get("questions", {})
    count = 0
    
    for yr_str, qs in qdict.items():
        year = int(yr_str) if yr_str.isdigit() else None
        
        for qnum, qdata in qs.items():
            ans = str(qdata.get("answer", "")).strip().lower()
            if ans not in ("a", "b", "c", "d"):
                continue  # Skip invalid or option 'e'
            
            q_text = str(qdata.get("question", "")).strip()
            if not q_text or len(q_text) < 5:
                continue
            
            # If question refers to a diagram ("diagram above", "figure below") and image is missing or invalid, skip
            has_img = 1 if qdata.get("image") else 0
            img_url = str(qdata.get("image", "")).strip()
            if "diagram" in q_text.lower() and (not img_url or "nigerianscholars" in img_url):
                continue
            
            opt_a = str(qdata.get("a", "")).strip()
            opt_b = str(qdata.get("b", "")).strip()
            opt_c = str(qdata.get("c", "")).strip()
            opt_d = str(qdata.get("d", "")).strip()
            
            if not (opt_a and opt_b and opt_c and opt_d):
                continue
            
            # Clean up question text if it has leading number like "1. " or "2) "
            q_text = re.sub(r"^\d+[\.\)]\s*", "", q_text)
            
            topic = classifier(q_text)
            
            # Determine difficulty heuristically based on length and year
            difficulty = "Medium"
            if len(q_text) > 150 or "calculate" in q_text.lower() or "determine" in q_text.lower():
                difficulty = "Hard"
            elif len(q_text) < 60:
                difficulty = "Easy"
            
            cursor.execute("""
            INSERT INTO questions (
                subject_id, section, topic, question, option_a, option_b, option_c, option_d,
                correct_answer, explanation, year, difficulty, passage_id, has_image, image_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                subject_id,
                f"{subject_id.capitalize()} Paper",
                topic,
                q_text,
                opt_a,
                opt_b,
                opt_c,
                opt_d,
                ans,
                f"Correct answer is ({ans.upper()}).",
                year,
                difficulty,
                None,
                has_img,
                img_url if has_img else None
            ))
            count += 1
            
    print(f"Successfully loaded {count} valid questions for {subject_id.capitalize()}")

conn.commit()
print("Science questions committed successfully.")
conn.close()
