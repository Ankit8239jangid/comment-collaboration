import type {
  Agency,
  AgencyDiscussion,
  AppNotification,
  Candidate,
  Comment,
  User,
} from "./types";

// ----------------------------------------------------------------------------
// USERS  (current user = "u_john")
// ----------------------------------------------------------------------------
export const CURRENT_USER_ID = "u_john";

export const USERS: User[] = [
  {
    id: "u_john",
    name: "John Recruiter",
    email: "john@seekhelpers.com",
    role: "Recruiter",
    color: "#F76711",
  },
  {
    id: "u_sarah",
    name: "Sarah Jenkins",
    email: "sarah@seekhelpers.com",
    role: "Manager",
    color: "#8B5CF6",
  },
  {
    id: "u_alex",
    name: "Alex Chen",
    email: "alex@seekhelpers.com",
    role: "Sales",
    color: "#10B981",
  },
  {
    id: "u_emily",
    name: "Emily Wang",
    email: "emily@seekhelpers.com",
    role: "Recruiter",
    color: "#3B82F6",
  },
  {
    id: "u_marcus",
    name: "Marcus Lee",
    email: "marcus@elitehelpers.com",
    role: "Agency Representative",
    color: "#EC4899",
  },
  {
    id: "u_priya",
    name: "Priya Sharma",
    email: "priya@seekhelpers.com",
    role: "Admin",
    color: "#F43F5E",
  },
  {
    id: "u_david",
    name: "David Park",
    email: "david@seekhelpers.com",
    role: "Recruiter",
    color: "#14B8A6",
  },
  {
    id: "u_lisa",
    name: "Lisa Anderson",
    email: "lisa@elitehelpers.com",
    role: "Sales",
    color: "#F59E0B",
  },
];

export const USER_MAP: Record<string, User> = Object.fromEntries(
  USERS.map((u) => [u.id, u])
);

// ----------------------------------------------------------------------------
// AGENCIES
// ----------------------------------------------------------------------------
export const AGENCIES: Agency[] = [
  {
    id: "a_seekhelpers",
    name: "Helper Agency",
    gradient: "from-orange-500 to-amber-500",
    participantIds: ["u_john", "u_sarah", "u_alex", "u_emily", "u_priya"],
  },
  {
    id: "a_recruitment",
    name: "Recruitment Team",
    gradient: "from-violet-500 to-purple-500",
    participantIds: ["u_john", "u_sarah", "u_david", "u_emily"],
  },
  {
    id: "a_sales",
    name: "Sales Team",
    gradient: "from-emerald-500 to-teal-500",
    participantIds: ["u_alex", "u_lisa", "u_priya"],
  },
  {
    id: "a_elite",
    name: "Elite Helpers",
    gradient: "from-pink-500 to-rose-500",
    participantIds: ["u_marcus", "u_lisa", "u_john"],
  },
];

export const AGENCY_MAP: Record<string, Agency> = Object.fromEntries(
  AGENCIES.map((a) => [a.id, a])
);

// ----------------------------------------------------------------------------
// CANDIDATES
// ----------------------------------------------------------------------------
export const CANDIDATES: Candidate[] = [
  {
    id: "c_001",
    name: "Michael Rodriguez",
    color: "#3B82F6",
    status: "Interview",
    agency: "SeekHelpers Agency",
    lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    position: "Senior Frontend Engineer",
    email: "michael.r@email.com",
    location: "San Francisco, CA",
    totalComments: 14,
  },
  {
    id: "c_002",
    name: "Jessica Thompson",
    color: "#EC4899",
    status: "Active",
    agency: "Recruitment Team",
    lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    position: "Product Manager",
    email: "jessica.t@email.com",
    location: "Austin, TX",
    totalComments: 8,
  },
  {
    id: "c_003",
    name: "Daniel Kim",
    color: "#10B981",
    status: "Pending",
    agency: "Elite Helpers",
    lastActivity: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    position: "DevOps Engineer",
    email: "daniel.k@email.com",
    location: "Seattle, WA",
    totalComments: 23,
  },
  {
    id: "c_004",
    name: "Aisha Patel",
    color: "#8B5CF6",
    status: "Hired",
    agency: "Sales Team",
    lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    position: "Account Executive",
    email: "aisha.p@email.com",
    location: "New York, NY",
    totalComments: 6,
  },
  {
    id: "c_005",
    name: "Robert Chen",
    color: "#F59E0B",
    status: "Interview",
    agency: "SeekHelpers Agency",
    lastActivity: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    position: "Backend Engineer",
    email: "robert.c@email.com",
    location: "Remote",
    totalComments: 19,
  },
  {
    id: "c_006",
    name: "Maria Garcia",
    color: "#EF4444",
    status: "Rejected",
    agency: "Recruitment Team",
    lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    position: "UX Designer",
    email: "maria.g@email.com",
    location: "Miami, FL",
    totalComments: 4,
  },
];

