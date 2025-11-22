import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import "./App.css";
import companionMark from "./assets/companion-mark.svg";

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

type DocConceptNode = {
  id: string;
  title: string;
  summary: string;
  connections: string[];
  status?: string;
};

type DocumentCanvas = {
  title: string;
  subtitle: string;
  status: string;
  courseLabel?: string;
  sections: DocSection[];
  inlineTips: string[];
  flashcards?: DocFlashcard[];
  flashcardDeckLink?: string;
  flashcardDeckLabel?: string;
  conceptMapNarrative?: string;
  conceptMapNodes?: DocConceptNode[];
  conceptMapLink?: string;
  conceptMapLabel?: string;
};

type DocFlashcard = {
  id: string;
  prompt: string;
  answer: string;
  tag?: string;
  sectionId?: string;
};

type ChatEntry = {
  role: "agent" | "user";
  text?: string;
  richText?: ReactNode;
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
  source?: "companion" | "manual";
};

type CalendarWeekGalleryProps = {
  entries: CalendarEntry[];
  size?: "small" | "large";
};
type CalendarDayTimelineProps = {
  entries: CalendarEntry[];
  dayLabel: string;
};
type CalendarChatMessage = {
  id: string;
  role: "agent" | "user";
  author: string;
  stamp: string;
  tag: string;
  text: string;
  detail?: string;
  action?: string;
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

const makeSvgIcon = (children: ReactNode) => (
  <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
    {children}
  </svg>
);

const iconLibrary: Record<string, () => JSX.Element> = {
  Doc: () =>
    makeSvgIcon(
      <>
        <path
          fill="#E8F0FE"
          d="M9 4h12l6 6v16a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
        />
        <path fill="#AECBFA" d="M21 4v6h6" />
        <rect x="11" y="14.5" width="10" height="2" rx="1" fill="#1A73E8" />
        <rect
          x="11"
          y="19"
          width="8"
          height="2"
          rx="1"
          fill="#1A73E8"
          opacity="0.7"
        />
      </>
    ),
  Reader: () =>
    makeSvgIcon(
      <>
        <path
          fill="#F3E8FF"
          d="M9 4h12l6 6v16a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
        />
        <path fill="#D4BCFF" d="M21 4v6h6" />
        <rect x="11" y="13.5" width="10" height="2" rx="1" fill="#7C3AED" />
        <rect
          x="11"
          y="18"
          width="8"
          height="2"
          rx="1"
          fill="#7C3AED"
          opacity="0.7"
        />
        <rect
          x="11"
          y="22.5"
          width="6"
          height="2"
          rx="1"
          fill="#7C3AED"
          opacity="0.5"
        />
      </>
    ),
  Notes: () =>
    makeSvgIcon(
      <>
        <rect x="6" y="6" width="20" height="22" rx="3" fill="#E0F7FA" />
        <rect
          x="10"
          y="11"
          width="12"
          height="2"
          rx="1"
          fill="#00838F"
        />
        <rect
          x="10"
          y="16"
          width="10"
          height="2"
          rx="1"
          fill="#00838F"
          opacity="0.7"
        />
        <rect
          x="10"
          y="21"
          width="8"
          height="2"
          rx="1"
          fill="#00838F"
          opacity="0.5"
        />
      </>
    ),
  Sheet: () =>
    makeSvgIcon(
      <>
        <rect x="6" y="6" width="20" height="22" rx="3" fill="#E6F4EA" />
        <path
          fill="#34A853"
          d="M9 12h14v2H9zm0 5h14v2H9zm0 5h14v2H9z"
          opacity="0.7"
        />
        <path fill="#34A853" d="M14 9h2v18h-2z" opacity="0.6" />
      </>
    ),
  Trend: () =>
    makeSvgIcon(
      <>
        <rect x="6" y="6" width="20" height="22" rx="3" fill="#FFF7E0" />
        <path
          d="M10 21 15.5 15.5 19 18l5-5"
          stroke="#F29900"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="24" cy="13" r="1.5" fill="#F29900" />
      </>
    ),
  Calendar: () =>
    makeSvgIcon(
      <>
        <rect x="6" y="8" width="20" height="18" rx="3" fill="#ffffff" />
        <path fill="#EA4335" d="M6 10h20v4H6z" />
        <rect
          x="10"
          y="16"
          width="4"
          height="4"
          rx="1"
          fill="#1A73E8"
        />
        <rect
          x="18"
          y="16"
          width="4"
          height="4"
          rx="1"
          fill="#34A853"
        />
        <path
          stroke="#5F6368"
          strokeWidth="2"
          strokeLinecap="round"
          d="M12 8V5m8 3V5"
        />
      </>
    ),
  Focus: () =>
    makeSvgIcon(
      <>
        <circle cx="16" cy="16" r="11" fill="#E4ECFF" />
        <circle
          cx="16"
          cy="16"
          r="7"
          stroke="#1A73E8"
          strokeWidth="2"
          fill="none"
        />
        <circle cx="16" cy="16" r="3" fill="#1A73E8" />
      </>
    ),
  Library: () =>
    makeSvgIcon(
      <>
        <rect x="7" y="8" width="4" height="16" rx="1" fill="#1A73E8" />
        <rect x="13" y="6" width="4" height="18" rx="1" fill="#34A853" />
        <rect x="19" y="9" width="4" height="15" rx="1" fill="#F29900" />
      </>
    ),
  Insight: () =>
    makeSvgIcon(
      <>
        <path
          d="M16 6c4 0 7 3 7 6.5 0 2.3-1.3 4.1-3 5.4V22a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-4.1C10.3 16.6 9 14.8 9 12.5 9 9 12 6 16 6z"
          fill="#FFF0C6"
          stroke="#F29900"
          strokeWidth="1.5"
        />
        <rect x="13" y="24" width="6" height="2" rx="1" fill="#F29900" />
        <rect x="14" y="27" width="4" height="2" rx="1" fill="#F29900" />
      </>
    ),
  Checklist: () =>
    makeSvgIcon(
      <>
        <circle cx="16" cy="16" r="11" fill="#E6F4EA" />
        <path
          d="m12.5 16.5 2.5 3 5.5-6"
          stroke="#188038"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
  Plan: () =>
    makeSvgIcon(
      <>
        <circle cx="16" cy="16" r="11" fill="#F3E8FF" />
        <path
          d="m16 9 2.2 4.3 4.8.7-3.5 3.4.8 4.8-4.3-2.2-4.3 2.2.8-4.8-3.5-3.4 4.8-.7z"
          fill="#7C3AED"
        />
      </>
    ),
  Alert: () =>
    makeSvgIcon(
      <>
        <path
          d="M16 7 27 25H5L16 7z"
          fill="#FCE8E6"
          stroke="#D93025"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <rect x="15" y="13" width="2" height="7" rx="1" fill="#D93025" />
        <rect x="15" y="22" width="2" height="2" rx="1" fill="#D93025" />
      </>
    ),
  Notify: () =>
    makeSvgIcon(
      <>
        <path
          d="M22 21h-12c0-6 2-10 6-10s6 4 6 10z"
          fill="#E8EBED"
          stroke="#5F6368"
          strokeWidth="1.5"
        />
        <path
          d="M14 24a2 2 0 0 0 4 0"
          stroke="#5F6368"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </>
    ),
};

const renderGlyph = (token: string) => {
  const renderer = iconLibrary[token] ?? iconLibrary.Doc;
  return renderer();
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
    folder: "CS 241 Workspace",
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
      icon: "Doc",
      folder: "CS 241 · Launch kit",
      owner: "me",
      modified: "May 20",
      size: "85 KB",
      meta: "Updated 10m ago · Prof. Diaz",
      tag: "Syllabus plan",
      description: "One syllabus, all deadlines, and automations in one doc.",
      status: "Schedule pack ready",
      route: "/",
    },
    {
      id: "reading",
      name: "Modern ML Systems · Chapter 4",
      type: "Google Docs",
      app: "Docs",
      icon: "Reader",
      folder: "Readings",
      owner: "me",
      modified: "May 18",
      size: "2.1 MB",
      meta: "Shared yesterday · 60-page excerpt",
      tag: "Textbook reader",
      description: "Modern ML Systems Chapter 4 with Companion overlays.",
      status: "Annotated reader ready",
      route: "/doc",
    },
    {
      id: "notes",
      name: "Neural Net Notes",
      type: "Google Docs",
      app: "Docs",
      icon: "Notes",
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
      icon: "Sheet",
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
      icon: "Doc",
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
      icon: "Trend",
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
      icon: "Calendar",
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
    "One syllabus mapped to Drive folders, Tasks, and Calendar.",
    "Deadlines sync with buffers and commute windows already set.",
    "Study packs grouped by assignment weight with owner tags.",
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
        "I noticed this reading matches your Week 4 topic. Want me to bundle it?",
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
        "Your schedule looks packed. Want help rebalancing the afternoon?",
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
      message: "Deadline in 3 days. Should I draft a status brief?",
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
    text: "Doc CS 241 Plan (Docs) is up. I can spin a Sheets tracker or share the Slides summary whenever you’re ready.",
    linkLabel: "Jump to CS 241 Plan",
    linkTo: "/doc/syllabus",
  },
  {
    triggers: ["reading pack", "reader", "pdf"],
    persona: "student",
    fileId: "reading",
    text: "Notes Smart Reading Pack already condensed the Modern ML Systems excerpt → 1-page Docs brief + Slides deck + Sheets flashcards.",
    linkLabel: "Open annotated reader",
    linkTo: "/doc/reading",
  },
  {
    triggers: ["concept map", "notes"],
    persona: "student",
    fileId: "notes",
    text: "Insight Neural Net Notes are linked to lecture audio. Want me to spotlight a risky branch in the Slides concept map?",
    linkLabel: "Open Living Map",
    linkTo: "/doc/notes",
  },
  {
    triggers: ["meeting recap", "cx sync", "chief of staff"],
    persona: "professional",
    fileId: "meeting",
    text: "Doc CX Sync Doc is ready. Summary, decisions, and owners are staged. Should I drop the Gmail recap in drafts?",
    linkLabel: "Review CX Sync Doc",
    linkTo: "/doc/meeting",
  },
  {
    triggers: ["vendor", "executive brief", "dashboard"],
    persona: "professional",
    fileId: "vendor",
    text: "Sheet Vendor KPIs Slides became an exec brief with talking points + mitigation steps. Ready for leadership?",
    linkLabel: "Open Vendor KPIs",
    linkTo: "/doc/vendor",
  },
  {
    triggers: ["calendar", "focus block", "rhythm"],
    persona: "professional",
    fileId: "calendar",
    text: "Calendar Calendar Pulse flagged the overload. I can insert a focus block and ping the attendees automatically.",
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
    subtitle: "Turns course syllabi into weekly, auto-updated study paths.",
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
    subtitle: "Condenses long readings into slides, flashcards, and briefs.",
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
    subtitle: "Links lectures, labs, and flashcards into one living map.",
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
    subtitle: "Captures every meeting with decisions, owners, and recaps ready.",
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
    subtitle: "Distills live data into executive decks, KPIs, and risk alerts.",
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
    subtitle: "Protects scheduled focus time the moment calendars overload.",
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
    icon: "Focus",
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
    icon: "Library",
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
    icon: "Insight",
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
    icon: "Checklist",
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
    icon: "Trend",
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
    icon: "Calendar",
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
      time: "3:00 to 4:00 PM",
      title: "Week 3 Reading Sprint",
      meta: "Slides + flashcards auto-prepped",
      status: "Focus block",
      color: "blue",
      location: "Library · Quiet room",
      startMinutes: 15 * 60,
      endMinutes: 16 * 60,
      source: "companion",
    },
    {
      id: "cal-7",
      day: "Mon",
      time: "5:30 to 6:00 PM",
      title: "Reflection buffer",
      meta: "Companion logged journaling + review prompts.",
      status: "AI hold",
      color: "orange",
      location: "Dorm · Desk",
      startMinutes: 17 * 60 + 30,
      endMinutes: 18 * 60,
      source: "companion",
    },
    {
      id: "cal-8",
      day: "Mon",
      time: "6:15 to 7:00 PM",
      title: "Slides polish",
      meta: "Auto pulled notes + figures to prep deck.",
      status: "Auto reminder",
      color: "blue",
      location: "Drive workspace",
      startMinutes: 18 * 60 + 15,
      endMinutes: 19 * 60,
      source: "companion",
    },
    {
      id: "cal-2",
      day: "Tue",
      time: "9:30 to 10:15 AM",
      title: "Lab 02 reflection",
      meta: "Companion added checklist",
      status: "Auto reminder",
      color: "pink",
      location: "Engineering Lab",
      startMinutes: 9 * 60 + 30,
      endMinutes: 10 * 60 + 15,
      source: "manual",
    },
    {
      id: "cal-3",
      day: "Thu",
      time: "1:00 to 2:00 PM",
      title: "Midterm cadence review",
      meta: "Risk detection on track",
      status: "Calendar hold",
      color: "green",
      location: "Zoom · link ready",
      startMinutes: 13 * 60,
      endMinutes: 14 * 60,
      source: "companion",
    },
  ],
  professional: [
    {
      id: "cal-4",
      day: "Mon",
      time: "11:00 to 11:45 AM",
      title: "CX Weekly Sync",
      meta: "Recap + actions drafted",
      status: "Summary ready",
      color: "blue",
      location: "Meet · Conf Room C",
      startMinutes: 11 * 60,
      endMinutes: 11 * 60 + 45,
      source: "manual",
    },
    {
      id: "cal-9",
      day: "Mon",
      time: "12:10 to 12:30 PM",
      title: "Commute buffer",
      meta: "Traffic watch flagged shuttle delays.",
      status: "AI hold",
      color: "pink",
      location: "HQ shuttle",
      startMinutes: 12 * 60 + 10,
      endMinutes: 12 * 60 + 30,
      source: "companion",
    },
    {
      id: "cal-10",
      day: "Mon",
      time: "1:00 to 1:30 PM",
      title: "Deck review focus",
      meta: "Doc notes + Slides links pinned automatically.",
      status: "Focus block",
      color: "green",
      location: "Desk · War room",
      startMinutes: 13 * 60,
      endMinutes: 13 * 60 + 30,
      source: "companion",
    },
    {
      id: "cal-5",
      day: "Tue",
      time: "2:30 to 3:00 PM",
      title: "Vendor risk briefing",
      meta: "Exec brief queued",
      status: "Prep now",
      color: "orange",
      location: "Hangouts · Vendor Ops",
      startMinutes: 14 * 60 + 30,
      endMinutes: 15 * 60,
      source: "manual",
    },
    {
      id: "cal-6",
      day: "Thu",
      time: "4:00 to 5:00 PM",
      title: "Focus block",
      meta: "Companion protected time",
      status: "Focus block",
      color: "green",
      location: "Calendar hold",
      startMinutes: 16 * 60,
      endMinutes: 17 * 60,
      source: "companion",
    },
  ],
};

