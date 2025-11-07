'use client';

import { useState } from 'react';
import { Upload, FileText, Target, CheckCircle, AlertCircle } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'parse' | 'score' | 'suggest'>('parse');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">ATS Simulator</h1>
                <p className="text-xs text-slate-500">Beat the bots, land the job</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>API Ready</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-3">
            Optimize Your Resume for ATS
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Parse, score, and improve your resume to pass Applicant Tracking Systems
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200">
            <div className="flex">
              {[
                { id: 'parse', label: 'Parse Resume', icon: FileText },
                { id: 'score', label: 'Score Match', icon: CheckCircle },
                { id: 'suggest', label: 'Improve Bullet', icon: AlertCircle },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-8">
            {activeTab === 'parse' && <ParseTab />}
            {activeTab === 'score' && <ScoreTab />}
            {activeTab === 'suggest' && <SuggestTab />}
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={FileText}
            title="Smart Parsing"
            description="Extract text from PDF, DOCX, and detect formatting issues"
          />
          <FeatureCard
            icon={CheckCircle}
            title="Skill Matching"
            description="Match your skills against job requirements with explainability"
          />
          <FeatureCard
            icon={AlertCircle}
            title="Bullet Optimization"
            description="Rewrite bullet points with action verbs and metrics"
          />
        </div>
      </main>
    </div>
  );
}

