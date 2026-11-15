import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface FilterState {
  category: string;
  experienceLevel: string;
  projectType: string; // 'all' | 'hourly' | 'fixed'
  budgetRange: string;
  proposalRange: string;
}

interface FilterSidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onReset: () => void;
  categories: string[];
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  setFilters,
  onReset,
  categories
}) => {
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, category: e.target.value }));
  };

  const handleExperienceChange = (level: string) => {
    setFilters(prev => ({ ...prev, experienceLevel: level }));
  };

  const handleProjectTypeChange = (type: string) => {
    setFilters(prev => ({ ...prev, projectType: prev.projectType === type ? 'all' : type }));
  };

  const handleBudgetChange = (range: string) => {
    setFilters(prev => ({ ...prev, budgetRange: range }));
  };

  const handleProposalChange = (range: string) => {
    setFilters(prev => ({ ...prev, proposalRange: range }));
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col gap-6 w-full lg:w-72 shrink-0">
      {/* Title & Reset Button */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-900">Filters</h2>
        <button
          onClick={onReset}
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition"
        >
          Reset
        </button>
      </div>

      {/* Category Dropdown */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-900">Category</label>
        <div className="relative">
          <select
            value={filters.category}
            onChange={handleCategoryChange}
            className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3.5 py-2.5 pr-8 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">Select categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
        </div>
      </div>

      {/* Experience Level */}
      <div className="flex flex-col gap-2.5">
        <label className="text-xs font-semibold text-slate-900">Experience Level</label>
        <div className="flex flex-col gap-2">
          {[
            { id: 'all', label: 'Any', count: '2,450' },
            { id: 'entry', label: 'Entry Level', count: '550' },
            { id: 'intermediate', label: 'Intermediate', count: '350' },
            { id: 'expert', label: 'Expert', count: '250' }
          ].map((item) => (
            <label
              key={item.id}
              className="flex items-center justify-between text-xs text-slate-700 cursor-pointer select-none hover:text-slate-900"
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={filters.experienceLevel === item.id}
                  onChange={() => handleExperienceChange(item.id)}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="font-medium">{item.label}</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">{item.count}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Project Type Toggle (Hourly / Fixed Price) */}
      <div className="flex flex-col gap-2.5">
        <label className="text-xs font-semibold text-slate-900">Project Type</label>
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => handleProjectTypeChange('hourly')}
            className={`py-2 text-xs font-medium rounded-lg transition ${
              filters.projectType === 'hourly'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hourly
          </button>
          <button
            type="button"
            onClick={() => handleProjectTypeChange('fixed')}
            className={`py-2 text-xs font-medium rounded-lg transition ${
              filters.projectType === 'fixed'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Fixed Price
          </button>
        </div>

        {/* Budget ranges */}
        <div className="flex flex-col gap-2 mt-2">
          {[
            { id: 'all', label: 'Any', count: '465' },
            { id: 'under_100', label: 'Less than $100', count: '218' },
            { id: '100_500', label: '$100 to $500', count: '193' },
            { id: '500_1k', label: '$500 to $1K', count: '28' },
            { id: '1k_5k', label: '$1K to $5K', count: '20' },
            { id: '5k_plus', label: '$5K+', count: '8' }
          ].map((item) => (
            <label
              key={item.id}
              className="flex items-center justify-between text-xs text-slate-700 cursor-pointer select-none hover:text-slate-900"
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={filters.budgetRange === item.id}
                  onChange={() => handleBudgetChange(item.id)}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="font-medium">{item.label}</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">{item.count}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Number of Proposals */}
      <div className="flex flex-col gap-2.5">
        <label className="text-xs font-semibold text-slate-900">Number of Proposals</label>
        <div className="flex flex-col gap-2">
          {[
            { id: 'all', label: 'Any', count: '24' },
            { id: 'less_5', label: 'Less than 5', count: '1' },
            { id: '5_10', label: '5 to 10', count: '8' },
            { id: '10_15', label: '10 to 15', count: '9' },
            { id: '15_20', label: '15 to 20', count: '7' }
          ].map((item) => (
            <label
              key={item.id}
              className="flex items-center justify-between text-xs text-slate-700 cursor-pointer select-none hover:text-slate-900"
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={filters.proposalRange === item.id}
                  onChange={() => handleProposalChange(item.id)}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="font-medium">{item.label}</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">{item.count}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
