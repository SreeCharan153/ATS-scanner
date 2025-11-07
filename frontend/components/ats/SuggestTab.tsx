'use client';

import { useState } from 'react';

export default function SuggestTab() {
    type SuggestResult = {
  suggestion: string;
  rationale: string;
  changed_tokens: string[];
    };
  const [bullet, setBullet] = useState('');
  const [jdText, setJdText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SuggestResult | null>(null);
  const url = 'https://127.0.0.1:8000';

  const handleSuggest = async () => {
    if (!bullet) return setError('Enter a bullet point first.');

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`${url}/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bullet, jd_text: jdText || null }),
      });

      const data = await res.json();
      setResult(data);
    } catch {
      setError('Server error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <textarea
        className="form-input h-28"
        placeholder="Enter your resume bullet point *"
        value={bullet}
        onChange={(e) => setBullet(e.target.value)}
      />

      <textarea
        className="form-input h-28"
        placeholder="Job description (optional)"
        value={jdText}
        onChange={(e) => setJdText(e.target.value)}
      />

      {error && <div className="error-box">{error}</div>}

      <button className="btn-primary" onClick={handleSuggest} disabled={loading}>
        {loading ? 'Analyzing...' : 'Get Suggestion'}
      </button>

      {loading && (
        <div className="animate-pulse space-y-3 mt-2">
          <div className="h-4 bg-slate-200 rounded w-2/3"></div>
          <div className="h-4 bg-slate-200 rounded w-full"></div>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 border rounded-lg">
            <h4 className="font-semibold mb-1">Original</h4>
            <p className="text-sm text-slate-700">{bullet}</p>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-1">Improved</h4>
            <p className="text-sm">{result.suggestion}</p>
            <p className="text-xs text-green-700 italic mt-1">{result.rationale}</p>
          </div>
        </div>
      )}
    </div>
  );
}
