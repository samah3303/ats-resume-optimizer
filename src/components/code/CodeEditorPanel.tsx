"use client";

import { useState, useRef, useEffect } from "react";

interface CodeEditorPanelProps {
  code: string;
  onChange: (code: string) => void;
  language: "javascript" | "typescript" | "python";
  onLanguageChange: (lang: "javascript" | "typescript" | "python") => void;
  onRun: () => void;
  onAiReview: () => void;
  isRunning?: boolean;
  isReviewing?: boolean;
}

export function CodeEditorPanel({
  code,
  onChange,
  language,
  onLanguageChange,
  onRun,
  onAiReview,
  isRunning = false,
  isReviewing = false,
}: CodeEditorPanelProps) {
  const [fontSize, setFontSize] = useState<number>(13);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const lines = code.split("\n");
  const lineCount = lines.length;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle tab indent
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newCode = code.substring(0, start) + "  " + code.substring(end);
      onChange(newCode);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const syncScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
      {/* Top Toolbar */}
      <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as any)}
            className="bg-white border border-zinc-300 focus:border-black text-xs font-bold text-black rounded-xl px-3 py-1.5 outline-none shadow-sm cursor-pointer"
          >
            <option value="javascript">JavaScript (Node.js)</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python 3.11</option>
          </select>

          {/* Font size control */}
          <div className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-zinc-500 bg-white border border-zinc-200 px-2 py-1 rounded-xl">
            <button
              onClick={() => setFontSize(Math.max(11, fontSize - 1))}
              className="hover:text-black px-1"
              title="Decrease font"
            >
              -
            </button>
            <span>{fontSize}px</span>
            <button
              onClick={() => setFontSize(Math.min(18, fontSize + 1))}
              className="hover:text-black px-1"
              title="Increase font"
            >
              +
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={copyCode}
            className="touch-target px-3 py-1.5 bg-white hover:bg-zinc-100 border border-zinc-300 text-xs font-bold text-black rounded-xl transition-all shadow-sm flex items-center gap-1"
            title="Copy code to clipboard"
          >
            <span>{copied ? "✓ Copied" : "📋 Copy"}</span>
          </button>

          <button
            onClick={onAiReview}
            disabled={isReviewing || isRunning}
            className="touch-target px-3.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-xs font-black text-black rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            title="Analyze Big-O Complexity & Code Review"
          >
            {isReviewing ? (
              <>
                <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Reviewing...</span>
              </>
            ) : (
              <>
                <span>✨</span>
                <span>AI Big-O Review</span>
              </>
            )}
          </button>

          <button
            onClick={onRun}
            disabled={isRunning}
            className="touch-target min-h-[38px] px-5 py-1.5 bg-black hover:bg-zinc-800 text-white font-black text-xs rounded-xl border border-black shadow-sm transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <span>▶</span>
                <span>Run Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Main Canvas with Line Numbers */}
      <div className="flex-1 relative flex overflow-hidden font-mono bg-white">
        {/* Line Numbers Column */}
        <div
          ref={lineNumbersRef}
          className="w-12 bg-zinc-50 border-r border-zinc-200 py-4 px-2 select-none text-right text-zinc-400 font-mono overflow-hidden shrink-0"
          style={{ fontSize: `${fontSize}px`, lineHeight: "1.6" }}
        >
          {Array.from({ length: Math.max(15, lineCount) }).map((_, i) => (
            <div key={i} className="leading-[1.6]">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code Textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={syncScroll}
          spellCheck={false}
          autoCapitalize="none"
          autoComplete="off"
          className="flex-1 w-full h-full p-4 bg-transparent text-black font-mono outline-none resize-none overflow-auto leading-[1.6] select-text selection:bg-zinc-200"
          style={{ fontSize: `${fontSize}px` }}
        />
      </div>
    </div>
  );
}
