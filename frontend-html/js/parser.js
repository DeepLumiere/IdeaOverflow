/* ═══════════════════════════════════════════
   Document Parser & Transformer
   Converts raw paper.json → internal PaperDoc
   ═══════════════════════════════════════════ */

/**
 * Collect paragraph/equation text from a content array
 * (stops when it hits sections/subsections).
 */
function collectParagraphs(items) {
    const parts = [];
    for (const item of items) {
        if (item.type === 'paragraph' && item.text) parts.push(item.text);
        else if (item.type === 'equation' && item.math) parts.push(`$${item.math}$`);
        else if (['section', 'subsection', 'subsubsection'].includes(item.type)) break;
    }
    return parts.join('\n\n');
}

function _uid(prefix) {
    return `${prefix}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Transform the nested paper.json structure into a flat PaperDoc.
 */
function transformPaperJsonToDoc(raw) {
    const now = Date.now();
    const sections = [];
    const tables = [];
    const images = [];
    const references = Array.isArray(raw.references)
        ? raw.references.map(r => ({ id: r.id, citation: r.citation }))
        : [];
    let abstract = '';

    function processNested(items, parentId, isSub) {
        for (const item of items) {
            if ((item.type === 'subsection' || item.type === 'subsubsection') && !isSub) {
                const sec = sections.find(s => s.id === parentId);
                if (sec) {
                    sec.subsections.push({
                        id: _uid('sub'),
                        name: item.title || 'Untitled',
                        content: item.content ? collectParagraphs(item.content) : '',
                    });
                }
            } else if (item.type === 'table') {
                tables.push({
                    id: _uid('table'),
                    caption: item.caption,
                    headers: item.headers || [],
                    rows: item.data || [],
                    sectionId: parentId,
                });
            } else if (item.type === 'image') {
                images.push({
                    id: _uid('img'),
                    url: item.src || '',
                    caption: item.caption,
                    sectionId: parentId,
                });
            }
            if (item.content) processNested(item.content, parentId, (item.type || '').includes('section'));
        }
    }

    for (const item of (raw.content || [])) {
        if (item.type === 'section') {
            const id = _uid('sec');
            sections.push({
                id,
                name: item.title || 'Untitled',
                content: item.content ? collectParagraphs(item.content) : '',
                subsections: [],
            });
            if (item.content) processNested(item.content, id);
        } else if (item.type === 'paragraph' && item.text && sections.length === 0) {
            abstract += (abstract ? '\n\n' : '') + item.text;
        }
    }

    return {
        title: raw.title || 'Untitled',
        authors: (raw.authors || []).map(a => ({ name: a.name, affiliation: a.affiliation, email: a.email })),
        abstract,
        sections,
        tables,
        images,
        references,
        updatedAt: now,
    };
}

/**
 * Safely coerce any unknown input into a valid PaperDoc.
 */
function coerceDoc(input) {
    const now = Date.now();
    if (!input || typeof input !== 'object') {
        return { ...getDefaultDoc(), updatedAt: now };
    }
    return {
        title: typeof input.title === 'string' ? input.title : 'Paper Title',
        abstract: typeof input.abstract === 'string' ? input.abstract : '',
        authors: Array.isArray(input.authors) ? input.authors : [],
        sections: Array.isArray(input.sections) ? input.sections : [],
        tables: Array.isArray(input.tables) ? input.tables : [],
        images: Array.isArray(input.images) ? input.images : [],
        references: Array.isArray(input.references) ? input.references : [],
        updatedAt: typeof input.updatedAt === 'number' ? input.updatedAt : now,
    };
}

function getDefaultDoc() {
    return {
        title: 'Paper Title',
        authors: [
            { name: 'Author 1', affiliation: 'University / Organization', email: 'author1@example.com' },
            { name: 'Author 2', affiliation: 'University / Organization', email: 'author2@example.com' },
        ],
        abstract: 'Write your abstract here. This preview updates instantly as you add sections, subsections, tables, and images.',
        sections: [
            { id: 'sec-intro', name: 'Introduction', content: 'Introduce the problem, context, and motivation.', subsections: [] },
        ],
        tables: [],
        images: [],
        references: [],
        updatedAt: Date.now(),
    };
}

window.Parser = {
    transformPaperJsonToDoc,
    coerceDoc,
    getDefaultDoc,
};
