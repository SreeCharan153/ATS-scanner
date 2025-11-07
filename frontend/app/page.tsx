'use client';

import { useState } from 'react';
import { FileText, CheckCircle, AlertCircle, Target, LucideIcon } from 'lucide-react';
import ParseTab from '@/components/ats/ParseTab';
import ScoreTab from '@/components/ats/ScoreTab';
import SuggestTab from '@/components/ats/SuggestTab';
import FeatureCard from '@/components/ats/FeatureCard';

export default function Home() {
 const [activeTab, setActiveTab] = useState<'parse' | 'score' | 'suggest'>('parse');

type TabId = 'parse' | 'score' | 'suggest';

const tabs: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: 'parse', label: 'Parse Resume', icon: FileText },
  { id: 'score', label: 'Score Match', icon: CheckCircle },
  { id: 'suggest', label: 'Improve Bullet', icon: AlertCircle },
];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
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
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>API Ready</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-2">Optimize Your Resume for ATS</h2>
          <p className="text-lg text-slate-600">Parse, score and improve your resume</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200 flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 text-sm font-medium transition flex items-center justify-center space-x-2 
                  ${activeTab === tab.id ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="p-8">
            {activeTab === 'parse' && <ParseTab />}
            {activeTab === 'score' && <ScoreTab />}
            {activeTab === 'suggest' && <SuggestTab />}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <FeatureCard icon={FileText} title="Smart Parsing" description="Extract text & detect formatting issues" />
          <FeatureCard icon={CheckCircle} title="Skill Matching" description="Match resume to job with reasoning" />
          <FeatureCard icon={AlertCircle} title="Bullet Optimization" description="Rewrite bullets with action verbs & metrics" />
        </div>
      </main>
    </div>
  );
}