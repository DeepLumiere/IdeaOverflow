export type ConferenceId = "IEEE" | "ACM" | "Springer";

export type PaperAuthor = {
  name: string;
  affiliation?: string;
  email?: string;
};

export type PaperSubsection = {
  id: string;
  name: string;
  content: string;
};

export type PaperSection = {
  id: string;
  name: string;
  content: string;
  subsections: PaperSubsection[];
};

export type PaperTable = {
  id: string;
  caption?: string;
  headers: string[];
  rows: string[][];
  sectionId?: string;
};

export type PaperImage = {
  id: string;
  url: string;
  caption?: string;
  alt?: string;
  sectionId?: string;
};

export type PaperDoc = {
  title: string;
  authors: PaperAuthor[];
  abstract: string;
  sections: PaperSection[];
  tables: PaperTable[];
  images: PaperImage[];
  updatedAt: number;
};

export const defaultPaperDoc: PaperDoc = {
  title: "Paper Title",
  authors: [
    { name: "Author 1", affiliation: "University / Organization", email: "author1@example.com" },
    { name: "Author 2", affiliation: "University / Organization", email: "author2@example.com" },
  ],
  abstract:
    "Write your abstract here. This preview updates instantly as you add sections, subsections, tables, and images.",
  sections: [
    {
      id: "sec-intro",
      name: "Introduction",
      content: "Introduce the problem, context, and motivation.",
      subsections: [],
    },
  ],
  tables: [],
  images: [],
  updatedAt: Date.now(),
};