const calendarThreadSeed: CalendarChatMessage[] = [
  {
    id: "calendar-msg-1",
    role: "agent",
    author: "Companion",
    stamp: "07:42 AM",
    tag: "Auto hold",
    text: "I protected 3:00 to 3:45 PM for deck polish since the CX deck is due at 5.",
    detail: "Invite list updated + Slides link pinned to the block.",
    action: "See hold",
  },
  {
    id: "calendar-msg-2",
    role: "user",
    author: "You",
    stamp: "07:44 AM",
    tag: "Reply",
    text: "Can you move the vendor briefing earlier so I can keep that hold?",
  },
  {
    id: "calendar-msg-3",
    role: "agent",
    author: "Companion",
    stamp: "07:45 AM",
    tag: "Reschedule",
    text: "Done. Vendor Ops accepted 2:15 to 2:45 PM; I posted the update and attached the exec brief.",
    detail: "Travel buffer recalculated. Want me to notify Maya?",
    action: "Notify Maya",
  },
  {
    id: "calendar-msg-4",
    role: "agent",
    author: "Companion",
    stamp: "09:10 AM",
    tag: "Buffer",
    text: "Traffic is heavy between HQ and the robotics lab. I staged a 12 min shuttle hold before standup.",
    detail: "Accept to keep the lab demo on time.",
    action: "Accept buffer",
  },
];

