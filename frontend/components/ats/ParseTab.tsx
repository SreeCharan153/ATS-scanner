'use client';

import { useState } from 'react';
import { Upload, CheckCircle } from 'lucide-react';
import { validateResume } from './hooks/useFileValidation';

export default function ParseTab() {
    type ParseResult = {
  parse_score: number;
  risks: string[];
  pii: { emails: string[]; phones: string[] };
  ats_view_text: string;
    };
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ParseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const url = 'https://127.0.0.1:8000';
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const err = validateResume(f);
    if (err) return setError(err);
    setError('');
    setFile(f);
  };

  const handleParse = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${url}/parse-resume`, {
        method: 'POST',
        body: formData,
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
      <div className={`border-2 border-dashed p-8 text-center rounded-xl ${error ? 'border-red-400' : 'border-slate-300 hover:border-blue-400'}`}>
        <input hidden id="file-p" type="file" accept=".pdf,.docx,.txt" onChange={handleFile} />
        <label htmlFor="file-p" className="cursor-pointer">
          <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-sm text-slate-700 mb-1">{file ? file.name : 'Click to upload resume'}</p>
          <p className="text-xs text-slate-500">PDF, DOCX, TXT, max 5MB</p>
        </label>
      </div>

      {error && <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm">{error}</div>}

      <button
        onClick={handleParse}
        disabled={!file || loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-slate-300 transition">
        {loading ? 'Parsing...' : 'Parse Resume'}
      </button>

      {loading && (
        <div className="animate-pulse space-y-2 mt-4">
          <div className="h-4 bg-slate-200 rounded w-full"></div>
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="bg-slate-50 p-5 rounded-lg border">
            <h3 className="font-semibold text-slate-900 mb-2 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              Parse Quality: {(result?.parse_score ?? 0).toFixed(1)}/20
            </h3>
          </div>

          {result?.risks?.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-amber-900 mb-2">Format Risks</h4>
              {result.risks.map((r: string, i: number) => (
                <p key={i} className="text-sm text-amber-800">• {r.replace(/_/g, ' ')}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}