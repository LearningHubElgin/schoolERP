import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { toast } from 'react-hot-toast';
import { Download, CreditCard, FileText, Printer } from 'lucide-react';

const API_BASE = API_URL;

const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
};

const generateQRDataURL = (data) => {
    const text = typeof data === 'object'
        ? `ID: ${data.card_number || 'N/A'}\nName: ${data.student_name || 'N/A'}\nClass: ${data.class_name || ''}-${data.section_name || ''}\nRoll: ${data.roll_no || ''}\nFather: ${data.father_name || ''}\nPhone: ${data.phone || ''}\nDOB: ${data.dob ? new Date(data.dob).toLocaleDateString('en-GB') : ''}`
        : `ID: ${data}`;
    const encoded = encodeURIComponent(text);
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encoded}&bgcolor=ffffff&color=1e3a8a&margin=2`;
};

const StudentIDCard = ({ data, school, idPrefix = "" }) => {
    if (!data || !school) return null;

    const studentName = data.student_name || data.name || "Demo Student";
    const cardNumber  = data.card_number || "N/A";
    const photoUrl    = data.photo || data.student_photo || "";
    const qrUrl       = generateQRDataURL(data);

    const CARD_W = '260px';
    const CARD_H = '460px';

    const cardBase = {
        width: CARD_W,
        height: CARD_H,
        borderRadius: '12px',
        position: 'relative',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        fontFamily: "'Inter', sans-serif",
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        border: '1px solid #e3eafc',
    };

    return (
        <div
            id={`${idPrefix}wrapper`}
            style={{
                display: 'flex', flexWrap: 'wrap', gap: '24px',
                alignItems: 'flex-start', justifyContent: 'center',
                padding: '24px', background: '#f1f5fb',
                borderRadius: '20px', border: '1.5px dashed #c5cae9'
            }}
        >
            {/* ========== FRONT SIDE ========== */}
            <div id={`${idPrefix}front`} style={cardBase}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 100%)',
                    padding: '10px 14px 20px',
                    borderBottomLeftRadius: '50% 18px',
                    borderBottomRightRadius: '50% 18px',
                    flexShrink: 0,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '48px', height: '48px',
                            background: 'white', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                            flexShrink: 0, overflow: 'hidden',
                            border: '2px solid #90caf9',
                        }}>
                            {school.logo
                                ? <img src={`${API_BASE}${school.logo}`} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} crossOrigin="anonymous" />
                                : <span style={{ fontSize: '10px', fontWeight: 900, color: '#1565c0', textAlign: 'center', lineHeight: '1.1' }}>LOGO</span>
                            }
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ color: 'white', fontWeight: 900, fontSize: '12px', lineHeight: '1.2', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                                {school.name || "School Name"}
                            </div>
                            <div style={{ color: '#bbdefb', fontSize: '7.5px', lineHeight: '1.3', marginTop: '2px' }}>
                                (Govt. Recognised)<br />
                                {school.address || "Place your address,"}<br />
                                District State and Pin - {school.pincode || "000000"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div style={{
                    background: 'white', flex: 1,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', padding: '8px 12px 6px',
                }}>
                    <div style={{
                        width: '70px', height: '85px',
                        border: '2px solid #1976d2', borderRadius: '4px',
                        overflow: 'hidden',
                        boxShadow: '0 2px 8px rgba(21,101,192,0.15)',
                        background: '#e8eef7',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '6px', flexShrink: 0,
                    }}>
                        {photoUrl
                            ? <img src={`${API_BASE}${photoUrl}`} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} crossOrigin="anonymous" />
                            : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#90aad4' }} />
                                    <div style={{ width: '40px', height: '20px', borderRadius: '20px 20px 0 0', background: '#90aad4', marginTop: '3px' }} />
                                </div>
                            )
                        }
                    </div>

                    <div style={{ fontSize: '13px', fontWeight: 900, color: '#1a237e', textAlign: 'center', marginBottom: '5px', letterSpacing: '0.3px' }}>
                        {studentName}
                    </div>

                    <div style={{ width: '100%', border: '1px solid #e3eafc', borderRadius: '6px', overflow: 'hidden', marginBottom: '5px', fontSize: '9px' }}>
                        {[
                            { label: "Father's Name", val: data.father_name || "N/A" },
                            { label: "Mother's Name", val: data.mother_name || "N/A" },
                            { label: "D.O.B.",         val: formatDate(data.dob || data.dateOfBirth) },
                            { label: "Contact No.",    val: data.phone || data.contact_no || "N/A" },
                        ].map((row, i) => (
                            <div key={i} style={{ display: 'flex', borderBottom: i < 3 ? '1px solid #e3eafc' : 'none', background: i % 2 === 0 ? 'white' : '#f5f8ff' }}>
                                <span style={{ width: '38%', padding: '3px 5px', fontWeight: 700, color: '#5c6bc0', borderRight: '1px solid #e3eafc', flexShrink: 0 }}>{row.label}</span>
                                <span style={{ padding: '3px 5px', fontWeight: 600, color: '#1a237e', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.val}</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ width: '100%', fontSize: '8px', color: '#37474f', lineHeight: '1.3', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, color: '#1565c0' }}>Add.: </span>
                        {data.address || school.address || "N/A"}
                    </div>

                    <div style={{ flex: 1 }} />
                    <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '5px 0 2px', borderTop: '1px dashed #c5cae9' }}>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: '#1a237e' }}>
                            Class : <span style={{ color: '#1565c0', fontStyle: 'italic' }}>{data.class_name || data.class || "1st"}</span>
                            {data.section_name
                                ? <span> | Sec: <span style={{ color: '#1565c0', fontStyle: 'italic' }}>{data.section_name}</span></span>
                                : null
                            }
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ background: 'linear-gradient(90deg, #0d47a1, #1565c0)', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: '#bbdefb', fontSize: '7px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
                        {school.name || "School Portal"}
                    </span>
                </div>
            </div>

            {/* ========== BACK SIDE ========== */}
            <div id={`${idPrefix}back`} style={cardBase}>
                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 100%)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', border: '2px solid #90caf9' }}>
                        {school.logo
                            ? <img src={`${API_BASE}${school.logo}`} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} crossOrigin="anonymous" />
                            : <span style={{ fontSize: '8px', fontWeight: 900, color: '#1565c0' }}>LOGO</span>
                        }
                    </div>
                    <div style={{ color: 'white', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.3px', lineHeight: '1.2' }}>
                        {school.name || "School Name"}
                    </div>
                </div>

                {/* Body */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '8px 12px', gap: '6px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '6px 0', borderBottom: '1px dashed #c5cae9', flexShrink: 0 }}>
                        <img
                            src={qrUrl}
                            alt="QR"
                            style={{ width: '70px', height: '70px', border: '1px solid #c5cae9', borderRadius: '4px', background: 'white', padding: '3px' }}
                            crossOrigin="anonymous"
                        />
                        <span style={{ fontSize: '10px', color: '#1a237e', fontWeight: 800, textAlign: 'center' }}>ID NO: {cardNumber}</span>
                    </div>

                    <div style={{ background: '#f5f8ff', borderRadius: '6px', border: '1px solid #e3eafc', padding: '6px 8px', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                            <span style={{ width: '5px', height: '5px', background: '#1565c0', borderRadius: '50%', flexShrink: 0 }}></span>
                            <span style={{ fontSize: '8.5px', fontWeight: 900, color: '#0d47a1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Instructions</span>
                        </div>
                        {[
                            'Identity card is mandatory for campus entry.',
                            'This card is non-transferable property.',
                            'Report loss of card immediately to the office.',
                        ].map((rule, i) => (
                            <div key={i} style={{ display: 'flex', gap: '4px', fontSize: '8px', color: '#37474f', lineHeight: '1.3', marginBottom: i < 2 ? '2px' : 0 }}>
                                <span style={{ fontWeight: 700, color: '#1565c0', flexShrink: 0 }}>•</span>
                                <span>{rule}</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ borderTop: '1px dashed #c5cae9', paddingTop: '6px', display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', flexShrink: 0 }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2px' }}>
                                {school.principal_signature
                                    ? <img src={`${API_BASE}${school.principal_signature}`} alt="Signature" style={{ height: '100%', objectFit: 'contain' }} crossOrigin="anonymous" />
                                    : <span style={{ fontFamily: '"Dancing Script", cursive', fontSize: '18px', color: '#1a237e', fontStyle: 'italic' }}>Principal</span>
                                }
                            </div>
                            <div style={{ fontSize: '7px', fontWeight: 800, color: '#90a4ae', textTransform: 'uppercase', letterSpacing: '1px', borderTop: '1px solid #e0e0e0', paddingTop: '2px' }}>
                                Authorized Sign
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ background: 'linear-gradient(90deg, #0d47a1, #1565c0)', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: '#bbdefb', fontSize: '7px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
                        {school.name || "School Portal"}
                    </span>
                </div>
            </div>
        </div>
    );
};


// ─────────────────────────────────────────────────────────────────────────────
// imgToBase64
// Converts a loaded <img> element into an inline base64 PNG data URL.
// Required so images render correctly in the isolated print window
// (avoids CORS failures when the browser requests them again cross-origin).
// ─────────────────────────────────────────────────────────────────────────────
const imgToBase64 = (imgEl) =>
    new Promise((resolve) => {
        try {
            const c   = document.createElement('canvas');
            c.width   = imgEl.naturalWidth  || imgEl.offsetWidth  || 100;
            c.height  = imgEl.naturalHeight || imgEl.offsetHeight || 100;
            c.getContext('2d').drawImage(imgEl, 0, 0);
            resolve(c.toDataURL('image/png'));
        } catch {
            resolve(imgEl.src); // fallback: keep original URL
        }
    });

// ─────────────────────────────────────────────────────────────────────────────
// cloneCardForPrint
// Deep-clones a card element, embeds all images as base64, and removes the
// fixed-height / overflow:hidden constraints so nothing is clipped in print.
// Returns an outerHTML string ready to inject into a print window.
// ─────────────────────────────────────────────────────────────────────────────
const cloneCardForPrint = async (el) => {
    const clone = el.cloneNode(true);

    // Remove the fixed height + overflow so content is never clipped
    clone.style.height   = 'auto';
    clone.style.overflow = 'visible';
    clone.style.boxShadow = 'none';

    // Replace every <img> src with its base64 equivalent
    const origImgs  = [...el.querySelectorAll('img')];
    const cloneImgs = [...clone.querySelectorAll('img')];
    await Promise.all(
        origImgs.map(async (img, i) => {
            cloneImgs[i].src = await imgToBase64(img);
            cloneImgs[i].removeAttribute('crossorigin');
        })
    );

    return clone.outerHTML;
};


const StudentCards = () => {
    const [cards,   setCards]   = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchCards(); }, []);

    const fetchCards = async () => {
        try {
            const token = localStorage.getItem('token');
            const res   = await fetch(`${API_BASE}/api/student/cards`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setCards(data.cards);
            } else {
                toast.error(data.message || 'Failed to fetch cards');
            }
        } catch (err) {
            console.error('Fetch cards error:', err);
            toast.error('Server error');
        } finally {
            setLoading(false);
        }
    };

    // ── Shared canvas-clone helper — used only by downloadCard ───────────────
    const captureWithClone = async (el) => {
        const clone = el.cloneNode(true);
        Object.assign(clone.style, {
            position: 'fixed', top: '-99999px', left: '-99999px',
            zIndex: '-1', width: el.offsetWidth + 'px',
            height: 'auto', overflow: 'visible',
        });
        document.body.appendChild(clone);

        const imgs = [...clone.querySelectorAll('img')];
        await Promise.all(imgs.map(img =>
            img.complete && img.naturalHeight !== 0
                ? Promise.resolve()
                : new Promise(r => { img.onload = r; img.onerror = r; })
        ));
        await new Promise(r => setTimeout(r, 200));

        const canvas = await html2canvas(clone, {
            scale: 3, useCORS: true, allowTaint: true,
            backgroundColor: '#ffffff', logging: false,
            scrollX: 0, scrollY: 0,
        });
        document.body.removeChild(clone);
        return canvas;
    };

    // ── Download as PDF ───────────────────────────────────────────────────────
    const downloadCard = async (cardId, studentName) => {
        const frontEl = document.getElementById(`student-card-${cardId}-front`);
        const backEl  = document.getElementById(`student-card-${cardId}-back`);
        if (!frontEl || !backEl) { toast.error('Card not found'); return; }

        try {
            toast.loading('Generating PDF…', { id: 'download' });

            const allImgs = [...frontEl.querySelectorAll('img'), ...backEl.querySelectorAll('img')];
            await Promise.all(allImgs.map(img =>
                img.complete && img.naturalHeight !== 0
                    ? Promise.resolve()
                    : new Promise(r => { img.onload = r; img.onerror = r; })
            ));
            await new Promise(r => setTimeout(r, 400));

            const frontCanvas = await captureWithClone(frontEl);
            const backCanvas  = await captureWithClone(backEl);

            const pdfW   = 75;
            const margin = 5;
            const frontH = pdfW * (frontCanvas.height / frontCanvas.width);
            const backH  = pdfW * (backCanvas.height  / backCanvas.width);

            const { jsPDF } = await import('jspdf');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [pdfW + margin * 2, frontH + margin * 2] });
            pdf.addImage(frontCanvas.toDataURL('image/png'), 'PNG', margin, margin, pdfW, frontH);
            pdf.addPage([pdfW + margin * 2, backH + margin * 2], 'portrait');
            pdf.addImage(backCanvas.toDataURL('image/png'), 'PNG', margin, margin, pdfW, backH);

            pdf.save(`${studentName}-ID-Card.pdf`);
            toast.success('PDF Downloaded!', { id: 'download' });
        } catch (err) {
            console.error('Download error:', err);
            toast.error('Failed to download', { id: 'download' });
        }
    };

    // ── Print Card ────────────────────────────────────────────────────────────
    //
    // ROOT CAUSE of the original bug
    // ─────────────────────────────
    // The old approach used html2canvas to rasterise the card into a <canvas>,
    // then placed that bitmap image inside the print window.
    // html2canvas converts DOM text → pixels, so in the print window:
    //   • Fonts rendered at screen resolution → blurry at print DPI
    //   • Flex / absolute positioning calculated at screen viewport
    //     → text and elements shifted when placed inside a different window
    //
    // The fix (same philosophy as MyPayslipsPage which works perfectly)
    // ─────────────────────────────────────────────────────────────────
    // Clone the card's real HTML (all inline styles are already embedded),
    // embed every <img> as a base64 data URL (avoids CORS in the new window),
    // lift the fixed-height/overflow constraint so nothing is clipped,
    // then inject that raw HTML string into the print window.
    // The browser lays out real DOM with real fonts → pixel-perfect text.
    //
    const printCard = async (cardId, studentName) => {
        const frontEl = document.getElementById(`student-card-${cardId}-front`);
        const backEl  = document.getElementById(`student-card-${cardId}-back`);
        if (!frontEl || !backEl) { toast.error('Card not found'); return; }

        try {
            toast.loading('Preparing print…', { id: 'print' });

            // Wait for all original images to finish loading
            const allImgs = [...frontEl.querySelectorAll('img'), ...backEl.querySelectorAll('img')];
            await Promise.all(allImgs.map(img =>
                img.complete && img.naturalHeight !== 0
                    ? Promise.resolve()
                    : new Promise(r => { img.onload = r; img.onerror = r; })
            ));

            // Produce clean HTML strings with base64 images
            const frontHTML = await cloneCardForPrint(frontEl);
            const backHTML  = await cloneCardForPrint(backEl);

            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                toast.error('Pop-up blocked — please allow pop-ups and retry.', { id: 'print' });
                return;
            }

            printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>ID Card — ${studentName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=Dancing+Script:wght@700&display=swap" rel="stylesheet"/>
  <style>
    *, *::before, *::after {
      margin: 0; padding: 0; box-sizing: border-box;
      /* preserve gradients and background colours when printing */
      -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
    }
    body {
      background: #f0f4ff;
      font-family: 'Inter', sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 28px 20px;
      gap: 14px;
      min-height: 100vh;
    }
    .page-title {
      font-size: 12px; font-weight: 800;
      color: #1a237e; letter-spacing: 2.5px;
      text-transform: uppercase;
    }
    .cards-row {
      display: flex; gap: 28px;
      flex-wrap: wrap; justify-content: center;
      align-items: flex-start;
    }
    .card-wrap {
      display: flex; flex-direction: column;
      align-items: center; gap: 7px;
    }
    .card-label {
      font-size: 9px; font-weight: 700;
      color: #5c6bc0; letter-spacing: 2px;
      text-transform: uppercase;
    }
    /*
     * KEY FIX: the cloneCardForPrint helper already sets height:auto
     * and overflow:visible on the top-level card div, but add this as
     * a safety net in case any nested element still has a height constraint.
     */
    .card-wrap > div,
    .card-wrap > div * {
      max-height: none !important;
    }
    .card-wrap > div {
      height: auto   !important;
      overflow: visible !important;
    }
    /* Screen-only buttons */
    .btn-row { display: flex; gap: 12px; margin-top: 10px; }
    .btn {
      padding: 10px 28px; border: none; border-radius: 8px;
      font-family: 'Inter', sans-serif; font-size: 12px;
      font-weight: 800; letter-spacing: 1.5px;
      text-transform: uppercase; cursor: pointer;
    }
    .btn-print { background: #0d47a1; color: white; }
    .btn-close  { background: #e53935; color: white; }

    @media print {
      body { background: white !important; padding: 8mm 5mm; }
      .btn-row    { display: none !important; }
      .page-title { margin-bottom: 4mm; font-size: 10px; }
      .cards-row  { gap: 12mm; }
    }
  </style>
</head>
<body>
  <p class="page-title">Identity Card — ${studentName}</p>
  <div class="cards-row">
    <div class="card-wrap">
      <span class="card-label">&#9658; Front Side</span>
      ${frontHTML}
    </div>
    <div class="card-wrap">
      <span class="card-label">&#9658; Back Side</span>
      ${backHTML}
    </div>
  </div>
  <div class="btn-row">
    <button class="btn btn-print" onclick="window.print()">&#128424;&#65039; Print Now</button>
    <button class="btn btn-close"  onclick="window.close()">&#10005; Close</button>
  </div>
  <script>
    // Wait for Google Fonts to load before auto-triggering print
    // so text renders with the correct Inter typeface, not a fallback.
    document.fonts.ready.then(function() {
      setTimeout(function() { window.print(); }, 800);
    });
  <\/script>
</body>
</html>`);

            printWindow.document.close();
            toast.success('Print window opened!', { id: 'print' });
        } catch (err) {
            console.error('Print error:', err);
            toast.error('Failed to print', { id: 'print' });
        }
    };

    const handleAction = (card) => {
        window.open(`${API_BASE}${card.file_path}`, '_blank');
    };

    const getIcon = (type) => {
        switch (type) {
            case 'Identity Card': return <CreditCard className="w-8 h-8 text-blue-600" />;
            case 'Library Card':  return <FileText className="w-8 h-8 text-emerald-600" />;
            case 'Admit Card':    return <FileText className="w-8 h-8 text-indigo-600" />;
            default:              return <FileText className="w-8 h-8 text-slate-400" />;
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20">

            {/* ── Page Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">💳 My Digital Repo</h1>
                    <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-wider">
                        Access your verified identity &amp; academic documents
                    </p>
                </div>
                <Badge variant="info" className="hidden md:flex px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                    Verified Portal
                </Badge>
            </div>

            {/* ── Loading ── */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent shadow-md" />
                    <p className="text-sm font-black text-blue-600 uppercase tracking-widest animate-pulse">Syncing Cryptography…</p>
                </div>

            /* ── Empty ── */
            ) : cards.length === 0 ? (
                <div className="text-center py-24 bg-white/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-200">
                    <div className="bg-gray-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">📭</div>
                    <p className="text-lg font-black text-gray-800 uppercase tracking-tight">Vault Empty</p>
                    <p className="text-sm text-gray-400 font-medium mt-1">No digital cards have been issued to your account yet.</p>
                </div>

            /* ── Cards ── */
            ) : (
                <div className="space-y-16">

                    {/* Identity Cards */}
                    {cards.filter(c => c.card_type === 'Identity Card').map(card => (
                        <div key={card.id} className="space-y-6">

                            <div className="flex items-center gap-3 px-4">
                                <div className="w-2 h-8 bg-blue-600 rounded-full" />
                                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Digital Identity Card</h2>
                            </div>

                            <div className="bg-white/40 backdrop-blur-xl p-8 md:p-12 rounded-[50px] border border-white/40 shadow-2xl ring-1 ring-black/5 flex flex-col items-center gap-6 overflow-hidden">

                                <StudentIDCard
                                    data={{ ...card, name: card.student_name, photo_path: card.student_photo }}
                                    school={{
                                        name:                card.school_name,
                                        logo:                card.school_logo,
                                        address:             card.school_address,
                                        phone:               card.school_phone,
                                        email:               card.school_email,
                                        pincode:             card.school_pincode,
                                        principal_signature: card.principal_signature
                                    }}
                                    idPrefix={`student-card-${card.id}-`}
                                />

                                {/* ── Action Buttons ── */}
                                <div className="flex flex-wrap items-center justify-center gap-3 mt-2">

                                    {/* 🖨 Print — HTML injection, crisp vector text */}
                                    <button
                                        onClick={() => printCard(card.id, card.student_name)}
                                        className="flex items-center gap-2 px-6 py-3 bg-blue-700 hover:bg-blue-800 active:scale-95 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg transition-all duration-200"
                                    >
                                        <Printer size={15} />
                                        Print Card
                                    </button>

                                    {/* ⬇ Download PDF — canvas approach */}
                                    <button
                                        onClick={() => downloadCard(card.id, card.student_name)}
                                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-black active:scale-95 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg transition-all duration-200"
                                    >
                                        <Download size={15} />
                                        Download PDF
                                    </button>

                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Other Academic Documents */}
                    {cards.filter(c => c.card_type !== 'Identity Card').length > 0 && (
                        <div className="space-y-8">
                            <div className="flex items-center gap-3 px-4">
                                <div className="w-2 h-8 bg-emerald-600 rounded-full" />
                                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Other Academic Documents</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {cards.filter(c => c.card_type !== 'Identity Card').map(card => (
                                    <Card key={card.id} className="group overflow-hidden border-none shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-white/80 backdrop-blur-sm ring-1 ring-gray-100">
                                        <div className="p-1">
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-blue-50 transition-colors shadow-inner">
                                                    {getIcon(card.card_type)}
                                                </div>
                                                <Badge variant="info" className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5">{card.card_type}</Badge>
                                            </div>
                                            <div className="space-y-1 mb-8">
                                                <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{card.title}</h3>
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-2">
                                                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                                    SECURED: {new Date(card.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleAction(card)}
                                                className="w-full relative overflow-hidden group/btn flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                                                <span className="relative z-10 flex items-center gap-2">
                                                    <Download size={18} />
                                                    Download File
                                                </span>
                                            </button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="mt-12 text-center">
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">
                    School ERP • Secured Document Repository
                </p>
            </div>
        </div>
    );
};

export default StudentCards;