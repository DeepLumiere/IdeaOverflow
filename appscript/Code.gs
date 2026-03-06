/**
 * Creates the menu item when the document opens
 */
function onOpen() {
  DocumentApp.getUi().createAddonMenu()
      .addItem('Open IdeaOverflow', 'showSidebar')
      .addToUi();
}

/**
 * Opens the sidebar
 */
function showSidebar() {
  var html = HtmlService.createHtmlOutputFromFile('Sidebar')
      .setTitle('IdeaOverflow');
  DocumentApp.getUi().showSidebar(html);
}

/**
 * Gets the entire document text
 */
function getDocText() {
  return DocumentApp.getActiveDocument().getBody().getText();
}

/**
 * Gets the currently highlighted text
 */
function getSelectedText() {
  var selection = DocumentApp.getActiveDocument().getSelection();
  if (!selection) return null;

  var text = [];
  var elements = selection.getRangeElements();
  for (var i = 0; i < elements.length; i++) {
    var element = elements[i].getElement();
    if (element.editAsText) {
      var elementText = element.asText().getText();
      if (elements[i].isPartial()) {
        elementText = elementText.substring(elements[i].getStartOffset(), elements[i].getEndOffsetInclusive() + 1);
      }
      text.push(elementText);
    }
  }
  return text.join('\n');
}

/**
 * Replaces the currently highlighted text with new text
 */
function replaceSelectedText(newText) {
  var selection = DocumentApp.getActiveDocument().getSelection();
  if (!selection) return false;

  var elements = selection.getRangeElements();
  var firstElement = elements[0].getElement();
  var isPartial = elements[0].isPartial();

  // Clear the existing selection
  for (var i = elements.length - 1; i >= 0; i--) {
    var el = elements[i].getElement();
    if (el.editAsText) {
      if (elements[i].isPartial()) {
        el.asText().deleteText(elements[i].getStartOffset(), elements[i].getEndOffsetInclusive());
      } else {
        el.removeFromParent();
      }
    }
  }

  // Insert the new text at the beginning of where the selection was
  if (firstElement.editAsText) {
    if (isPartial) {
      firstElement.asText().insertText(elements[0].getStartOffset(), newText);
    } else {
       // Fallback if the whole element was deleted
       DocumentApp.getActiveDocument().getCursor().insertText(newText);
    }
  }
  return true;
}

const CONFERENCE_PRESETS = {
    "ACL": {
        "name": "Association for Computational Linguistics (ACL)",
        "structure": "Abstract, Introduction, Background/Related Work, Methodology, Experiments, Results, Discussion, Conclusion, Limitations, Ethics Statement.",
        "topics": "NLP, Computational Linguistics, Dialogue, Semantics, Syntax, Machine Translation."
    },
    "EMNLP": {
        "name": "Empirical Methods in Natural Language Processing (EMNLP)",
        "structure": "Abstract, Introduction, Related Work, Data, Methodology, Experimental Setup, Results, Analysis/Discussion, Conclusion, Limitations.",
        "topics": "Empirical NLP, Text Mining, Information Extraction, Large Language Models, Evaluation."
    },
    "CVPR": {
        "name": "Computer Vision and Pattern Recognition (CVPR)",
        "structure": "Abstract, Introduction, Related Work, Approach/Method, Experiments, Conclusion. (Strict anonymity/formatting).",
        "topics": "Computer Vision, Image Processing, Object Detection, 3D Vision, Video Analysis."
    },
    "NeurIPS": {
        "name": "Neural Information Processing Systems (NeurIPS)",
        "structure": "Abstract, Introduction, Related Work, Method, Experiments, Broader Impact, Conclusion.",
        "topics": "Machine Learning, Deep Learning, Optimization, Theory, Neuroscience intersections."
    },
    "AAAI": {
        "name": "Association for the Advancement of Artificial Intelligence (AAAI)",
        "structure": "Abstract, Introduction, Related Work, Problem Formulation, Proposed Method, Experiments, Conclusion.",
        "topics": "General AI, Reasoning, Multi-agent Systems, Search, Machine Learning, Vision, NLP."
    }
};

/**
 * Direct call to the Gemini API
 */
function callGeminiAPI(actionType, context, query) {
  const API_KEY = "GEMINI_API_KEY";
  const MODEL = "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

  let systemPrompt = "";

  if (actionType === "review") {
      let confData = CONFERENCE_PRESETS[query] || {
          "name": "General Academic Conference",
          "structure": "Standard academic structure",
          "topics": "General Academic Topics"
      };

      systemPrompt = `You are an expert peer reviewer for ${confData.name}. Review the following document. ` +
          `Provide a structured critique addressing: 1) Clarity and Flow, 2) Methodology/Argumentation strength, ` +
          `and 3) Formatting or structural suggestions. Keep it professional and actionable.\n\n` +
          `CRITICAL REQUIREMENTS FOR THIS CONFERENCE:\n` +
          `- Required Structure: ${confData.structure}\n` +
          `- Topics of Interest: ${confData.topics}\n` +
          `Evaluate if the paper adheres to these requirements.\n\n` +
          `--- DOCUMENT ---\n${context}\n--- END DOCUMENT ---`;

  } else if (actionType === "edit") {
      systemPrompt = `You are an expert academic editor. Rewrite the following highlighted section based on the user's instructions. ` +
          `Return ONLY the rewritten text, keeping any academic tone intact. Do not include markdown formatting.\n\n` +
          `--- SECTION TO EDIT ---\n${context}\n--- END SECTION ---\n\n` +
          `Instructions: ${query}`;

  } else {
      systemPrompt = `You are an expert academic assistant. Use this document context to answer the user. Keep answers concise.\n` +
          `--- CONTEXT START ---\n${context}\n--- CONTEXT END ---\n` +
          `User Question: ${query}`;
  }

  const payload = {
    "contents": [{"parts": [{"text": systemPrompt}]}]
  };

  const options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const data = JSON.parse(response.getContentText());

    if (data.error) return { success: false, answer: "API Error: " + data.error.message };

    return { success: true, answer: data.candidates[0].content.parts[0].text };
  } catch (err) {
    return { success: false, answer: "Execution Error: " + err.message };
  }
}