export const CANDIDATE_MAP: Record<string, Candidate> = Object.fromEntries(
  CANDIDATES.map((c) => [c.id, c])
);

// ----------------------------------------------------------------------------
// SAMPLE IMAGES & DOCS (use picsum + dummy URLs)
// ----------------------------------------------------------------------------
const img = (seed: string, w = 800, h = 600) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

// ----------------------------------------------------------------------------
// HELPERS TO BUILD COMMENT OBJECTS
// ----------------------------------------------------------------------------
function makeComment(
  partial: Partial<Comment> & Pick<Comment, "authorId" | "text" | "createdAt">
): Comment {
  return {
    id: partial.id ?? `cm_${Math.random().toString(36).slice(2, 10)}`,
    authorId: partial.authorId,
    text: partial.text,
    mentions: partial.mentions ?? [],
    attachments: partial.attachments ?? [],
    reactions: partial.reactions ?? [],
    createdAt: partial.createdAt,
    editedAt: partial.editedAt,
    pinged: partial.pinged ?? false,
    replies: partial.replies ?? [],
  };
}

const now = Date.now();
const minsAgo = (m: number) => new Date(now - m * 60 * 1000).toISOString();
const hrsAgo = (h: number) => new Date(now - h * 60 * 60 * 1000).toISOString();
const daysAgo = (d: number) =>
  new Date(now - d * 24 * 60 * 60 * 1000).toISOString();

