// Conference LaTeX Templates
export interface TemplateData {
  id: string;
  name: string;
  description: string;
  content: string;
  documentclass: string;
  usepackages: string[];
}

export const templateLibrary: Record<string, TemplateData> = {
  ieee: {
    id: 'ieee',
    name: 'IEEE',
    description: 'Two-column layout, numbered citations, Times font',
    documentclass: 'article',
    usepackages: ['[times,10pt,twocolumn]{article}', '[utf8]{inputenc}', 'times', 'cite'],
    content: `\\documentclass[10pt,twocolumn]{article}
\\usepackage{times}
\\usepackage[utf8]{inputenc}
\\usepackage{cite}
\\usepackage{graphicx}
\\usepackage{amsmath}
\\usepackage{amssymb}
\\usepackage{booktabs}

\\title{Your Paper Title Here}

\\author{Author 1\\\\
\\textit{Affiliation 1}\\\\
email1@university.edu
\\and
Author 2\\\\
\\textit{Affiliation 2}\\\\
email2@university.edu}

\\date{\\today}

\\begin{document}

\\maketitle

\\begin{abstract}
This is the abstract of your paper. It should summarize the main contributions, methodology, and results in a concise manner. The abstract typically contains 150-250 words and should capture the essence of your work.
\\end{abstract}

\\section{Introduction}
\\label{sec:introduction}

Your introduction should provide context and motivation for your work. Explain the problem you are solving and why it is important.

\\subsection{Contributions}

List the main contributions of your paper:
\\begin{itemize}
    \\item Contribution 1
    \\item Contribution 2
    \\item Contribution 3
\\end{itemize}

\\section{Related Work}
\\label{sec:related}

Discuss existing work in your field and explain how your work differs from or builds upon previous research.

\\section{Methodology}
\\label{sec:method}

Describe your proposed method or approach. Include:
\\begin{itemize}
    \\item Problem formulation
    \\item Proposed solution
    \\item Implementation details
\\end{itemize}

\\section{Experimental Results}
\\label{sec:experiments}

Present your experimental setup and results:

\\begin{table}[h]
\\centering
\\caption{Comparison with baseline methods}
\\begin{tabular}{lcc}
\\toprule
\\textbf{Method} & \\textbf{Accuracy} & \\textbf{F1-Score} \\\\
\\midrule
Baseline & 0.85 & 0.82 \\\\
Proposed & 0.92 & 0.90 \\\\
\\bottomrule
\\end{tabular}
\\label{tab:results}
\\end{table}

\\section{Discussion}
\\label{sec:discussion}

Discuss your findings, limitations, and implications.

\\section{Conclusion}
\\label{sec:conclusion}

Summarize your work and suggest directions for future research.

\\section*{Acknowledgments}

Acknowledge funding, collaborators, and helpful discussions.

\\begin{thebibliography}{99}

\\bibitem{ref1} Author, A., et al., ``Title of the paper'', \\textit{Conference/Journal Name}, 2024.

\\bibitem{ref2} Author, B., ``Another paper title'', \\textit{Publication Name}, 2023.

\\end{thebibliography}

\\end{document}`,
  },

  acm: {
    id: 'acm',
    name: 'ACM SIGCONF',
    description: 'Single column, author-year citations, Charter font',
    documentclass: 'article',
    usepackages: ['[utf8]{inputenc}', 'cite'],
    content: `\\documentclass[sigconf]{acmart}

\\usepackage[utf8]{inputenc}
\\usepackage{cite}
\\usepackage{graphicx}
\\usepackage{amsmath}
\\usepackage{booktabs}

\\title{Your Paper Title}

\\author{Author One}
\\affiliation{%
  \\institution{Institution Name}
  \\streetaddress{Street Address}
  \\city{City}
  \\state{State}
  \\country{Country}}
\\email{author1@example.com}

\\author{Author Two}
\\affiliation{%
  \\institution{Institution Name}
  \\streetaddress{Street Address}
  \\city{City}
  \\state{State}
  \\country{Country}}
\\email{author2@example.com}

\\date{\\today}

\\begin{document}

\\begin{abstract}
This abstract provides a comprehensive overview of your work. For ACM publications, abstracts should be clear, concise, and highlight the key contributions. Include the problem, methodology, and main results in 150-250 words.
\\end{abstract}

\\maketitle

\\section{Introduction}
\\label{sec:intro}

Provide context and motivation for your research. Clearly state the problem and its significance.

\\begin{itemize}
    \\item Key problem addressed
    \\item Why it matters
    \\item Existing gaps in the literature
\\end{itemize}

\\section{Related Work}
\\label{sec:related}

Survey existing approaches and position your work relative to prior art.

\\section{Proposed Approach}
\\label{sec:approach}

Describe your methodology in detail.

\\subsection{Subsection 1}
Details of your approach.

\\subsection{Subsection 2}
More implementation details.

\\section{Experimental Evaluation}
\\label{sec:evaluation}

\\begin{table}[t]
\\centering
\\caption{Summary of Results}
\\begin{tabular}{lrr}
\\toprule
\\textbf{Method} & \\textbf{Metric 1} & \\textbf{Metric 2} \\\\
\\midrule
Baseline & 75.2 & 68.4 \\\\
Proposed & 82.1 & 79.6 \\\\
\\bottomrule
\\end{tabular}
\\label{tab:results}
\\end{table}

\\section{Discussion}
\\label{sec:discussion}

Interpret your results and discuss their implications.

\\section{Conclusion}
\\label{sec:conclusion}

Summarize your contributions and outline future work.

\\section*{Acknowledgments}

Thank you to all contributors and funding agencies.

\\bibliographystyle{ACM-Reference-Format}
\\begin{thebibliography}{99}

\\bibitem{example}
AuthorName. 2024. Publication title. In \\textit{Venue Name}.

\\end{thebibliography}

\\end{document}`,
  },

  nature: {
    id: 'nature',
    name: 'Nature',
    description: 'Single column, superscript numbered citations, Georgia font',
    documentclass: 'article',
    usepackages: ['[utf8]{inputenc}', 'cite', 'graphicx'],
    content: `\\documentclass[11pt]{article}

\\usepackage[utf8]{inputenc}
\\usepackage{cite}
\\usepackage{graphicx}
\\usepackage{amsmath}
\\usepackage{amssymb}
\\usepackage{booktabs}
\\usepackage[margin=1in]{geometry}

\\title{Your Research Title}

\\author{Author Name$^{1,2}$, Co-author Name$^{1}$}

\\date{\\today}

\\begin{document}

\\maketitle

\\begin{abstract}
Nature-style abstracts should be concise and state the problem, approach, and main findings. Maximum 150 words. Include the significance of the work and potential applications.
\\end{abstract}

\\section*{Introduction}

Introduce your subject and justify the need for your research. Describe previous approaches and their limitations.

\\section*{Methods}

Detail your experimental design, materials, and procedures. This section should be comprehensive enough for reproduction.

\\subsection*{Study Design}

Describe your experimental setup.

\\subsection*{Data Analysis}

Explain your analytical methods.

\\section*{Results}

Present your findings clearly. Use tables and figures to highlight key results.

\\begin{table}[h]
\\centering
\\caption{\\textbf{Summary of Key Findings}}
\\begin{tabular}{lcc}
\\toprule
\\textbf{Category} & \\textbf{Value 1} & \\textbf{Value 2} \\\\
\\midrule
Sample 1 & 45.2 & 52.1 \\\\
Sample 2 & 48.7 & 55.3 \\\\
\\bottomrule
\\end{tabular}
\\end{table}

\\section*{Discussion}

Interpret your results in the context of existing knowledge. Discuss limitations and implications for future research.

\\section*{Conclusion}

State your conclusions clearly and briefly.

\\begin{thebibliography}{99}

\\bibitem{1} Author, A. et al. Title of article. \\textit{Nature} \\textbf{000}, 000--000 (2024).

\\bibitem{2} Author, B. Title. \\textit{Journal Name} \\textbf{10}, 100 (2023).

\\end{thebibliography}

\\end{document}`,
  },

  springer: {
    id: 'springer',
    name: 'Springer LNCS',
    description: 'Two-column, numbered citations, Computer Modern font',
    documentclass: 'llncs',
    usepackages: ['[utf8]{inputenc}', 'cite'],
    content: `\\documentclass{llncs}

\\usepackage{cite}
\\usepackage{url}
\\usepackage{graphicx}
\\usepackage{amsmath}
\\usepackage{amssymb}
\\usepackage{booktabs}

\\begin{frontmatter}

\\title{Title of Your Paper}

\\author{
  Author Name \\inst{1}
  \\and
  Co-Author Name \\inst{1,2}
}

\\institute{
  Institution 1, City, Country \\and
  Institution 2, City, Country
}

\\end{frontmatter}

\\begin{abstract}

This is your paper abstract. For Springer LNCS proceedings, provide a concise summary of the problem, methodology, and key results. Keep it to 150-250 words.

\\keywords{keyword1, keyword2, keyword3, keyword4}

\\end{abstract}

\\section{Introduction}
\\label{sec:intro}

Start with a clear statement of the problem and its motivation. Explain why your work is important and how it advances the field.

\\section{Related Work}
\\label{sec:related}

Review previous research and position your work within existing literature.

\\section{Proposed Method}
\\label{sec:method}

Describe your approach in detail:

\\subsection{Subsection 1}
\\label{subsec:sub1}

Details here.

\\subsection{Subsection 2}
\\label{subsec:sub2}

More details.

\\section{Experiments}
\\label{sec:experiments}

\\begin{table}
\\centering
\\caption{Experimental Results}
\\begin{tabular}{lcc}
\\toprule
\\textbf{Method} & \\textbf{Accuracy} & \\textbf{Speed} \\\\
\\midrule
Baseline & 82.1 & 1.2 \\\\
Proposed & 89.5 & 1.1 \\\\
\\bottomrule
\\end{tabular}
\\label{tab:results}
\\end{table}

\\section{Discussion}
\\label{sec:discussion}

Discuss the implications of your results and how they compare with existing approaches.

\\section{Conclusion}
\\label{sec:conclusion}

Summarize your contributions and suggest future research directions.

\\begin{thebibliography}{99}

\\bibitem{ref1} Author, A., Smith, B.: Title of article. In: Proceedings of Conference, pp. 123--134 (2024)

\\bibitem{ref2} Jones, C.: Another work title. Journal Name 10(5), 567--580 (2023)

\\end{thebibliography}

\\end{document}`,
  },

  arxiv: {
    id: 'arxiv',
    name: 'ArXiv Preprint',
    description: 'Flexible single column, numbered citations, any font',
    documentclass: 'article',
    usepackages: ['[utf8]{inputenc}', 'cite', 'graphicx'],
    content: `\\documentclass[12pt]{article}

\\usepackage[utf8]{inputenc}
\\usepackage{cite}
\\usepackage{graphicx}
\\usepackage{amsmath}
\\usepackage{amssymb}
\\usepackage{booktabs}
\\usepackage{hyperref}

\\title{Your Paper Title}

\\author{
  Author One\\\\
  \\texttt{email@university.edu}
  \\and
  Author Two\\\\
  \\texttt{email@university.edu}
}

\\date{\\today}

\\begin{document}

\\maketitle

\\begin{abstract}
This is a preprint version of your paper. The abstract should provide a comprehensive overview of the work including motivation, methodology, and key findings. ArXiv allows for longer abstracts, typically 200-500 words.
\\end{abstract}

\\section{Introduction}
\\label{sec:introduction}

Introduce your topic and provide sufficient context for a general computer science audience. Include motivation and a clear statement of contributions.

\\section{Related Work}
\\label{sec:related}

Comprehensive survey of related work, positioning your contribution within the broader field.

\\section{Method}
\\label{sec:method}

\\subsection{Problem Formulation}
\\label{subsec:problem}

Define your problem formally.

\\subsection{Proposed Solution}
\\label{subsec:solution}

Describe your approach in detail.

\\subsection{Implementation}
\\label{subsec:implementation}

Include implementation details and algorithms.

\\section{Experiments}
\\label{sec:experiments}

Design of experiments, datasets used, and baseline comparisons.

\\begin{table}[h]
\\centering
\\caption{Quantitative Results}
\\label{tab:quantitative}
\\begin{tabular}{lccc}
\\toprule
\\textbf{Method} & \\textbf{Metric A} & \\textbf{Metric B} & \\textbf{Metric C} \\\\
\\midrule
Baseline 1 & 0.650 & 0.720 & 0.680 \\\\
Baseline 2 & 0.710 & 0.750 & 0.730 \\\\
Our Method & 0.820 & 0.835 & 0.810 \\\\
\\bottomrule
\\end{tabular}
\\end{table}

\\section{Analysis}
\\label{sec:analysis}

Detailed analysis of results and ablation studies.

\\section{Discussion}
\\label{sec:discussion}

Broader implications and limitations of the work.

\\section{Conclusion}
\\label{sec:conclusion}

Summary and future directions.

\\begin{thebibliography}{99}

\\bibitem{example1} Smith, J., et al., ``Example Paper Title'', arXiv preprint arXiv:2024.12345 (2024).

\\bibitem{example2} Jones, A., ``Another Research Paper'', arXiv preprint arXiv:2023.11111 (2023).

\\end{thebibliography}

\\end{document}`,
  },

  iclr: {
    id: 'iclr',
    name: 'ICLR',
    description: 'Two-column, numbered citations, Times font',
    documentclass: 'article',
    usepackages: ['[utf8]{inputenc}', 'cite', 'graphicx'],
    content: `\\documentclass{article}
\\usepackage{times}
\\usepackage[utf8]{inputenc}
\\usepackage{cite}
\\usepackage{graphicx}
\\usepackage{amsmath}
\\usepackage{amssymb}
\\usepackage{booktabs}
\\usepackage[colorlinks=true, citecolor=blue, linkcolor=blue]{hyperref}

\\title{Your Paper Title for ICLR}

\\author{
  Author One$^1$ \\\\
  \\texttt{author1@email.com} \\and
  Author Two$^{1,2}$ \\\\
  \\texttt{author2@email.com}
}

\\date{\\today}

\\begin{document}

\\maketitle

\\begin{abstract}
ICLR submissions should have clear, concise abstracts summarizing the key contributions, methodology, and results. This is crucial for machine learning and deep learning papers. Include motivation, your approach, and main results in 150-250 words.
\\end{abstract}

\\section{Introduction}
\\label{sec:intro}

Motivation and position your work in the machine learning landscape.

\\section{Related Work}
\\label{sec:related}

Discussion of related papers and how this work differs or improves upon them.

\\section{Methodology}
\\label{sec:method}

\\subsection{Problem Setup}
Formal problem definition.

\\subsection{Proposed Approach}
Your methodology with mathematical notation.

\\begin{equation}
  L = \\sum_{i=1}^{N} \\mathcal{L}(y_i, \\hat{y}_i)
  \\label{eq:loss}
\\end{equation}

\\subsection{Theoretical Analysis}
Any theoretical results or guarantees.

\\section{Experiments}
\\label{sec:experiments}

\\subsection{Experimental Setup}
Datasets, baselines, hyperparameters.

\\begin{table}[h]
\\centering
\\caption{Experimental Results}
\\label{tab:results}
\\begin{tabular}{lrr}
\\toprule
\\textbf{Method} & \\textbf{Test Acc.} & \\textbf{Test Loss} \\\\
\\midrule
Baseline & 92.1\\% & 0.234 \\\\
Proposed & 95.3\\% & 0.156 \\\\
\\bottomrule
\\end{tabular}
\\end{table}

\\subsection{Ablation Studies}
Analysis of different components.

\\section{Discussion}
\\label{sec:discussion}

Interpretation of results and broader impact discussion.

\\section{Conclusion}
\\label{sec:conclusion}

Summary of contributions and future work.

\\appendix

\\section{Additional Experiments}
\\label{ap:additional}

More experimental details and results.

\\begin{thebibliography}{99}

\\bibitem{goodfellow} Goodfellow, I., Bengio, Y., \\& Courville, A. (2016). \\textit{Deep Learning}. MIT Press.

\\bibitem{recent} RecentAuthor, A. (2024). Important ML Paper. In Proceedings of ICLR.

\\end{thebibliography}

\\end{document}`,
  },

  cvpr: {
    id: 'cvpr',
    name: 'CVPR',
    description: 'Two-column 10pt, numbered citations, Times font',
    documentclass: 'article',
    usepackages: ['[times,10pt,twocolumn]{article}', '[utf8]{inputenc}'],
    content: `\\documentclass[10pt,twocolumn,a4paper]{article}

\\usepackage{cvpr}
\\usepackage{times}
\\usepackage[utf8]{inputenc}
\\usepackage{cite}
\\usepackage{graphicx}
\\usepackage{amsmath}
\\usepackage{amssymb}
\\usepackage{booktabs}

\\cvprfinalcopy

\\def\\cvprPaperID{****}
\\def\\confName{CVPR}
\\def\\confYear{2024}

\\title{Your Paper Title Here}

\\author{
  First Author\\\\
  Institution\\\\
  {\\tt email@institution.edu}
  \\and
  Second Author\\\\
  Institution\\\\
  {\\tt email@institution.edu}
}

\\begin{document}

\\maketitle

\\begin{abstract}
The abstract should provide a concise summary of the paper. For CVPR papers, this typically includes the problem statement, your approach, and the main results. Keep it clear and focused (150-250 words). Mention if code will be released.
\\end{abstract}

\\section{Introduction}
\\label{sec:intro}

Start with the motivation for your work. Explain the problem you are solving and why it is important in computer vision.

\\section{Related Work}
\\label{sec:related}

Comprehensive review of existing approaches in computer vision and related areas. Position your work clearly relative to prior art.

\\section{Method}
\\label{sec:method}

\\subsection{Overview}
Provide an overview of your approach.

\\subsection{Technical Details}
Describe the key components of your method:

\\begin{equation}
  y = f(x; \\theta)
  \\label{eq:model}
\\end{equation}

\\subsection{Implementation Details}
Include enough detail for reproducibility.

\\section{Experiments}
\\label{sec:experiments}

\\subsection{Datasets and Evaluation}
Description of datasets and metrics used.

\\begin{table}[h]
\\centering
\\caption{Quantitative Results}
\\label{tab:results}
\\begin{tabular}{lcc}
\\toprule
\\textbf{Method} & \\textbf{mAP} & \\textbf{FPS} \\\\
\\midrule
Baseline & 78.2 & 24.5 \\\\
Ours & 85.1 & 23.8 \\\\
\\bottomrule
\\end{tabular}
\\end{table}

\\subsection{Comparisons}
Comparison with state-of-the-art methods.

\\subsection{Ablation Study}
Analysis of different components.

\\section{Discussion}
\\label{sec:discussion}

Discuss your findings and their implications for the field.

\\section{Conclusion}
\\label{sec:conclusion}

Summarize your contributions and suggest future work.

\\begin{thebibliography}{99}

\\bibitem{ref1} Author, A. et al., ``Paper Title'', In CVPR, 2024.

\\bibitem{ref2} Author, B., ``Another Important Work'', In ICCV, 2023.

\\end{thebibliography}

\\end{document}`,
  },

  acl: {
    id: 'acl',
    name: 'ACL',
    description: 'Single column, author-year citations, Times font',
    documentclass: 'article',
    usepackages: ['[utf8]{inputenc}', 'cite'],
    content: `\\documentclass[11pt]{article}

\\usepackage[utf8]{inputenc}
\\usepackage{acl}
\\usepackage{cite}
\\usepackage{graphicx}
\\usepackage{amsmath}
\\usepackage{amssymb}
\\usepackage{booktabs}

\\title{Your NLP Paper Title}

\\author{
  Author One \\\\
  \\textit{Institution 1} \\\\
  {\\tt author1@institution.edu}
  \\and
  Author Two \\\\
  \\textit{Institution 2} \\\\
  {\\tt author2@institution.edu}
}

\\date{\\today}

\\begin{document}

\\maketitle

\\begin{abstract}
ACL papers should have clear abstracts describing the NLP problem, methodology, and results. Include motivation for the work and its significance to the NLP community. Keep abstracts to 150-250 words and avoid citations.
\\end{abstract}

\\section{Introduction}
\\label{sec:introduction}

Introduce your NLP task and explain why it is important. Clearly state your contributions and how this work advances natural language processing.

\\section{Related Work}
\\label{sec:related}

Discuss previous work in your specific NLP area (machine translation, parsing, language models, etc.). Position your contributions clearly relative to prior work.

\\section{Approach}
\\label{sec:approach}

\\subsection{Problem Formulation}
Formally define your task.

\\subsection{Model Architecture}
Describe your model or methodology in detail. Include mathematical notation where appropriate.

\\begin{equation}
  P(y|x) = \\frac{\\exp(f(x,y))}{\\sum_{y'} \\exp(f(x,y'))}
  \\label{eq:softmax}
\\end{equation}

\\subsection{Training}
Explain your training procedure and loss functions.

\\section{Experiments}
\\label{sec:experiments}

\\subsection{Datasets}
Describe datasets used for evaluation.

\\begin{table}[h]
\\centering
\\caption{Main Results}
\\label{tab:results}
\\begin{tabular}{lcc}
\\toprule
\\textbf{System} & \\textbf{BLEU} & \\textbf{METEOR} \\\\
\\midrule
Baseline & 28.5 & 31.2 \\\\
Our Model & 32.1 & 35.4 \\\\
\\bottomrule
\\end{tabular}
\\end{table}

\\subsection{Baselines}
Comparison with relevant baseline systems.

\\subsection{Analysis}
Error analysis and qualitative examples.

\\section{Conclusion}
\\label{sec:conclusion}

Summarize your contributions and discuss future directions.

\\begin{thebibliography}{99}

\\bibitem{ref1} Author, A., et al. (2024) ``Important NLP Paper.'' In \\textit{Proceedings of ACL}.

\\bibitem{ref2} Researcher, B. (2023) ``Relevant Prior Work.'' In \\textit{Proceedings of EMNLP}.

\\end{thebibliography}

\\end{document}`,
  },
};

export function getTemplate(conferenceId: string): TemplateData | null {
  return templateLibrary[conferenceId.toLowerCase()] || null;
}

export function getAllTemplates(): TemplateData[] {
  return Object.values(templateLibrary);
}

export function getTemplateContent(conferenceId: string): string {
  const template = getTemplate(conferenceId);
  return template?.content || templateLibrary.ieee.content;
}
