import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

type Persona = "student" | "professional";

type DriveFile = {
  id: string;
  name: string;
  type: string;
  icon: string;
  folder: string;
  owner: string;
  modified: string;
  size: string;
  meta: string;
  tag: string;
  description: string;
  status: string;
};

type DemoStep = {
  id: string;
  persona: Persona;
  fileId: string;
  title: string;
  subtitle: string;
  highlights: string[];
  action: string;
};

type DocSection = {
  id: string;
  heading: string;
  excerpt: string;
  insight: string;
  action: string;
};

type DocumentCanvas = {
  title: string;
  subtitle: string;
  status: string;
  sections: DocSection[];
  inlineTips: string[];
};

type ChatEntry = { role: "agent" | "user"; text: string };
type StatCard = {
  id: string;
  label: string;
  value: string;
  helper: string;
  trend: string;
  accent: "blue" | "pink" | "green" | "purple";
};
type CalendarEntry = {
  id: string;
  day: string;
  time: string;
  title: string;
  meta: string;
  status: string;
};
type UseCaseCard = {
  id: string;
  title: string;
  detail: string;
  badge: string;
  icon: string;
  persona: Persona;
  fileId: string;
  demoStepId: string;
};

type ChatPromptChip = {
  label: string;
  prompt: string;
  persona?: Persona;
  fileId?: string;
};

type WhisperTone = "info" | "alert" | "plan";

type WhisperSuggestion = {
  message: string;
  action: string;
  tone: WhisperTone;
  time: string;
};

const personaConfig: Record<
  Persona,
  {
    title: string;
    narrative: string;
    status: string;
    proactive: string;
    folder: string;
    chips: string[];
  }
> = {
  student: {
    title: "Student workspace",
    narrative: "Syllabi, readings, notes, and exams synced to Drive + Calendar",
    status: "Linked to Calendar & Sheets",
    proactive:
      "Companion turned your syllabus into a 10-week plan the moment it hit Drive.",
    folder: "LINB18 Notes",
    chips: [
      "Explore these files",
      "Ask about this folder",
      "List highs & lows",
    ],
  },
  professional: {
    title: "Professional workspace",
    narrative: "Meetings, vendor decks, and KPIs stay in sync with workflows",
    status: "Synced to Calendar & Gmail",
    proactive:
      "Companion watches meeting notes and decks the second they sync to Drive.",
    folder: "Customer Ops Enablement",
    chips: [
      "Explore these docs",
      "Ask about this client",
      "Surface risks & deadlines",
    ],
  },
};

const driveFiles: Record<Persona, DriveFile[]> = {
  student: [
    {
      id: "syllabus",
      name: "CS 241 Syllabus",
      type: "Doc",
      icon: "📘",
      folder: "Week zero",
      owner: "me",
      modified: "May 20",
      size: "85 KB",
      meta: "Updated 10m ago · Prof. Diaz",
      tag: "Outline",
      description: "Course outcomes, deliverables, and grading breakdown.",
      status: "Syllabus-to-Schedule Pack ready",
    },
    {
      id: "reading",
      name: "Week 3 Research Reader.pdf",
      type: "PDF",
      icon: "📚",
      folder: "Readings",
      owner: "me",
      modified: "May 18",
      size: "2.1 MB",
      meta: "Shared yesterday · 60 pages",
      tag: "Reading pack",
      description: "Condensed into a summary, slides, and flashcards.",
      status: "Smart Reading Pack generated",
    },
    {
      id: "notes",
      name: "Lecture Notes – Neural Nets",
      type: "Doc",
      icon: "📝",
      folder: "Lecture capture",
      owner: "me",
      modified: "May 19",
      size: "120 KB",
      meta: "Synced 5m ago · Voice notes attached",
      tag: "Notes",
      description: "Companion mapped every concept across readings.",
      status: "Living concept map updated",
    },
    {
      id: "exam",
      name: "Midterm Blueprint",
      type: "Sheet",
      icon: "📊",
      folder: "Assessments",
      owner: "me",
      modified: "May 17",
      size: "44 KB",
      meta: "Linked to Calendar · Auto-updated",
      tag: "Prep plan",
      description: "Exam windows, weightings, and suggested study cadence.",
      status: "Deadline-aware exam prep",
    },
  ],
  professional: [
    {
      id: "meeting",
      name: "CX Weekly Sync Notes",
      type: "Doc",
      icon: "📄",
      folder: "Meetings",
      owner: "me",
      modified: "Jun 3",
      size: "68 KB",
      meta: "Captured 1h ago · Auto-transcribed",
      tag: "Meetings",
      description: "Summary, decisions, and action items already drafted.",
      status: "AI Meeting Chief of Staff",
    },
    {
      id: "vendor",
      name: "Vendor Performance Report",
      type: "Slides",
      icon: "📈",
      folder: "Reporting",
      owner: "me",
      modified: "May 30",
      size: "6 MB",
      meta: "Final draft · SLA trends",
      tag: "Reporting",
      description: "Executive brief + risk alerts generated instantly.",
      status: "Executive brief ready",
    },
    {
      id: "calendar",
      name: "Executive Calendar Pulse",
      type: "Sheet",
      icon: "🗓️",
      folder: "Planning",
      owner: "me",
      modified: "Jun 2",
      size: "55 KB",
      meta: "Live sync · Week 7",
      tag: "Rhythm",
      description: "Calendar density, focus time, and commute blocks.",
      status: "Work Rhythm Optimiser",
    },
  ],
};

const fileHighlights: Record<string, string[]> = {
  syllabus: [
    "10-week outline parsed into Drive folders by week.",
    "Deadlines automatically synced to Google Calendar.",
    "Study packs grouped by assignment weight.",
  ],
  reading: [
    "Condensed the 60-page PDF into a one-page summary card.",
    "Generated a concise slide deck for rapid review.",
    "Flashcards are ready in Sheets with key formulas.",
  ],
  notes: [
    "Lecture highlights stitched to related readings.",
    "Concept map shows how Week 2 and Week 3 connect.",
    "Flashcard suggestions ready for ambiguous ideas.",
  ],
  exam: [
    "Upcoming exam flagged with risk of cramming.",
    "Study blocks proposed based on free calendar space.",
    "Reminders auto-adjust if deadlines move.",
  ],
  meeting: [
    "Conversation auto-summarised and tagged.",
    "Decisions captured with owners and due dates.",
    "Companion drafted recap email for stakeholders.",
  ],
  vendor: [
    "Executive-ready brief highlighting KPIs.",
    "Risk alerts surfaced before deadlines slip.",
    "Suggested talking points for leadership.",
  ],
  calendar: [
    "Calendar density scored across focus hours.",
    "Commute blocks merged with buffer times.",
    "Focus block recommendations ready to apply.",
  ],
};

