'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import {
  FileText,
  Code,
  Eye,
  Copy,
  Check,
  Download,
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Table as TableIcon,
  Link as LinkIcon,
  Trash2,
} from 'lucide-react';

const SAMPLE_MD = `# Markdown to HTML Live Converter

ConvertHub offers lightning-fast **Markdown parsing** and **HTML conversion** completely inside your browser.

## Key Features
- **100% Client-Side**: Safe & secure.
- *Zero Latency*: Instant real-time preview.
- \`Code Syntax\`: Ready for developer documentation.

### Comparison Table
| Feature | ConvertHub | Others |
| :--- | :---: | :---: |
| Free | Yes | Sometimes |
| Instant | 100% | Slow |

> "Clean code and fast converters make developers productive."

Check out our [Converters Hub](https://converthub.com) for more tools!`;

export const MarkdownHtmlEditor: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>(SAMPLE_MD);
  const [activeTab, setActiveTab] = useState<'preview' | 'html'>('preview');
  const [copied, setCopied] = useState<string | null>(null);

  // Markdown to HTML compiler
  const htmlOutput = useMemo(() => {
    if (!markdown.trim()) return '';

    let html = markdown;

    // Escape raw HTML entities to prevent basic XSS while allowing standard markdown
    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Code blocks ```lang\ncode\n```
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      return `<pre class="my-4 rounded-xl bg-slate-900 p-4 font-mono text-xs text-emerald-400 overflow-x-auto"><code>${code.trim()}</code></pre>`;
    });

    // Inline code `code`
    html = html.replace(/`([^`]+)`/g, '<code class="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-indigo-600 dark:bg-slate-800 dark:text-indigo-400">$1</code>');

    // Blockquotes > quote
    html = html.replace(/^&gt;[ \t]*(.*)$/gm, '<blockquote class="my-3 border-l-4 border-indigo-500 pl-4 italic text-slate-600 dark:text-slate-400">$1</blockquote>');

    // Tables
    const lines = html.split('\n');
    let inTable = false;
    let tableHtml = '';
    const processedLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('|') && line.endsWith('|')) {
        // If separator row | :--- | :--- |
        if (line.includes('---')) {
          continue;
        }
        const cells = line
          .slice(1, -1)
          .split('|')
          .map((c) => c.trim());
        if (!inTable) {
          inTable = true;
          tableHtml = `<div class="my-4 overflow-x-auto"><table class="w-full text-left text-xs border border-slate-200 dark:border-slate-800"><thead class="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800"><tr>${cells.map((c) => `<th class="p-2 font-bold">${c}</th>`).join('')}</tr></thead><tbody>`;
        } else {
          tableHtml += `<tr class="border-b border-slate-100 dark:border-slate-800">${cells.map((c) => `<td class="p-2">${c}</td>`).join('')}</tr>`;
        }
      } else {
        if (inTable) {
          inTable = false;
          tableHtml += '</tbody></table></div>';
          processedLines.push(tableHtml);
          tableHtml = '';
        }
        processedLines.push(lines[i]);
      }
    }
    if (inTable) {
      tableHtml += '</tbody></table></div>';
      processedLines.push(tableHtml);
    }
    html = processedLines.join('\n');

    // Headings #, ##, ###, ####
    html = html.replace(/^#### (.*$)/gim, '<h4 class="mt-4 mb-2 text-base font-bold text-slate-900 dark:text-white">$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3 class="mt-5 mb-2 text-lg font-bold text-slate-900 dark:text-white">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="mt-6 mb-3 text-xl font-extrabold text-slate-900 dark:text-white">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="mt-6 mb-4 text-2xl font-extrabold text-slate-900 dark:text-white">$1</h1>');

    // Bold **text** or __text__
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>');

    // Italic *text* or _text_
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    html = html.replace(/_(.*?)_/g, '<em class="italic">$1</em>');

    // Strikethrough ~~text~~
    html = html.replace(/~~(.*?)~~/g, '<del class="line-through">$1</del>');

    // Links [text](url)
    html = html.replace(
      /\[(.*?)\]\((.*?)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="font-semibold text-indigo-600 underline hover:text-indigo-700 dark:text-indigo-400">$1</a>'
    );

    // Unordered lists - item or * item
    html = html.replace(/^\s*[-*]\s+(.*)$/gim, '<li class="ml-4 list-disc text-slate-700 dark:text-slate-300">$1</li>');

    // Ordered lists 1. item
    html = html.replace(/^\s*\d+\.\s+(.*)$/gim, '<li class="ml-4 list-decimal text-slate-700 dark:text-slate-300">$1</li>');

    // Paragraphs (double newlines)
    html = html.replace(/\n\n+/g, '</p><p class="my-3 text-sm text-slate-700 leading-relaxed dark:text-slate-300">');
    html = `<p class="my-3 text-sm text-slate-700 leading-relaxed dark:text-slate-300">${html}</p>`;

    return html;
  }, [markdown]);

  // Insert markdown snippet at cursor
  const handleInsert = (snippetBefore: string, snippetAfter: string = '') => {
    setMarkdown((prev) => `${prev}\n${snippetBefore}text${snippetAfter}`);
  };

  const handleCopy = (content: string, type: 'md' | 'html') => {
    navigator.clipboard.writeText(content);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-2.5 dark:border-slate-800/80 dark:bg-slate-900/60">
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => handleInsert('# ')}
            title="Heading 1"
            className="rounded-lg p-1.5 text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Heading1 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleInsert('## ')}
            title="Heading 2"
            className="rounded-lg p-1.5 text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Heading2 className="h-4 w-4" />
          </button>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
          <button
            type="button"
            onClick={() => handleInsert('**', '**')}
            title="Bold"
            className="rounded-lg p-1.5 text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleInsert('*', '*')}
            title="Italic"
            className="rounded-lg p-1.5 text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleInsert('`', '`')}
            title="Inline Code"
            className="rounded-lg p-1.5 text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Code className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleInsert('> ')}
            title="Blockquote"
            className="rounded-lg p-1.5 text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Quote className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleInsert('- ')}
            title="Bullet List"
            className="rounded-lg p-1.5 text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleInsert('| Col 1 | Col 2 |\n| :--- | :--- |\n| Val 1 | Val 2 |')}
            title="Table"
            className="rounded-lg p-1.5 text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <TableIcon className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMarkdown('')}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
        >
          <Trash2 className="h-3.5 w-3.5" /> Clear
        </button>
      </div>

      {/* Dual Pane Editor & Preview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Markdown Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-indigo-500" /> Markdown Input (.md)
            </span>
            <span className="text-[11px] font-normal text-slate-400">{markdown.length} chars</span>
          </div>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Write markdown here..."
            rows={14}
            className="w-full rounded-2xl border border-slate-200 bg-white p-4 font-mono text-xs text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>

        {/* HTML Rendered / Code Output */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                  activeTab === 'preview'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                <Eye className="h-3.5 w-3.5" /> Rendered Preview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('html')}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                  activeTab === 'html'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                <Code className="h-3.5 w-3.5" /> HTML Code
              </button>
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              Live Compiled
            </span>
          </div>

          {activeTab === 'preview' ? (
            <div
              className="h-[285px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 text-sm shadow-xs dark:border-slate-800 dark:bg-slate-950/80 prose prose-slate dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: htmlOutput }}
            />
          ) : (
            <textarea
              readOnly
              value={htmlOutput}
              rows={14}
              className="w-full rounded-2xl border border-slate-200 bg-slate-900 p-4 font-mono text-xs text-emerald-400 shadow-xs focus:outline-none dark:border-slate-800"
            />
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleDownload(markdown, 'document.md', 'text/markdown')}
            leftIcon={<Download className="h-3.5 w-3.5" />}
          >
            Download .md
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleDownload(htmlOutput, 'document.html', 'text/html')}
            leftIcon={<Download className="h-3.5 w-3.5" />}
          >
            Download .html
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleCopy(markdown, 'md')}
            leftIcon={copied === 'md' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          >
            {copied === 'md' ? 'Copied MD!' : 'Copy Markdown'}
          </Button>
          <Button
            size="sm"
            variant="gradient"
            onClick={() => handleCopy(htmlOutput, 'html')}
            leftIcon={copied === 'html' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          >
            {copied === 'html' ? 'Copied HTML!' : 'Copy HTML Code'}
          </Button>
        </div>
      </div>
    </div>
  );
};