const documentCanvases: Record<string, DocumentCanvas> = {
  syllabus: {
    title: "CS 241 Syllabus: AI assisted annotations",
    subtitle:
      "Companion aligned every requirement into one unified course plan.",
    status: "Schedule pack live",
    courseLabel: "CS 241 · Systems Programming",
    sections: [
      {
        id: "kickoff",
        heading: "Kickoff timeline",
        excerpt:
          "Orientation lectures, lab onboarding, and the first studio sync all happen in Week 1. Companion extracted every date from the PDF and turned them into a real plan so the course feels cohesive instead of a handout.",
        insight:
          "Sprint milestones became an actionable checklist synced across Tasks and Calendar.",
        action:
          "Pin this checklist to the dashboard so everyone stays on pace.",
      },
      {
        id: "cadence",
        heading: "Weekly cadence",
        excerpt:
          "Readings publish Sunday night, reflections are due Thursday, and studio deliverables ship Monday mornings. Companion mapped each stream to Drive folders so every artifact lives in one workspace.",
        insight:
          "Study blocks already land on Tuesday + Thursday nights to match the reflection cadence.",
        action:
          "Need to shift when labs slip? Ask Companion to move the Tuesday block.",
      },
      {
        id: "grading",
        heading: "Assessment plan",
        excerpt:
          "Projects weigh 45%, labs 35%, exams 20%, participation ±3%. Companion pulled the rubric into this doc so weighting sits beside assignments instead of in an appendix.",
        insight:
          "Each artifact now carries its weighting, letting reminders and nudges escalate appropriately.",
        action:
          "Open the dashboard to see how prep time tracks against weighting.",
      },
      {
        id: "automation",
        heading: "Automation checklist",
        excerpt:
          "Capstone reviews, mentor meetings, and demo days already have folders, templates, and owner tags. Companion links each automation to the same CS 241 workspace so no one chases separate links.",
        insight:
          "Every milestone was mirrored into Tasks and Calendar with ownership tags.",
        action:
          "Invite the teaching team so ownership shows up everywhere automatically.",
      },
    ],
    inlineTips: [
      "Calendar holds include buffers for commute windows or travel days.",
      "Weekly Drive folders ship with Docs and Slides templates attached.",
      "Reading packets automatically trigger flashcard + Slides summaries.",
    ],
  },
  reading: {
    title: "Modern ML Systems: Chapter 4 (Annotated)",
    subtitle: "60-page textbook excerpt with Companion overlays and AI notes.",
    status: "Summary + flashcards ready",
    sections: [
      {
        id: "pages14",
        heading: "Pages 14 to 18 · Attention primer",
        excerpt:
          "The doc preview shows the actual Chapter 4 paragraphs (Diaz 2024, pp. 14‑18) with pagination intact so it feels like a textbook PDF. Companion pins eq. (4.2) and the “vanishing gradient” caution with gold annotation pills.",
        insight:
          "Highlights live directly on the scanned text with references back to the lab assignments.",
        action:
          "Jump to the page 14 highlight or export this section to Slides.",
      },
      {
        id: "lab-map",
        heading: "Lab variable mapping (Pages 22 to 27)",
        excerpt:
          "Blue tags such as “Lab 03 · alpha_s” sit on top of the real text wherever the rubric variables appear. Companion preserves line numbers so you can cite the textbook without leaving the preview.",
        insight:
          "Callouts list the paragraph + line number Companion scraped, making lab write-ups citation-ready.",
        action:
          "Send these callouts to the lab tracker or ask for deeper context.",
      },
      {
        id: "figures",
        heading: "Annotated figures + captions overview",
        excerpt:
          "Figures 4.3, 4.7, and 4.9 render exactly like the book, but Companion layers caption cards explaining gradient spikes, axis normalisation, and phrases to reuse in reflections.",
        insight:
          "AI annotations pair each figure with a one-sentence takeaway tied to the Week 3 rubric.",
        action: "Open the annotated figure pack or request a Loom walkthrough.",
      },
      {
        id: "discussion",
        heading: "Seminar + chapter summary wrap",
        excerpt:
          "Pages 56‑60 close the chapter with the canonical summary, and Companion injects seminar prompts, Chen 2025 counter-arguments, and inline notes while keeping the textbook layout intact.",
        insight:
          "Prompts mirror into flashcards and a Slides deck for rehearsal.",
        action:
          "Send the prompts to Gmail or drop them into the Slides discussion deck.",
      },
    ],
    inlineTips: [
      "Flashcards already staged in Slides and Sheets with textbook citations embedded.",
      "Say “Open reading flashcards” to load this gallery in the chat panel.",
      "Use Mark as reviewed once each section is summarised so Companion tracks progress.",
    ],
    flashcards: [
      {
        id: "reading-fc-abstract",
        tag: "Concept",
        sectionId: "pages14",
        prompt:
          "What’s the key takeaway from the Chapter 4 attention primer (pp.14-18)?",
        answer:
          "Attention behaves like a probability distribution over token positions; tuning it raised focus scores 11% and the Notes flag eq. (4.2) for referencing.",
      },
      {
        id: "reading-fc-lab",
        tag: "Lab setup",
        sectionId: "lab-map",
        prompt:
          "Where does the textbook introduce α_s and why does Lab 03 care when submitting the lab memo?",
        answer:
          "Pages 22-24 tie α_s to stability checks; Companion tags every mention so the lab rubric references are one click away.",
      },
      {
        id: "reading-fc-figure",
        tag: "Figure 4.7",
        sectionId: "figures",
        prompt:
          "How should you describe the gradient spike in Figure 4.7 when you brief the team?",
        answer:
          "Note the collapse after seven iterations and the normalised y-axis; Companion’s caption suggests citing page 33 when writing reflections.",
      },
      {
        id: "reading-fc-discussion",
        tag: "Seminar",
        sectionId: "discussion",
        prompt:
          "What counter-argument does Chen 2025 raise in the chapter wrap when the seminar pushes back?",
        answer:
          "Chen says the uplift is dataset-specific; Companion attaches that citation plus a follow-up question about regularisation strength.",
      },
    ],
    flashcardDeckLink: "https://slides.google.com/readings-week3",
    flashcardDeckLabel: "Open Slides flashcards",
  },
  notes: {
    title: "Lecture Notes: Neural Nets",
    subtitle: "Living concept map overlays the doc with linked ideas.",
    status: "Concept map refreshed",
    courseLabel: "ML 241 · Machine Learning Studio",
    conceptMapNarrative:
      "Companion minted this concept map straight from lecture audio, readings, and labs. Nodes stay clickable inside Docs, and the Canvas view mirrors this layout in Slides for collaboration.",
    sections: [
      {
        id: "chain",
        heading: "Voice capture → ML concept node",
        excerpt:
          "Lecture 5 (ML foundations) is transcribed line-by-line with timestamps and whiteboard screenshots. Margin badges point each paragraph back to the concept map plus the Week 3 reading reference so neural-net theory never drifts from context.",
        insight:
          "Companion stitches audio, notes, and readings so the page feels like a living workspace.",
        action:
          "Play the snippet or ask Companion to expand this ML node in Slides.",
      },
      {
        id: "map",
        heading: "Concept map overlay",
        excerpt:
          "Inline pills for Input Layer, Gradient Risk, and Seminar prompts live directly on the doc. Selecting one jumps to the concept map node and reveals the exact ML readings, labs, and tasks tied to that concept.",
        insight:
          "Nodes show upstream and downstream dependencies so study groups know what to review next.",
        action:
          "Open the concept map or share this branch with your teammates.",
      },
      {
        id: "review",
        heading: "Weekly wrap + automations",
        excerpt:
          "Companion closes the doc with a narrative summary, open questions, and office hours. Risk badges attach to ML nodes that still need attention while automation chips show where reminders were scheduled.",
        insight:
          "Concept map nodes double as Tasks so finishing a block updates Drive + Calendar automatically.",
        action:
          "Mark this review as done or ask for spaced repetition prompts.",
      },
    ],
    inlineTips: [
      "Concept map nodes carry citations back to ML readings, labs, and exam packs.",
      "Audio snippets stay playable even when the doc is full screen.",
      "Use Highlight links to show every node connected to Lab 03.",
    ],
    conceptMapNodes: [
      {
        id: "concept-audio",
        title: "Backprop audio chain",
        summary:
          "Lecture 5 snippet (03:12) translated into structured ML notes with Diaz 2024 citations so you can quote it anywhere.",
        connections: ["Reading · Figure 4", "Lab 03 rubric"],
        status: "Synced",
      },
      {
        id: "concept-gradient",
        title: "Gradient risk alert",
        summary:
          "Highlights where gradients collapse after seven iterations and mirrors the risk Companion caught in the ML reading pack.",
        connections: ["Week 3 checklist", "Exam prep deck"],
        status: "Flagged",
      },
      {
        id: "concept-review",
        title: "Weekly review node",
        summary:
          "Narrative summary, open questions, and owners sit here so the study group knows who is doing what.",
        connections: ["Office hours", "Slides recap"],
        status: "Shared",
      },
      {
        id: "concept-seminar",
        title: "Seminar prompts",
        summary:
          "Discussion prompts map to Chen 2025 counter-arguments and are linked to flashcards for quick rehearsal.",
        connections: ["Seminar doc", "Flashcards"],
        status: "Ready",
      },
    ],
    conceptMapLink: "https://slides.google.com/concept-map-week3",
    conceptMapLabel: "Open Slides map",
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
          "Volume down 8% WoW, EU beta remains greenlit, and onboarding SLA risk triggered an escalation. Companion stitched the transcript, decisions, and attachments into narrative paragraphs with owners + timestamps so it reads like a consultant-grade recap.",
        insight:
          "Companion drafted the exec summary with KPIs, decisions, and links to the supporting docs.",
        action:
          "Send the recap to leadership or push it to Spaces for async consumption.",
      },
      {
        id: "memory",
        heading: "Organisational memory",
        excerpt:
          "Last sync’s vendor audit follow-up and Q2 KPI roll-over are restated verbatim so nobody loses context. Prior decisions are quoted inline with links back to last week's doc, making this feel like the canonical team memory you can forward to an exec.",
        insight:
          "Companion asks “Carry forward last quarter’s KPIs and attach to this recap?”",
        action:
          "Insert prior KPIs with one click or let Companion refresh the data from Sheets.",
      },
      {
        id: "owners",
        heading: "Owner matrix",
        excerpt:
          "Action items appear in full sentences with owner, due date, dependency, and linked artifacts (Drive, Tasks, Asana). Each owner’s name jumps to their workspace so context travels with them.",
        insight:
          "Companion auto-tagged owners, notified them in Tasks, and staged a digest email.",
        action:
          "Review the digest or ask Companion to reschedule / reassign right here.",
      },
    ],
    inlineTips: [
      "Action items sync to Google Tasks with context links and due dates.",
      "Calendar holds update automatically when owners change deadlines.",
      'Say "Highlight risks" to have Companion annotate blocker paragraphs in red for exec review.',
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

const cs241CompanionChat: ChatEntry[] = [
  {
    role: "agent",
    richText: (
      <div className="chat-rich">
        <p className="chat-rich-label">CS 241 workspace</p>
        <p className="chat-rich-xl">
          I pulled every CS 241 requirement into one workspace so Docs, Sheets,
          and Slides share context.
        </p>
        <p className="chat-rich-small">
          Calendar holds, Tasks, and Drive folders are already linked. Ask me to
          adjust cadence, grading, or push updates.
        </p>
      </div>
    ),
  },
  {
    role: "user",
    text: "Amazing. Can you walk me through the weekly cadence you set up?",
  },
  {
    role: "agent",
    richText: (
      <div className="chat-rich">
        <p className="chat-rich-title">Weekly cadence preview</p>
        <ul className="chat-rich-list">
          <li>
            <strong>Week 1</strong> Fundamentals review with three labs queued
            on Tuesday.
          </li>
          <li>
            <strong>Week 2</strong> Lab checkoffs plus partner project pitch
            rehearsal on Thursday.
          </li>
          <li>
            <strong>Week 3</strong> Systems sprint with midterm warmup tasks
            highlighted.
          </li>
        </ul>
        <p className="chat-rich-small">
          I can lighten or intensify any block and push the refresh to Calendar
          once you confirm.
        </p>
      </div>
    ),
  },
  {
    role: "user",
    text: "Looks good. How are you tracking grading coverage across assignments?",
  },
  {
    role: "agent",
    richText: (
      <div className="chat-rich">
        <p className="chat-rich-title">Grading coverage</p>
        <div className="chat-rich-metric-row">
          <div className="chat-rich-metric">
            <strong>40%</strong>
            <span>Labs auto rubric</span>
          </div>
          <div className="chat-rich-metric">
            <strong>35%</strong>
            <span>Project checkpoints</span>
          </div>
          <div className="chat-rich-metric">
            <strong>25%</strong>
            <span>Exam briefs</span>
          </div>
        </div>
        <p className="chat-rich-small">
          Rubric notes stay in Sheets and I can push a Slides recap for
          instructors whenever you ask.
        </p>
      </div>
    ),
  },
  {
    role: "user",
    text: "Any risk flags or calendar holds I should know about right now?",
  },
  {
    role: "agent",
    richText: (
      <div className="chat-rich">
        <p className="chat-rich-title">Calendar and risk watch</p>
        <p className="chat-rich-lede">
          Two holds already exist: Tuesday 9 AM lab prep and Friday 2 PM focus
          block.
        </p>
        <ul className="chat-rich-list">
          <li>
            <strong>Backlog alert</strong> Lab 02 reflection trending 18 hours
            late for three students.
          </li>
          <li>
            <strong>Support</strong> Vendor tutoring slot open Thursday 3 PM if
            you want it auto booked.
          </li>
        </ul>
        <p className="chat-rich-small">
          Say the word and I will rebalance workload and post the update to
          Calendar and Tasks.
        </p>
      </div>
    ),
  },
];

const initialChat = (file?: DriveFile): ChatEntry[] => {
  if (file?.id === "syllabus") {
    return cs241CompanionChat;
  }

  return [
    {
      role: "agent",
      text: file
        ? `I’m already working on ${file.name}. Want the schedule, summary, or risk view?`
        : "I’m watching your Drive for anything that needs action.",
    },
  ];
};

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
        text: "I’m keeping CS 241 synced across Docs, Calendar, and Sheets. Want the course plan, reading summary, or exam pack?",
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
    if (pendingFileId || tourActive) return;
    const first = driveFiles[persona][0];
    setSelectedFileId(first.id);
    setDocCanvasOpen(false);
  }, [persona, pendingFileId, tourActive]);

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

  useEffect(() => {
    if (!selectedFile) return;
    const fileSwitchText =
      selectedFile.id === "syllabus"
        ? "Refreshing the CS 241 plan. Ask me to tweak the cadence, grading focus, or push updates to Calendar."
        : `Switched focus to ${selectedFile.name}. Ask me to open it in ${selectedFile.type}, sync it to Calendar, or prep a recap.`;
    setChatHistory((prev) => {
      const personaHistory = prev[persona];
      const lastEntry = personaHistory[personaHistory.length - 1];
      if (lastEntry?.text === fileSwitchText) {
        return prev;
      }
      return {
        ...prev,
        [persona]: [
          ...personaHistory,
          {
            role: "agent",
            text: fileSwitchText,
          },
        ],
      };
    });
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
      setPendingFileId(step.fileId);
      setPersona(step.persona);
      setDocCanvasOpen(false);
    }
  };

  const renderTourCarousel = () => {
    const chipsDisabled = !tourActive;
    return (
      <div className="tour-chip-row" ref={tourTrackRef}>
        {demoSteps.map((step, index) => {
          const isActive = activeDemoStep?.id === step.id;
          const isStudent = step.persona === "student";
          return (
            <button
              key={step.id}
              type="button"
              className={`tour-chip-card ${isActive ? "active" : ""} ${
                isStudent ? "student" : "pro"
              } ${chipsDisabled ? "disabled" : ""}`}
              onClick={
                chipsDisabled ? undefined : () => focusTourStep(index, step)
              }
              aria-pressed={isActive}
              aria-disabled={chipsDisabled}
              disabled={chipsDisabled}
            >
              <span className="tour-chip-pill">
                {isStudent ? "Student Student" : "Pro Professional"}
              </span>
              <strong>{step.title}</strong>
              <small>{step.subtitle}</small>
            </button>
          );
        })}
      </div>
    );
  };
  const shouldShowTourNav = tourActive || location.pathname === "/";
  const renderTourNav = () => {
    if (!shouldShowTourNav) return null;
    const guidedStep = tourActive && currentTourStep ? currentTourStep : null;
    return (
      <nav
        className={`tour-nav compact ${tourCollapsed ? "collapsed" : ""} ${
          tourActive ? "active" : ""
        }`}
      >
        <div className="tour-compact">
          <div className="tour-compact-meta">
            <div className="tour-meta-label-row">
              <span className="tour-label">Companion tour</span>
              <span className="tour-label-note">
                Interactive high-fidelity preview; limited scope, best fullscreen on
                desktop.
              </span>
            </div>
            <strong>
              {guidedStep?.title ?? "Jump between signature scenarios"}
            </strong>
            <p>
              {guidedStep?.subtitle ??
                "Tap a card to open student or pro flows without leaving the demo."}
            </p>
          </div>
          <div className="tour-compact-actions">
            {guidedStep ? (
              <>
                <div className="tour-primary-actions">
                  <button
                    type="button"
                    className="ghost subtle"
                    onClick={handleTourPrev}
                    disabled={tourStepIndex === 0}
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    className="ghost subtle"
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
                      : "Next scenario"}
                  </button>
                </div>
                <div className="tour-secondary-actions">
                  <button
                    type="button"
                    className="ghost subtle tour-collapse-btn"
                    onClick={() => setTourCollapsed((prev) => !prev)}
                  >
                    {tourCollapsed ? "Expand" : "Collapse"}
                  </button>
                  <button
                    type="button"
                    className="tour-exit-btn"
                    onClick={exitTour}
                  >
                    Exit tour
                  </button>
                </div>
              </>
            ) : (
              <div className="tour-primary-actions">
                <button type="button" className="primary" onClick={startTour}>
                  Play guided tour
                </button>
                <button
                  type="button"
                  className="ghost subtle tour-collapse-btn"
                  onClick={() => setTourCollapsed((prev) => !prev)}
                >
                  {tourCollapsed ? "Expand" : "Collapse"}
                </button>
              </div>
            )}
          </div>
        </div>
        {!tourCollapsed && (
          <>
            <div className="tour-track">
              <button
                type="button"
                className="tour-arrow"
                aria-label="Scroll tour left"
                onClick={() => scrollTour("left")}
              >
                ←
              </button>
              {renderTourCarousel()}
              <button
                type="button"
                className="tour-arrow"
                aria-label="Scroll tour right"
                onClick={() => scrollTour("right")}
              >
                →
              </button>
            </div>
            {guidedStep ? (
              <div className="tour-mini-highlights">
                {guidedStep.highlights.map((point) => (
                  <span key={`mini-${point}`}>{point}</span>
                ))}
              </div>
            ) : null}
          </>
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
            prompt: "My afternoon is overloaded. Rebalance it for me.",
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
    return "I’m still watching Drive. Ask me about Docs, Sheets, or Slides anytime.";
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
      ? "Student workspace is synced. I can spin up study plans, reading packs, or exam trackers directly from Drive."
      : "Professional workspace stays aligned. Slides briefs, Gmail recaps, and Sheets KPIs are ready on cue.";
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
                decks, and Sheets flashcards. All auto linked back to Drive.
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
          { block: "Mon 3 to 4 PM", focus: "Past exams", status: "Scheduled" },
          { block: "Wed 9 to 11 AM", focus: "Problem reps", status: "Auto" },
          { block: "Fri 2 to 3 PM", focus: "Concept map review", status: "Open" },
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
          "Finalize CX rollout brief · Maya · Tue",
          "Update onboarding decks · Leo · Thu",
          "Share retention spike analysis · Priya · Fri",
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
                Google Slides decks become executive briefs automatically.
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
                Deadline in 3 days. Should I draft a status brief?
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
            slot: "3 to 4 PM",
            note: "Protected focus block",
            status: "Recommended",
          },
          {
            slot: "4 to 4:30 PM",
            note: "Buffer before Vendor review",
            status: "Auto",
          },
          { slot: "5 to 5:30 PM", note: "Walk + audio recap", status: "Optional" },
        ];
        return (
          <>
            <div className="section-card hero">
              <h4>Work Rhythm Optimiser</h4>
              <p>
                Google Sheets workload + Calendar density combine to spot
                overload instantly. Companion proposes focus blocks for you.
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
                <li>“Your schedule looks packed. Want help rebalancing?”</li>
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
      {filesForPersona.map((file) => {
        const destination = getRouteForFile(file.id);
        return (
          <Link
            key={file.id}
            className={`recent-card ${
              file.id === selectedFile?.id ? "active" : ""
            }`}
            to={destination}
            onClick={() => {
              setSelectedFileId(file.id);
              setDocCanvasOpen(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <div className="recent-body">
              <div className="recent-content">
                <div className="recent-header">
                  <div className="recent-title">
                    <strong>{file.name}</strong>
                    <span className="recent-folder">{file.folder}</span>
                  </div>
                  <span className="recent-tag">{file.app}</span>
                </div>
                <p className="recent-description">{file.description}</p>
              </div>
              <div className="recent-footer">
                <div className="recent-meta">
                    <span>
                      <small className="recent-meta-label">Folder</small>
                      <span className="recent-meta-value">{file.folder}</span>
                    </span>
                    <span>
                      <small className="recent-meta-label">Owner</small>
                      <span className="recent-meta-value">{file.owner}</span>
                    </span>
                    <span>
                      <small className="recent-meta-label">Updated</small>
                      <span className="recent-meta-value">{file.modified}</span>
                    </span>
                    <span>
                      <small className="recent-meta-label">Size</small>
                      <span className="recent-meta-value">{file.size}</span>
                    </span>
                </div>
                <div className="recent-status">
                  <span>{file.tag}</span>
                  <strong>{file.status}</strong>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );

  const renderDocumentCanvas = () => {
    const doc = documentCanvases[selectedFile?.id || ""];
    const personaCalendarEntries = calendarEntries[persona];
    const appLaunchRoute = getRouteForFile(selectedFile?.id);
    const appLaunchLabel = getAppLaunchLabel(selectedFile);
    const calendarTimelineDay = personaCalendarEntries[0]?.day ?? "Mon";
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
            <div className="calendar-mode-main">
              <CalendarWeekGallery
                entries={personaCalendarEntries}
                size="large"
              />
              <CalendarDayTimeline
                entries={personaCalendarEntries}
                dayLabel={calendarTimelineDay}
              />
            </div>
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
              <p>Ask Companion even in full screen.</p>
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
            <div className="chat-content">
              {entry.richText ?? <span>{entry.text ?? ""}</span>}
            </div>
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
          <div className="drive-logo">
            <img src={companionMark} alt="Drive Companion" />
          </div>
          <span>Drive Companion</span>
        </div>
        <div className="search-box">
          <span className="search-icon" aria-hidden="true">
            <svg viewBox="0 0 20 20" fill="none">
              <circle
                cx="9"
                cy="9"
                r="5"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="m12.5 12.5 4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <input placeholder="Search in Drive" />
        </div>
        <div className="google-right">
          <button className="icon-btn">Help</button>
          <button className="icon-btn">Settings</button>
          <div className="persona-toggle">
            <button
              className={persona === "student" ? "active" : ""}
              onClick={() => setPersona("student")}
            >
              Student
            </button>
            <button
              className={persona === "professional" ? "active" : ""}
              onClick={() => setPersona("professional")}
            >
              Pro
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
                    <span className="usecase-icon" aria-hidden="true">
                      {renderGlyph(card.icon)}
                    </span>
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
                        <div className="file-icon" aria-hidden="true">
                          {renderGlyph(file.icon)}
                        </div>
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
                      <span>
                        <small className="file-footer-label">Folder</small>
                        <span className="file-footer-value">{file.folder}</span>
                      </span>
                      <span>
                        <small className="file-footer-label">Owner</small>
                        <span className="file-footer-value">{file.owner}</span>
                      </span>
                      <span>
                        <small className="file-footer-label">Updated</small>
                        <span className="file-footer-value">{file.modified}</span>
                      </span>
                      <span>
                        <small className="file-footer-label">Size</small>
                        <span className="file-footer-value">{file.size}</span>
                      </span>
                    </div>
                    <div className="file-status-row">
                      <span>{file.status}</span>
                      <Link className="text-link" to={`/doc/${file.id}`}>
                        Open companion preview
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
                  ? "Upcoming exam kept in view. No cramming surprises."
                  : "Schedule overload detected. Focus block ready to insert."}
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
                  Live Google Calendar preview. Companion keeps it in sync.
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
                    <div
                      className={`suggestion-icon ${tip.tone}`}
                      aria-hidden="true"
                    >
                      {renderGlyph(
                        tip.tone === "alert"
                          ? "Alert"
                          : tip.tone === "plan"
                          ? "Plan"
                          : "Notify"
                      )}
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

      <Link className="floating-chat" to="/companion">
        <span className="floating-chat-chip">Live</span>
        <span>Chat with Companion</span>
      </Link>

      {docCanvasOpen && (
        <div className="doc-overlay">
          <div className="doc-modal">{renderDocumentCanvas()}</div>
        </div>
      )}

      {voiceModeOpen && (
        <div className="voice-modal">
          <div className="voice-modal-content">
            <h3>Voice Mode</h3>
            <p>Coming soon. Simulated voice command.</p>
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
            Student Student workspace
          </button>
          <button
            className={persona === "professional" ? "active" : ""}
            onClick={() => setPersona("professional")}
          >
            Pro Professional workspace
          </button>
        </div>
      </section>
      <div className="companion-meta-row">
        <div className="companion-meta">
          <div className="companion-meta-pill">
            <span className="companion-meta-label">Folder</span>
            <strong>{personaConfig[persona].folder}</strong>
          </div>
          <div className="companion-meta-pill">
            <span className="companion-meta-label">Focus</span>
            <strong>
              {selectedFile ? selectedFile.name : "Recent Drive files"}
            </strong>
          </div>
        </div>
        <span className="companion-meta-status">
          <span className="status-dot" aria-hidden="true" />
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
            <div className="chat-meta-item">
              <span className="chat-meta-label">Folder</span>
              <strong>{personaConfig[persona].folder}</strong>
            </div>
            <div className="chat-meta-item">
              <span className="chat-meta-label">Focus</span>
              <strong>
                {selectedFile ? selectedFile.name : "Recent Drive files"}
              </strong>
            </div>
          </div>
          <div className="chat-stack large">
            <div className="chat-feed">
              {globalChatHistory[persona].map((entry, index) => (
                <div
                  key={`central-${entry.role}-${index}`}
                  className={`chat-bubble ${entry.role}`}
                >
              <div className="chat-content">
                {entry.richText ?? <span>{entry.text ?? ""}</span>}
              </div>
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
          <div className="chat-context-grid">
            <article className="chat-context-card">
              <span className="chat-context-chip">Workspace</span>
              <h5>{personaConfig[persona].folder}</h5>
              <p>{personaConfig[persona].narrative}</p>
              <small>{personaConfig[persona].status}</small>
            </article>
            <article className="chat-context-card highlight">
              <span className="chat-context-chip">
                {selectedFile?.app ?? "Docs"}
              </span>
              <h5>{selectedFile?.name ?? "Pick a file to focus"}</h5>
              <p>
                {selectedFile?.description ??
                  "Choose any doc to see Companion stage inline annotations, recaps, and automations here."}
              </p>
              <small>{selectedFile?.status ?? "Standing by"}</small>
            </article>
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
                    <span className="quick-switch-icon" aria-hidden="true">
                      {renderGlyph(file.icon)}
                    </span>
                    <span className="quick-switch-label">{file.name}</span>
                  </button>
                  <span className="quick-switch-status">{file.status}</span>
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
                      {renderGlyph(
                        tip.tone === "alert"
                          ? "Alert"
                          : tip.tone === "plan"
                          ? "Plan"
                          : "Notify"
                      )}
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
        <Link
          key={file.id}
          className="demo-card"
          to={getRouteForFile(file.id)}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <div className="demo-card-head">
            <span className="demo-app">{file.app}</span>
            <strong>{file.name}</strong>
          </div>
          <small>{file.description}</small>
          <span className="demo-card-cta">
            Open {file.app === "Docs" ? "doc" : file.app}
          </span>
        </Link>
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
        <Link
          key={file.id}
          className="demo-card"
          to={getRouteForFile(file.id)}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <div className="demo-card-head">
            <span className="demo-app">{file.app}</span>
            <strong>{file.name}</strong>
          </div>
          <small>{file.description}</small>
          <span className="demo-card-cta">
            Open {file.app === "Docs" ? "doc" : file.app}
          </span>
        </Link>
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
  const conceptMapNodeCount = doc?.conceptMapNodes?.length ?? 0;
  const conceptMapConnectionNames = doc?.conceptMapNodes
    ? Array.from(
        new Set(
          doc.conceptMapNodes.flatMap((node) => node.connections ?? [])
        )
      )
    : [];
  const conceptMapConnectionCount = conceptMapConnectionNames.length;
  const conceptMapChipNames = conceptMapConnectionNames.slice(0, 4);
  const conceptMapChipOverflow =
    conceptMapConnectionCount - conceptMapChipNames.length;
  const conceptMapSampleNodes =
    doc?.conceptMapNodes?.slice(0, 3).map((node) => ({
      ...node,
      previewConnections: node.connections.slice(0, 2),
    })) ?? [];
  const filePersona: Persona = driveFiles.student.some(
    (item) => item.id === file?.id
  )
    ? "student"
    : "professional";
  const [chatDocked, setChatDocked] = useState(true);
  const [focusedSection, setFocusedSection] = useState<string | null>(null);
  const [emailDraftOpen, setEmailDraftOpen] = useState(false);
  const [flashcardRevealMap, setFlashcardRevealMap] = useState<
    Record<string, boolean>
  >({});
  const [calendarChatHistory, setCalendarChatHistory] =
    useState<CalendarChatMessage[]>(calendarThreadSeed);
  const [calendarChatPrompt, setCalendarChatPrompt] = useState("");
  const buildDocChatSamples = (): ChatEntry[] => {
    if (file?.id === "notes") {
      return [
        {
          role: "user",
          text: "Can you highlight every node tied to Lab 03? I need those citations.",
        },
        {
          role: "agent",
          text: "Done. Input Layer + Gradient Risk nodes glow in the doc and I attached Diaz 2024 page refs to your Lab 03 draft.",
          linkLabel: "Jump to nodes",
          linkTo: `/doc/${fileId}#map`,
        },
        {
          role: "user",
          text: "What should I review before the seminar debate?",
        },
        {
          role: "agent",
          text: "Seminar prompts still need the Chen 2025 quote. I can pull it from the reading pack and refresh the Slides concept map + flashcards.",
        },
        {
          role: "user",
        text: "Explain why Gradient Risk connects to Input Layer. I need the rationale.",
        },
        {
          role: "agent",
        text: "Gradient Risk inherits the Input Layer audio node plus Figure 4.7 annotations. Citing pages 14 to 18 ties the concepts together. Want me to draft that summary?",
        },
        {
          role: "user",
          text: "Show me any concept that still lacks citations.",
        },
        {
          role: "agent",
          text: "Weekly Wrap is missing the Chapter 4 reference. I highlighted the section and linked the Slides branch so you can patch it.",
          linkLabel: "View Weekly Wrap",
          linkTo: `/doc/${fileId}#review`,
        },
        {
          role: "user",
          text: "And what concept should I study next if I only have 20 minutes?",
        },
        {
          role: "agent",
          text: "Focus on Seminar Prompts → it still lacks Chen 2025 context. I can queue the flashcards and move a focus block on your calendar if you want.",
        },
      ];
    }
    if (filePersona === "student") {
      return [
        {
          role: "agent",
          text: "Binder I turned the CS 241 syllabus into one living plan and pinned every deadline to Calendar + Tasks.",
          linkLabel: "Review schedule",
          linkTo: `/doc/${fileId}#cadence`,
        },
        {
          role: "user",
          text: "Move the Thursday reflection block later. I’ve got lab hours then.",
        },
        {
          role: "agent",
          text: "Done. I slid the Thursday study block to 8 PM and added a note for Prof. Diaz. Want me to send an updated plan to the team?",
        },
      ];
    }
    return [
      {
        role: "agent",
        text: "Sheet Pulled KPIs + flagged the onboarding risk in this doc. Ready to slot into Slides?",
        linkLabel: "View KPI callout",
        linkTo: `/doc/${fileId}#kpi`,
      },
      {
        role: "user",
        text: "Draft an exec recap snippet.",
      },
      {
        role: "agent",
        text: "Snippet is ready. I can drop it into Gmail or append it to Slides. Just say the word.",
      },
    ];
  };
  const handleCalendarChatSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!calendarChatPrompt.trim()) return;
    const stamp = new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
    const trimmedPrompt = calendarChatPrompt.trim();
    setCalendarChatHistory((prev) => [
      ...prev,
      {
        id: `calendar-user-${Date.now()}`,
        role: "user",
        author: "You",
        stamp,
        tag: "Note",
        text: trimmedPrompt,
      },
      {
        id: `calendar-agent-${Date.now() + 1}`,
        role: "agent",
        author: "Companion",
        stamp: "Just now",
        tag: "Follow-up",
        text: "Logged it. I can guard the block, ping attendees, or stage a recap whenever you’re ready.",
      },
    ]);
    setCalendarChatPrompt("");
  };

  const docChatSamples = buildDocChatSamples();
  const toggleFlashcardReveal = (cardId: string) => {
    setFlashcardRevealMap((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };
  const jumpToSection = (sectionId: string) => {
    setFocusedSection(sectionId);
    requestAnimationFrame(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  };

  useEffect(() => {
    if (!focusedSection) return;
    const timeout = window.setTimeout(() => setFocusedSection(null), 2500);
    return () => window.clearTimeout(timeout);
  }, [focusedSection]);

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
    const doc = documentCanvases[file.id];
    const personaCalendarEntries = calendarEntries[filePersona];
    const fileAppRoute = getRouteForFile(file.id);
    const fileAppLabel = getAppLaunchLabel(file);
    const timelineDay = personaCalendarEntries[0]?.day ?? "Mon";
    const docInsightSections = doc?.sections?.slice(0, 3) ?? [];
    const heroStats = [
      {
        id: "load",
        label: "Today’s load",
        value: "86% booked",
        helper: "Afternoon stacked",
      },
      {
        id: "risks",
        label: "Context switches",
        value: "2 risks",
        helper: "Prep vs vendor",
      },
      {
        id: "holds",
        label: "Protected time",
        value: "3 holds",
        helper: "Companion enforced",
      },
    ];
    const proactiveSuggestions = [
      {
        id: "deep-work",
        tag: "Focus hold",
        title: "Protect 3:00-4:00 PM for deck polish",
        detail:
          "Slides handoff is due by 5 PM. Companion suggests shifting the sync to async notes.",
        impact: "+45 min deep work",
        cta: "Preview hold",
      },
      {
        id: "travel-block",
        tag: "Travel buffer",
        title: "Insert buffer before robotics standup",
        detail:
          "Commute from campus to lab has spiked this week. Companion recommends a 12 min hold.",
        impact: "Avoids late arrival",
        cta: "Add buffer",
      },
      {
        id: "meeting-triage",
        tag: "Context switch",
        title: "Stack 1:1s back-to-back",
        detail:
          "Combines design + eng 1:1s with a shared deck so you can keep a clean block for writing.",
        impact: "-2 swaps today",
        cta: "Stage update",
      },
    ];
    const autopilotPlays = [
      {
        id: "buffer",
        title: "Add travel buffer",
        detail: "Hold 12 min before robotics standup commute.",
        state: "Applied",
      },
      {
        id: "lunch",
        title: "Move lunch sync",
        detail:
          "Swap lunch sync with async doc review so focus time stays intact.",
        state: "Queued",
      },
      {
        id: "doc-link",
        title: "Attach doc context",
        detail:
          "Linked Slides prep doc + notes to the 5 PM presentation block.",
        state: "Ready",
      },
    ];
    return (
      <div className="calendar-page">
        <div className="calendar-doc-toolbar">
          <div className="calendar-doc-nav">
            <Link className="ghost subtle" to="/">
              ← Dashboard
            </Link>
            <Link className="ghost subtle" to="/companion">
              Companion
            </Link>
          </div>
          <div className="calendar-doc-actions">
            <Link className="ghost app-launch" to={fileAppRoute}>
              {fileAppLabel}
            </Link>
            <button type="button" className="primary light">
              Protect focus time
            </button>
          </div>
        </div>
        <header className="calendar-doc-hero">
          <div className="calendar-doc-headline">
            <span className="badge soft">Google Calendar · Pulse</span>
            <h1>{file.name}</h1>
            <p>{file.description}</p>
          </div>
          <div className="calendar-hero-stats">
            {heroStats.map((stat) => (
              <article key={stat.id}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
                <small>{stat.helper}</small>
              </article>
            ))}
          </div>
        </header>
        {docInsightSections.length ? (
          <section className="calendar-insight-grid">
            {docInsightSections.map((section) => (
              <article
                key={`calendar-insight-${section.id}`}
                className="calendar-insight-card"
              >
                <small>{section.heading}</small>
                <strong>{section.insight}</strong>
                <p>{section.action}</p>
                <span className="calendar-insight-meta">
                  Companion pulled this from Drive history.
                </span>
              </article>
            ))}
          </section>
        ) : null}
        <div className="calendar-doc-content">
          <main className="calendar-doc-main">
            <section className="calendar-doc-section">
              <div className="section-head">
                <small>Week at a glance</small>
                <h2>Blocks Companion is enforcing</h2>
                <p>
                  Companion annotates every block with source context so Drive
                  history, doc tasks, and commute intel stay visible.
                </p>
              </div>
              <CalendarWeekGallery
                entries={personaCalendarEntries}
                size="large"
              />
            </section>
            <section className="calendar-doc-section calendar-timeline-section">
              <div className="section-head">
                <small>Daily timeline</small>
                <h2>{timelineDay} · Companion-tracked hours</h2>
                <p>
                  Hour-by-hour map of today’s load. AI-only holds stay pink so
                  you can see what was auto-generated versus human-scheduled.
                </p>
              </div>
              <CalendarDayTimeline
                entries={personaCalendarEntries}
                dayLabel={timelineDay}
              />
            </section>
          </main>
          <aside className="calendar-doc-side">
            <div className="calendar-side-card companion-card">
              <div className="companion-card-head">
                <div>
                  <span>Block companion</span>
                  <strong>Autopilot queue</strong>
                </div>
                <Link className="ghost subtle tiny" to="/companion">
                  Open
                </Link>
              </div>
              <ul className="companion-play-list">
                {autopilotPlays.map((play) => (
                  <li key={`companion-play-${play.id}`}>
                    <div>
                      <strong>{play.title}</strong>
                      <p>{play.detail}</p>
                    </div>
                    <span className="companion-play-state">{play.state}</span>
                  </li>
                ))}
              </ul>
            </div>
            <aside
              className={`doc-chat-card calendar-doc-chat ${
                chatDocked ? "open" : "collapsed"
              }`}
            >
              <div className="doc-chat-card-head">
                <div>
                  <strong>Drive Companion</strong>
                  <span>Synced to your calendar</span>
                </div>
                <button
                  type="button"
                  className="ghost subtle"
                  onClick={() => setChatDocked((prev) => !prev)}
                >
                  {chatDocked ? "Hide" : "Show"}
                </button>
              </div>
              {chatDocked ? (
                <>
                  <div className="chat-feed">
                    {calendarChatHistory.map((message) => (
                      <div
                        key={message.id}
                        className={`chat-bubble ${message.role}`}
                      >
                        <span>{message.text}</span>
                        {message.detail ? (
                          <small className="calendar-chat-detail">
                            {message.detail}
                          </small>
                        ) : null}
                        <small className="calendar-chat-meta-line">
                          {message.author} · {message.stamp} · {message.tag}
                        </small>
                        {message.action ? (
                          <button type="button" className="ghost tiny">
                            {message.action}
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                  <form
                    className="chat-form"
                    onSubmit={handleCalendarChatSubmit}
                  >
                    <input
                      value={calendarChatPrompt}
                      onChange={(event) =>
                        setCalendarChatPrompt(event.target.value)
                      }
                      placeholder="Ask Companion to protect a block…"
                    />
                    <button type="submit">Send</button>
                  </form>
                  <div className="chat-meta">
                    <span>Companion syncs Drive + Calendar every 5 min.</span>
                    <Link className="ghost subtle tiny" to="/companion">
                      Open Companion
                    </Link>
                  </div>
                </>
              ) : (
                <p className="doc-chat-hint">
                  Companion chat is docked. Tap show to reopen.
                </p>
              )}
            </aside>
            <div className="calendar-side-card">
              <h4>AI block recommendations</h4>
              <div className="calendar-side-proposals">
                {proactiveSuggestions.map((suggestion) => (
                  <article key={`calendar-proposal-${suggestion.id}`}>
                    <span className="calendar-proposal-tag">
                      {suggestion.tag}
                    </span>
                    <strong>{suggestion.title}</strong>
                    <p>{suggestion.detail}</p>
                    <div className="calendar-proposal-meta">
                      <span>{suggestion.impact}</span>
                      <button type="button" className="ghost tiny">
                        {suggestion.cta}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <div className="calendar-side-card muted ledger-card">
              <div className="calendar-ledger-head">
                <div>
                  <span>Automation ledger</span>
                  <strong>Docs + Drive trail</strong>
                </div>
                <p>
                  Companion watches doc edits and creates tasks + holds
                  automatically.
                </p>
              </div>
              {doc?.inlineTips?.length ? (
                <ul className="calendar-ledger-list">
                  {doc.inlineTips.map((tip) => (
                    <li key={`calendar-doc-tip-${tip}`}>{tip}</li>
                  ))}
                </ul>
              ) : (
                <p>No suggestions right now.</p>
              )}
            </div>
          </aside>
        </div>
      </div>
    );
  }
  const fileAppRoute = getRouteForFile(file.id);
  const fileAppLabel = getAppLaunchLabel(file);
  return (
    <>
      <div className="demo-page doc-view">
        <div className="doc-view-head">
          <div className="doc-head-left">
            <div className="doc-head-icon" aria-hidden="true">
              {renderGlyph(file.icon)}
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
          {doc?.courseLabel ? (
            <span className="doc-course-meta">Course: {doc.courseLabel}</span>
          ) : null}
        </div>
        {file.id === "notes" && conceptMapNodeCount ? (
          <section className="concept-map-banner">
            <div className="concept-map-banner-copy">
              <span className="concept-map-badge">Companion generated</span>
              <div className="concept-map-banner-head">
                <h3>Course-wide concept map control</h3>
                <p>
                  Companion fused lecture audio, lab rubrics, and reading packs
                  into one answer-ready map. Ask about any node and it responds
                  with citations across every linked document.
                </p>
              </div>
              <div className="concept-map-pill-row">
                <span className="concept-map-pill">
                  <strong>{conceptMapNodeCount}</strong>
                  <span>linked nodes</span>
                </span>
                <span className="concept-map-pill">
                  <strong>{conceptMapConnectionCount}</strong>
                  <span>cross-doc references</span>
                </span>
              </div>
              <div className="concept-map-highlight-grid">
                <article className="concept-map-highlight-card">
                  <strong>All sources fused</strong>
                  <p>
                    Lecture audio, lab rubrics, and reading packs roll into one
                    living doc so context never leaves Drive.
                  </p>
                </article>
                <article className="concept-map-highlight-card">
                  <strong>Answer-ready nodes</strong>
                  <p>
                    Ask “Explain Gradient Risk” and Companion cites every linked
                    document, Slides branch, and flashcard in seconds.
                  </p>
                </article>
                <article className="concept-map-highlight-card">
                  <strong>Feeds other apps</strong>
                  <p>
                    Each node can push into Slides, Sheets, or Gmail recaps so
                    the map powers every workflow downstream.
                  </p>
                </article>
              </div>
              {conceptMapChipNames.length ? (
                <div className="concept-map-chip-row">
                  {conceptMapChipNames.map((chip) => (
                    <span key={`concept-chip-${chip}`} className="concept-map-chip">
                      {chip}
                    </span>
                  ))}
                  {conceptMapChipOverflow > 0 ? (
                    <span className="concept-map-chip muted">
                      +{conceptMapChipOverflow} more
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className="concept-map-banner-actions">
              <div className="concept-map-mini-graph">
                <span className="concept-map-mini-label">Sample nodes</span>
                {conceptMapSampleNodes.map((node) => (
                  <article
                    key={`concept-mini-${node.id}`}
                    className="concept-map-mini-node"
                  >
                    <div>
                      <strong>{node.title}</strong>
                      <p>{node.summary}</p>
                    </div>
                    {node.previewConnections.length ? (
                      <small>
                        {node.previewConnections.join(" • ")}
                        {node.connections.length > node.previewConnections.length
                          ? " +" + (node.connections.length - node.previewConnections.length)
                          : ""}
                      </small>
                    ) : null}
                  </article>
                ))}
              </div>
              <p className="concept-map-banner-note">
                Use when you need a briefing across sources or want Companion’s
                map to feed Slides, Sheets, and Docs automatically.
              </p>
              <div className="concept-map-banner-links">
                <Link className="concept-map-action fill" to={`/doc/${file.id}#map`}>
                  Highlight nodes in doc
                </Link>
                {doc.conceptMapLink ? (
                  <a
                    className="concept-map-action outline"
                    href={doc.conceptMapLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {doc.conceptMapLabel ?? "Open map"}
                  </a>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}
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
            {file.id === "meeting" ? (
              <div className="doc-meeting-cta">
                <div>
                  <strong>Summarize & email meeting notes</strong>
                  <p>
                    Companion drafted the recap, tagged owners, and staged a
                    Gmail outline you can edit. Click once to review or send
                    before you leave the room.
                  </p>
                </div>
                <div className="doc-meeting-cta-actions">
                  <button
                    type="button"
                    className="primary"
                    onClick={() => setEmailDraftOpen(true)}
                  >
                    Summarize + create email draft
                  </button>
                </div>
              </div>
            ) : null}
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
                        {doc.courseLabel ? (
                          <span
                            className="doc-course-pill"
                            aria-label="Course name"
                          >
                            Course · {doc.courseLabel}
                          </span>
                        ) : null}
                        <h3>{doc.title}</h3>
                        <p>{doc.subtitle}</p>
                      </div>
                      <span className="doc-page-status">{doc.status}</span>
                    </header>
                    {doc.conceptMapNodes?.length ? (
                      <div className="concept-map-preview">
                        <div className="concept-map-preview-head">
                          <div>
                            <small>Interactive concept map</small>
                            <strong>
                              See how ML nodes relate without leaving Docs
                            </strong>
                          </div>
                        </div>
                        <div className="concept-map-preview-grid">
                          {doc.conceptMapNodes.slice(0, 4).map((node) => (
                            <div
                              key={`preview-${node.id}`}
                              className="concept-map-preview-node"
                            >
                              <span className="concept-map-preview-title">
                                {node.title}
                              </span>
                              <p>{node.summary}</p>
                              {node.connections.length ? (
                                <div className="concept-map-preview-connections">
                                  {node.connections
                                    .slice(0, 2)
                                    .map((connection) => (
                                      <span
                                        key={`connection-${node.id}-${connection}`}
                                        className="concept-map-preview-chip"
                                      >
                                        {connection}
                                      </span>
                                    ))}
                                  {node.connections.length > 2 ? (
                                    <span className="concept-map-preview-chip muted">
                                      +{node.connections.length - 2} more
                                    </span>
                                  ) : null}
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {doc.sections.map((section, index) => (
                      <article
                        key={`page-${section.id}`}
                        id={section.id}
                        className={`doc-page-section ${
                          focusedSection === section.id ? "focused" : ""
                        }`}
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
                    {doc.conceptMapNarrative ? (
                      <section className="concept-map-doc">
                        <div className="concept-map-doc-graph">
                          <div className="concept-map-doc-head">
                            <div>
                              <small>Concept map canvas</small>
                              <strong>
                                Companion-built doc students remix
                              </strong>
                              <p>{doc.conceptMapNarrative}</p>
                            </div>
                            <div className="concept-map-doc-actions">
                              <button
                                type="button"
                                className="ghost"
                                onClick={() => jumpToSection("map")}
                              >
                                Highlight nodes in doc
                              </button>
                            </div>
                          </div>
                          <div className="concept-map-doc-grid">
                            <div className="concept-map-doc-node root">
                              <span>Neural Net Fundamentals</span>
                              <p>
                                Auto-created from Lecture 5 audio + Chapter 4 +
                                Lab 03 rubric
                              </p>
                            </div>
                            <div className="concept-map-doc-node branch">
                              <span>Input Layer</span>
                              <p>Linked to reading pp.14‑18 + Slides demo</p>
                              <small>Audio snippet 03:12</small>
                            </div>
                            <div className="concept-map-doc-node branch risk">
                              <span>Gradient Risk</span>
                              <p>Figure 4.7 highlights + risk alert timeline</p>
                              <small>Companion flagged 2 blockers</small>
                            </div>
                            <div className="concept-map-doc-node branch">
                              <span>Seminar Prompts</span>
                              <p>Chen 2025 counter-argument + flashcards</p>
                              <small>Slides branch ready</small>
                            </div>
                            <div className="concept-map-doc-node branch">
                              <span>Weekly Wrap</span>
                              <p>
                                Owners + reminders synced to Drive & Calendar
                              </p>
                              <small>Shared with study group</small>
                            </div>
                          </div>
                        </div>
                      </section>
                    ) : null}
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
                      Companion pinned the most important paragraphs in this
                      doc.
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
                      <div className="doc-highlight-icon" aria-hidden="true">
                        <span className="doc-highlight-icon-dot" />
                      </div>
                      <div className="doc-highlight-content">
                        <span className="doc-highlight-label">
                          {section.heading}
                        </span>
                        <p>{section.excerpt}</p>
                        <div className="doc-highlight-note">
                          <strong>{section.insight}</strong>
                          <small>{section.action}</small>
                        </div>
                        <button
                          type="button"
                          className="doc-highlight-cta"
                          onClick={() => jumpToSection(section.id)}
                        >
                          View in doc →
                        </button>
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
              {doc.conceptMapNodes?.length ? (
                <section className="doc-automation-section doc-concept-section">
                  <div className="doc-automation-head">
                    <div>
                      <h4>Concept map nodes Companion linked</h4>
                      <p>
                        Notes, readings, and labs stay connected so you can skim
                        dependencies at a glance.
                      </p>
                    </div>
                    <span className="doc-automation-count">
                      {doc.conceptMapNodes.length} nodes
                    </span>
                  </div>
                  <div className="doc-concept-grid">
                    {doc.conceptMapNodes.map((node) => (
                      <article
                        key={`concept-${node.id}`}
                        className="doc-concept-node"
                      >
                        <div className="doc-concept-node-head">
                          <strong>{node.title}</strong>
                          {node.status ? (
                            <span className="doc-concept-node-status">
                              {node.status}
                            </span>
                          ) : null}
                        </div>
                        <p>{node.summary}</p>
                        {node.connections.length ? (
                          <div className="doc-concept-node-links">
                            {node.connections.map((connection) => (
                              <span
                                key={`${node.id}-${connection}`}
                                className="doc-concept-chip"
                              >
                                {connection}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </article>
                    ))}
                  </div>
                  {doc.conceptMapLink ? (
                    <a
                      className="concept-map-link"
                      href={doc.conceptMapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {doc.conceptMapLabel ?? "Open concept map"}
                    </a>
                  ) : null}
                </section>
              ) : null}
              {doc.flashcards?.length ? (
                <section className="doc-automation-section doc-flashcard-section">
                  <div className="doc-automation-head">
                    <div>
                      <h4>Flashcards pulled from this reading</h4>
                      <p>
                        Tap reveal to study, or open the Slides deck Companion
                        built.
                      </p>
                    </div>
                    <span className="doc-automation-count">
                      {doc.flashcards.length} cards
                    </span>
                  </div>
                  <div className="doc-flashcard-gallery">
                    {doc.flashcards.map((card) => {
                      const revealed = !!flashcardRevealMap[card.id];
                      return (
                        <article
                          key={`flashcard-${card.id}`}
                          className={`doc-flashcard-card ${
                            revealed ? "revealed" : ""
                          }`}
                        >
                          {card.tag ? (
                            <span className="doc-flashcard-tag">
                              {card.tag}
                            </span>
                          ) : null}
                          <strong>{card.prompt}</strong>
                          {revealed ? (
                            <p className="doc-flashcard-answer">
                              {card.answer}
                            </p>
                          ) : (
                            <p className="doc-flashcard-hint">
                              Reveal to see the summary Companion wrote for this
                              passage.
                            </p>
                          )}
                          <div className="doc-flashcard-actions">
                            <button
                              type="button"
                              className="ghost"
                              onClick={() => toggleFlashcardReveal(card.id)}
                            >
                              {revealed ? "Hide answer" : "Reveal"}
                            </button>
                            {card.sectionId ? (
                              <button
                                type="button"
                                className="doc-flashcard-jump"
                                onClick={() => jumpToSection(card.sectionId!)}
                              >
                                View section →
                              </button>
                            ) : null}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                  {doc.flashcardDeckLink ? (
                    <a
                      className="flashcard-slides-link"
                      href={doc.flashcardDeckLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {doc.flashcardDeckLabel ?? "Open in Slides"}
                    </a>
                  ) : null}
                </section>
              ) : null}
            </div>
          </>
        ) : (
          <p>This file doesn’t have a full document canvas yet.</p>
        )}
      </div>
      {emailDraftOpen ? (
        <div className="email-draft-overlay" role="dialog" aria-modal="true">
          <div className="email-draft-modal">
            <div className="email-draft-header">
              <strong>New message</strong>
              <div className="email-draft-header-actions">
                <button
                  type="button"
                  className="email-draft-open-gmail"
                  onClick={() =>
                    window.open("https://mail.google.com/", "_blank")
                  }
                >
                  Open in Gmail ↗
                </button>
                <button
                  type="button"
                  className="ghost"
                  onClick={() => setEmailDraftOpen(false)}
                  aria-label="Close draft"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="email-draft-field">
              <label>To</label>
              <input value="leadership@company.com" readOnly />
            </div>
            <div className="email-draft-field inline">
              <div>
                <label>Cc</label>
                <input value="cx-team@company.com" readOnly />
              </div>
              <div>
                <label>Bcc</label>
                <input value="me@company.com" readOnly />
              </div>
            </div>
            <div className="email-draft-field">
              <label>Subject</label>
              <input
                value="[CX Sync] Summary + actions · ready to send"
                readOnly
              />
            </div>
            <div className="email-draft-body">
              <p>Hi team,</p>
              <p>
                <strong>Highlights</strong>
                <br />• <strong>Volume −8% WoW</strong> · conversion drag traced
                to EU onboarding backlog; mitigation brief for CS leadership
                attached (“Volume Recovery Plan v2”).
                <br />• <strong>EU beta remains green</strong> · next go/no-go
                checkpoint Thu · 3:00 PM (calendar hold staged; Slides recap
                ready).
                <br />• <strong>Onboarding SLA risk</strong> · CX Ops requested
                an escalation summary following today’s sync.
              </p>
              <p>
                <strong>Risk / Actions</strong>
                <br />• SLA breach on onboarding · <strong>Maya S.</strong> owns
                follow-up (<em>due Tue</em>). Companion pre-tagged Tasks, linked
                the CX Sync doc, and drafted the vendor update.
                <br />• <strong>Volume recovery KPIs</strong> ·{" "}
                <strong>Leo</strong>
                publishes tomorrow’s dashboard; KPI snapshot + Slides deck ready
                if you’d like them attached.
                <br />• Need me to bundle the Slides recap or KPI sheet before
                we hit send?
              </p>
              <p>• Companion</p>
            </div>
            <div className="email-draft-actions">
              <button type="button" className="primary">
                Send now
              </button>
              <button
                type="button"
                className="ghost"
                onClick={() => setEmailDraftOpen(false)}
              >
                Save to drafts
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

const CalendarWeekGallery = ({
  entries,
  size = "small",
}: CalendarWeekGalleryProps) => {
  const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const groupedEntries = entries.reduce<Record<string, CalendarEntry[]>>(
    (acc, entry) => {
      if (!acc[entry.day]) {
        acc[entry.day] = [];
      }
      acc[entry.day].push(entry);
      return acc;
    },
    {}
  );
  const orderedDays = [
    ...dayOrder.filter(
      (day) => groupedEntries[day] && groupedEntries[day].length > 0
    ),
    ...Object.keys(groupedEntries).filter((day) => !dayOrder.includes(day)),
  ];
  const baselineMinutes = 12 * 60;
  const computeLoad = (dayEntries: CalendarEntry[]) => {
    const minutesBooked = dayEntries.reduce((sum, entry) => {
      const duration = Math.max(entry.endMinutes - entry.startMinutes, 30);
      return sum + duration;
    }, 0);
    return Math.min(
      100,
      Math.max(10, Math.round((minutesBooked / baselineMinutes) * 100))
    );
  };
  const formatHoldLabel = (count: number) => {
    if (!count) return "No protected time";
    return `${count} Companion hold${count > 1 ? "s" : ""}`;
  };
  if (orderedDays.length === 0) {
    return null;
  }
  return (
    <div className={`calendar-day-view ${size}`}>
      {orderedDays.map((day) => {
        const dayEntries = groupedEntries[day] ?? [];
        const load = computeLoad(dayEntries);
        const protectedBlocks = dayEntries.filter((entry) => {
          const label = entry.status.toLowerCase();
          return label.includes("focus") || label.includes("hold");
        }).length;
        return (
          <article key={`calendar-day-${day}`} className="calendar-day-card">
            <div className="calendar-day-card-head">
              <div>
                <span>{day} rhythm</span>
                <strong>{load}% booked</strong>
                <small>{formatHoldLabel(protectedBlocks)}</small>
              </div>
              <button type="button" className="ghost tiny subtle">
                Review
              </button>
            </div>
            <div className="calendar-block-list">
              {dayEntries.map((entry) => {
                const sourceLabel =
                  entry.source === "companion" ? "AI auto" : "Manual";
                return (
                  <div
                    key={`calendar-block-${entry.id}`}
                    className={`calendar-block ${entry.color}`}
                  >
                    <div className="calendar-block-meta">
                      <span className="calendar-block-time">{entry.time}</span>
                      <span className="calendar-block-status">
                        {entry.status}
                      </span>
                    </div>
                    <strong>{entry.title}</strong>
                    <p>{entry.meta}</p>
                    <div className="calendar-block-foot">
                      <span>{entry.location}</span>
                      <span
                        className={`calendar-block-chip ${
                          entry.source ?? "manual"
                        }`}
                      >
                        {sourceLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        );
      })}
    </div>
  );
};

const CalendarDayTimeline = ({
  entries,
  dayLabel,
}: CalendarDayTimelineProps) => {
  const dayEntries = entries
    .filter((entry) => entry.day === dayLabel)
    .sort((a, b) => a.startMinutes - b.startMinutes);
  if (!dayEntries.length) {
    return null;
  }
  const formatDuration = (start: number, end: number) => {
    const minutes = Math.max(end - start, 15);
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    if (!hours) {
      return `${minutes} min`;
    }
    if (!remainder) {
      return `${hours} hr${hours > 1 ? "s" : ""}`;
    }
    return `${hours} hr ${remainder} min`;
  };
  const formatSourceLabel = (source?: CalendarEntry["source"]) =>
    source === "companion" ? "AI block" : "Manual block";
  return (
    <div className="calendar-timeline-list">
      {dayEntries.map((entry) => (
        <article
          key={`timeline-card-${entry.id}`}
          className={`calendar-timeline-card ${entry.color}`}
        >
          <div className="calendar-timeline-card-head">
            <span className="calendar-timeline-slot">{entry.time}</span>
            <span
              className={`calendar-timeline-source-tag ${
                entry.source ?? "manual"
              }`}
            >
              {formatSourceLabel(entry.source)}
            </span>
          </div>
          <strong>{entry.title}</strong>
          <p>{entry.meta}</p>
          <div className="calendar-timeline-card-foot">
            <span>{entry.location}</span>
            <span>{formatDuration(entry.startMinutes, entry.endMinutes)}</span>
          </div>
        </article>
      ))}
    </div>
  );
};
