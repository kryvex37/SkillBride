import React, { useState, useEffect } from 'react';
import { 
  User, 
  Upload, 
  GraduationCap, 
  BookOpen, 
  IdCard, 
  Github, 
  Linkedin, 
  Globe, 
  Plus, 
  Trash2, 
  Check, 
  Sparkles,
  Camera,
  Star,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { studentApi, skillApi, uploadApi } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export const StudentProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [availableSkills, setAvailableSkills] = useState<any[]>([]);

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [university, setUniversity] = useState('');
  const [department, setDepartment] = useState('');
  const [studentId, setStudentId] = useState('');
  const [bio, setBio] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('intermediate');
  const [education, setEducation] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  // Skill Add Form
  const [selectedSkillId, setSelectedSkillId] = useState<string>('');
  const [customSkillName, setCustomSkillName] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState('intermediate');
  const [newSkillYears, setNewSkillYears] = useState('1');
  const [isAddingSkill, setIsAddingSkill] = useState(false);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const [profRes, skillsRes] = await Promise.all([
        studentApi.getProfile(),
        skillApi.getAll()
      ]);

      if (profRes.data.success) {
        const data = profRes.data.data;
        setProfile(data);
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setUniversity(data.university || '');
        setDepartment(data.department || '');
        setStudentId(data.student_id || '');
        setBio(data.bio || '');
        setExperienceLevel(data.experience_level || 'intermediate');
        setEducation(data.education || '');
        setGithubUrl(data.github_url || '');
        setLinkedinUrl(data.linkedin_url || '');
        setWebsiteUrl(data.website_url || '');
      }

      if (skillsRes.data.success) {
        setAvailableSkills(skillsRes.data.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const res = await studentApi.updateProfile({
        first_name: firstName,
        last_name: lastName,
        university,
        department,
        student_id: studentId,
        bio,
        experience_level: experienceLevel,
        education,
        github_url: githubUrl,
        linkedin_url: linkedinUrl,
        website_url: websiteUrl
      });

      if (res.data.success) {
        showToast('Profile updated successfully!', 'success');
        updateUser({ first_name: firstName, last_name: lastName });
        fetchProfile();
      }
    } catch (err: any) {
      showToast('Failed to save profile changes', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      showToast('Uploading profile photo...', 'info');
      const res = await uploadApi.uploadAvatar(formData);
      if (res.data.success) {
        showToast('Profile photo updated!', 'success');
        updateUser({ avatar_url: res.data.avatarUrl });
        fetchProfile();
      }
    } catch {
      showToast('Failed to upload image. Max 5MB allowed.', 'error');
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkillId && !customSkillName.trim()) {
      showToast('Please select or type a skill name', 'warning');
      return;
    }

    try {
      setIsAddingSkill(true);
      await studentApi.addSkill({
        skill_id: selectedSkillId ? parseInt(selectedSkillId, 10) : undefined,
        skill_name: customSkillName.trim() || undefined,
        proficiency: newSkillProficiency,
        years_of_experience: parseFloat(newSkillYears)
      });

      showToast('Skill added to profile!', 'success');
      setSelectedSkillId('');
      setCustomSkillName('');
      fetchProfile();
    } catch (err: any) {
      showToast('Failed to add skill', 'error');
    } finally {
      setIsAddingSkill(false);
    }
  };

  const handleRemoveSkill = async (skillId: number) => {
    try {
      await studentApi.removeSkill(skillId);
      showToast('Skill removed from profile', 'info');
      fetchProfile();
    } catch {
      showToast('Failed to remove skill', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Profile Header Banner */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="relative group">
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
              alt="Profile"
              className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
            />
            <label className="absolute -bottom-2 -right-2 p-2 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl shadow-lg cursor-pointer transition">
              <Camera className="w-3.5 h-3.5" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 className="text-xl lg:text-2xl font-bold text-slate-900">
                {firstName} {lastName}
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                Verified Student
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {university || 'University Student'} • {department || 'Computer Science'}
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-2 justify-center sm:justify-start">
              <span>ID: {studentId || 'STU-99214'}</span>
              <span>•</span>
              <span className="text-emerald-600 font-semibold">{profile?.profile_completed || 90}% Profile Strength</span>
            </div>
          </div>
        </div>

        {/* Client Rating Box */}
        <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center font-bold">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Reputation Score</span>
            <span className="text-base font-extrabold text-slate-900">
              {profile?.stats?.averageRating || '5.0'} / 5.0
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Info Form (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/80 shadow-sm flex flex-col gap-6">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Academic & Personal Details</h2>
            <span className="text-xs text-slate-400">Keep your details up to date for client trust</span>
          </div>

          <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                />
              </div>
            </div>

            {/* University & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">University / College</label>
                <input
                  type="text"
                  placeholder="e.g. Stanford University"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">Department / Major</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science & Software Engineering"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                />
              </div>
            </div>

            {/* Student ID & Experience Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">Student ID Card Number</label>
                <input
                  type="text"
                  placeholder="e.g. STU-99214"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">Experience Level</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                >
                  <option value="entry">Entry Level (Fresh / Beginners)</option>
                  <option value="intermediate">Intermediate (1-2 years experience)</option>
                  <option value="expert">Expert (3+ years experience)</option>
                </select>
              </div>
            </div>

            {/* Short Bio */}
            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1">Short Biography & Value Pitch</label>
              <textarea
                rows={3}
                placeholder="Write a compelling summary of your skills, achievements, and what services you offer to clients..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed resize-none"
              />
            </div>

            {/* Education Degree */}
            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1">Degree & Current Standing</label>
              <input
                type="text"
                placeholder="e.g. B.S. in Computer Science (Senior Year, GPA: 3.85)"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              />
            </div>

            {/* Social Links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">GitHub Profile</label>
                <div className="relative">
                  <Github className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">LinkedIn Profile</label>
                <div className="relative">
                  <Linkedin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">Portfolio / Website</label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="url"
                    placeholder="https://..."
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-semibold transition shadow-sm"
              >
                {isSaving ? 'Saving Changes...' : 'Save Profile Details'}
              </button>
            </div>
          </form>
        </div>

        {/* Skills Management Panel (1 Col) */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col gap-5">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Your Skills & Badges</h3>
                <span className="text-xs text-slate-400">Used for project matching</span>
              </div>
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </div>

            {/* Current Skills List */}
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
              {profile?.skills && profile.skills.length > 0 ? (
                profile.skills.map((s: any) => (
                  <div
                    key={s.skill_id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-900">{s.name}</span>
                      <span className="text-[10px] text-slate-400 capitalize">
                        {s.proficiency} • {s.years_of_experience} yrs
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveSkill(s.skill_id)}
                      className="p-1 text-slate-300 hover:text-rose-600 transition"
                      title="Remove skill"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">
                  No skills added yet. Add your technical or creative skills below!
                </div>
              )}
            </div>

            {/* Add Skill Form */}
            <form onSubmit={handleAddSkill} className="flex flex-col gap-3 pt-3 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-900">Add a New Skill</span>

              {/* Select or type */}
              <div>
                <select
                  value={selectedSkillId}
                  onChange={(e) => setSelectedSkillId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium mb-1.5"
                >
                  <option value="">-- Choose from standard skills --</option>
                  {availableSkills.map((sk) => (
                    <option key={sk.id} value={sk.id}>
                      {sk.name} ({sk.category})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Or enter a custom skill (e.g. Next.js, Rust)"
                  value={customSkillName}
                  onChange={(e) => setCustomSkillName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Proficiency and Years */}
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newSkillProficiency}
                  onChange={(e) => setNewSkillProficiency(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={newSkillYears}
                  onChange={(e) => setNewSkillYears(e.target.value)}
                  placeholder="Years"
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isAddingSkill}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddingSkill ? 'Adding...' : 'Add Skill'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
