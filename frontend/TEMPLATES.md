# Conference Paper Templates Guide

This guide explains how to use the conference paper templates in the IdeaOverflow editor.

## Available Templates

The editor supports LaTeX templates for the following conferences and formats:

### 1. **IEEE** (Two-Column)
- Format: Two-column layout with numbered citations
- Best for: IEEE conferences and technical publications
- Style: Times font, IEEE citation style
- Use case: Conferences like: ICRA, IROS, ICCV

### 2. **ACM SIGCONF** (Single Column)
- Format: Single-column layout with balanced citations
- Best for: ACM conferences and symposiums
- Style: Charter font, ACM reference format
- Use case: CHI, UIST, IUI, CSCW

### 3. **CVPR** (Two-Column)
- Format: Two-column layout optimized for computer vision
- Best for: IEEE/CVF Computer Vision conferences
- Style: Specialized CVPR class, IEEE style
- Use case: CVPR, ICCV, WACV

### 4. **ICLR** (Two-Column)
- Format: Two-column ML conference format
- Best for: International Conference on Learning Representations
- Style: IEEE style with ML-specific sections
- Use case: ICLR, NeurIPS, ICML

### 5. **ACL** (Single Column)
- Format: Single-column NLP format
- Best for: Natural language processing conferences
- Style: ACL standard format
- Use case: ACL, EMNLP, NAACL

### 6. **Springer LNCS** (Two-Column)
- Format: Lecture Notes in Computer Science format
- Best for: Springer proceedings and conferences
- Style: LNCS class, numbered citations
- Use case: ECCV, BMVC, ICCV workshops

### 7. **Nature** (Single Column)
- Format: Scientific journal format with Harvard citations
- Best for: Nature, Science, and similar journals
- Style: Georgia font, Harvard citation style
- Use case: Journal submissions, scientific papers

### 8. **ArXiv** (Single Column)
- Format: Preprint format with flexible layout
- Best for: ArXiv submissions and preprints
- Style: Standard article class with extended sections
- Use case: Quick dissemination, preprints

## How to Use Templates

### Method 1: Via Sidebar (Recommended)

1. Open the editor
2. Locate the **"Conference Templates"** section in the left sidebar
3. Click on any template card to select it
4. The LaTeX editor will automatically update with the selected template

### Method 2: Via LaTeX Editor Dropdown

1. Look at the LaTeX Editor panel on the left
2. Find the **"Conference Template"** dropdown selector
3. Select your desired conference template
4. The editor content updates immediately

### Method 3: Upload Your Own File

1. Upload your own LaTeX file through the file upload interface
2. Your custom file will be displayed in the editor
3. The template selector will be unavailable (since you're using custom content)

## Template Features

Each template includes:

- **Document class**: Appropriate for the conference format
- **Required packages**: All necessary LaTeX packages pre-imported
- **Author/Affiliation fields**: Pre-formatted for the conference style
- **Sample sections**: Introduction, Related Work, Methodology, Experiments, Discussion, Conclusion
- **Figure/Table examples**: Properly formatted for the template style
- **Bibliography format**: Conference-specific citation style
- **Sample equations**: For technical papers that need mathematical content

## Customizing Templates

You can:

1. **Edit the template content** directly in the LaTeX editor
2. **Add more sections** to match your paper's structure
3. **Modify packages** based on your specific needs
4. **Update styles** to customize appearance while maintaining conference requirements

## JSON Structure

The editor also maintains a JSON representation of your paper including:

- Title and authors
- Abstract
- Section hierarchy
- Tables and figures
- Images with captions
- Document metadata

Switch between the JSON editor (right panel) and LaTeX editor (left panel) to edit different aspects.

## Live Preview

The **Preview Panel** (center/right) shows:

- Conference-specific formatting
- Live updates as you edit
- Author and affiliation layout
- Abstract and section formatting
- Proper spacing and typography

## Tips for Best Results

1. **Choose the right template early** - Different conferences have different formatting requirements
2. **Follow the provided structure** - Each template has sections organized as per conference guidelines
3. **Check citation style** - Verify the bibliography format matches your references
4. **Test with sample content** - The default template includes sample content for reference
5. **Use the preview** - Always check the preview panel to ensure proper formatting
6. **Export for submission** - Once complete, you can compile the LaTeX for submission

## File Preparation

Before submission:

1. Compile the LaTeX to PDF
2. Verify all images are properly embedded
3. Check that all references are complete
4. Ensure page limits are met
5. Validate against conference requirements

## Troubleshooting

### Template not updating?
- Make sure no file is uploaded (file uploads override templates)
- Try selecting the template again
- Refresh the page if needed

### Missing packages?
- The templates include all essential packages
- Add custom packages to the preamble as needed

### Citation issues?
- Each template uses its conference's specific bibliography style
- Refer to the conference's author guidelines for citation formatting

## Additional Resources

- [IEEE LaTeX Resources](https://www.ieee.org/conferences/publishing/templates.html)
- [ACM Proceedings Templates](https://www.acm.org/publications/proceedings-template)
- [Springer LNCS Instructions](https://www.springer.com/gp/computer-science/lncs/conference-proceedings-guidelines)
- [Nature Formatting Guide](https://www.nature.com/nature/for-authors/formatting-guide)
- [ArXiv TeX FAQ](https://info.arxiv.org/help/faq/errors.html)

---

**Last Updated**: March 2025
**Version**: 1.0
