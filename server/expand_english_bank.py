import sqlite3
import csv
import urllib.request
import re
import json

DB_PATH = "/root/jamb-simulator/data/jamb.db"
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# 1. Ingest ExamWiseNG English questions
try:
    url = "https://raw.githubusercontent.com/aliuoluyemi7-prog/ExamWiseNG/main/english.csv"
    content = urllib.request.urlopen(url).read().decode("utf-8")
    reader = list(csv.reader(content.splitlines()))
    # header: ['id', 'subject', 'topic', 'question', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer', 'explanation', 'year', 'difficulty', 'exam_type', 'tags', 'status', 'passage_id', 'passage_text']
    header = reader[0]
    passage_added = set()
    examwise_count = 0
    for r in reader[1:]:
        if len(r) < 10:
            continue
        topic = r[2].strip()
        q_text = r[3].strip()
        oa = r[4].strip()
        ob = r[5].strip()
        oc = r[6].strip()
        od = r[7].strip()
        ans = r[8].strip().lower()
        exp = r[9].strip() if len(r) > 9 else ""
        diff = r[11].strip() if len(r) > 11 else "Medium"
        pid = r[15].strip() if len(r) > 15 else ""
        ptext = r[16].strip() if len(r) > 16 else ""

        if ans not in ("a", "b", "c", "d"):
            continue

        if pid and ptext and pid not in passage_added:
            cursor.execute("INSERT OR IGNORE INTO passages VALUES (?, ?, ?, ?, ?)",
                           (pid, "english", f"Passage {pid}", "cloze" if "cloze" in topic.lower() else "comprehension", ptext))
            passage_added.add(pid)

        sec = "Section A - Comprehension" if "passage" in topic.lower() else "Section B - Lexis and Structure"
        if any(w in topic.lower() for w in ["oral", "vowel", "consonant", "stress", "rhyme"]):
            sec = "Section C - Oral Forms"

        cursor.execute("""
        INSERT INTO questions (
            subject_id, section, topic, question, option_a, option_b, option_c, option_d,
            correct_answer, explanation, year, difficulty, passage_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, ("english", sec, topic, q_text, oa, ob, oc, od, ans, exp, 2022, diff, pid if pid else None))
        examwise_count += 1
    print(f"Added {examwise_count} questions from ExamWiseNG")
except Exception as e:
    print(f"ExamWiseNG ingest error: {e}")

# 2. Ingest Adamoladele English questions
try:
    url = "https://raw.githubusercontent.com/Adamoladele2312/English-jamb-cbt/main/index.%20html"
    html = urllib.request.urlopen(url).read().decode("utf-8")
    m = re.search(r"const QUESTIONS = (\[[\s\S]*?\]);\s*const", html)
    if m:
        # Convert JS object syntax to valid JSON by quoting keys
        js_data = m.group(1)
        # Simple extraction via regex
        q_objs = re.findall(r"\{\s*id:\s*(\d+),\s*section:\s*['\"]([^'\"]+)['\"],\s*text:\s*['\"]([\s\S]*?)['\"],\s*options:\s*\[(.*?)\]\s*,\s*correct:\s*(\d+)", js_data)
        adam_count = 0
        ans_map = {0: "a", 1: "b", 2: "c", 3: "d"}
        for qid, sec, text, opts_str, cor in q_objs:
            opts = [o.strip().strip("'\"") for o in re.findall(r"['\"]([^'\"]+)['\"]", opts_str)]
            if len(opts) == 4 and int(cor) in ans_map:
                ans = ans_map[int(cor)]
                # Clean html tags like <em>, <br>
                clean_text = re.sub(r"<[^>]+>", " ", text).strip()
                clean_text = re.sub(r"\s+", " ", clean_text)
                
                # Assign section
                sec_name = "Section B - Lexis and Structure"
                if "comprehension" in sec.lower() or "cloze" in sec.lower():
                    sec_name = "Section A - Comprehension"
                elif "oral" in sec.lower():
                    sec_name = "Section C - Oral Forms"

                cursor.execute("""
                INSERT INTO questions (
                    subject_id, section, topic, question, option_a, option_b, option_c, option_d,
                    correct_answer, explanation, year, difficulty, passage_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, ("english", sec_name, sec, clean_text, opts[0], opts[1], opts[2], opts[3], ans, f"The correct answer is ({ans.upper()}) {opts[int(cor)]}.", 2021, "Medium", None))
                adam_count += 1
        print(f"Added {adam_count} questions from Adamoladele CBT")
except Exception as e:
    print(f"Adamoladele ingest error: {e}")

# 3. Add Passage 3 (Science and Technology) & Comprehension questions
passage_3 = (
    "comp_3",
    "english",
    "Comprehension Passage 3: Genetic Engineering & Bioethics",
    "comprehension",
    """The dawn of CRISPR-Cas9 genome editing technology has ushered humanity into an era of unprecedented genetic manipulation. Unlike earlier transgenic techniques that were cumbersome and imprecise, CRISPR functions with molecular scalpel precision, allowing researchers to excise, modify, or insert targeted genetic sequences with relative ease.

In clinical therapeutics, the prospects are undeniably exhilarating. Severe monogenic disorders such as sickle cell anaemia, a hereditary haemoglobinopathy endemic in sub-Saharan Africa, have shown dramatic curative responses in early clinical trials. By extracting haematopoietic stem cells from patients, editing the mutated beta-globin gene, and re-infusing the corrected cells, researchers have effectively alleviated debilitating vaso-occlusive crises in afflicted individuals.

However, the bioethical ramifications of germline genetic modification provoke deep philosophical alarm. Unlike somatic cell therapy—where modifications remain confined to the treated individual—germline edits alter the DNA of reproductive gametes or early embryos, ensuring that changes are permanently transmitted to all succeeding generations. Ethicists warn that if commercialized without stringent international oversight, this technology could spawn a dystopia of 'designer babies,' widening societal stratifications between a genetically enhanced elite and a biologically unaugmented underclass.

The consensus among global bioethics councils is that while somatic gene editing for fatal pathologies should be rigorously accelerated, germline alterations for aesthetic or non-medical enhancements must be strictly interdicted. Humankind must exercise profound humility, recognizing that manipulating the fundamental genetic code of our species carries irrevocable ecological and evolutionary consequences."""
)

cursor.execute("INSERT OR REPLACE INTO passages VALUES (?, ?, ?, ?, ?)", passage_3)

p3_questions = [
    (
        "english", "Section A - Comprehension", "Comprehension",
        "Why is CRISPR-Cas9 considered superior to previous genetic engineering techniques?",
        "It is significantly cheaper and requires no laboratory equipment",
        "It operates with molecular precision to excise or insert specific DNA sequences",
        "It has completely eliminated all viral diseases in Africa",
        "It can be administered as an over-the-counter oral vaccine",
        "b",
        "Paragraph 1 notes that unlike earlier imprecise methods, CRISPR 'functions with molecular scalpel precision'.",
        2022, "Medium", "comp_3"
    ),
    (
        "english", "Section A - Comprehension", "Comprehension",
        "In sickle cell clinical trials, how was the therapeutic gene editing executed?",
        "By injecting CRISPR directly into the patient's coronary arteries",
        "By modifying haematopoietic stem cells ex vivo and re-infusing them into the patient",
        "By altering the DNA of the patient's parents before conception",
        "By replacing the patient's entire blood volume with synthetic plasma",
        "b",
        "Paragraph 2 states: 'By extracting haematopoietic stem cells from patients, editing the mutated beta-globin gene, and re-infusing the corrected cells'.",
        2022, "Hard", "comp_3"
    ),
    (
        "english", "Section A - Comprehension", "Comprehension",
        "What is the crucial scientific distinction between somatic and germline gene therapy?",
        "Somatic therapy is permanent across generations while germline is temporary",
        "Somatic therapy affects only the individual while germline edits are inheritable by offspring",
        "Somatic therapy is illegal worldwide while germline therapy is unrestricted",
        "Somatic therapy utilizes bacteria while germline therapy uses plant cells",
        "b",
        "Paragraph 3 clarifies that somatic modifications remain confined to the patient, whereas germline edits alter reproductive gametes and are transmitted to succeeding generations.",
        2022, "Medium", "comp_3"
    ),
    (
        "english", "Section A - Comprehension", "Comprehension",
        "The author fears that unregulated germline editing could result in:",
        "A worldwide collapse in agricultural grain production",
        "A deep societal stratification between genetically enhanced and unaugmented humans",
        "The total eradication of all human medical professions",
        "An uncontrolled resurgence of infectious childhood diseases",
        "b",
        "Paragraph 3 warns of a dystopia of designer babies 'widening societal stratifications between a genetically enhanced elite and a biologically unaugmented underclass'.",
        2022, "Medium", "comp_3"
    ),
    (
        "english", "Section A - Comprehension", "Comprehension",
        "The word 'interdicted' as used in the final paragraph most nearly means:",
        "Encouraged", "Prohibited", "Funded", "Ignored",
        "b",
        "To interdict means to prohibit, forbid, or ban an action by authoritative decree.",
        2022, "Hard", "comp_3"
    )
]

cursor.executemany("""
INSERT INTO questions (
    subject_id, section, topic, question, option_a, option_b, option_c, option_d,
    correct_answer, explanation, year, difficulty, passage_id
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
""", p3_questions)

# 4. Rich collection of high-yield JAMB questions across Lexis & Oral English
additional_pool = [
    # Antonyms
    ("Antonyms", "Choose the word OPPOSITE in meaning to the capitalized word: The doctor described the patient's condition as PRECARIOUS.", "Stable", "Critical", "Uncertain", "Dangerous", "a", "Precarious means dangerously insecure or unstable. Its opposite is 'stable'.", 2022, "Medium"),
    ("Antonyms", "Choose the word OPPOSITE in meaning: The judge noted that the witness was remarkably COGNIZANT of the facts.", "Aware", "Ignorant", "Informed", "Conscious", "b", "Cognizant means having knowledge or awareness. Its antonym is 'ignorant'.", 2022, "Medium"),
    ("Antonyms", "Choose the word OPPOSITE in meaning: Her brother is notoriously PENURIOUS.", "Stingy", "Affluent", "Miserly", "Impoverished", "b", "Penurious means destitute or extremely stingy. Its opposite is 'affluent' (wealthy, generous).", 2022, "Hard"),
    ("Antonyms", "Choose the word OPPOSITE in meaning: The treaty was intended to CONCILIATE the rebellious tribes.", "Appease", "Alienate", "Placate", "Mollify", "b", "Conciliate means to stop from being angry; placate. Opposite is 'alienate' (estrange, provoke).", 2022, "Hard"),
    ("Antonyms", "Choose the word OPPOSITE in meaning: The evidence against the accused was COGENT.", "Compelling", "Unconvincing", "Logical", "Persuasive", "b", "Cogent means clear, logical, and convincing. Opposite is 'unconvincing'.", 2022, "Medium"),
    ("Antonyms", "Choose the word OPPOSITE in meaning: The general launched an AUDACIOUS counter-attack.", "Timid", "Daring", "Fearless", "Bold", "a", "Audacious means showing a willingness to take surprisingly bold risks. Opposite is 'timid'.", 2021, "Easy"),
    ("Antonyms", "Choose the word OPPOSITE in meaning: The climate in the plateau region is TEMPERATE.", "Mild", "Extreme", "Moderate", "Pleasant", "b", "Temperate means moderate in climate. Opposite is 'extreme'.", 2021, "Medium"),
    ("Antonyms", "Choose the word OPPOSITE in meaning: His remarks were deemed INNOCUOUS.", "Harmless", "Harmful", "Inoffensive", "Pleasant", "b", "Innocuous means not harmful or offensive. Opposite is 'harmful'.", 2021, "Medium"),

    # Synonyms
    ("Synonyms", "Choose the word NEAREST in meaning: The professor's lecture was completely INCOMPREHENSIBLE to the freshmen.", "Unintelligible", "Enlightening", "Lucid", "Fascinating", "a", "Incomprehensible means impossible to understand; unintelligible.", 2022, "Easy"),
    ("Synonyms", "Choose the word NEAREST in meaning: The accountant was commended for his METICULOUS record keeping.", "Painstaking", "Careless", "Hasty", "Sloppy", "a", "Meticulous means showing great attention to detail; very careful and painstaking.", 2022, "Medium"),
    ("Synonyms", "Choose the word NEAREST in meaning: The senator's popularity began to WANE after the scandal.", "Diminish", "Soar", "Increase", "Stabilize", "a", "To wane means to decrease in vigour, power, or extent; diminish.", 2022, "Medium"),
    ("Synonyms", "Choose the word NEAREST in meaning: The university senate decided to RESCIND the controversial regulation.", "Revoke", "Enforce", "Promulgate", "Ratify", "a", "Rescind means to revoke, cancel, or repeal a law or agreement.", 2022, "Hard"),
    ("Synonyms", "Choose the word NEAREST in meaning: The old man lived an AUSTERE life in the mountains.", "Lavish", "Ascetic", "Luxurious", "Social", "b", "Austere means severe or strict in manner, living very simply without luxuries (ascetic).", 2021, "Hard"),
    ("Synonyms", "Choose the word NEAREST in meaning: The minister's speech was full of PLATITUDES.", "Original ideas", "Trite remarks", "Profound wisdom", "Eloquent poetry", "b", "A platitude is a remark or statement, especially one with a moral content, that has been used too often to be interesting or thoughtful.", 2021, "Hard"),
    ("Synonyms", "Choose the word NEAREST in meaning: The new recruit was unusually RETICENT about his past.", "Talkative", "Reserved", "Boastful", "Aggressive", "b", "Reticent means not revealing one's thoughts or feelings readily; reserved.", 2021, "Medium"),
    ("Synonyms", "Choose the word NEAREST in meaning: The athlete showed RESILIENCE after his injury.", "Ability to recover", "Despair", "Fragility", "Weakness", "a", "Resilience is the capacity to recover quickly from difficulties; toughness.", 2021, "Easy"),

    # Grammar & Concord
    ("Grammar & Concord", "Choose the correct option: The news broadcast on the radio _____ alarming.", "were", "was", "are", "have been", "b", "'News' is an uncountable noun that takes a singular verb ('was').", 2022, "Easy"),
    ("Grammar & Concord", "Choose the correct option: Each of the candidates _____ given a question booklet.", "were", "was", "are", "have been", "b", "'Each' is an indefinite pronoun that takes a singular verb ('was').", 2022, "Easy"),
    ("Grammar & Concord", "Choose the correct option: Ten thousand naira _____ too much to pay for that textbook.", "is", "are", "were", "have been", "a", "Expressions of amount, time, distance, or money take a singular verb when considered as a unit ('is').", 2022, "Medium"),
    ("Grammar & Concord", "Choose the correct option: Neither the coach nor the players _____ happy with the officiating.", "was", "were", "is", "are being", "b", "Correlative conjunctions agree with the nearer subject ('players' -> plural -> 'were').", 2022, "Medium"),
    ("Grammar & Concord", "Choose the correct option: If he _____ earlier, he would not have missed the bus.", "left", "had left", "has left", "leaves", "b", "Third conditional: 'If + past perfect (had left) ... would have + past participle'.", 2022, "Medium"),
    ("Grammar & Concord", "Choose the correct option: The boy preferred playing football _____ reading novels.", "than", "to", "against", "instead", "b", "The verb 'prefer' takes the preposition 'to', not 'than' (e.g., 'prefer X to Y').", 2022, "Medium"),
    ("Grammar & Concord", "Choose the correct option: The principal congratulated the students _____ their outstanding performance.", "for", "on", "at", "about", "b", "The standard preposition after 'congratulate' is 'on' (congratulate someone on something).", 2022, "Easy"),
    ("Grammar & Concord", "Choose the correct option: She has been living in Abuja _____ 2015.", "since", "for", "from", "at", "a", "'Since' is used for a specific starting point in time, while 'for' is used for a duration.", 2022, "Easy"),
    ("Grammar & Concord", "Choose the correct option: The criminal was accused _____ arson and grand theft.", "with", "of", "for", "at", "b", "One is 'accused of' a crime, but 'charged with' a crime.", 2022, "Easy"),
    ("Grammar & Concord", "Choose the correct option: He spoke as though he _____ the absolute owner of the estate.", "is", "were", "was being", "has been", "b", "Hypothetical unreal comparison with 'as though' takes the past subjunctive 'were'.", 2022, "Hard"),

    # Oral English - Vowels & Consonants
    ("Oral English - Vowels", "Choose the word containing the same vowel sound as: <k><i><d>", "busy", "buy", "bite", "key", "a", "The vowel in 'kid' is short /ɪ/, which is found in 'busy' /ˈbɪz.i/. 'Buy' and 'bite' have /aɪ/, and 'key' has /iː/.", 2022, "Medium"),
    ("Oral English - Vowels", "Choose the word containing the same vowel sound as: <f><a><t><h><e><r>", "cat", "car", "bat", "man", "b", "'Father' has the long back vowel /ɑː/, which is also heard in 'car' /kɑːr/.", 2022, "Easy"),
    ("Oral English - Vowels", "Choose the word containing the same vowel sound as: s<e><a><t>", "sit", "city", "key", "pit", "c", "'Seat' has the long close front vowel /iː/, identical to the vowel in 'key' /kiː/.", 2022, "Easy"),
    ("Oral English - Consonants", "In which of the following words is the letter 'k' SILENT?", "king", "knife", "kitten", "kettle", "b", "In 'knife', 'k' is silent before 'n' (pronounced /naɪf/).", 2022, "Easy"),
    ("Oral English - Consonants", "In which of the following words is the letter 'w' SILENT?", "water", "wrist", "wood", "wind", "b", "In 'wrist', 'w' is silent before 'r' (pronounced /rɪst/).", 2022, "Easy"),
    ("Oral English - Consonants", "Choose the word containing the same consonant sound as: <c><h>urch", "chemist", "chauffeur", "charity", "chorus", "c", "'Church' and 'charity' have the voiceless postalveolar affricate /tʃ/. 'Chemist' and 'chorus' have /k/, while 'chauffeur' has /ʃ/.", 2022, "Medium"),
    ("Oral English - Rhymes", "Choose the word that RHYMES with: debt", "met", "doubt", "date", "bite", "a", "'Debt' is pronounced /det/, which rhymes with 'met'. 'B' is silent.", 2022, "Easy"),
    ("Oral English - Rhymes", "Choose the word that RHYMES with: tomb", "bomb", "womb", "comb", "dumb", "b", "'Tomb' is pronounced /tuːm/, rhyming with 'womb' /wuːm/. 'Comb' is /kəʊm/ and 'bomb' is /bɒm/.", 2022, "Hard"),

    # Oral English - Stress
    ("Oral English - Stress", "Choose the word stressed on the FIRST syllable:", "EXAMINE", "TELEPHONE", "DECISION", "SUCCEED", "b", "'Telephone' is stressed on the 1st syllable: /ˈtel.ɪ.fəʊn/ (TE-le-phone). 'Examine' and 'decision' are stressed on the 2nd, 'succeed' on the 2nd.", 2022, "Medium"),
    ("Oral English - Stress", "Choose the word stressed on the SECOND syllable:", "ECONOMY", "GOVERNMENT", "POLITICS", "PHYSICS", "a", "'Economy' is stressed on the 2nd syllable: /ɪˈkɒn.ə.mi/ (e-CO-no-my). 'Government', 'politics', and 'physics' are stressed on the 1st.", 2022, "Medium"),
    ("Oral English - Stress", "Choose the word stressed on the THIRD syllable:", "democratic", "education", "understand", "all of the above", "d", "'Democratic' /ˌdem.əˈkræt.ɪk/, 'education' /ˌedʒ.uˈkeɪ.ʃən/, and 'understand' /ˌʌn.dəˈstænd/ are all stressed on the third syllable.", 2022, "Hard"),
    ("Oral English - Emphatic Stress", "In: 'ADE borrowed my physics textbook yesterday.' (Emphatic stress on ADE). Which question does this answer?", "Did Ade steal your physics textbook yesterday?", "Did Ade borrow your chemistry textbook yesterday?", "Did Bola borrow your physics textbook yesterday?", "Did Ade borrow your physics textbook today?", "c", "Stressing 'ADE' contrasts with who borrowed the textbook ('Did Bola borrow...? No, ADE did').", 2022, "Medium")
]

for topic, q_text, oa, ob, oc, od, ans, exp, yr, diff in additional_pool:
    sec = "Section B - Lexis and Structure"
    if "oral" in topic.lower():
        sec = "Section C - Oral Forms"
    cursor.execute("""
    INSERT INTO questions (
        subject_id, section, topic, question, option_a, option_b, option_c, option_d,
        correct_answer, explanation, year, difficulty, passage_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, ("english", sec, topic, q_text, oa, ob, oc, od, ans, exp, yr, diff, None))

conn.commit()
print("Successfully expanded English question bank!")
conn.close()