// ----------------------------------------------------------------------------
// DISCUSSIONS  (keyed by `${candidateId}:${agencyId}`)
// ----------------------------------------------------------------------------
export const DISCUSSIONS: Record<string, AgencyDiscussion> = {
  // Candidate 001 — SeekHelpers Agency
  "c_001:a_seekhelpers": {
    agencyId: "a_seekhelpers",
    candidateId: "c_001",
    lastActivity: minsAgo(120),
    unreadCount: 3,
    lastMessagePreview: "Candidate has submitted passport.",
    comments: [
      makeComment({
        authorId: "u_sarah",
        text: "Hey team — Michael's interview is scheduled for Friday 2 PM. @John Recruiter can you confirm the panel?",
        mentions: ["u_john"],
        createdAt: daysAgo(1),
        reactions: [
          { emoji: "👍", userIds: ["u_john", "u_alex"] },
          { emoji: "🔥", userIds: ["u_emily"] },
        ],
        replies: [
          makeComment({
            authorId: "u_john",
            text: "Confirmed. Panel includes me, @Emily Wang, and David.",
            mentions: ["u_emily"],
            createdAt: daysAgo(1),
            reactions: [{ emoji: "👍", userIds: ["u_sarah"] }],
          }),
          makeComment({
            authorId: "u_emily",
            text: "Got it. I'll prepare the technical assessment.",
            createdAt: hrsAgo(20),
            reactions: [],
          }),
        ],
      }),
      makeComment({
        authorId: "u_john",
        text: "Candidate passport has been uploaded. Please review.",
        mentions: [],
        createdAt: hrsAgo(5),
        attachments: [
          {
            id: "att_1",
            kind: "document",
            name: "passport.pdf",
            url: "#",
            size: "2.4 MB",
            mimeType: "application/pdf",
          },
          {
            id: "att_2",
            kind: "image",
            name: "candidate-photo.jpg",
            url: img("michael-photo", 800, 600),
            size: "1.2 MB",
            mimeType: "image/jpeg",
          },
        ],
        reactions: [
          { emoji: "👍", userIds: ["u_sarah", "u_alex", "u_emily", "u_priya"] },
          { emoji: "❤️", userIds: ["u_sarah"] },
        ],
        replies: [
          makeComment({
            authorId: "u_alex",
            text: "Looks good. I'll proceed with the offer draft.",
            createdAt: hrsAgo(4),
            reactions: [{ emoji: "👏", userIds: ["u_john"] }],
          }),
        ],
      }),
      makeComment({
        authorId: "u_sarah",
        text: "@Alex Chen — please loop in the Sales Team once the offer is ready.",
        mentions: ["u_alex"],
        createdAt: hrsAgo(3),
        reactions: [],
        replies: [],
      }),
      makeComment({
        authorId: "u_john",
        text: "Candidate has submitted passport.",
        mentions: [],
        createdAt: minsAgo(120),
        reactions: [],
        replies: [],
      }),
      makeComment({
        authorId: "u_emily",
        text: "Great — I've added the notes to the candidate file.",
        mentions: [],
        createdAt: minsAgo(60),
        reactions: [{ emoji: "👀", userIds: ["u_sarah"] }],
        replies: [],
      }),
      makeComment({
        authorId: "u_john",
        text: "Here are the latest reference images from the portfolio.",
        mentions: [],
        createdAt: minsAgo(20),
        attachments: [
          {
            id: "att_3",
            kind: "image",
            name: "portfolio-1.jpg",
            url: img("portfolio1", 600, 400),
            size: "0.8 MB",
            mimeType: "image/jpeg",
          },
          {
            id: "att_4",
            kind: "image",
            name: "portfolio-2.jpg",
            url: img("portfolio2", 600, 400),
            size: "0.9 MB",
            mimeType: "image/jpeg",
          },
          {
            id: "att_5",
            kind: "image",
            name: "portfolio-3.jpg",
            url: img("portfolio3", 600, 400),
            size: "1.1 MB",
            mimeType: "image/jpeg",
          },
        ],
        reactions: [{ emoji: "🔥", userIds: ["u_sarah", "u_alex"] }],
        replies: [],
      }),
    ],
  },

  // Candidate 001 — Recruitment Team
  "c_001:a_recruitment": {
    agencyId: "a_recruitment",
    candidateId: "c_001",
    lastActivity: hrsAgo(8),
    unreadCount: 0,
    lastMessagePreview: "Background check initiated.",
    comments: [
      makeComment({
        authorId: "u_david",
        text: "Background check initiated for Michael.",
        mentions: [],
        createdAt: hrsAgo(8),
        reactions: [{ emoji: "👍", userIds: ["u_john", "u_sarah"] }],
        replies: [],
      }),
    ],
  },

  // Candidate 002 — Recruitment Team
  "c_002:a_recruitment": {
    agencyId: "a_recruitment",
    candidateId: "c_002",
    lastActivity: minsAgo(30),
    unreadCount: 5,
    lastMessagePreview: "Jessica just submitted her portfolio.",
    comments: [
      makeComment({
        authorId: "u_sarah",
        text: "Jessica's CV looks strong. @John Recruiter please review.",
        mentions: ["u_john"],
        createdAt: hrsAgo(6),
        reactions: [{ emoji: "👍", userIds: ["u_john"] }],
        replies: [],
      }),
      makeComment({
        authorId: "u_john",
        text: "Jessica just submitted her portfolio.",
        mentions: [],
        createdAt: minsAgo(30),
        attachments: [
          {
            id: "att_6",
            kind: "document",
            name: "jessica-portfolio.pdf",
            url: "#",
            size: "4.8 MB",
            mimeType: "application/pdf",
          },
        ],
        reactions: [{ emoji: "🔥", userIds: ["u_sarah", "u_david"] }],
        replies: [],
      }),
    ],
  },

  // Candidate 003 — Elite Helpers
  "c_003:a_elite": {
    agencyId: "a_elite",
    candidateId: "c_003",
    lastActivity: hrsAgo(5),
    unreadCount: 0,
    lastMessagePreview: "Visa documentation is in progress.",
    comments: [
      makeComment({
        authorId: "u_marcus",
        text: "Visa documentation is in progress. @Lisa Anderson please coordinate with the candidate.",
        mentions: ["u_lisa"],
        createdAt: hrsAgo(5),
        reactions: [],
        replies: [
          makeComment({
            authorId: "u_lisa",
            text: "On it. Will update by EOD.",
            createdAt: hrsAgo(4),
            reactions: [{ emoji: "👍", userIds: ["u_marcus"] }],
          }),
        ],
      }),
    ],
  },

  // Candidate 004 — Sales Team
  "c_004:a_sales": {
    agencyId: "a_sales",
    candidateId: "c_004",
    lastActivity: daysAgo(1),
    unreadCount: 0,
    lastMessagePreview: "Offer accepted — welcome aboard!",
    comments: [
      makeComment({
        authorId: "u_alex",
        text: "Offer accepted — welcome aboard! 🎉",
        mentions: [],
        createdAt: daysAgo(1),
        reactions: [
          { emoji: "❤️", userIds: ["u_priya", "u_lisa", "u_john"] },
          { emoji: "🔥", userIds: ["u_priya"] },
          { emoji: "👏", userIds: ["u_lisa", "u_john"] },
        ],
        replies: [],
      }),
    ],
  },

  // Candidate 005 — SeekHelpers Agency
  "c_005:a_seekhelpers": {
    agencyId: "a_seekhelpers",
    candidateId: "c_005",
    lastActivity: hrsAgo(3),
    unreadCount: 2,
    lastMessagePreview: "Robert's technical assessment results are in.",
    comments: [
      makeComment({
        authorId: "u_emily",
        text: "Robert's technical assessment results are in. Strong on backend, average on system design.",
        mentions: [],
        createdAt: hrsAgo(3),
        attachments: [
          {
            id: "att_7",
            kind: "image",
            name: "results-chart.png",
            url: img("results", 800, 500),
            size: "0.5 MB",
            mimeType: "image/png",
          },
        ],
        reactions: [{ emoji: "👍", userIds: ["u_sarah"] }],
        replies: [],
      }),
    ],
  },

  // Candidate 006 — Recruitment Team
  "c_006:a_recruitment": {
    agencyId: "a_recruitment",
    candidateId: "c_006",
    lastActivity: daysAgo(7),
    unreadCount: 0,
    lastMessagePreview: "Closing this thread — candidate rejected.",
    comments: [
      makeComment({
        authorId: "u_david",
        text: "Closing this thread — candidate rejected. @Sarah Jenkins please archive the file.",
        mentions: ["u_sarah"],
        createdAt: daysAgo(7),
        reactions: [{ emoji: "👍", userIds: ["u_sarah"] }],
        replies: [],
      }),
    ],
  },
};

