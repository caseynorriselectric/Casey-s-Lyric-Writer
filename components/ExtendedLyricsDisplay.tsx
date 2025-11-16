import React, { useState, useCallback } from 'react';
import { ClipboardIcon, CheckIcon, PlusCircleIcon } from './Icons';

interface ExtendedLyricsDisplayProps {
  lyrics: string;
  onAppend: () => void;
}

const ExtendedLyricsDisplay: React.FC<ExtendedLyricsDisplayProps> = ({ lyrics, onAppend }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(lyrics).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  }, [lyrics]);

  return (
    <div className="bg-slate-900/70 border border-cyan-500/50 rounded-xl shadow-lg relative group">
      <div className="p-4 flex justify-between items-center border-b border-slate-700">
        <h3 className="font-semibold text-cyan-300">New Extended Lyrics</h3>
        <div className="flex items-center gap-2">
           <button
            onClick={onAppend}
            className="flex items-center gap-2 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500"
          >
            <PlusCircleIcon className="h-4 w-4" />
            Add to Song
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500"
          >
            {isCopied ? (
              <>
                <CheckIcon className="h-4 w-4 text-green-400" />
                Copied!
              </>
            ) : (
              <>
                <ClipboardIcon className="h-4 w-4" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>
      <pre className="p-6 whitespace-pre-wrap break-words font-mono text-slate-300 text-base leading-relaxed overflow-x-auto max-h-[40vh]">
        <code>{lyrics}</code>
      </pre>
    </div>
  );
};

export default ExtendedLyricsDisplay;
