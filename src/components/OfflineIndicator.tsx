import React from 'react';
import { useOnlineStatus } from '../hooks/usePWAInstall';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-medium text-white shadow-xl animate-fadeIn">
      <WifiOff className="w-4 h-4 animate-pulse" />
      <span>Offline Mode — All puzzles and sounds are cached and playable offline.</span>
    </div>
  );
};
