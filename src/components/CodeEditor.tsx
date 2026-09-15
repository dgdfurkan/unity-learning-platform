import { KeyboardEvent, useMemo, useRef, useState } from 'react';
import type { Locale } from '../domain/models';
import type { CodeDiagnostic } from '../learning/codeValidation';
import { Icon } from '../shared/Icon';

interface CodeEditorProps {
  locale: Locale;
  fileName: string;
  value: string;
  diagnostics: CodeDiagnostic[] | null;
  checking: boolean;
  onChange: (value: string) => void;
  onRun: () => void;
  onReset: () => void;
}

const INDENT = '    ';

export function CodeEditor({ locale, fileName, value, diagnostics, checking, onChange, onRun, onReset }: CodeEditorProps) {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState({ line: 1, column: 1 });
  const lines = useMemo(() => value.split('\n'), [value]);
  const errors = diagnostics?.filter((item) => item.severity === 'error').length ?? 0;
  const warnings = diagnostics?.filter((item) => item.severity === 'warning').length ?? 0;
  const labels = locale === 'tr'
    ? { error: 'hata', warning: 'uyarı', reset: 'Kodu sıfırla', checking: 'Kontrol ediliyor…', check: 'Kodu kontrol et', fix: 'Nasıl düzeltilir' }
    : { error: 'error', warning: 'warning', reset: 'Reset code', checking: 'Checking…', check: 'Check code', fix: 'How to fix' };

  const updateCursor = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const before = editor.value.slice(0, editor.selectionStart).split('\n');
    setCursor({ line: before.length, column: before.at(-1)!.length + 1 });
  };

  const replaceSelection = (insert: string, selectionOffset = insert.length) => {
    const editor = editorRef.current;
    if (!editor) return;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    onChange(value.slice(0, start) + insert + value.slice(end));
    requestAnimationFrame(() => {
      editor.focus();
      editor.setSelectionRange(start + selectionOffset, start + selectionOffset);
      updateCursor();
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    const editor = event.currentTarget;
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      onRun();
      return;
    }

    if (event.key === 'Tab') {
      event.preventDefault();
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      if (start !== end) {
        const blockStart = value.lastIndexOf('\n', start - 1) + 1;
        const blockEndIndex = value.indexOf('\n', end);
        const blockEnd = blockEndIndex === -1 ? value.length : blockEndIndex;
        const selectedLines = value.slice(blockStart, blockEnd).split('\n');
        const transformed = selectedLines.map((line) => event.shiftKey ? line.replace(/^(?: {1,4}|\t)/, '') : INDENT + line).join('\n');
        onChange(value.slice(0, blockStart) + transformed + value.slice(blockEnd));
        requestAnimationFrame(() => {
          editor.focus();
          editor.setSelectionRange(blockStart, blockStart + transformed.length);
        });
      } else if (event.shiftKey) {
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const removable = value.slice(lineStart, start).match(/(?: {1,4}|\t)$/)?.[0] ?? '';
        if (removable) {
          onChange(value.slice(0, start - removable.length) + value.slice(start));
          requestAnimationFrame(() => editor.setSelectionRange(start - removable.length, start - removable.length));
        }
      } else {
        replaceSelection(INDENT);
      }
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const start = editor.selectionStart;
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const currentBefore = value.slice(lineStart, start);
      const currentIndent = currentBefore.match(/^\s*/)?.[0] ?? '';
      const opensBlock = currentBefore.trimEnd().endsWith('{');
      const closesNext = value.slice(editor.selectionEnd).trimStart().startsWith('}');
      if (opensBlock && closesNext) replaceSelection(`\n${currentIndent}${INDENT}\n${currentIndent}`, 1 + currentIndent.length + INDENT.length);
      else replaceSelection(`\n${currentIndent}${opensBlock ? INDENT : ''}`);
      return;
    }

    const pairs: Record<string, string> = { '(': ')', '[': ']', '{': '}', '"': '"' };
    if (!event.metaKey && !event.ctrlKey && pairs[event.key] && editor.selectionStart === editor.selectionEnd) {
      event.preventDefault();
      replaceSelection(event.key + pairs[event.key], 1);
    }
  };

  const goToDiagnostic = (item: CodeDiagnostic) => {
    if (!item.line) return;
    const editor = editorRef.current;
    if (!editor) return;
    const offset = lines.slice(0, item.line - 1).reduce((total, line) => total + line.length + 1, 0) + Math.max(0, (item.column ?? 1) - 1);
    editor.focus();
    editor.setSelectionRange(offset, offset);
    updateCursor();
  };

  return (
    <section className="ide-shell" aria-label="C sharp kod editörü">
      <div className="ide-titlebar"><span className="ide-product">LEVELUP IDE</span><span>{fileName}</span><div><i /><i /><i /></div></div>
      <div className="ide-tabs"><span className="active"><Icon name="code" />{fileName}<i /></span></div>
      <div className="ide-editor-wrap">
        <div ref={gutterRef} className="ide-gutter" aria-hidden="true">{lines.map((_, index) => <span key={index}>{index + 1}</span>)}</div>
        <textarea
          ref={editorRef}
          value={value}
          onChange={(event) => { onChange(event.target.value); setTimeout(updateCursor, 0); }}
          onKeyDown={handleKeyDown}
          onClick={updateCursor}
          onKeyUp={updateCursor}
          onScroll={(event) => { if (gutterRef.current) gutterRef.current.scrollTop = event.currentTarget.scrollTop; }}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          wrap="off"
          aria-label={`${fileName} C sharp kodu`}
        />
      </div>
      <div className="ide-statusbar">
        <span className={errors ? 'has-errors' : ''}>{errors} {labels.error}</span><span>{warnings} {labels.warning}</span><span>Ln {cursor.line}, Col {cursor.column}</span><span>Spaces: 4</span><span>UTF-8</span><span>C#</span>
      </div>
      <div className="editor-actions"><button type="button" className="button button-secondary" onClick={onReset}>{labels.reset}</button><span className="shortcut">⌘/Ctrl + Enter</span><button type="button" className="button button-primary" onClick={onRun} disabled={checking}>{checking && <span className="spinner" />}{checking ? labels.checking : labels.check}<Icon name="arrow-right" /></button></div>
      {diagnostics && <div className="problems-panel" aria-live="polite"><header><strong>Problems</strong><span>{errors} {labels.error} · {warnings} {labels.warning}</span></header><ul>{diagnostics.map((item) => <li key={item.id} className={item.severity}><button type="button" onClick={() => goToDiagnostic(item)} disabled={!item.line}><span><Icon name={item.severity === 'success' ? 'check' : item.severity === 'error' ? 'close' : 'code'} /></span><div><strong>{item.code} · {item.title}</strong><p>{item.explanation}</p>{item.severity !== 'success' && item.fix && <small>{labels.fix}: <TechnicalCode text={item.fix} /></small>}</div>{item.line && <em>{item.line}:{item.column ?? 1}</em>}</button></li>)}</ul></div>}
    </section>
  );
}

function TechnicalCode({ text }: { text: string }) {
  return <>{text.split('`').map((part, index) => index % 2 ? <code key={`${part}-${index}`}>{part}</code> : part)}</>;
}
