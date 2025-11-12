import React, { useState, useCallback } from 'react';
import { generateLyrics, generateHookRemix, generateMusicStyle, enhanceLyrics } from './services/geminiService';
import TextInput from './components/TextInput';
import Button from './components/Button';
import LyricsDisplay from './components/LyricsDisplay';
import ToggleSwitch from './components/ToggleSwitch';
import { MusicNoteIcon, SparklesIcon } from './components/Icons';
import SongHistory from './components/SongHistory';

interface SongHistoryItem {
  id: number;
  artist: string;
  topic: string;
  lyrics: string;
}

const App: React.FC = () => {
  const [artist, setArtist] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [structureSource, setStructureSource] = useState<string>('');
  const [inspirationLyrics, setInspirationLyrics] = useState<string>('');
  const [lyrics, setLyrics] = useState<string>('');
  const [musicStyle, setMusicStyle] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRemixing, setIsRemixing] = useState<boolean>(false);
  const [isHookRemixing, setIsHookRemixing] = useState<boolean>(false);
  const [isGeneratingStyle, setIsGeneratingStyle] = useState<boolean>(false);
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [includeInstructions, setIncludeInstructions] = useState<boolean>(true);
  const [history, setHistory] = useState<SongHistoryItem[]>([]);

  const generateAndSetMusicStyle = useCallback(async (lyrics: string, artist: string) => {
    setIsGeneratingStyle(true);
    try {
      const style = await generateMusicStyle(lyrics, artist);
      setMusicStyle(style);
    } catch (err) {
      console.error("Failed to generate music style:", err);
      // Fail silently without showing an error to the user for the optional style feature
    } finally {
      setIsGeneratingStyle(false);
    }
  }, []);

  const handleGenerateClick = useCallback(async () => {
    if (!artist || !topic) {
      setError('Please provide both an artist and a topic.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setLyrics('');
    setMusicStyle('');

    try {
      const result = await generateLyrics(artist, topic, structureSource, undefined, inspirationLyrics, includeInstructions);
      setLyrics(result);
      setHistory(prev => [{ id: Date.now(), artist, topic, lyrics: result }, ...prev]);
      generateAndSetMusicStyle(result, artist);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [artist, topic, structureSource, inspirationLyrics, includeInstructions, generateAndSetMusicStyle]);

  const handleRemixClick = useCallback(async () => {
    if (!artist || !topic || !lyrics) {
      setError('Cannot remix without an existing song.');
      return;
    }
    setIsRemixing(true);
    setError(null);
    setMusicStyle('');

    try {
      // Call WITH existing lyrics to trigger the remix prompt
      const result = await generateLyrics(artist, topic, structureSource, lyrics, undefined, includeInstructions);
      setLyrics(result);
      setHistory(prev => [{ id: Date.now(), artist: `${artist} (Reimagined)`, topic, lyrics: result }, ...prev]);
      generateAndSetMusicStyle(result, artist);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsRemixing(false);
    }
  }, [artist, topic, structureSource, lyrics, includeInstructions, generateAndSetMusicStyle]);

  const handleHookRemixClick = useCallback(async () => {
    if (!lyrics) {
      setError('Cannot create a remix without an existing song.');
      return;
    }
    setIsHookRemixing(true);
    setError(null);
    setMusicStyle('');
    
    try {
      const result = await generateHookRemix(lyrics, includeInstructions);
      setLyrics(result);
      setHistory(prev => [{ id: Date.now(), artist: `${artist} (Hook Remix)`, topic, lyrics: result }, ...prev]);
      generateAndSetMusicStyle(result, artist);
    } catch (err) {
       setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsHookRemixing(false);
    }
  }, [lyrics, artist, topic, includeInstructions, generateAndSetMusicStyle]);

  const handleEnhanceClick = useCallback(async () => {
    if (!lyrics) {
      setError('Cannot enhance without existing lyrics.');
      return;
    }
    setIsEnhancing(true);
    setError(null);
    
    try {
      const result = await enhanceLyrics(lyrics);
      setLyrics(result);
      setHistory(prev => [{ id: Date.now(), artist: `${artist} (Enhanced)`, topic, lyrics: result }, ...prev]);
    } catch (err) {
       setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsEnhancing(false);
    }
  }, [lyrics, artist, topic]);

  const handleLoadFromHistory = (id: number) => {
    const item = history.find(h => h.id === id);
    if (item) {
      setArtist(item.artist.replace(/ \((Reimagined|Hook Remix|Enhanced)\)$/, ''));
      setTopic(item.topic);
      setLyrics(item.lyrics);
      setMusicStyle('');
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const canGenerate = artist.trim() !== '' && topic.trim() !== '';
  const isBusy = isLoading || isRemixing || isHookRemixing || isEnhancing;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex justify-center items-center gap-4 mb-2">
            <MusicNoteIcon className="h-10 w-10 text-cyan-400" />
            <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-transparent bg-clip-text">
              Casey's Lyric Maker
            </h1>
          </div>
          <p className="text-slate-400 text-lg mt-2">
            Your personal AI lyricist for any style.
          </p>
        </header>

        <main className="bg-slate-800/50 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-2xl border border-slate-700">
          <div className="space-y-6">
            <TextInput
              id="artist"
              label="Artist's Name (for lyrical style)"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="e.g., Taylor Swift, Drake"
              disabled={isBusy}
            />
             <TextInput
              id="structure"
              label="Artist or Song for Structure (Optional)"
              value={structureSource}
              onChange={(e) => setStructureSource(e.target.value)}
              placeholder="e.g., Bohemian Rhapsody, The Beatles"
              disabled={isBusy}
            />
            <TextInput
              id="topic"
              label="Song Topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Summer romance, a long road trip"
              isTextArea={true}
              disabled={isBusy}
            />
            <TextInput
              id="inspiration"
              label="Inspirational Lyrics (Optional)"
              value={inspirationLyrics}
              onChange={(e) => setInspirationLyrics(e.target.value)}
              placeholder="Paste lyrics here to inspire the new song's theme and mood..."
              isTextArea={true}
              disabled={isBusy}
            />
          </div>
           <div className="mt-6 border-t border-slate-700 pt-6">
            <ToggleSwitch
              id="instructions"
              label="Include Production Cues"
              checked={includeInstructions}
              onChange={(e) => setIncludeInstructions(e.target.checked)}
              disabled={isBusy}
            />
          </div>
          <div className="mt-6">
            <Button
              onClick={handleGenerateClick}
              disabled={!canGenerate || isBusy}
              isLoading={isLoading}
            >
              <SparklesIcon className="h-5 w-5 mr-2" />
              Generate Song
            </Button>
          </div>
        </main>

        {error && (
          <div className="mt-6 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center">
            <p><strong>Error:</strong> {error}</p>
          </div>
        )}

        <div className="mt-8">
          {(isLoading || isHookRemixing) && (
            <div className="text-center p-4">
              <p className="text-lg text-slate-400 animate-pulse">
                {isLoading ? 'Crafting your masterpiece... analyzing rhythm and rhyme...' : 'Brewing an extended remix... focusing on the hook...'}
              </p>
            </div>
          )}
          {lyrics && !isLoading && !isHookRemixing && (
            <LyricsDisplay
              lyrics={lyrics}
              onRemix={handleRemixClick}
              isRemixing={isRemixing}
              onHookRemix={handleHookRemixClick}
              isHookRemixing={isHookRemixing}
              onEnhance={handleEnhanceClick}
              isEnhancing={isEnhancing}
              isGeneratingStyle={isGeneratingStyle}
              musicStyle={musicStyle}
            />
          )}
        </div>
        
        {history.length > 0 && (
          <div className="mt-8">
            <SongHistory 
              history={history}
              onLoadHistory={handleLoadFromHistory}
              onClearHistory={handleClearHistory}
            />
          </div>
        )}

      </div>
       <footer className="text-center mt-12 text-slate-500 text-sm">
        <p>Powered by Google Gemini. Lyrics are AI-generated and may be imperfect.</p>
      </footer>
    </div>
  );
};

export default App;