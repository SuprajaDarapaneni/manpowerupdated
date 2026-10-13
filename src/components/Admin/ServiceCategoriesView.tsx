import React, { useState } from 'react';
import { Plus, Edit2, Check, X, Shield, Utensils, Package, Sparkles, Users, Hammer, Truck } from 'lucide-react';
import { ServiceCategory } from '../../types';
import { dataService } from '../../services/storage';

interface ServiceCategoriesViewProps {
  categories: ServiceCategory[];
}

export const ServiceCategoriesView: React.FC<ServiceCategoriesViewProps> = ({ categories }) => {
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState<Partial<ServiceCategory>>({
    name: '',
    description: '',
    minPrice: 500,
    maxPrice: 3000,
    hourlyRate: 200,
    fullDayRate: 1800,
    halfDayRate: 950,
    overtimeMultiplier: 1.5,
    requiredSkills: [],
    isActive: true,
  });

  const [skillInput, setSkillInput] = useState('');

  const handleEditClick = (cat: ServiceCategory) => {
    setEditingCategory(cat);
    setFormData(cat);
    setIsCreating(false);
  };

  const handleCreateClick = () => {
    setIsCreating(true);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      minPrice: 500,
      maxPrice: 3000,
      hourlyRate: 200,
      fullDayRate: 1800,
      halfDayRate: 950,
      overtimeMultiplier: 1.5,
      requiredSkills: ['General Manpower', 'Punctuality'],
      isActive: true,
      icon: 'Package',
    });
  };

  const handleToggleActive = (cat: ServiceCategory) => {
    dataService.updateCategory({
      ...cat,
      isActive: !cat.isActive,
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingCategory) {
      dataService.updateCategory({
        ...editingCategory,
        ...(formData as ServiceCategory),
      });
    } else if (isCreating) {
      dataService.addCategory({
        name: formData.name!,
        slug: formData.name!.toLowerCase().replace(/\s+/g, '-'),
        description: formData.description || 'Professional manpower services.',
        icon: formData.icon || 'Package',
        isActive: formData.isActive ?? true,
        minPrice: Number(formData.minPrice) || 500,
        maxPrice: Number(formData.maxPrice) || 3000,
        hourlyRate: Number(formData.hourlyRate) || 200,
        fullDayRate: Number(formData.fullDayRate) || 1800,
        halfDayRate: Number(formData.halfDayRate) || 950,
        overtimeMultiplier: Number(formData.overtimeMultiplier) || 1.5,
        requiredSkills: formData.requiredSkills || ['General Support'],
        dynamicFields: formData.dynamicFields,
      });
    }

    setEditingCategory(null);
    setIsCreating(false);
  };

  const handleAddSkill = () => {
    if (!skillInput.trim()) return;
    const current = formData.requiredSkills || [];
    setFormData({
      ...formData,
      requiredSkills: [...current, skillInput.trim()],
    });
    setSkillInput('');
  };

  const handleRemoveSkill = (skill: string) => {
    const current = formData.requiredSkills || [];
    setFormData({
      ...formData,
      requiredSkills: current.filter((s) => s !== skill),
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#202124]/10 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#202124]">Service Categories Management</h1>
          <p className="text-xs text-[#686868] mt-1">
            Configure hourly & daily rates, minimum job pricing floors, required worker skills, and dynamic food/tiffin questions.
          </p>
        </div>
        <button
          onClick={handleCreateClick}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#D71920] hover:bg-[#A80F18] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Grid / Table */}
      <div className="bg-white rounded-2xl border border-[#202124]/10 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#202124]/10 bg-[#FFFDF8] flex items-center justify-between">
          <span className="text-xs font-bold text-[#202124] uppercase tracking-wider">
            All Service Verticals ({categories.length})
          </span>
          <span className="text-[11px] text-[#686868]">
            Rates validated on backend API v1
          </span>
        </div>

        <div className="divide-y divide-[#202124]/5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FFFDF8] transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#FFFDF8] border border-[#202124]/10 flex items-center justify-center text-[#D71920] shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#202124]">{cat.name}</h3>
                    {cat.dynamicFields?.isFoodTiffin && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#FFC928]/30 text-[#A80F18] rounded-md">
                        Dynamic Tiffin / Meal Rules
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#686868] mt-0.5 max-w-xl">{cat.description}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[#202124]">
                    <span className="font-semibold text-[#D71920]">
                      Min: ₹{cat.minPrice}
                    </span>
                    <span className="text-[#686868]">·</span>
                    <span>Full Day: ₹{cat.fullDayRate}</span>
                    <span className="text-[#686868]">·</span>
                    <span>Half Day: ₹{cat.halfDayRate}</span>
                    <span className="text-[#686868]">·</span>
                    <span>Hourly: ₹{cat.hourlyRate}/hr</span>
                    <span className="text-[#686868]">·</span>
                    <span>OT: {cat.overtimeMultiplier}x</span>
                  </div>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {cat.requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 text-[10px] bg-slate-100 text-[#202124] rounded border border-slate-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions & Switch */}
              <div className="flex items-center gap-4 self-end md:self-center shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#686868]">
                    {cat.isActive ? 'Active' : 'Disabled'}
                  </span>
                  <button
                    onClick={() => handleToggleActive(cat)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      cat.isActive ? 'bg-[#16834A]' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        cat.isActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <button
                  onClick={() => handleEditClick(cat)}
                  className="p-2 text-[#686868] hover:text-[#D71920] hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Edit Category Pricing & Rules"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit / Create Category Modal */}
      {(editingCategory || isCreating) && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-[#202124]/10">
            <div className="flex items-center justify-between pb-4 border-b border-[#202124]/10">
              <h2 className="text-base font-bold text-[#202124]">
                {editingCategory ? `Edit: ${editingCategory.name}` : 'Create New Service Category'}
              </h2>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setIsCreating(false);
                }}
                className="p-1 text-[#686868] hover:text-[#202124] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Loading & Unloading"
                  className="w-full px-3 py-2 text-sm bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Briefly describe what manpower roles fall into this vertical..."
                  className="w-full px-3 py-2 text-sm bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                />
              </div>

              {/* Pricing Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#202124] mb-1">
                    Minimum Rate (₹ Floor)
                  </label>
                  <input
                    type="number"
                    value={formData.minPrice || 500}
                    onChange={(e) => setFormData({ ...formData, minPrice: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-sm bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202124] mb-1">
                    Full Day Rate (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.fullDayRate || 1800}
                    onChange={(e) => setFormData({ ...formData, fullDayRate: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-sm bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202124] mb-1">
                    Half Day Rate (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.halfDayRate || 950}
                    onChange={(e) => setFormData({ ...formData, halfDayRate: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-sm bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202124] mb-1">
                    Hourly Rate (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.hourlyRate || 200}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-sm bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202124] mb-1">
                    Overtime Multiplier
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.overtimeMultiplier || 1.5}
                    onChange={(e) => setFormData({ ...formData, overtimeMultiplier: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-sm bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                  />
                </div>
              </div>

              {/* Skills Tags Input */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  Required Worker Skills
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Add skill (e.g. Heavy Lifting 30kg+)..."
                    className="flex-1 px-3 py-1.5 text-sm bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3 py-1.5 bg-[#FFC928] hover:bg-[#E5A900] text-[#202124] text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(formData.requiredSkills || []).map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-slate-100 text-[#202124] rounded-md border border-slate-200"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-red-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Dynamic Food/Tiffin Service Options Toggle */}
              <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2 mt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.dynamicFields?.isFoodTiffin ?? false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dynamicFields: {
                          ...formData.dynamicFields,
                          isFoodTiffin: e.target.checked,
                          morningTiffin: true,
                          lunch: true,
                          eveningTea: true,
                          peopleCountPrompt: true,
                        },
                      })
                    }
                    className="rounded text-[#D71920] focus:ring-[#D71920]"
                  />
                  <span className="text-xs font-bold text-[#202124]">
                    Enable Dynamic Food / Tiffin / Catering Fields
                  </span>
                </label>
                <p className="text-[11px] text-[#686868]">
                  When enabled, customer booking screens will automatically render Morning Tiffin, Lunch, Evening Tea, and People Count questions.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#202124]/10">
                <button
                  type="button"
                  onClick={() => {
                    setEditingCategory(null);
                    setIsCreating(false);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-[#686868] hover:text-[#202124] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D71920] hover:bg-[#A80F18] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  Save Category Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
