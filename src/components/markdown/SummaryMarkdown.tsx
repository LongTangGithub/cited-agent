"use client";

import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import { CitationChip } from "@/components/citations/CitationChip";
import { splitOnCitations } from "@/lib/citations/parse";
import type { Citation } from "@/lib/citations/types";

type Props = {
  text: string;
  activeCitation: Citation | null;
  onCitationClick: (c: Citation) => void;
};

function injectCitations(
  children: ReactNode,
  activeCitation: Citation | null,
  onClick: (c: Citation) => void,
): ReactNode {
  if (typeof children === "string") {
    const parts = splitOnCitations(children);
    if (parts.length === 1 && typeof parts[0] === "string") return children;
    return parts.map((p, i) => {
      if (typeof p === "string") return p;
      const isActive =
        activeCitation?.leaseId === p.leaseId &&
        activeCitation?.clauseId === p.clauseId;
      return (
        <CitationChip key={i} citation={p} isActive={isActive} onClick={onClick} />
      );
    });
  }
  if (Array.isArray(children)) {
    return children.map((child, i) => {
      if (typeof child === "string") {
        const parts = splitOnCitations(child);
        if (parts.length === 1 && typeof parts[0] === "string") return child;
        return parts.map((p, j) => {
          if (typeof p === "string") return p;
          const isActive =
            activeCitation?.leaseId === p.leaseId &&
            activeCitation?.clauseId === p.clauseId;
          return (
            <CitationChip
              key={`${i}-${j}`}
              citation={p}
              isActive={isActive}
              onClick={onClick}
            />
          );
        });
      }
      return child;
    });
  }
  return children;
}

export function SummaryMarkdown({ text, activeCitation, onCitationClick }: Props) {
  return (
    <div className="prose-sm text-sm text-muted-foreground space-y-3">
      <ReactMarkdown
        components={{
          p: ({ children }) => (
            <p className="mb-2 leading-relaxed">
              {injectCitations(children, activeCitation, onCitationClick)}
            </p>
          ),
          li: ({ children }) => (
            <li className="mb-1">
              {injectCitations(children, activeCitation, onCitationClick)}
            </li>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 mb-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 mb-2">{children}</ol>
          ),
          h1: ({ children }) => (
            <h1 className="text-base font-semibold text-foreground mt-4 mb-2">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-semibold text-foreground mt-3 mb-1">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs font-semibold text-foreground mt-2 mb-1">{children}</h3>
          ),
          strong: ({ children }) => (
            <strong className="font-medium text-foreground">{children}</strong>
          ),
          hr: () => <hr className="border-border my-3" />,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
