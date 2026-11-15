import React from 'react';
import { Search, MapPin, X, Menu, SlidersHorizontal } from 'lucide-react';

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  locationTerm: string;
  setLocationTerm: (val: string) => void;
  onSearch: () => void;
  onClear: () => void;
  toggleMobileMenu?: () => void;
  toggleFilterDrawer?: () => void;
  heading?: string;
  subtitle?: string;
  showSearchBar?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  searchTerm,
  setSearchTerm,
  locationTerm,
  setLocationTerm,
  onSearch,
  onClear,
  toggleMobileMenu,
  toggleFilterDrawer,
  heading = "Find Millions of Projects Here!",
  subtitle = "Explore our newest project opportunities and apply for the top positions available today.",
  showSearchBar = true
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/80 shadow-sm mb-6">
      {/* Top Mobile Controls */}
      <div className="flex items-center justify-between lg:hidden mb-4 pb-3 border-b border-slate-100">
        <button
          onClick={toggleMobileMenu}
          className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-base font-bold text-slate-900">SkillBridge</span>
        {toggleFilterDrawer && (
          <button
            onClick={toggleFilterDrawer}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Heading & Subtitle */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mb-1.5">
          {heading}
        </h1>
        <p className="text-sm text-slate-500 leading-normal">
          {subtitle}
        </p>
      </div>

      {/* Search Input Bar (Exact look & feel from reference image) */}
      {showSearchBar && (
        <div className="flex flex-col md:flex-row items-center gap-2 p-1.5 bg-slate-50 border border-slate-200/90 rounded-2xl">
          {/* Main Keyword Input */}
          <div className="relative flex-1 w-full flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Web Design, Python, React, Mobile..."
              className="w-full pl-11 pr-9 py-3 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            {searchTerm && (
              <button
                onClick={onClear}
                className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-7 bg-slate-200"></div>

          {/* Location or University Input */}
          <div className="relative flex-1 w-full flex items-center">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={locationTerm}
              onChange={(e) => setLocationTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="City, country, or university"
              className="w-full pl-11 pr-4 py-3 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>

          {/* Find Projects Button */}
          <button
            onClick={onSearch}
            className="w-full md:w-auto px-7 py-3 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-sm font-semibold transition shrink-0 shadow-sm"
          >
            Find Projects
          </button>
        </div>
      )}
    </div>
  );
};
