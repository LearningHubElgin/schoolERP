import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';

const AddSchool = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const schoolId = searchParams.get('id');

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
        email: '',
        logo: '',
        principal_name: '',
        established_year: '',
        board: 'CBSE',
        website: '',
        subscription_plan: 'basic',
        subscription_end: '',
        admin_email: '',
        admin_password: ''
    });

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [logoUploading, setLogoUploading] = useState(false);
    const [error, setError] = useState('');
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [generatedCredentials, setGeneratedCredentials] = useState(null);
    const [copied, setCopied] = useState(false);

    // Fetch school data if in Edit Mode
    useEffect(() => {
        if (schoolId) {
            const fetchSchoolData = async () => {
                setFetching(true);
                setError('');
                try {
                    const token = localStorage.getItem('token');
                    const res = await axios.get(`${API_URL}/api/superadmin/schools/${schoolId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (res.data.success && res.data.school) {
                        const school = res.data.school;
                        setFormData({
                            name: school.name || '',
                            address: school.address || '',
                            city: school.city || '',
                            state: school.state || '',
                            pincode: school.pincode || '',
                            phone: school.phone || '',
                            email: school.email || '',
                            logo: school.logo || '',
                            principal_name: school.principal_name || '',
                            established_year: school.established_year || '',
                            board: school.board || 'CBSE',
                            website: school.website || '',
                            subscription_plan: school.subscription_plan || 'basic',
                            subscription_end: school.subscription_end ? school.subscription_end.split('T')[0] : '',
                            admin_email: school.admin_email || '',
                            admin_password: ''
                        });
                    } else {
                        setError('Failed to retrieve school details.');
                    }
                } catch (err) {
                    console.error('Error fetching school details for edit:', err);
                    setError('Server error fetching school details.');
                } finally {
                    setFetching(false);
                }
            };

            fetchSchoolData();
        }
    }, [schoolId]);

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!formData.name || !formData.name.trim()) {
            setError('Please enter the School Name first before uploading the logo.');
            return;
        }

        const uploadData = new FormData();
        uploadData.append('schoolName', formData.name.trim());
        uploadData.append('logo', file);

        setLogoUploading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/api/superadmin/upload-logo`, uploadData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.data.success) {
                setFormData(prev => ({ ...prev, logo: res.data.logoUrl }));
            } else {
                setError('Failed to upload school logo.');
            }
        } catch (err) {
            console.error('Error uploading school logo:', err);
            setError(err.response?.data?.message || 'Error uploading school logo.');
        } finally {
            setLogoUploading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            
            if (schoolId) {
                // Edit Mode: Send PUT request
                const res = await axios.put(`${API_URL}/api/superadmin/schools/${schoolId}`, formData, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.data.success) {
                    // Redirect back to View Schools page directly
                    navigate('/superadmin/view-schools');
                } else {
                    setError(res.data.message || 'Error updating school details');
                }
            } else {
                // Create Mode: Send POST request
                const res = await axios.post(`${API_URL}/api/superadmin/schools`, formData, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.data.success) {
                    setGeneratedCredentials({
                        schoolCode: res.data.schoolCode,
                        schoolName: formData.name,
                        loginId: res.data.adminCredentials.loginId,
                        password: res.data.adminCredentials.password
                    });
                    setSuccessModalOpen(true);
                    setFormData({
                        name: '',
                        address: '',
                        city: '',
                        state: '',
                        pincode: '',
                        phone: '',
                        email: '',
                        logo: '',
                        principal_name: '',
                        established_year: '',
                        board: 'CBSE',
                        website: '',
                        subscription_plan: 'basic',
                        subscription_end: '',
                        admin_email: '',
                        admin_password: ''
                    });
                } else {
                    setError(res.data.message || 'Error creating school branch');
                }
            }
        } catch (err) {
            console.error('Submit school error:', err);
            setError(err.response?.data?.message || `Server error ${schoolId ? 'updating' : 'creating'} school branch`);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (!generatedCredentials) return;
        const textToCopy = `School Branch Registered!\n\n` +
            `School Name: ${generatedCredentials.schoolName}\n` +
            `School Code: ${generatedCredentials.schoolCode}\n\n` +
            `Generated Admin Credentials:\n` +
            `Login ID: ${generatedCredentials.loginId}\n` +
            `Password: ${generatedCredentials.password}`;
        
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin text-indigo-600 mb-4 mx-auto w-12 h-12 border-4 border-indigo-600/20 border-b-indigo-600 rounded-full"></div>
                    <p className="text-slate-500 font-medium">Fetching school details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
            {/* Header */}
            <div>
                <button
                    onClick={() => navigate(schoolId ? '/superadmin/view-schools' : '/superadmin/dashboard')}
                    className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
                >
                    {schoolId ? '← Back to School Directory' : '← Back to Dashboard'}
                </button>
                <h1 className="text-xl md:text-3xl font-bold tracking-tight text-slate-800">
                    {schoolId ? 'Edit School Branch' : 'Create School Branch'}
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                    {schoolId 
                        ? 'Modify specific configurations, subscription plans, boards, and administrative head details.' 
                        : 'Establish a brand new school division and automatically provision its default administrative supervisor credentials.'}
                </p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 font-semibold text-sm">
                    ⚠️ {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <Card variant="elevated" className="space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-2">Primary School Details</h2>
                        
                        {/* School Logo Uploader */}
                        <div className="flex flex-col sm:flex-row gap-5 items-center bg-slate-50/50 p-4 rounded-xl border border-slate-200/50">
                            <div className="relative group w-20 h-20 rounded-xl border border-slate-200 bg-white overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm">
                                {formData.logo ? (
                                    <img 
                                        src={`${API_URL}${formData.logo}`} 
                                        alt="School Logo Preview" 
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            if (!e.target.src.startsWith('http')) {
                                                e.target.src = formData.logo; 
                                            }
                                        }}
                                    />
                                ) : (
                                    <span className="text-2xl text-slate-300">🏫</span>
                                )}
                                {logoUploading && (
                                    <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
                                        <div className="animate-spin w-5 h-5 border-2 border-indigo-600/20 border-b-indigo-600 rounded-full"></div>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 space-y-1 text-center sm:text-left">
                                <label className="block text-sm font-semibold text-slate-700">School Logo</label>
                                <p className="text-xs text-slate-400">Upload square JPG, PNG or WebP up to 5MB.</p>
                                <div className="pt-1.5 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        id="logo-upload"
                                        className="hidden"
                                        onChange={handleLogoUpload}
                                        disabled={logoUploading}
                                    />
                                    <label
                                        htmlFor="logo-upload"
                                        className="inline-flex items-center px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-sm cursor-pointer transition-all"
                                    >
                                        {formData.logo ? 'Change Logo 🔄' : 'Upload Logo 📤'}
                                    </label>
                                    {formData.logo && (
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, logo: '' }))}
                                            className="text-xs font-semibold text-red-500 hover:text-red-700 px-2 py-1 transition-colors"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="School Name *"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="e.g. Ballygunge Park Day School"
                                required
                            />
                            
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-slate-700 mb-1">Affiliation Board</label>
                                <select
                                    name="board"
                                    value={formData.board}
                                    onChange={handleInputChange}
                                    className="w-full py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white font-medium text-slate-700"
                                >
                                    <option value="CBSE">CBSE (Central Board of Secondary Education)</option>
                                    <option value="ICSE">ICSE (Indian Certificate of Secondary Education)</option>
                                    <option value="WBBSE">WBBSE (West Bengal Board of Secondary Education)</option>
                                    <option value="State Board">State Board</option>
                                    <option value="IB">IB (International Baccalaureate)</option>
                                    <option value="N/A">N/A</option>
                                </select>
                            </div>

                            <Input
                                label="Principal Name"
                                name="principal_name"
                                value={formData.principal_name}
                                onChange={handleInputChange}
                                placeholder="e.g. Dr. Rajesh Sen"
                            />

                            <Input
                                label="Established Year"
                                name="established_year"
                                type="number"
                                min="1900"
                                max={new Date().getFullYear()}
                                value={formData.established_year}
                                onChange={handleInputChange}
                                placeholder="e.g. 1995"
                            />
                        </div>
                    </div>

                    {/* Contacts & Digital Presence */}
                    <div className="space-y-4">
                        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-2">Contact & Digital Presence</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="Contact Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="e.g. contact@bpschool.edu"
                            />
                            
                            <Input
                                label="Contact Phone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="e.g. +91 9830012345"
                            />

                            <Input
                                label="School Website"
                                name="website"
                                value={formData.website}
                                onChange={handleInputChange}
                                placeholder="e.g. www.bpschool.edu"
                            />
                        </div>
                    </div>

                    {/* Geographical address */}
                    <div className="space-y-4">
                        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-2">Geographic Location</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-2">
                                <Input
                                    label="Street Address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 12/A Ballygunge Circular Road"
                                />
                            </div>
                            
                            <Input
                                label="City"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                placeholder="e.g. Kolkata"
                            />

                            <Input
                                label="State"
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                placeholder="e.g. West Bengal"
                            />

                            <Input
                                label="Pincode"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleInputChange}
                                placeholder="e.g. 700019"
                            />
                        </div>
                    </div>

                    {/* License provision */}
                    <div className="space-y-4">
                        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-2">Licensing & Subscription Provisions</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-slate-700 mb-1">Subscription Tier</label>
                                <select
                                    name="subscription_plan"
                                    value={formData.subscription_plan}
                                    onChange={handleInputChange}
                                    className="w-full py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white font-medium text-slate-700"
                                >
                                    <option value="basic">Basic (Standard ERP suite)</option>
                                    <option value="standard">Standard (Extended library & transport module)</option>
                                    <option value="premium">Premium (All features & custom reporting templates)</option>
                                    <option value="free">Free (Trial / NGO Tier)</option>
                                </select>
                            </div>

                            <div className="flex flex-col">
                                <Input
                                    label="Subscription Expiry Date"
                                    name="subscription_end"
                                    type="date"
                                    value={formData.subscription_end}
                                    onChange={handleInputChange}
                                    disabled={!formData.subscription_end}
                                />
                                <div className="flex items-center gap-2 -mt-2 mb-4">
                                    <input
                                        type="checkbox"
                                        id="lifetime-license"
                                        checked={!formData.subscription_end}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setFormData(prev => ({ ...prev, subscription_end: '' }));
                                            } else {
                                                // Default to 1 year from now
                                                const nextYear = new Date();
                                                nextYear.setFullYear(nextYear.getFullYear() + 1);
                                                const formattedDate = nextYear.toISOString().split('T')[0];
                                                setFormData(prev => ({ ...prev, subscription_end: formattedDate }));
                                            }
                                        }}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer"
                                    />
                                    <label htmlFor="lifetime-license" className="text-xs font-semibold text-slate-600 cursor-pointer select-none">
                                        Lifetime License (No Expiry)
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Default Administrator Credentials */}
                    <div className="space-y-4">
                        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-2">Administrative Login Credentials</h2>
                        <p className="text-xs text-slate-400 mt-1">
                            {schoolId 
                                ? "Update the school master administrator's Login ID (Email). Type a new password to reset it, or leave the password field blank to keep the current one unchanged."
                                : "Manually specify a custom master admin login ID (Email) and password, or leave them empty to automatically generate secure default credentials."}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Admin Login ID (Email)"
                                name="admin_email"
                                type="email"
                                value={formData.admin_email}
                                onChange={handleInputChange}
                                placeholder="e.g. admin@your-school.com"
                            />
                            
                            <Input
                                label={schoolId ? "Reset Admin Password" : "Admin Password"}
                                name="admin_password"
                                type="text"
                                value={formData.admin_password}
                                onChange={handleInputChange}
                                placeholder={schoolId ? "Leave blank to keep current password" : "e.g. MyPassword123"}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={() => navigate(schoolId ? '/superadmin/view-schools' : '/superadmin/dashboard')}
                            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
                        >
                            {loading ? (schoolId ? 'Saving...' : 'Creating...') : (schoolId ? 'Save Changes' : 'Register School')}
                        </button>
                    </div>
                </Card>
            </form>

            {/* Success modal displaying autogenerated admin credentials */}
            {successModalOpen && generatedCredentials && (
                <Modal
                    isOpen={successModalOpen}
                    onClose={() => {
                        setSuccessModalOpen(false);
                        navigate('/superadmin/dashboard');
                    }}
                    title="School Registered Successfully!"
                >
                    <div className="space-y-5">
                        <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-100 text-center">
                            <p className="text-sm font-medium">School branch has been added with unique identification code:</p>
                            <p className="text-2xl font-bold mt-1 text-emerald-600">{generatedCredentials.schoolCode}</p>
                        </div>

                        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <h3 className="text-xs font-semibold text-slate-500 tracking-wider">🔑 Administrator Log In Credentials</h3>
                            
                            <div className="space-y-2">
                                <div>
                                    <p className="text-xs font-medium text-slate-400">Login ID (Email Address)</p>
                                    <p className="text-sm font-semibold text-slate-800 break-all">{generatedCredentials.loginId}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-400">Password</p>
                                    <p className="text-sm font-mono text-slate-800 bg-white py-1 px-2.5 rounded border border-slate-100 w-fit">{generatedCredentials.password}</p>
                                </div>
                            </div>
                        </div>

                        <p className="text-xs text-slate-400">Please copy these credentials and share them with the designated school branch manager. The supervisor password can be changed at any time.</p>

                        <div className="grid grid-cols-2 gap-2.5 pt-1">
                            <button
                                onClick={handleCopy}
                                className={`py-2 rounded-lg font-semibold text-sm transition-colors ${
                                    copied 
                                        ? 'bg-emerald-600 text-white shadow-sm' 
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                            >
                                {copied ? 'Copied!' : 'Copy Details'}
                            </button>
                            <button
                                onClick={() => {
                                    setSuccessModalOpen(false);
                                    navigate('/superadmin/dashboard');
                                }}
                                className="py-2 rounded-lg font-semibold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default AddSchool;
