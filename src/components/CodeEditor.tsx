import { KeyboardEvent, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import type { Locale } from '../domain/models';
import type { CodeDiagnostic } from '../learning/codeValidation';
import { Icon } from '../shared/Icon';

export interface CodeFile { id: string; name: string; content: string; }

interface CodeEditorProps {
  locale: Locale;
  files: CodeFile[];
  activeFileId: string;
  diagnostics: CodeDiagnostic[] | null;
  checking: boolean;
  onSelectFile: (fileId: string) => void;
  onAddFile: () => void;
  onChange: (fileId: string, value: string) => void;
  onRun: () => void;
  onReset: () => void;
}

const INDENT = '    ';
const LINE_HEIGHT = 22.36;
const TOKEN_PATTERN = /(\/\/[^\n]*|"(?:\\.|[^"\\])*"|\b(?:using|namespace|public|private|protected|internal|class|struct|interface|enum|void|return|new|if|else|for|foreach|while|switch|case|break|continue|static|readonly|const|this|base|null)\b|\b(?:int|float|double|string|bool|var|object)\b|\b(?:true|false)\b|\b(?:MonoBehaviour|UnityEngine|GameObject|Transform|Rigidbody|Collider|Debug|SerializeField|Vector2|Vector3|Time|Input)\b|\b\d+(?:\.\d+)?f?\b|\b[A-Za-z_]\w*(?=\s*\())/g;

function syntaxClass(token: string): string {
  if (token.startsWith('//')) return 'syntax-comment';
  if (token.startsWith('"')) return 'syntax-string';
  if (/^(?:int|float|double|string|bool|var|object)$/.test(token)) return 'syntax-type';
  if (/^(?:true|false)$/.test(token)) return 'syntax-boolean';
  if (/^(?:MonoBehaviour|UnityEngine|GameObject|Transform|Rigidbody|Collider|Debug|SerializeField|Vector2|Vector3|Time|Input)$/.test(token)) return 'syntax-api';
  if (/^\d/.test(token)) return 'syntax-number';
  if (/^(?:using|namespace|public|private|protected|internal|class|struct|interface|enum|void|return|new|if|else|for|foreach|while|switch|case|break|continue|static|readonly|const|this|base|null)$/.test(token)) return 'syntax-keyword';
  return 'syntax-method';
}

function highlightCSharp(source: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  for (const match of source.matchAll(TOKEN_PATTERN)) {
    const index = match.index ?? 0;
    if (index > cursor) nodes.push(source.slice(cursor, index));
    nodes.push(<span className={syntaxClass(match[0])} key={`${index}-${match[0]}`}>{match[0]}</span>);
    cursor = index + match[0].length;
  }
  if (cursor < source.length) nodes.push(source.slice(cursor));
  return nodes;
}