function ParseTab() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleParse = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/parse-resume`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      alert('Error parsing resume');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="hidden"
          id="resume-upload"
        />
        <label htmlFor="resume-upload" className="cursor-pointer">
          <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-sm font-medium text-slate-700 mb-1">
            {file ? file.name : 'Click to upload resume'}
          </p>
          <p className="text-xs text-slate-500">PDF, DOCX, or TXT (max 5MB)</p>
        </label>
      </div>

      <button
        onClick={handleParse}
        disabled={!file || loading}
        className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Parsing...' : 'Parse Resume'}
      </button>

      {result && (
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              Parse Quality: {result.parse_score.toFixed(1)}/20
            </h3>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(result.parse_score / 20) * 100}%` }}
              />
            </div>
          </div>

          {result.risks.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-amber-900 mb-2">⚠️ Format Risks</h4>
              <ul className="text-sm text-amber-800 space-y-1">
                {result.risks.map((risk: string, i: number) => (
                  <li key={i}>• {risk.replace(/_/g, ' ')}</li>
                ))}
              </ul>
            </div>
          )}

          {result.pii.emails.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">📧 PII Detected</h4>
              <p className="text-sm text-blue-800">
                {result.pii.emails.length} email(s), {result.pii.phones.length} phone(s)
              </p>
            </div>
          )}

          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <h4 className="font-semibold text-slate-900 mb-2">📄 ATS View (First 500 chars)</h4>
            <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono">
              {result.ats_view_text.slice(0, 500)}...
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreTab() {
  const [file, setFile] = useState<File | null>(null);
  const [jobData, setJobData] = useState({
    title: '',
    company: '',
    jd_text: '',
    required_skills: '',
    nice_skills: '',
    min_years: '',
    max_years: '',
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleScore = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    const jobPayload = {
      title: jobData.title,
      company: jobData.company || null,
      jd_text: jobData.jd_text,
      required_skills: jobData.required_skills ? jobData.required_skills.split(',').map(s => s.trim()) : null,
      nice_skills: jobData.nice_skills ? jobData.nice_skills.split(',').map(s => s.trim()) : null,
      min_years: jobData.min_years ? parseInt(jobData.min_years) : null,
      max_years: jobData.max_years ? parseInt(jobData.max_years) : null,
    };

    formData.append('job_json', JSON.stringify(jobPayload));

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/score`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      alert('Error scoring resume');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Job Title *"
          value={jobData.title}
          onChange={(e) => setJobData({ ...jobData, title: e.target.value })}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <input
          type="text"
          placeholder="Company"
          value={jobData.company}
          onChange={(e) => setJobData({ ...jobData, company: e.target.value })}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <textarea
        placeholder="Job Description *"
        value={jobData.jd_text}
        onChange={(e) => setJobData({ ...jobData, jd_text: e.target.value })}
        rows={4}
        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Required Skills (comma-separated)"
          value={jobData.required_skills}
          onChange={(e) => setJobData({ ...jobData, required_skills: e.target.value })}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <input
          type="text"
          placeholder="Nice-to-have Skills (comma-separated)"
          value={jobData.nice_skills}
          onChange={(e) => setJobData({ ...jobData, nice_skills: e.target.value })}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="number"
          placeholder="Min Years Experience"
          value={jobData.min_years}
          onChange={(e) => setJobData({ ...jobData, min_years: e.target.value })}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <input
          type="number"
          placeholder="Max Years Experience"
          value={jobData.max_years}
          onChange={(e) => setJobData({ ...jobData, max_years: e.target.value })}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="hidden"
          id="score-upload"
        />
        <label htmlFor="score-upload" className="cursor-pointer">
          <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">
            {file ? file.name : 'Upload Resume'}
          </p>
        </label>
      </div>

      <button
        onClick={handleScore}
        disabled={!file || !jobData.title || !jobData.jd_text || loading}
        className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Scoring...' : 'Score Resume'}
      </button>

      {result && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Total Score: {result.total}/100
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div>
                <p className="text-slate-600 mb-1">Parse</p>
                <p className="font-semibold text-slate-900">{result.subscores.parse.toFixed(1)}/20</p>
              </div>
              <div>
                <p className="text-slate-600 mb-1">Coverage</p>
                <p className="font-semibold text-slate-900">{result.subscores.coverage.toFixed(1)}/40</p>
              </div>
              <div>
                <p className="text-slate-600 mb-1">Seniority</p>
                <p className="font-semibold text-slate-900">{result.subscores.seniority.toFixed(1)}/15</p>
              </div>
              <div>
                <p className="text-slate-600 mb-1">Impact</p>
                <p className="font-semibold text-slate-900">{result.subscores.impact.toFixed(1)}/15</p>
              </div>
              <div>
                <p className="text-slate-600 mb-1">Format</p>
                <p className="font-semibold text-slate-900">{result.subscores.format_risk.toFixed(1)}/10</p>
              </div>
            </div>
          </div>

          {result.coverage_hits.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-3">✅ Matched Skills</h4>
              <div className="space-y-2">
                {result.coverage_hits.slice(0, 5).map((hit: any, i: number) => (
                  <div key={i} className="text-sm">
                    <p className="font-medium text-green-800">
                      {hit.skill} <span className="text-green-600">({hit.match_type})</span>
                    </p>
                    {hit.locations[0] && (
                      <p className="text-xs text-green-700 italic mt-1">
                        &quot;...{hit.locations[0].slice(0, 80)}...&quot;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.coverage_gaps.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2">❌ Missing Skills</h4>
              <div className="flex flex-wrap gap-2">
                {result.coverage_gaps.map((skill: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
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

function SuggestTab() {
  const [bullet, setBullet] = useState('');
  const [jdText, setJdText] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSuggest = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bullet, jd_text: jdText }),
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      alert('Error getting suggestion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <textarea
        placeholder="Enter your resume bullet point *"
        value={bullet}
        onChange={(e) => setBullet(e.target.value)}
        rows={3}
        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      <textarea
        placeholder="Job description (optional, for context)"
        value={jdText}
        onChange={(e) => setJdText(e.target.value)}
        rows={3}
        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      <button
        onClick={handleSuggest}
        disabled={!bullet || loading}
        className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Analyzing...' : 'Get Suggestion'}
      </button>

      {result && (
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h4 className="font-semibold text-slate-900 mb-2">📝 Original</h4>
            <p className="text-sm text-slate-700">{bullet}</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">✨ Improved</h4>
            <p className="text-sm text-green-800 mb-3">{result.suggestion}</p>
            <p className="text-xs text-green-700 italic">{result.rationale}</p>
            {result.changed_tokens.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {result.changed_tokens.map((token: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                    +{token}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: any) {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600">{description}</p>
    </div>
  );
}
