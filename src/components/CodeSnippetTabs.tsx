"use client";
import React, { useState } from "react";
import { CopyButton } from "./CopyButton";

export function CodeSnippetTabs({ snippets }: { snippets: { [lang: string]: string } }) {
  const languages = Object.keys(snippets);
  const [activeLang, setActiveLang] = useState(languages[0] || "typescript");

  return (
    <div className="rounded-xl bg-gray-950 border border-gray-800 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-900/50">
        <div className="flex gap-2">
          {languages.map(lang => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={`px-3 py-1 rounded text-xs font-mono uppercase ${activeLang === lang ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-gray-400 hover:text-white"}`}
            >
              {lang}
            </button>
          ))}
        </div>
        <CopyButton text={snippets[activeLang] || ""} />
      </div>
      <pre className="p-4 text-xs font-mono text-gray-300 overflow-x-auto">
        <code>{snippets[activeLang]}</code>
      </pre>
    </div>
  );
}
