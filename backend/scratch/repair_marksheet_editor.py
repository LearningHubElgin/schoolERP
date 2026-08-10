import sys

file_path = r'c:\Users\learn\OneDrive\Desktop\school erp 30-03-2026\src\pages\admin\MarksheetTemplateEditor.jsx'

with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

# Header: Lines 1-608 (index 0 to 607)
header = lines[:608]

# Resume: From "Main Editor" comment onwards
resume_index = -1
for i in range(len(lines)):
    if 'Main Editor: Sidebar + Config + Preview' in lines[i]:
        resume_index = i
        break

if resume_index == -1:
    print("Could not find resume point")
    sys.exit(1)

footer = lines[resume_index:]

middle = [
    "                const x = ml + sp * (i + 1);\n",
    "                pdf.setDrawColor(0, 0, 0); pdf.setLineWidth(0.3); pdf.line(x - 25, y + 12, x + 25, y + 12);\n",
    "                pdf.setFontSize(9); pdf.setTextColor(80, 80, 80); pdf.text(label, x, y + 17, { align: 'center' });\n",
    "            }); y += 22;\n",
    "        }\n",
    "        if (c.footer.footerText) { pdf.setFontSize(8); pdf.setTextColor(120, 120, 120); pdf.text(c.footer.footerText, pageWidth / 2, y, { align: 'center' }); y += 4; }\n",
    "        if (c.footer.showDate) { pdf.setFontSize(8); pdf.setTextColor(120, 120, 120); pdf.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, pageWidth / 2, y, { align: 'center' }); }\n",
    "\n",
    "        return pdf;\n",
    "    }, [config, schoolLogoBase64]);\n",
    "\n",
    "    const updatePreview = useCallback(async () => {\n",
    "        try {\n",
    "            const pdf = await buildPDF();\n",
    "            const dataUri = pdf.output('datauristring');\n",
    "            setPreviewUrl(dataUri);\n",
    "        } catch (e) { console.error('Preview error:', e); }\n",
    "    }, [buildPDF]);\n",
    "\n",
    "    const generateSamplePreviews = useCallback(async () => {\n",
    "        const previews = {};\n",
    "        for (let i = 0; i < SAMPLE_TEMPLATES.length; i++) {\n",
    "            const s = SAMPLE_TEMPLATES[i];\n",
    "            try {\n",
    "                const pdf = await buildPDF(s.config);\n",
    "                previews[i] = pdf.output('datauristring');\n",
    "            } catch (e) { console.error('Sample preview error:', e); }\n",
    "        }\n",
    "        setSamplePreviews(previews);\n",
    "    }, [buildPDF]);\n",
    "\n",
    "    useEffect(() => { generateSamplePreviews(); }, []);\n",
    "\n",
    "    const downloadPreviewPDF = async () => {\n",
    "        const pdf = await buildPDF();\n",
    "        const blob = pdf.output('blob');\n",
    "        const url = URL.createObjectURL(blob);\n",
    "        window.open(url, '_blank');\n",
    "    };\n",
    "\n",
    "    const editorSections = [\n",
    "        { id: 'header', label: '🏫 Header' }, { id: 'studentFields', label: '👤 Student Info' },\n",
    "        { id: 'marksColumns', label: '📊 Marks Columns' }, { id: 'summary', label: '📋 Summary' },\n",
    "        { id: 'footer', label: '📝 Footer' }, { id: 'styling', label: '🎨 Styling' }, { id: 'page', label: '📄 Page' },\n",
    "    ];\n",
    "\n",
    "    if (loading) {\n",
    "        return (<div className=\"flex items-center justify-center h-96\"><div className=\"text-center\"><div className=\"animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto\"></div><p className=\"mt-4 text-slate-600\">Loading templates...</p></div></div>);\n",
    "    }\n",
    "\n",
    "    return (\n",
    "        <div className=\"space-y-3\">\n",
    "            <div className=\"flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-xl p-3 shadow-sm border border-slate-200\">\n",
    "                <div className=\"flex items-center gap-3\">\n",
    "                    <div className=\"p-2 bg-blue-50 text-blue-600 rounded-lg\">📋</div>\n",
    "                    <div>\n",
    "                        <h1 className=\"text-lg font-bold text-slate-800\">{editingTemplate ? `Editing: ${templateName}` : 'Create New Template'}</h1>\n",
    "                        <p className=\"text-slate-400 text-xs\">Configure your marksheet layout and design</p>\n",
    "                    </div>\n",
    "                </div>\n",
    "                <div className=\"flex items-center gap-3 flex-wrap\">\n",
    "                    <button onClick={downloadPreviewPDF} className=\"px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors\">🔗 Open PDF</button>\n",
    "                    <button onClick={saveTemplate} disabled={saving} className=\"px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50\">\n",
    "                        {saving ? '⏳ Saving...' : '💾 Save Template'}\n",
    "                    </button>\n",
    "                </div>\n",
    "            </div>\n",
    "\n",
    "            <Card className=\"p-3\">\n",
    "                <div className=\"flex gap-4 items-end flex-wrap\">\n",
    "                    <div className=\"flex-1 min-w-[200px]\">\n",
    "                        <label className=\"block text-sm font-semibold text-slate-700 mb-1\">Template Name *</label>\n",
    "                        <input type=\"text\" value={templateName} onChange={e => setTemplateName(e.target.value)} placeholder=\"e.g., Standard Marksheet\" className=\"w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none\" />\n",
    "                    </div>\n",
    "                    <label className=\"flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors\">\n",
    "                        <input type=\"checkbox\" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} className=\"w-4 h-4 text-blue-600 rounded\" />\n",
    "                        <span className=\"text-sm font-medium text-blue-700\">Set as Default</span>\n",
    "                    </label>\n",
    "                </div>\n",
    "            </Card>\n",
    "\n"
]

new_lines = header + middle + footer

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Repair completed successfully")
