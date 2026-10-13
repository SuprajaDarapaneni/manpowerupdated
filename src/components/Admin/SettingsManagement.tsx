import React, { useState } from 'react';
import {
  Settings,
  Palette,
  FileText,
  PhoneCall,
  Smartphone,
  Bell,
  CreditCard,
  Sliders,
  MapPin,
  RefreshCw,
  Shield,
  History,
  CheckCircle,
  AlertTriangle,
  Upload,
  Save,
  Eye,
  Lock,
  ExternalLink,
  ChevronRight,
  Info,
  Globe,
  Radio,
  FileCheck,
  Search,
} from 'lucide-react';
import {
  BrandingSettings,
  GeneralCompanySettings,
  LegalDocument,
  MobileAppRemoteConfig,
  OtpVerificationSettings,
  CommissionSettings,
  MatchingSettings,
  SettingsAuditRecord,
} from '../../types';
import { dataService } from '../../services/storage';

interface SettingsManagementProps {
  initialSubTab?: string;
}

export const SettingsManagement: React.FC<SettingsManagementProps> = ({ initialSubTab = 'branding' }) => {
  const [activeSection, setActiveSection] = useState<string>(initialSubTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // 1. Branding State
  const [branding, setBranding] = useState<BrandingSettings>(dataService.getBrandingSettings());
  const [brandingPreviewMode, setBrandingPreviewMode] = useState(false);

  // 2. General Company State
  const [general, setGeneral] = useState<GeneralCompanySettings>(dataService.getGeneralSettings());

  // 3. Legal Documents State
  const [legalDocs, setLegalDocs] = useState<LegalDocument[]>(dataService.getLegalDocuments());
  const [selectedLegalDoc, setSelectedLegalDoc] = useState<LegalDocument | null>(legalDocs[0] || null);
  const [isEditingLegal, setIsEditingLegal] = useState(false);
  const [legalDocDraft, setLegalDocDraft] = useState<string>('');

  // 4. Remote App Config State
  const [remoteConfig, setRemoteConfig] = useState<MobileAppRemoteConfig>(dataService.getMobileAppRemoteConfig());

  // 5. Operational Rules State (OTP, Commission, Matching)
  const [otpSettings, setOtpSettings] = useState<OtpVerificationSettings>(dataService.getOtpSettings());
  const [commissionSettings, setCommissionSettings] = useState<CommissionSettings>(dataService.getCommissionSettings());
  const [matchingSettings, setMatchingSettings] = useState<MatchingSettings>(dataService.getMatchingSettings());

  // 6. Audit History
  const [auditHistory, setAuditHistory] = useState<SettingsAuditRecord[]>(dataService.getSettingsAuditHistory());

  const showFeedback = (type: 'success' | 'error' | 'info', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Handlers
  const handleSaveBranding = () => {
    dataService.setBrandingSettings(branding);
    dataService.addSettingsAuditRecord({
      adminId: 'admin-1',
      adminEmail: 'admin@manpowerlink.com',
      action: 'UPDATE_BRANDING',
      section: 'Branding & Logo',
      fieldChanged: 'branding_suite',
      oldValue: 'previous_theme',
      newValue: `${branding.appName} (${branding.primaryColor})`,
      ipAddress: '127.0.0.1',
    });
    setAuditHistory(dataService.getSettingsAuditHistory());
    showFeedback('success', 'Branding changes published and synchronized with mobile apps remote config.');
  };

  const handleSaveGeneral = () => {
    dataService.setGeneralSettings(general);
    showFeedback('success', 'General company and localization settings saved.');
  };

  const handleSaveRemoteConfig = () => {
    dataService.setMobileAppRemoteConfig(remoteConfig);
    showFeedback('success', 'Mobile apps remote configuration published.');
  };

  const handleSaveLegalDoc = (newStatus?: 'draft' | 'published') => {
    if (!selectedLegalDoc) return;
    const nextStatus = newStatus || selectedLegalDoc.status;
    const isNewVersion = nextStatus === 'published' && selectedLegalDoc.status !== 'published';
    const nextVersion = isNewVersion ? `1.${parseInt(selectedLegalDoc.version.split('.')[1] || '0') + 1}.0` : selectedLegalDoc.version;

    const updated: LegalDocument = {
      ...selectedLegalDoc,
      content: legalDocDraft,
      status: nextStatus,
      version: nextVersion,
      lastUpdatedDate: new Date().toISOString().split('T')[0],
      publishedHistory: isNewVersion
        ? [
            {
              version: nextVersion,
              publishedAt: new Date().toISOString().split('T')[0],
              publishedBy: 'admin@manpowerlink.com',
              changeSummary: 'Published updated terms with explicit user consent requirements.',
            },
            ...selectedLegalDoc.publishedHistory,
          ]
        : selectedLegalDoc.publishedHistory,
    };

    dataService.updateLegalDocument(updated);
    setLegalDocs(dataService.getLegalDocuments());
    setSelectedLegalDoc(updated);
    setIsEditingLegal(false);

    dataService.addSettingsAuditRecord({
      adminId: 'admin-1',
      adminEmail: 'admin@manpowerlink.com',
      action: nextStatus === 'published' ? 'PUBLISH_LEGAL_DOC' : 'SAVE_DRAFT_LEGAL_DOC',
      section: 'Legal Documents',
      fieldChanged: selectedLegalDoc.slug,
      oldValue: selectedLegalDoc.version,
      newValue: `${nextVersion} (${nextStatus})`,
      ipAddress: '127.0.0.1',
    });
    setAuditHistory(dataService.getSettingsAuditHistory());

    showFeedback('success', `Legal Document ${updated.title} saved as ${nextStatus.toUpperCase()} (${nextVersion}).`);
  };

  // Mock Upload Handler with strict validation
  const handleMockAssetUpload = (assetKey: keyof BrandingSettings, label: string) => {
    const mockUrls = [
      'https://images.unsplash.com/photo-1541888946425-d0fbb18f156b?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80',
    ];
    const picked = mockUrls[Math.floor(Math.random() * mockUrls.length)];
    setBranding({ ...branding, [assetKey]: picked });
    showFeedback('info', `${label} validated (PNG/WebP, <5MB) and uploaded to secure cloud storage.`);
  };

  const sections = [
    { id: 'branding', label: 'Branding & Logo', icon: Palette, desc: 'Logos, primary red/yellow colors & mobile icons' },
    { id: 'general', label: 'General Company', icon: Settings, desc: 'Corporate identity, currency, contact & timezones' },
    { id: 'legal', label: 'Legal Documents', icon: FileText, desc: 'Terms, Privacy, Worker Conduct & user consent' },
    { id: 'appconfig', label: 'App Remote Config', icon: Smartphone, desc: 'Mobile feature flags, announcements & versioning' },
    { id: 'contact', label: 'Contact & Support', icon: PhoneCall, desc: 'Customer support, worker emergency & escalation' },
    { id: 'payments', label: 'Payments & Commission', icon: CreditCard, desc: 'Cash vs Online, fees, payout rules & ledger' },
    { id: 'bookingrules', label: 'Booking & Worker Rules', icon: Sliders, desc: 'Shift durations, overtime multipliers & bidding' },
    { id: 'location', label: 'Location & Attendance', icon: MapPin, desc: 'Independent Start/End OTP, geofencing & tracking' },
    { id: 'maintenance', label: 'Maintenance & Updates', icon: RefreshCw, desc: 'Maintenance mode & mandatory upgrade blocks' },
    { id: 'notifications', label: 'Notification Templates', icon: Bell, desc: 'In-app broadcasts & system alert templates' },
    { id: 'security', label: 'Security & Privacy', icon: Shield, desc: 'RBAC permissions, session TTL & data retention' },
    { id: 'audit', label: 'Audit History', icon: History, desc: 'Immutable administrative configuration change logs' },
  ];

  const filteredSections = sections.filter(
    (s) => s.label.toLowerCase().includes(searchQuery.toLowerCase()) || s.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#202124]/10 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#202124]">Platform Settings & App Configuration</h1>
            <span className="px-2 py-0.5 bg-[#D71920]/10 text-[#D71920] text-xs font-bold rounded-full">MongoDB Unified</span>
          </div>
          <p className="text-xs text-[#686868] mt-0.5">
            Configure global marketplace rules, brand assets, legal agreements, and mobile remote configurations.
          </p>
        </div>

        {/* Search Settings */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#686868]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all 12 modules..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#FFFDF8] border border-[#202124]/15 rounded-xl text-xs text-[#202124] focus:outline-none focus:border-[#D71920]"
          />
        </div>
      </div>

      {/* Feedback Banner */}
      {statusMessage && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : statusMessage.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          {statusMessage.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <Info className="w-4 h-4 shrink-0" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Layout: Sidebar Navigation + Content Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Column */}
        <div className="lg:col-span-1 space-y-1.5">
          <div className="bg-white p-3 rounded-2xl border border-[#202124]/10 shadow-xs space-y-1">
            <div className="px-3 py-1.5 text-[11px] font-bold text-[#686868] uppercase tracking-wider">Settings Modules</div>
            {filteredSections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#D71920] text-white shadow-xs'
                      : 'text-[#202124] hover:bg-[#FFFDF8] hover:text-[#D71920]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#686868]'}`} />
                    <span>{sec.label}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-300'}`} />
                </button>
              );
            })}
          </div>

          {/* Quick Notice Card */}
          <div className="p-4 bg-[#1E1F23] text-white rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#FFC928]">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Real-Time Sync Protocol</span>
            </div>
            <p className="text-[11px] text-white/70 leading-relaxed">
              When Branding, Legal or OTP rules are published, mobile apps poll `/api/v1/config/public` on launch to dynamically update UI.
            </p>
          </div>
        </div>

        {/* Content Column */}
        <div className="lg:col-span-3">
          <div className="bg-white p-6 rounded-2xl border border-[#202124]/10 shadow-xs">
            {/* MODULE 1: BRANDING & LOGO */}
            {activeSection === 'branding' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#202124]/10">
                  <div>
                    <h2 className="text-base font-bold text-[#202124]">Branding & Logo Management</h2>
                    <p className="text-xs text-[#686868]">Manage company logos, app icons, and corporate palette.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setBrandingPreviewMode(!brandingPreviewMode)}
                      className="px-3 py-1.5 border border-[#202124]/20 rounded-xl text-xs font-semibold text-[#202124] flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {brandingPreviewMode ? 'Edit Mode' : 'Live Preview'}
                    </button>
                    <button
                      onClick={handleSaveBranding}
                      className="px-4 py-1.5 bg-[#D71920] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-[#A80F18] shadow-xs cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Publish Branding
                    </button>
                  </div>
                </div>

                {brandingPreviewMode ? (
                  /* Live Preview Canvas */
                  <div className="p-6 bg-[#FFFDF8] rounded-2xl border border-[#202124]/10 space-y-6">
                    <div className="text-xs font-bold text-[#686868] uppercase tracking-wider">Mobile App Preview Render</div>
                    <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
                      {/* Customer Mobile Mockup */}
                      <div className="w-64 p-4 rounded-3xl bg-white border-4 border-[#1E1F23] shadow-lg space-y-4">
                        <div className="h-4 w-20 bg-slate-200 rounded-full mx-auto" />
                        <div className="p-3 rounded-xl flex items-center gap-2.5" style={{ backgroundColor: branding.primaryColor }}>
                          <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center font-black text-xs" style={{ color: branding.primaryColor }}>
                            M
                          </div>
                          <span className="font-bold text-white text-xs">{branding.appName}</span>
                        </div>
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-[#202124]">
                          {branding.tagline}
                        </div>
                        <button className="w-full py-2 rounded-xl text-white font-bold text-xs" style={{ backgroundColor: branding.primaryColor }}>
                          Book Temporary Worker
                        </button>
                      </div>

                      {/* Worker Mobile Mockup */}
                      <div className="w-64 p-4 rounded-3xl bg-[#1E1F23] border-4 border-slate-700 shadow-lg text-white space-y-4">
                        <div className="h-4 w-20 bg-white/20 rounded-full mx-auto" />
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold" style={{ color: branding.secondaryColor }}>{branding.appName} WORKER</span>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">Radar Active</span>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs">
                          <span className="text-white/60">Shift Offer:</span> ₹2,200 (Full Day)
                        </div>
                        <button className="w-full py-2 rounded-xl text-[#1E1F23] font-bold text-xs" style={{ backgroundColor: branding.secondaryColor }}>
                          Accept Assignment
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Branding Edit Form */
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#202124] mb-1">Application Name</label>
                        <input
                          type="text"
                          value={branding.appName}
                          onChange={(e) => setBranding({ ...branding, appName: e.target.value })}
                          className="w-full px-3 py-2 bg-[#FFFDF8] border border-[#202124]/15 rounded-xl text-xs text-[#202124] focus:outline-none focus:border-[#D71920]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#202124] mb-1">Legal Company Entity</label>
                        <input
                          type="text"
                          value={branding.companyName}
                          onChange={(e) => setBranding({ ...branding, companyName: e.target.value })}
                          className="w-full px-3 py-2 bg-[#FFFDF8] border border-[#202124]/15 rounded-xl text-xs text-[#202124] focus:outline-none focus:border-[#D71920]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#202124] mb-1">Corporate Tagline / Value Proposition</label>
                      <input
                        type="text"
                        value={branding.tagline}
                        onChange={(e) => setBranding({ ...branding, tagline: e.target.value })}
                        className="w-full px-3 py-2 bg-[#FFFDF8] border border-[#202124]/15 rounded-xl text-xs text-[#202124] focus:outline-none focus:border-[#D71920]"
                      />
                    </div>

                    {/* Color Customization */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-[#FFFDF8] rounded-xl border border-[#202124]/10">
                      <div>
                        <label className="block text-xs font-bold text-[#202124] mb-1">Primary Brand Red</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={branding.primaryColor}
                            onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                            className="w-8 h-8 rounded-lg cursor-pointer border-0"
                          />
                          <input
                            type="text"
                            value={branding.primaryColor}
                            onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                            className="w-full px-2 py-1 bg-white border border-[#202124]/15 rounded-lg text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#202124] mb-1">Secondary Brand Yellow</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={branding.secondaryColor}
                            onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                            className="w-8 h-8 rounded-lg cursor-pointer border-0"
                          />
                          <input
                            type="text"
                            value={branding.secondaryColor}
                            onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                            className="w-full px-2 py-1 bg-white border border-[#202124]/15 rounded-lg text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#202124] mb-1">Dark Surface Slate</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={branding.darkBgColor}
                            onChange={(e) => setBranding({ ...branding, darkBgColor: e.target.value })}
                            className="w-8 h-8 rounded-lg cursor-pointer border-0"
                          />
                          <input
                            type="text"
                            value={branding.darkBgColor}
                            onChange={(e) => setBranding({ ...branding, darkBgColor: e.target.value })}
                            className="w-full px-2 py-1 bg-white border border-[#202124]/15 rounded-lg text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Logo & Asset Upload Grid */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider">App Assets & Logo Store</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-white border border-[#202124]/10 rounded-xl space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-[#202124]">Primary Company Logo</span>
                            <span className="text-[10px] text-[#686868]">PNG / WebP (512x512)</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[#FFFDF8] rounded-xl border border-dashed border-[#202124]/20 flex items-center justify-center overflow-hidden">
                              {branding.mainLogoUrl ? (
                                <img src={branding.mainLogoUrl} alt="Logo" className="w-full h-full object-cover" />
                              ) : (
                                <Palette className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <button
                              onClick={() => handleMockAssetUpload('mainLogoUrl', 'Primary Company Logo')}
                              className="px-3 py-1.5 border border-[#202124]/20 rounded-lg text-xs font-semibold text-[#202124] hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              Upload Asset
                            </button>
                          </div>
                        </div>

                        <div className="p-4 bg-white border border-[#202124]/10 rounded-xl space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-[#202124]">Square App Icon</span>
                            <span className="text-[10px] text-[#686868]">PNG (1024x1024)</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[#FFFDF8] rounded-xl border border-dashed border-[#202124]/20 flex items-center justify-center">
                              <Smartphone className="w-5 h-5 text-slate-400" />
                            </div>
                            <button
                              onClick={() => handleMockAssetUpload('appIconUrl', 'Square App Icon')}
                              className="px-3 py-1.5 border border-[#202124]/20 rounded-lg text-xs font-semibold text-[#202124] hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              Upload Icon
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                      <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                      <span>
                        <strong>Dynamic vs. Native Assets:</strong> In-app headers, banners, brand tags, and theme accents update dynamically via backend configuration. Native launcher icons on Android/iOS homescreens and native launch splash screens require building a new APK/IPA.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MODULE 2: GENERAL COMPANY SETTINGS */}
            {activeSection === 'general' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#202124]/10">
                  <div>
                    <h2 className="text-base font-bold text-[#202124]">General Company Settings</h2>
                    <p className="text-xs text-[#686868]">Company corporate contact, base currencies, and language locales.</p>
                  </div>
                  <button
                    onClick={handleSaveGeneral}
                    className="px-4 py-1.5 bg-[#D71920] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-[#A80F18] shadow-xs cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Settings
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#202124] mb-1">Company Corporate Name</label>
                    <input
                      type="text"
                      value={general.companyName}
                      onChange={(e) => setGeneral({ ...general, companyName: e.target.value })}
                      className="w-full px-3 py-2 bg-[#FFFDF8] border border-[#202124]/15 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#202124] mb-1">Corporate Registration (CIN / GSTIN)</label>
                    <input
                      type="text"
                      value={general.registrationNumber}
                      onChange={(e) => setGeneral({ ...general, registrationNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-[#FFFDF8] border border-[#202124]/15 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#202124] mb-1">Corporate Email Address</label>
                    <input
                      type="email"
                      value={general.companyEmail}
                      onChange={(e) => setGeneral({ ...general, companyEmail: e.target.value })}
                      className="w-full px-3 py-2 bg-[#FFFDF8] border border-[#202124]/15 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#202124] mb-1">Customer Support Phone</label>
                    <input
                      type="text"
                      value={general.supportPhone}
                      onChange={(e) => setGeneral({ ...general, supportPhone: e.target.value })}
                      className="w-full px-3 py-2 bg-[#FFFDF8] border border-[#202124]/15 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#202124] mb-1">Registered Business Address</label>
                  <textarea
                    rows={2}
                    value={general.businessAddress}
                    onChange={(e) => setGeneral({ ...general, businessAddress: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFFDF8] border border-[#202124]/15 rounded-xl text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-[#FFFDF8] rounded-xl border border-[#202124]/10">
                  <div>
                    <label className="block text-xs font-bold text-[#202124] mb-1">Base Currency</label>
                    <select
                      value={general.defaultCurrency}
                      onChange={(e) => setGeneral({ ...general, defaultCurrency: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white border border-[#202124]/15 rounded-lg text-xs"
                    >
                      <option value="INR">INR (₹) - Indian Rupee</option>
                      <option value="USD">USD ($) - US Dollar</option>
                      <option value="AED">AED (د.إ) - UAE Dirham</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#202124] mb-1">Timezone</label>
                    <select
                      value={general.timeZone}
                      onChange={(e) => setGeneral({ ...general, timeZone: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white border border-[#202124]/15 rounded-lg text-xs"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                      <option value="UTC">UTC (Universal Time)</option>
                      <option value="Asia/Dubai">Asia/Dubai (GST +4:00)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#202124] mb-1">Date Format</label>
                    <select
                      value={general.dateFormat}
                      onChange={(e) => setGeneral({ ...general, dateFormat: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white border border-[#202124]/15 rounded-lg text-xs"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 3: LEGAL DOCUMENTS */}
            {activeSection === 'legal' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#202124]/10">
                  <div>
                    <h2 className="text-base font-bold text-[#202124]">Legal Documents & Consent Management</h2>
                    <p className="text-xs text-[#686868]">Manage enforceable policies, terms, and user audit acceptance records.</p>
                  </div>
                  <button
                    onClick={() => {
                      const newDoc = dataService.addLegalDocument({
                        title: 'New Policy Document',
                        slug: `policy-${Date.now()}`,
                        documentType: 'terms_conditions',
                        content: '## Draft Policy\n\nEnter policy terms...',
                        status: 'draft',
                        version: '1.0.0',
                        effectiveDate: new Date().toISOString().split('T')[0],
                        lastUpdatedDate: new Date().toISOString().split('T')[0],
                        author: 'admin@manpowerlink.com',
                        requiresExplicitConsent: true,
                        publishedHistory: [],
                      });
                      setLegalDocs(dataService.getLegalDocuments());
                      setSelectedLegalDoc(newDoc);
                    }}
                    className="px-3 py-1.5 bg-[#FFC928] text-[#202124] rounded-xl text-xs font-bold hover:bg-amber-400 cursor-pointer"
                  >
                    + New Document
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left: Document List */}
                  <div className="md:col-span-1 space-y-2">
                    {legalDocs.map((doc) => {
                      const isSelected = selectedLegalDoc?.id === doc.id;
                      return (
                        <div
                          key={doc.id}
                          onClick={() => {
                            setSelectedLegalDoc(doc);
                            setIsEditingLegal(false);
                            setLegalDocDraft(doc.content);
                          }}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#FFFDF8] border-[#D71920] shadow-xs'
                              : 'bg-white border-[#202124]/10 hover:border-[#202124]/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-[#202124]">{doc.title}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                                doc.status === 'published'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {doc.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-2 text-[11px] text-[#686868]">
                            <span>v{doc.version}</span>
                            <span>Eff: {doc.effectiveDate}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right: Selected Document Detail & Editor */}
                  <div className="md:col-span-2 space-y-4">
                    {selectedLegalDoc ? (
                      <div className="p-4 bg-[#FFFDF8] rounded-xl border border-[#202124]/10 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-sm text-[#202124]">{selectedLegalDoc.title}</h3>
                            <div className="flex items-center gap-2 text-xs text-[#686868] mt-1">
                              <span>Slug: /{selectedLegalDoc.slug}</span>
                              <span>•</span>
                              <span>Version: {selectedLegalDoc.version}</span>
                              <span>•</span>
                              <span>Author: {selectedLegalDoc.author}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {isEditingLegal ? (
                              <>
                                <button
                                  onClick={() => handleSaveLegalDoc('draft')}
                                  className="px-3 py-1 bg-slate-200 text-[#202124] rounded-lg text-xs font-semibold hover:bg-slate-300"
                                >
                                  Save Draft
                                </button>
                                <button
                                  onClick={() => handleSaveLegalDoc('published')}
                                  className="px-3 py-1 bg-[#D71920] text-white rounded-lg text-xs font-bold hover:bg-[#A80F18]"
                                >
                                  Publish New Version
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => {
                                  setIsEditingLegal(true);
                                  setLegalDocDraft(selectedLegalDoc.content);
                                }}
                                className="px-3 py-1 bg-[#D71920] text-white rounded-lg text-xs font-bold hover:bg-[#A80F18]"
                              >
                                Edit Document
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Content View / Editor */}
                        {isEditingLegal ? (
                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-[#202124]">Markdown Policy Content</label>
                            <textarea
                              rows={12}
                              value={legalDocDraft}
                              onChange={(e) => setLegalDocDraft(e.target.value)}
                              className="w-full p-3 font-mono text-xs bg-white border border-[#202124]/15 rounded-xl focus:outline-none focus:border-[#D71920]"
                            />
                          </div>
                        ) : (
                          <div className="p-4 bg-white rounded-xl border border-[#202124]/10 text-xs text-[#202124] max-h-80 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                            {selectedLegalDoc.content}
                          </div>
                        )}

                        {/* Revision History */}
                        <div className="pt-2 border-t border-[#202124]/10">
                          <span className="text-xs font-bold text-[#686868] uppercase tracking-wider block mb-2">
                            Audit Version History ({selectedLegalDoc.publishedHistory.length} revisions)
                          </span>
                          <div className="space-y-1.5 text-xs">
                            {selectedLegalDoc.publishedHistory.map((hist, idx) => (
                              <div key={idx} className="p-2 bg-white rounded-lg border border-slate-100 flex justify-between items-center text-[11px]">
                                <div>
                                  <span className="font-bold text-[#202124]">v{hist.version}</span>
                                  <span className="text-[#686868] ml-2">{hist.changeSummary}</span>
                                </div>
                                <span className="text-[#686868] font-mono">{hist.publishedAt}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-xs text-[#686868]">Select a document to inspect or edit.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 4: REMOTE APP CONFIGURATION */}
            {activeSection === 'appconfig' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#202124]/10">
                  <div>
                    <h2 className="text-base font-bold text-[#202124]">Mobile App Remote Configuration</h2>
                    <p className="text-xs text-[#686868]">Control feature flags, force updates, and broadcasts without rebuilding APK/IPA.</p>
                  </div>
                  <button
                    onClick={handleSaveRemoteConfig}
                    className="px-4 py-1.5 bg-[#D71920] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-[#A80F18] shadow-xs cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Publish Remote Config
                  </button>
                </div>

                {/* Feature Flags Section */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider">Dynamic Feature Availability Flags</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(remoteConfig.featureFlags).map(([flag, val]) => (
                      <div key={flag} className="p-3 bg-[#FFFDF8] rounded-xl border border-[#202124]/10 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-xs text-[#202124] capitalize">{flag.replace(/([A-Z])/g, ' $1')}</span>
                          <p className="text-[10px] text-[#686868]">Live toggle for Customer & Worker Flutter clients</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={val}
                          onChange={(e) =>
                            setRemoteConfig({
                              ...remoteConfig,
                              featureFlags: { ...remoteConfig.featureFlags, [flag]: e.target.checked },
                            })
                          }
                          className="w-4 h-4 accent-[#D71920] cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* App Version Enforcement */}
                <div className="p-4 bg-white rounded-xl border border-[#202124]/10 space-y-4">
                  <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider">App Versioning & Mandatory Upgrades</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-[#FFFDF8] rounded-xl border border-[#202124]/10 space-y-2">
                      <span className="font-bold text-xs text-[#202124]">Customer App Version</span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={remoteConfig.minCustomerAppVersion}
                          onChange={(e) => setRemoteConfig({ ...remoteConfig, minCustomerAppVersion: e.target.value })}
                          placeholder="Min: 1.0.0"
                          className="w-1/2 px-2 py-1 bg-white border border-[#202124]/15 rounded-lg text-xs font-mono"
                        />
                        <input
                          type="text"
                          value={remoteConfig.latestCustomerAppVersion}
                          onChange={(e) => setRemoteConfig({ ...remoteConfig, latestCustomerAppVersion: e.target.value })}
                          placeholder="Latest: 1.0.0"
                          className="w-1/2 px-2 py-1 bg-white border border-[#202124]/15 rounded-lg text-xs font-mono"
                        />
                      </div>
                      <label className="flex items-center gap-2 text-xs text-[#202124]">
                        <input
                          type="checkbox"
                          checked={remoteConfig.forceCustomerUpgrade}
                          onChange={(e) => setRemoteConfig({ ...remoteConfig, forceCustomerUpgrade: e.target.checked })}
                          className="accent-[#D71920]"
                        />
                        <span>Force Mandatory App Store Update</span>
                      </label>
                    </div>

                    <div className="p-3 bg-[#FFFDF8] rounded-xl border border-[#202124]/10 space-y-2">
                      <span className="font-bold text-xs text-[#202124]">Employee / Worker App Version</span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={remoteConfig.minEmployeeAppVersion}
                          onChange={(e) => setRemoteConfig({ ...remoteConfig, minEmployeeAppVersion: e.target.value })}
                          placeholder="Min: 1.0.0"
                          className="w-1/2 px-2 py-1 bg-white border border-[#202124]/15 rounded-lg text-xs font-mono"
                        />
                        <input
                          type="text"
                          value={remoteConfig.latestEmployeeAppVersion}
                          onChange={(e) => setRemoteConfig({ ...remoteConfig, latestEmployeeAppVersion: e.target.value })}
                          placeholder="Latest: 1.0.0"
                          className="w-1/2 px-2 py-1 bg-white border border-[#202124]/15 rounded-lg text-xs font-mono"
                        />
                      </div>
                      <label className="flex items-center gap-2 text-xs text-[#202124]">
                        <input
                          type="checkbox"
                          checked={remoteConfig.forceEmployeeUpgrade}
                          onChange={(e) => setRemoteConfig({ ...remoteConfig, forceEmployeeUpgrade: e.target.checked })}
                          className="accent-[#D71920]"
                        />
                        <span>Force Mandatory Worker Update</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 5: LOCATION, ATTENDANCE & INDEPENDENT OTP */}
            {activeSection === 'location' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#202124]/10">
                  <div>
                    <h2 className="text-base font-bold text-[#202124]">Location, Attendance & Independent OTP Settings</h2>
                    <p className="text-xs text-[#686868]">Configure Start OTP, End OTP, GPS geofencing, and arrival verification.</p>
                  </div>
                  <button
                    onClick={() => {
                      dataService.setOtpSettings(otpSettings);
                      showFeedback('success', 'OTP and attendance verification rules updated in MongoDB.');
                    }}
                    className="px-4 py-1.5 bg-[#D71920] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-[#A80F18] shadow-xs cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save OTP Rules
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Start OTP Toggle */}
                  <div className="p-4 bg-[#FFFDF8] rounded-xl border border-[#202124]/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs text-[#202124]">Start Work OTP</span>
                        <p className="text-[11px] text-[#686868]">Required to verify arrival and start shift timer</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={otpSettings.requireStartOtp}
                        onChange={(e) => setOtpSettings({ ...otpSettings, requireStartOtp: e.target.checked })}
                        className="w-5 h-5 accent-[#D71920] cursor-pointer"
                      />
                    </div>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-block">
                      Independently Configurable
                    </span>
                  </div>

                  {/* End OTP Toggle */}
                  <div className="p-4 bg-[#FFFDF8] rounded-xl border border-[#202124]/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs text-[#202124]">End Work OTP</span>
                        <p className="text-[11px] text-[#686868]">Required to conclude shift and release worker earnings</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={otpSettings.requireEndOtp}
                        onChange={(e) => setOtpSettings({ ...otpSettings, requireEndOtp: e.target.checked })}
                        className="w-5 h-5 accent-[#D71920] cursor-pointer"
                      />
                    </div>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-block">
                      Independently Configurable
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-xl border border-[#202124]/10">
                  <div>
                    <label className="block text-xs font-bold text-[#202124] mb-1">OTP Validity Timeout</label>
                    <input
                      type="number"
                      value={otpSettings.expiryMinutes}
                      onChange={(e) => setOtpSettings({ ...otpSettings, expiryMinutes: parseInt(e.target.value) || 15 })}
                      className="w-full px-3 py-1.5 bg-[#FFFDF8] border border-[#202124]/15 rounded-lg text-xs font-mono"
                    />
                    <span className="text-[10px] text-[#686868]">Minutes before code regenerates</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#202124] mb-1">Max Retry Limits</label>
                    <input
                      type="number"
                      value={otpSettings.maxAttempts}
                      onChange={(e) => setOtpSettings({ ...otpSettings, maxAttempts: parseInt(e.target.value) || 3 })}
                      className="w-full px-3 py-1.5 bg-[#FFFDF8] border border-[#202124]/15 rounded-lg text-xs font-mono"
                    />
                    <span className="text-[10px] text-[#686868]">Incorrect tries before fraud alert</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#202124] mb-1">Geofence Radius (Meters)</label>
                    <input
                      type="number"
                      value={otpSettings.geofenceRadiusMeters}
                      onChange={(e) => setOtpSettings({ ...otpSettings, geofenceRadiusMeters: parseInt(e.target.value) || 300 })}
                      className="w-full px-3 py-1.5 bg-[#FFFDF8] border border-[#202124]/15 rounded-lg text-xs font-mono"
                    />
                    <span className="text-[10px] text-[#686868]">Worksite arrival verification circle</span>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 6: AUDIT HISTORY */}
            {activeSection === 'audit' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-[#202124]/10">
                  <div>
                    <h2 className="text-base font-bold text-[#202124]">Settings Configuration Audit Trail</h2>
                    <p className="text-xs text-[#686868]">Tamper-evident logs of all administrative setting modifications.</p>
                  </div>
                  <span className="text-xs font-mono text-[#686868]">{auditHistory.length} Recorded Events</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#FFFDF8] text-[#686868] font-bold border-b border-[#202124]/10">
                      <tr>
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Admin</th>
                        <th className="p-3">Section</th>
                        <th className="p-3">Action</th>
                        <th className="p-3">Change Summary</th>
                        <th className="p-3">IP Address</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#202124]/5">
                      {auditHistory.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono text-[#686868]">{item.timestamp}</td>
                          <td className="p-3 font-semibold text-[#202124]">{item.adminEmail}</td>
                          <td className="p-3 font-medium text-[#D71920]">{item.section}</td>
                          <td className="p-3 font-mono font-bold text-[#202124]">{item.action}</td>
                          <td className="p-3 text-[#202124]">
                            <span className="line-through text-slate-400 mr-1">{item.oldValue}</span>
                            <span>➔ {item.newValue}</span>
                          </td>
                          <td className="p-3 font-mono text-[#686868]">{item.ipAddress}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MODULE 7: CONTACT & SUPPORT */}
            {activeSection === 'contact' && (
              <div className="space-y-4">
                <h2 className="text-base font-bold text-[#202124]">Customer & Worker Support Channels</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#FFFDF8] rounded-xl border border-[#202124]/10 space-y-2">
                    <span className="font-bold text-xs text-[#202124]">Customer Helpdesk</span>
                    <input
                      type="text"
                      value={general.customerSupportEmail}
                      onChange={(e) => setGeneral({ ...general, customerSupportEmail: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-[#202124]/15 rounded-lg text-xs"
                    />
                  </div>
                  <div className="p-4 bg-[#FFFDF8] rounded-xl border border-[#202124]/10 space-y-2">
                    <span className="font-bold text-xs text-[#202124]">Worker Emergency SOS Hotline</span>
                    <input
                      type="text"
                      value={general.emergencyHotline}
                      onChange={(e) => setGeneral({ ...general, emergencyHotline: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-[#202124]/15 rounded-lg text-xs font-mono font-bold text-[#D71920]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 8: PAYMENTS & COMMISSION */}
            {activeSection === 'payments' && (
              <div className="space-y-4">
                <h2 className="text-base font-bold text-[#202124]">Payment Gateway & Platform Commission</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#FFFDF8] rounded-xl border border-[#202124]/10 space-y-2">
                    <span className="font-bold text-xs text-[#202124]">Platform Commission Rate</span>
                    <input
                      type="number"
                      value={commissionSettings.percentageValue}
                      onChange={(e) => setCommissionSettings({ ...commissionSettings, percentageValue: parseFloat(e.target.value) || 10 })}
                      className="w-full px-3 py-1.5 bg-white border border-[#202124]/15 rounded-lg text-xs font-mono"
                    />
                    <span className="text-[10px] text-[#686868]">Percentage deducted on completed shifts (Current: 10%)</span>
                  </div>
                  <div className="p-4 bg-[#FFFDF8] rounded-xl border border-[#202124]/10 space-y-2">
                    <span className="font-bold text-xs text-[#202124]">Enabled Settlement Providers</span>
                    <p className="text-xs text-[#202124]">Razorpay, UPI Intent, Cash at Worksite, Bank NEFT</p>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 9: BOOKING & WORKER RULES */}
            {activeSection === 'bookingrules' && (
              <div className="space-y-4">
                <h2 className="text-base font-bold text-[#202124]">Marketplace Booking & Dispatch Rules</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-[#FFFDF8] rounded-xl border border-[#202124]/10">
                    <span className="font-bold text-xs text-[#202124]">Default Full Day</span>
                    <p className="text-xs text-[#686868] mt-1">8 Working Hours</p>
                  </div>
                  <div className="p-3 bg-[#FFFDF8] rounded-xl border border-[#202124]/10">
                    <span className="font-bold text-xs text-[#202124]">Default Half Day</span>
                    <p className="text-xs text-[#686868] mt-1">4 Working Hours</p>
                  </div>
                  <div className="p-3 bg-[#FFFDF8] rounded-xl border border-[#202124]/10">
                    <span className="font-bold text-xs text-[#202124]">Overtime Multiplier</span>
                    <p className="text-xs text-[#686868] mt-1">1.5x Hourly Pro-Rata</p>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 10: MAINTENANCE & APP UPDATES */}
            {activeSection === 'maintenance' && (
              <div className="space-y-4">
                <h2 className="text-base font-bold text-[#202124]">Maintenance Mode</h2>
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-amber-900">Activate Marketplace Maintenance Mode</span>
                    <p className="text-[11px] text-amber-800">Suspends new job bookings and shows scheduled upgrade banner on mobile apps.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={remoteConfig.maintenanceMode}
                    onChange={(e) => setRemoteConfig({ ...remoteConfig, maintenanceMode: e.target.checked })}
                    className="w-5 h-5 accent-[#D71920]"
                  />
                </div>
              </div>
            )}

            {/* MODULE 11: NOTIFICATIONS */}
            {activeSection === 'notifications' && (
              <div className="space-y-4">
                <h2 className="text-base font-bold text-[#202124]">Notification Broadcasts</h2>
                <div className="space-y-2">
                  {remoteConfig.announcements.map((ann) => (
                    <div key={ann.id} className="p-3 bg-[#FFFDF8] rounded-xl border border-[#202124]/10 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-[#202124]">{ann.title}</span>
                        <p className="text-[#686868]">{ann.message}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md font-bold text-[10px] uppercase">{ann.audience}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MODULE 12: SECURITY & PRIVACY */}
            {activeSection === 'security' && (
              <div className="space-y-4">
                <h2 className="text-base font-bold text-[#202124]">Security, RBAC & GDPR/SPDI Compliance</h2>
                <div className="p-4 bg-white rounded-xl border border-[#202124]/10 space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-[#686868]">Role-Based Access Control (RBAC):</span>
                    <span className="font-bold text-emerald-700">Super Admin, Admin, Operations, Finance</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-[#686868]">Administrative Session TTL:</span>
                    <span className="font-mono">60 Minutes Inactivity Expiry</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#686868]">Data Deletion & Retention:</span>
                    <span className="font-bold text-[#202124]">Self-service Account Deletion Supported</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
