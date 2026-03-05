const conferenceTemplates = [
  {
    id: 'ieee',
    name: 'IEEE',
    fullName: 'IEEE Conference Publications',
    logo: '📊',
    description: 'Two-column layout, numbered citations',
    format: 'Two Column',
  },
  {
    id: 'acm',
    name: 'ACM',
    fullName: 'ACM SIGCONF',
    logo: '🏛️',
    description: 'Single column, balanced citations',
    format: 'Single Column',
  },
  {
    id: 'nature',
    name: 'Nature',
    fullName: 'Nature Publishing',
    logo: '🌿',
    description: 'Scientific journal format, Harvard style',
    format: 'Single Column',
  },
  {
    id: 'springer',
    name: 'Springer',
    fullName: 'Springer Proceedings',
    logo: '📚',
    description: 'LNCS format, numbered citations',
    format: 'Two Column',
  },
  {
    id: 'arxiv',
    name: 'ArXiv',
    fullName: 'ArXiv Preprints',
    logo: '🔬',
    description: 'Preprint format, flexible layout',
    format: 'Single Column',
  },
  {
    id: 'iclr',
    name: 'ICLR',
    fullName: 'International Conference on Learning Representations',
    logo: '🤖',
    description: 'ML conference format, IEEE style',
    format: 'Two Column',
  },
];

export default conferenceTemplates;
