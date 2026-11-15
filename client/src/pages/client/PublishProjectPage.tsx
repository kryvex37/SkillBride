import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Send, 
  DollarSign, 
  Calendar, 
  X, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { projectApi, skillApi } from '../../api/client';
import { useToast } from '../../context/ToastContext';

interface PublishProjectPageProps {
  onSuccess: () => void;
}

export const PublishProjectPage: React.FC<PublishProjectPageProps> = ({ onSuccess }) => {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSkills, setAvailableSkills] = useState<any[]>([]);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Web & App Design');
  const [budget, setBudget] = useState('25.00');
  const [budgetType, setBudgetType] = useState<'hourly' | 'fixed'>('hourly');
  const [projectType, setProjectType] = useState<'one-time' | 'ongoing'>('one-time');
  const [experienceLevel, setExperienceLevel] = useState<'entry' | 'intermediate' | 'expert'>('entry');
  const [deadline, setDeadline] = useState('');
  const [additionalRequirements, setAdditionalRequirements] = useState('');

  // Skills Tagging
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['Web Design', 'UI Design']);
  const [customSkillInput, setCustomSkillInput] = useState('');

  useEffect(() => {
    skillApi.getAll().then(res => {
      if (res.data.success) {
        setAvailableSkills(res.data.data);
      }
    }).catch(() => {});
  }, []);

  const handleAddSkillTag = (skillName: string) => {
    if (!skillName.trim()) return;
    if (!selectedSkills.includes(skillName.trim())) {
      setSelectedSkills([...selectedSkills, skillName.trim()]);
    }
    setCustomSkillInput('');
  };

  const handleRemoveSkillTag = (skillName: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skillName));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast('Please provide a project title and detailed description', 'warning');
      return;
    }
    if (!budget || parseFloat(budget) <= 0) {
      showToast('Please specify a valid budget amount', 'warning');
      return;
    }
    if (selectedSkills.length === 0) {
      showToast('Please tag at least one required skill for matching', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await projectApi.create({
        title: title.trim(),
        description: description.trim(),
        category,
        budget: parseFloat(budget),
        budget_type: budgetType,
        project_type: projectType,
        experience_level: experienceLevel,
        deadline: deadline || null,
        additional_requirements: additionalRequirements.trim(),
        skills: selectedSkills
      });

      if (res.data.success) {
        showToast('🚀 Project request published successfully!', 'success');
        onSuccess();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to publish project';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/80 shadow-sm max-w-4xl mx-auto flex flex-col gap-6">
      <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-1">
            New Job Request
          </span>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900">
            Publish a Project Request
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Specify your requirements, required skills, and budget to connect with verified university talent.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Title */}
        <div>
          <label className="text-xs font-bold text-slate-900 block mb-1">
            Project Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Build/Edit Landing Page for Online Course"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
          />
        </div>

        {/* Category & Experience Level */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-900 block mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium"
            >
              <option value="Web & App Design">Web & App Design</option>
              <option value="Web Development">Web Development</option>
              <option value="Software & Tech">Software & Tech</option>
              <option value="Mobile Development">Mobile Development</option>
              <option value="Graphic Design">Graphic Design</option>
              <option value="Writing & Content">Writing & Content</option>
              <option value="AI & Machine Learning">AI & Machine Learning</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-900 block mb-1">Required Experience Level</label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium"
            >
              <option value="entry">Entry Level (Fresh talent / great value)</option>
              <option value="intermediate">Intermediate (Experienced students)</option>
              <option value="expert">Expert (Senior students / high complexity)</option>
            </select>
          </div>
        </div>

        {/* Detailed Description */}
        <div>
          <label className="text-xs font-bold text-slate-900 block mb-1">
            Detailed Project Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={5}
            required
            placeholder="Clearly explain the deliverables, goals, design inspirations, and expectations for the student..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed resize-none"
          />
        </div>

        {/* Required Skills (Critical for bonus matching algorithm) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-slate-900">
              Required Skills (Tags for Smart Matching) <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-emerald-600 font-medium">Used to rank student candidates</span>
          </div>

          <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl mb-2 min-h-11">
            {selectedSkills.map((sk) => (
              <span
                key={sk}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
              >
                <span>{sk}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkillTag(sk)}
                  className="text-slate-400 hover:text-rose-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type a skill and press Add or pick below (e.g. Figma, WordPress, Python)..."
              value={customSkillInput}
              onChange={(e) => setCustomSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkillTag(customSkillInput);
                }
              }}
              className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={() => handleAddSkillTag(customSkillInput)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              Add Tag
            </button>
          </div>

          {/* Quick Skill Suggestions */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="text-[11px] text-slate-400 self-center mr-1">Suggestions:</span>
            {['UI Design', 'Web Design', 'Landing Page', 'WordPress', 'React', 'Python', 'Figma', 'Flutter'].map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => handleAddSkillTag(s)}
                className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 text-[10px] font-medium transition"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>

        {/* Budget, Budget Type, Project Type, and Deadline */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div>
            <label className="text-xs font-bold text-slate-900 block mb-1">Budget ($)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-bold">$</span>
              <input
                type="number"
                step="0.01"
                min="5"
                required
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-900 block mb-1">Budget Type</label>
            <select
              value={budgetType}
              onChange={(e) => setBudgetType(e.target.value as any)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium"
            >
              <option value="hourly">Hourly Rate</option>
              <option value="fixed">Fixed Price</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-900 block mb-1">Project Scope</label>
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value as any)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium"
            >
              <option value="one-time">One-time Project</option>
              <option value="ongoing">Ongoing Contract</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-900 block mb-1">Expected Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium"
            />
          </div>
        </div>

        {/* Additional Requirements */}
        <div>
          <label className="text-xs font-bold text-slate-900 block mb-1">
            Additional Requirements or Instructions (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Please include links to previous live WordPress websites you designed."
            value={additionalRequirements}
            onChange={(e) => setAdditionalRequirements(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm"
          >
            {isSubmitting ? (
              <span>Publishing...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Publish Project Request</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
