import React from 'react';

interface CategoryFilterProps {
  /**
   * Categories coming from backend API (e.g. /api/v1/content/categories)
   */
  categories: string[];

  activeCategory: string;

  onSelect: (category: string) => void;
}

export function CategoryFilter({
  categories,
  activeCategory,
  onSelect
}: CategoryFilterProps) {

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-8">

      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          className={`
            px-4 py-2 rounded-full text-sm font-medium transition-all duration-200

            ${activeCategory === category
              ? 'bg-teal-600 text-white shadow-md scale-105'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-teal-200'
            }
          `}
        >
          {category}
        </button>
      ))}

    </div>
  );
}