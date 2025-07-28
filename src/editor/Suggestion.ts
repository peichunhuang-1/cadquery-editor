import * as monaco from 'monaco-editor';

export const basic_suggestion = {
  triggerCharacters: ['return', 'cq', 'Workplane', '@workplane', '@'],
  provideCompletionItems: (model: monaco.editor.ITextModel, position: monaco.Position) => {
    const word = model.getWordUntilPosition(position);
    const wordPrefix = word.word;
    const range = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: word.startColumn,
      endColumn: word.endColumn
    };

    const suggestions: monaco.languages.CompletionItem[] = [];

    if ('return'.startsWith(wordPrefix)) {
      suggestions.push({
        label: 'return',
        kind: monaco.languages.CompletionItemKind.Keyword,
        insertText: 'return',
        range,
      });
    }

    if ('cq'.startsWith(wordPrefix)) {
      suggestions.push({
        label: 'cq',
        kind: monaco.languages.CompletionItemKind.Class,
        insertText: 'cq',
        range,
      });
    }

    if ('Workplane'.startsWith(wordPrefix)) {
      suggestions.push({
        label: 'Workplane',
        kind: monaco.languages.CompletionItemKind.Function,
        insertText: 'Workplane',
        range,
      });
    }

    if (wordPrefix === '@workplane') {
      suggestions.push({
        label: '@workplane',
        kind: monaco.languages.CompletionItemKind.Keyword,
        insertText: '@workplane',
        range,
      });
    }

    return {
      suggestions: suggestions
    };
  }
};