const whisperSuggestions: Record<Persona, WhisperSuggestion[]> = {
  student: [
    {
      message:
        "I noticed this reading matches your Week 4 topic — want me to bundle it?",
      action: "Bundle it",
      tone: "plan",
      time: "Just now",
    },
    {
      message: "Should I generate flashcards for this?",
      action: "Generate",
      tone: "info",
      time: "2m ago",
    },
    {
      message:
        "Need me to auto-adjust study blocks after the lab deadline moved?",
      action: "Yes, please",
      tone: "alert",
      time: "6m ago",
    },
  ],
  professional: [
    {
      message:
        "Your schedule looks packed — want help rebalancing the afternoon?",
      action: "Rebalance",
      tone: "alert",
      time: "Just now",
    },
    {
      message: "Draft recap email to stakeholders now?",
      action: "Draft",
      tone: "info",
      time: "4m ago",
    },
    {
      message: "Deadline in 3 days — should I draft a status brief?",
      action: "Do it",
      tone: "plan",
      time: "9m ago",
    },
  ],
};

const demoSteps: DemoStep[] = [
  {
    id: "student-syllabus",
    persona: "student",
    fileId: "syllabus",
    title: "Syllabus-to-Schedule Pack",
    subtitle: "Turn course outlines into a living study plan.",
    highlights: [
      "Auto-populates deadlines into Calendar.",
      "Drive folders organised week by week.",
      "Quick launch for To‑Do + Calendar.",
    ],
    action: "Launch the schedule pack",
  },
  {
    id: "student-reading",
    persona: "student",
    fileId: "reading",
    title: "Smart Reading Pack",
    subtitle: "Condense a 60-page PDF into shareable study pieces.",
    highlights: [
      "One-page summary card in seconds.",
      "Slides + flashcards ready in Sheets.",
      "Optional: spin up a Loom-ready script.",
    ],
    action: "Open the reading kit",
  },
  {
    id: "student-notes",
    persona: "student",
    fileId: "notes",
    title: "Living Concept Maps",
    subtitle: "Link lectures, readings, and flashcards automatically.",
    highlights: [
      "Auto-generated concept map overlays notes.",
      "Connected ideas stay synced across Drive.",
      "Open branches in Slides for sharing.",
    ],
    action: "Explore the concept map",
  },
  {
    id: "pro-meeting",
    persona: "professional",
    fileId: "meeting",
    title: "AI Meeting Chief of Staff",
    subtitle: "Captures discussions, decisions, and action items.",
    highlights: [
      "Exec summary + owners already drafted.",
      "Carry forward last quarter’s KPIs.",
      "Draft recap email to stakeholders.",
    ],
    action: "Review the meeting brief",
  },
  {
    id: "pro-vendor",
    persona: "professional",
    fileId: "vendor",
    title: "Executive Brief + Dashboards",
    subtitle: "Auto-generated decks, KPIs, and risk alerts.",
    highlights: [
      "Deadline-aware prompts flag risks early.",
      "Talking points packaged for leadership.",
      "Push status briefs to Gmail instantly.",
    ],
    action: "Open the executive brief",
  },
  {
    id: "pro-proactive",
    persona: "professional",
    fileId: "calendar",
    title: "Proactive Rhythm Optimiser",
    subtitle: "Protect focus time the second schedules overload.",
    highlights: [
      "Overload alerts fire before burnout.",
      "Suggests focus blocks + async swaps.",
      "Drive Whisper nudges keep you ahead.",
    ],
    action: "Rebalance my day",
  },
];

const useCaseHighlights: UseCaseCard[] = [
  {
    id: "usecase-syllabus",
    title: "Syllabus-to-Schedule Pack",
    detail: "Auto study plan + calendar sync from a single PDF.",
    badge: "Student",
    icon: "🎯",
    persona: "student",
    fileId: "syllabus",
    demoStepId: "student-syllabus",
  },
  {
    id: "usecase-reading",
    title: "Smart Reading Pack",
    detail: "Summaries, slides, and flashcards in one click.",
    badge: "Student",
    icon: "📚",
    persona: "student",
    fileId: "reading",
    demoStepId: "student-reading",
  },
  {
    id: "usecase-notes",
    title: "Living Concept Maps",
    detail: "Notes, readings, and labs stitched automatically.",
    badge: "Student",
    icon: "🧠",
    persona: "student",
    fileId: "notes",
    demoStepId: "student-notes",
  },
  {
    id: "usecase-meeting",
    title: "AI Meeting Chief of Staff",
    detail: "Summaries, decisions, and action items pre-drafted.",
    badge: "Professional",
    icon: "📋",
    persona: "professional",
    fileId: "meeting",
    demoStepId: "pro-meeting",
  },
  {
    id: "usecase-vendor",
    title: "Executive Briefs",
    detail: "Slide decks distilled into leadership-ready briefs.",
    badge: "Professional",
    icon: "📈",
    persona: "professional",
    fileId: "vendor",
    demoStepId: "pro-vendor",
  },
  {
    id: "usecase-calendar",
    title: "Work Rhythm Optimiser",
    detail: "Protect focus time before the calendar implodes.",
    badge: "Professional",
    icon: "🗓️",
    persona: "professional",
    fileId: "calendar",
    demoStepId: "pro-proactive",
  },
];

const dashboardStats: Record<Persona, StatCard[]> = {
  student: [
    {
      id: "stat-deadlines",
      label: "Upcoming deadlines",
      value: "4 due",
      helper: "Week 3 cadence locked",
      trend: "+2 auto-synced today",
      accent: "blue",
    },
    {
      id: "stat-hours",
      label: "Study hours protected",
      value: "8.5h",
      helper: "Calendar + Tasks",
      trend: "Up 14% vs last week",
      accent: "green",
    },
    {
      id: "stat-flashcards",
      label: "Flashcards ready",
      value: "52 cards",
      helper: "Sheets pack updated",
      trend: "11 flagged for review",
      accent: "pink",
    },
  ],
  professional: [
    {
      id: "stat-meetings",
      label: "Meetings summarised",
      value: "3 today",
      helper: "Recaps pushed to Gmail",
      trend: "Last sent 12 min ago",
      accent: "blue",
    },
    {
      id: "stat-actions",
      label: "Action items tracked",
      value: "12 tasks",
      helper: "Across CX + vendors",
      trend: "5 due this week",
      accent: "purple",
    },
    {
      id: "stat-focus",
      label: "Focus blocks protected",
      value: "2 slots",
      helper: "Afternoon reclaimed",
      trend: "Ready to auto-notify",
      accent: "green",
    },
  ],
};

