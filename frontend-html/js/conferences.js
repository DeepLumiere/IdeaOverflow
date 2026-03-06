/* ═══════════════════════════════════════════
   Conference Templates & Formatting Config
   ═══════════════════════════════════════════ */

const CONFERENCE_TEMPLATES = [
    { id: 'ieee', name: 'IEEE', fullName: 'IEEE Conference Publications', logo: '📊', description: 'Two-column layout, numbered citations', format: 'Two Column' },
    { id: 'acm', name: 'ACM', fullName: 'ACM SIGCONF', logo: '🏛️', description: 'Single column, balanced citations', format: 'Single Column' },
    { id: 'nature', name: 'Nature', fullName: 'Nature Publishing', logo: '🌿', description: 'Scientific journal format, Harvard style', format: 'Single Column' },
    { id: 'springer', name: 'Springer', fullName: 'Springer Proceedings', logo: '📚', description: 'LNCS format, numbered citations', format: 'Two Column' },
    { id: 'arxiv', name: 'ArXiv', fullName: 'ArXiv Preprints', logo: '🔬', description: 'Preprint format, flexible layout', format: 'Single Column' },
    { id: 'iclr', name: 'ICLR', fullName: 'Intl. Conf. Learning Representations', logo: '🤖', description: 'ML conference format, IEEE style', format: 'Two Column' },
    { id: 'cvpr', name: 'CVPR', fullName: 'IEEE/CVF Computer Vision', logo: '👁️', description: 'Computer vision format, two-column', format: 'Two Column' },
    { id: 'acl', name: 'ACL', fullName: 'Assoc. Computational Linguistics', logo: '🗣️', description: 'NLP format', format: 'Single Column' },
];

const CONFERENCE_FORMATS = {
    ieee: { layout: 'two-column', fontFamily: '"Times New Roman", Times, serif', baseFontSize: '10pt', titleFontSize: '1.5rem', headingNumbered: true, headingTransform: 'uppercase', citationStyle: 'numbered', abstractLabel: 'Abstract', showKeywords: false, paperPadding: '2rem 2.5rem', headerInfo: 'IEEE Conference Publication', headerColor: '#1a56db', accentColor: '#1a56db', authorStyle: 'inline', sectionDivider: false },
    acm: { layout: 'single', fontFamily: 'Charter, "Bitstream Charter", "Times New Roman", serif', baseFontSize: '10pt', titleFontSize: '1.75rem', headingNumbered: true, headingTransform: 'titlecase', citationStyle: 'author-year', abstractLabel: 'ABSTRACT', showKeywords: true, paperPadding: '2.5rem 3rem', headerInfo: 'ACM SIGCONF', headerColor: '#0e7490', accentColor: '#0e7490', authorStyle: 'block', sectionDivider: false },
    nature: { layout: 'single', fontFamily: 'Georgia, "Times New Roman", serif', baseFontSize: '11pt', titleFontSize: '2rem', headingNumbered: false, headingTransform: 'none', citationStyle: 'superscript', abstractLabel: 'Abstract', showKeywords: false, paperPadding: '3rem 3.5rem', headerInfo: 'Nature Publishing Group', headerColor: '#dc2626', accentColor: '#dc2626', authorStyle: 'superscript', sectionDivider: true },
    springer: { layout: 'two-column', fontFamily: '"Computer Modern", "Latin Modern", Georgia, serif', baseFontSize: '10pt', titleFontSize: '1.5rem', headingNumbered: true, headingTransform: 'titlecase', citationStyle: 'numbered', abstractLabel: 'Abstract.', showKeywords: true, paperPadding: '2rem 2.5rem', headerInfo: 'Springer LNCS Proceedings', headerColor: '#4338ca', accentColor: '#4338ca', authorStyle: 'inline', sectionDivider: false },
    arxiv: { layout: 'single', fontFamily: '"Computer Modern", "Latin Modern", Georgia, serif', baseFontSize: '12pt', titleFontSize: '1.75rem', headingNumbered: true, headingTransform: 'titlecase', citationStyle: 'numbered', abstractLabel: 'Abstract', showKeywords: false, paperPadding: '2.5rem 3rem', headerInfo: 'arXiv Preprint', headerColor: '#b91c1c', accentColor: '#b91c1c', authorStyle: 'inline', sectionDivider: false },
    iclr: { layout: 'two-column', fontFamily: '"Times New Roman", Times, serif', baseFontSize: '10pt', titleFontSize: '1.5rem', headingNumbered: true, headingTransform: 'titlecase', citationStyle: 'numbered', abstractLabel: 'Abstract', showKeywords: true, paperPadding: '2rem 2.5rem', headerInfo: 'ICLR Submission', headerColor: '#7c3aed', accentColor: '#7c3aed', authorStyle: 'inline', sectionDivider: false },
    cvpr: { layout: 'two-column', fontFamily: '"Times New Roman", Times, serif', baseFontSize: '10pt', titleFontSize: '1.5rem', headingNumbered: true, headingTransform: 'titlecase', citationStyle: 'numbered', abstractLabel: 'Abstract', showKeywords: false, paperPadding: '2rem 2.5rem', headerInfo: 'IEEE/CVF CVPR', headerColor: '#059669', accentColor: '#059669', authorStyle: 'inline', sectionDivider: false },
    acl: { layout: 'single', fontFamily: '"Times New Roman", Times, serif', baseFontSize: '11pt', titleFontSize: '1.75rem', headingNumbered: true, headingTransform: 'titlecase', citationStyle: 'author-year', abstractLabel: 'Abstract', showKeywords: false, paperPadding: '2.5rem 3rem', headerInfo: 'ACL Submission', headerColor: '#ea580c', accentColor: '#ea580c', authorStyle: 'inline', sectionDivider: false },
};

const CITATION_MAP = { ieee: 'Numbered [1]', acm: 'Author-Year', nature: 'Superscript', springer: 'Numbered [1]', arxiv: 'Numbered [1]', iclr: 'Numbered [1]', cvpr: 'Numbered [1]', acl: 'Author-Year' };
const FONT_MAP = { ieee: 'Times New Roman', acm: 'Charter', nature: 'Georgia', springer: 'Computer Modern', arxiv: 'Computer Modern', iclr: 'Times New Roman', cvpr: 'Times New Roman', acl: 'Times New Roman' };

function formatCitation(style, index) {
    switch (style) {
        case 'numbered': return `[${index}]`;
        case 'author-year': return `(Author et al., ${2024 - index})`;
        case 'superscript': return `${index}`;
        default: return `[${index}]`;
    }
}

function transformHeading(text, transform) {
    switch (transform) {
        case 'uppercase': return text.toUpperCase();
        case 'titlecase': return text.replace(/\b\w/g, c => c.toUpperCase());
        case 'none': default: return text;
    }
}

window.Conferences = {
    CONFERENCE_TEMPLATES,
    CONFERENCE_FORMATS,
    CITATION_MAP,
    FONT_MAP,
    formatCitation,
    transformHeading,
};
