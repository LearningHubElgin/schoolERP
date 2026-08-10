import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import toast from 'react-hot-toast';

const StorePOS = () => {
    const { storeSlug } = useParams();
    const [inventory, setInventory] = useState([]);
    const [storeName, setStoreName] = useState('');
    const [cart, setCart] = useState([]);
    const [personSearch, setPersonSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paymentStatus, setPaymentStatus] = useState('paid');
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [searchFilter, setSearchFilter] = useState('');
    const [billPreview, setBillPreview] = useState(null);
    const [gstType, setGstType] = useState('none'); // none, inclusive, exclusive
    const [gstPercentage, setGstPercentage] = useState(0);
    const [customGst, setCustomGst] = useState('');
    const [isCustomGst, setIsCustomGst] = useState(false);
    const billRef = useRef(null);

    useEffect(() => { fetchInventory(); }, [storeSlug]);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/store/stores/${storeSlug}/inventory`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setInventory(res.data.items);
                setStoreName(res.data.store.name);
            }
        } catch (err) { toast.error('Failed to load inventory'); }
        finally { setLoading(false); }
    };

    const searchPeople = async (q) => {
        setPersonSearch(q);
        if (q.length < 2) { setSearchResults([]); return; }
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/store/students/search?q=${q}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) setSearchResults(res.data.students);
        } catch (err) { /* ignore */ }
    };

    const selectPerson = (person) => {
        setSelectedPerson(person);
        setSearchResults([]);
        setPersonSearch(person.name);
    };

    const addToCart = (item) => {
        const existing = cart.find(c => c.item_id === item.id);
        if (existing) {
            if (existing.quantity >= item.quantity) return toast.error('Not enough stock');
            setCart(cart.map(c => c.item_id === item.id ? { ...c, quantity: c.quantity + 1, total_amount: (c.quantity + 1) * c.unit_price } : c));
        } else {
            if (item.quantity <= 0) return toast.error('Out of stock');
            setCart([...cart, { item_id: item.id, item_name: item.item_name, quantity: 1, unit_price: parseFloat(item.selling_price), total_amount: parseFloat(item.selling_price) }]);
        }
    };

    const updateCartQty = (itemId, qty) => {
        if (qty <= 0) { setCart(cart.filter(c => c.item_id !== itemId)); return; }
        const invItem = inventory.find(i => i.id === itemId);
        if (qty > invItem?.quantity) return toast.error('Not enough stock');
        setCart(cart.map(c => c.item_id === itemId ? { ...c, quantity: qty, total_amount: qty * c.unit_price } : c));
    };

    const removeFromCart = (itemId) => setCart(cart.filter(c => c.item_id !== itemId));

    // Calculate Totals based on GST Type
    const itemsSum = cart.reduce((a, c) => a + c.total_amount, 0);
    let subtotal = itemsSum;
    let gstAmount = 0;
    let grandTotal = itemsSum;

    if (gstType === 'inclusive') {
        const gstPct = isCustomGst ? (parseFloat(customGst) || 0) : gstPercentage;
        grandTotal = itemsSum;
        const base = grandTotal / (1 + (gstPct / 100));
        gstAmount = grandTotal - base;
        subtotal = base;
    } else if (gstType === 'exclusive') {
        const gstPct = isCustomGst ? (parseFloat(customGst) || 0) : gstPercentage;
        subtotal = itemsSum;
        gstAmount = subtotal * (gstPct / 100);
        grandTotal = subtotal + gstAmount;
    }

    // formatting
    gstAmount = parseFloat(gstAmount.toFixed(2));
    subtotal = parseFloat(subtotal.toFixed(2));
    grandTotal = parseFloat(grandTotal.toFixed(2));

    const handleCheckout = async () => {
        if (cart.length === 0) return toast.error('Cart is empty');
        if (paymentStatus === 'pending' && !selectedPerson) return toast.error('Please select a student or teacher for pending payments');
        setProcessing(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/api/store/stores/${storeSlug}/transactions`, {
                items: cart,
                student_id: selectedPerson?.id,
                student_name: selectedPerson?.name || 'Walk-in Customer',
                class_name: selectedPerson?.buyer_type === 'student' ? `${selectedPerson.class || ''} ${selectedPerson.section || ''}`.trim() : '',
                payment_method: paymentMethod,
                payment_status: paymentStatus,
                buyer_type: selectedPerson?.buyer_type || 'student',
                gst_percentage: isCustomGst ? (parseFloat(customGst) || 0) : gstPercentage,
                gst_type: gstType,
                notes: ''
            }, { headers: { Authorization: `Bearer ${token}` } });

            if (res.data.success) {
                toast.success(res.data.message);
                setBillPreview(res.data.bill);
                // Auto-download bill
                autoDownloadBill(res.data.bill);
                setCart([]);
                setSelectedPerson(null);
                setPersonSearch('');
                fetchInventory();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Checkout failed');
        } finally { setProcessing(false); }
    };

    const autoDownloadBill = async (bill) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/store/bills/${bill.bill_number}/download`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${bill.bill_number}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('Bill PDF downloaded!');
        } catch (e) {
            console.error('Auto-download error:', e);
            toast.error('PDF download failed');
        }
    };

    const handlePrintBill = () => {
        if (!billPreview) return;
        autoDownloadBill(billPreview);
    };

    const filteredInventory = inventory.filter(i =>
        i.item_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (i.category || '').toLowerCase().includes(searchFilter.toLowerCase())
    );

    if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">🛒 POS & Billing — {storeName}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left: Product List */}
                <div className="lg:col-span-2 space-y-3">
                    <input value={searchFilter} onChange={e => setSearchFilter(e.target.value)} placeholder="🔍 Search items..." className="w-full border rounded-lg px-4 py-2.5 text-sm" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[65vh] overflow-y-auto">
                        {filteredInventory.map(item => (
                            <button key={item.id} onClick={() => addToCart(item)}
                                className={`bg-white rounded-xl p-3 shadow-sm border text-left hover:shadow-md hover:border-blue-300 transition-all ${item.quantity <= 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                disabled={item.quantity <= 0}>
                                <p className="font-medium text-sm text-gray-900 truncate">{item.item_name}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{item.category || 'General'}</p>
                                <div className="flex items-center justify-between mt-2">
                                    <p className="font-bold text-blue-600">₹{parseFloat(item.selling_price).toLocaleString('en-IN')}</p>
                                    <span className={`text-xs px-1.5 py-0.5 rounded ${item.quantity <= item.low_stock_threshold ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                        {item.quantity} left
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Cart & Checkout */}
                <div className="bg-white rounded-xl shadow-lg border p-4 space-y-4 h-fit sticky top-4">
                    <h3 className="font-bold text-lg border-b pb-2">🧾 Cart</h3>

                    {/* Person Search (Students + Teachers) */}
                    <div className="relative">
                        <input value={personSearch} onChange={e => searchPeople(e.target.value)}
                            placeholder="🔍 Search student or teacher..."
                            className="w-full border rounded-lg px-3 py-2 text-sm" />
                        {searchResults.length > 0 && (
                            <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                                {searchResults.map(s => (
                                    <button key={`${s.buyer_type}-${s.id}`} onClick={() => selectPerson(s)}
                                        className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm border-b last:border-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${s.buyer_type === 'teacher' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {s.buyer_type === 'teacher' ? '👨‍🏫' : '🎓'}
                                            </span>
                                            <div>
                                                <span className="font-medium">{s.name}</span>
                                                <span className="text-gray-400 ml-1 text-xs">• {s.detail}</span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                        {selectedPerson && (
                            <div className="mt-1 flex items-center gap-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${selectedPerson.buyer_type === 'teacher' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {selectedPerson.buyer_type === 'teacher' ? '👨‍🏫' : '🎓'} {selectedPerson.name} • {selectedPerson.detail}
                                </span>
                                <button onClick={() => { setSelectedPerson(null); setPersonSearch(''); if (paymentStatus === 'pending') setPaymentStatus('paid'); }} className="text-red-400 text-xs hover:text-red-600">✕</button>
                            </div>
                        )}
                    </div>

                    {/* Cart Items */}
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {cart.length === 0 ? (
                            <p className="text-center text-gray-400 text-sm py-4">Cart is empty</p>
                        ) : cart.map(c => (
                            <div key={c.item_id} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{c.item_name}</p>
                                    <p className="text-xs text-gray-400">₹{c.unit_price} × {c.quantity}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => updateCartQty(c.item_id, c.quantity - 1)} className="w-6 h-6 bg-gray-200 rounded text-sm font-bold hover:bg-gray-300">−</button>
                                    <span className="w-8 text-center text-sm font-semibold">{c.quantity}</span>
                                    <button onClick={() => updateCartQty(c.item_id, c.quantity + 1)} className="w-6 h-6 bg-gray-200 rounded text-sm font-bold hover:bg-gray-300">+</button>
                                    <button onClick={() => removeFromCart(c.item_id)} className="ml-1 text-red-400 hover:text-red-600 text-sm">🗑</button>
                                </div>
                                <p className="font-semibold text-sm ml-2 w-16 text-right">₹{c.total_amount.toLocaleString('en-IN')}</p>
                            </div>
                        ))}
                    </div>

                    {/* Payment Method - Hidden if Pending */}
                    {paymentStatus !== 'pending' && (
                        <div>
                            <label className="text-xs font-medium text-gray-500">Payment Method</label>
                            <div className="flex gap-2 mt-1">
                                {['cash', 'upi', 'card'].map(m => (
                                    <button key={m} onClick={() => setPaymentMethod(m)}
                                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${paymentMethod === m ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                                        {m === 'cash' ? '💵' : m === 'upi' ? '📱' : '💳'} {m.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Payment Status */}
                    <div>
                        <label className="text-xs font-medium text-gray-500">Payment Status</label>
                        <div className="flex gap-2 mt-1">
                            <button onClick={() => setPaymentStatus('paid')}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold border-2 transition-all ${paymentStatus === 'paid' ? 'bg-green-50 text-green-700 border-green-500 shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
                                ✅ Paid Now
                            </button>
                            <button onClick={() => { if (!selectedPerson) { toast.error('Select a student or teacher first'); return; } setPaymentStatus('pending'); }}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold border-2 transition-all ${paymentStatus === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-500 shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
                                🕐 Add to Pending
                            </button>
                        </div>
                        {paymentStatus === 'pending' && (
                            <p className="text-xs text-amber-600 mt-1 bg-amber-50 rounded px-2 py-1 border border-amber-100">
                                ⚠️ Amount will be added to {selectedPerson?.buyer_type === 'teacher' ? "teacher's" : "student's"} pending dues.
                            </p>
                        )}
                    </div>

                    {/* GST Section */}
                    <div className="border-t pt-3">
                        <label className="text-xs font-medium text-gray-500 mb-2 block">GST Mode</label>
                        <div className="flex gap-2 mb-3">
                            {['none', 'inclusive', 'exclusive'].map(type => (
                                <button key={type} onClick={() => setGstType(type)}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${gstType === type
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                                    {type === 'none' ? 'No GST' : type.charAt(0).toUpperCase() + type.slice(1)}
                                </button>
                            ))}
                        </div>

                        {gstType !== 'none' && (
                            <div className="space-y-2">
                                <div className="flex gap-1.5 overflow-x-auto pb-1">
                                    {[5, 12, 18, 28].map(p => (
                                        <button key={p}
                                            onClick={() => { setGstPercentage(p); setIsCustomGst(false); }}
                                            className={`flex-1 min-w-[40px] py-1.5 rounded-lg text-xs font-medium border transition-all ${!isCustomGst && gstPercentage === p
                                                ? 'bg-indigo-100 text-indigo-700 border-indigo-200 ring-1 ring-indigo-500'
                                                : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                                            {p}%
                                        </button>
                                    ))}
                                    <button onClick={() => setIsCustomGst(true)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${isCustomGst
                                            ? 'bg-indigo-100 text-indigo-700 border-indigo-200 ring-1 ring-indigo-500'
                                            : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                                        Custom
                                    </button>
                                </div>
                                {isCustomGst && (
                                    <div className="flex items-center gap-2">
                                        <input type="number"
                                            value={customGst}
                                            onChange={e => setCustomGst(e.target.value)}
                                            placeholder="Enter %"
                                            className="w-full border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            autoFocus
                                        />
                                        <span className="text-sm text-gray-500">%</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Total & Checkout */}
                    <div className="border-t pt-3 bg-gray-50 -mx-4 px-4 pb-2 rounded-b-xl">
                        <div className="space-y-1 mb-3">
                            <div className="flex justify-between items-center text-sm text-gray-600">
                                <span>Subtotal:</span>
                                <span className="font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
                            </div>
                            {gstType !== 'none' && (
                                <div className="flex justify-between items-center text-sm text-indigo-600">
                                    <span>GST ({isCustomGst ? (customGst || 0) : gstPercentage}% {gstType === 'inclusive' ? 'Inc.' : 'Exc.'}):</span>
                                    <span className="font-semibold">+ ₹{gstAmount.toLocaleString('en-IN')}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
                                <span className="text-lg font-bold text-gray-800">Total:</span>
                                <span className="text-2xl font-bold text-green-600">₹{grandTotal.toLocaleString('en-IN')}</span>
                            </div>
                        </div>


                        <button onClick={handleCheckout} disabled={processing || cart.length === 0}
                            className={`w-full py-3 font-bold rounded-xl transition-all disabled:opacity-50 text-lg shadow-lg text-white ${paymentStatus === 'pending'
                                ? 'bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800'
                                : 'bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800'}`}>
                            {processing ? 'Processing...' : paymentStatus === 'pending' ? '🕐 Record Pending Sale' : '✅ Complete Sale'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Bill Preview Modal */}
            {billPreview && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900">🧾 Bill Generated & Saved</h2>
                                <button onClick={() => setBillPreview(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                            </div>

                            {/* Bill Preview Content */}
                            <div ref={billRef} className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50">
                                <div className="text-center border-b-2 border-dashed border-gray-400 pb-3 mb-3">
                                    <h3 className="text-lg font-bold">{storeName}</h3>
                                    <p className="text-xs text-gray-500 mt-1">Store Purchase Receipt</p>
                                    <p className="text-xs font-mono text-gray-600 mt-1">{billPreview.bill_number}</p>
                                    <p className="text-xs text-gray-500">{new Date(billPreview.date).toLocaleString('en-IN')}</p>
                                </div>

                                <div className="text-sm mb-3 pb-3 border-b border-dashed border-gray-300">
                                    <p><span className="text-gray-500">Customer:</span> <strong>{billPreview.student_name}</strong></p>
                                    <p><span className="text-gray-500">Type:</span> <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${billPreview.buyer_type === 'teacher' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {billPreview.buyer_type === 'teacher' ? '👨‍🏫 Teacher' : '🎓 Student'}
                                    </span></p>
                                    {billPreview.class_name && <p><span className="text-gray-500">Class:</span> {billPreview.class_name}</p>}
                                </div>

                                <div className="space-y-1.5 mb-3 pb-3 border-b border-dashed border-gray-300">
                                    {billPreview.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <span className="flex-1">{item.item_name} × {item.quantity}</span>
                                            <span className="font-medium ml-2">₹{(item.total_amount || item.quantity * item.unit_price).toLocaleString('en-IN')}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t-2 border-dashed border-gray-400 pt-2 space-y-1">
                                    <div className="flex justify-between items-center text-sm text-gray-600">
                                        <span>Subtotal</span>
                                        <span className="font-semibold">₹{billPreview.subtotal.toLocaleString('en-IN')}</span>
                                    </div>
                                    {billPreview.gst_percentage > 0 && (
                                        <div className="flex justify-between items-center text-sm text-indigo-600">
                                            <span>GST ({billPreview.gst_percentage}%)</span>
                                            <span className="font-semibold">+ ₹{billPreview.gst_amount.toLocaleString('en-IN')}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center text-lg font-bold">
                                        <span>GRAND TOTAL</span>
                                        <span className="text-green-600">₹{billPreview.total_amount.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between text-xs text-gray-500 mt-2">
                                    <span>Method: {(billPreview.payment_method || 'cash').toUpperCase()}</span>
                                    <span className={`px-2 py-0.5 rounded-full font-bold ${billPreview.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {billPreview.payment_status === 'paid' ? '✅ PAID' : '🕐 PENDING'}
                                    </span>
                                </div>
                            </div>

                            <p className="text-xs text-green-600 mt-2 text-center">💾 Bill saved to server & auto-downloaded</p>

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-3">
                                <button onClick={handlePrintBill}
                                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all">
                                    🖨️ Download PDF Again
                                </button>
                                <button onClick={() => setBillPreview(null)}
                                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">
                                    ✓ Done
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StorePOS;
