export const conferences = [
  {
    id: 1,
    name: 'IEEE Conference',
    template: 'ieee',
    description: 'Institute of Electrical and Electronics Engineers',
    icon: '⚡'
  },
  {
    id: 2,
    name: 'ACM Conference',
    template: 'acm',
    description: 'Association for Computing Machinery',
    icon: '💻'
  },
  {
    id: 3,
    name: 'Springer Conference',
    template: 'springer',
    description: 'Springer Nature',
    icon: '📚'
  }
];

export const initialDocument = {
  title: 'Your Paper Title',
  authors: ['Author 1', 'Author 2'],
  abstract: 'This is a sample abstract for your paper. It should provide a brief summary of your research.',
  sections: [
    {
      id: 1,
      type: 'section',
      name: 'Introduction',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      subsections: []
    },
    {
      id: 2,
      type: 'section',
      name: 'Methodology',
      content: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
      subsections: [
        {
          id: 3,
          type: 'subsection',
          name: 'Data Collection',
          content: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
        }
      ]
    }
  ],
  tables: [
    {
      id: 4,
      type: 'table',
      caption: 'Sample Data Table',
      headers: ['Column 1', 'Column 2', 'Column 3'],
      rows: [
        ['Data 1', 'Data 2', 'Data 3'],
        ['Data 4', 'Data 5', 'Data 6']
      ]
    }
  ],
  images: [
    {
      id: 5,
      type: 'image',
      caption: 'Sample Figure',
      url: 'https://via.placeholder.com/400x200'
    }
  ]
};