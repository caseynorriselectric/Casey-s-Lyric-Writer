import React, { useState, useCallback } from 'react';
import { analyzeMusicStyle } from '../services/geminiService';
import TextInput from './TextInput';
import Button from './Button';
import Loader from './Loader';
import { SparklesIcon, RefreshIcon, ClipboardIcon, CheckIcon } from './Icons';

interface StyleResult {
  style: string;
  productionStyle: string;
  bassElement: string;
  studioProduction: string;
}

const MusicStyleAnalyzer: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<StyleResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCombinedCopied, setIsCombinedCopied] = useState<boolean>(false);

  const handleGenerate = useCallback(async () => {
    if (!input.trim()) {
      setError('Please enter an artist or song name.');
      return;
    }
    setIsLoading(true);
    setError(null);
    if (!result) { // Only clear result if it's the first generation
      setResult(null);
    }

    try {
      const styleData = await analyzeMusicStyle(input);
      setResult(styleData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setResult(null); // Clear previous results on error
    } finally {
      setIsLoading(false);
    }
  }, [input, result]);

  const resultEntries: [string, string][] = result ? [
      ['Style', result.style],
      ['Production Style', result.productionStyle],
      ['Bass Element', result.bassElement],
      ['Studio Production', result.studioProduction]
  ] : [];

  const combinedStyle = result
    ? [result.style, result.productionStyle, result.bassElement, result.studioProduction].join(', ')
    : '';

  const handleCombinedCopy = useCallback(() => {
    if (!combinedStyle) return;
    navigator.clipboard.writeText(combinedStyle).then(() => {
      setIsCombinedCopied(true);
      setTimeout(() => setIsCombinedCopied(false), 2000);
    });
  }, [combinedStyle]);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-2xl border border-slate-700 mt-8">
      <h2 className="text-2xl font-bold text-slate-200 mb-4 text-center">Music Style Analyzer</h2>
      <p className="text-slate-400 text-center mb-6">Enter an artist or song to break down its sonic signature.</p>
      
      <div className="space-y-4">
        <TextInput
          id="style-analyzer-input"
          label="Artist or Song Name"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., Tame Impala, Blinding Lights"
          disabled={isLoading}
        />
        <Button
          onClick={handleGenerate}
          disabled={!input.trim() || isLoading}
          isLoading={isLoading}
        >
          {result ? <><RefreshIcon className="h-5 w-5 mr-2" />Regenerate Style</> : <><SparklesIcon className="h-5 w-5 mr-2" />Analyze Style</>}
        </Button>
      </div>

      {error && (
        <div className="mt-4 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}

      {isLoading && !result && (
        <div className="text-center p-4 mt-4">
          <p className="text-lg text-slate-400 animate-pulse">Analyzing signature sound...</p>
        </div>
      )}
      
      {result && (
        <div className="mt-6 border-t border-slate-700 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resultEntries.map(([label, value]) => (
              <div key={label} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                <p className="text-sm font-medium text-slate-400 mb-1">{label}</p>
                <p className="text-base font-semibold text-cyan-300">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-semibold text-slate-400">Combined Style Prompt</p>
              <button
                onClick={handleCombinedCopy}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500"
              >
                {isCombinedCopied ? (
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
            <p className="font-mono text-cyan-300 text-sm bg-slate-900 p-3 rounded-md break-words">
              {combinedStyle}
            </p>
          </div>

        </div>
      )}

    </div>
  );
};

export default MusicStyleAnalyzer;
