export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      }
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsText(file);
  });
};

export const getConferenceFormattingRules = (conferenceId: string): string => {
  const rules: { [key: string]: string } = {
    '1': 'ACL - Use \\section{} for sections, \\citep{} for citations, max 8 pages',
    '2': 'EMNLP - Follow ACL guidelines, support for 8 page submissions',
    '3': 'ICML - 8 page limit for main content, use \\subsubsection{} for detailed structure',
    '4': 'NeurIPS - 8 page papers, requires structured abstract',
    '5': 'ICLR - 9 page papers, requires keyword section',
  };
  return rules[conferenceId] || 'Standard LaTeX formatting guidelines';
};

export const generateFormattingIssues = (conferenceId: string, content: string) => {
  const issues: Array<{ id: string; type: 'error' | 'warning' | 'suggestion'; title: string; description: string; line: number }> = [];

  // Generic checks
  if (!content.includes('\\documentclass')) {
    issues.push({
      id: '1',
      type: 'error',
      title: 'Missing Document Class',
      description: 'No \\documentclass declaration found. Required for LaTeX compilation.',
      line: 1,
    });
  }

  if (!content.includes('\\begin{document}')) {
    issues.push({
      id: '2',
      type: 'error',
      title: 'Missing Document Environment',
      description: 'Missing \\begin{document}...\\end{document} environment.',
      line: 1,
    });
  }

  if (!content.includes('\\title{')) {
    issues.push({
      id: '3',
      type: 'error',
      title: 'Missing Title',
      description: 'Your manuscript should have a title using \\title{}.',
      line: 10,
    });
  }

  if (!content.includes('\\begin{abstract}')) {
    issues.push({
      id: '4',
      type: 'error',
      title: 'Missing Abstract',
      description: `Abstract is required for ${conferenceId} submissions.`,
      line: 15,
    });
  }

  // Conference-specific checks
  if (conferenceId === '5' && !content.includes('\\keywords')) {
    issues.push({
      id: '5',
      type: 'warning',
      title: 'Missing Keywords',
      description: 'ICLR requires keywords section.',
      line: 40,
    });
  }

  if (content.match(/\\bibliographystyle/)) {
    issues.push({
      id: '6',
      type: 'suggestion',
      title: 'Update Bibliography Style',
      description: `Use the ${getConferenceFormattingRules(conferenceId)} bibliography style.`,
      line: content.split('\n').findIndex(line => line.includes('\\bibliographystyle')) + 1,
    });
  }

  return issues;
};
