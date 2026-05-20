window.CBSE_STUDY_DATA = {
  updatedOn: "2026-05-20",
  examWindow: "Feb-Mar 2027",
  sources: [
    {
      title: "CBSE Curriculum 2026-27",
      type: "Official curriculum portal",
      url: "https://cbseacademic.nic.in/curriculum_2027.html",
      note: "Primary source for subject syllabus and prescribed books."
    },
    {
      title: "CBSE circular Acad-14/2026",
      type: "Official release circular",
      url: "https://cbseacademic.nic.in/web_material/Circulars/2026/14_Circular_2026.pdf",
      note: "Confirms release of the 2026-27 curriculum for Classes IX-XII."
    },
    {
      title: "CBSE Class XII sample papers 2025-26",
      type: "Official sample papers",
      url: "https://cbseacademic.nic.in/SQP_CLASSXII_2025-26.html",
      note: "Used as current public paper-format reference until 2026-27 sample papers are published."
    },
    {
      title: "CBSE previous years question papers",
      type: "Official question-paper archive",
      url: "https://www.cbse.gov.in/cbsenew/question-paper.html",
      note: "Archive for board-paper calibration, including recent Class XII examination papers."
    }
  ],
  subjects: [
    {
      id: "legal-studies",
      name: "Legal Studies",
      code: "074",
      icon: "LS",
      theoryMarks: 80,
      practicalMarks: 20,
      durationMinutes: 180,
      officialUrl: "https://cbseacademic.nic.in/web_material/CurriculumMain27/SecPart2/LegalStudies_SecP2_2026-27.pdf",
      samplePaperUrl: "https://cbseacademic.nic.in/web_material/SQP/ClassXII_2025_26/LegalStudies-SQP.pdf",
      pattern: {
        basis: "CBSE 2026-27 curriculum plus the latest official Class XII Legal Studies sample paper available publicly for 2025-26.",
        questionMarks: [1, 2, 3, 5],
        requestedMarksSupported: [1, 2, 3, 4, 5, 6],
        sections: [
          "Section A: objective and MCQ style questions",
          "Section B: 2-mark short answers",
          "Section C: 3-mark short answers and case situations",
          "Section D: 5-mark long answers"
        ],
        competencies: [
          { name: "Legal recall and terms", weight: 30 },
          { name: "Application to fact situations", weight: 40 },
          { name: "Analysis of statutes, cases, and remedies", weight: 30 }
        ]
      },
      books: [
        {
          id: "legal-xii",
          title: "Legal Studies Class XII",
          publisher: "CBSE revised textbook",
          chapters: [
            {
              id: "legal-judiciary",
              unit: "Unit 1",
              title: "Judiciary",
              marks: 8,
              topics: [
                "Structure, hierarchy of courts, and legal officers in India",
                "Constitution, roles, and impartiality",
                "Appointment, retirement, and removal of judges",
                "Tribunals",
                "Courts and judicial review"
              ],
              boardMoves: ["court hierarchy", "judicial independence", "collegium", "review power"],
              hook: "Think of the judiciary as the scoreboard, referee, and rule interpreter in one institution."
            },
            {
              id: "legal-adr",
              unit: "Unit 2",
              title: "Alternative Dispute Resolution in India",
              marks: 8,
              topics: [
                "Adversarial and inquisitorial systems",
                "Meaning and scope of ADR",
                "Arbitration",
                "Mediation",
                "Conciliation",
                "Lok Adalat",
                "Ombudsman",
                "Lokpal and Lokayukta"
              ],
              boardMoves: ["compare ADR methods", "Section 89 CPC", "speedy settlement", "institutional forums"],
              hook: "ADR is the law's traffic-diversion plan: fewer jams, faster routes, but still rule-bound."
            },
            {
              id: "legal-contract",
              unit: "Unit 3A",
              title: "Law of Contract",
              marks: 5,
              topics: [
                "Introduction to contracts",
                "Formation of contract",
                "Intention to contract",
                "Consideration",
                "Capacity to contract",
                "Consent",
                "Types of contracts",
                "Discharge of contract",
                "Remedies in case of breach"
              ],
              boardMoves: ["valid contract essentials", "minor's agreement", "free consent", "breach remedies"],
              hook: "A contract is a promise wearing formal shoes: offer, acceptance, consideration, capacity, and consent."
            },
            {
              id: "legal-torts",
              unit: "Unit 3B",
              title: "Law of Torts",
              marks: 5,
              topics: [
                "Concept of law of torts",
                "Sources of law of torts",
                "Intentional tort",
                "Defamation",
                "Negligence",
                "Strict liability",
                "Absolute liability"
              ],
              boardMoves: ["civil wrong", "duty and breach", "defamation elements", "liability standards"],
              hook: "Tort law asks a simple question with serious consequences: who caused harm and who must repair it?"
            },
            {
              id: "legal-property",
              unit: "Unit 3C",
              title: "Law of Property",
              marks: 5,
              topics: [
                "Types of property",
                "Who can transfer property",
                "Essentials of a valid transfer",
                "Sale",
                "Lease",
                "Exchange",
                "Gift"
              ],
              boardMoves: ["transfer types", "valid transfer", "mutation", "sale versus lease"],
              hook: "Property law is the handover protocol: what is being moved, who can move it, and how the law records it."
            },
            {
              id: "legal-ipr",
              unit: "Unit 3D",
              title: "Intellectual Property Law",
              marks: 5,
              topics: [
                "Meaning of intellectual property",
                "International obligations shaping Indian IPR",
                "WIPO",
                "Copyright",
                "Patent",
                "Trademark",
                "Geographical indication",
                "Design"
              ],
              boardMoves: ["match IPR types", "moral rights", "GI examples", "patent versus trade secret"],
              hook: "IPR protects ideas once they step into the world as art, inventions, brands, designs, or place-linked products."
            },
            {
              id: "legal-sustainable-development",
              unit: "Unit 4A",
              title: "Law and Sustainable Development",
              marks: 4,
              topics: [
                "Introduction",
                "International initiatives",
                "Indian constitutional provisions",
                "Environment Protection Act, 1986",
                "Pollution Control Boards"
              ],
              boardMoves: ["Article 48A", "environmental statutes", "public interest", "pollution control"],
              hook: "This chapter is where law stops being paperwork and starts breathing clean air."
            },
            {
              id: "legal-entities",
              unit: "Unit 4B",
              title: "Forms of Legal Entities",
              marks: 3,
              topics: [
                "Sole proprietorship",
                "Partnership",
                "Limited liability partnership",
                "Private limited company",
                "Public limited company",
                "One person company"
              ],
              boardMoves: ["entity comparison", "liability", "ownership", "business suitability"],
              hook: "Choosing a legal entity is like choosing a vehicle: cycle, car, bus, or train depending on risk and scale."
            },
            {
              id: "legal-criminal-law",
              unit: "Unit 4C",
              title: "Criminal Laws in India",
              marks: 3,
              topics: [
                "Objectives of criminal law",
                "Legislations for criminal laws in India",
                "Distinction between intention and motive",
                "Stages of crime",
                "The Indian Evidence Act",
                "Admission and confession"
              ],
              boardMoves: ["stages of crime", "intention versus motive", "evidence", "confession"],
              hook: "Criminal law follows the trail from thought to preparation to attempt to commission."
            },
            {
              id: "legal-human-rights-india",
              unit: "Unit 5A",
              title: "Human Rights in India",
              marks: 5,
              topics: [
                "Historical context",
                "Preamble",
                "Fundamental Rights",
                "Directive Principles",
                "Fundamental Duties"
              ],
              boardMoves: ["constitutional framework", "rights and duties", "DPSP links", "case-based application"],
              hook: "Human rights are the Constitution's promise that power must remember the person."
            },
            {
              id: "legal-human-rights-commissions",
              unit: "Unit 5B",
              title: "Human Rights Violations and Complaint Mechanisms",
              marks: 5,
              topics: [
                "Quasi-judicial bodies",
                "National Human Rights Commission",
                "National Commission for Minorities",
                "National Commission for Women",
                "National Commission for Scheduled Castes and Scheduled Tribes",
                "National Commission for Protection of Child Rights"
              ],
              boardMoves: ["forum identification", "powers of commissions", "complaint route", "rights violation facts"],
              hook: "Complaint bodies are the help desks of constitutional protection: not courts, but not toothless either."
            },
            {
              id: "legal-international-law",
              unit: "Unit 6",
              title: "International Law",
              marks: 8,
              topics: [
                "Introduction",
                "Historical evolution of international law",
                "Meaning of international law",
                "Sources of international law",
                "International human rights",
                "International law and municipal law",
                "International law and India",
                "Dispute resolution"
              ],
              boardMoves: ["sources", "customary law", "ICJ", "municipal law relation"],
              hook: "International law is the rulebook countries use when there is no world police station."
            },
            {
              id: "legal-profession",
              unit: "Unit 7",
              title: "Legal Profession in India",
              marks: 8,
              topics: [
                "The Advocates Act, 1961",
                "Lawyers and professional ethics",
                "Advertising by lawyers",
                "Liberalization and globalization of legal profession",
                "Women and legal profession",
                "Legal education in India, USA, and UK",
                "Opportunities for law graduates"
              ],
              boardMoves: ["advocate roles", "professional ethics", "women in law", "legal education"],
              hook: "This is the chapter where law becomes a career, a duty, and a public trust."
            },
            {
              id: "legal-services",
              unit: "Unit 8",
              title: "Legal Services",
              marks: 8,
              topics: [
                "Brief history of legal services",
                "Free legal aid under criminal law",
                "Legal aid by the State",
                "Legal aid under the Indian Constitution",
                "National Legal Services Authority",
                "Legal Services Authorities Act, 1987",
                "Legal aid in social justice and human rights"
              ],
              boardMoves: ["free legal aid", "NALSA", "access to justice", "poverty and legal rights"],
              hook: "Legal aid is the bridge between having a right and actually being able to use it."
            }
          ]
        }
      ]
    },
    {
      id: "psychology",
      name: "Psychology",
      code: "037",
      icon: "PS",
      theoryMarks: 70,
      practicalMarks: 30,
      durationMinutes: 180,
      officialUrl: "https://cbseacademic.nic.in/web_material/CurriculumMain27/SecPart2/Psychology_SecP2_2026-27.pdf",
      samplePaperUrl: "https://cbseacademic.nic.in/web_material/SQP/ClassXII_2025_26/Psychology-SQP.pdf",
      pattern: {
        basis: "CBSE 2026-27 curriculum plus latest official Psychology sample paper structure.",
        questionMarks: [1, 2, 3, 4, 6],
        requestedMarksSupported: [1, 2, 3, 4, 5, 6],
        sections: [
          "Section A: 1-mark objective questions",
          "Section B: 2-mark very short answers",
          "Section C: 3-mark short answers",
          "Section D: 4-mark long answers",
          "Section E: 6-mark long answers",
          "Section F: case-based questions"
        ],
        competencies: [
          { name: "Remembering and understanding", weight: 50 },
          { name: "Applying", weight: 35 },
          { name: "Formulating, analysing, evaluating, creating", weight: 15 }
        ]
      },
      books: [
        {
          id: "psychology-xii",
          title: "Psychology Class XII",
          publisher: "NCERT",
          chapters: [
            {
              id: "psych-attributes",
              unit: "Unit I",
              title: "Variations in Psychological Attributes",
              marks: 13,
              topics: [
                "Individual differences in human functioning",
                "Assessment of psychological attributes",
                "Intelligence",
                "Psychometric theories of intelligence",
                "Information processing theory",
                "Triarchic theory of intelligence",
                "Theory of multiple intelligences",
                "Culture and intelligence",
                "Emotional intelligence",
                "Aptitude",
                "Creativity"
              ],
              boardMoves: ["theory comparison", "test interpretation", "intelligence types", "aptitude versus interest"],
              hook: "This chapter is psychology's toolkit for noticing that human ability is not one single scoreboard."
            },
            {
              id: "psych-self-personality",
              unit: "Unit II",
              title: "Self and Personality",
              marks: 13,
              topics: [
                "Self and personality",
                "Concept of self",
                "Cognitive and behavioural aspects of self",
                "Culture and self",
                "Concept of personality",
                "Type approaches",
                "Trait approaches",
                "Psychodynamic approach",
                "Behavioural approach",
                "Cultural approach",
                "Humanistic approach",
                "Assessment of personality"
              ],
              boardMoves: ["approaches to personality", "self-esteem", "projective tests", "trait comparison"],
              hook: "Personality is the playlist, not one song: patterns of thinking, feeling, behaving, and becoming."
            },
            {
              id: "psych-life-challenges",
              unit: "Unit III",
              title: "Meeting Life Challenges",
              marks: 9,
              topics: [
                "Nature, types, and sources of stress",
                "Effects of stress on psychological functioning and health",
                "General Adaptation Syndrome",
                "Stress and immune system",
                "Lifestyle",
                "Coping with stress",
                "Stress management techniques",
                "Promoting positive health and well-being",
                "Life skills",
                "Positive health"
              ],
              boardMoves: ["stress cycle", "coping strategies", "GAS stages", "life skills"],
              hook: "Stress is not just pressure; it is the body's alarm system, battery drain, and training signal."
            },
            {
              id: "psych-disorders",
              unit: "Unit IV",
              title: "Psychological Disorders",
              marks: 12,
              topics: [
                "Concepts of abnormality and psychological disorders",
                "Historical background",
                "Classification of psychological disorders",
                "Factors underlying abnormal behaviour",
                "Anxiety disorders",
                "Obsessive-compulsive and related disorders",
                "Trauma and stressor-related disorders",
                "Somatic symptom and related disorders",
                "Dissociative disorders",
                "Depressive disorder",
                "Bipolar and related disorders",
                "Schizophrenia spectrum and psychotic disorders",
                "Neurodevelopmental disorders",
                "Feeding and eating disorders",
                "Substance related and addictive disorders"
              ],
              boardMoves: ["classify symptoms", "disorder features", "historical models", "case identification"],
              hook: "Diagnosis is not name-calling; it is a careful map of distress, impairment, and patterns."
            },
            {
              id: "psych-therapy",
              unit: "Unit V",
              title: "Therapeutic Approaches",
              marks: 9,
              topics: [
                "Nature and process of psychotherapy",
                "Therapeutic relationship",
                "Behaviour therapy",
                "Cognitive therapy",
                "Humanistic-existential therapy",
                "Alternative therapies",
                "Factors contributing to healing in psychotherapy",
                "Ethics in psychotherapy",
                "Rehabilitation of the mentally ill"
              ],
              boardMoves: ["therapy type matching", "therapeutic alliance", "ethics", "rehabilitation"],
              hook: "Therapy is structured help: listening with a method, changing patterns with care."
            },
            {
              id: "psych-attitudes",
              unit: "Unit VI",
              title: "Attitude and Social Cognition",
              marks: 8,
              topics: [
                "Explaining social behaviour",
                "Nature and components of attitudes",
                "Attitude formation",
                "Attitude change",
                "Attitude-behaviour relationship",
                "Prejudice and discrimination",
                "Strategies for handling prejudice"
              ],
              boardMoves: ["ABC components", "attitude change", "prejudice reduction", "behaviour link"],
              hook: "An attitude is a tiny committee in the mind: feelings, beliefs, and action tendencies voting together."
            },
            {
              id: "psych-groups",
              unit: "Unit VII",
              title: "Social Influence and Group Processes",
              marks: 6,
              topics: [
                "Nature and formation of groups",
                "Types of groups",
                "Influence of group on individual behaviour",
                "Social loafing",
                "Group polarisation",
                "Conformity",
                "Compliance",
                "Obedience",
                "Cooperation and competition"
              ],
              boardMoves: ["group type", "influence process", "loafing versus polarisation", "conformity examples"],
              hook: "Groups can lift effort, hide effort, sharpen opinions, and quietly rewrite choices."
            }
          ]
        }
      ]
    },
    {
      id: "economics",
      name: "Economics",
      code: "030",
      icon: "EC",
      theoryMarks: 80,
      practicalMarks: 20,
      durationMinutes: 180,
      officialUrl: "https://cbseacademic.nic.in/web_material/CurriculumMain27/SecPart2/Economics_SecP2_2026-27.pdf",
      samplePaperUrl: "https://cbseacademic.nic.in/web_material/SQP/ClassXII_2025_26/Economics-SQP.pdf",
      pattern: {
        basis: "CBSE 2026-27 curriculum question-paper design and latest Economics sample paper.",
        questionMarks: [1, 3, 4, 6],
        requestedMarksSupported: [1, 2, 3, 4, 5, 6],
        sections: [
          "Section A: Introductory Macroeconomics",
          "Section B: Indian Economic Development",
          "20 objective questions of 1 mark",
          "3-mark, 4-mark, and 6-mark descriptive questions"
        ],
        competencies: [
          { name: "Remembering and understanding", weight: 40 },
          { name: "Applying", weight: 30 },
          { name: "Analysing, evaluating, creating", weight: 30 }
        ]
      },
      books: [
        {
          id: "economics-macro",
          title: "Introductory Macroeconomics",
          publisher: "NCERT",
          chapters: [
            {
              id: "eco-national-income",
              unit: "Unit 1",
              title: "National Income and Related Aggregates",
              marks: 10,
              topics: [
                "Meaning of macroeconomics",
                "Consumption goods, capital goods, final goods, and intermediate goods",
                "Stocks and flows",
                "Gross investment and depreciation",
                "Circular flow of income",
                "Value added method",
                "Expenditure method",
                "Income method",
                "GNP, NNP, GDP, and NDP",
                "Market price and factor cost",
                "Real and nominal GDP",
                "GDP deflator",
                "GDP and welfare"
              ],
              boardMoves: ["numerical aggregates", "method selection", "real versus nominal", "welfare limits"],
              hook: "National income is the economy's report card, but you must read the footnotes."
            },
            {
              id: "eco-money-banking",
              unit: "Unit 2",
              title: "Money and Banking",
              marks: 6,
              topics: [
                "Meaning and functions of money",
                "Supply of money",
                "Currency held by the public",
                "Net demand deposits",
                "Money creation by commercial banks",
                "Central bank functions",
                "Bank rate",
                "CRR and SLR",
                "Repo and reverse repo rate",
                "Open market operations",
                "Margin requirement"
              ],
              boardMoves: ["M1 calculation", "central bank tools", "credit creation", "policy impact"],
              hook: "Money moves like blood through the economy; banks and the central bank control the pulse."
            },
            {
              id: "eco-income-employment",
              unit: "Unit 3",
              title: "Determination of Income and Employment",
              marks: 12,
              topics: [
                "Aggregate demand and its components",
                "Propensity to consume",
                "Propensity to save",
                "Short-run equilibrium output",
                "Investment multiplier",
                "Full employment",
                "Involuntary unemployment",
                "Excess demand",
                "Deficient demand",
                "Fiscal and monetary measures"
              ],
              boardMoves: ["AD components", "multiplier numericals", "gap diagnosis", "corrective measures"],
              hook: "This chapter is the thermostat of the economy: too hot, too cold, and what policy can adjust."
            },
            {
              id: "eco-budget",
              unit: "Unit 4",
              title: "Government Budget and the Economy",
              marks: 6,
              topics: [
                "Meaning of government budget",
                "Objectives of budget",
                "Revenue receipts and capital receipts",
                "Revenue expenditure and capital expenditure",
                "Balanced budget",
                "Surplus budget",
                "Deficit budget",
                "Measures of government deficit"
              ],
              boardMoves: ["receipt classification", "expenditure classification", "deficit measures", "policy purpose"],
              hook: "A budget is not just spending; it is the government's priorities written in numbers."
            },
            {
              id: "eco-bop",
              unit: "Unit 5",
              title: "Balance of Payments",
              marks: 6,
              topics: [
                "Meaning and components of balance of payments",
                "Surplus and deficit",
                "Foreign exchange rate",
                "Fixed exchange rate",
                "Flexible exchange rate",
                "Managed floating",
                "Exchange-rate determination",
                "Merits and demerits of exchange-rate systems"
              ],
              boardMoves: ["account classification", "rate systems", "currency movement", "policy comparison"],
              hook: "The balance of payments is the country's wallet for the world."
            }
          ]
        },
        {
          id: "economics-ied",
          title: "Indian Economic Development",
          publisher: "NCERT",
          chapters: [
            {
              id: "eco-development-experience",
              unit: "Unit 6",
              title: "Development Experience 1947-90 and Reforms Since 1991",
              marks: 12,
              topics: [
                "Indian economy on the eve of independence",
                "Common goals of Five Year Plans",
                "Agriculture: features, problems, and policies",
                "Industry and Industrial Policy Resolution 1956",
                "Small scale industries",
                "Foreign trade",
                "Liberalisation",
                "Globalisation",
                "Privatisation",
                "Demonetization",
                "GST"
              ],
              boardMoves: ["pre-1991 comparison", "plan objectives", "LPG appraisal", "policy timeline"],
              hook: "India's economy has a before-and-after story: planning, pressure, reform, and adjustment."
            },
            {
              id: "eco-current-challenges",
              unit: "Unit 7",
              title: "Current Challenges Facing Indian Economy",
              marks: 20,
              topics: [
                "Human capital formation",
                "Education sector growth",
                "Rural development",
                "Rural credit and marketing",
                "Cooperatives",
                "Agricultural diversification",
                "Organic farming",
                "Employment",
                "Formal and informal sectors",
                "Sustainable economic development",
                "Resources and environment",
                "Global warming"
              ],
              boardMoves: ["human capital role", "rural policy", "employment data interpretation", "sustainability"],
              hook: "This unit is economics with muddy shoes: schools, farms, jobs, environment, and real lives."
            },
            {
              id: "eco-neighbours",
              unit: "Unit 8",
              title: "Development Experience of India: Comparison with Neighbours",
              marks: 8,
              topics: [
                "India and Pakistan",
                "India and China",
                "Economic growth comparison",
                "Population indicators",
                "Sectoral development",
                "Human Development Indicators"
              ],
              boardMoves: ["compare indicators", "sectoral shifts", "HDI reading", "China-Pakistan-India contrasts"],
              hook: "Comparing neighbours turns statistics into stories of choices, speed, and trade-offs."
            }
          ]
        }
      ]
    },
    {
      id: "political-science",
      name: "Political Science",
      code: "028",
      icon: "PO",
      theoryMarks: 80,
      practicalMarks: 20,
      durationMinutes: 180,
      officialUrl: "https://cbseacademic.nic.in/web_material/CurriculumMain27/SecPart2/PoliticalScience_SecP2_2026-27.pdf",
      samplePaperUrl: "https://cbseacademic.nic.in/web_material/SQP/ClassXII_2025_26/PolSci-SQP.pdf",
      pattern: {
        basis: "CBSE 2026-27 curriculum, including the Class XII political science question paper design.",
        questionMarks: [1, 2, 4, 6],
        requestedMarksSupported: [1, 2, 3, 4, 5, 6],
        sections: [
          "12 objective questions",
          "6 short-answer questions of 2 marks",
          "5 short-answer questions of 4 marks",
          "3 passage, map, or cartoon-based questions of 4 marks",
          "4 long-answer questions of 6 marks"
        ],
        competencies: [
          { name: "Knowledge and remembering", weight: 27.5 },
          { name: "Understanding", weight: 30 },
          { name: "Applying", weight: 27.5 },
          { name: "Analysis and evaluation", weight: 15 }
        ]
      },
      books: [
        {
          id: "pol-world",
          title: "Contemporary World Politics",
          publisher: "NCERT",
          chapters: [
            {
              id: "pol-bipolarity",
              unit: "Part A Chapter 1",
              title: "The End of Bipolarity",
              marks: 6,
              topics: [
                "The Soviet system",
                "Gorbachev and disintegration",
                "Causes and consequences of Soviet disintegration",
                "Shock therapy",
                "New entities in world politics",
                "India's relations with Russia and post-communist countries"
              ],
              boardMoves: ["timeline", "shock therapy effects", "Russia relations", "unipolar world"],
              hook: "When bipolarity ended, the world map stayed still but world power moved sharply."
            },
            {
              id: "pol-centres-power",
              unit: "Part A Chapter 2",
              title: "Contemporary Centres of Power",
              marks: 6,
              topics: [
                "European Union",
                "ASEAN",
                "Rise of China",
                "Japan and South Korea as emerging powers"
              ],
              boardMoves: ["EU versus ASEAN", "China's rise", "India-China relations", "regional organisations"],
              hook: "Power is no longer a single throne; it is a crowded table."
            },
            {
              id: "pol-south-asia",
              unit: "Part A Chapter 3",
              title: "Contemporary South Asia",
              marks: 6,
              topics: [
                "Military and democracy in Pakistan and Bangladesh",
                "Monarchy and democracy in Nepal",
                "Ethnic conflict and democracy in Sri Lanka",
                "India-Pakistan conflicts",
                "India and its neighbours",
                "Peace and cooperation"
              ],
              boardMoves: ["country comparison", "SAARC", "conflict causes", "democratic transitions"],
              hook: "South Asia is a family group chat: close, complicated, and impossible to ignore."
            },
            {
              id: "pol-international-organisations",
              unit: "Part A Chapter 4",
              title: "International Organizations",
              marks: 6,
              topics: [
                "United Nations",
                "UN structures and agencies",
                "Security Council",
                "India and permanent membership",
                "Reform of international organisations"
              ],
              boardMoves: ["UN organs", "Security Council reform", "India's claim", "agency roles"],
              hook: "International organisations are the world's meeting rooms: imperfect, necessary, and always negotiated."
            },
            {
              id: "pol-security",
              unit: "Part A Chapter 5",
              title: "Security in the Contemporary World",
              marks: 6,
              topics: [
                "Traditional security",
                "Non-traditional security",
                "Cooperative security",
                "Terrorism",
                "Human security",
                "Global poverty",
                "Health epidemics"
              ],
              boardMoves: ["traditional versus non-traditional", "cooperative security", "examples", "human security"],
              hook: "Security is no longer only borders and armies; it includes hunger, health, fear, and dignity."
            },
            {
              id: "pol-environment",
              unit: "Part A Chapter 6",
              title: "Environment and Natural Resources",
              marks: 6,
              topics: [
                "Environmental concerns in global politics",
                "Earth Summit",
                "Agenda 21",
                "Global commons",
                "Common but differentiated responsibilities",
                "Resource geopolitics",
                "Indigenous people"
              ],
              boardMoves: ["summits", "CBDR", "global commons", "resource politics"],
              hook: "Environmental politics asks who used the planet, who pays, and who gets heard."
            },
            {
              id: "pol-globalisation",
              unit: "Part A Chapter 7",
              title: "Globalisation",
              marks: 4,
              topics: [
                "Meaning and causes of globalisation",
                "Political consequences",
                "Economic consequences",
                "Cultural consequences",
                "India and globalisation",
                "Resistance to globalisation"
              ],
              boardMoves: ["consequence categories", "welfare state", "cultural impact", "India examples"],
              hook: "Globalisation is the world's shortcut key: faster flows, bigger choices, sharper inequalities."
            }
          ]
        },
        {
          id: "pol-india",
          title: "Politics in India Since Independence",
          publisher: "NCERT",
          chapters: [
            {
              id: "pol-nation-building",
              unit: "Part B Chapter 1",
              title: "Challenges of Nation-Building",
              marks: 6,
              topics: [
                "Partition and its consequences",
                "Integration of princely states",
                "Reorganisation of states",
                "Linguistic states",
                "Manipur accession"
              ],
              boardMoves: ["integration strategy", "linguistic reorganisation", "partition impact", "map skills"],
              hook: "Nation-building was not a ribbon-cutting ceremony; it was negotiation under pressure."
            },
            {
              id: "pol-one-party",
              unit: "Part B Chapter 2",
              title: "Era of One-Party Dominance",
              marks: 4,
              topics: [
                "Congress dominance",
                "Opposition parties",
                "Communist Party of India",
                "Bharatiya Jana Sangh",
                "Socialist Party",
                "Swatantra Party"
              ],
              boardMoves: ["one-party dominance versus one-party system", "party matching", "opposition role"],
              hook: "Dominance is not the same as absence of opposition; CBSE loves that distinction."
            },
            {
              id: "pol-planned-development",
              unit: "Part B Chapter 3",
              title: "Politics of Planned Development",
              marks: 2,
              topics: [
                "Planning Commission",
                "Early initiatives for development",
                "Public sector",
                "Agriculture and industry debate",
                "Development model"
              ],
              boardMoves: ["planning goals", "model debate", "NITI Aayog reference", "early development"],
              hook: "Planning is politics wearing an economics coat."
            },
            {
              id: "pol-external-relations",
              unit: "Part B Chapter 4",
              title: "India's External Relations",
              marks: 6,
              topics: [
                "Nehru's foreign policy",
                "Non-alignment",
                "Afro-Asian unity",
                "India-China relations",
                "India-Pakistan relations",
                "Nuclear policy"
              ],
              boardMoves: ["non-alignment", "war and diplomacy", "foreign policy aims", "China timeline"],
              hook: "Foreign policy is how a country says who it is when everyone else is watching."
            },
            {
              id: "pol-congress-system",
              unit: "Part B Chapter 5",
              title: "Challenges to and Restoration of the Congress System",
              marks: 4,
              topics: [
                "Political succession",
                "Fourth general elections",
                "Congress split",
                "Presidential election 1969",
                "Restoration after 1971"
              ],
              boardMoves: ["chronology", "Congress split", "coalitions", "leadership changes"],
              hook: "This chapter is a political plot twist: dominance shakes, splits, and returns."
            },
            {
              id: "pol-democratic-order",
              unit: "Part B Chapter 6",
              title: "The Crisis of Democratic Order",
              marks: 4,
              topics: [
                "Emergency",
                "JP movement",
                "Total Revolution",
                "Civil liberties",
                "1977 election",
                "Lessons of Emergency"
              ],
              boardMoves: ["Emergency causes", "rights impact", "1977 outcomes", "democratic lessons"],
              hook: "Democracy is tested most clearly when power is tempted to silence disagreement."
            },
            {
              id: "pol-regional-aspirations",
              unit: "Part B Chapter 7",
              title: "Regional Aspirations",
              marks: 6,
              topics: [
                "Jammu and Kashmir",
                "Punjab",
                "The Northeast",
                "Demand for autonomy",
                "Secessionist movements",
                "Movements against outsiders",
                "National integration"
              ],
              boardMoves: ["case comparison", "autonomy", "integration", "regional demands"],
              hook: "Regional aspirations are not always anti-national; often they ask how belonging should feel."
            },
            {
              id: "pol-recent-developments",
              unit: "Part B Chapter 8",
              title: "Recent Developments in Indian Politics",
              marks: 8,
              topics: [
                "Context of the 1990s",
                "Coalition era",
                "Alliance politics",
                "Mandal implementation",
                "Communalism, secularism, and democracy",
                "Ayodhya issue",
                "Emergence of new consensus",
                "Lok Sabha elections 2004-2019",
                "Growth of BJP"
              ],
              boardMoves: ["coalition politics", "Mandal", "new consensus", "BJP rise"],
              hook: "The 1990s rewired Indian politics: caste, coalitions, economy, identity, and new party systems."
            }
          ]
        }
      ]
    },
    {
      id: "english-core",
      name: "English Core",
      code: "301",
      icon: "EN",
      theoryMarks: 80,
      practicalMarks: 20,
      durationMinutes: 180,
      officialUrl: "https://cbseacademic.nic.in/web_material/CurriculumMain27/SecPart2/English_core_SecP2_2026-27.pdf",
      samplePaperUrl: "https://cbseacademic.nic.in/web_material/SQP/ClassXII_2025_26/EnglishCore-SQP.pdf",
      pattern: {
        basis: "CBSE 2026-27 curriculum and the current official English Core sample paper.",
        questionMarks: [1, 2, 4, 5, 6, 12],
        requestedMarksSupported: [1, 2, 3, 4, 5, 6],
        sections: [
          "Section A: Reading Skills, 22 marks",
          "Section B: Creative Writing Skills, 18 marks",
          "Section C: Literature, 40 marks",
          "Internal Assessment: Listening, speaking, and project work"
        ],
        competencies: [
          { name: "Reading and inference", weight: 27.5 },
          { name: "Writing format and expression", weight: 22.5 },
          { name: "Literary analysis and evaluation", weight: 50 }
        ]
      },
      books: [
        {
          id: "english-flamingo",
          title: "Flamingo",
          publisher: "NCERT",
          chapters: [
            {
              id: "eng-last-lesson",
              unit: "Prose",
              title: "The Last Lesson",
              marks: 3,
              topics: ["language and identity", "regret", "patriotism", "colonial pressure", "teacher-student bond"],
              boardMoves: ["theme analysis", "character shift", "symbolism of language", "extract inference"],
              hook: "A classroom becomes a country in miniature."
            },
            {
              id: "eng-lost-spring",
              unit: "Prose",
              title: "Lost Spring",
              marks: 3,
              topics: ["child labour", "poverty", "dreams and deprivation", "social injustice", "reportage style"],
              boardMoves: ["case comparison", "author's tone", "social message", "title significance"],
              hook: "The title hurts because childhood is treated like a season some children never get."
            },
            {
              id: "eng-deep-water",
              unit: "Prose",
              title: "Deep Water",
              marks: 3,
              topics: ["fear", "trauma", "willpower", "gradual training", "self-mastery"],
              boardMoves: ["fear overcoming", "narrative sequence", "lesson of courage", "personal transformation"],
              hook: "The pool is smaller than the fear it creates."
            },
            {
              id: "eng-rattrap",
              unit: "Prose",
              title: "The Rattrap",
              marks: 3,
              topics: ["temptation", "kindness", "redemption", "human dignity", "metaphor of the rattrap"],
              boardMoves: ["metaphor", "character change", "Edla's role", "moral insight"],
              hook: "The world is a trap only until someone treats you as worthy of trust."
            },
            {
              id: "eng-indigo",
              unit: "Prose",
              title: "Indigo",
              marks: 3,
              topics: ["Champaran", "civil disobedience", "leadership", "self-reliance", "justice"],
              boardMoves: ["Gandhi's methods", "peasants' struggle", "leadership qualities", "historical context"],
              hook: "A local injustice becomes a lesson in national courage."
            },
            {
              id: "eng-poets-pancakes",
              unit: "Prose",
              title: "Poets and Pancakes",
              marks: 3,
              topics: ["Gemini Studios", "satire", "film culture", "make-up department", "literary irony"],
              boardMoves: ["satirical tone", "character sketches", "studio culture", "humour"],
              hook: "Behind the glamour sits a busy factory of vanity, wit, and hierarchy."
            },
            {
              id: "eng-interview",
              unit: "Prose",
              title: "The Interview",
              marks: 3,
              topics: ["interviews as a genre", "public image", "Umberto Eco", "media culture", "craft of writing"],
              boardMoves: ["views on interviews", "Eco's method", "interstices", "genre analysis"],
              hook: "An interview is both a window and a stage."
            },
            {
              id: "eng-going-places",
              unit: "Prose",
              title: "Going Places",
              marks: 3,
              topics: ["adolescent dreams", "fantasy and reality", "class", "family expectations", "Sophie"],
              boardMoves: ["fantasy versus reality", "character contrast", "class aspiration", "ending interpretation"],
              hook: "Dreams can be wings, but they can also become fog."
            },
            {
              id: "eng-mother-sixty-six",
              unit: "Poetry",
              title: "My Mother at Sixty-Six",
              marks: 3,
              topics: ["ageing", "separation anxiety", "imagery", "contrast", "fear of loss"],
              boardMoves: ["poetic devices", "image contrast", "speaker's emotion", "ending smile"],
              hook: "A car ride becomes a quiet confrontation with time."
            },
            {
              id: "eng-keeping-quiet",
              unit: "Poetry",
              title: "Keeping Quiet",
              marks: 3,
              topics: ["silence", "introspection", "peace", "human unity", "anti-violence"],
              boardMoves: ["central idea", "symbolism of silence", "counting to twelve", "life-affirming message"],
              hook: "The poem asks the world to pause before it mistakes motion for meaning."
            },
            {
              id: "eng-thing-beauty",
              unit: "Poetry",
              title: "A Thing of Beauty",
              marks: 3,
              topics: ["beauty", "nature", "healing", "immortality", "hope"],
              boardMoves: ["beauty as solace", "imagery", "metaphor", "theme"],
              hook: "Beauty is shown as a small permanent repair in a tired world."
            },
            {
              id: "eng-roadside-stand",
              unit: "Poetry",
              title: "A Roadside Stand",
              marks: 3,
              topics: ["rural poverty", "urban indifference", "false promises", "dignity", "economic inequality"],
              boardMoves: ["contrast", "tone", "social criticism", "speaker's conflict"],
              hook: "The stand sells more than goods; it sells a hope that passing cars ignore."
            },
            {
              id: "eng-aunt-jennifer",
              unit: "Poetry",
              title: "Aunt Jennifer's Tigers",
              marks: 3,
              topics: ["patriarchy", "freedom", "art as expression", "symbolism", "fear and courage"],
              boardMoves: ["symbolism of tigers", "wedding band", "contrast", "gender critique"],
              hook: "Her hands tremble, but her tigers do not."
            }
          ]
        },
        {
          id: "english-vistas",
          title: "Vistas",
          publisher: "NCERT",
          chapters: [
            {
              id: "eng-third-level",
              unit: "Supplementary Reader",
              title: "The Third Level",
              marks: 3,
              topics: ["escapism", "time travel", "modern anxiety", "fantasy", "nostalgia"],
              boardMoves: ["reality versus fantasy", "Charley's escape", "Sam's letter", "theme"],
              hook: "The third level is less a platform and more a wish."
            },
            {
              id: "eng-tiger-king",
              unit: "Supplementary Reader",
              title: "The Tiger King",
              marks: 3,
              topics: ["satire", "power", "fate", "arrogance", "conservation irony"],
              boardMoves: ["satirical elements", "prophecy", "king's obsession", "ending irony"],
              hook: "Power tries to defeat prophecy and walks straight into irony."
            },
            {
              id: "eng-journey-earth",
              unit: "Supplementary Reader",
              title: "Journey to the End of the Earth",
              marks: 3,
              topics: ["Antarctica", "climate change", "geological time", "environment", "human impact"],
              boardMoves: ["environmental message", "Students on Ice", "geological history", "urgency"],
              hook: "At the end of the Earth, the planet explains the beginning of our problem."
            },
            {
              id: "eng-enemy",
              unit: "Supplementary Reader",
              title: "The Enemy",
              marks: 3,
              topics: ["war", "humanism", "medical ethics", "national duty", "moral courage"],
              boardMoves: ["Sadao's dilemma", "humanity versus patriotism", "character analysis", "ethical choice"],
              hook: "The enemy arrives wounded, and duty becomes complicated."
            },
            {
              id: "eng-face-of-it",
              unit: "Supplementary Reader",
              title: "On the Face of It",
              marks: 3,
              topics: ["disability", "loneliness", "confidence", "friendship", "self-acceptance"],
              boardMoves: ["Derry's change", "Mr Lamb's philosophy", "title meaning", "dialogue analysis"],
              hook: "A garden becomes a place where a boy rehearses courage."
            },
            {
              id: "eng-memories-childhood",
              unit: "Supplementary Reader",
              title: "Memories of Childhood",
              marks: 3,
              topics: ["discrimination", "identity", "resistance", "dignity", "social oppression"],
              boardMoves: ["compare two autobiographical accounts", "oppression", "resistance", "title significance"],
              hook: "Two childhood memories show how dignity learns to answer humiliation."
            }
          ]
        },
        {
          id: "english-skills",
          title: "Reading and Creative Writing Skills",
          publisher: "CBSE syllabus",
          chapters: [
            {
              id: "eng-reading",
              unit: "Section A",
              title: "Reading Comprehension",
              marks: 22,
              topics: ["unseen passage", "case-based factual passage", "inference", "analysis", "vocabulary in context"],
              boardMoves: ["evidence selection", "main idea", "inference", "short answer precision"],
              hook: "Reading questions reward proof, not vibes."
            },
            {
              id: "eng-writing",
              unit: "Section B",
              title: "Creative Writing Skills",
              marks: 18,
              topics: ["notice", "invitation and reply", "letter to editor", "job application with bio-data", "article writing", "report writing"],
              boardMoves: ["format", "tone", "organisation", "word limit", "accuracy"],
              hook: "Writing marks are partly content and partly packaging; both must arrive together."
            }
          ]
        }
      ]
    },
    {
      id: "commercial-art",
      name: "Applied Art - Commercial Art",
      code: "052",
      icon: "CA",
      theoryMarks: 30,
      practicalMarks: 70,
      durationMinutes: 120,
      officialUrl: "https://cbseacademic.nic.in/web_material/CurriculumMain27/SecPart2/Fine_Arts_SecP2_2026-27.pdf",
      samplePaperUrl: "https://cbseacademic.nic.in/web_material/SQP/ClassXII_2025_26/Applied_Arts_SQP.pdf",
      pattern: {
        basis: "CBSE 2026-27 Fine Arts curriculum and latest Applied Art sample paper.",
        questionMarks: [1, 2, 6],
        requestedMarksSupported: [1, 2, 3, 4, 5, 6],
        sections: [
          "Theory: 30 marks, 2 hours",
          "Section A: 8 MCQs of 1 mark",
          "Section B: 5 short answers of 2 marks",
          "Section C: 3 long answers of 6 marks",
          "Practical: illustration, poster, and portfolio assessment"
        ],
        competencies: [
          { name: "Artwork identification", weight: 30 },
          { name: "Style and school analysis", weight: 35 },
          { name: "Applied composition and design judgement", weight: 35 }
        ]
      },
      books: [
        {
          id: "commercial-art-theory",
          title: "Applied Art Theory: History of Indian Art",
          publisher: "CBSE Fine Arts syllabus",
          chapters: [
            {
              id: "art-miniature-schools",
              unit: "Theory Unit 1",
              title: "Miniature Painting Schools",
              marks: 15,
              topics: [
                "Rajasthani School of Miniature Painting",
                "Pahari School of Miniature Painting",
                "Mughal School of Miniature Painting",
                "Deccan Schools of Miniature Painting"
              ],
              boardMoves: ["school identification", "sub-school features", "style comparison", "artist and work matching"],
              hook: "Miniature painting is small in size, not in detail."
            },
            {
              id: "art-modern-indian",
              unit: "Theory Unit 2",
              title: "National Flag, Bengal School, and Modern Trends",
              marks: 15,
              topics: [
                "Indian National Flag",
                "The Bengal School of Painting",
                "Modern trends in Indian art paintings",
                "Graphic prints",
                "Sculptures"
              ],
              boardMoves: ["artwork identification", "artist-work pairing", "style features", "national symbolism"],
              hook: "Modern Indian art turns heritage, politics, and experiment into visual language."
            }
          ]
        },
        {
          id: "commercial-art-practical",
          title: "Applied Art Practical",
          publisher: "CBSE Fine Arts syllabus",
          chapters: [
            {
              id: "art-illustration",
              unit: "Practical Part 1",
              title: "Illustration",
              marks: 25,
              topics: [
                "Illustration on a given subject",
                "Specific situation",
                "Drawing from life",
                "Outdoor sketching",
                "Media suitable for printing",
                "Composition and drawing quality",
                "Emphasis on subject",
                "Overall impression"
              ],
              boardMoves: ["composition", "specific situation", "print suitability", "visual emphasis"],
              hook: "Illustration is storytelling with no paragraph to hide behind."
            },
            {
              id: "art-poster",
              unit: "Practical Part 2",
              title: "Poster Design",
              marks: 25,
              topics: [
                "Specified data and slogan",
                "Two or three colours",
                "Balanced typography and illustration",
                "Advertisement subjects",
                "Tourism",
                "Cultural activities",
                "Community and nature development",
                "Social, national, and international ideas",
                "Commercial products"
              ],
              boardMoves: ["layout", "lettering", "colour scheme", "message clarity"],
              hook: "A poster has seconds to win attention and minutes to be remembered."
            },
            {
              id: "art-portfolio",
              unit: "Practical Part 3",
              title: "Portfolio Assessment",
              marks: 20,
              topics: [
                "Record of yearly performance",
                "Selected drawings in any media",
                "Minimum four illustrations",
                "Selected posters",
                "Work based on Indian folk art",
                "Work in personal style"
              ],
              boardMoves: ["portfolio completeness", "progress evidence", "variety", "personal style"],
              hook: "A portfolio shows not just what you made, but how your eye improved."
            }
          ]
        }
      ]
    }
  ]
};
