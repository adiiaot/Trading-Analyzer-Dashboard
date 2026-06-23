"use client";

export default function Navbar() {
  const currentTime = new Date().toLocaleTimeString();

  return (
    <div className="bg-bg-secondary border-b border-bg-tertiary px-6 py-4 flex justify-between items-center">
      <div>
        <h2 className="text-xl font-bold text-text-primary">Trading Command Center</h2>
        <p className="text-sm text-text-secondary">XAU/USD Analysis & Signals</p>
      </div>

      <div className="text-right">
        <p className="text-text-primary font-mono">{currentTime}</p>
        <p className="text-sm text-accent-gold">Live Data Feed Active</p>
      </div>
    </div>
  );
}
