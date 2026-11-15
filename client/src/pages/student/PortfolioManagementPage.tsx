import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  ExternalLink, 
  Github, 
  Edit3, 
  Trash2, 
  FolderKanban, 
  Image as ImageIcon,
  X,
  Upload
} from 'lucide-react';
import { studentApi, uploadApi } from '../../api/client';
import { PortfolioItem } from '../../types';
import { useToast } from '../../context/ToastContext';

export const PortfolioManagementPage: React.FC = () => {
  const { showToast } = useToast();
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPortfolio = async () => {
    try {
      setIsLoading(true);
      const res = await studentApi.getProfile();
      if (res.data.success) {
        setPortfolioItems(res.data.data.portfolio || []);
      }
    } catch {
      showToast('Failed to load portfolio items', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setTitle('');
    setDescription('');
    setProjectUrl('');
    setGithubUrl('');
    setImageUrl('https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80');
    setTechnologies('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: PortfolioItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description);
    setProjectUrl(item.project_url || '');
    setGithubUrl(item.github_url || '');
    setImageUrl(item.image_url || '');
    setTechnologies(item.technologies || '');
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);

    try {
      showToast('Uploading image...', 'info');
      const res = await uploadApi.uploadPortfolioImage(formData);
      if (res.data.success) {
        setImageUrl(res.data.imageUrl);
        showToast('Image uploaded successfully', 'success');
      }
    } catch {
      showToast('Failed to upload image', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Title is required', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingItem) {
        await studentApi.updatePortfolioItem(editingItem.id, {
          title: title.trim(),
          description: description.trim(),
          project_url: projectUrl.trim(),
          github_url: githubUrl.trim(),
          image_url: imageUrl.trim(),
          technologies: technologies.trim()
        });
        showToast('Portfolio item updated', 'success');
      } else {
        await studentApi.addPortfolioItem({
          title: title.trim(),
          description: description.trim(),
          project_url: projectUrl.trim(),
          github_url: githubUrl.trim(),
          image_url: imageUrl.trim(),
          technologies: technologies.trim()
        });
        showToast('Portfolio item published!', 'success');
      }
      setIsModalOpen(false);
      fetchPortfolio();
    } catch (err: any) {
      showToast('Failed to save portfolio item', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this portfolio item?')) return;
    try {
      await studentApi.deletePortfolioItem(id);
      showToast('Item deleted', 'info');
      fetchPortfolio();
    } catch {
      showToast('Failed to delete item', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-1">
            Work Showcase
          </span>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900">
            Student Portfolio Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Showcase your best academic projects, open-source work, and design mockups to prospective clients.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 transition shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Project</span>
        </button>
      </div>

      {/* Portfolio Items Grid */}
      {portfolioItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 border border-slate-200/80 shadow-sm text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <FolderKanban className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">No portfolio projects yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">
            Adding 2-3 portfolio items increases client response rates by up to 300%.
          </p>
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition"
          >
            Add Your First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                {/* Project Image */}
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80'}
                    alt={item.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-md rounded-xl p-1 shadow-sm">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
                      title="Edit project"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col gap-2.5">
                  <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                  {item.technologies && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.technologies.split(',').map((t, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/80 text-[10px] text-slate-600 font-medium"
                        >
                          {t.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Links */}
              <div className="p-5 pt-0 flex items-center gap-3">
                {item.project_url && (
                  <a
                    href={item.project_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                  >
                    <span>Live Demo</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {item.github_url && (
                  <a
                    href={item.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>Source Code</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 lg:p-8 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingItem ? 'Edit Portfolio Project' : 'Add New Portfolio Project'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI-Powered Course Recommendation System"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">Project Description</label>
                <textarea
                  rows={3}
                  placeholder="What problem does this project solve? What were your key responsibilities?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">Technologies Used (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="React, TypeScript, Tailwind CSS, PostgreSQL"
                  value={technologies}
                  onChange={(e) => setTechnologies(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Image URL or Upload */}
              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">Cover Screenshot Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer flex items-center gap-1 shrink-0 transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-900 block mb-1">Live Demo URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={projectUrl}
                    onChange={(e) => setProjectUrl(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-900 block mb-1">GitHub Repository</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-semibold transition"
                >
                  {isSubmitting ? 'Saving...' : 'Save Portfolio Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
