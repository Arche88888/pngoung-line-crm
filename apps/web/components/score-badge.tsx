import type { ScoreCard } from "@pngoung/shared";

export function ScoreBadge({ card }: { card: ScoreCard }) {
  return (
    <span className={`badge ${card.level}`}>
      {card.level} {card.score}
    </span>
  );
}
