import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { 
  RiCameraLine, RiSaveLine, RiUser3Line, RiMapPinLine, 
  RiMailLine, RiPhoneLine, RiCalendarLine, RiShieldUserLine, 
  RiSettings4Line, RiCheckboxCircleLine, RiMoneyDollarCircleLine,
  RiFileList3Line
} from 'react-icons/ri';
import { extractInitials } from '../../utils/helpers';

interface CustomSelectProps {
  label: string;
  value: string;
  options: { value: string; label: string; disabled?: boolean }[];
  onChange: (val: string) => void;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ label, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div ref={containerRef} className="relative w-full">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-all text-sm text-left cursor-pointer"
      >
        <span>{selectedOption?.label}</span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-full bg-[#0c0c14]/95 border border-purple-500/20 backdrop-blur-md rounded-xl shadow-2xl z-50 overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              disabled={opt.disabled}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors flex justify-between items-center ${
                opt.disabled
                  ? 'text-gray-600 bg-transparent cursor-not-allowed'
                  : opt.value === value
                  ? 'bg-purple-600/20 text-[#D8B4FE] hover:bg-purple-600/30 cursor-pointer'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white cursor-pointer'
              }`}
            >
              <span>{opt.label.replace(' (Coming soon)', '').replace(' (Beta) (Coming soon)', '')}</span>
              {opt.disabled && (
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                  Coming soon
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const languageOptions = [
  { value: 'English', label: 'English' },
  { value: 'Spanish', label: 'Spanish (Coming soon)', disabled: true },
  { value: 'French', label: 'French (Coming soon)', disabled: true },
  { value: 'Urdu', label: 'Urdu (Coming soon)', disabled: true },
  { value: 'Arabic', label: 'Arabic (Coming soon)', disabled: true },
];

const themeOptions = [
  { value: 'Dark', label: 'Dark Mode' },
  { value: 'Light', label: 'Light Mode (Beta) (Coming soon)', disabled: true },
];

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Determine view mode based on URL route
  const isSettings = location.pathname === '/settings';

  const [personalForm, setPersonalForm] = useState({
    firstName: '', lastName: '', dateOfBirth: '', email: '', phoneNumber: '', userRole: ''
  });

  const [addressForm, setAddressForm] = useState({
    country: '', city: '', postalCode: ''
  });

  const [preferencesForm, setPreferencesForm] = useState({
    language: 'English', theme: 'Dark', plan: 'Free Tier'
  });

  useEffect(() => {
    if (user) {
      setPersonalForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        dateOfBirth: user.dateOfBirth || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        userRole: user.userRole || '',
      });
      setAddressForm({
        country: user.country || '',
        city: user.city || '',
        postalCode: user.postalCode || '',
      });
      setPreferencesForm({
        language: user.language || 'English',
        theme: user.theme || 'Dark',
        plan: user.plan || 'Free Tier',
      });
    }
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error('Image size must be less than 2MB');

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const response = await authService.updateProfile({ avatar: reader.result as string });
        if (response.data.success) {
          updateUser(response.data.user);
          toast.success('Profile picture updated successfully!');
        }
      } catch {
        toast.error('Failed to upload profile picture');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSavePersonal = async () => {
    if (!personalForm.firstName.trim()) return toast.error('First Name is compulsory');
    try {
      const response = await authService.updateProfile({
        name: `${personalForm.firstName} ${personalForm.lastName}`.trim() || user?.name,
        ...personalForm
      });
      if (response.data.success) {
        updateUser(response.data.user);
        toast.success('Personal information saved!');
      }
    } catch {
      toast.error('Failed to update personal information');
    }
  };

  const handleSaveAddress = async () => {
    try {
      const response = await authService.updateProfile(addressForm);
      if (response.data.success) {
        updateUser(response.data.user);
        toast.success('Address information saved!');
      }
    } catch {
      toast.error('Failed to update address information');
    }
  };

  const handleSavePreferences = async () => {
    try {
      const response = await authService.updateProfile(preferencesForm);
      if (response.data.success) {
        updateUser(response.data.user);
        toast.success('Preferences saved!');
      }
    } catch {
      toast.error('Failed to update preferences');
    }
  };

  // Helper to render fields dynamically
  const renderField = (
    label: string, 
    value: string, 
    isEditing: boolean, 
    onChange: (val: string) => void, 
    placeholder = '', 
    Icon?: React.ComponentType<any>,
    readOnly = false
  ) => (
    <div key={label} className="w-full">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</label>
      {isEditing && !readOnly ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors text-sm"
        />
      ) : (
        <p className={`text-white font-medium text-sm flex items-center gap-1.5 ${readOnly ? 'bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2.5' : ''}`}>
          {Icon && <Icon className="text-purple-500/70 text-base flex-shrink-0" />}
          <span className="truncate">{value || '-'}</span>
        </p>
      )}
    </div>
  );

  return (
    <div className="w-full pb-20 relative min-h-screen">
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          {isSettings ? <>Settings</> : <>My <span className="saas-gradient-text">Profile</span></>}
        </h1>
      </div>

      <div className="flex flex-col gap-6 w-full">
        
        {/* Header Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 rounded-[2rem] border border-white/5 flex flex-col sm:flex-row items-center gap-6"
        >
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-purple-500/30 flex items-center justify-center bg-purple-950/20 relative">
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="text-3xl font-bold text-white">
                  {user ? extractInitials(user.name) : <RiUser3Line />}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <RiCameraLine className="text-white text-2xl" />
              </div>
            </div>
            <div className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-purple-600 border border-white/10 flex items-center justify-center shadow-lg">
              <RiCameraLine className="text-white text-xs" />
            </div>
            <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
          </div>

          <div className="text-center sm:text-left flex-1">
            <h2 className="text-2xl font-extrabold text-white mb-1">{user?.name || 'Loading...'}</h2>
            <p className="text-purple-400 font-semibold text-sm mb-2">{user?.userRole || 'User'}</p>
            <p className="text-gray-400 text-xs flex items-center justify-center sm:justify-start gap-1">
              <RiMapPinLine className="text-purple-500" />
              {user?.city || user?.country ? `${user.city || ''}${user.city && user.country ? ', ' : ''}${user.country || ''}` : 'Location not specified'}
            </p>
          </div>
        </motion.div>

        {/* 4 Equal Height Containers using Flexbox */}
        <div className="flex flex-col lg:flex-row flex-wrap gap-6 w-full">
          
          {/* Container 1: Personal Information */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass p-8 rounded-[2rem] border border-white/5 w-full lg:w-[calc(50%-12px)] min-h-[500px] flex flex-col justify-between"
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <RiShieldUserLine className="text-purple-500" /> Personal Information
                  </h3>
                  {isSettings && (
                    <button
                      onClick={handleSavePersonal}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white flex items-center gap-1.5 shadow-lg shadow-purple-600/25 hover:shadow-purple-600/35 transition-all text-xs font-bold cursor-pointer"
                    >
                      <RiSaveLine /> Save
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-4 gap-y-5">
                  <div className="w-full sm:w-[calc(50%-8px)]">
                    {renderField('First Name', personalForm.firstName, isSettings, (v) => setPersonalForm({ ...personalForm, firstName: v }), 'First name')}
                  </div>
                  <div className="w-full sm:w-[calc(50%-8px)]">
                    {renderField('Last Name', personalForm.lastName, isSettings, (v) => setPersonalForm({ ...personalForm, lastName: v }), 'Last name')}
                  </div>
                  <div className="w-full sm:w-[calc(50%-8px)]">
                    {renderField('Date of Birth', personalForm.dateOfBirth, isSettings, (v) => setPersonalForm({ ...personalForm, dateOfBirth: v }), 'DD-MM-YYYY', RiCalendarLine)}
                  </div>
                  <div className="w-full sm:w-[calc(50%-8px)]">
                    {renderField('Email Address', personalForm.email, isSettings, () => {}, '', RiMailLine, true)}
                  </div>
                  <div className="w-full sm:w-[calc(50%-8px)]">
                    {renderField('Phone Number', personalForm.phoneNumber, isSettings, (v) => setPersonalForm({ ...personalForm, phoneNumber: v }), 'Phone number', RiPhoneLine)}
                  </div>
                  <div className="w-full sm:w-[calc(50%-8px)]">
                    {renderField('User Role', (personalForm.userRole || 'User').toUpperCase(), isSettings, () => {}, '', undefined, true)}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Container 2: Address */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass p-8 rounded-[2rem] border border-white/5 w-full lg:w-[calc(50%-12px)] min-h-[500px] flex flex-col justify-between"
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <RiMapPinLine className="text-purple-500" /> Address
                  </h3>
                  {isSettings && (
                    <button
                      onClick={handleSaveAddress}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white flex items-center gap-1.5 shadow-lg shadow-purple-600/25 hover:shadow-purple-600/35 transition-all text-xs font-bold cursor-pointer"
                    >
                      <RiSaveLine /> Save
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-5">
                  {renderField('Country', addressForm.country, isSettings, (v) => setAddressForm({ ...addressForm, country: v }), 'Country')}
                  {renderField('City', addressForm.city, isSettings, (v) => setAddressForm({ ...addressForm, city: v }), 'City')}
                  {renderField('Postal Code', addressForm.postalCode, isSettings, (v) => setAddressForm({ ...addressForm, postalCode: v }), 'Postal Code')}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Container 3: Preferences (Settings Mode) OR Active Plan Selected (Profile Mode) */}
          {isSettings ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass p-8 rounded-[2rem] border border-white/5 w-full lg:w-[calc(50%-12px)] min-h-[500px] flex flex-col justify-between"
            >
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <RiSettings4Line className="text-purple-500" /> Preferences
                    </h3>
                    <button
                      onClick={handleSavePreferences}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white flex items-center gap-1.5 shadow-lg shadow-purple-600/25 hover:shadow-purple-600/35 transition-all text-xs font-bold cursor-pointer"
                    >
                      <RiSaveLine /> Save
                    </button>
                  </div>

                  <div className="flex flex-col gap-5">
                    {/* Language Preferences */}
                    <CustomSelect
                      label="Language"
                      value={preferencesForm.language}
                      options={languageOptions}
                      onChange={(val) => setPreferencesForm({ ...preferencesForm, language: val })}
                    />

                    {/* Theme Settings */}
                    <CustomSelect
                      label="Theme"
                      value={preferencesForm.theme}
                      options={themeOptions}
                      onChange={(val) => setPreferencesForm({ ...preferencesForm, theme: val })}
                    />

                    {/* Plan Configuration */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Selected Account Tier</label>
                      <input
                        type="text"
                        value={user?.plan || 'Free Tier'}
                        readOnly
                        className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2.5 text-gray-400 focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass p-8 rounded-[2rem] border border-white/5 w-full lg:w-[calc(50%-12px)] min-h-[500px] flex flex-col justify-between"
            >
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <RiCheckboxCircleLine className="text-purple-500" /> Active Plan Selected
                    </h3>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
                    </span>
                  </div>

                  <div className="flex flex-col gap-4 mt-6">
                    <div className="flex flex-row items-center justify-between">
                      <h4 className="text-lg font-bold text-white">
                        {user?.plan || 'Free Tier'}
                      </h4>
                      <div className="text-right">
                        <span className="text-2xl font-black text-white">
                          {user?.plan === 'CareerGPT Pro' ? '$49' : user?.plan === 'CareerGPT Advance' ? '$19' : '$0'}
                        </span>
                        <span className="text-gray-400 text-xs font-medium">/mo</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-400 text-xs leading-relaxed mt-2 bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                      {user?.plan === 'CareerGPT Pro' 
                        ? 'Allows unlimited resumes matches, priority AI mentors, and mock hr call analytics.' 
                        : user?.plan === 'CareerGPT Advance' 
                        ? 'Includes full business customization suite, api credentials, and unlimited roadmap builds.'
                        : 'Get started with basic resume analyzing, roadmaps, and career mentor chatbot features.'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Container 4: Billing (Settings Mode) OR Plan Selected Details (Profile Mode) */}
          {isSettings ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass p-8 rounded-[2rem] border border-white/5 w-full lg:w-[calc(50%-12px)] min-h-[500px] flex flex-col justify-between"
            >
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <RiMoneyDollarCircleLine className="text-purple-500" /> Billing
                    </h3>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      Standard
                    </span>
                  </div>

                  <div className="flex flex-col gap-4 mt-2">
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                      <p className="text-xs text-text-muted">Currently Subscribed To</p>
                      <h4 className="text-base font-bold text-white mt-1">
                        {user?.plan || 'Free Tier'}
                      </h4>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                      <p className="text-xs text-text-muted">Pricing Cycle Price</p>
                      <h4 className="text-base font-bold text-white mt-1">
                        {user?.plan === 'CareerGPT Pro' ? '$49' : user?.plan === 'CareerGPT Advance' ? '$19' : '$0'} <span className="text-xs text-text-muted font-normal">per month</span>
                      </h4>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  {user?.plan === 'CareerGPT Pro' ? (
                    <div className="w-full text-center py-3 bg-purple-500/10 border border-purple-500/20 text-[#D8B4FE] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5">
                      <RiCheckboxCircleLine className="text-sm" /> Highest Plan Active
                    </div>
                  ) : (
                    <button
                      onClick={() => navigate('/pricing')}
                      className="w-full py-3 bg-gradient-to-r from-[#A855F7] to-[#D946EF] text-[#051614] font-bold rounded-xl text-xs hover:shadow-lg hover:shadow-purple-500/20 transition-all active:scale-95 cursor-pointer"
                    >
                      Upgrade Plan
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass p-8 rounded-[2rem] border border-white/5 w-full lg:w-[calc(50%-12px)] min-h-[500px] flex flex-col justify-between"
            >
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <RiFileList3Line className="text-purple-500" /> Plan Selected
                    </h3>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      Tier Features
                    </span>
                  </div>

                  <div className="flex flex-col gap-3 mt-4">
                    <p className="text-xs text-text-muted mb-2 font-medium">Included highlights on your current plan:</p>
                    
                    {[
                      { label: 'CV Analysis Limit', val: user?.plan === 'CareerGPT Pro' ? '100 CVs' : user?.plan === 'CareerGPT Advance' ? '20 CVs' : '4 CVs' },
                      { label: 'AI Mentorship Guidance', val: user?.plan === 'CareerGPT Pro' ? 'Priority AI simulator' : user?.plan === 'CareerGPT Advance' ? 'Basic mentor chat' : 'Community mentor chatbot' },
                      { label: 'Interactive Roadmaps', val: 'Unlimited generated' },
                      { label: 'Customer Support', val: user?.plan === 'CareerGPT Pro' ? 'Priority 24/7 support' : user?.plan === 'CareerGPT Advance' ? 'Standard email support' : 'Community support' }
                    ].map((feat, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white/[0.01] border border-white/5 p-3 rounded-xl">
                        <span className="text-xs text-text-muted">{feat.label}</span>
                        <span className="text-xs font-semibold text-white">{feat.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Profile;
