import React from 'react';
import { 
  X, 
  MapPin, 
  CheckCircle, 
  DollarSign, 
  Calendar, 
  Briefcase, 
  Building2, 
  Clock, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { Project } from '../../types';

interface ProjectDetailModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (project: Project) => void;
  isStudent: boolean;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  isOpen,
  onClose,
  onApply,
  isStudent
}) => {
  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 lg:p-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              {project.category}
            </span>
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900">
              {project.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Budget</span>
            <span className="font-bold text-slate-900">
              ${project.budget.toFixed(2)} ({project.budget_type})
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Experience</span>
            <span className="font-bold text-slate-900 capitalize">
              {project.experience_level}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Project Type</span>
            <span className="font-bold text-slate-900 capitalize">
              {project.project_type}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Deadline</span>
            <span className="font-bold text-slate-900">
              {project.deadline || 'Flexible'}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-bold text-slate-900">Project Description</h4>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {project.description}
          </p>
        </div>

        {/* Additional Requirements if any */}
        {project.additional_requirements && (
          <div className="flex flex-col gap-2 p-3.5 bg-amber-50/60 rounded-xl border border-amber-100 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Special Client Requirements:</span>
            </div>
            <p className="text-amber-800 leading-relaxed">
              {project.additional_requirements}
            </p>
          </div>
        )}

        {/* Required Skills */}
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-bold text-slate-900">Required Skills</h4>
          <div className="flex flex-wrap gap-2">
            {project.required_skills && project.required_skills.length > 0 ? (
              project.required_skills.map((skill) => (
                <span
                  key={skill.id}
                  className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium"
                >
                  {skill.name}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">No specific skills tagged</span>
            )}
          </div>
        </div>

        {/* Client Profile Box */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
              {project.client_name ? project.client_name.charAt(0) : 'C'}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900">
                  {project.client_company || project.client_name}
                </span>
                <CheckCircle className="w-3.5 h-3.5 fill-sky-600 text-white" />
              </div>
              <span className="text-[11px] text-slate-500">
                {project.location || 'Remote'} • {project.proposals_count || 0} proposals received
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Close
          </button>
          {isStudent && (
            project.has_applied ? (
              <button
                disabled
                className="px-6 py-2.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed"
              >
                Already Applied
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onApply(project);
                }}
                className="px-6 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-semibold transition shadow-sm"
              >
                Apply for this Project
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};
