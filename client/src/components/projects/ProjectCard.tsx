import React from 'react';
import { 
  CheckCircle, 
  MapPin, 
  MoreVertical, 
  DollarSign, 
  FileText,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Project } from '../../types';

interface ProjectCardProps {
  project: Project;
  onViewDetails: (project: Project) => void;
  onApply: (project: Project) => void;
  isGridView?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onViewDetails,
  onApply,
  isGridView = true
}) => {
  // Format experience level
  const experienceLabel = 
    project.experience_level === 'entry' ? 'Entry Level' :
    project.experience_level === 'intermediate' ? 'Intermediate' : 'Expert';

  // Format time ago (fallback to created date calculation)
  const getTimeAgo = (dateStr: string) => {
    try {
      const created = new Date(dateStr).getTime();
      const now = new Date().getTime();
      const diffMinutes = Math.floor((now - created) / (1000 * 60));
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes} mins ago`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours} hours ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} days ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className={`bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
      isGridView ? 'w-full' : 'w-full mb-4'
    }`}>
      <div className="flex flex-col gap-3">
        {/* Top Header Row */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">
            {experienceLabel}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">
              {getTimeAgo(project.created_at)}
            </span>
            <button 
              onClick={() => onViewDetails(project)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition"
              title="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Project Title */}
        <h3
          onClick={() => onViewDetails(project)}
          className="text-base font-bold text-slate-900 hover:text-emerald-700 cursor-pointer transition leading-snug line-clamp-1"
        >
          {project.title}
        </h3>

        {/* Badges Row (Verified, Location, Status) */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Verified */}
          <div className="flex items-center gap-1 text-sky-600 font-medium">
            <CheckCircle className="w-3.5 h-3.5 fill-sky-600 text-white" />
            <span>Verified</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{project.location || 'Remote'}</span>
          </div>

          {/* Hiring Status Badge */}
          {project.status === 'open' ? (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Still Selecting</span>
            </div>
          ) : project.status === 'in_progress' ? (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-semibold border border-amber-100">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>1 Hired</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">
              <span className="capitalize">{project.status}</span>
            </div>
          )}

          {/* Optional Match Percentage Badge if calculated */}
          {project.matchPercentage !== undefined && project.matchPercentage > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-100 ml-auto">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>{project.matchPercentage}% Match</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 my-1">
          {project.description}
        </p>

        {/* Required Skill Tags (Pills exactly like screenshot) */}
        <div className="flex flex-wrap gap-1.5 my-1">
          {project.required_skills && project.required_skills.length > 0 ? (
            project.required_skills.slice(0, 6).map((skill) => (
              <span
                key={skill.id}
                className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 border border-slate-200/80 text-[11px] font-medium"
              >
                {skill.name}
              </span>
            ))
          ) : (
            <span className="px-2 py-0.5 rounded bg-slate-50 text-slate-400 text-[11px]">
              General Skills
            </span>
          )}
        </div>
      </div>

      {/* Bottom Row (Budget, Proposals, Apply Button) */}
      <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100">
        <div className="flex items-center gap-4">
          {/* Budget */}
          <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
            <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[11px]">
              $
            </div>
            <span>
              ${project.budget.toFixed(2)}
              <span className="text-slate-400 font-normal ml-0.5">
                {project.budget_type === 'hourly' ? '/hour' : ' Fixed'}
              </span>
            </span>
          </div>

          {/* Proposals Count */}
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>{project.proposals_count || 0} proposals</span>
          </div>
        </div>

        {/* Action Button */}
        <div>
          {project.has_applied ? (
            <button
              disabled
              className="px-5 py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed"
            >
              Applied
            </button>
          ) : (
            <button
              onClick={() => onApply(project)}
              className="px-5 py-2 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-semibold transition shadow-sm active:scale-95"
            >
              Apply Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
