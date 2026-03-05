export interface Author {
  name: string;
  affiliation?: string;
  email?: string;
}

export interface Section {
  id: string;
  title: string;
  content: string;
}

export interface Reference {
  id: string;
  title: string;
  authors: string[];
  year: number;
  venue: string;
}

export interface Table {
  id: string;
  caption: string;
  headers: string[];
  rows: string[][];
}

export interface AcademicDocument {
  title: string;
  abstract: string;
  authors: Author[];
  keywords: string[];
  sections: Section[];
  references: Reference[];
  tables: Table[];
  conference: string;
  createdAt: string;
  updatedAt: string;
}

export const defaultDocument: AcademicDocument = {
  title: "Your Paper Title",
  abstract: "Write your abstract here.",
  authors: [
    {
      name: "Author Name",
      affiliation: "University Name",
      email: "author@university.edu",
    },
  ],
  keywords: ["Keyword 1", "Keyword 2", "Keyword 3"],
  sections: [
    {
      id: "intro",
      title: "Introduction",
      content: "Your introduction text here.",
    },
    {
      id: "related",
      title: "Related Work",
      content: "Discuss related work here.",
    },
    {
      id: "method",
      title: "Methodology",
      content: "Describe your methodology here.",
    },
    {
      id: "results",
      title: "Results",
      content: "Present your results here.",
    },
    {
      id: "conclusion",
      title: "Conclusion",
      content: "Summarize your findings here.",
    },
  ],
  references: [
    {
      id: "ref1",
      title: "Sample Reference",
      authors: ["Author A", "Author B"],
      year: 2024,
      venue: "Conference Name",
    },
  ],
  tables: [],
  conference: "IEEE",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
