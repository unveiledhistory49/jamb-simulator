import sqlite3
import json
import os

DB_PATH = "/root/jamb-simulator/data/jamb.db"
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Passages for Comprehension and Cloze
passages = [
    (
        "comp_1",
        "english",
        "Comprehension Passage 1: Artificial Intelligence & The Future of African Youth",
        "comprehension",
        """The rapid ascension of artificial intelligence (AI) has ignited fervent debates across global economic and educational spheres. For the African continent, a demographic titan where over sixty percent of the populace is under the age of twenty-five, AI presents a precarious dichotomy: an unprecedented catalyst for developmental leapfrogging or a catastrophic amplifier of existing socio-economic disparities.

Historically, Africa remained on the periphery of the first three industrial revolutions, largely serving as a reservoir of raw materials rather than an architect of technological epochs. The fourth industrial revolution, however, is fundamentally democratized by compute and code. Young software engineers from Lagos to Nairobi, armed with modest laptops and ubiquitous internet connectivity, are devising localized AI models to diagnose crop ailments in cassava, streamline cross-border fintech remittances, and optimize logistics in congested metropolitan hubs.

Nevertheless, palpable impediments threaten to abort this technological renaissance. Intermittent electrical power supply, exorbitant broadband tariffs, and archaic academic curricula perpetuate a severe digital chasm. Furthermore, the global trend towards automation poses a lethal threat to entry-level business process outsourcing (BPO) occupations—traditionally the entry ramp for educated youths into the formal economy. If African governments merely spectate while developed nations monopolize algorithmic patents and computational infrastructure, the continent risks exchanging historic colonial subjugation for algorithmic neo-imperialism.

To circumvent this dystopian trajectory, a seismic paradigm shift is imperative. Educational institutions must aggressively recalibrate their pedagogical frameworks from rote memorization toward computational thinking, ethics, and applied machine learning. Concurrently, regional policymakers must establish sovereign data reserves and incentivize indigenous deep-tech venture ecosystems. The future will not be inherited by those who passively consume technological artefacts, but by those who audaciously build them."""
    ),
    (
        "comp_2",
        "english",
        "Comprehension Passage 2: Environmental Degradation & Climate Resilience in the Sahel",
        "comprehension",
        """The Sahelian belt of West Africa occupies a tenuous ecological equilibrium. Flanked to the north by the hyper-arid expanse of the Sahara and to the south by the humid Guinea savannah, this semi-arid corridor has for centuries sustained pastoralist and agrarian communities through intricately negotiated migratory patterns and regenerative fallow cycles.

In recent decades, however, this fragile truce between man and nature has ruptured. Accelerating climatological shifts, characterized by erratic precipitation patterns and protracted droughts, have exacerbated land degradation. Topsoils, stripped of vegetative cover through unsustainable deforestation and overgrazing, succumb to aeolian erosion. The Sahara relentlessly advances southward at an estimated rate of several kilometres annually—a phenomenon colloquially known as desertification.

The ramifications transcend mere environmental distress; they constitute the bedrock of acute geopolitical volatility. Shrinking arable lands and diminished water reservoirs, most notably epitomized by the precipitous shrinking of Lake Chad to a fraction of its mid-twentieth-century volume, have triggered fierce clashes between sedentary farmers and nomadic Fulani herders. Deprived of customary livelihoods, disaffected youths become vulnerable to conscription by trans-border insurgent factions operating across ungoverned territories.

Technical remediations exist, most visibly embodied in the ambitious 'Great Green Wall' initiative—a transcontinental pan-African rampart of trees spanning from Senegal in the west to Djibouti in the east. Yet, agronomic scientists caution that mere afforestation is inadequate without accompanying socio-economic reforms. Holistic soil restoration, tenure security for vulnerable peasants, and the deployment of drought-resilient cultivars must supersede superficial tree-planting ceremonies if lasting ecological equilibrium is to be restored."""
    ),
    (
        "cloze_1",
        "english",
        "Cloze Passage 1: The Modern Banking Revolution",
        "cloze",
        """The modern financial ecosystem has undergone an extraordinary metamorphosis over the last two decades. The traditional brick-and-mortar banking halls, once characterized by perpetual (1)___ and exasperating bureaucratic delays, have been largely superseded by digital platforms. Today, consumers can effortlessly execute high-value transactions with a few clicks on their smartphones, completely (2)___ the need for physical cash.

This radical transition was (3)___ by advances in telecommunications, encrypted cryptographic protocols, and fintech entrepreneurship. Regulatory authorities initially viewed these nimble financial start-ups with intense (4)___, fearing that lax oversight might jeopardize systemic liquidity and provide conduits for illicit capital flight. However, recognizing the immense potential of digital payment gateways to accelerate financial (5)___ among previously unbanked rural populations, central banks eventually adopted more accommodating regulatory sandboxes.

Nonetheless, this hyper-connected financial landscape is not without serious (6)___. Cybercriminals continually devise sophisticated social engineering schemes, phishing portals, and identity theft mechanisms to (7)___ unsuspecting depositors of their hard-earned assets. Consequently, commercial banks must invest (8)___ in robust cybersecurity firewalls and multi-factor biometric authentication infrastructure. Moreover, public enlightenment campaigns are vital to ensure that citizens do not (9)___ disclose sensitive financial credentials such as passwords and bank verification numbers. Ultimately, safeguarding trust remains the paramount (10)___ upon which the longevity of digital finance depends."""
    ),
    (
        "cloze_2",
        "english",
        "Cloze Passage 2: The Art of Medical Diagnosis",
        "cloze",
        """Clinical medicine is both a rigorous science and a nuanced art. When a patient presents at a clinic with ambiguous symptoms, the examining physician must avoid premature (11)___ and instead conduct a systematic investigation. The first step involves eliciting a comprehensive medical (12)___, which provides essential contextual clues regarding the onset, duration, and trajectory of the ailment.

Next, a meticulous physical examination is performed to identify objective clinical (13)___, such as abnormal heart murmurs or abdominal tenderness, which substantiate or contradict the patient's subjective complaints. If the clinical picture remains (14)___, the doctor orders targeted haematological and radiological investigations. Indiscriminate prescription of medications prior to establishing an accurate diagnosis can be exceedingly (15)___ to patient well-being.

Once all diagnostic parameters have been synthesized, the physician formulates a working hypothesis, termed a (16)___ diagnosis. This guides the implementation of a tailored therapeutic regimen. In severe pathologies, timely clinical intervention can (17)___ irreversible organ failure and significantly lower patient (18)___. Patients are strongly urged to adhere strictly to the prescribed dosage schedule and not (19)___ treatment midway simply because acute discomfort has subsided. Vigilant post-treatment follow-up ensures that latent relapses are promptly (20)___."""
    ),
    (
        "novel_1",
        "english",
        "JAMB Reading Text: The Life Changer (Khadija Abubakar Jalli)",
        "novel",
        """Questions drawn from the mandatory UTME reading text 'The Life Changer' by Khadija Abubakar Jalli, examining narrative plot, character motivations, cultural context, and moral themes across tertiary education life."""
    )
]

