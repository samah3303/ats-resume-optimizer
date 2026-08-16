"use client";

import { useState } from "react";

interface SynchronizedCodePadProps {
  initialCode?: string;
  onCodeChange?: (code: string) => void;
}

export function SynchronizedCodePad({
  initialCode = `// Collaborative Live Coding Round
function findLongestSubstring(s) {
  let maxLength = 0;
  let start = 0;
  const map = new Map();

  for (let end = 0; end < s.length; end++) {
    const char = s[end];
    if (map.has(char) && map.get(char) >= start) {
      start = map.get(char) + 1;
    }
    map.set(char, end);
    maxLength = Math.max(maxLength, end - start + 1);
  }

  return maxLength;
}

console.log(findLongestSubstring("abcabcbb")); // Output: 3`,
  onCodeChange,
}: SynchronizedCodePadProps) {
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState<"javascript" | "typescript" | "python">("javascript");
  const [output, setOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (onCodeChange) onCodeChange(newCode);
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setOutput(null);

    setTimeout(() => {
      try {
        const logs: string[] = [];
        const mockConsole = {
          log: (...args: any[]) => logs.push(args.join(" ")),
        };

        const fn = new Function("console", code);
        fn(mockConsole);

        setOutput(logs.length > 0 ? logs.join("\n") : "Program executed successfully with 0 outputs.");
      } catch (err: any) {
        setOutput(`Runtime Error: ${err.message}`);
      } finally {
        setIsRunning(false);
      }
    }, 400);
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm flex flex-col h-full min-h-[460px]">
      {/* CodePad Top Toolbar */}
      <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-black flex items-center gap-1.5">
            <span>💻</span> Synchronized Code Pad
          </span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="bg-white border border-zinc-300 text-xs font-bold text-black rounded-xl px-2.5 py-1 outline-none shadow-sm"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
          </select>
        </div>

        <button
          onClick={handleRunCode}
          disabled={isRunning}
          className="touch-target px-4 py-1.5 bg-black hover:bg-zinc-800 text-white font-black text-xs rounded-xl border border-black shadow-sm transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
        >
          {isRunning ? (
            <>
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Running...</span>
            </>
          ) : (
            <>
              <span>▶</span>
              <span>Execute Code</span>
            </>
          )}
        </button>
      </div>

      {/* Editor Textarea */}
      <textarea
        value={code}
        onChange={(e) => handleCodeChange(e.target.value)}
        spellCheck={false}
        className="flex-1 w-full p-4 font-mono text-xs bg-white text-black outline-none resize-none leading-relaxed select-text"
      />

      {/* Output Console Drawer */}
      {output && (
        <div className="p-4 bg-zinc-950 text-white font-mono text-xs border-t border-zinc-200 space-y-1 max-h-36 overflow-y-auto">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
            Execution Console Output:
          </span>
          <pre className="whitespace-pre-wrap text-emerald-400">{output}</pre>
        </div>
      )}
    </div>
  );
}
