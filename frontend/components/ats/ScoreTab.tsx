'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';
import { validateResume } from './hooks/useFileValidation';

// ----------------- TS MODELS -----------------
type JobData = {
  title: string;
  company: string;
  jd_text: string;
  required_skills: string;
  nice_skills: string;
  min_years: string;
  max_years: string;
};

type CoverageHit = {
  skill: string;
  match_type: string;
  locations: string[];
};

type ScoreResult = {
  total: number;
  subscores: {
    parse: number;
    coverage: number;
    seniority: number;
    impact: number;
    format_risk: number;
  };
  coverage_hits: CoverageHit[];
  coverage_gaps: string[];
};

// ----------------- COMPONENT -----------------
export default function ScoreTab() {
  const [file, setFile] = useState<File | null>(null);
  const [jobData, setJobData] = useState<JobData>({
    title: '',
    company: '',
    jd_text: '',
    required_skills: '',
    nice_skills: '',
    min_years: '',
    max_years: '',
  });

  const [result, setResult] = useState<ScoreResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const err = validateResume(f);
    if (err) setError(err);
    else {
      setError('');
      setFile(f);
    }
  };

  const setField = (field: keyof JobData, value: string) => {
    setJobData((prev) => ({ ...prev, [field]: value }));
  };

  const handleScore = async () => {
    if (!file || !jobData.title || !jobData.jd_text) {
      return setError('Job title, description, and resume are required.');
    }

    setError('');
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    const payload = {
      title: jobData.title,
      company: jobData.company || null,
      jd_text: jobData.jd_text,
      required_skills: jobData.required_skills
        ? jobData.required_skills.split(',').map((x) => x.trim())
        : null,
      nice_skills: jobData.nice_skills
        ? jobData.nice_skills.split(',').map((x) => x.trim())
        : null,
      min_years: jobData.min_years || null,
      max_years: jobData.max_years || null,
    };

    formData.append('job_json', JSON.stringify(payload));

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/score`, {
        method: 'POST',
        body: formData,
      });

      const data: ScoreResult = await res.json();
      setResult(data);
    } catch {
      setError('Server error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* -------- FORM INPUTS -------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          className="form-input"
          placeholder="Job Title *"
          value={jobData.title}
          onChange={(e) => setField('title', e.target.value)}
        />
        <input
          className="form-input"
          placeholder="Company"
          value={jobData.company}
          onChange={(e) => setField('company', e.target.value)}
        />
      </div>

      <textarea
        className="form-input h-28"
        placeholder="Job Description *"
        value={jobData.jd_text}
        onChange={(e) => setField('jd_text', e.target.value)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          className="form-input"
          placeholder="Required Skills (comma-separated)"
          value={jobData.required_skills}
          onChange={(e) => setField('required_skills', e.target.value)}
        />
        <input
          className="form-input"
          placeholder="Nice-to-have Skills (comma-separated)"
          value={jobData.nice_skills}
          onChange={(e) => setField('nice_skills', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          className="form-input"
          type="number"
          placeholder="Min Years Experience"
          value={jobData.min_years}
          onChange={(e) => setField('min_years', e.target.value)}
        />
        <input
          className="form-input"
          type="number"
          placeholder="Max Years Experience"
          value={jobData.max_years}
          onChange={(e) => setField('max_years', e.target.value)}
        />
      </div>

      {/* -------- FILE UPLOAD -------- */}
      <div className="border-2 border-dashed rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
        <input type="file" hidden id="score-up" accept=".pdf,.docx,.txt" onChange={handleFile} />
        <label htmlFor="score-up" className="cursor-pointer">
          <Upload className="w-10 h-10 mx-auto text-slate-400 mb-2" />
          <p className="font-medium">{file ? file.name : 'Upload Resume'}</p>
        </label>
      </div>

      {error && <div className="error-box">{error}</div>}

      {/* -------- SUBMIT BUTTON -------- */}
      <button className="btn-primary" disabled={loading} onClick={handleScore}>
        {loading ? 'Scoring...' : 'Score Resume'}
      </button>

      {/* -------- LOADING SKELETON -------- */}
      {loading && (
        <div className="animate-pulse space-y-3 mt-2">
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          <div className="h-4 bg-slate-200 rounded w-full"></div>
          <div className="h-4 bg-slate-200 rounded w-2/3"></div>
        </div>
      )}

      {/* -------- RESULT -------- */}
      {result && (
        <div className="space-y-4 mt-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-2xl font-bold text-slate-900">
              Total Score: {result.total}/100
            </h3>
          </div>

          {result.coverage_hits.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">Matched Skills</h4>
              {result.coverage_hits.slice(0, 5).map((hit) => (
                <p key={hit.skill} className="text-sm text-green-800">
                  ✅ {hit.skill} ({hit.match_type})
                </p>
              ))}
            </div>
          )}

          {result.coverage_gaps.length > 0 && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <h4 className="font-semibold text-red-900 mb-2">Missing Skills</h4>
              <div className="flex flex-wrap gap-2">
                {result.coverage_gaps.map((skill) => (
                  <span key={skill} className="badge-red">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
