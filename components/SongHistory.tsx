import React, { useState, useCallback } from 'react';
import { TrashIcon, ClipboardIcon, CheckIcon } from './Icons';

interface SongHistoryItem {
  id: number;
  artist: string;
  topic: string;
  lyrics: string;
}

interface SongHistoryProps {
  history: SongHistoryItem[];
  onLoadHistory: (id: number) => void;
  onClearHistory: () => void;
}

const SongHistory: React.FC<SongHistoryProps> = ({ history, onLoadHistory, onClearHistory }) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = useCallback((lyrics: string, id: number) => {
    navigator.clipboard.writeText(lyrics).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-200">Song History</h2>
        <button
          onClick={onClearHistory}
          className="flex items-center gap-2 px-3 py-1.5 bg-red-900/50 hover:bg-red-800/60 border border-red-700 text-red-300 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-red-500"
        >
          <TrashIcon className="h-4 w-4" />
          Clear History
        </button>
      </div>
      <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
        {history.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <button
              onClick={() => onLoadHistory(item.id)}
              className="flex-grow text-left p-3 bg-slate-900/50 hover:bg-slate-700/70 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <p className="font-semibold text-slate-200 truncate">{item.artist}</p>
              <p className="text-sm text-slate-400 truncate">{item.topic}</p>
            </button>
            <button
              onClick={() => handleCopy(item.lyrics, item.id)}
              className="flex-shrink-0 p-2 bg-slate-700 hover:bg-slate-600 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500"
              aria-label="Copy lyrics"
            >
              {copiedId === item.id ? (
                <CheckIcon className="h-5 w-5 text-green-400" />
              ) : (
                <ClipboardIcon className="h-5 w-5 text-slate-300" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SongHistory;
