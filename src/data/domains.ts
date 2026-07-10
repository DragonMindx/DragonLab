export const DOMAINS = [
  { key: "cs",       icon: "\uD83D\uDCBB", name: "CS",       desc: "Computer Science" },
  { key: "ml",       icon: "\uD83E\uDDE0", name: "ML",       desc: "Machine Learning" },
  { key: "ds",       icon: "\uD83D\uDCCA", name: "DS",       desc: "Data Science" },
  { key: "reading",  icon: "\uD83D\uDCDA", name: "Reading",  desc: "Books & Essays" },
  { key: "blog",     icon: "\uD83D\uDCDD", name: "Blog",     desc: "General Posts" },
  { key: "research", icon: "\uD83D\uDD2C", name: "Research", desc: "Math Modeling" },
  { key: "econ",     icon: "\uD83D\uDCC8", name: "Econ",     desc: "Economics" },
  { key: "note",     icon: "📖", name: "Note",     desc: "Course Notes" }
] as const;

export type DomainKey = (typeof DOMAINS)[number]["key"];
export const DOMAIN_KEYS = DOMAINS.map((d) => d.key);
