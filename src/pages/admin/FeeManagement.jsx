import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import axios from 'axios';

import { API_URL } from '../../productionLink/productionLink';

const API_BASE_URL = API_URL;

const FeeManagement = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [classFees, setClassFees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // Dynamic fee columns
    const [feeColumns, setFeeColumns] = useState([]);
    const [feeData, setFeeData] = useState({}); // { columnTypeId: amount }

    // Column management
    const [showColumnManager, setShowColumnManager] = useState(false);
    const [newColumnName, setNewColumnName] = useState('');
    const [editingColumnId, setEditingColumnId] = useState(null);
    const [editingColumnName, setEditingColumnName] = useState('');
    const [columnSaving, setColumnSaving] = useState(false);

    // Admission fee
    const [globalAdmissionFee, setGlobalAdmissionFee] = useState(0);
    const [isEditingAdmissionFee, setIsEditingAdmissionFee] = useState(false);
    const [tempAdmissionFee, setTempAdmissionFee] = useState('');
    const [admissionFeeLoading, setAdmissionFeeLoading] = useState(false);

    // Delete confirmation
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // Fee Cycle
    const [feeCycle, setFeeCycle] = useState('monthly');

    // Retention Fee Policies
    const [failPolicy, setFailPolicy] = useState('require');
    const [repeatPolicy, setRepeatPolicy] = useState('require');
    const [policyLoading, setPolicyLoading] = useState(false);

    useEffect(() => {
        fetchFeeColumns();
        fetchFeeStructures();
        fetchAdmissionFee();
        fetchRetentionPolicies();
        fetchSchoolSettings();
    }, []);

    const fetchSchoolSettings = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/admin/settings`, getAuthHeaders());
            if (response.data.success && response.data.school) {
                setFeeCycle(response.data.school.fee_collection_cycle || 'monthly');
            }
        } catch (err) {}
    };

    const getAuthHeaders = () => ({
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    // ---- Settings ----

    const fetchRetentionPolicies = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/admin/settings/retention-fee-policies`, getAuthHeaders());
            if (response.data.success) {
                setFailPolicy(response.data.failPolicy);
                setRepeatPolicy(response.data.repeatPolicy);
            }
        } catch (error) {
            console.error('Error fetching retention policies:', error);
        }
    };

    const updateRetentionPolicies = async (type, policyValue) => {
        const actionText = policyValue === 'exempt' ? 'Exempt (₹0)' : 'Require Fees';
        const typeText = type === 'fail' ? 'Fail' : 'Repeat';
        
        if (!window.confirm(`Are you sure you want to change the ${typeText} Fee Policy to "${actionText}"?`)) {
            return;
        }

        try {
            setPolicyLoading(true);
            const newFailPolicy = type === 'fail' ? policyValue : failPolicy;
            const newRepeatPolicy = type === 'repeat' ? policyValue : repeatPolicy;

            const response = await axios.post(
                `${API_BASE_URL}/api/admin/settings/retention-fee-policies`,
                { failPolicy: newFailPolicy, repeatPolicy: newRepeatPolicy },
                getAuthHeaders()
            );
            if (response.data.success) {
                if (type === 'fail') setFailPolicy(policyValue);
                if (type === 'repeat') setRepeatPolicy(policyValue);
                alert(`${typeText} Fee Policy successfully updated to ${actionText}!`);
            }
        } catch (error) {
            console.error('Error updating retention policies:', error);
            alert('Failed to update fee policies');
        } finally {
            setPolicyLoading(false);
        }
    };

    // ---- Fee Columns CRUD ----

    const fetchFeeColumns = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/admin/fees/columns`, getAuthHeaders());
            if (response.data.success) {
                setFeeColumns(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching fee columns:', error);
        }
    };

    const handleAddColumn = async () => {
        if (!newColumnName.trim()) return;
        try {
            setColumnSaving(true);
            const response = await axios.post(
                `${API_BASE_URL}/api/admin/fees/columns`,
                { displayName: newColumnName.trim() },
                getAuthHeaders()
            );
            if (response.data.success) {
                setNewColumnName('');
                await fetchFeeColumns();
                await fetchFeeStructures();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to add column');
        } finally {
            setColumnSaving(false);
        }
    };

    const handleRenameColumn = async (colId) => {
        if (!editingColumnName.trim()) return;
        try {
            setColumnSaving(true);
            const response = await axios.put(
                `${API_BASE_URL}/api/admin/fees/columns/${colId}`,
                { displayName: editingColumnName.trim() },
                getAuthHeaders()
            );
            if (response.data.success) {
                setEditingColumnId(null);
                setEditingColumnName('');
                await fetchFeeColumns();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to rename column');
        } finally {
            setColumnSaving(false);
        }
    };

    const handleDeleteColumn = async (colId) => {
        try {
            setColumnSaving(true);
            const response = await axios.delete(
                `${API_BASE_URL}/api/admin/fees/columns/${colId}`,
                getAuthHeaders()
            );
            if (response.data.success) {
                setDeleteConfirm(null);
                await fetchFeeColumns();
                await fetchFeeStructures();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete column');
        } finally {
            setColumnSaving(false);
        }
    };

    // ---- Admission Fee ----

    const fetchAdmissionFee = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/admin/fees/admission`, getAuthHeaders());
            if (response.data.success) {
                setGlobalAdmissionFee(response.data.amount);
            }
        } catch (error) {
            console.error('Error fetching admission fee:', error);
        }
    };

    const updateAdmissionFee = async () => {
        try {
            setAdmissionFeeLoading(true);
            const response = await axios.post(
                `${API_BASE_URL}/api/admin/fees/admission`,
                { amount: tempAdmissionFee },
                getAuthHeaders()
            );
            if (response.data.success) {
                setGlobalAdmissionFee(tempAdmissionFee);
                setIsEditingAdmissionFee(false);
                alert('Admission fee updated successfully');
            }
        } catch (error) {
            console.error('Error updating admission fee:', error);
            alert('Failed to update admission fee');
        } finally {
            setAdmissionFeeLoading(false);
        }
    };

    // ---- Fee Structures ----

    const fetchFeeStructures = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`${API_BASE_URL}/api/admin/fees/structure`, getAuthHeaders());
            if (response.data.success) {
                setClassFees(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching fee structures:', err);
            setError('Failed to load fee structures. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditFees = (classItem) => {
        setSelectedClass(classItem);
        // Build feeData from column_values: { columnTypeId: amount }
        const data = {};
        feeColumns.forEach(col => {
            data[col.id] = classItem.column_values?.[col.id] || '';
        });
        setFeeData(data);
        setShowModal(true);
    };

    const handleSaveFees = async () => {
        try {
            setSaving(true);
            setError(null);

            const payload = {
                classId: selectedClass.class_id,
                streamId: selectedClass.stream_id || 0,
                columns: {}
            };

            // Build columns object
            Object.entries(feeData).forEach(([colId, amount]) => {
                payload.columns[colId] = parseFloat(amount) || 0;
            });

            const response = await axios.post(
                `${API_BASE_URL}/api/admin/fees/structure`,
                payload,
                {
                    ...getAuthHeaders(),
                    headers: {
                        ...getAuthHeaders().headers,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                await fetchFeeStructures();
                setShowModal(false);
                setSelectedClass(null);
                alert('Fee structure updated successfully!');
            }
        } catch (err) {
            console.error('Error saving fee structure:', err);
            setError('Failed to save fee structure. Please try again.');
            alert('Failed to save fee structure. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const calculateTotal = () => {
        return Object.values(feeData).reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-slate-500 font-medium">Loading fee structures...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 md:space-y-8 pb-8">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-4 md:p-5 text-white shadow-lg">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-lg md:text-xl font-bold tracking-tight">Fee Management 💰</h1>
                        <p className="mt-1 text-emerald-100 text-xs md:text-sm">
                            Configure admission and annual class fee structures.
                        </p>
                    </div>
                    <div className="bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/20 text-xs font-bold flex items-center gap-2 shadow-xs">
                        <span className="text-emerald-100">Fee Collection Cycle:</span>
                        <span className="bg-white text-emerald-800 px-2.5 py-1 rounded-lg uppercase tracking-wider font-extrabold text-[11px] shadow-xs">
                            {feeCycle === 'yearly' ? '🗓️ Yearly / Annual Collection' : feeCycle === 'quarterly' ? '📆 Quarterly Collection' : feeCycle === 'half_yearly' ? '🌗 Half-Yearly Collection' : '📅 Monthly Collection'}
                        </span>
                    </div>
                </div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-20 w-60 h-60 rounded-full bg-emerald-400 opacity-20 blur-3xl"></div>
            </div>

            {/* Global Admission Fee Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                <div className="flex items-center gap-3.5 z-10">
                    <div className="w-10 h-10 bg-emerald-100/50 rounded-lg text-xl flex items-center justify-center shrink-0">
                        🏫
                    </div>
                    <div>
                        <h2 className="text-sm md:text-base font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
                            Global Admission Fee
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5 max-w-lg">
                            This is a one-time fee applicable to all new student admissions across the institution.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3.5 z-10 ml-13 md:ml-0">
                    {isEditingAdmissionFee ? (
                        <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                            <span className="text-slate-400 font-medium text-xs">₹</span>
                            <input
                                type="number"
                                value={tempAdmissionFee}
                                onChange={(e) => setTempAdmissionFee(e.target.value)}
                                className="w-24 px-1.5 py-0.5 bg-white border border-slate-300 rounded text-xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none font-bold text-slate-800"
                                placeholder="Amount"
                                autoFocus
                            />
                            <div className="flex gap-1">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={updateAdmissionFee}
                                    disabled={admissionFeeLoading}
                                    className="!bg-emerald-600 hover:!bg-emerald-700 !px-2.5 !py-1 text-xs"
                                >
                                    {admissionFeeLoading ? '...' : 'Save'}
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setIsEditingAdmissionFee(false)}
                                    disabled={admissionFeeLoading}
                                    className="!px-2.5 !py-1 text-xs"
                                >
                                    ✕
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Current Amount</p>
                                <p className="text-xl md:text-2xl font-bold text-emerald-600 tracking-tight">
                                    {formatCurrency(globalAdmissionFee)}
                                </p>
                            </div>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                    setTempAdmissionFee(globalAdmissionFee);
                                    setIsEditingAdmissionFee(true);
                                }}
                                className="border-slate-300 hover:border-emerald-300 hover:text-emerald-700 !py-1 !px-2.5 text-xs"
                            >
                                ✏️ Edit
                            </Button>
                        </div>
                    )}
                </div>
            </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fail Fee Policy Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-5 flex flex-col gap-3 relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                    <div className="flex items-center gap-3 z-10">
                        <div className="w-10 h-10 bg-red-100/50 rounded-lg text-xl flex items-center justify-center shrink-0">
                            ❌
                        </div>
                        <div>
                            <h2 className="text-sm md:text-base font-bold text-slate-800 uppercase tracking-tight">
                                Fail Fee Policy
                            </h2>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500">
                        Configure whether students who <b>Fail</b> a class are required to pay full class fees again.
                    </p>
                    <div className="mt-auto pt-1 w-full">
                        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                            <button
                                onClick={() => updateRetentionPolicies('fail', 'require')}
                                disabled={policyLoading}
                                className={`flex-1 px-2.5 py-1.5 text-xs font-bold rounded-md transition-colors ${failPolicy === 'require'
                                        ? 'bg-white text-red-700 shadow-sm border border-slate-200'
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {policyLoading && failPolicy !== 'require' ? '...' : 'Require Fees'}
                            </button>
                            <button
                                onClick={() => updateRetentionPolicies('fail', 'exempt')}
                                disabled={policyLoading}
                                className={`flex-1 px-2.5 py-1.5 text-xs font-bold rounded-md transition-colors ${failPolicy === 'exempt'
                                        ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {policyLoading && failPolicy !== 'exempt' ? '...' : 'Exempt (₹0)'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Repeat Fee Policy Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-5 flex flex-col gap-3 relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>
                    <div className="flex items-center gap-3 z-10">
                        <div className="w-10 h-10 bg-orange-100/50 rounded-lg text-xl flex items-center justify-center shrink-0">
                            🔄
                        </div>
                        <div>
                            <h2 className="text-sm md:text-base font-bold text-slate-800 uppercase tracking-tight">
                                Repeat Fee Policy
                            </h2>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500">
                        Configure whether students choosing to <b>Repeat</b> a class are required to pay full class fees again.
                    </p>
                    <div className="mt-auto pt-1 w-full">
                        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                            <button
                                onClick={() => updateRetentionPolicies('repeat', 'require')}
                                disabled={policyLoading}
                                className={`flex-1 px-2.5 py-1.5 text-xs font-bold rounded-md transition-colors ${repeatPolicy === 'require'
                                        ? 'bg-white text-orange-700 shadow-sm border border-slate-200'
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {policyLoading && repeatPolicy !== 'require' ? '...' : 'Require Fees'}
                            </button>
                            <button
                                onClick={() => updateRetentionPolicies('repeat', 'exempt')}
                                disabled={policyLoading}
                                className={`flex-1 px-2.5 py-1.5 text-xs font-bold rounded-md transition-colors ${repeatPolicy === 'exempt'
                                        ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {policyLoading && repeatPolicy !== 'exempt' ? '...' : 'Exempt (₹0)'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            
            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <span>⚠️</span> {error}
                </div>
            )}

            {/* Fee Column Manager */}
            <Card variant="elevated" className="p-0 overflow-hidden border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                            <span className="w-2 h-6 bg-indigo-600 rounded-full"></span>
                            Fee Column Types
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5 ml-4">Add, rename, or remove fee categories</p>
                    </div>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowColumnManager(!showColumnManager)}
                        className="border-slate-300 hover:border-indigo-300 hover:text-indigo-600"
                    >
                        {showColumnManager ? '✕ Close' : '⚙️ Manage Columns'}
                    </Button>
                </div>

                {showColumnManager && (
                    <div className="p-6 space-y-4 bg-white">
                        {/* Current columns list */}
                        <div className="space-y-2">
                            {feeColumns.map(col => (
                                <div key={col.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 group hover:border-slate-200 transition-colors">
                                    {editingColumnId === col.id ? (
                                        <>
                                            <input
                                                type="text"
                                                value={editingColumnName}
                                                onChange={(e) => setEditingColumnName(e.target.value)}
                                                className="flex-1 px-3 py-1.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleRenameColumn(col.id);
                                                    if (e.key === 'Escape') setEditingColumnId(null);
                                                }}
                                            />
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() => handleRenameColumn(col.id)}
                                                disabled={columnSaving}
                                                className="!bg-indigo-600 hover:!bg-indigo-700"
                                            >
                                                {columnSaving ? '...' : 'Save'}
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => setEditingColumnId(null)}
                                            >
                                                Cancel
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex-1 flex items-center gap-2">
                                                <span className="w-6 h-6 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full text-xs font-bold">
                                                    {col.sort_order}
                                                </span>
                                                <span className="text-sm font-semibold text-slate-700">{col.display_name}</span>
                                                <span className="text-xs text-slate-400 font-mono hidden md:inline">({col.column_key})</span>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setEditingColumnId(col.id);
                                                    setEditingColumnName(col.display_name);
                                                }}
                                                className="text-slate-400 hover:text-indigo-600 p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                                                title="Rename"
                                            >
                                                ✏️
                                            </button>
                                            {deleteConfirm === col.id ? (
                                                <div className="flex items-center gap-1">
                                                    <span className="text-xs text-red-500 font-medium">Delete?</span>
                                                    <button
                                                        onClick={() => handleDeleteColumn(col.id)}
                                                        disabled={columnSaving}
                                                        className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                                    >
                                                        {columnSaving ? '...' : 'Yes'}
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirm(null)}
                                                        className="text-xs px-2 py-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300 transition-colors"
                                                    >
                                                        No
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setDeleteConfirm(col.id)}
                                                    className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Delete"
                                                >
                                                    🗑️
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Add new column */}
                        <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                            <input
                                type="text"
                                value={newColumnName}
                                onChange={(e) => setNewColumnName(e.target.value)}
                                placeholder="New column name (e.g., Activity Fee)"
                                className="flex-1 px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAddColumn();
                                }}
                            />
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handleAddColumn}
                                disabled={columnSaving || !newColumnName.trim()}
                                className="!bg-emerald-600 hover:!bg-emerald-700 whitespace-nowrap"
                            >
                                {columnSaving ? 'Adding...' : '+ Add Column'}
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Fee Structure Table */}
            <Card variant="elevated" className="p-0 overflow-hidden border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                        <span className="w-2 h-6 bg-emerald-600 rounded-full"></span>
                        Class Fee Structures
                    </h2>
                    <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                        {classFees.length} Classes Configured
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-2 py-3 md:px-6 md:py-4 text-left text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider md:sticky md:left-0 bg-slate-50 z-10 border-r border-slate-200">
                                    Class
                                </th>
                                {feeColumns.map(col => (
                                    <th key={col.id} className="px-2 py-3 md:px-4 md:py-4 text-right text-[10px] md:text-xs font-medium text-slate-400 uppercase tracking-wider whitespace-nowrap">
                                        {col.display_name}
                                    </th>
                                ))}
                                <th className="px-2 py-3 md:px-6 md:py-4 text-right text-[10px] md:text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50/30">
                                    {feeCycle === 'yearly' ? 'Total (Annual)' : feeCycle === 'quarterly' ? 'Total (Quarterly)' : feeCycle === 'half_yearly' ? 'Total (Half-Yearly)' : 'Total (Monthly)'}
                                </th>
                                <th className="px-2 py-3 md:px-6 md:py-4 text-center text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-2 py-3 md:px-6 md:py-4 text-center text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider md:sticky md:right-0 bg-slate-50 z-10 border-l border-slate-200">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-50">
                            {classFees.map((classItem, idx) => (
                                <tr key={`${classItem.class_id}-${classItem.stream_id}`} className={`hover:bg-slate-50/80 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                                    <td className="px-2 py-3 md:px-6 md:py-4 whitespace-nowrap md:sticky md:left-0 bg-white z-10 border-r border-slate-100 group-hover:bg-slate-50/80">
                                        <div className="flex items-center gap-1.5 md:gap-3">
                                            <div className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-[10px] md:text-xs" title={classItem.class_name}>
                                                {classItem.class_number}
                                            </div>
                                            <div className="text-xs md:text-sm font-bold text-slate-800">
                                                {classItem.class_name}
                                            </div>
                                        </div>
                                    </td>
                                    {feeColumns.map((col, colIdx) => (
                                        <td key={col.id} className={`px-2 py-3 md:px-4 md:py-4 whitespace-nowrap text-xs md:text-sm text-right ${colIdx === 0 ? 'text-slate-600 font-medium' : 'text-slate-500'}`}>
                                            {formatCurrency(classItem.column_values?.[col.id] || 0)}
                                        </td>
                                    ))}
                                    <td className="px-2 py-3 md:px-6 md:py-4 whitespace-nowrap text-right bg-emerald-50/10">
                                        <span className="text-xs md:text-sm font-extrabold text-emerald-700 block">
                                            {formatCurrency(classItem.total_fee)}{feeCycle === 'monthly' ? ' / mo' : feeCycle === 'quarterly' ? ' / qtr' : ''}
                                        </span>
                                        {feeCycle === 'monthly' && parseFloat(classItem.total_fee || 0) > 0 && (
                                            <span className="text-[10px] text-slate-400 font-medium block">
                                                ({formatCurrency(classItem.total_fee * 12)} / yr)
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-2 py-3 md:px-6 md:py-4 whitespace-nowrap text-center text-xs">
                                        <Badge variant={classItem.has_config ? 'success' : 'warning'} className="shadow-sm !text-[9px] md:!text-xs !px-1.5 !py-0.5">
                                            {classItem.has_config ? 'Active' : 'Not Set'}
                                        </Badge>
                                    </td>
                                    <td className="px-2 py-3 md:px-6 md:py-4 whitespace-nowrap text-center md:sticky md:right-0 bg-white z-10 border-l border-slate-100">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleEditFees(classItem)}
                                            className="hover:border-indigo-300 hover:text-indigo-600 transition-colors !py-1 !px-2 md:!py-1.5 md:!px-3 text-[10px] md:text-xs"
                                        >
                                            {classItem.has_config ? 'Edit' : 'Configure'}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Fee Configuration Modal */}
            {showModal && selectedClass && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform scale-100 transition-all border border-slate-200">
                        <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-slate-100 px-6 py-4 z-20">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                        💸 Configure Fees
                                    </h2>
                                    <p className="text-sm text-slate-500 mt-0.5">
                                        Setting <span className="font-semibold text-emerald-700">{feeCycle === 'monthly' ? 'monthly' : feeCycle === 'yearly' ? 'annual' : feeCycle}</span> fee structure for <span className="font-bold text-slate-800">{selectedClass.class_name}</span>
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors"
                                    disabled={saving}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 md:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                {feeColumns.map((col, idx) => (
                                    <div key={col.id}>
                                        <label className={`block text-xs font-bold uppercase tracking-wide mb-1.5 ${idx === 0 ? 'text-slate-500' : 'text-slate-400'}`}>
                                            {col.display_name} ({feeCycle === 'monthly' ? 'Monthly' : feeCycle === 'yearly' ? 'Annual' : 'Amount'}) {idx === 0 && <span className="text-red-500">*</span>}
                                        </label>
                                        <input
                                            type="number"
                                            value={feeData[col.id] || ''}
                                            onChange={(e) => setFeeData({ ...feeData, [col.id]: e.target.value })}
                                            className={`w-full px-3 ${idx === 0 ? 'py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-slate-800' : 'py-2 border border-slate-200 rounded-lg text-sm'}`}
                                            placeholder="0.00"
                                            min="0"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Total Calculation */}
                            <div className="mt-8 p-5 bg-emerald-50 rounded-xl border border-emerald-100 flex justify-between items-center">
                                <div>
                                    <span className="block text-xs font-bold text-emerald-600 uppercase tracking-wide">
                                        Total {feeCycle === 'monthly' ? 'Monthly' : feeCycle === 'yearly' ? 'Annual' : 'Fee'} Amount
                                    </span>
                                    <span className="text-xs text-emerald-500">
                                        {feeCycle === 'monthly' ? 'Calculated monthly fee sum' : 'Calculated annual sum of all components'}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl md:text-3xl font-bold text-emerald-600 block">
                                        {formatCurrency(calculateTotal())}{feeCycle === 'monthly' ? ' / mo' : ''}
                                    </span>
                                    {feeCycle === 'monthly' && calculateTotal() > 0 && (
                                        <span className="text-xs font-semibold text-slate-500 block mt-0.5">
                                            Equivalent to {formatCurrency(calculateTotal() * 12)} / year (12 months)
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-gray-50 border-t border-slate-200 px-6 py-4 flex justify-end gap-3 z-20 rounded-b-2xl">
                            <Button
                                variant="secondary"
                                onClick={() => setShowModal(false)}
                                disabled={saving}
                                className="!bg-white hover:!bg-slate-100 border-slate-300"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleSaveFees}
                                disabled={saving}
                                className="!bg-emerald-600 hover:!bg-emerald-700 shadow-md hover:shadow-lg transform active:scale-95 transition-all"
                            >
                                {saving ? 'Saving Changes...' : 'Save Fee Structure'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeeManagement;