const calendarEntries: Record<Persona, CalendarEntry[]> = {
  student: [
    {
      id: "cal-1",
      day: "Mon",
      time: "3:00 – 4:00 PM",
      title: "Week 3 Reading Sprint",
      meta: "Slides + flashcards auto-prepped",
      status: "Focus block",
    },
    {
      id: "cal-2",
      day: "Tue",
      time: "9:30 – 10:15 AM",
      title: "Lab 02 reflection",
      meta: "Companion added checklist",
      status: "Auto reminder",
    },
    {
      id: "cal-3",
      day: "Thu",
      time: "1:00 – 2:00 PM",
      title: "Midterm cadence review",
      meta: "Risk detection on track",
      status: "Calendar hold",
    },
  ],
  professional: [
    {
      id: "cal-4",
      day: "Mon",
      time: "11:00 – 11:45 AM",
      title: "CX Weekly Sync",
      meta: "Recap + actions drafted",
      status: "Summary ready",
    },
    {
      id: "cal-5",
      day: "Tue",
      time: "2:30 – 3:00 PM",
      title: "Vendor risk briefing",
      meta: "Exec brief queued",
      status: "Prep now",
    },
    {
      id: "cal-6",
      day: "Thu",
      time: "4:00 – 5:00 PM",
      title: "Focus block",
      meta: "Companion protected time",
      status: "Focus block",
    },
  ],
};

const documentCanvases: Record<string, DocumentCanvas> = {
  syllabus: {
    title: "CS 241 Syllabus – AI-assisted annotations",
    subtitle: "Drive Companion layered your schedule directly on the doc.",
    status: "Syllabus-to-Schedule Pack live",
    sections: [
      {
        id: "week1",
        heading: "Week 1 · Foundations + deliverables",
        excerpt:
          "Week 1 covers linear algebra refreshers and introduces the semester-long design sprint.",
        insight:
          "Companion captured the sprint milestones and built a Week 1 checklist in Tasks.",
        action: "Ask Companion to pin this checklist inside Calendar + Todo.",
      },
      {
        id: "week3",
        heading: "Week 3 · Research translation",
        excerpt:
          "Readings and lab reflections due Thursday; proposal pitch due Monday.",
        insight:
          "Study blocks already inserted on Tue/Thu evenings to prevent cramming.",
        action: "Adjust tempo? Companion can slide the blocks if labs shift.",
      },
      {
        id: "grading",
        heading: "Grading model",
        excerpt:
          "Projects 45%, labs 35%, exams 20%. Participation modifies final +/- 3%.",
        insight:
          "Drive Companion tagged each artifact with its weighting so reminders escalate appropriately.",
        action: "Open dashboard to see how prep time stacks against weighting.",
      },
    ],
    inlineTips: [
      "Auto-populated calendar holds for every due date.",
      "Weekly Drive folders created automatically.",
      "Flashcards spin up whenever a reading is attached.",
    ],
  },
  reading: {
    title: "Week 3 Reader – Condensed by Companion",
    subtitle: "Smart Reading Pack turned 60 pages into actionable pieces.",
    status: "Summary + flashcards ready",
    sections: [
      {
        id: "thesis",
        heading: "Core thesis",
        excerpt:
          "Retrieval-tuned prompts outperform static outlines in attention tasks.",
        insight:
          "Companion highlighted the thesis + graphs and drafted a 6-slide summary.",
        action: "Open slides or ask for a 90-sec talking track.",
      },
      {
        id: "lab",
        heading: "Lab relevance",
        excerpt:
          "Section 3 mirrors the Week 3 lab prompt and references Diaz 2024.",
        insight:
          "Companion linked the citation to your Notes + added a flashcard suggestion.",
        action: "Send flashcards to Sheets so you can review on mobile.",
      },
    ],
    inlineTips: [
      "Flashcards already staged in Sheets.",
      "Suggested follow-up question: “Pull figures for Lab 03.”",
    ],
  },
  notes: {
    title: "Lecture Notes – Neural Nets",
    subtitle: "Living concept map overlays the doc with linked ideas.",
    status: "Concept map refreshed",
    sections: [
      {
        id: "chain",
        heading: "Backprop audio snippet",
        excerpt:
          "“Remember to compare gradient flow against Week 3 reading figures.”",
        insight:
          "Companion transcribed and linked the audio to the reading + flashcards.",
        action: "Open Slides concept map with this branch highlighted.",
      },
      {
        id: "risk",
        heading: "Cramming risk",
        excerpt: "Multiple TODO tags still unresolved for Lab 02.",
        insight:
          "Companion nudged the Exam Prep plan to reclaim a Friday block.",
        action: "Accept or decline the suggested block.",
      },
    ],
    inlineTips: [
      "Drive Whisper can bundle recordings with related notes.",
      "Voice button stays hot even when doc is full screen.",
    ],
  },
  meeting: {
    title: "CX Weekly Sync Notes",
    subtitle: "AI Meeting Chief of Staff already packaged the recap.",
    status: "Summary + actions shared",
    sections: [
      {
        id: "summary",
        heading: "Highlights",
        excerpt: "Volume down 8%; EU beta greenlit; risk flagged on SLA.",
        insight:
          "Companion drafted the exec recap with decisions + owners pre-filled.",
        action: "Send recap to stakeholders or push to Spaces.",
      },
      {
        id: "memory",
        heading: "Organisational memory",
        excerpt:
          "Last meeting requested vendor audit follow-up and KPI roll-over.",
        insight:
          "Agent reminds you “Would you like to carry forward last quarter’s KPIs?”",
        action: "Insert prior KPIs into the doc with one click.",
      },
    ],
    inlineTips: [
      "Action items sync to Tasks + Asana automatically.",
      "Calendar holds auto-update when deadlines shift.",
    ],
  },
  vendor: {
    title: "Vendor Performance Report",
    subtitle: "Dashboards + briefs auto-generated from Slides.",
    status: "Executive brief ready",
    sections: [
      {
        id: "kpi",
        heading: "KPI snapshot",
        excerpt: "SLA compliance dipped to 93% (target 97%).",
        insight:
          "Companion surfaced the delta and proposed mitigation talking points.",
        action: "Push the brief to Gmail draft addressed to leadership.",
      },
      {
        id: "risk",
        heading: "Risk + deadline alert",
        excerpt: "Onboarding queue aging threatens next week’s rollout.",
        insight:
          "Agent suggests blocking 3–4 PM focus time + sending risk brief.",
        action: "Accept focus block or ask to rebalance the day.",
      },
    ],
    inlineTips: [
      "Executive summary auto-updates as Slides change.",
      "Ask “Show me sentiment trend for Q2” anytime.",
    ],
  },
  calendar: {
    title: "Executive Calendar Pulse",
    subtitle: "Work Rhythm Optimiser is protecting focus time for you.",
    status: "Rhythm optimiser online",
    sections: [
      {
        id: "density",
        heading: "Calendar density",
        excerpt: "Afternoon over 86% booked; no buffers before vendor review.",
        insight:
          "Companion recommends sliding two internal syncs and inserting a focus block.",
        action: "Approve the rebalance and notify attendees automatically.",
      },
      {
        id: "health",
        heading: "Schedule health",
        excerpt: "Commute blocks not accounted for; context switches 7x.",
        insight:
          "Agent suggests compressing prep time + offering async updates.",
        action: "Send quick Loom recap via Gmail template.",
      },
    ],
    inlineTips: [
      "Voice: “Companion, protect 3–4 PM daily this week.”",
      "Drive Whisper surfaces overload alerts before burnout.",
    ],
  },
};

