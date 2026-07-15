import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";

interface SignalOrder {
  level: number;
  tp: number;
  status: "filled" | "pending" | "expired";
  pips: number;
}

interface SignalCardProps {
  signalId: number;
  timestamp: string;
  status: "pending" | "filling" | "filled" | "expired" | "closed" | "won" | "lost";
  confidence: number;
  orders: SignalOrder[];
  pnl?: number;
  expiresAt?: string;
}

export function SignalCard({
  signalId,
  timestamp,
  status,
  confidence,
  orders,
  pnl,
  expiresAt,
}: SignalCardProps) {
  const statusColors: Record<string, "win" | "loss" | "gold" | "warn" | "info"> = {
    pending: "info",
    filling: "gold",
    filled: "win",
    expired: "loss",
    closed: "info",
    won: "win",
    lost: "loss",
  };

  const statusEmojis: Record<string, string> = {
    pending: "⏳",
    filling: "🟢",
    filled: "✓",
    expired: "⏹️",
    closed: "✓",
    won: "✅",
    lost: "❌",
  };

  const borderColor = status === 'won' ? 'rgb(var(--status-win-rgb))'
    : status === 'lost' ? 'rgb(var(--status-loss-rgb))'
    : '#f0b429';

  return (
    <Card className="mb-4" style={{ borderLeft: `4px solid ${borderColor}` }}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-bold text-lg text-text-primary">Signal #{signalId}</h4>
          <p className="text-xs text-text-secondary">{timestamp}</p>
        </div>
        <div className="text-right">
          <Badge variant={statusColors[status]}>
            {statusEmojis[status]} {status.toUpperCase()}
          </Badge>
          <p className="text-sm text-accent-gold font-bold mt-2">{confidence}% Confidence</p>
        </div>
      </div>

      <div className="glass-card p-3 rounded-lg mb-3">
        <p className="text-xs text-text-secondary mb-2">Buy Limit Orders:</p>
        <div className="space-y-2">
          {orders.map((order, idx) => (
            <div key={idx} className="flex justify-between items-center text-xs">
              <span className="text-text-secondary">
                Order {idx + 1}: ${order.level.toFixed(2)}
              </span>
              <span className="text-text-primary font-mono">
                TP: ${order.tp.toFixed(2)} ({order.pips} pips)
              </span>
              <Badge
                variant={
                  order.status === "filled"
                    ? "win"
                    : order.status === "pending"
                    ? "info"
                    : "loss"
                }
                className="text-xs"
              >
                {order.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center text-xs">
        {pnl !== undefined && (
          <p className={pnl >= 0 ? "text-status-win font-bold" : "text-status-loss font-bold"}>
            {pnl >= 0 ? "+" : ""}{pnl.toFixed(2)} P&L
          </p>
        )}
        {expiresAt && (
          <p className="text-text-secondary">Expires: {expiresAt}</p>
        )}
      </div>
    </Card>
  );
}