// Get all discussions for a candidate (only those with actual entries)
export function getDiscussionsForCandidate(candidateId: string): AgencyDiscussion[] {
  return Object.keys(DISCUSSIONS)
    .filter((k) => k.startsWith(`${candidateId}:`))
    .map((k) => DISCUSSIONS[k]);
}

// ----------------------------------------------------------------------------
// INITIAL NOTIFICATIONS
// ----------------------------------------------------------------------------
export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n_1",
    type: "mention",
    text: "Sarah Jenkins mentioned you in Michael Rodriguez's discussion.",
    createdAt: minsAgo(15),
    read: false,
    candidateId: "c_001",
    agencyId: "a_seekhelpers",
  },
  {
    id: "n_2",
    type: "reply",
    text: "Emily Wang replied to your comment in Michael Rodriguez's thread.",
    createdAt: hrsAgo(2),
    read: false,
    candidateId: "c_001",
    agencyId: "a_seekhelpers",
  },
  {
    id: "n_3",
    type: "new-comment",
    text: "New comment added in Recruitment Team for Jessica Thompson.",
    createdAt: hrsAgo(6),
    read: true,
    candidateId: "c_002",
    agencyId: "a_recruitment",
  },
];

export const QUICK_EMOJIS = ["👍", "❤️", "🔥", "😂", "👏", "👀"];

export const EMOJI_CATEGORIES: { name: string; emojis: string[] }[] = [
  {
    name: "Smileys",
    emojis: [
      "😀", "😁", "😂", "🤣", "😊", "😇", "🙂", "😉", "😍", "🥰",
      "😘", "😗", "😚", "😋", "😛", "😝", "🤔", "🤨", "😐", "😶",
      "🙄", "😏", "😴", "🤤", "😪", "😢", "😭", "😤", "😠", "🤬",
    ],
  },
  {
    name: "Gestures",
    emojis: [
      "👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉",
      "👆", "👇", "☝️", "✋", "🤚", "🖐️", "🖖", "👋", "🤝", "🙏",
      "👏", "🙌", "👐", "🤲", "🤛", "🤜", "✊", "👊", "💪", "🦾",
    ],
  },
  {
    name: "Hearts",
    emojis: [
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
      "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "🔥", "⭐",
      "🌟", "✨", "⚡", "💯", "✅", "❌", "❓", "❗", "👀", "🎉",
    ],
  },
];
