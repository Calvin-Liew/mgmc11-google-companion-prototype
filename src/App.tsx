import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import "./App.css";

type Persona = "student" | "professional";

type GoogleWorkspaceApp = "Docs" | "Sheets" | "Slides";

type DriveFile = {
  id: string;
  name: string;
  type: string;
  icon: string;
  app: GoogleWorkspaceApp;
  folder: string;
  owner: string;
  modified: string;
  size: string;
  meta: string;
  tag: string;
  description: string;
  status: string;
  route: "/" | "/companion" | "/doc" | "/doc-preview";
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

type ChatEntry = {
  role: "agent" | "user";
  text: string;
  linkLabel?: string;
  linkTo?: string;
};
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
  color: "blue" | "green" | "pink" | "orange";
  location: string;
  startMinutes: number;
  endMinutes: number;
};

type CalendarDayPreviewProps = {
  entries: CalendarEntry[];
  startMinutes: number;
  endMinutes: number;
  size?: "small" | "large";
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
  route: "/" | "/companion" | "/doc" | "/doc-preview";
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
      name: "CS 241 Plan",
      type: "Google Docs",
      app: "Docs",
      icon: "📄",
      folder: "Week zero",
      owner: "me",
      modified: "May 20",
      size: "85 KB",
      meta: "Updated 10m ago · Prof. Diaz",
      tag: "Outline",
      description: "Course outcomes, deliverables, and grading breakdown.",
      status: "Syllabus-to-Schedule Pack ready",
      route: "/",
    },
    {
      id: "reading",
      name: "Week 3 Reader",
      type: "Google Docs",
      app: "Docs",
      icon: "📖",
      folder: "Readings",
      owner: "me",
      modified: "May 18",
      size: "2.1 MB",
      meta: "Shared yesterday · 60 pages",
      tag: "Reading pack",
      description: "Condensed into a summary, slides, and flashcards.",
      status: "Smart Reading Pack generated",
      route: "/doc",
    },
    {
      id: "notes",
      name: "Neural Net Notes",
      type: "Google Docs",
      app: "Docs",
      icon: "📝",
      folder: "Lecture capture",
      owner: "me",
      modified: "May 19",
      size: "120 KB",
      meta: "Synced 5m ago · Voice notes attached",
      tag: "Notes",
      description: "Companion mapped every concept across readings.",
      status: "Living concept map updated",
      route: "/doc",
    },
    {
      id: "exam",
      name: "Midterm Blueprint",
      type: "Google Sheets",
      app: "Sheets",
      icon: "📊",
      folder: "Assessments",
      owner: "me",
      modified: "May 17",
      size: "44 KB",
      meta: "Linked to Calendar · Auto-updated",
      tag: "Prep plan",
      description: "Exam windows, weightings, and suggested study cadence.",
      status: "Deadline-aware exam prep",
      route: "/doc",
    },
  ],
  professional: [
    {
      id: "meeting",
      name: "CX Sync",
      type: "Google Docs",
      app: "Docs",
      icon: "📄",
      folder: "Meetings",
      owner: "me",
      modified: "Jun 3",
      size: "68 KB",
      meta: "Captured 1h ago · Auto-transcribed",
      tag: "Meetings",
      description: "Summary, decisions, and action items already drafted.",
      status: "AI Meeting Chief of Staff",
      route: "/doc",
    },
    {
      id: "vendor",
      name: "Vendor KPIs",
      type: "Google Slides",
      app: "Slides",
      icon: "📈",
      folder: "Reporting",
      owner: "me",
      modified: "May 30",
      size: "6 MB",
      meta: "Final draft · SLA trends",
      tag: "Reporting",
      description: "Executive brief + risk alerts generated instantly.",
      status: "Executive brief ready",
      route: "/companion",
    },
    {
      id: "calendar",
      name: "Calendar Pulse",
      type: "Google Sheets",
      app: "Sheets",
      icon: "🗓️",
      folder: "Planning",
      owner: "me",
      modified: "Jun 2",
      size: "55 KB",
      meta: "Live sync · Week 7",
      tag: "Rhythm",
      description: "Calendar density, focus time, and commute blocks.",
      status: "Work Rhythm Optimiser",
      route: "/doc",
    },
  ],
};

const allDriveFiles: DriveFile[] = [
  ...driveFiles.student,
  ...driveFiles.professional,
];

const findDriveFile = (fileId?: string) =>
  allDriveFiles.find((file) => file.id === fileId);

const getRouteForFile = (fileId?: string) => {
  const file = findDriveFile(fileId);
  if (!file) return "/";
  if (file.id === "calendar") return "/doc/calendar";
  if (!file.route || file.route === "/doc") {
    return `/doc/${file.id}`;
  }
  return file.route;
};

