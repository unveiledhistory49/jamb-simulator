import React from 'react';
import katex from 'katex';

/**
 * Renders text that may contain LaTeX formulas like:
 * \( \frac{1}{2} \) or $$ ... $$ or standard text.
 */
export default function MathRenderer({ text, className = '' }) {
  if (!text) return null;

  // Split by LaTeX delimiters: \( ... \), \[ ... \], $$ ... $$, or $ ... $
  const parts = [];
  const regex = /(\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]|\$\$[\s\S]*?\$\$)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex, match.index)
      });
    }

    let formula = match[0];
    let displayMode = false;

    if (formula.startsWith('\\(') && formula.endsWith('\\)')) {
      formula = formula.slice(2, -2);
    } else if (formula.startsWith('\\[') && formula.endsWith('\\]')) {
      formula = formula.slice(2, -2);
      displayMode = true;
    } else if (formula.startsWith('$$') && formula.endsWith('$$')) {
      formula = formula.slice(2, -2);
      displayMode = true;
    }

    parts.push({
      type: 'math',
      content: formula,
      displayMode
    });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(lastIndex)
    });
  }

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return <span key={index} dangerouslySetInnerHTML={{ __html: part.content }} />;
        }
        try {
          const html = katex.renderToString(part.content, {
            displayMode: part.displayMode,
            throwOnError: false,
          });
          return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
        } catch (e) {
          return <span key={index}>{part.content}</span>;
        }
      })}
    </span>
  );
}
