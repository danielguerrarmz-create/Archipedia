import React from 'react';
import { MatchStamp } from '../motif/MatchStamp';

/*
 * MatchReasonBadge — thin wrapper that delegates to the motif MatchStamp.
 * Keeps the original export name + props so call sites need no changes.
 */

interface MatchReasonBadgeProps {
  score: number;
  reason?: string;
  typology?: string;
  country?: string;
  matchedAttrs?: string[];
  signalPct?: boolean; // pass to MatchStamp for the strongest card
  noSignal?: boolean;  // render the stamp entirely in ink (no Klein-blue dots)
}

export function MatchReasonBadge({
  score,
  reason,
  typology,
  country,
  matchedAttrs,
  signalPct = false,
  noSignal = false,
}: MatchReasonBadgeProps) {
  // Build a consolidated reason tooltip string
  const tooltipParts: string[] = [];
  if (reason) tooltipParts.push(reason);
  if (typology) tooltipParts.push(`Typology: ${typology}`);
  if (country) tooltipParts.push(`Location: ${country}`);
  if (matchedAttrs && matchedAttrs.length > 0) {
    matchedAttrs.slice(0, 3).forEach((attr) => {
      if (!attr.toLowerCase().includes('typology') && !attr.toLowerCase().includes('country')) {
        tooltipParts.push(attr);
      }
    });
  }
  const tooltipContent = tooltipParts.join(' · ') || undefined;

  return (
    <MatchStamp
      score={score}
      reason={tooltipContent}
      signalPct={signalPct}
      noSignal={noSignal}
    />
  );
}
