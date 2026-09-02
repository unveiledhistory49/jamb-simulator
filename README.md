# Authentic JAMB UTME CBT Simulator

A full-fledged, high-fidelity Computer-Based Test (CBT) simulator built specifically for UTME candidates. 100% free and open-source.

---

## 🎯 Examination Format & Specifications

This simulator adheres to the official **Joint Admissions and Matriculation Board (JAMB)** CBT examination structure:

| Parameter | UTME Specification | Implementation in Simulator |
| :--- | :--- | :--- |
| **Duration** | **2 Hours (120 Minutes)** | Single continuous countdown timer across all 180 questions |
| **Total Questions** | **180 Questions** | 60 Use of English + 40 Biology + 40 Physics + 40 Chemistry |
| **Scoring Scale** | **400 Marks Maximum** | Scaled to 100 marks per subject: English $\frac{\text{score}}{60} \times 100$; Sciences $\frac{\text{score}}{40} \times 100$ |
| **Negative Marking** | **None** | No penalties for incorrect choices |
| **Navigation** | **8-Key CBT Standard** | `A`, `B`, `C`, `D`, `N`, `P`, `S`, `R` keyboard shortcuts |
| **Calculator** | **On-Screen JAMB Calc** | Interactive pop-up calculator for calculations |

---

## 📚 Sourced Question Bank (5,837 Authentic Questions)

The system is pre-loaded with an offline SQLite database (`data/jamb.db`) containing **5,837 authentic past JAMB questions**:

- **Use of English (169 questions + 9 reading passages)**:
  - Section A: Comprehension passages with full context view
  - Section A: Cloze tests with numbered blanks
  - Section A: Prescribed reading text (*The Life Changer* by Khadija Abubakar Jalli)
  - Section B: Lexis & Structure (Antonyms, Synonyms, Concord, Prepositions, Idioms)
  - Section C: Oral Forms (Vowels, Diphthongs, Consonants, Rhymes, Syllable Stress, Emphatic Stress)
- **Biology (1,865 questions)**: Cell Biology, Plant & Animal Physiology, Genetics, Ecology, and Evolution.
- **Chemistry (1,940 questions)**: Organic Chemistry, Stoichiometry, Gas Laws, Acids & Bases, Electrochemistry, Periodic Table.
- **Physics (1,863 questions)**: Mechanics, Heat & Thermodynamics, Waves & Optics, Electricity & Magnetism, Modern Physics, with full LaTeX mathematical equation rendering.

---

## ⌨️ JAMB 8-Key Keyboard Shortcuts

Candidates do not need to touch the mouse during practice exams:

| Key | Function |
| :---: | :--- |
| **`A`** | Select Option A |
| **`B`** | Select Option B |
| **`C`** | Select Option C |
| **`D`** | Select Option D |
| **`N`** | Next Question |
| **`P`** | Previous Question |
| **`R`** | Flag / Unflag Question for Review |
| **`S`** | Open Submit Confirmation Dialog |
| **`Esc`** | Close Calculator / Dismiss Modals |

---

## 🚀 Getting Started

### 1. Start the Production Server
The Express server serves both the REST API and the production React frontend on port `5000`:
```bash
npm start
```
Open **`http://localhost:5000`** in any web browser.

### 2. Development Mode
To run with live hot reloading:
```bash
# Terminal 1: Backend API
npm run dev:server

# Terminal 2: Vite React Frontend
npm run dev:client
```
The Vite frontend will be available at **`http://localhost:5173`** (proxied to port 5000).

### 3. Re-seed Database
If you wish to reset or re-ingest the questions:
```bash
npm run seed
```

---

## 📊 Performance Analytics & University Cut-offs

Upon submitting an exam, candidates receive a comprehensive score breakdown:
- **Total Aggregated Score (/ 400)**
- **Per-Subject Scaled Scores (/ 100)** with accuracy percentages
- **Time Management Metric**: Average seconds per question against the JAMB 40-second target
- **Course Competitiveness Meter**:
  - *Tier 1 (280+)*: Medicine & Surgery, Law, Pharmacy
  - *Tier 2 (240+)*: Engineering, Computer Science, Nursing
  - *Tier 3 (200+)*: Core Sciences & Agriculture
- **Comprehensive Review**: Step-by-step solutions, correct answers, candidate answers, and explanations.
