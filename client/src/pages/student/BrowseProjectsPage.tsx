import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, 
  List, 
  ChevronDown, 
  Loader2, 
  SearchX, 
  RotateCcw 
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { FilterSidebar, FilterState } from '../../components/projects/FilterSidebar';
import { ProjectCard } from '../../components/projects/ProjectCard';
import { ProjectDetailModal } from '../../components/projects/ProjectDetailModal';
import { ApplyModal } from '../../components/projects/ApplyModal';
import { Project } from '../../types';
import { projectApi, skillApi } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface BrowseProjectsPageProps {
  toggleMobileMenu?: () => void;
}

export const BrowseProjectsPage: React.FC<BrowseProjectsPageProps> = ({ toggleMobileMenu }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState('');
  const [isGridView, setIsGridView] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const initialFilters: FilterState = {
    category: 'all',
    experienceLevel: 'all',
    projectType: 'all',
    budgetRange: 'all',
    proposalRange: 'all'
  };

  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [categories, setCategories] = useState<string[]>([
    'Web & App Design',
    'Web Development',
    'Software & Tech',
    'Mobile Development',
    'Graphic Design',
    'Writing & Content',
    'AI & Machine Learning'
  ]);

  // Data & State
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Fetch Projects with all parameters
  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        sort: sortBy,
        status: 'open'
      };

      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (locationTerm.trim()) params.location = locationTerm.trim();
      if (filters.category !== 'all') params.category = filters.category;
      if (filters.experienceLevel !== 'all') params.experience = filters.experienceLevel;
      if (filters.projectType !== 'all') params.budgetType = filters.projectType;

      // Budget ranges
      if (filters.budgetRange === 'under_100') {
        params.maxBudget = 100;
      } else if (filters.budgetRange === '100_500') {
        params.minBudget = 100;
        params.maxBudget = 500;
      } else if (filters.budgetRange === '500_1k') {
        params.minBudget = 500;
        params.maxBudget = 1000;
      } else if (filters.budgetRange === '1k_5k') {
        params.minBudget = 1000;
        params.maxBudget = 5000;
      } else if (filters.budgetRange === '5k_plus') {
        params.minBudget = 5000;
      }

      const res = await projectApi.getAll(params);
      if (res.data.success) {
        setProjects(res.data.data);
        setTotalCount(res.data.pagination.total);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      showToast('Failed to load projects. Ensure backend server is running.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [filters, sortBy]);

  const handleSearchSubmit = () => {
    fetchProjects();
  };

  const handleSearchClear = () => {
    setSearchTerm('');
    setLocationTerm('');
    setTimeout(fetchProjects, 50);
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
    setSearchTerm('');
    setLocationTerm('');
    showToast('Filters reset to default', 'info');
  };

  const handleOpenDetail = (project: Project) => {
    setSelectedProject(project);
    setIsDetailModalOpen(true);
  };

  const handleOpenApply = (project: Project) => {
    if (!user) {
      showToast('Please log in as a student to submit a proposal', 'info');
      return;
    }
    if (user.role !== 'student') {
      showToast('Only student accounts can apply for projects', 'warning');
      return;
    }
    setSelectedProject(project);
    setIsApplyModalOpen(true);
  };

  return (
    <div className="w-full flex flex-col">
      {/* Top Search & Filter Bar */}
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        locationTerm={locationTerm}
        setLocationTerm={setLocationTerm}
        onSearch={handleSearchSubmit}
        onClear={handleSearchClear}
        toggleMobileMenu={toggleMobileMenu}
        toggleFilterDrawer={() => setFilterDrawerOpen(!filterDrawerOpen)}
      />

      {/* Main Browse Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Filter Sidebar (Desktop) */}
        <div className="hidden lg:block">
          <FilterSidebar
            filters={filters}
            setFilters={setFilters}
            onReset={handleResetFilters}
            categories={categories}
          />
        </div>

        {/* Mobile Filter Drawer */}
        {filterDrawerOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
            <div className="bg-white w-80 h-full p-4 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-slate-900">Filter Projects</span>
                <button
                  onClick={() => setFilterDrawerOpen(false)}
                  className="text-xs text-slate-500 font-semibold"
                >
                  Close
                </button>
              </div>
              <FilterSidebar
                filters={filters}
                setFilters={setFilters}
                onReset={handleResetFilters}
                categories={categories}
              />
            </div>
          </div>
        )}

        {/* Right Project Results Section */}
        <div className="flex-1 w-full flex flex-col gap-4">
          {/* Results Bar (Showing Results, Sort by, View Toggles) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">Showing Results</h2>
              <span className="text-sm font-semibold text-slate-400">
                ({totalCount.toLocaleString()})
              </span>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              {/* Sort By Dropdown */}
              <div className="relative flex items-center">
                <span className="text-xs text-slate-500 mr-2 font-medium">Sort by:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-slate-200/90 text-slate-800 text-xs font-semibold rounded-xl px-3 py-1.5 pr-7 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-xs"
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="budget_desc">Highest Budget</option>
                    <option value="budget_asc">Lowest Budget</option>
                    <option value="proposals_desc">Most Proposals</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2 pointer-events-none" />
                </div>
              </div>

              {/* Grid / List View Toggles */}
              <div className="flex items-center bg-white border border-slate-200/90 rounded-xl p-1 shadow-xs">
                <button
                  onClick={() => setIsGridView(false)}
                  className={`p-1.5 rounded-lg transition ${
                    !isGridView ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsGridView(true)}
                  className={`p-1.5 rounded-lg transition ${
                    isGridView ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Grid view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Cards Area */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-200/80 shadow-sm">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
              <p className="text-sm font-semibold text-slate-700">Loading newest opportunities...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-sm text-center px-4">
              <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mb-3 text-slate-400">
                <SearchX className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">No matching projects found</h3>
              <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">
                Try expanding your filters or search for broader keywords like "Web", "Design", or "Python".
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : (
            <div className={
              isGridView
                ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                : "flex flex-col gap-3"
            }>
              {projects.map((proj) => (
                <ProjectCard
                  key={proj.id}
                  project={proj}
                  onViewDetails={handleOpenDetail}
                  onApply={handleOpenApply}
                  isGridView={isGridView}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ProjectDetailModal
        project={selectedProject}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onApply={handleOpenApply}
        isStudent={user?.role === 'student'}
      />

      <ApplyModal
        project={selectedProject}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={() => {
          fetchProjects();
        }}
      />
    </div>
  );
};
