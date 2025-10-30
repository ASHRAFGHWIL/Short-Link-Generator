import React, { useState, useEffect, useRef } from 'react';
import { Loader } from './Loader';
import { getClickCount, incrementClickCount } from '../services/linkShortenerService';

interface ShortLinkDisplayProps {
  longUrl: string;
  shortUrl: string;
  onCustomize: (customPath: string) => void;
  isCustomizing: boolean;
  customError: string | null;
  suggestions: string[] | null;
  isSuggesting: boolean;
  suggestionError: string | null;
  onGetSuggestions: (prompt: string, mode: 'fast' | 'smart') => void;
  wasJustShortened: boolean;
}

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const ChevronDownIcon = ({ isExpanded }: { isExpanded: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

const TrendingUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);

export const ShortLinkDisplay: React.FC<ShortLinkDisplayProps> = ({ 
    longUrl, 
    shortUrl, 
    onCustomize, 
    isCustomizing, 
    customError,
    suggestions,
    isSuggesting,
    suggestionError,
    onGetSuggestions,
    wasJustShortened
}) => {
  const [copyText, setCopyText] = useState<'Copy' | 'Copied!'>('Copy');
  const [customPath, setCustomPath] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [clickCount, setClickCount] = useState<number>(0);

  const prevIsCustomizing = useRef<boolean>();

  useEffect(() => {
    if (wasJustShortened) {
      setCopyText('Copied!');
    } else {
      setCopyText('Copy');
    }
    setIsExpanded(false);
    setAiPrompt('');
    setClickCount(getClickCount(shortUrl));
  }, [shortUrl, wasJustShortened]);

  useEffect(() => {
    if (copyText === 'Copied!') {
      const timer = setTimeout(() => {
        setCopyText('Copy');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copyText]);

  useEffect(() => {
    if (prevIsCustomizing.current === true && !isCustomizing && !customError) {
      setSuccessMessage('Link customized successfully!');
      setCustomPath(''); 
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
    prevIsCustomizing.current = isCustomizing;
  }, [isCustomizing, customError]);

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopyText('Copied!');
  };

  const handleCustomizeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMessage(null);
    onCustomize(customPath);
  };

  const handleLinkClick = () => {
    const newCount = incrementClickCount(shortUrl);
    setClickCount(newCount);
  };
  
  const getShortUrlBase = () => {
    try {
        const url = new URL(shortUrl);
        return `${url.origin}/`;
    } catch {
        return 'https://shrtco.de/'; // Fallback
    }
  }

  return (
    <div className="w-full space-y-4 animate-fade-in">
        <div className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <a
            href={shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleLinkClick}
            className="text-indigo-300 font-mono text-sm sm:text-base truncate hover:underline self-start sm:self-center"
          >
            {shortUrl}
          </a>
          <div className="flex items-center self-stretch sm:self-auto justify-between sm:justify-end gap-4 shrink-0">
            <div className="flex items-center gap-1.5 text-slate-400" title={`${clickCount} clicks`}>
              <TrendingUpIcon />
              <span className="font-mono text-sm">{clickCount}</span>
            </div>
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                copyText === 'Copied!'
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-600 hover:bg-slate-500 text-slate-200'
              }`}
            >
              {copyText === 'Copied!' ? <CheckIcon /> : <CopyIcon />}
              {copyText}
            </button>
          </div>
        </div>

        <div className="bg-slate-700/20 border border-slate-700 rounded-lg text-sm transition-all duration-300">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex justify-between items-center p-3 text-slate-300 hover:bg-slate-700/40 rounded-t-lg transition-colors"
                aria-expanded={isExpanded}
                aria-controls="original-url-content"
            >
                <span>Original URL</span>
                <ChevronDownIcon isExpanded={isExpanded} />
            </button>
            {isExpanded && (
                <div id="original-url-content" className="p-3 border-t border-slate-700 animate-fade-in">
                    <a
                        href={longUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 font-mono break-all hover:underline"
                    >
                        {longUrl}
                    </a>
                </div>
            )}
        </div>

        <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4 animate-fade-in-slow">
            <form onSubmit={handleCustomizeSubmit}>
                <label htmlFor="customPath" className="block text-sm font-medium text-slate-300 mb-2">
                    Customize your link
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex items-center flex-grow">
                      <span className="text-slate-400 bg-slate-700 p-2.5 rounded-l-md border border-r-0 border-slate-600 font-mono whitespace-nowrap">{getShortUrlBase()}</span>
                      <input
                          id="customPath"
                          type="text"
                          value={customPath}
                          onChange={(e) => setCustomPath(e.target.value)}
                          placeholder="my-awesome-link"
                          className="w-full flex-grow p-2 bg-slate-700/50 border border-slate-600 rounded-r-md text-slate-200 placeholder-slate-500 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all disabled:opacity-50 font-mono"
                          disabled={isCustomizing}
                          aria-describedby="custom-error-message custom-success-message"
                      />
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-500/50 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition-colors duration-200 shrink-0"
                        disabled={isCustomizing || !customPath.trim()}
                    >
                        {isCustomizing ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </form>
            {customError && (
                <p id="custom-error-message" className="mt-2 text-red-400 text-sm">{customError}</p>
            )}
            {successMessage && (
                <p id="custom-success-message" className="mt-2 text-green-400 text-sm">{successMessage}</p>
            )}
        </div>
        
        <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4 animate-fade-in-slow">
            <div className="space-y-3">
                <label htmlFor="aiPrompt" className="block text-sm font-medium text-slate-300">
                    Need ideas? Get AI-powered suggestions.
                </label>
                <textarea
                    id="aiPrompt"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g., 'A link to my new photo portfolio'"
                    className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-md text-slate-200 placeholder-slate-500 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all disabled:opacity-50 text-sm"
                    rows={2}
                    disabled={isSuggesting}
                    aria-describedby="suggestion-error-message"
                />
                <div className="flex flex-col sm:flex-row gap-2">
                    <button
                        type="button"
                        onClick={() => onGetSuggestions(aiPrompt, 'fast')}
                        className="w-full p-2 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-500/50 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition-colors duration-200 text-sm"
                        disabled={isSuggesting || !aiPrompt.trim()}
                    >
                        Suggest (Fast)
                    </button>
                    <button
                        type="button"
                        onClick={() => onGetSuggestions(aiPrompt, 'smart')}
                        className="w-full p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-500/50 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition-colors duration-200 text-sm"
                        disabled={isSuggesting || !aiPrompt.trim()}
                    >
                        Suggest (Smart)
                    </button>
                </div>
            </div>
            {isSuggesting && (
              <div className="mt-4 flex justify-center items-center gap-2 text-slate-400">
                <Loader />
                <span>Generating ideas...</span>
              </div>
            )}
            {suggestionError && (
                <p id="suggestion-error-message" className="mt-2 text-red-400 text-sm">{suggestionError}</p>
            )}
            {suggestions && suggestions.length > 0 && (
                <div className="mt-4 space-y-2">
                    <p className="text-sm text-slate-300">Click a suggestion to use it:</p>
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => setCustomPath(suggestion)}
                                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-full text-sm text-slate-200 font-mono transition-colors"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};