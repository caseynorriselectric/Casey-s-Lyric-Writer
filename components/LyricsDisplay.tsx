import React, { useState, useCallback } from 'react';
import { ClipboardIcon, CheckIcon, RefreshIcon, SparklesIcon, BarsArrowDownIcon } from './Icons';
import Loader from './Loader';

interface LyricsDisplayProps {
  lyrics: string;
  onRemix: () => void;
  isRemixing: boolean;
  onHookRemix: () => void;
  isHookRemixing: boolean;
  onEnhance: () => void;
  isEnhancing: boolean;
  onExtend: () => void;
  isExtending: boolean;
  isGeneratingStyle: boolean;
  musicStyle: string;
}

const LyricsDisplay: React.FC<LyricsDisplayProps> = ({
  lyrics,
  onRemix,
  isRemixing,
  onHookRemix,
  isHookRemixing,
  onEnhance,
  isEnhancing,
  onExtend,
  isExtending,
  isGeneratingStyle,
  musicStyle,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isStyleCopied, setIsStyleCopied] = useState(false);
  const isBusy = isRemixing || isHookRemixing || isEnhancing || isExtending;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(lyrics).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  }, [lyrics]);
  
  const handleStyleCopy = useCallback(() => {
    if (!musicStyle) return;
    navigator.clipboard.writeText(musicStyle).then(() => {
      setIsStyleCopied(true);
      setTimeout(() => setIsStyleCopied(false), 2000);
    });
  }, [musicStyle]);

  return (
    <div className="bg-slate-900/70 border border-slate-700 rounded-xl shadow-lg relative group">
      <div className="p-4 flex justify-between items-center border-b border-slate-700">
        <h3 className="font-semibold text-slate-300">Generated Lyrics</h3>
        <div className="flex items-center flex-wrap justify-end gap-2">
           <button
            onClick={onEnhance}
            disabled={isBusy}
            className="flex items-center gap-2 px-3 py-1.5 bg-transparent border border-slate-600 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEnhancing ? (
              <>
                <Loader />
                Enhancing...
              </>
            ) : (
              <>
                <SparklesIcon className="h-4 w-4" />
                Enhance
              </>
            )}
          </button>
           <button
            onClick={onHookRemix}
            disabled={isBusy}
            className="flex items-center gap-2 px-3 py-1.5 bg-transparent border border-slate-600 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isHookRemixing ? (
              <>
                <Loader />
                Remixing...
              </>
            ) : (
              <>
                <RefreshIcon className="h-4 w-4" />
                Remix This
              </>
            )}
          </button>
          <button
            onClick={onRemix}
            disabled={isBusy}
            className="flex items-center gap-2 px-3 py-1.5 bg-transparent border border-slate-600 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRemixing ? (
              <>
                <Loader />
                Reimagining...
              </>
            ) : (
              <>
                <RefreshIcon className="h-4 w-4" />
                Reimagine
              </>
            )}
          </button>
           <button
            onClick={onExtend}
            disabled={isBusy}
            className="flex items-center gap-2 px-3 py-1.5 bg-transparent border border-slate-600 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExtending ? (
              <>
                <Loader />
                Extending...
              </>
            ) : (
              <>
                <BarsArrowDownIcon className="h-4 w-4" />
                Extend Song
              </>
            )}
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

      {(musicStyle || isGeneratingStyle) && (
        <div className="p-4 border-b border-slate-700 bg-slate-800/50">
          {isGeneratingStyle ? (
            <div className="flex items-center gap-2 text-slate-400 animate-pulse">
              <Loader />
              <span>Generating music style...</span>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <p className="text-sm font-semibold text-slate-400">Music Style Prompt</p>
                <button
                  onClick={handleStyleCopy}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500"
                >
                  {isStyleCopied ? (
                    <>
                      <CheckIcon className="h-3 w-3 text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <ClipboardIcon className="h-3 w-3" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <p className="mt-2 font-mono text-cyan-300 text-sm bg-slate-900 p-3 rounded-md">{musicStyle}</p>
            </>
          )}
        </div>
      )}

      <pre className="p-6 whitespace-pre-wrap break-words font-mono text-slate-300 text-base leading-relaxed overflow-x-auto max-h-[50vh]">
        <code>{lyrics}</code>
      </pre>
    </div>
  );
};

export default LyricsDisplay;
