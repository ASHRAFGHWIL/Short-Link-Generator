import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { UrlInputForm } from './components/UrlInputForm';
import { ShortLinkDisplay } from './components/ShortLinkDisplay';
import { Loader } from './components/Loader';
import { Footer } from './components/Footer';
import { shortenUrl, customizeShortUrl, generatePathSuggestions, initializeClickCount } from './services/linkShortenerService';

const App: React.FC = () => {
  const [longUrl, setLongUrl] = useState<string>('');
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCustomizing, setIsCustomizing] = useState<boolean>(false);
  const [customError, setCustomError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [wasJustShortened, setWasJustShortened] = useState<boolean>(false);

  const handleShortenUrl = useCallback(async () => {
    if (!longUrl) {
      setError('Please enter a URL to shorten.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setCustomError(null);
    setShortUrl(null);
    setSuggestions(null);
    setSuggestionError(null);
    setWasJustShortened(false);

    try {
      const result = await shortenUrl(longUrl);
      setShortUrl(result);
      initializeClickCount(result);
      navigator.clipboard.writeText(result);
      setWasJustShortened(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
      setShortUrl(null);
    } finally {
      setIsLoading(false);
    }
  }, [longUrl]);

  const handleCustomizeUrl = useCallback(
    async (customPath: string) => {
      if (!shortUrl) return;

      setIsCustomizing(true);
      setCustomError(null);
      setWasJustShortened(false);

      try {
        const newShortUrl = await customizeShortUrl(shortUrl, customPath);
        setShortUrl(newShortUrl);
        initializeClickCount(newShortUrl);
      } catch (err) {
        if (err instanceof Error) {
          setCustomError(err.message);
        } else {
          setCustomError('An unknown error occurred during customization.');
        }
      } finally {
        setIsCustomizing(false);
      }
    },
    [shortUrl]
  );

  const handleGetSuggestions = useCallback(async (prompt: string, mode: 'fast' | 'smart') => {
    if (!prompt) {
      setSuggestionError('Please enter a description to get suggestions.');
      return;
    }
    setIsSuggesting(true);
    setSuggestionError(null);
    setSuggestions(null);

    try {
      const result = await generatePathSuggestions(prompt, longUrl, mode);
      setSuggestions(result);
    } catch (err) {
      if (err instanceof Error) {
        setSuggestionError(err.message);
      } else {
        setSuggestionError('An unknown error occurred while getting suggestions.');
      }
      setSuggestions(null);
    } finally {
      setIsSuggesting(false);
    }
  }, [longUrl]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md mx-auto">
        <Header />
        <main className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 sm:p-8 rounded-2xl shadow-2xl shadow-slate-950/50 transition-all duration-300">
          <UrlInputForm
            longUrl={longUrl}
            setLongUrl={setLongUrl}
            onSubmit={handleShortenUrl}
            isLoading={isLoading || isCustomizing}
          />

          {error && (
            <div className="mt-4 text-center bg-red-900/50 border border-red-700 text-red-300 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="mt-6 min-h-[64px] flex items-center justify-center">
            {isLoading ? (
              <Loader />
            ) : (
              shortUrl && (
                <ShortLinkDisplay
                  longUrl={longUrl}
                  shortUrl={shortUrl}
                  onCustomize={handleCustomizeUrl}
                  isCustomizing={isCustomizing}
                  customError={customError}
                  suggestions={suggestions}
                  isSuggesting={isSuggesting}
                  suggestionError={suggestionError}
                  onGetSuggestions={handleGetSuggestions}
                  wasJustShortened={wasJustShortened}
                />
              )
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default App;