const initialChat = (file?: DriveFile): ChatEntry[] => [
  {
    role: "agent",
    text: file
      ? `I’m already working on ${file.name}. Want the schedule, summary, or risk view?`
      : "I’m watching your Drive for anything that needs action.",
  },
];

function App() {
  const [persona, setPersona] = useState<Persona>("student");
  const [selectedFileId, setSelectedFileId] = useState<string>(
    driveFiles.student[0].id
  );
  const [companionExpanded, setCompanionExpanded] = useState(false);
  const [docCanvasOpen, setDocCanvasOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [chatLog, setChatLog] = useState<ChatEntry[]>(() =>
    initialChat(driveFiles.student[0])
  );
  const [voiceModeOpen, setVoiceModeOpen] = useState(false);
  const [globalChatOpen, setGlobalChatOpen] = useState(false);
  const [globalPrompt, setGlobalPrompt] = useState("");
  const [globalChatLog, setGlobalChatLog] = useState<ChatEntry[]>([
    {
      role: "agent",
      text: "Hey! I’m watching Drive + Calendar. Need a study plan, summary, or exec brief?",
    },
  ]);
  const tourTrackRef = useRef<HTMLDivElement>(null);
  const [tourCollapsed, setTourCollapsed] = useState(false);
  const [pendingFileId, setPendingFileId] = useState<string | null>(null);

  useEffect(() => {
    const first = driveFiles[persona][0];
    setSelectedFileId(first.id);
    setDocCanvasOpen(false);
    setChatLog(initialChat(first));
  }, [persona]);

  const filesForPersona = driveFiles[persona];
  const selectedFile = useMemo(
    () =>
      filesForPersona.find((file) => file.id === selectedFileId) ||
      filesForPersona[0],
    [filesForPersona, selectedFileId]
  );
  const calendarFeed = calendarEntries[persona];

  useEffect(() => {
    setChatLog(initialChat(selectedFile));
  }, [selectedFile]);

  useEffect(() => {
    if (pendingFileId) {
      setSelectedFileId(pendingFileId);
      setDocCanvasOpen(false);
      setPendingFileId(null);
    }
  }, [pendingFileId, persona]);

  const currentStep = demoSteps.find(
    (step) => step.persona === persona && step.fileId === selectedFile?.id
  );

  const handleUseCaseClick = (card: UseCaseCard) => {
    setPersona(card.persona);
    setSelectedFileId(card.fileId);
    setDocCanvasOpen(false);
    setCompanionExpanded(false);
  };

  const handleGlobalPromptSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!globalPrompt.trim()) return;

    const contextName = selectedFile ? selectedFile.name : "your workspace";
    const personaTone =
      persona === "student"
        ? "I’ll refresh the study timeline and flashcards"
        : "I’ll prep the executive brief and update Calendar";
    const response = `${personaTone} for ${contextName}. Want me to push it to Calendar, Sheets, or Gmail?`;

    setGlobalChatLog((prev) => [
      ...prev,
      { role: "user", text: globalPrompt.trim() },
      { role: "agent", text: response },
    ]);
    setGlobalPrompt("");
  };

  const spotlightId =
    persona === "student" ? "usecase-syllabus" : "usecase-meeting";
  const personaSpotlight =
    useCaseHighlights.find((card) => card.id === spotlightId) ??
    useCaseHighlights[0];

  const chatPromptChips: ChatPromptChip[] =
    persona === "student"
      ? [
          {
            label: "Plan my week",
            prompt: "What should I tackle this week?",
            persona: "student",
            fileId: "syllabus",
          },
          {
            label: "Bundle this reading",
            prompt: "Can you bundle this reading with flashcards?",
            persona: "student",
            fileId: "reading",
          },
          {
            label: "Prep concept map",
            prompt: "Highlight risky topics in my notes and update the map.",
            persona: "student",
            fileId: "notes",
          },
        ]
      : [
          {
            label: "Meeting recap",
            prompt: "Draft the recap email for this meeting.",
            persona: "professional",
            fileId: "meeting",
          },
          {
            label: "Vendor risks",
            prompt: "Surface the key risks and deadlines in this report.",
            persona: "professional",
            fileId: "vendor",
          },
          {
            label: "Rebalance schedule",
            prompt: "My afternoon is overloaded—rebalance it for me.",
            persona: "professional",
            fileId: "calendar",
          },
        ];

  const handleChatChipClick = (chip: ChatPromptChip) => {
    if (chip.persona && chip.persona !== persona) {
      setPersona(chip.persona);
      if (chip.fileId) {
        setPendingFileId(chip.fileId);
      }
    } else if (chip.fileId) {
      setSelectedFileId(chip.fileId);
      setDocCanvasOpen(false);
    }
    setPrompt(chip.prompt);
  };

  const scrollTour = (direction: "left" | "right") => {
    if (!tourTrackRef.current) return;
    const delta = direction === "left" ? -320 : 320;
    tourTrackRef.current.scrollBy({ left: delta, behavior: "smooth" });
  };

  const handlePromptSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!prompt.trim() || !selectedFile) return;
    const question = prompt.trim();
    const response = `Here’s the ${selectedFile.status.toLowerCase()} for ${
      selectedFile.name
    }: I can push action items, update Calendar, or prep a shareable brief.`;
    setChatLog((prev) => [
      ...prev,
      { role: "user", text: question },
      { role: "agent", text: response },
    ]);
    setPrompt("");
  };

  const renderCompanionScenario = () => {
    if (!selectedFile) return null;

    if (persona === "student") {
      if (selectedFile.id === "syllabus") {
        const assignments = [
          { label: "Project pitch", date: "Sep 18", note: "Auto-synced" },
          { label: "Lab 01 reflection", date: "Sep 22", note: "Week 3" },
          { label: "Midterm review", date: "Oct 05", note: "Calendar hold" },
        ];
        const schedule = [
          { week: "Week 1", focus: "Foundations", load: "40%" },
          { week: "Week 2", focus: "Lab prep", load: "65%" },
          { week: "Week 3", focus: "Project sprint", load: "80%" },
        ];

        return (
          <>
            <div className="section-card hero">
              <h4>Syllabus-to-Schedule Pack</h4>
              <p>
                Turn course outlines into study plans. Companion auto-populated
                every deadline into Calendar and organised Drive folders by
                week.
              </p>
              <div className="assignment-grid">
                {assignments.map((item) => (
                  <div key={item.label} className="assignment-pill">
                    <strong>{item.label}</strong>
                    <div>{item.date}</div>
                    <small>{item.note}</small>
                  </div>
                ))}
              </div>
              <div className="cta-row">
                <button className="ghost">View in Calendar</button>
                <button className="primary">Create Week 1 To-Do List</button>
              </div>
            </div>
            <div className="section-card">
              <h4>Study timeline</h4>
              <p>Drive Companion keeps the pacing so you never cram.</p>
              <div className="timeline-track">
                <span
                  className="timeline-progress"
                  style={{ width: "48%", background: "var(--accent-warm)" }}
                />
              </div>
              <div className="timeline-labels">
                <span>Week 1 kickoff</span>
                <span>Final exam</span>
              </div>
              <div className="timeline-list">
                {schedule.map((slot) => (
                  <div key={slot.week} className="timeline-item">
                    <span>{slot.week}</span>
                    <strong>{slot.focus}</strong>
                    <p>{slot.load} of study time locked in</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        );
      }

      if (selectedFile.id === "reading") {
        const flashcards = [
          {
            front: "What is attention masking?",
            back: "Limits cross-token...",
          },
          { front: "Key experiment?", back: "Diaz 2024 retention study" },
          { front: "Why it matters?", back: "Matches Week 3 lab prompt" },
        ];
        return (
          <>
            <div className="section-card hero">
              <h4>Smart Reading Pack</h4>
              <p>
                Condense a 60-page PDF into a one-page summary, a concise slide
                deck, and flashcards in Sheets.
              </p>
              <div className="doc-card">
                <h4>Auto summary card</h4>
                <ul>
                  <li>Thesis: Retrieval prompts outperform static outlines.</li>
                  <li>Key figures flagged for your Week 3 lab report.</li>
                  <li>Contrasts to prior work already cited.</li>
                </ul>
              </div>
              <div className="cta-row">
                <button className="primary">Open summary</button>
                <button className="ghost">Generate Slides Summary</button>
              </div>
            </div>
            <div className="section-card">
              <h4>Flashcards in Sheets</h4>
              <div className="flashcard-stack">
                {flashcards.map((card) => (
                  <div key={card.front} className="flashcard">
                    <strong>{card.front}</strong>
                    <p>{card.back}</p>
                  </div>
                ))}
              </div>
              <div className="cta-row">
                <button className="primary">Open flashcards in Sheets</button>
                <button className="ghost">Share pack</button>
              </div>
            </div>
          </>
        );
      }

      if (selectedFile.id === "notes") {
        const conceptNodes = [
          "Gradient flow",
          "Backprop audio note",
          "Week 3 reading",
          "Lab 02 checklist",
          "Professor highlight",
          "Exam flag",
        ];
        return (
          <>
            <div className="section-card hero">
              <h4>Living concept map</h4>
              <p>
                Connect ideas across readings and notes. Companion keeps the map
                updated every time you drop files in Drive.
              </p>
              <div className="concept-map">
                {conceptNodes.map((node) => (
                  <div key={node} className="node">
                    {node}
                  </div>
                ))}
              </div>
              <div className="cta-row">
                <button className="primary">Open in Slides</button>
                <button className="ghost">Export as image</button>
              </div>
            </div>
            <div className="section-card">
              <h4>Linked concepts</h4>
              <ul>
                <li>Drive matched Lecture 5 audio to Week 3 readings.</li>
                <li>Highlights flagged for flashcards.</li>
                <li>Concept map dives straight into Slides.</li>
              </ul>
            </div>
          </>
        );
      }

      if (selectedFile.id === "exam") {
        const studyBlocks = [
          { block: "Mon 3–4 PM", focus: "Past exams", status: "Scheduled" },
          { block: "Wed 9–11 AM", focus: "Problem reps", status: "Auto" },
          { block: "Fri 2–3 PM", focus: "Concept map review", status: "Open" },
        ];
        return (
          <>
            <div className="section-card hero">
              <h4>Deadline-Aware Exam Prep</h4>
              <p>
                Prevent cramming and make sure you walk into exams feeling
                prepared. Study blocks flex the moment deadlines move.
              </p>
              <div className="assignment-grid">
                {studyBlocks.map((slot) => (
                  <div key={slot.block} className="assignment-pill">
                    <strong>{slot.block}</strong>
                    <div>{slot.focus}</div>
                    <small>{slot.status}</small>
                  </div>
                ))}
              </div>
              <div className="cta-row">
                <button className="primary">Add study block</button>
                <button className="ghost">Share prep plan</button>
              </div>
            </div>
            <div className="section-card">
              <h4>Auto-adjusting reminders</h4>
              <p>
                Calendar holds shift if lab deadlines slip, keeping the prep
                plan realistic.
              </p>
              <ul>
                <li>Midterm tagged as priority in Drive + Calendar.</li>
                <li>
                  Reminder nudges escalate if study time drops below target.
                </li>
                <li>Exam-ready checklist available in Tasks.</li>
              </ul>
            </div>
          </>
        );
      }
    }

    if (persona === "professional") {
      if (selectedFile.id === "meeting") {
        const actionItems = [
          "Finalize CX rollout brief — Maya · Tue",
          "Update onboarding decks — Leo · Thu",
          "Share retention spike analysis — Priya · Fri",
        ];
        return (
          <>
            <div className="section-card hero">
              <h4>AI Meeting Chief of Staff</h4>
              <p>
                Captures and organises discussions instantly — summary,
                decisions, and action items are already packaged.
              </p>
              <div className="doc-card">
                <h4>Meeting Summary</h4>
                <ul>
                  <li>Support volume down 8% after macros launch.</li>
                  <li>Decision: greenlight beta for EU next Monday.</li>
                  <li>Risks: vendor SLA slipping on onboarding tickets.</li>
                </ul>
              </div>
              <div className="assignment-grid">
                {actionItems.map((item) => (
                  <div key={item} className="assignment-pill">
                    {item}
                  </div>
                ))}
              </div>
              <div className="cta-row">
                <button className="primary">
                  Draft recap email to stakeholders
                </button>
                <button className="ghost">Sync to Tasks</button>
              </div>
            </div>
            <div className="section-card">
              <h4>Organisational Memory Agent</h4>
              <p>“Here’s what we agreed last meeting…”</p>
              <ul>
                <li>Carry forward last quarter’s KPIs into this deck?</li>
                <li>Reminder: vendor audit follow-up due tomorrow.</li>
                <li>“Would you like to carry forward last quarter’s KPIs?”</li>
              </ul>
            </div>
          </>
        );
      }

      if (selectedFile.id === "vendor") {
        const highlights = [
          "SLA compliance dipped to 93% (target 97%).",
          "Top blockers: ticket aging in onboarding queue.",
          "KPI trendlines packaged for exec brief.",
        ];
        return (
          <>
            <div className="section-card hero">
              <h4>Auto-Generated Dashboards & Briefs</h4>
              <p>
                Vendor Performance Report → Executive Brief with key highlights,
                KPIs, and suggested talking points.
              </p>
              <ul>
                {highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="cta-row">
                <button className="primary">Generate talking points</button>
                <button className="ghost">Share brief</button>
              </div>
            </div>
            <div className="section-card">
              <h4>Proactive Risk & Deadline Alerts</h4>
              <div className="proactive-banner">
                Deadline in 3 days — should I draft a status brief?
              </div>
              <p>Companion spots risks across Drive the moment they appear.</p>
              <ul>
                <li>Auto-reminded vendor to refresh SLA appendix.</li>
                <li>Suggested mitigation blocks on your calendar.</li>
              </ul>
            </div>
          </>
        );
      }

      if (selectedFile.id === "calendar") {
        const focusBlocks = [
          {
            slot: "3–4 PM",
            note: "Protected focus block",
            status: "Recommended",
          },
          {
            slot: "4–4:30 PM",
            note: "Buffer before Vendor review",
            status: "Auto",
          },
          { slot: "5–5:30 PM", note: "Walk + audio recap", status: "Optional" },
        ];
        return (
          <>
            <div className="section-card hero">
              <h4>Work Rhythm Optimiser</h4>
              <p>
                Your afternoon is overloaded — consider a focus block from 3–4
                PM.
              </p>
              <div className="assignment-grid">
                {focusBlocks.map((focus) => (
                  <div key={focus.slot} className="assignment-pill">
                    <strong>{focus.slot}</strong>
                    <div>{focus.note}</div>
                    <small>{focus.status}</small>
                  </div>
                ))}
              </div>
              <div className="cta-row">
                <button className="primary">Rebalance day</button>
                <button className="ghost">Accept focus block</button>
              </div>
            </div>
            <div className="section-card">
              <h4>Schedule health</h4>
              <p>Work Rhythm Optimiser protects focus time automatically.</p>
              <ul>
                <li>Commutes and context switching flagged automatically.</li>
                <li>Suggestions surface before burnout hits.</li>
                <li>“Your schedule looks packed — want help rebalancing?”</li>
              </ul>
            </div>
          </>
        );
      }
    }

    return (
      <div className="section-card">
        <h4>Drive Companion</h4>
        <p>Pick any file to see how the companion responds instantly.</p>
      </div>
    );
  };

  const renderDriveTable = () => (
    <div className="recent-list">
      {filesForPersona.map((file) => (
        <button
          key={file.id}
          className={`recent-card ${
            file.id === selectedFile?.id ? "active" : ""
          }`}
          onClick={() => {
            setSelectedFileId(file.id);
            setDocCanvasOpen(false);
          }}
        >
          <div className="recent-icon">{file.icon}</div>
          <div className="recent-body">
            <div className="recent-header">
              <div className="recent-title">
                <strong>{file.name}</strong>
                <span className="recent-folder">{file.folder}</span>
              </div>
              <span className="recent-tag">{file.tag}</span>
            </div>
            <p className="recent-description">{file.description}</p>
            <div className="recent-meta">
              <span>{file.meta}</span>
              <span>{file.owner}</span>
              <span>{file.modified}</span>
              <span>{file.size}</span>
            </div>
            <span className="recent-status">{file.status}</span>
          </div>
        </button>
      ))}
    </div>
  );

  const renderDocumentCanvas = () => {
    const doc = documentCanvases[selectedFile?.id || ""];
    if (!doc) {
      return (
        <div className="doc-pane empty">
          <p>Select a supported file to see inline annotations.</p>
        </div>
      );
    }

    return (
      <div className="doc-pane">
        <div className="doc-toolbar">
          <div className="doc-breadcrumb">
            <button
              className="ghost-icon"
              onClick={() => setDocCanvasOpen(false)}
            >
              ←
            </button>
            <span>
              My Drive / {personaConfig[persona].folder} / {selectedFile?.name}
            </span>
          </div>
          <div className="doc-actions">
            <button onClick={() => setCompanionExpanded(true)}>
              Open Companion canvas
            </button>
            <button className="primary">Share</button>
          </div>
        </div>
        <div className="doc-header">
          <div>
            <h2>{doc.title}</h2>
            <p>{doc.subtitle}</p>
          </div>
          <div className="status-chip blue">{doc.status}</div>
        </div>
        <div className="doc-body">
          <div className="doc-sections">
            {doc.sections.map((section) => (
              <div key={section.id} className="doc-section">
                <div className="doc-section-body">
                  <h4>{section.heading}</h4>
                  <p>{section.excerpt}</p>
                </div>
                <div className="doc-annotation">
                  <span className="badge">Companion insight</span>
                  <strong>{section.insight}</strong>
                  <p>{section.action}</p>
                  <div className="annotation-actions">
                    <button className="ghost">Apply</button>
                    <button className="link">Ask follow-up</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="doc-side">
            <div className="inline-tips">
              <h5>Inline automations</h5>
              <ul>
                {doc.inlineTips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>
            <div className="inline-voice">
              <p>🎤 Ask Companion even in full screen.</p>
              <button className="ghost" onClick={() => setVoiceModeOpen(true)}>
                Ask about this doc
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const companionChat = (
    <div className="chat-stack hero">
      <div className="chat-feed">
        {chatLog.map((entry, index) => (
          <div
            key={`${entry.role}-${index}`}
            className={`chat-bubble ${entry.role}`}
          >
            {entry.text}
          </div>
        ))}
      </div>
      <form className="chat-form" onSubmit={handlePromptSubmit}>
        <input
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Ask Companion about this file..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );

  return (
    <div className="drive-app">
      <header className="google-bar">
        <div className="google-left">
          <div className="drive-logo">▲</div>
          <span>Drive Companion</span>
        </div>
        <div className="search-box">
          <span>🔍</span>
          <input placeholder="Search in Drive" />
        </div>
        <div className="google-right">
          <button className="icon-btn">?</button>
          <button className="icon-btn">⚙️</button>
          <div className="persona-toggle">
            <button
              className={persona === "student" ? "active" : ""}
              onClick={() => setPersona("student")}
            >
              🎓
            </button>
            <button
              className={persona === "professional" ? "active" : ""}
              onClick={() => setPersona("professional")}
            >
              💼
            </button>
          </div>
          <div className="avatar">{persona === "student" ? "CL" : "VC"}</div>
        </div>
      </header>

      <div className="main-area">
        <nav className="side-nav">
          <button className="new-btn">+ New</button>
          <div className="nav-group">
            <span className="nav-label">Companion control</span>
            <button className="nav-link active">AI Dashboard</button>
            <button className="nav-link">Drive view</button>
            <button className="nav-link">Calendar sync</button>
            <button className="nav-link">Automations</button>
            <button className="nav-link">Insights</button>
            <button className="nav-link">Settings</button>
          </div>
        </nav>

        <section className="content-area">
          <div className="content-header">
            <div>
              <span className="eyebrow">{personaConfig[persona].title}</span>
              <h2>Companion Dashboard</h2>
              <p>{personaConfig[persona].narrative}</p>
            </div>
          </div>

          <div className="stat-grid">
            {dashboardStats[persona].map((card) => (
              <div key={card.id} className={`stat-card ${card.accent}`}>
                <div className="stat-label">
                  <span>{card.label}</span>
                  <small>{card.helper}</small>
                </div>
                <strong>{card.value}</strong>
                <p>{card.trend}</p>
              </div>
            ))}
          </div>

          <div className="chip-row">
            {personaConfig[persona].chips.map((chip) => (
              <button key={chip}>{chip}</button>
            ))}
          </div>

          <section className="chat-section">
            <div className="panel companion-chat-panel hero">
              <div className="companion-chat-head">
                <div>
                  <span className="badge soft">Always-on agent</span>
                  <h4>Companion chat</h4>
                  <p>
                    {selectedFile
                      ? `Watching ${selectedFile.name} right now.`
                      : "Connected to Drive + Calendar."}
                  </p>
                </div>
                <button
                  type="button"
                  className="ghost subtle"
                  onClick={() => setCompanionExpanded(true)}
                >
                  Pop out
                </button>
              </div>
              <div className="chat-suggestions-row">
                {chatPromptChips.map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    className="chat-chip"
                    onClick={() => handleChatChipClick(chip)}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
              {companionChat}
            </div>
          </section>

          <div className="insight-banner">
            <div>
              <span className="badge soft">
                {persona === "student" ? "Student spotlight" : "Pro spotlight"}
              </span>
              <h3>{personaSpotlight.title}</h3>
              <p>{personaSpotlight.detail}</p>
            </div>
            <div className="insight-actions">
              <span>
                {persona === "student"
                  ? "Keep syllabi, readings, and deadlines in lockstep."
                  : "Meetings, decks, and calendars stay synced automatically."}
              </span>
              <button
                className="primary"
                type="button"
                onClick={() => handleUseCaseClick(personaSpotlight)}
              >
                Show me
              </button>
            </div>
          </div>

          <div className="usecase-row">
            {useCaseHighlights
              .filter((card) => card.persona === persona)
              .map((card) => (
                <button
                  key={card.id}
                  className={`usecase-card ${
                    card.persona === persona ? "active" : ""
                  }`}
                  type="button"
                  onClick={() => handleUseCaseClick(card)}
                >
                  <div className="usecase-top">
                    <span className="usecase-icon">{card.icon}</span>
                    <span
                      className={`badge ${
                        card.persona === "student" ? "student" : "pro"
                      }`}
                    >
                      {card.badge}
                    </span>
                  </div>
                  <strong>{card.title}</strong>
                  <p>{card.detail}</p>
                  <span className="text-link">Run demo →</span>
                </button>
              ))}
          </div>

          <div className="panel-grid">
            <div className="panel focus-panel">
              <div className="panel-head">
                <div>
                  <h4>Live file spotlight</h4>
                  <p>{personaConfig[persona].proactive}</p>
                </div>
                <button
                  type="button"
                  className="ghost"
                  onClick={() => setDocCanvasOpen(true)}
                >
                  Open annotations
                </button>
              </div>
              <div className="file-preview">
                <div>
                  <div className="file-type">
                    {selectedFile?.type} · {selectedFile?.meta}
                  </div>
                  <h3>{selectedFile?.name}</h3>
                  <p>{selectedFile?.description}</p>
                </div>
                <div className="doc-card">
                  <h4>{selectedFile?.status}</h4>
                  <ul>
                    {(fileHighlights[selectedFile?.id] || []).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="cta-row">
                  <button
                    className="primary"
                    onClick={() => setDocCanvasOpen(true)}
                  >
                    See Companion notes
                  </button>
                  <button className="ghost">Share</button>
                </div>
              </div>
              <div className="file-grid">
                {filesForPersona.map((file) => (
                  <div
                    key={file.id}
                    className={`file-card ${
                      file.id === selectedFile?.id ? "active" : ""
                    }`}
                    onClick={() => {
                      setSelectedFileId(file.id);
                      setDocCanvasOpen(false);
                    }}
                  >
                    <div className="file-card-head">
                      <div className="file-icon">{file.icon}</div>
                      <div className="file-card-title">
                        <strong>{file.name}</strong>
                        <span className="file-meta">{file.meta}</span>
                      </div>
                      <div className="chip">{file.tag}</div>
                    </div>
                    <p className="file-description">{file.description}</p>
                    <div className="file-card-footer">
                      <span>{file.folder}</span>
                      <span>{file.owner}</span>
                      <span>{file.size}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel companion-preview">
              <div className="panel-head">
                <div>
                  <h4>Drive Companion</h4>
                  <p>{personaConfig[persona].status}</p>
                </div>
                <button
                  type="button"
                  className="ghost"
                  onClick={() => setCompanionExpanded(true)}
                >
                  Open canvas
                </button>
              </div>
              <div className="proactive-banner">
                {persona === "student"
                  ? "Upcoming exam kept in view — no cramming surprises."
                  : "Schedule overload detected — focus block ready to insert."}
              </div>
              <div className="companion-preview-body">
                {renderCompanionScenario()}
              </div>
            </div>
          </div>

          <div className="panel-grid secondary-grid">
            <div className="panel table-panel full-width">
              <div className="panel-head">
                <div>
                  <h4>Recently activated files</h4>
                  <p>Files Companion is monitoring right now.</p>
                </div>
                <button type="button" className="ghost">
                  View all
                </button>
              </div>
              {renderDriveTable()}
            </div>
          </div>
        </section>

        {!companionExpanded && (
          <aside className="sidebar-stack">
            <div className="panel calendar-panel mini">
              <div className="panel-head">
                <div>
                  <h4>Calendar sync</h4>
                  <p>Today’s schedule at a glance.</p>
                </div>
                <button type="button" className="ghost">
                  Open Calendar
                </button>
              </div>
              <div className="calendar-list compact">
                {calendarFeed.map((entry) => (
                  <div key={entry.id} className="calendar-item">
                    <div className="calendar-pill">
                      <strong>{entry.day}</strong>
                      <span>{entry.time}</span>
                    </div>
                    <div className="calendar-body">
                      <h5>{entry.title}</h5>
                      <p>{entry.meta}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="section-card sidebar-whisper">
              <div className="chat-header">
                <div>
                  <strong>Drive Whisper</strong>
                  <span>One-tap nudges</span>
                </div>
                <button type="button" className="ghost">
                  Automations
                </button>
              </div>
              <div className="suggestion-list roomy">
                {whisperSuggestions[persona].map((tip) => (
                  <article
                    key={tip.message}
                    className={`suggestion ${tip.tone}`}
                    role="alert"
                  >
                    <div className="suggestion-header">
                      <span className="suggestion-chip">Drive Whisper</span>
                      <span className="suggestion-time">{tip.time}</span>
                    </div>
                    <div className="suggestion-body">
                      <div className="suggestion-icon" aria-hidden="true">
                        {tip.tone === "alert"
                          ? "⚠️"
                          : tip.tone === "plan"
                          ? "✨"
                          : "🔔"}
                      </div>
                      <div className="suggestion-content">
                        <p className="suggestion-message">{tip.message}</p>
                      </div>
                    </div>
                    <div className="suggestion-actions">
                      <button type="button" className="suggestion-dismiss">
                        Maybe later
                      </button>
                      <button type="button" className="suggestion-action">
                        {tip.action}
                        <span aria-hidden="true">&rarr;</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>

      <nav className={`tour-nav ${tourCollapsed ? "collapsed" : ""}`}>
        <div className="tour-heading">
          <div className="tour-meta">
            <strong>Companion tour</strong>
            <span>
              Swipe through the signature student + professional MVP moments.
            </span>
          </div>
          <div className="tour-controls">
            <span className="tour-hint">Scroll to preview each demo</span>
            <div className="tour-buttons">
              <button
                type="button"
                aria-label="Scroll tour left"
                onClick={() => scrollTour("left")}
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Scroll tour right"
                onClick={() => scrollTour("right")}
              >
                →
              </button>
            </div>
            <button
              type="button"
              className="tour-toggle"
              onClick={() => setTourCollapsed((prev) => !prev)}
            >
              {tourCollapsed ? "Open" : "Hide"}
            </button>
          </div>
        </div>
        {!tourCollapsed && (
          <div className="tour-carousel">
            <div className="tour-steps" ref={tourTrackRef}>
              {demoSteps.map((step) => {
                const isActive = currentStep?.id === step.id;
                const isStudent = step.persona === "student";
                return (
                  <button
                    key={step.id}
                    type="button"
                    className={`tour-card ${isActive ? "active" : ""} ${
                      isStudent ? "student" : "pro"
                    }`}
                    onClick={() => {
                      setPersona(step.persona);
                      setSelectedFileId(step.fileId);
                      setDocCanvasOpen(false);
                    }}
                  >
                    <div className="tour-card-top">
                      <div className="tour-pill">
                        {isStudent ? "🎓 Student" : "💼 Professional"}
                      </div>
                      <strong>{step.title}</strong>
                      <p className="tour-subtitle">{step.subtitle}</p>
                    </div>
                    <div className="tour-card-body">
                      {step.highlights.map((point) => (
                        <div key={point} className="tour-chip">
                          {point}
                        </div>
                      ))}
                    </div>
                    <span className="tour-cta">{step.action}</span>
                  </button>
                );
              })}
            </div>
            <div className="tour-fade left" aria-hidden="true" />
            <div className="tour-fade right" aria-hidden="true" />
          </div>
        )}
      </nav>

      <button
        type="button"
        className="floating-chat"
        onClick={() => setGlobalChatOpen(true)}
      >
        💬 <span>Chat with Companion</span>
      </button>

      {globalChatOpen && (
        <div className="global-chat-overlay">
          <div className="global-chat-panel">
            <div className="panel-head">
              <div>
                <span className="badge soft">Always-on agent</span>
                <h3>Ask Companion anything</h3>
                <p>Connected to Drive + Calendar + Gmail</p>
              </div>
              <button
                type="button"
                className="ghost"
                onClick={() => setGlobalChatOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="global-chat-feed">
              {globalChatLog.map((entry, index) => (
                <div
                  key={`global-${entry.role}-${index}`}
                  className={`chat-bubble ${entry.role}`}
                >
                  {entry.text}
                </div>
              ))}
            </div>
            <form
              className="global-chat-form"
              onSubmit={handleGlobalPromptSubmit}
            >
              <input
                value={globalPrompt}
                onChange={(event) => setGlobalPrompt(event.target.value)}
                placeholder="e.g. Draft a recap email for today’s vendor report"
              />
              <button type="submit">Send</button>
            </form>
          </div>
        </div>
      )}

      {docCanvasOpen && (
        <div className="doc-overlay">
          <div className="doc-modal">{renderDocumentCanvas()}</div>
        </div>
      )}

      {companionExpanded && (
        <div className="companion-overlay">
          <div className="companion-canvas">
            <div className="canvas-head">
              <div>
                <h3>Companion Canvas</h3>
                <p>
                  Full-screen agent view — ask anything about{" "}
                  {selectedFile?.name} or orchestrate actions across Drive,
                  Calendar, and Gmail.
                </p>
              </div>
              <button
                className="ghost"
                onClick={() => setCompanionExpanded(false)}
              >
                Close
              </button>
            </div>
            <div className="canvas-grid">
              <div className="canvas-column">{renderCompanionScenario()}</div>
              <div className="canvas-column">{companionChat}</div>
            </div>
          </div>
        </div>
      )}

      {voiceModeOpen && (
        <div className="voice-modal">
          <div className="voice-modal-content">
            <h3>🎤 Voice Mode</h3>
            <p>Coming soon — simulated voice command.</p>
            <p>
              “Hey Companion, scan today’s uploads and prep the Week 4
              flashcards.”
            </p>
            <button onClick={() => setVoiceModeOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