export function CodeEditor({ locale, files, activeFileId, diagnostics, checking, onSelectFile, onAddFile, onChange, onRun, onReset }: CodeEditorProps) {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const [cursor, setCursor] = useState({ line: 1, column: 1 });
  const [scrollTop, setScrollTop] = useState(0);
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);
  const activeFile = files.find((file) => file.id === activeFileId) ?? files[0];
  const value = activeFile?.content ?? '';
  const lines = useMemo(() => value.split('\n'), [value]);
  const highlighted = useMemo(() => highlightCSharp(value), [value]);
  const errors = diagnostics?.filter((item) => item.severity === 'error').length ?? 0;
  const warnings = diagnostics?.filter((item) => item.severity === 'warning').length ?? 0;
  const labels = locale === 'tr'
    ? { error: 'hata', warning: 'uyarı', reset: 'Bu adımı sıfırla', checking: 'Kontrol ediliyor…', check: 'Kodu kontrol et', fix: 'Nasıl düzeltilir', add: 'Yeni script', empty: 'Boş dosya. Kodu ilk karakterden itibaren sen yazacaksın.' }
    : { error: 'error', warning: 'warning', reset: 'Reset this step', checking: 'Checking…', check: 'Check code', fix: 'How to fix', add: 'New script', empty: 'Empty file. You will write the code from the very first character.' };

  useEffect(() => {
    setCursor({ line: 1, column: 1 });
    setScrollTop(0);
    setHighlightedLine(null);
    if (editorRef.current) editorRef.current.scrollTop = 0;
  }, [activeFileId]);

  const updateCursor = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const before = editor.value.slice(0, editor.selectionStart).split('\n');
    setCursor({ line: before.length, column: before.at(-1)!.length + 1 });
  };

  const replaceSelection = (insert: string, selectionOffset = insert.length) => {
    const editor = editorRef.current;
    if (!editor || !activeFile) return;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    onChange(activeFile.id, value.slice(0, start) + insert + value.slice(end));
    requestAnimationFrame(() => {
      editor.focus();
      editor.setSelectionRange(start + selectionOffset, start + selectionOffset);
      updateCursor();
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    const editor = event.currentTarget;
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') { event.preventDefault(); onRun(); return; }
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
        onChange(activeFile.id, value.slice(0, blockStart) + transformed + value.slice(blockEnd));
        requestAnimationFrame(() => { editor.focus(); editor.setSelectionRange(blockStart, blockStart + transformed.length); });
      } else if (event.shiftKey) {
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const removable = value.slice(lineStart, start).match(/(?: {1,4}|\t)$/)?.[0] ?? '';
        if (removable) {
          onChange(activeFile.id, value.slice(0, start - removable.length) + value.slice(start));
          requestAnimationFrame(() => editor.setSelectionRange(start - removable.length, start - removable.length));
        }
      } else replaceSelection(INDENT);
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
    if (!event.metaKey && !event.ctrlKey && pairs[event.key] && editor.selectionStart === editor.selectionEnd) { event.preventDefault(); replaceSelection(event.key + pairs[event.key], 1); }
  };

  const syncScroll = (top: number, left: number) => {
    setScrollTop(top);
    if (gutterRef.current) gutterRef.current.scrollTop = top;
    if (highlightRef.current) { highlightRef.current.scrollTop = top; highlightRef.current.scrollLeft = left; }
  };

  const goToDiagnostic = (item: CodeDiagnostic) => {
    if (!item.line) return;
    const targetFile = item.fileName ? files.find((file) => file.name === item.fileName) : activeFile;
    if (!targetFile) return;
    if (targetFile.id !== activeFileId) onSelectFile(targetFile.id);
    requestAnimationFrame(() => {
      const editor = editorRef.current;
      if (!editor) return;
      const targetLines = targetFile.content.split('\n');
      const offset = targetLines.slice(0, item.line! - 1).reduce((total, line) => total + line.length + 1, 0) + Math.max(0, (item.column ?? 1) - 1);
      editor.focus();
      editor.setSelectionRange(offset, offset);
      const targetTop = Math.max(0, (item.line! - 1) * LINE_HEIGHT - editor.clientHeight / 3);
      editor.scrollTop = targetTop;
      syncScroll(targetTop, editor.scrollLeft);
      setCursor({ line: item.line!, column: item.column ?? 1 });
      setHighlightedLine(item.line!);
      window.setTimeout(() => setHighlightedLine(null), 1800);
    });
  };

  return (
    <section className="ide-shell" aria-label="C sharp kod editörü">
      <div className="ide-titlebar"><span className="ide-product">LEVELUP IDE</span><span>{activeFile?.name}</span><div><i /><i /><i /></div></div>
      <div className="ide-tabs" role="tablist" aria-label={locale === 'tr' ? 'Açık scriptler' : 'Open scripts'}>
        <div className="ide-tab-strip">{files.map((file) => <button key={file.id} type="button" role="tab" aria-selected={file.id === activeFileId} className={file.id === activeFileId ? 'ide-tab active' : 'ide-tab'} onClick={() => onSelectFile(file.id)}><Icon name="code" />{file.name}{file.content && <i />}</button>)}</div>
        <button className="ide-add-tab" type="button" onClick={onAddFile} title={labels.add}><span>+</span>{labels.add}</button>
      </div>
      <div className="ide-editor-wrap">
        <div ref={gutterRef} className="ide-gutter" aria-hidden="true">{lines.map((_, index) => <span key={index}>{index + 1}</span>)}</div>
        {highlightedLine && <div className="ide-line-flash" style={{ top: 16 + (highlightedLine - 1) * LINE_HEIGHT - scrollTop }} aria-hidden="true" />}
        <pre ref={highlightRef} className="ide-highlight" aria-hidden="true">{highlighted}{value.endsWith('\n') ? ' ' : null}</pre>
        {!value && <span className="ide-empty-hint" aria-hidden="true">{labels.empty}</span>}
        <textarea ref={editorRef} value={value} onChange={(event) => { if (activeFile) onChange(activeFile.id, event.target.value); setTimeout(updateCursor, 0); }} onKeyDown={handleKeyDown} onClick={updateCursor} onKeyUp={updateCursor} onScroll={(event) => syncScroll(event.currentTarget.scrollTop, event.currentTarget.scrollLeft)} spellCheck={false} autoCapitalize="off" autoCorrect="off" wrap="off" aria-label={`${activeFile?.name ?? 'Script'} C sharp kodu`} />
      </div>
      <div className="ide-statusbar"><span className={errors ? 'has-errors' : ''}>{errors} {labels.error}</span><span>{warnings} {labels.warning}</span><span>Ln {cursor.line}, Col {cursor.column}</span><span>Spaces: 4</span><span>UTF-8</span><span>C#</span></div>
      <div className="editor-actions"><button type="button" className="button button-secondary" onClick={onReset}>{labels.reset}</button><span className="shortcut">⌘/Ctrl + Enter</span><button type="button" className="button button-primary" onClick={onRun} disabled={checking}>{checking && <span className="spinner" />}{checking ? labels.checking : labels.check}<Icon name="arrow-right" /></button></div>
      {diagnostics && <div className="problems-panel" aria-live="polite"><header><strong>Problems</strong><span>{errors} {labels.error} · {warnings} {labels.warning}</span></header><ul>{diagnostics.map((item) => <li key={`${item.fileName}-${item.id}`} className={item.severity}><button type="button" onClick={() => goToDiagnostic(item)} disabled={!item.line}><span><Icon name={item.severity === 'success' ? 'check' : item.severity === 'error' ? 'close' : 'code'} /></span><div><strong>{item.code} · {item.title}</strong><p>{item.explanation}</p>{item.severity !== 'success' && item.fix && <small>{labels.fix}: <TechnicalCode text={item.fix} /></small>}</div>{item.line && <em>{item.fileName ?? activeFile?.name} · {item.line}:{item.column ?? 1}</em>}</button></li>)}</ul></div>}
    </section>
  );
}

function TechnicalCode({ text }: { text: string }) {
  return <>{text.split('`').map((part, index) => index % 2 ? <code key={`${part}-${index}`}>{part}</code> : part)}</>;
}