cursor.executemany("INSERT OR REPLACE INTO passages VALUES (?, ?, ?, ?, ?)", passages)

# Complete list of English questions
english_questions = [
    # --- COMPREHENSION PASSAGE 1 (Questions 1 - 5) ---
    (
        "english", "Section A - Comprehension", "Comprehension",
        "According to the passage, what is the primary dichotomy AI presents for the African continent?",
        "A tool for industrial automation versus an impediment to software development",
        "A catalyst for rapid development versus an amplifier of existing inequalities",
        "An avenue for foreign investments versus an excuse for brain drain",
        "A substitute for agricultural labour versus an instrument for urban congestion",
        "b",
        "Paragraph 1 explicitly states: 'AI presents a precarious dichotomy: an unprecedented catalyst for developmental leapfrogging or a catastrophic amplifier of existing socio-economic disparities.'",
        2024, "Medium", "comp_1"
    ),
    (
        "english", "Section A - Comprehension", "Comprehension",
        "Why does the author consider the fourth industrial revolution more accessible to African youths than previous ones?",
        "It is heavily sponsored by governmental sovereign funds",
        "It relies fundamentally on code and computing accessible on modest personal computers",
        "It eliminates the necessity for reliable electrical power supply",
        "It requires massive physical factories and mineral processing facilities",
        "b",
        "Paragraph 2 observes that the fourth industrial revolution is democratized by compute and code, allowing developers with modest laptops to build high-impact solutions.",
        2024, "Medium", "comp_1"
    ),
    (
        "english", "Section A - Comprehension", "Comprehension",
        "The expression 'algorithmic neo-imperialism' as used in the passage implies:",
        "The physical invasion of African borders by foreign technological armies",
        "A state of economic dependence where foreign powers monopolize vital digital algorithms and infrastructure",
        "The complete refusal of African engineers to adopt foreign programming languages",
        "The eradication of traditional African languages through artificial intelligence models",
        "b",
        "Algorithmic neo-imperialism describes technological domination where advanced nations control the intellectual and algorithmic means of production while developing nations remain passive consumers.",
        2024, "Hard", "comp_1"
    ),
    (
        "english", "Section A - Comprehension", "Comprehension",
        "Which of the following is identified as a direct threat to entry-level jobs for educated African youths?",
        "The widespread cultivation of cassava",
        "The automation of business process outsourcing (BPO) roles",
        "The migration of rural farmers to metropolitan hubs",
        "The adoption of sovereign data protection frameworks",
        "b",
        "Paragraph 3 states: 'automation poses a lethal threat to entry-level business process outsourcing (BPO) occupations—traditionally the entry ramp for educated youths'.",
        2024, "Medium", "comp_1"
    ),
    (
        "english", "Section A - Comprehension", "Comprehension",
        "Which word best captures the author's tone toward the role of African governments in the AI revolution?",
        "Indifferent and detached",
        "Cautiously celebratory",
        "Urgent and admonitory",
        "Sarcastic and hopeless",
        "c",
        "The author urgently admonishes policymakers that they must not 'merely spectate' and calls for a 'seismic paradigm shift'.",
        2024, "Hard", "comp_1"
    ),

    # --- COMPREHENSION PASSAGE 2 (Questions 6 - 10) ---
    (
        "english", "Section A - Comprehension", "Comprehension",
        "What historically enabled Sahelian communities to maintain ecological balance?",
        "The permanent construction of concrete boundary walls",
        "Regenerative fallow cycles and negotiated migratory movements",
        "Continuous intensive monoculture farming along desert borders",
        "Exclusive reliance on international food aid importations",
        "b",
        "Paragraph 1 notes that pastoralist and agrarian communities survived through 'intricately negotiated migratory patterns and regenerative fallow cycles.'",
        2024, "Medium", "comp_2"
    ),
    (
        "english", "Section A - Comprehension", "Comprehension",
        "The term 'aeolian erosion' as used in paragraph 2 refers to soil degradation caused by:",
        "Torrential flash floods",
        "The action of wind",
        "Chemical contamination from pesticides",
        "Over-extraction of underground minerals",
        "b",
        "Aeolian (or eolian) processes pertain to wind activity, specifically the erosion, transport, and deposition of sediment by wind.",
        2024, "Hard", "comp_2"
    ),
    (
        "english", "Section A - Comprehension", "Comprehension",
        "According to the text, the shrinking of Lake Chad has directly contributed to:",
        "The immediate completion of the Great Green Wall project",
        "Escalating conflicts between sedentary farmers and nomadic pastoralists",
        "An unexpected surplus of arable agricultural farmland",
        "The total eradication of trans-border insurgent groups",
        "b",
        "Paragraph 3 links diminished water reservoirs in Lake Chad directly to 'fierce clashes between sedentary farmers and nomadic Fulani herders.'",
        2024, "Medium", "comp_2"
    ),
    (
        "english", "Section A - Comprehension", "Comprehension",
        "What reservation do agronomic scientists hold concerning the 'Great Green Wall'?",
        "Tree planting alone is futile without tenure security and comprehensive socio-economic reforms",
        "The trees planted will accelerate water depletion in the Sahelian aquifers",
        "Pastoralists are unwilling to graze their herds near newly planted trees",
        "The desert has ceased to expand southward into Guinea savannah",
        "a",
        "The concluding paragraph highlights that 'mere afforestation is inadequate without accompanying socio-economic reforms' including tenure security and drought-resilient cultivars.",
        2024, "Hard", "comp_2"
    ),
    (
        "english", "Section A - Comprehension", "Comprehension",
        "An appropriate title that encapsulates the central thesis of the passage is:",
        "The Extinction of Nomadic Cattle Herding in West Africa",
        "The Sahel: Ecological Vulnerability, Conflict, and the Imperative for Sustainable Stewardship",
        "Agricultural Irrigation Schemes around the Lake Chad Basin",
        "Why Afforestation Programmes Always Fail in Arid Regions",
        "b",
        "Option B captures both the ecological degradation, resulting socio-political conflict, and the multidimensional requirements for solutions.",
        2024, "Medium", "comp_2"
    ),

    # --- CLOZE PASSAGE 1 (Questions 11 - 20) ---
    (
        "english", "Section A - Cloze Passage", "Cloze Passage",
        "Choose the option that best completes gap (1) in Cloze Passage 1.",
        "queues", "arguments", "meetings", "debates",
        "a",
        "Traditional banking halls were notorious for long queues (lines of waiting customers).",
        2024, "Easy", "cloze_1"
    ),
    (
        "english", "Section A - Cloze Passage", "Cloze Passage",
        "Choose the option that best completes gap (2) in Cloze Passage 1.",
        "augmenting", "obviating", "instigating", "perpetuating",
        "b",
        "'Obviating' means removing a need or making something unnecessary. Digital banking removes or obviates the need for physical cash.",
        2024, "Hard", "cloze_1"
    ),
    (
        "english", "Section A - Cloze Passage", "Cloze Passage",
        "Choose the option that best completes gap (3) in Cloze Passage 1.",
        "precipitated", "hindered", "retarded", "condemned",
        "a",
        "'Precipitated' means caused (an event or situation, typically one that is desirable or unexpected) to happen suddenly or quickly.",
        2024, "Medium", "cloze_1"
    ),
    (
        "english", "Section A - Cloze Passage", "Cloze Passage",
        "Choose the option that best completes gap (4) in Cloze Passage 1.",
        "enthusiasm", "apathy", "scepticism", "approval",
        "c",
        "Regulators initially viewed novel fintech start-ups with scepticism (doubt or mistrust) due to fear of liquidity risk.",
        2024, "Medium", "cloze_1"
    ),
    (
        "english", "Section A - Cloze Passage", "Cloze Passage",
        "Choose the option that best completes gap (5) in Cloze Passage 1.",
        "exclusion", "inclusion", "extravagance", "inflation",
        "b",
        "'Financial inclusion' is the standard economic and development term for providing banking services to previously unbanked populations.",
        2024, "Easy", "cloze_1"
    ),
    (
        "english", "Section A - Cloze Passage", "Cloze Passage",
        "Choose the option that best completes gap (6) in Cloze Passage 1.",
        "perils", "benefits", "profits", "dividends",
        "a",
        "'Perils' denotes serious dangers or hazards, contrasting with the convenience mentioned earlier.",
        2024, "Medium", "cloze_1"
    ),
    (
        "english", "Section A - Cloze Passage", "Cloze Passage",
        "Choose the option that best completes gap (7) in Cloze Passage 1.",
        "swindle", "bestow", "endow", "reimburse",
        "a",
        "'Swindle' means to cheat or defraud someone of money or property.",
        2024, "Medium", "cloze_1"
    ),
    (
        "english", "Section A - Cloze Passage", "Cloze Passage",
        "Choose the option that best completes gap (8) in Cloze Passage 1.",
        "parsimoniously", "substantially", "reluctantly", "negligibly",
        "b",
        "Banks must invest 'substantially' (large amounts of capital and effort) in cybersecurity.",
        2024, "Medium", "cloze_1"
    ),
    (
        "english", "Section A - Cloze Passage", "Cloze Passage",
        "Choose the option that best completes gap (9) in Cloze Passage 1.",
        "inadvertently", "deliberately", "prudently", "judiciously",
        "a",
        "'Inadvertently' means without intention, accidentally or heedlessly disclosing credentials.",
        2024, "Hard", "cloze_1"
    ),
    (
        "english", "Section A - Cloze Passage", "Cloze Passage",
        "Choose the option that best completes gap (10) in Cloze Passage 1.",
        "obstacle", "impediment", "cornerstone", "liability",
        "c",
        "A 'cornerstone' is a vital fundamental basis or bedrock upon which something is constructed.",
        2024, "Medium", "cloze_1"
    ),

    # --- NOVEL / PRESCRIBED READING TEXT (Questions 21 - 30) ---
    (
        "english", "Section A - Prescribed Text", "The Life Changer",
        "In Khadija Abubakar Jalli's 'The Life Changer', what prompted Ummi to recount stories to her children?",
        "Bint's precocious classroom encounter with her French teacher, Mallam Salihu",
        "Omar's decision to drop out of the university",
        "Teemah's refusal to attend secondary school",
        "Jamila's illness that kept her bedridden",
        "a",
        "The opening exposition begins when Bint recounts how she tackled her French teacher Mallam Salihu in class, prompting the family storytelling session.",
        2024, "Medium", "novel_1"
    ),
    (
        "english", "Section A - Prescribed Text", "The Life Changer",
        "What significant news had Omar brought home that initiated the primary narrative celebration?",
        "He won a federal government scholarship to study abroad",
        "He gained admission into Kongo Campus, Ahmadu Bello University to study Law",
        "He was elected president of the University Student Union",
        "He passed his secondary school certificate exam with straight distinctions",
        "b",
        "Omar jubilantly announced his admission to study Law at Ahmadu Bello University (ABU), Zaria.",
        2024, "Medium", "novel_1"
    ),
    (
        "english", "Section A - Prescribed Text", "The Life Changer",
        "In Ummi's narration of village lore, what was the community's pseudonym for the notorious extortionist district head?",
        "Hakimi", "Talle", "Karmale", "Zaki",
        "a",
        "The district head was traditionally addressed as Hakimi in the northern rural administrative setting portrayed in the novel.",
        2024, "Medium", "novel_1"
    ),
    (
        "english", "Section A - Prescribed Text", "The Life Changer",
        "Why was Talle colloquially referred to as 'the quiet one' in Lafayette village?",
        "He was born deaf and mute",
        "He lived an exceedingly introverted and taciturn lifestyle after losing his family",
        "He took a formal vow of monastic silence as an ascetic",
        "He was banished from community gatherings by the council of elders",
        "b",
        "Talle was renowned for his extreme quietness, introversion, and gentle solitary demeanour in the community.",
        2024, "Easy", "novel_1"
    ),
    (
        "english", "Section A - Prescribed Text", "The Life Changer",
        "What shocking crime ultimately unravelled Talle's secluded life and led to his arrest?",
        "Armed robbery on the interstate highway",
        "Complicity in the kidnapping and extortion of a young boy hidden in his house",
        "The illegal distillation and distribution of local alcohol",
        "The forgery of university matriculation admission letters",
        "b",
        "Talle unwittingly harboured kidnapped victims in his house at the behest of unscrupulous criminal accomplices, leading to police intervention.",
        2024, "Medium", "novel_1"
    ),
    (
        "english", "Section A - Prescribed Text", "The Life Changer",
        "Salma's initial arrogant perception of tertiary institutions as spaces of unbridled liberty was radically shattered when:",
        "She failed all her first-semester degree examinations",
        "She became entangled in an examination malpractice scandal that resulted in expulsion",
        "She was denied entry into the campus hostel by the porter",
        "Her roommates refused to cook communal meals with her",
        "b",
        "Salma's misplaced nonchalance and involvement in examination malpractice culminated in her facing the university disciplinary committee and expulsion.",
        2024, "Hard", "novel_1"
    ),
    (
        "english", "Section A - Prescribed Text", "The Life Changer",
        "Which character serves as a foil to Salma's flamboyant and deceitful lifestyle at the university?",
        "Ada", "Ngozi", "Tomba", "Kola",
        "b",
        "Ngozi is portrayed as studious, humble, and morally grounded, in stark contrast to Salma's ostentatious lifestyle.",
        2024, "Medium", "novel_1"
    ),
    (
        "english", "Section A - Prescribed Text", "The Life Changer",
        "What does the term 'Life Changer' metaphorically symbolize in the context of the novel?",
        "The financial lottery won by Omar's father",
        "The transformative transition into university life, which fundamentally tests character and moral choices",
        "The migration from northern Nigeria to Lagos",
        "The procurement of a smartphone by secondary school graduates",
        "b",
        "The novel emphasizes that gaining university admission is a profound 'life changer' that exposes youth to absolute freedom where their choices make or break them.",
        2024, "Easy", "novel_1"
    ),
    (
        "english", "Section A - Prescribed Text", "The Life Changer",
        "How did Salma manage to overcome her legal and emotional distress after her expulsion from the university?",
        "She fled the country to seek political asylum",
        "She repented of her arrogance, sought reconciliation, and enrolled in another institution with humility",
        "She organized student protests to burn down the administration building",
        "She successfully bribed the committee chairman with foreign currency",
        "b",
        "Salma underwent profound contrition and character transformation, discarding superficial vanities and rebuilding her life earnestly.",
        2024, "Medium", "novel_1"
    ),
    (
        "english", "Section A - Prescribed Text", "The Life Changer",
        "What central moral lesson does Ummi seek to impart to Omar as he prepares for matriculation?",
        "That academic success is purely a product of luck rather than discipline",
        "That university freedom requires vigilant self-restraint and unwavering moral integrity",
        "That one must compromise one's values to gain peer popularity on campus",
        "That family loyalty should be abandoned once one achieves financial independence",
        "b",
        "Ummi repeatedly counsels Omar that the university offers boundless freedom, and only personal character, moral conviction, and self-restraint will prevent downfall.",
        2024, "Easy", "novel_1"
    ),

    # --- SECTION B: LEXIS AND STRUCTURE - ANTONYMS (Questions 31 - 35) ---
    (
        "english", "Section B - Lexis and Structure", "Antonyms",
        "Choose the option that is most nearly OPPOSITE in meaning to the word in CAPITAL letters: The minister made an ARBITRARY decision without consulting the board.",
        "Random", "Methodical", "Hasty", "Impulsive",
        "b",
        "Arbitrary means based on random choice or personal whim rather than reason or system. Its antonym is 'methodical' (systematic, well-ordered).",
        2023, "Medium", None
    ),
    (
        "english", "Section B - Lexis and Structure", "Antonyms",
        "Choose the option most nearly OPPOSITE in meaning to the CAPITALIZED word: The defendant was completely EXONERATED by the appellate court.",
        "Acquitted", "Absolved", "Convicted", "Pardoned",
        "c",
        "Exonerated means declared free from guilt or blame. The direct opposite is 'convicted' (found guilty of a criminal offence).",
        2023, "Easy", None
    ),
    (
        "english", "Section B - Lexis and Structure", "Antonyms",
        "Choose the option most nearly OPPOSITE in meaning to the CAPITALIZED word: His speech was surprisingly LUCID despite the technical complexity of the topic.",
        "Obscure", "Clear", "Transparent", "Eloquent",
        "a",
        "Lucid means clear, easily understood, and intelligible. Its antonym is 'obscure' (unclear, ambiguous, difficult to comprehend).",
        2023, "Medium", None
    ),
    (
        "english", "Section B - Lexis and Structure", "Antonyms",
        "Choose the option most nearly OPPOSITE in meaning to the CAPITALIZED word: The newly appointed chairman was commended for his FRUGAL management of company resources.",
        "Economical", "Extravagant", "Prudent", "Thrifty",
        "b",
        "Frugal means sparing or economical with regard to money. The opposite is 'extravagant' (wastefully spending money or resources).",
        2023, "Easy", None
    ),
    (
        "english", "Section B - Lexis and Structure", "Antonyms",
        "Choose the option most nearly OPPOSITE in meaning to the CAPITALIZED word: The athlete displayed a PUSILLANIMOUS attitude in the face of defeat.",
        "Cowardly", "Timid", "Courageous", "Hesitant",
        "c",
        "Pusillanimous means lacking courage or resolution; cowardly. Its exact opposite is 'courageous' (brave, valiant).",
        2023, "Hard", None
    ),

    # --- SECTION B: LEXIS AND STRUCTURE - SYNONYMS (Questions 36 - 40) ---
    (
        "english", "Section B - Lexis and Structure", "Synonyms",
        "Choose the option NEAREST IN MEANING to the word in CAPITAL letters: The old professor was known for his ERUDITE commentaries on constitutional law.",
        "Scholarly", "Boring", "Confusing", "Superficial",
        "a",
        "Erudite means having or showing profound knowledge; scholarly and well-learned.",
        2023, "Medium", None
    ),
    (
        "english", "Section B - Lexis and Structure", "Synonyms",
        "Choose the option NEAREST IN MEANING to the CAPITALIZED word: The CEO was accused of practicing NEPOTISM in executive appointments.",
        "Corruption", "Favouritism toward relatives", "Incompetence", "Financial embezzlement",
        "b",
        "Nepotism refers to the practice among those with power or influence of favouring relatives or friends, especially by giving them jobs.",
        2023, "Easy", None
    ),
    (
        "english", "Section B - Lexis and Structure", "Synonyms",
        "Choose the option NEAREST IN MEANING to the CAPITALIZED word: The diplomat handled the delicate dispute with commendable TACT.",
        "Aggression", "Diplomacy", "Hesitation", "Arrogance",
        "b",
        "Tact is skill and sensitivity in dealing with others or with difficult issues; diplomacy and discretion.",
        2023, "Medium", None
    ),
    (
        "english", "Section B - Lexis and Structure", "Synonyms",
        "Choose the option NEAREST IN MEANING to the CAPITALIZED word: The community leader gave a TERSENESS to his final verdict that left no room for doubt.",
        "Conciseness", "Ambiguity", "Anger", "Garrulousness",
        "a",
        "Terse means brief and to the point; conciseness or succinctness without superfluous words.",
        2023, "Hard", None
    ),
    (
        "english", "Section B - Lexis and Structure", "Synonyms",
        "Choose the option NEAREST IN MEANING to the CAPITALIZED word: The evidence presented by the prosecution was entirely SPURIOUS.",
        "Authentic", "Fabricated", "Irrefutable", "Overwhelming",
        "b",
        "Spurious means not being what it purports to be; false, counterfeit, or fabricated.",
        2023, "Hard", None
    ),

    # --- SECTION B: LEXIS AND STRUCTURE - SENTENCE INTERPRETATION (Questions 41 - 45) ---
    (
        "english", "Section B - Lexis and Structure", "Sentence Interpretation",
        "Interpret the statement: 'The auditor was caught between the devil and the deep blue sea.' This means the auditor:",
        "Was on a maritime voyage during a severe hurricane",
        "Faced two equally dangerous or unpleasant alternatives",
        "Decided to compromise with the corrupt officials",
        "Escaped unscathed from a dangerous confrontation",
        "b",
        "The idiom 'between the devil and the deep blue sea' signifies being in a dilemma where one must choose between two undesirable courses of action.",
        2023, "Easy", None
    ),
    (
        "english", "Section B - Lexis and Structure", "Sentence Interpretation",
        "Interpret: 'When the crisis erupted, the commissioner passed the buck.' This means the commissioner:",
        "Donated large sums of money to the emergency relief fund",
        "Shifted the responsibility and blame onto someone else",
        "Resigned immediately from government service",
        "Refused to speak with journalists",
        "b",
        "'Pass the buck' is an established idiom meaning to shift responsibility or blame to another person.",
        2023, "Easy", None
    ),
    (
        "english", "Section B - Lexis and Structure", "Sentence Interpretation",
        "Interpret: 'His explanation of the financial discrepancies was a cock-and-bull story.' This means his explanation was:",
        "Derived from a popular folklore concerning farm animals",
        "Incredible and fabricated to deceive his listeners",
        "Validated by reputable independent forensic accountants",
        "Delivered with great anger and hostility",
        "b",
        "A 'cock-and-bull story' is an absurd, implausible, and fabricated tale used as an excuse.",
        2023, "Medium", None
    ),
    (
        "english", "Section B - Lexis and Structure", "Sentence Interpretation",
        "Interpret: 'The project manager threw in the towel after funding was rescinded.' This means the project manager:",
        "Washed all dirty linen in the laundry room",
        "Admitted defeat and surrendered the endeavor",
        "Appealed directly to the board of trustees for additional grants",
        "Celebrated the successful completion of the assignment",
        "b",
        "To 'throw in the towel' is an idiom derived from boxing meaning to surrender, admit defeat, or abandon a struggle.",
        2023, "Easy", None
    ),
    (
        "english", "Section B - Lexis and Structure", "Sentence Interpretation",
        "Interpret: 'The candidate took the news of his score with a grain of salt.' This means the candidate:",
        "Added salt to his meal while listening to the radio",
        "Received the news with scepticism and did not accept it completely",
        "Broke down into uncontrollable tears of sorrow",
        "Immediately forwarded the news to all his family members",
        "b",
        "To take something 'with a grain of salt' means to view it with scepticism and reserve judgment regarding its absolute truth.",
        2023, "Medium", None
    ),

    # --- SECTION B: LEXIS AND STRUCTURE - GRAMMAR, CONCORD & PREPOSITIONS (Questions 46 - 50) ---
    (
        "english", "Section B - Lexis and Structure", "Grammar & Concord",
        "Choose the option that best completes the sentence: The committee _____ decided to submit its final report next month.",
        "has", "have", "are", "were",
        "a",
        "When a collective noun like 'committee' acts as a unified singular body, it takes a singular verb ('has').",
        2024, "Medium", None
    ),
    (
        "english", "Section B - Lexis and Structure", "Grammar & Concord",
        "Choose the option that best completes the sentence: Neither the governor nor his commissioners _____ present at the groundbreaking ceremony.",
        "was", "were", "is", "are been",
        "b",
        "According to the rule of proximity in concord, when correlative conjunctions 'neither...nor' join subjects of different numbers, the verb agrees with the nearer subject ('commissioners' -> plural -> 'were').",
        2024, "Medium", None
    ),
    (
        "english", "Section B - Lexis and Structure", "Grammar & Concord",
        "Choose the correct option: I demand that he _____ immediately to the disciplinary committee.",
        "apologizes", "apologize", "apologized", "should apologized",
        "b",
        "The present subjunctive mood is used after verbs of demand, request, or recommendation ('demand that he apologize' - base form of the verb).",
        2024, "Hard", None
    ),
    (
        "english", "Section B - Lexis and Structure", "Grammar & Concord",
        "Choose the correct option: The juvenile delinquent was charged _____ armed robbery and unlawful possession of firearms.",
        "for", "with", "of", "about",
        "b",
        "The standard legal idiom in English is to be 'charged with' a crime (compare: 'accused of' a crime).",
        2024, "Easy", None
    ),
    (
        "english", "Section B - Lexis and Structure", "Grammar & Concord",
        "Choose the correct option: Had I known you were stranded at the terminus, I _____ to pick you up.",
        "would come", "will have come", "would have come", "had come",
        "c",
        "This is a third conditional inversion expressing past unfulfilled hypothesis: 'Had I known... I would have come'.",
        2024, "Medium", None
    ),

    # --- SECTION C: ORAL FORMS - VOWELS & DIPHTHONGS (Questions 51 - 52) ---
    (
        "english", "Section C - Oral Forms", "Vowels",
        "From the options lettered A to D, choose the word that contains the SAME VOWEL SOUND as the one represented by the underlined letter(s): b<l><u><o>d",
        "flood", "food", "fool", "book",
        "a",
        "The vowel sound in 'blood' is the short central open vowel /ʌ/ (as in cup, flood, sun). 'Food' and 'fool' have /uː/, and 'book' has /ʊ/.",
        2023, "Medium", None
    ),
    (
        "english", "Section C - Oral Forms", "Vowels",
        "Choose the word that contains the SAME DIPHTHONG sound as the underlined letter(s): c<o><a coat",
        "court", "boat", "caught", "cost",
        "b",
        "'Coat' has the diphthong /əʊ/ (as in 'boat', 'go', 'home'). 'Court' and 'caught' have the monophthong /ɔː/, while 'cost' has /ɒ/.",
        2023, "Medium", None
    ),

    # --- SECTION C: ORAL FORMS - CONSONANTS (Questions 53 - 54) ---
    (
        "english", "Section C - Oral Forms", "Consonants",
        "From the options lettered A to D, choose the word that contains the SAME CONSONANT SOUND as the one represented by the underlined letters: <ph>one",
        "physics", "psychology", "pneumonia", "praise",
        "a",
        "The letters 'ph' in 'phone' represent the voiceless labiodental fricative /f/, exactly as in 'physics'. In 'psychology' and 'pneumonia', the letter 'p' is silent.",
        2023, "Easy", None
    ),
    (
        "english", "Section C - Oral Forms", "Consonants",
        "In which of the following words is the letter 'b' SILENT?",
        "table", "subtle", "blanket", "timber",
        "b",
        "In 'subtle' (pronounced /ˈsʌt.əl/), the letter 'b' is silent. In 'table', 'blanket', and 'timber', 'b' is voiced.",
        2023, "Medium", None
    ),

    # --- SECTION C: ORAL FORMS - RHYMES (Questions 55 - 56) ---
    (
        "english", "Section C - Oral Forms", "Rhymes",
        "From the options lettered A to D, choose the word that RHYMES with: suite",
        "suit", "sweet", "sweat", "shoot",
        "b",
        "'Suite' is pronounced exactly as /swiːt/, rhyming perfectly with 'sweet'. 'Suit' is pronounced /suːt/ or /sjuːt/.",
        2023, "Medium", None
    ),
    (
        "english", "Section C - Oral Forms", "Rhymes",
        "From the options lettered A to D, choose the word that RHYMES with: reign",
        "rain", "reignite", "reinstate", "ran",
        "a",
        "'Reign' is pronounced /reɪn/, forming an exact homophone and rhyme with 'rain'.",
        2023, "Easy", None
    ),

    # --- SECTION C: ORAL FORMS - SYLLABLE STRESS (Questions 57 - 58) ---
    (
        "english", "Section C - Oral Forms", "Syllable Stress",
        "Choose the option with the correct PRIMARY STRESS pattern for the word: PHOTOGRAPH",
        "PHO-to-graph", "pho-TO-graph", "pho-to-GRAPH", "pho-to-graph",
        "a",
        "The noun 'photograph' is stressed on the first syllable: /ˈfəʊ.tə.ɡrɑːf/ (PHO-to-graph). Compare with pho-TO-gra-pher and pho-to-GRA-phic.",
        2023, "Medium", None
    ),
    (
        "english", "Section C - Oral Forms", "Syllable Stress",
        "Choose the option with the correct PRIMARY STRESS pattern for the word: DEMOCRACY",
        "DE-mo-cra-cy", "de-MO-cra-cy", "de-mo-CRA-cy", "de-mo-cra-CY",
        "b",
        "Words ending in the suffix '-cracy' carry primary stress on the antepenultimate syllable (third from end): de-MO-cra-cy /dɪˈmɒk.rə.si/.",
        2023, "Hard", None
    ),

    # --- SECTION C: ORAL FORMS - EMPHATIC STRESS (Questions 59 - 60) ---
    (
        "english", "Section C - Oral Forms", "Emphatic Stress",
        "In the sentence below, the word in CAPITAL letters has the emphatic stress: 'Ngozi bought a BRAND-NEW bicycle for her brother.' To which of the following questions is this sentence the appropriate answer?",
        "Did Ngozi buy a second-hand bicycle for her brother?",
        "Did Ngozi sell a brand-new bicycle for her brother?",
        "Did Ngozi buy a brand-new motorcycle for her brother?",
        "Did Emeka buy a brand-new bicycle for her brother?",
        "a",
        "Emphatic stress highlights the contrast. Stressing 'BRAND-NEW' directly contradicts and answers 'Did Ngozi buy a second-hand bicycle...?'",
        2023, "Medium", None
    ),
    (
        "english", "Section C - Oral Forms", "Emphatic Stress",
        "In the sentence below, the word in CAPITAL letters has the emphatic stress: 'The GOVERNOR donated five ambulances to the hospital yesterday.' Which question does this sentence answer?",
        "Did the senator donate five ambulances to the hospital yesterday?",
        "Did the governor sell five ambulances to the hospital yesterday?",
        "Did the governor donate ten ambulances to the hospital yesterday?",
        "Did the governor donate five ambulances to the school yesterday?",
        "a",
        "Stressing 'GOVERNOR' emphasizes WHO made the donation, directly correcting the question 'Did the senator donate...?'",
        2023, "Medium", None
    )
]

cursor.executemany("""
INSERT INTO questions (
    subject_id, section, topic, question, option_a, option_b, option_c, option_d,
    correct_answer, explanation, year, difficulty, passage_id
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
""", english_questions)

conn.commit()
print(f"Successfully seeded {len(english_questions)} Use of English questions with full syllabus coverage!")
conn.close()
