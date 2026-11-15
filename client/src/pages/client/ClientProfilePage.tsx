import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Globe, 
  Phone, 
  CheckCircle, 
  Star, 
  ShieldCheck,
  Save
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { clientApi } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export const ClientProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  // Form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await clientApi.getProfile();
      if (res.data.success) {
        const d = res.data.data;
        setProfile(d);
        setFirstName(d.first_name || '');
        setLastName(d.last_name || '');
        setCompanyName(d.company_name || '');
        setIndustry(d.industry || '');
        setCompanySize(d.company_size || '');
        setWebsiteUrl(d.website_url || '');
        setBio(d.bio || '');
        setLocation(d.location || '');
        setPhone(d.phone || '');
      }
    } catch {
      showToast('Failed to load company profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const res = await clientApi.updateProfile({
        first_name: firstName,
        last_name: lastName,
        company_name: companyName,
        industry,
        company_size: companySize,
        website_url: websiteUrl,
        bio,
        location,
        phone
      });

      if (res.data.success) {
        showToast('Company profile updated successfully!', 'success');
        updateUser({ first_name: firstName, last_name: lastName });
        fetchProfile();
      }
    } catch {
      showToast('Failed to save profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Banner */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-md">
            {companyName ? companyName.charAt(0) : 'C'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl lg:text-2xl font-bold text-slate-900">
                {companyName || `${firstName}'s Company`}
              </h1>
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[11px] font-bold border border-sky-200">
                <CheckCircle className="w-3.5 h-3.5 fill-sky-600 text-white" />
                Verified Client
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {location || 'Remote'} • {industry || 'Agency / Business'}
            </p>
          </div>
        </div>

        {/* Rating Score */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3 shrink-0">
          <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
          <div>
            <span className="text-xs text-slate-400 block font-medium">Student Feedback Rating</span>
            <span className="text-lg font-bold text-slate-900">
              {profile?.rating ? `${profile.rating} / 5.0` : '5.0 / 5.0'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/80 shadow-sm flex flex-col gap-5">
          <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Company & Contact Information
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">Contact First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">Contact Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">Company / Organization Name</label>
                <input
                  type="text"
                  placeholder="e.g. HAV Solutions GmbH"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">Industry</label>
                <input
                  type="text"
                  placeholder="e.g. Design & Software Agency"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">Company Size</label>
                <input
                  type="text"
                  placeholder="e.g. 10-50 employees"
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">Location / Country</label>
                <input
                  type="text"
                  placeholder="e.g. Germany"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+49 30 123456"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1">Official Website</label>
              <input
                type="url"
                placeholder="https://..."
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1">About the Company / Mission</label>
              <textarea
                rows={3}
                placeholder="Describe your organization, values, and why students enjoy working with you..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed resize-none"
              />
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Company Details'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Reviews Received from Students (1 Col) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col gap-4">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Student Reviews ({profile?.reviews?.length || 0})
          </h3>

          <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
            {profile?.reviews && profile.reviews.length > 0 ? (
              profile.reviews.map((rev: any) => (
                <div key={rev.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{rev.reviewer_name}</span>
                    <div className="flex items-center text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    For project: {rev.project_title}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                No reviews received from students yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