const getAppLaunchLabel = (file?: DriveFile) => {
  if (!file) return "Open file";
  if (file.id === "calendar") return "Open Calendar";
  if (file.app === "Docs") return "Open in Docs";
  if (file.app === "Sheets") return "Open in Sheets";
  if (file.app === "Slides") return "Open in Slides";
  return "Open file";
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

type CannedResponse = {
  triggers: string[];
  persona?: Persona;
  fileId?: string;
  text: string;
  linkLabel?: string;
  linkTo?: string;
};

const cannedGlobalResponses: CannedResponse[] = [
  {
    triggers: ["syllabus", "schedule", "cs 241"],
    persona: "student",
    fileId: "syllabus",
    text: "📘 CS 241 Plan (Docs) is up. I can spin a Sheets tracker or share the Slides summary whenever you’re ready.",
    linkLabel: "Jump to CS 241 Plan",
    linkTo: "/doc/syllabus",
  },
  {
    triggers: ["reading pack", "reader", "pdf"],
    persona: "student",
    fileId: "reading",
    text: "📝 Smart Reading Pack already condensed the Week 3 Reader → 1-page Docs brief + Slides deck + Sheets flashcards.",
    linkLabel: "Open Week 3 Reader",
    linkTo: "/doc/reading",
  },
  {
    triggers: ["concept map", "notes"],
    persona: "student",
    fileId: "notes",
    text: "🧠 Neural Net Notes are linked to lecture audio. Want me to spotlight a risky branch in the Slides concept map?",
    linkLabel: "Open Living Map",
    linkTo: "/doc/notes",
  },
  {
    triggers: ["meeting recap", "cx sync", "chief of staff"],
    persona: "professional",
    fileId: "meeting",
    text: "📄 CX Sync Doc is ready — summary, decisions, and owners are staged. Should I drop the Gmail recap in drafts?",
    linkLabel: "Review CX Sync Doc",
    linkTo: "/doc/meeting",
  },
  {
    triggers: ["vendor", "executive brief", "dashboard"],
    persona: "professional",
    fileId: "vendor",
    text: "📊 Vendor KPIs Slides became an exec brief with talking points + mitigation steps. Ready for leadership?",
    linkLabel: "Open Vendor KPIs",
    linkTo: "/doc/vendor",
  },
  {
    triggers: ["calendar", "focus block", "rhythm"],
    persona: "professional",
    fileId: "calendar",
    text: "🗓️ Calendar Pulse flagged the overload. I can insert a focus block and ping the attendees automatically.",
    linkLabel: "View Calendar Pulse",
    linkTo: "/doc/calendar",
  },
];

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
    route: "/",
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
    route: "/doc",
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
    route: "/doc",
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
    route: "/doc",
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
    route: "/companion",
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
    route: "/doc",
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
      color: "blue",
      location: "Library · Quiet room",
      startMinutes: 15 * 60,
      endMinutes: 16 * 60,
    },
    {
      id: "cal-2",
      day: "Tue",
      time: "9:30 – 10:15 AM",
      title: "Lab 02 reflection",
      meta: "Companion added checklist",
      status: "Auto reminder",
      color: "pink",
      location: "Engineering Lab",
      startMinutes: 9 * 60 + 30,
      endMinutes: 10 * 60 + 15,
    },
    {
      id: "cal-3",
      day: "Thu",
      time: "1:00 – 2:00 PM",
      title: "Midterm cadence review",
      meta: "Risk detection on track",
      status: "Calendar hold",
      color: "green",
      location: "Zoom · link ready",
      startMinutes: 13 * 60,
      endMinutes: 14 * 60,
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
      color: "blue",
      location: "Meet · Conf Room C",
      startMinutes: 11 * 60,
      endMinutes: 11 * 60 + 45,
    },
    {
      id: "cal-5",
      day: "Tue",
      time: "2:30 – 3:00 PM",
      title: "Vendor risk briefing",
      meta: "Exec brief queued",
      status: "Prep now",
      color: "orange",
      location: "Hangouts · Vendor Ops",
      startMinutes: 14 * 60 + 30,
      endMinutes: 15 * 60,
    },
    {
      id: "cal-6",
      day: "Thu",
      time: "4:00 – 5:00 PM",
      title: "Focus block",
      meta: "Companion protected time",
      status: "Focus block",
      color: "green",
      location: "Calendar hold",
      startMinutes: 16 * 60,
      endMinutes: 17 * 60,
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
          "Week 1 covers linear algebra refreshers, studio onboarding, and introduces the semester-long design sprint. Companion expanded every bullet into full paragraphs so faculty can drop in clarifying notes without losing the pacing. Deliverables, rubrics, and reading packs now live inline so the doc reads like the final PDF.",
        insight:
          "Companion captured the sprint milestones, expanded them into trackable tasks, and built a Week 1 checklist in Tasks.",
        action: "Ask Companion to pin this checklist inside Calendar + Todo.",
      },
      {
        id: "week3",
        heading: "Week 3 · Research translation",
        excerpt:
          "Readings and lab reflections are still due Thursday while the proposal pitch lands Monday. The doc now includes the full prompt, evaluation criteria, and side notes from last semester so students can contextualise expectations. Companion threads references back to Drive folders automatically so no citation gets lost.",
        insight:
          "Study blocks already inserted on Tue/Thu evenings to prevent cramming.",
        action: "Adjust tempo? Companion can slide the blocks if labs shift.",
      },
      {
        id: "grading",
        heading: "Grading model",
        excerpt:
          "Projects weigh 45%, labs 35%, exams 20%, and participation modifies the final mark by +/-3%. Companion added an expanded explanation of how resubmissions work plus an FAQ block for late days. The layout mirrors the registrar PDF so students can print without re-formatting.",
        insight:
          "Drive Companion tagged each artifact with its weighting so reminders escalate appropriately.",
        action: "Open dashboard to see how prep time stacks against weighting.",
      },
      {
        id: "capstone",
        heading: "Capstone scaffolding",
        excerpt:
          "Capstone scaffolding spans Weeks 8-12 with milestone reviews, narrative drafts, and mentor office hours. The doc now holds the full timeline, example briefs, and a checklist of cross-functional deliverables. Companion linked previous cohorts' winning decks so inspiration is one click away.",
        insight:
          "Companion mirrored the rubric and turned each milestone into an assignable task.",
        action:
          "Invite teammates to this doc so ownership shows up in Drive activity.",
      },
    ],
    inlineTips: [
      "Auto-populated calendar holds for every due date now include recommended buffer suggestions.",
      "Weekly Drive folders spin up automatically with template Docs, Slides, and Sheets checklists.",
      "Flashcards generate whenever a reading is attached, and the doc links directly to the Sheets deck.",
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
          "Retrieval-tuned prompts outperform static outlines in attention tasks. Companion pulled the full abstract, supporting paragraphs, and footnotes so the doc reads like the original PDF. Margin comments explain why each paragraph matters for the Week 3 lab.",
        insight:
          "Companion highlighted the thesis, graphs, and drafted a 6-slide summary.",
        action: "Open slides or ask for a 90-sec talking track.",
      },
      {
        id: "lab",
        heading: "Lab relevance",
        excerpt:
          "Section 3 mirrors the Week 3 lab prompt and references Diaz 2024. Companion embedded sidebars summarising every cited experiment plus a callout reminding you which variables appear in the rubric. The doc feels like a full chapter with context-specific highlights.",
        insight:
          "Companion linked the citation to your Notes and added a flashcard suggestion.",
        action: "Send flashcards to Sheets so you can review on mobile.",
      },
      {
        id: "figures",
        heading: "Annotated figures + callouts",
        excerpt:
          "Pages 18-23 now include full-resolution figure captions, margin notes, and Companion-generated comparisons against Diaz 2024. The doc highlights where gradients spike and explains how that affects lab write-ups. Each paragraph feels like a real PDF instead of placeholder copy.",
        insight:
          "AI annotations flag every figure that maps to the Week 3 rubric and store the context for future prompts.",
        action:
          "Jump to the annotated figure pack or ask for a Loom-ready walkthrough.",
      },
      {
        id: "discussion",
        heading: "Seminar discussion prep",
        excerpt:
          "The closing discussion spans three paragraphs recapping methodology, limitations, and open questions. Companion appended example talking points for seminar debates and mapped them to flashcards. Students can scroll the doc like an actual Google Doc preview without missing nuance.",
        insight:
          "Companion pre-drafted a one-page discussion summary you can drop into Slides or Sheets.",
        action:
          "Send the summary to Gmail or append it to the Slides discussion deck.",
      },
    ],
    inlineTips: [
      "Flashcards already staged in Sheets with context pulled directly from the doc.",
      'Suggested follow-up question: "Pull figures for Lab 03."',
      "Use Mark as reviewed once each section is summarised so Companion tracks progress.",
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
          "Audio snippets from Lecture 5 are transcribed paragraph by paragraph with timestamps. The doc includes inline screenshots of the whiteboard plus references back to Week 3 reading figures. Companion surfaces contextual tooltips so it feels like a living document.",
        insight:
          "Companion transcribed and linked the audio to the reading and flashcards.",
        action: "Open Slides concept map with this branch highlighted.",
      },
      {
        id: "risk",
        heading: "Cramming risk",
        excerpt:
          "Multiple TODO tags remain unresolved for Lab 02, and Companion now expands each TODO into a sentence describing blockers. The doc also stores your previous mitigation attempts, giving the page more density. Scroll like a real doc to see every action item.",
        insight:
          "Companion nudged the Exam Prep plan to reclaim a Friday block.",
        action: "Accept or decline the suggested block.",
      },
      {
        id: "review",
        heading: "Weekly review wrap",
        excerpt:
          "Weekly review blocks close the doc with a narrative summary, open questions, and links to upcoming office hours. Companion layered in colour-coded annotations for conceptual gaps and automatically linked the Loom recap. It reads like the final packet you would share with a study group.",
        insight:
          "Companion spotted duplicate prep tasks and merged them into a single reminder thread.",
        action:
          "Accept the merged reminder or ask for a spaced-repetition plan.",
      },
    ],
    inlineTips: [
      "Drive Whisper can bundle recordings with related notes and push them into Slides.",
      "Voice button stays hot even when the doc is full screen for hands-free annotations.",
      "Companion shows inline badges wherever action items or risks stack up.",
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
        excerpt:
          "Volume down 8%, EU beta greenlit, and risk flagged on SLA. Companion pulled the full discussion transcript, follow-up questions, and decision log so the doc mimics a real meeting recap. Paragraphs include owners, timestamps, and attachments.",
        insight:
          "Companion drafted the exec recap with decisions and owners pre-filled.",
        action: "Send recap to stakeholders or push to Spaces.",
      },
      {
        id: "memory",
        heading: "Organisational memory",
        excerpt:
          "Last meeting requested vendor audit follow-up and KPI roll-over, and that context is now written out in two paragraphs. Prior decisions are quoted inline so anyone scanning the doc understands why a task exists. The doc reads like the canonical team memory.",
        insight:
          'Agent reminds you "Would you like to carry forward last quarter\'s KPIs?"',
        action: "Insert prior KPIs into the doc with one click.",
      },
      {
        id: "owners",
        heading: "Owner matrix",
        excerpt:
          "Action items are listed in long-form sentences with owner names, due dates, and dependencies. Companion cross-links each owner to their Drive workspace so context follows them. It feels like an actual Google Doc section rather than a placeholder table.",
        insight:
          "Companion auto-tagged each action with a primary owner and pulled their workspace context.",
        action: "Send owners a digest or reassign with one click.",
      },
    ],
    inlineTips: [
      "Action items sync to Tasks and Asana automatically, including context links.",
      "Calendar holds auto-update when deadlines shift so the doc always reflects reality.",
      'Use "Highlight risks" to have Companion annotate any blocker paragraphs in red.',
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
        excerpt:
          "SLA compliance dipped to 93% (target 97%) and Companion spells out the underlying causes in two chunky paragraphs. Charts are embedded as static previews so leadership can skim without opening Slides. Narrative notes capture last quarter's comparisons.",
        insight:
          "Companion surfaced the delta and proposed mitigation talking points.",
        action: "Push the brief to a Gmail draft addressed to leadership.",
      },
      {
        id: "risk",
        heading: "Risk + deadline alert",
        excerpt:
          "Onboarding queue aging threatens next week's rollout, and the doc now explains exactly which regions are impacted. Companion added an AI annotation in-line with remediation paths and the dates those tasks collide with other launches.",
        insight:
          "Agent suggests blocking 3-4 PM focus time and sending a risk brief.",
        action: "Accept focus block or ask to rebalance the day.",
      },
      {
        id: "expansion",
        heading: "Expansion brief",
        excerpt:
          "The final section reads like a mini whitepaper covering expansion criteria, procurement hurdles, and stakeholder quotes. Companion stitches data from Sheets so the doc automatically refreshes when KPIs move. Longer paragraphs keep leadership in context even without dashboards.",
        insight:
          "Companion paired the expansion narrative with an executive talking-point script.",
        action: "Export the script to Slides or send it to the CEO brief doc.",
      },
    ],
    inlineTips: [
      "Executive summary auto-updates as Slides change so numbers stay fresh.",
      'Ask "Show me sentiment trend for Q2" anytime to drop a paragraph directly into the doc.',
      "Use the Insert KPI button to pull any metric from Sheets without leaving the doc.",
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
        excerpt:
          "Afternoon is over 86% booked and there are no buffers before the vendor review. Companion explains how each block was categorised and which meetings are flexible. The doc feels like a narrative audit you could forward to an EA.",
        insight:
          "Companion recommends sliding two internal syncs and inserting a focus block.",
        action: "Approve the rebalance and notify attendees automatically.",
      },
      {
        id: "health",
        heading: "Schedule health",
        excerpt:
          "Commute blocks are not accounted for and context switches hit seven times in four hours. Companion rewrites that data into full sentences so the doc resembles a consulting-style memo. The annotation also lists suggested async swaps.",
        insight:
          "Agent suggests compressing prep time and offering async updates.",
        action: "Send a quick Loom recap via Gmail template.",
      },
      {
        id: "handoffs",
        heading: "Handoff planner",
        excerpt:
          "The final section maps every meeting to its doc, owner, and next action so handoffs are explicit. Companion injects extra paragraphs for flagged risks and upcoming travel days. It reads like a proper calendar briefing you could drop into Google Docs.",
        insight:
          "Companion created a shared handoff doc and linked every meeting artifact automatically.",
        action:
          "Open the handoff doc or ask to include stakeholders on the distribution list.",
      },
    ],
    inlineTips: [
      'Voice: "Companion, protect 3-4 PM daily this week" and the doc logs the change.',
      "Drive Whisper surfaces overload alerts before burnout and writes them into the summary.",
      "Use Re-run pulse to refresh this document whenever the calendar shifts.",
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
  const [docCanvasOpen, setDocCanvasOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState<Record<Persona, ChatEntry[]>>({
    student: initialChat(driveFiles.student[0]),
    professional: initialChat(driveFiles.professional[0]),
  });
  const [voiceModeOpen, setVoiceModeOpen] = useState(false);
  const [globalPrompt, setGlobalPrompt] = useState("");
  const [globalChatHistory, setGlobalChatHistory] = useState<
    Record<Persona, ChatEntry[]>
  >({
    student: [
      {
        role: "agent",
        text: "Hey! I’m watching Drive + Calendar for your courses. Need Docs summaries, Slides, or Sheets trackers?",
      },
    ],
    professional: [
      {
        role: "agent",
        text: "Hey! I’m watching Drive + Calendar for ops. Need Slides briefs, Gmail recaps, or Sheets KPIs?",
      },
    ],
  });
  const tourTrackRef = useRef<HTMLDivElement>(null);
  const [tourCollapsed, setTourCollapsed] = useState(false);
  const [pendingFileId, setPendingFileId] = useState<string | null>(null);
  const [tourActive, setTourActive] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState<
    "fade-in" | "fade-out"
  >("fade-in");

  useEffect(() => {
    if (pendingFileId) return;
    const first = driveFiles[persona][0];
    setSelectedFileId(first.id);
    setDocCanvasOpen(false);
  }, [persona, pendingFileId]);

  const filesForPersona = driveFiles[persona];
  const selectedFile = useMemo(
    () =>
      filesForPersona.find((file) => file.id === selectedFileId) ||
      filesForPersona[0],
    [filesForPersona, selectedFileId]
  );
  const calendarFeed = calendarEntries[persona];
  const quickLinks = filesForPersona.slice(0, 3);
  const suggestionFeed = whisperSuggestions[persona];
  const calendarDayStart = persona === "student" ? 8 * 60 : 7 * 60;
  const calendarDayEnd = persona === "student" ? 22 * 60 : 20 * 60;

  useEffect(() => {
    if (!selectedFile) return;
    setChatHistory((prev) => ({
      ...prev,
      [persona]: [
        ...prev[persona],
        {
          role: "agent",
          text: `Switched focus to ${selectedFile.name}. Ask me to open it in ${selectedFile.type}, sync it to Calendar, or prep a recap.`,
        },
      ],
    }));
  }, [selectedFile, persona]);

  useEffect(() => {
    if (!pendingFileId) return;
    setSelectedFileId(pendingFileId);
    if (!tourActive) {
      setDocCanvasOpen(false);
    }
    setPendingFileId(null);
  }, [pendingFileId, persona, tourActive]);

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage("fade-out");
    }
  }, [location, displayLocation]);

  useEffect(() => {
    if (transitionStage === "fade-out") {
      const timeout = window.setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage("fade-in");
      }, 250);
      return () => window.clearTimeout(timeout);
    }
  }, [transitionStage, location]);

  const activeDemoStep = demoSteps.find(
    (step) => step.persona === persona && step.fileId === selectedFile?.id
  );
  const totalTourSteps = demoSteps.length;
  const currentTourStep = tourActive ? demoSteps[tourStepIndex] : undefined;

  const handleUseCaseClick = (card: UseCaseCard) => {
    setTourActive(false);
    setTourStepIndex(0);
    setPersona(card.persona);
    setSelectedFileId(card.fileId);
    setDocCanvasOpen(false);
    navigate(getRouteForFile(card.fileId));
  };

  const goToTourStep = (
    index: number,
    options?: {
      skipScroll?: boolean;
    }
  ) => {
    const nextIndex = Math.min(Math.max(index, 0), totalTourSteps - 1);
    setTourStepIndex(nextIndex);
    const step = demoSteps[nextIndex];
    setPendingFileId(step.fileId);
    setPersona(step.persona);
    setDocCanvasOpen(false);
    navigate(getRouteForFile(step.fileId));
    if (!options?.skipScroll && tourTrackRef.current) {
      const target = tourTrackRef.current.children[nextIndex] as
        | HTMLElement
        | undefined;
      target?.scrollIntoView({ behavior: "smooth", inline: "center" });
    }
  };

  const startTour = () => {
    setTourCollapsed(false);
    setTourActive(true);
    goToTourStep(0, { skipScroll: true });
  };

  const exitTour = () => {
    setTourActive(false);
    setTourStepIndex(0);
  };

  const handleTourNext = () => {
    if (tourStepIndex >= totalTourSteps - 1) {
      exitTour();
      return;
    }
    goToTourStep(tourStepIndex + 1);
  };

  const handleTourPrev = () => {
    if (tourStepIndex === 0) return;
    goToTourStep(tourStepIndex - 1);
  };

  const openTourScenario = () => {
    if (!currentTourStep) return;
    setDocCanvasOpen(false);
    navigate(getRouteForFile(currentTourStep.fileId));
  };

  const focusTourStep = (index: number, step: DemoStep) => {
    if (tourActive) {
      goToTourStep(index);
    } else {
      setPersona(step.persona);
      setSelectedFileId(step.fileId);
      setDocCanvasOpen(false);
    }
  };

  const renderTourCarousel = () => (
    <div className="tour-carousel">
      <div className="tour-steps" ref={tourTrackRef}>
        {demoSteps.map((step, index) => {
          const isActive = activeDemoStep?.id === step.id;
          const isStudent = step.persona === "student";
          const previewRoute = getRouteForFile(step.fileId);
          return (
            <Link
              key={step.id}
              className={`tour-card ${isActive ? "active" : ""} ${
                isStudent ? "student" : "pro"
              }`}
              to={previewRoute}
              onClick={() => focusTourStep(index, step)}
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
            </Link>
          );
        })}
      </div>
      <div className="tour-fade left" aria-hidden="true" />
      <div className="tour-fade right" aria-hidden="true" />
    </div>
  );
  const shouldShowTourNav = tourActive || location.pathname === "/";
  const renderTourNav = () => {
    if (!shouldShowTourNav) return null;
    return (
      <nav
        className={`tour-nav ${tourCollapsed ? "collapsed" : ""} ${
          tourActive ? "active" : ""
        }`}
      >
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
            {!tourActive && (
              <button
                type="button"
                className="tour-toggle"
                onClick={() => setTourCollapsed((prev) => !prev)}
              >
                {tourCollapsed ? "Open" : "Hide"}
              </button>
            )}
          </div>
        </div>
        {tourActive && currentTourStep ? (
          <>
            <div className="tour-guided">
              <div className="tour-guided-info">
                <span>
                  Step {tourStepIndex + 1} of {totalTourSteps}
                </span>
                <strong>{currentTourStep.title}</strong>
                <p>{currentTourStep.subtitle}</p>
                <div className="tour-guided-points">
                  {currentTourStep.highlights.map((point) => (
                    <span key={`guided-${point}`}>{point}</span>
                  ))}
                </div>
              </div>
              <div className="tour-guided-actions">
                <button
                  type="button"
                  className="ghost"
                  onClick={handleTourPrev}
                  disabled={tourStepIndex === 0}
                >
                  ← Previous
                </button>
                <button
                  type="button"
                  className="ghost"
                  onClick={openTourScenario}
                >
                  Open scenario
                </button>
                <button
                  type="button"
                  className="primary"
                  onClick={handleTourNext}
                >
                  {tourStepIndex === totalTourSteps - 1
                    ? "Finish tour"
                    : "Next scenario →"}
                </button>
                <button type="button" className="link" onClick={exitTour}>
                  Exit tour
                </button>
              </div>
            </div>
            {renderTourCarousel()}
          </>
        ) : (
          !tourCollapsed &&
          location.pathname === "/" && (
            <>
              <div className="tour-optin">
                <div>
                  <strong>Ready for a walkthrough?</strong>
                  <p>
                    See how Companion handles syllabi, readings, meetings, and
                    more in a guided sequence.
                  </p>
                </div>
                <button type="button" className="primary" onClick={startTour}>
                  Start guided tour
                </button>
              </div>
              {renderTourCarousel()}
            </>
          )
        )}
      </nav>
    );
  };

  const sendGlobalPrompt = (question: string) => {
    const scripted = getGlobalScriptedResponse(question, persona);
    setGlobalChatHistory((prev) => ({
      ...prev,
      [persona]: [
        ...prev[persona],
        { role: "user", text: question },
        scripted.entry,
      ],
    }));
    if (scripted.persona && scripted.persona !== persona) {
      setPersona(scripted.persona);
      if (scripted.fileId) {
        setPendingFileId(scripted.fileId);
      }
    } else if (scripted.fileId) {
      setSelectedFileId(scripted.fileId);
      setDocCanvasOpen(false);
    }
  };

  const handleGlobalPromptSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedPrompt = globalPrompt.trim();
    if (!normalizedPrompt) return;
    sendGlobalPrompt(normalizedPrompt);
    setGlobalPrompt("");
  };

  const handleCannedGlobalPrompt = (trigger: string) => {
    sendGlobalPrompt(trigger);
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

  const scriptedCompanionReplies: {
    triggers: string[];
    persona?: Persona;
    response: string;
  }[] = [
    {
      triggers: ["syllabus", "plan", "week"],
      persona: "student",
      response:
        "Docs link: https://drive.google.com/cs241-plan (demo)\nI pinned the Sheets study tracker and Calendar tasks for Week 1.",
    },
    {
      triggers: ["reading", "summary", "slides"],
      persona: "student",
      response:
        "Smart Reading Pack is ready. Open the Docs summary, Slides deck, or Sheets flashcards whenever you’re ready to study.",
    },
    {
      triggers: ["concept", "map", "notes"],
      persona: "student",
      response:
        "Neural Net Notes are linked to Lecture 5 audio. Want me to highlight risky sections and push them to Slides?",
    },
    {
      triggers: ["meeting", "recap", "email"],
      persona: "professional",
      response:
        "Drafted the Gmail recap for CX Sync with decisions + owners attached. Should I send it?",
    },
    {
      triggers: ["vendor", "brief", "kpi"],
      persona: "professional",
      response:
        "Vendor KPIs Slides have already been distilled into an executive brief. I can attach the Sheets dashboard if needed.",
    },
    {
      triggers: ["calendar", "overload", "rebalance"],
      persona: "professional",
      response:
        "Calendar Pulse flagged the crunch. I can insert a focus block and update attendees automatically.",
    },
  ];

  const scriptedGlobalReplies = [
    {
      triggers: ["docs demo", "docs page"],
      response:
        "Use the Docs demo page (/docs-demo) to show how syllabi flow into Docs summaries, Slides decks, and Sheets trackers.",
    },
    {
      triggers: ["ops demo", "vendor page", "pro demo"],
      response:
        "Check /ops-demo for the professional workflow: Slides briefs, Gmail recaps, and Sheets KPIs.",
    },
    {
      triggers: ["share", "link"],
      response:
        "Here’s a mock Drive link for CS 241 Plan: https://drive.google.com/file/d/CS241 (demo).",
    },
  ];

  const getScriptedResponse = (
    question: string,
    personaContext: Persona,
    file?: DriveFile
  ) => {
    const lower = question.toLowerCase();
    const match = scriptedCompanionReplies.find(
      (entry) =>
        entry.triggers.some((trigger) => lower.includes(trigger)) &&
        (!entry.persona || entry.persona === personaContext)
    );
    if (match) return match.response;
    if (file) {
      return `Here’s the ${file.status.toLowerCase()} for ${
        file.name
      }: I can open it in ${file.type}, sync it to Calendar, or prep a brief.`;
    }
    return "I’m still watching Drive — ask me about Docs, Sheets, or Slides anytime.";
  };

  const getGlobalScriptedResponse = (
    question: string,
    personaContext: Persona
  ): { entry: ChatEntry; persona?: Persona; fileId?: string } => {
    const lower = question.toLowerCase();
    const canned = cannedGlobalResponses.find(
      (entry) =>
        entry.triggers.some((trigger) => lower.includes(trigger)) &&
        (!entry.persona || entry.persona === personaContext)
    );
    if (canned) {
      return {
        entry: {
          role: "agent",
          text: canned.text,
          linkLabel: canned.linkLabel,
          linkTo: canned.linkTo,
        },
        persona: canned.persona,
        fileId: canned.fileId,
      };
    }
    const match = scriptedGlobalReplies.find((entry) =>
      entry.triggers.some((trigger) => lower.includes(trigger))
    );
    const fallbackText = match
      ? match.response
      : personaContext === "student"
      ? "Student workspace is synced — I can spin up study plans, reading packs, or exam trackers directly from Drive."
      : "Professional workspace stays aligned — Slides briefs, Gmail recaps, and Sheets KPIs are ready on cue.";
    return { entry: { role: "agent", text: fallbackText } };
  };

  const handlePromptSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!prompt.trim() || !selectedFile) return;
    const question = prompt.trim();
    const response = getScriptedResponse(question, persona, selectedFile);
    setChatHistory((prev) => ({
      ...prev,
      [persona]: [
        ...prev[persona],
        { role: "user", text: question },
        { role: "agent", text: response },
      ],
    }));
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
                Turn Google Docs syllabi into adaptive plans. Companion writes a
                Sheets tracker, syncs every deadline to Google Calendar, and
                organises Drive folders by week.
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
                Turn long-form readings into Google Docs summaries, Slides
                decks, and Sheets flashcards — all auto-linked back to Drive.
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
                Connect Google Docs notes, Slides snippets, and Sheets trackers
                automatically. Companion keeps the map updated every time you
                drop files in Drive.
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
                Prevent cramming by letting Sheets study plans respond to Docs
                updates and Calendar shifts the moment deadlines move.
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
                Captures Google Docs notes live, syncs owners to Tasks/Sheets,
                and drafts the Gmail recap before you leave the meeting.
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
                Google Slides decks become executive briefs automatically —
                Sheets KPIs, Slides visuals, and Gmail-ready talking points.
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
                Google Sheets workload + Calendar density combine to spot
                overload instantly — Companion proposes focus blocks for you.
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
              <span className="recent-tag">{file.app}</span>
            </div>
            <p className="recent-description">{file.description}</p>
            <div className="recent-meta">
              <span>📁 {file.folder}</span>
              <span>👤 {file.owner}</span>
              <span>📅 {file.modified}</span>
              <span>⬇️ {file.size}</span>
            </div>
            <div className="recent-status">
              <span>{file.tag}</span>
              <strong>{file.status}</strong>
            </div>
          </div>
        </button>
      ))}
    </div>
  );

  const renderDocumentCanvas = () => {
    const doc = documentCanvases[selectedFile?.id || ""];
    const personaCalendarEntries = calendarEntries[persona];
    const appLaunchRoute = getRouteForFile(selectedFile?.id);
    const appLaunchLabel = getAppLaunchLabel(selectedFile);
    if (selectedFile?.id === "calendar" && doc) {
      return (
        <div className="doc-pane calendar-mode">
          {tourActive && currentTourStep && (
            <div className="tour-context-banner">
              <div>
                <span>
                  Guided tour · Step {tourStepIndex + 1} of {totalTourSteps}
                </span>
                <strong>{currentTourStep.title}</strong>
                <p>{currentTourStep.subtitle}</p>
              </div>
              <div className="tour-context-actions">
                <button
                  type="button"
                  className="ghost"
                  onClick={handleTourPrev}
                  disabled={tourStepIndex === 0}
                >
                  ← Previous
                </button>
                <button
                  type="button"
                  className="ghost"
                  onClick={openTourScenario}
                >
                  View full calendar
                </button>
                <button
                  type="button"
                  className="primary"
                  onClick={handleTourNext}
                >
                  {tourStepIndex === totalTourSteps - 1
                    ? "Finish tour"
                    : "Next scenario →"}
                </button>
                <button type="button" className="link" onClick={exitTour}>
                  Exit tour
                </button>
              </div>
            </div>
          )}
          <div className="doc-toolbar">
            <div className="doc-breadcrumb">
              <button
                className="ghost-icon"
                onClick={() => setDocCanvasOpen(false)}
              >
                ←
              </button>
              <span>
                My Drive / {personaConfig[persona].folder} /{" "}
                {selectedFile?.name}
              </span>
            </div>
          </div>
          <div className="doc-head-actions">
            <div className="doc-head-actions-left">
              <Link className="ghost subtle" to="/">
                ← Dashboard
              </Link>
              <Link className="ghost subtle" to="/companion">
                Companion
              </Link>
            </div>
            <div className="doc-head-actions-right">
              <Link className="ghost app-launch" to={appLaunchRoute}>
                {appLaunchLabel}
              </Link>
              <button type="button" className="ghost">
                Share
              </button>
              <button type="button" className="primary">
                Export PDF
              </button>
            </div>
          </div>
          <div className="doc-header">
            <div>
              <h2>{doc.title}</h2>
              <p>{doc.subtitle}</p>
            </div>
            <div className="status-chip blue">{doc.status}</div>
          </div>
          <div className="calendar-mode-body">
            <CalendarDayPreview
              entries={personaCalendarEntries}
              startMinutes={calendarDayStart}
              endMinutes={calendarDayEnd}
              size="large"
            />
            <div className="calendar-mode-sidebar">
              <h5>Upcoming events</h5>
              <ul>
                {personaCalendarEntries.map((entry) => (
                  <li key={`calendar-side-${entry.id}`}>
                    <span className={`badge-dot ${entry.color}`} />
                    <div>
                      <strong>{entry.title}</strong>
                      <small>{entry.time}</small>
                      <span>{entry.location}</span>
                    </div>
                  </li>
                ))}
              </ul>
              {doc.inlineTips.length > 0 && (
                <div className="inline-tips compact">
                  <h5>Automations</h5>
                  <ul>
                    {doc.inlineTips.map((tip) => (
                      <li key={`calendar-tip-${tip}`}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
    if (!doc) {
      return (
        <div className="doc-pane empty">
          <p>Select a supported file to see inline annotations.</p>
        </div>
      );
    }

    return (
      <div className="doc-pane">
        {tourActive && currentTourStep && (
          <div className="tour-context-banner">
            <div>
              <span>
                Guided tour · Step {tourStepIndex + 1} of {totalTourSteps}
              </span>
              <strong>{currentTourStep.title}</strong>
              <p>{currentTourStep.subtitle}</p>
            </div>
            <div className="tour-context-actions">
              <button
                type="button"
                className="ghost"
                onClick={handleTourPrev}
                disabled={tourStepIndex === 0}
              >
                ← Previous
              </button>
              <button
                type="button"
                className="ghost"
                onClick={openTourScenario}
              >
                View full doc
              </button>
              <button
                type="button"
                className="primary"
                onClick={handleTourNext}
              >
                {tourStepIndex === totalTourSteps - 1
                  ? "Finish tour"
                  : "Next scenario →"}
              </button>
              <button type="button" className="link" onClick={exitTour}>
                Exit tour
              </button>
            </div>
          </div>
        )}
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
        </div>
        <div className="doc-head-actions">
          <div className="doc-head-actions-left">
            <Link className="ghost subtle" to="/">
              ← Dashboard
            </Link>
            <Link className="ghost subtle" to="/companion">
              Companion
            </Link>
          </div>
          <div className="doc-head-actions-right">
            <Link className="ghost app-launch" to={appLaunchRoute}>
              {appLaunchLabel}
            </Link>
            <button type="button" className="ghost">
              Share
            </button>
            <button type="button" className="primary">
              Export PDF
            </button>
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

  const chatLog = chatHistory[persona];
  const companionChat = (
    <div className="chat-stack hero">
      <div className="chat-feed">
        {chatLog.map((entry, index) => (
          <div
            key={`${entry.role}-${index}`}
            className={`chat-bubble ${entry.role}`}
          >
            <span>{entry.text}</span>
            {entry.linkTo && (
              <Link className="chat-link" to={entry.linkTo}>
                {entry.linkLabel ?? "Open"}
              </Link>
            )}
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
  const dashboardPage = (
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
          <div className="demo-links">
            <Link to="/">Dashboard</Link>
            <Link to="/docs-demo">Docs demo</Link>
            <Link to="/ops-demo">Ops demo</Link>
          </div>
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
                <Link className="ghost subtle" to="/companion">
                  Open companion
                </Link>
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
                      <div className="file-card-info">
                        <div className="file-icon">{file.icon}</div>
                        <div className="file-card-title">
                          <div className="file-card-title-row">
                            <strong>{file.name}</strong>
                            <span
                              className={`file-app-badge ${file.app.toLowerCase()}`}
                            >
                              {file.app}
                            </span>
                          </div>
                          <span className="file-meta">{file.meta}</span>
                        </div>
                      </div>
                      <div className="chip file-tag">{file.tag}</div>
                    </div>
                    <p className="file-description">{file.description}</p>
                    <div className="file-card-footer">
                      <span>📁 {file.folder}</span>
                      <span>👤 {file.owner}</span>
                      <span>📅 {file.modified}</span>
                      <span>⬇️ {file.size}</span>
                    </div>
                    <div className="file-status-row">
                      <span>{file.status}</span>
                      <Link className="text-link" to={`/doc/${file.id}`}>
                        Open doc
                      </Link>
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
                <Link className="ghost" to="/companion">
                  Open companion
                </Link>
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

        <aside className="sidebar-stack">
          <div className="panel calendar-panel mini">
            <div className="panel-head">
              <div>
                <h4>Calendar sync</h4>
                <p>
                  Live Google Calendar preview — Companion keeps it in sync.
                </p>
              </div>
              <button type="button" className="ghost">
                Open Calendar
              </button>
            </div>
            <div className="calendar-preview">
              <div className="calendar-preview-head">
                <div>
                  <span>Today · {calendarFeed[0]?.day ?? "Mon"}</span>
                  <strong>
                    {persona === "student"
                      ? "Study + lab blocks already staged"
                      : "Meetings + focus blocks kept balanced"}
                  </strong>
                </div>
                <div className="calendar-preview-controls">
                  <button
                    type="button"
                    className="ghost-icon small"
                    aria-label="Previous day"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    className="ghost-icon small"
                    aria-label="Next day"
                  >
                    →
                  </button>
                </div>
              </div>
              <div className="calendar-card-list">
                {calendarFeed.map((entry) => (
                  <article
                    key={`card-${entry.id}`}
                    className={`calendar-mini-card ${entry.color}`}
                  >
                    <div className="calendar-mini-content">
                      <div className="calendar-mini-head">
                        <span>{entry.time}</span>
                        <button type="button" className="calendar-mini-chip">
                          {entry.status}
                        </button>
                      </div>
                      <strong>{entry.title}</strong>
                      <small>{entry.location}</small>
                    </div>
                  </article>
                ))}
              </div>
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
      </div>

      <nav
        className={`tour-nav ${tourCollapsed ? "collapsed" : ""} ${
          tourActive ? "active" : ""
        }`}
      >
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
            {!tourActive && (
              <button
                type="button"
                className="tour-toggle"
                onClick={() => setTourCollapsed((prev) => !prev)}
              >
                {tourCollapsed ? "Open" : "Hide"}
              </button>
            )}
          </div>
        </div>
        {tourActive && currentTourStep ? (
          <>
            <div className="tour-guided">
              <div className="tour-guided-info">
                <span>
                  Step {tourStepIndex + 1} of {totalTourSteps}
                </span>
                <strong>{currentTourStep.title}</strong>
                <p>{currentTourStep.subtitle}</p>
                <div className="tour-guided-points">
                  {currentTourStep.highlights.map((point) => (
                    <span key={`guided-${point}`}>{point}</span>
                  ))}
                </div>
              </div>
              <div className="tour-guided-actions">
                <button
                  type="button"
                  className="ghost"
                  onClick={handleTourPrev}
                  disabled={tourStepIndex === 0}
                >
                  ← Previous
                </button>
                <button
                  type="button"
                  className="ghost"
                  onClick={openTourScenario}
                >
                  Open scenario
                </button>
                <button
                  type="button"
                  className="primary"
                  onClick={handleTourNext}
                >
                  {tourStepIndex === totalTourSteps - 1
                    ? "Finish tour"
                    : "Next scenario →"}
                </button>
                <button type="button" className="link" onClick={exitTour}>
                  Exit tour
                </button>
              </div>
            </div>
            {renderTourCarousel()}
          </>
        ) : (
          !tourCollapsed && (
            <>
              <div className="tour-optin">
                <div>
                  <strong>Ready for a walkthrough?</strong>
                  <p>
                    See how Companion handles syllabi, readings, meetings, and
                    more in a guided sequence.
                  </p>
                </div>
                <button type="button" className="primary" onClick={startTour}>
                  Start guided tour
                </button>
              </div>
              {renderTourCarousel()}
            </>
          )
        )}
      </nav>

      <Link className="floating-chat" to="/companion">
        💬 <span>Chat with Companion</span>
      </Link>

      {docCanvasOpen && (
        <div className="doc-overlay">
          <div className="doc-modal">{renderDocumentCanvas()}</div>
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

  const heroStats = [
    {
      label: personaConfig[persona].title,
      value: personaConfig[persona].narrative,
      helper: "Drive Companion keeps this workspace hot.",
    },
    {
      label: selectedFile ? selectedFile.name : "Recent Drive files",
      value: selectedFile ? selectedFile.status : "Pick any file to spotlight.",
      helper: selectedFile ? selectedFile.meta : personaConfig[persona].status,
    },
    {
      label: personaConfig[persona].folder,
      value: personaConfig[persona].status,
      helper: "Synced to Calendar, Gmail, and Drive.",
    },
  ];
  const docsDemo = <DocsDemo files={driveFiles.student} />;
  const opsDemo = <OpsDemo files={driveFiles.professional} />;
  const companionPage = (
    <div className="companion-page">
      <section className="companion-hero">
        <div className="companion-hero-content">
          <div>
            <span className="badge soft">Central companion</span>
            <h1>Drive Companion Control Room</h1>
            <p>
              LLM-style threads with direct access to Docs, Sheets, Slides,
              Calendar, and Gmail.
            </p>
            <div className="companion-hero-chips">
              {personaConfig[persona].chips.map((chip) => (
                <span key={chip}>{chip}</span>
              ))}
            </div>
          </div>
          <Link className="ghost subtle" to="/">
            ← Back to dashboard
          </Link>
        </div>
        <div className="companion-hero-stats">
          {heroStats.map((stat) => (
            <article key={stat.label} className="companion-stat-card">
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              <p>{stat.helper}</p>
            </article>
          ))}
        </div>
        <div className="persona-tabs hero-tabs">
          <button
            className={persona === "student" ? "active" : ""}
            onClick={() => setPersona("student")}
          >
            🎓 Student workspace
          </button>
          <button
            className={persona === "professional" ? "active" : ""}
            onClick={() => setPersona("professional")}
          >
            💼 Professional workspace
          </button>
        </div>
      </section>
      <div className="companion-meta-row">
        <div className="companion-meta">
          <span>Folder: {personaConfig[persona].folder}</span>
          <span>
            Focus: {selectedFile ? selectedFile.name : "Recent Drive files"}
          </span>
        </div>
        <span className="companion-meta-status">
          {personaConfig[persona].status}
        </span>
      </div>
      <div className="companion-main-grid">
        <section className="companion-chat-panel hero-panel">
          <div className="companion-chat-head">
            <div>
              <h4>Drive Companion Chat</h4>
              <p>LLM + Drive context in one canvas.</p>
            </div>
            <span>{filesForPersona.length} linked files</span>
          </div>
          <div className="chat-meta">
            <span>Folder: {personaConfig[persona].folder}</span>
            <span>
              Focus: {selectedFile ? selectedFile.name : "Recent Drive files"}
            </span>
          </div>
          <div className="chat-stack large">
            <div className="chat-feed">
              {globalChatHistory[persona].map((entry, index) => (
                <div
                  key={`central-${entry.role}-${index}`}
                  className={`chat-bubble ${entry.role}`}
                >
                  <span>{entry.text}</span>
                  {entry.linkTo && (
                    <Link className="chat-link" to={entry.linkTo}>
                      {entry.linkLabel ?? "Open"}
                    </Link>
                  )}
                </div>
              ))}
            </div>
            <form className="chat-form" onSubmit={handleGlobalPromptSubmit}>
              <input
                value={globalPrompt}
                onChange={(event) => setGlobalPrompt(event.target.value)}
                placeholder="“Prep Slides talking points for vendor KPIs…”"
              />
              <button type="submit">Send</button>
            </form>
          </div>
          <div className="chat-shortcuts">
            {cannedGlobalResponses
              .filter((entry) => !entry.persona || entry.persona === persona)
              .slice(0, 4)
              .map((entry) => (
                <button
                  key={entry.text}
                  className="chat-chip"
                  onClick={() => handleCannedGlobalPrompt(entry.triggers[0])}
                >
                  {entry.linkLabel ?? entry.triggers[0]}
                </button>
              ))}
          </div>
        </section>
        <div className="companion-intel-stack">
          <div className="companion-intel-card">
            <div className="companion-intel-head">
              <div>
                <h4>Current file</h4>
                <p>{selectedFile?.status}</p>
              </div>
              <span
                className={`file-app-badge ${
                  selectedFile?.app?.toLowerCase() ?? "docs"
                }`}
              >
                {selectedFile?.app ?? "Docs"}
              </span>
            </div>
            <h3>{selectedFile?.name}</h3>
            <p>{selectedFile?.description}</p>
            <div className="companion-intel-meta">
              <span>{selectedFile?.folder}</span>
              <span>{selectedFile?.meta}</span>
            </div>
            <div className="companion-intel-actions">
              <button
                type="button"
                className="ghost"
                onClick={() => setDocCanvasOpen(true)}
              >
                Open annotations
              </button>
              <Link
                className="text-link"
                to={
                  selectedFile
                    ? `/doc/${selectedFile.id}`
                    : `/${persona === "student" ? "docs-demo" : "ops-demo"}`
                }
              >
                View doc →
              </Link>
            </div>
          </div>
          <div className="companion-intel-card">
            <div className="companion-intel-head">
              <div>
                <h4>Quick switches</h4>
                <p>Jump between docs without leaving chat.</p>
              </div>
              <span className="companion-meta-status subtle">
                {filesForPersona.length} files
              </span>
            </div>
            <ul className="companion-quick-switches">
              {filesForPersona.slice(0, 5).map((file) => (
                <li key={`side-${file.id}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFileId(file.id);
                      setDocCanvasOpen(false);
                    }}
                  >
                    {file.icon} {file.name}
                  </button>
                  <span>{file.status}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="companion-intel-card companion-suggestions">
            <div className="companion-intel-head">
              <div>
                <h4>Drive Whisper</h4>
                <p>Live nudges from Companion.</p>
              </div>
            </div>
            <div className="suggestion-list roomy">
              {suggestionFeed.map((tip) => (
                <article
                  key={`companion-suggestion-${tip.message}`}
                  className={`suggestion ${tip.tone}`}
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
        </div>
      </div>
      <section className="companion-files-row">
        <div className="companion-files-head">
          <div>
            <h4>Files in focus</h4>
            <p>Companion can jump into these docs instantly.</p>
          </div>
          <Link className="ghost" to="/">
            Back to dashboard
          </Link>
        </div>
        <div className="companion-files-grid">
          {quickLinks.map((file) => (
            <article key={`quick-${file.id}`} className="companion-file-card">
              <div className="companion-file-head">
                <div>
                  <span className={`file-app-badge ${file.app.toLowerCase()}`}>
                    {file.app}
                  </span>
                  <strong>{file.name}</strong>
                </div>
                <button
                  type="button"
                  className="ghost subtle"
                  onClick={() => {
                    setSelectedFileId(file.id);
                    setDocCanvasOpen(false);
                  }}
                >
                  Focus
                </button>
              </div>
              <p>{file.description}</p>
              <div className="companion-file-meta">
                <span>{file.folder}</span>
                <span>{file.owner}</span>
                <span>{file.modified}</span>
              </div>
              <div className="companion-file-actions">
                <Link className="text-link" to={`/doc/${file.id}`}>
                  Open doc →
                </Link>
                <span>{file.status}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );

  return (
    <>
      <div className={`page-transition ${transitionStage}`}>
        <Routes location={displayLocation}>
          <Route path="/" element={dashboardPage} />
          <Route path="/docs-demo" element={docsDemo} />
          <Route path="/ops-demo" element={opsDemo} />
          <Route path="/doc/:fileId" element={<FileDocPage />} />
          <Route path="/companion" element={companionPage} />
        </Routes>
      </div>
      {renderTourNav()}
    </>
  );
}

export default App;

type DocsDemoProps = {
  files: DriveFile[];
};

const DocsDemo = ({ files }: DocsDemoProps) => (
  <div className="demo-page">
    <h1>Docs + Slides Workflow</h1>
    <p>
      Show how Drive Companion turns Docs into Slides briefs, Sheets trackers,
      and Calendar-ready plans.
    </p>
    <div className="demo-card-grid">
      {files.slice(0, 3).map((file) => (
        <div key={file.id} className="demo-card">
          <div className="demo-card-head">
            <span className="demo-app">{file.app}</span>
            <strong>{file.name}</strong>
          </div>
          <small>{file.description}</small>
        </div>
      ))}
    </div>
    <Link className="ghost" to="/">
      ← Back to dashboard
    </Link>
  </div>
);

const OpsDemo = ({ files }: DocsDemoProps) => (
  <div className="demo-page">
    <h1>Ops & Vendor Demo</h1>
    <p>
      Walk through how Slides decks, Docs notes, and Sheets KPIs stay
      orchestrated across Gmail and Calendar.
    </p>
    <div className="demo-card-grid">
      {files.slice(0, 3).map((file) => (
        <div key={file.id} className="demo-card">
          <div className="demo-card-head">
            <span className="demo-app">{file.app}</span>
            <strong>{file.name}</strong>
          </div>
          <small>{file.description}</small>
        </div>
      ))}
    </div>
    <Link className="ghost" to="/">
      ← Back to dashboard
    </Link>
  </div>
);

const FileDocPage = () => {
  const { fileId } = useParams();
  const file = findDriveFile(fileId);
  const doc = documentCanvases[fileId || ""];
  const filePersona: Persona = driveFiles.student.some(
    (item) => item.id === file?.id
  )
    ? "student"
    : "professional";
  const [chatDocked, setChatDocked] = useState(true);
  const docChatSamples: ChatEntry[] =
    filePersona === "student"
      ? [
          {
            role: "agent",
            text: "🔍 Highlighted the risk paragraph and drafted mitigation notes for your study pack.",
            linkLabel: "Open highlight",
            linkTo: `/doc/${fileId}#risk`,
          },
          {
            role: "user",
            text: "Can you summarize the next section for Sheets?",
          },
          {
            role: "agent",
            text: "Summary ready. Want me to push it to Sheets or prep Slides talking points?",
          },
        ]
      : [
          {
            role: "agent",
            text: "📊 Pulled KPIs + flagged the onboarding risk in this doc. Ready to slot into Slides?",
            linkLabel: "View KPI callout",
            linkTo: `/doc/${fileId}#kpi`,
          },
          {
            role: "user",
            text: "Draft an exec recap snippet.",
          },
          {
            role: "agent",
            text: "Snippet is ready. I can drop it into Gmail or append it to Slides — just say the word.",
          },
        ];

  if (!file) {
    return (
      <div className="demo-page">
        <h1>File not found</h1>
        <p>This demo file doesn’t exist yet.</p>
        <Link className="ghost" to="/">
          ← Back to dashboard
        </Link>
      </div>
    );
  }
  if (file.id === "calendar") {
    const personaCalendarEntries = calendarEntries[filePersona];
    const fileAppRoute = getRouteForFile(file.id);
    const fileAppLabel = getAppLaunchLabel(file);
    return (
      <div className="demo-page calendar-doc">
        <div className="doc-view-head">
          <div className="doc-head-left">
            <div className="doc-head-icon" aria-hidden="true">
              {file.icon}
            </div>
            <div>
              <span className="doc-head-app">{file.app}</span>
              <h1>{file.name}</h1>
              <p>{file.description}</p>
            </div>
          </div>
        </div>
        <div className="doc-head-actions doc-view-actions">
          <div className="doc-head-actions-left">
            <Link className="ghost subtle" to="/">
              ← Dashboard
            </Link>
            <Link className="ghost subtle" to="/companion">
              Companion
            </Link>
          </div>
          <div className="doc-head-actions-right">
            <Link className="ghost app-launch" to={fileAppRoute}>
              {fileAppLabel}
            </Link>
            <button type="button" className="ghost">
              Share
            </button>
            <button type="button" className="primary">
              Export PDF
            </button>
          </div>
        </div>
        <div className="doc-view-meta">
          <span>{file.type}</span>
          <span>{file.meta}</span>
          <span>{file.status}</span>
        </div>
        <div className="calendar-doc-body">
          <CalendarDayPreview
            entries={personaCalendarEntries}
            startMinutes={6 * 60}
            endMinutes={22 * 60}
            size="large"
          />
          <aside className="calendar-doc-legend">
            <h4>Today’s events</h4>
            <ul>
              {personaCalendarEntries.map((entry) => (
                <li key={`calendar-doc-${entry.id}`}>
                  <span className={`badge-dot ${entry.color}`} />
                  <div>
                    <strong>{entry.title}</strong>
                    <small>{entry.time}</small>
                    <span>{entry.location}</span>
                  </div>
                </li>
              ))}
            </ul>
            {doc?.inlineTips?.length ? (
              <div className="inline-tips compact">
                <h5>Automation notes</h5>
                <ul>
                  {doc.inlineTips.map((tip) => (
                    <li key={`calendar-doc-tip-${tip}`}>{tip}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    );
  }
  const fileAppRoute = getRouteForFile(file.id);
  const fileAppLabel = getAppLaunchLabel(file);
  return (
    <div className="demo-page doc-view">
      <div className="doc-view-head">
        <div className="doc-head-left">
          <div className="doc-head-icon" aria-hidden="true">
            {file.icon}
          </div>
          <div>
            <span className="doc-head-app">{file.app}</span>
            <h1>{file.name}</h1>
            <p>{file.description}</p>
          </div>
        </div>
      </div>
      <div className="doc-head-actions doc-view-actions">
        <div className="doc-head-actions-left">
          <Link className="ghost subtle" to="/">
            ← Dashboard
          </Link>
          <Link className="ghost subtle" to="/companion">
            Companion
          </Link>
        </div>
        <div className="doc-head-actions-right">
          <Link className="ghost app-launch" to={fileAppRoute}>
            {fileAppLabel}
          </Link>
          <button type="button" className="ghost">
            Share
          </button>
          <button type="button" className="primary">
            Export PDF
          </button>
        </div>
      </div>
      <div className="doc-view-meta">
        <span>{file.type}</span>
        <span>{file.meta}</span>
        <span>{file.status}</span>
        <span>Folder: {file.folder}</span>
      </div>
      {doc ? (
        <>
          <div className="doc-insights-rail">
            {doc.sections.slice(0, 3).map((section) => (
              <article
                key={`insight-${section.id}`}
                className="doc-insight-card"
              >
                <small>{section.heading}</small>
                <strong>{section.insight}</strong>
                <p>{section.action}</p>
              </article>
            ))}
            <article className="doc-insight-card tips-card">
              <small>Inline automations</small>
              <ul>
                {doc.inlineTips.slice(0, 3).map((tip, index) => (
                  <li key={`tip-pill-${index}`}>{tip}</li>
                ))}
              </ul>
            </article>
          </div>
          <div className="doc-stage-grid">
            <div className="doc-page-shell">
              <div
                className="doc-page-scroll"
                role="region"
                aria-label="Google Doc preview"
              >
                <div className="doc-page-surface">
                  <header className="doc-page-header">
                    <div>
                      <h3>{doc.title}</h3>
                      <p>{doc.subtitle}</p>
                    </div>
                    <span className="doc-page-status">{doc.status}</span>
                  </header>
                  {doc.sections.map((section, index) => (
                    <article
                      key={`page-${section.id}`}
                      id={section.id}
                      className="doc-page-section"
                    >
                      <div className="doc-section-head">
                        <span className="doc-section-pill">
                          Section {index + 1}
                        </span>
                        <h4>{section.heading}</h4>
                      </div>
                      <p>{section.excerpt}</p>
                      <div className="doc-inline-callout">
                        <span className="doc-inline-chip">AI annotation</span>
                        <strong>{section.insight}</strong>
                        <p>{section.action}</p>
                        <div className="doc-inline-actions">
                          <button type="button" className="primary">
                            Apply note
                          </button>
                          <button type="button" className="ghost">
                            Ask follow-up
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                  <footer className="doc-page-footnotes">
                    <h5>Tips from Companion</h5>
                    <ul>
                      {doc.inlineTips.map((tip, index) => (
                        <li key={`footnote-${index}`}>{tip}</li>
                      ))}
                    </ul>
                  </footer>
                </div>
              </div>
            </div>
            <aside
              className={`doc-chat-card ${chatDocked ? "open" : "collapsed"}`}
            >
              <div className="doc-chat-card-head">
                <div>
                  <strong>Drive Companion</strong>
                  <span>Linked to {file.folder}</span>
                </div>
                <button
                  className="ghost subtle"
                  onClick={() => setChatDocked((prev) => !prev)}
                >
                  {chatDocked ? "Hide" : "Show"}
                </button>
              </div>
              {chatDocked ? (
                <>
                  <div className="chat-feed">
                    {docChatSamples.map((entry, index) => (
                      <div
                        key={`doc-chat-${entry.role}-${index}`}
                        className={`chat-bubble ${entry.role}`}
                      >
                        <span>{entry.text}</span>
                        {entry.linkTo && (
                          <Link className="chat-link" to={entry.linkTo}>
                            {entry.linkLabel ?? "Open"}
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                  <form
                    className="chat-form"
                    onSubmit={(event) => event.preventDefault()}
                  >
                    <input placeholder="Ask Companion to annotate, summarize…" />
                    <button type="button">Send</button>
                  </form>
                </>
              ) : (
                <p className="doc-chat-hint">
                  Companion chat is docked. Tap show to reopen.
                </p>
              )}
            </aside>
          </div>
          <div className="doc-automation-board">
            <section className="doc-automation-section">
              <div className="doc-automation-head">
                <div>
                  <h4>AI highlights</h4>
                  <p>
                    Companion pinned the most important paragraphs in this doc.
                  </p>
                </div>
                <span className="doc-automation-count">
                  {doc.sections.length} callouts
                </span>
              </div>
              <div className="doc-highlight-grid">
                {doc.sections.map((section) => (
                  <article
                    key={`highlight-${section.id}`}
                    className="doc-highlight-item"
                  >
                    <span className="doc-highlight-label">
                      {section.heading}
                    </span>
                    <p>{section.excerpt}</p>
                    <div className="doc-highlight-note">
                      <strong>{section.insight}</strong>
                      <small>{section.action}</small>
                    </div>
                  </article>
                ))}
              </div>
            </section>
            <section className="doc-automation-section">
              <div className="doc-automation-head">
                <div>
                  <h4>Inline automations</h4>
                  <p>Actions Companion can run without leaving the doc.</p>
                </div>
              </div>
              <ul className="doc-automation-list">
                {doc.inlineTips.map((tip, index) => (
                  <li key={`automation-${index}`}>
                    <span className="doc-automation-number">{index + 1}</span>
                    <p>{tip}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </>
      ) : (
        <p>This file doesn’t have a full document canvas yet.</p>
      )}
    </div>
  );
};

const CalendarDayPreview = ({
  entries,
  startMinutes,
  endMinutes,
  size = "small",
}: CalendarDayPreviewProps) => {
  const isSmall = size === "small";
  const totalMinutes = Math.max(endMinutes - startMinutes, 60);
  const hourMarks = Array.from(
    { length: Math.floor(totalMinutes / 60) + 1 },
    (_, index) => startMinutes + index * 60
  );
  const formatLabel = (minutes: number) => {
    const hour = Math.floor(minutes / 60);
    const suffix = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour} ${suffix}`;
  };
  return (
    <div className={`calendar-day-view ${size}`}>
      <div className="calendar-hours">
        {hourMarks.map((minutes) => {
          const offset = minutes - startMinutes;
          const top = (offset / totalMinutes) * 100;
          return (
            <span key={`hour-${minutes}`} style={{ top: `${top}%` }}>
              {formatLabel(minutes)}
            </span>
          );
        })}
      </div>
      <div className="calendar-day-column">
        {entries.map((entry) => {
          const clampedStart = Math.max(entry.startMinutes, startMinutes);
          const clampedEnd = Math.min(entry.endMinutes, endMinutes);
          const offset = clampedStart - startMinutes;
          const duration = Math.max(clampedEnd - clampedStart, 30);
          const top = (offset / totalMinutes) * 100;
          const height = Math.max(
            (duration / totalMinutes) * 100,
            (45 / totalMinutes) * 100
          );
          return (
            <div
              key={`timeline-${entry.id}`}
              className={`calendar-event-block ${entry.color} ${
                isSmall ? "small" : "large"
              }`}
              style={{ top: `${top}%`, height: `${height}%` }}
            >
              <div className="calendar-event-block-time">{entry.time}</div>
              <strong className={isSmall ? "single-line" : ""}>
                {entry.title}
              </strong>
              <span className="calendar-event-block-location">
                {entry.location}
              </span>
              <span className="calendar-event-block-meta">{entry.meta}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
