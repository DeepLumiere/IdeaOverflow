/* ═══════════════════════════════════════════
   Conference Templates & Formatting Config
   ═══════════════════════════════════════════ */

const CONFERENCE_TEMPLATES = [
    { id: 'neurips', name: 'neurIPS', fullName: 'neurIPS', logo: '📊', description: 'Two-column layout, numbered citations', format: 'Two Column' },
    { id: 'cvpr', name: 'CVPR', fullName: 'CVPR', logo: '🏛️', description: 'Single column, balanced citations', format: 'Single Column' },
    
    
];

const CONFERENCE_FORMATS = {
    ieee: { layout: 'two-column', fontFamily: '"Times New Roman", Times, serif', baseFontSize: '10pt', titleFontSize: '1.5rem', headingNumbered: true, headingTransform: 'uppercase', citationStyle: 'numbered', abstractLabel: 'Abstract', showKeywords: false, paperPadding: '2rem 2.5rem', headerInfo: 'IEEE Conference Publication', headerColor: '#1a56db', accentColor: '#1a56db', authorStyle: 'inline', sectionDivider: false },
    acm: { layout: 'single', fontFamily: 'Charter, "Bitstream Charter", "Times New Roman", serif', baseFontSize: '10pt', titleFontSize: '1.75rem', headingNumbered: true, headingTransform: 'titlecase', citationStyle: 'author-year', abstractLabel: 'ABSTRACT', showKeywords: true, paperPadding: '2.5rem 3rem', headerInfo: 'ACM SIGCONF', headerColor: '#0e7490', accentColor: '#0e7490', authorStyle: 'block', sectionDivider: false },
    
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
