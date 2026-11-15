import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Briefcase, 
  DollarSign, 
  Clock 
} from 'lucide-react';
import { studentApi } from '../../api/client';
import { Project } from '../../types';
import { ProjectDetailModal } from '../../components/projects/ProjectDetailModal';
import { ApplyModal } from '../../components/projects/ApplyModal';
import { useToast } from '../../context/ToastContext';

export const RecommendationsPage: React.FC = () => {
  const { showToast } = useToast();
  const [recommendations, setRecommendations] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isApplyOpen, setIsApplyOpen] = useState(false);

  const fetchRecommendations = async () => {
    try {
      setIsLoading(true);
      const res = await studentApi.getRecommendations();
      if (res.data.success) {
        setRecommendations(res.data.data);
      }
    } catch {
      showToast('Failed to calculate skill recommendations', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 rounded-3xl p-6 lg:p-8 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Smart Skill Engine
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-bold">
            Tailored Project Recommendations
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Our recommendation algorithm cross-references your student skill profile against current client requirements, calculating match percentages and missing skills to maximize your winning rate.
          </p>
        </div>
        <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-xs text-emerald-200 shrink-0 font-medium">
          {recommendations.length} Matching Opportunities Found
        </div>
      </div>

      {/* Recommendations List */}
      <div className="flex flex-col gap-4">
        {recommendations.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 border border-slate-200/80 shadow-sm text-center flex flex-col items-center justify-center">
            <Sparkles className="w-10 h-10 text-emerald-500 mb-2 stroke-1" />
            <h3 className="text-base font-bold text-slate-900 mb-1">No recommendations yet</h3>
            <p className="text-xs text-slate-400 max-w-sm">
              Add more technical and creative skills to your profile to trigger high-confidence project matches!
            </p>
          </div>
        ) : (
          recommendations.map((proj) => (
            <div
              key={proj.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              {/* Left Details */}
              <div className="flex-1 flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Match percentage pill */}
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                    (proj.matchPercentage || 0) >= 80 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                      : (proj.matchPercentage || 0) >= 50
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{proj.matchPercentage || 0}% Skill Match</span>
                  </span>

                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-semibold text-slate-500 capitalize">
                    {proj.experience_level} Level
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500">
                    {proj.client_company || proj.client_name}
                  </span>
                </div>

                <h3
                  onClick={() => { setSelectedProject(proj); setIsDetailOpen(true); }}
                  className="text-lg font-bold text-slate-900 hover:text-emerald-700 cursor-pointer transition"
                >
                  {proj.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {proj.description}
                </p>

                {/* Skill Breakdown */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2 text-xs">
                  {/* Matching skills */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-bold text-emerald-700 flex items-center gap-1 mr-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Matched:
                    </span>
                    {proj.matchingSkills && proj.matchingSkills.length > 0 ? (
                      proj.matchingSkills.map((s: any, idx: number) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold"
                        >
                          {typeof s === 'string' ? s : s.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 text-[11px]">None</span>
                    )}
                  </div>

                  {/* Missing skills */}
                  {proj.missingSkills && proj.missingSkills.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 sm:border-l sm:border-slate-200 sm:pl-3">
                      <span className="font-bold text-slate-400 mr-1">Missing:</span>
                      {proj.missingSkills.map((sk: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-500 text-[11px]"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Action Box */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between lg:justify-center gap-4 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                <div className="flex flex-col lg:items-end">
                  <span className="text-base font-extrabold text-slate-900">
                    ${proj.budget.toFixed(2)}
                    <span className="text-xs text-slate-400 font-normal ml-1">
                      {proj.budget_type === 'hourly' ? '/ hr' : 'Fixed'}
                    </span>
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    {proj.proposals_count || 0} proposals submitted
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => { setSelectedProject(proj); setIsDetailOpen(true); }}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    View Details
                  </button>
                  {proj.has_applied ? (
                    <button
                      disabled
                      className="px-5 py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed"
                    >
                      Applied
                    </button>
                  ) : (
                    <button
                      onClick={() => { setSelectedProject(proj); setIsApplyOpen(true); }}
                      className="px-5 py-2 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-semibold transition shadow-sm"
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <ProjectDetailModal
        project={selectedProject}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onApply={(p) => { setSelectedProject(p); setIsApplyOpen(true); }}
        isStudent={true}
      />

      <ApplyModal
        project={selectedProject}
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        onSuccess={fetchRecommendations}
      />
    </div>
  );
};
