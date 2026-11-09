import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { Wifi, WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (!isOnline) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-300 rounded-lg shadow-2xs animate-pulse">
        <WifiOff className="w-3.5 h-3.5 text-amber-600" />
        <span>Offline Mode</span>
      </div>
    );
  }

  return (
    <div
      className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 rounded-lg"
      title="All generator code, assets, and fonts are cached locally for offline work"
    >
      <Wifi className="w-3.5 h-3.5 text-emerald-600" />
      <span>Offline Ready</span>
    </div>
  );
};
