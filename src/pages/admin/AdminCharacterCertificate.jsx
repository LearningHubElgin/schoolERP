import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, VerticalAlign, ImageRun, PageBorderDisplay, PageBorderOffsetFrom, PageBorderZOrder } from 'docx';
import { saveAs } from 'file-saver';

const AdminCharacterCertificate = () => {
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showCertificateModal, setShowCertificateModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [certificateHistory, setCertificateHistory] = useState([]);
    const [previewCertificate, setPreviewCertificate] = useState(null);
    const [filters, setFilters] = useState({
        class: '',
        stream: '',
        section: '',
        search: ''
    });
    const [classes, setClasses] = useState([]);
    const [streams, setStreams] = useState([]);
    const [availableStreams, setAvailableStreams] = useState([]);
    const [sections, setSections] = useState([]);
    const [filteredSections, setFilteredSections] = useState([]);
    const [schoolInfo, setSchoolInfo] = useState(null);
    const [certificateData, setCertificateData] = useState({
        purpose: '',
        conductRemarks: '',
        issuedDate: new Date().toISOString().split('T')[0],
        certificateNumber: '',
        remarks: ''
    });
    const [generating, setGenerating] = useState(false);
    const [certificateToCapture, setCertificateToCapture] = useState(null);
    
    const certificateRef = useRef();

    // Fetch initial data
    useEffect(() => {
        fetchInitialData();
    }, []);

    // Apply filters
    useEffect(() => {
        applyFilters();
    }, [students, filters]);

    // Fetch dynamic sections when class or stream changes
    useEffect(() => {
        if (filters.class) {
            fetchFilteredSections();
            fetchClassStreams();
        } else {
            setFilteredSections([]);
            setAvailableStreams([]);
            setFilters(prev => ({ ...prev, section: '', stream: '' }));
        }
    }, [filters.class, filters.stream]);

    const fetchClassStreams = async () => {
        try {
            const token = localStorage.getItem('token');
            const selectedClass = classes.find(c => String(c.class_number) === String(filters.class));
            if (!selectedClass) return;

            const res = await axios.get(`${API_URL}/api/admin/classes/${selectedClass.id}/streams`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                setAvailableStreams(res.data.streams);
            }
        } catch (error) {
            console.error('Error fetching class streams:', error);
        }
    };

    const fetchFilteredSections = async () => {
        try {
            const token = localStorage.getItem('token');
            const schoolId = localStorage.getItem('schoolId') || 1;
            
            const selectedClass = classes.find(c => String(c.class_number) === String(filters.class));
            if (!selectedClass) return;

            const res = await axios.get(`${API_URL}/api/admission/class-sections/${selectedClass.id}`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { 
                    school_id: schoolId,
                    stream_id: filters.stream || undefined
                }
            });

            if (res.data.success) {
                setFilteredSections(res.data.sections);
                if (filters.section && !res.data.sections.find(s => s.section_code === filters.section)) {
                    setFilters(prev => ({ ...prev, section: '' }));
                }
            }
        } catch (error) {
            console.error('Error fetching filtered sections:', error);
        }
    };

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch students with certificate counts
            const studentsRes = await axios.get(`${API_URL}/api/admin/students`, { headers });
            if (studentsRes.data.success) {
                const studentsWithCounts = await Promise.all(
                    studentsRes.data.students.map(async (student) => {
                        try {
                            const certRes = await axios.get(`${API_URL}/api/admin/character-certificates/count/${student.id}`, { headers });
                            return {
                                ...student,
                                character_certificate_count: certRes.data.count || 0
                            };
                        } catch {
                            return { ...student, character_certificate_count: 0 };
                        }
                    })
                );
                setStudents(studentsWithCounts);
                setFilteredStudents(studentsWithCounts);
            }

            // Fetch classes
            const classesRes = await axios.get(`${API_URL}/api/admin/classes`, { headers });
            if (classesRes.data.success) {
                setClasses(classesRes.data.classes);
            }

            // Fetch sections
            const sectionsRes = await axios.get(`${API_URL}/api/admin/sections`, { headers });
            if (sectionsRes.data.success) {
                setSections(sectionsRes.data.sections);
            }

            // Fetch streams
            const streamsRes = await axios.get(`${API_URL}/api/admin/streams`, { headers });
            if (streamsRes.data.success) {
                setStreams(streamsRes.data.streams);
            }

            // Fetch school info
            const schoolRes = await axios.get(`${API_URL}/api/auth/me`, { headers });
            if (schoolRes.data.success) {
                setSchoolInfo(schoolRes.data.school);
            }

            // Generate next certificate number
            await generateNextCertificateNumber();
        } catch (error) {
            console.error('Error fetching initial data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const generateNextCertificateNumber = async () => {
        try {
            const token = localStorage.getItem('token');
            const schoolId = localStorage.getItem('schoolId');
            const year = new Date().getFullYear();
            const res = await axios.get(`${API_URL}/api/admin/character-certificates/next-number`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { schoolId, year }
            });
            if (res.data.success) {
                setCertificateData(prev => ({
                    ...prev,
                    certificateNumber: res.data.certificateNumber
                }));
            }
        } catch (error) {
            const schoolId = localStorage.getItem('schoolId') || 'SCH';
            const year = new Date().getFullYear();
            const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            setCertificateData(prev => ({
                ...prev,
                certificateNumber: `CHAR-${schoolId}-${year}-${randomNum}`
            }));
        }
    };

    const applyFilters = () => {
        let filtered = [...students];

        if (filters.class) {
            filtered = filtered.filter(s => String(s.class) === String(filters.class));
        }
        if (filters.stream) {
            filtered = filtered.filter(s => String(s.stream_id) === String(filters.stream));
        }
        if (filters.section) {
            filtered = filtered.filter(s => s.section === filters.section);
        }
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(s => 
                s.name?.toLowerCase().includes(searchLower) ||
                s.roll_no?.toLowerCase().includes(searchLower) ||
                s.father_name?.toLowerCase().includes(searchLower)
            );
        }

        setFilteredStudents(filtered);
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleGenerateCertificate = (student) => {
        setSelectedStudent(student);
        setCertificateData(prev => ({
            ...prev,
            purpose: '',
            conductRemarks: '',
            issuedDate: new Date().toISOString().split('T')[0],
            remarks: ''
        }));
        generateNextCertificateNumber();
        setShowCertificateModal(true);
    };

    const handleViewHistory = async (student) => {
        setSelectedStudent(student);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/admin/character-certificates/history/${student.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setCertificateHistory(res.data.certificates);
                setShowHistoryModal(true);
            }
        } catch (error) {
            console.error('Error fetching certificate history:', error);
            toast.error('Failed to load certificate history');
        }
    };

    const handleViewCertificate = (certificate) => {
        setPreviewCertificate(certificate);
        setShowPreviewModal(true);
    };

    const handleViewDummyCertificate = () => {
        const dummyCert = {
            id: 'dummy',
            certificate_number: 'CHAR-SCH-YYYY-XXXX',
            student_name: '................................................',
            class: '........',
            section: '........',
            roll_no: '........',
            father_name: '................................................',
            mother_name: '................................................',
            purpose: '................................................',
            conduct_remarks: '................................................................................................',
            issued_date: new Date().toISOString(),
            remarks: '................................................'
        };
        setPreviewCertificate(dummyCert);
        setShowPreviewModal(true);
    };

    const generateCertificatePDF = async () => {
        if (generating) return;
        
        setGenerating(true);
        try {
            const token = localStorage.getItem('token');
            const schoolId = localStorage.getItem('schoolId');
            
            const saveRes = await axios.post(`${API_URL}/api/admin/character-certificates`, {
                studentId: selectedStudent.id,
                studentName: selectedStudent.name,
                class: selectedStudent.class,
                section: selectedStudent.section,
                rollNo: selectedStudent.roll_no,
                fatherName: selectedStudent.father_name,
                motherName: selectedStudent.mother_name,
                purpose: certificateData.purpose,
                conductRemarks: certificateData.conductRemarks,
                issuedDate: certificateData.issuedDate,
                certificateNumber: certificateData.certificateNumber,
                remarks: certificateData.remarks,
                school_id: schoolId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!saveRes.data.success) {
                throw new Error(saveRes.data.message || 'Failed to save certificate record');
            }

            const certData = {
                ...selectedStudent,
                student_name: selectedStudent.name,
                class: selectedStudent.class,
                section: selectedStudent.section,
                roll_no: selectedStudent.roll_no,
                father_name: selectedStudent.father_name,
                mother_name: selectedStudent.mother_name,
                purpose: certificateData.purpose,
                conduct_remarks: certificateData.conductRemarks,
                issued_date: certificateData.issuedDate,
                certificate_number: certificateData.certificateNumber,
                remarks: certificateData.remarks
            };
            
            setCertificateToCapture(certData);
            await new Promise(resolve => setTimeout(resolve, 500));

            if (!certificateRef.current) throw new Error("Template not ready");

            const canvas = await html2canvas(certificateRef.current, {
                scale: 3,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`Character_Certificate_${selectedStudent.roll_no}_${selectedStudent.name}.pdf`);

            toast.success('Character certificate generated and saved successfully!');
            setShowCertificateModal(false);
            setCertificateToCapture(null);
            
            fetchInitialData();
        } catch (error) {
            console.error('Error generating certificate:', error);
            toast.error(error.message || 'Failed to generate certificate');
        } finally {
            setGenerating(false);
        }
    };

    const downloadCertificate = async (certificate) => {
        if (generating) return;
        
        const loadingToast = toast.loading('Preparing PDF...');
        setGenerating(true);
        try {
            const token = localStorage.getItem('token');
            let certData;

            if (certificate.id === 'dummy') {
                certData = certificate;
            } else {
                const res = await axios.get(`${API_URL}/api/admin/character-certificates/download/${certificate.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.data.success) throw new Error('Failed to fetch certificate data');
                certData = res.data.certificate;
            }
            
            setCertificateToCapture(certData);
            await new Promise(resolve => setTimeout(resolve, 600));

            if (!certificateRef.current) throw new Error("Generator template not ready");

            const canvas = await html2canvas(certificateRef.current, {
                scale: 3,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`Character_Certificate_${certData.certificate_number}.pdf`);
            
            toast.success('Certificate downloaded successfully!', { id: loadingToast });
        } catch (error) {
            console.error('Error downloading certificate:', error);
            toast.error('Failed to download certificate', { id: loadingToast });
        } finally {
            setGenerating(false);
            setCertificateToCapture(null);
        }
    };

    const downloadCertificateAsWord = async (certificate) => {
        const loadingToast = toast.loading('Preparing Word document...');
        try {
            let certData;
            if (certificate.id === 'dummy') {
                certData = certificate;
            } else {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_URL}/api/admin/character-certificates/download/${certificate.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.data.success) throw new Error('Failed to fetch certificate data');
                certData = res.data.certificate;
            }

            const school = schoolInfo || { name: 'School Name', address: '', phone: '', email: '' };
            const formattedDate = new Date(certData.issued_date).toLocaleDateString('en-IN');

            // Fetch school logo if available
            let logoImageData = null;
            if (school.logo) {
                try {
                    const logoResponse = await fetch(`${API_URL}${school.logo}`);
                    const logoBlob = await logoResponse.blob();
                    logoImageData = await logoBlob.arrayBuffer();
                } catch (logoErr) {
                    console.warn('Could not fetch school logo for Word doc:', logoErr);
                }
            }

            const headerChildren = [];

            // Add logo if available
            if (logoImageData) {
                headerChildren.push(
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new ImageRun({
                                data: logoImageData,
                                transformation: { width: 80, height: 80 },
                            }),
                        ],
                        spacing: { after: 120 },
                    })
                );
            }

            // School name, address, contact
            headerChildren.push(
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: school.name.toUpperCase(), bold: true, size: 36, color: "2e7d32" })],
                    spacing: { after: 120 },
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: school.address, size: 20, color: "4b5563" })],
                    spacing: { after: 60 },
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: `Phone: ${school.phone} | Email: ${school.email}`, size: 20, color: "4b5563" })],
                    spacing: { after: 300 },
                })
            );

            const doc = new Document({
                sections: [{
                    properties: {
                        page: {
                            margin: {
                                top: 1440,
                                right: 1440,
                                bottom: 1440,
                                left: 1440,
                            },
                            borders: {
                                pageBorderTop: { style: BorderStyle.SINGLE, size: 12, color: "2e7d32", space: 24 },
                                pageBorderBottom: { style: BorderStyle.SINGLE, size: 12, color: "2e7d32", space: 24 },
                                pageBorderLeft: { style: BorderStyle.SINGLE, size: 12, color: "2e7d32", space: 24 },
                                pageBorderRight: { style: BorderStyle.SINGLE, size: 12, color: "2e7d32", space: 24 },
                            },
                        },
                    },
                    children: [
                        ...headerChildren,
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({ 
                                    text: 'CHARACTER CERTIFICATE', 
                                    bold: true, 
                                    size: 32, 
                                    color: "2e7d32",
                                    underline: { type: "single", color: "2e7d32" }
                                })
                            ],
                            spacing: { after: 400 },
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({ text: `Certificate No: ${certData.certificate_number}`, bold: true, size: 24 }),
                            ],
                            alignment: AlignmentType.RIGHT,
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({ text: `Date: ${formattedDate}`, size: 24 }),
                            ],
                            alignment: AlignmentType.RIGHT,
                            spacing: { after: 600 },
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({ text: `This is to certify that `, size: 28 }),
                                new TextRun({ text: certData.student_name, bold: true, size: 28 }),
                                new TextRun({ text: ` son/daughter of `, size: 28 }),
                                new TextRun({ text: certData.father_name || 'N/A', bold: true, size: 28 }),
                                new TextRun({ text: ` and `, size: 28 }),
                                new TextRun({ text: certData.mother_name || 'N/A', bold: true, size: 28 }),
                                new TextRun({ text: ` is a student of this institution.`, size: 28 }),
                            ],
                            spacing: { after: 300 },
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({ text: `He/She is studying in `, size: 28 }),
                                new TextRun({ text: `Class ${certData.class} Section ${certData.section}`, bold: true, size: 28 }),
                                new TextRun({ text: ` with Roll Number `, size: 28 }),
                                new TextRun({ text: certData.roll_no, bold: true, size: 28 }),
                                new TextRun({ text: `.`, size: 28 }),
                            ],
                            spacing: { after: 300 },
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({ text: `During the period of his/her study, the student has exhibited `, size: 28 }),
                                new TextRun({ text: `exemplary conduct, good moral character, and disciplined behavior`, bold: true, size: 28 }),
                                new TextRun({ text: `.`, size: 28 }),
                                ...(certData.conduct_remarks ? [
                                    new TextRun({ text: ` He/She has been particularly noted for: "`, size: 28 }),
                                    new TextRun({ text: certData.conduct_remarks, italics: true, size: 28 }),
                                    new TextRun({ text: `"`, size: 28 }),
                                ] : []),
                            ],
                            spacing: { after: 300 },
                        }),
                        ...(certData.purpose ? [
                            new Paragraph({
                                children: [
                                    new TextRun({ text: `This certificate is issued for the purpose of: `, size: 28 }),
                                    new TextRun({ text: certData.purpose, bold: true, size: 28 }),
                                ],
                                spacing: { after: 300 },
                            })
                        ] : []),
                        ...(certData.remarks ? [
                            new Paragraph({
                                children: [
                                    new TextRun({ text: `Remarks: `, size: 24, italics: true }),
                                    new TextRun({ text: certData.remarks, italics: true, size: 24 }),
                                ],
                                spacing: { after: 200 },
                            })
                        ] : []),
                        new Paragraph({ text: '', spacing: { before: 800 } }),
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            borders: {
                                top: { style: BorderStyle.NONE },
                                bottom: { style: BorderStyle.NONE },
                                left: { style: BorderStyle.NONE },
                                right: { style: BorderStyle.NONE },
                                insideHorizontal: { style: BorderStyle.NONE },
                                insideVertical: { style: BorderStyle.NONE },
                            },
                            rows: [
                                new TableRow({
                                    children: [
                                        new TableCell({
                                            children: [
                                                new Paragraph({
                                                    children: [new TextRun({ text: '____________________', size: 24 })],
                                                    alignment: AlignmentType.CENTER,
                                                }),
                                                new Paragraph({
                                                    children: [new TextRun({ text: 'Principal', bold: true, size: 24 })],
                                                    alignment: AlignmentType.CENTER,
                                                }),
                                                new Paragraph({
                                                    children: [new TextRun({ text: '(Signature)', size: 18 })],
                                                    alignment: AlignmentType.CENTER,
                                                }),
                                            ],
                                        }),
                                        new TableCell({
                                            children: [
                                                new Paragraph({
                                                    children: [new TextRun({ text: '____________________', size: 24 })],
                                                    alignment: AlignmentType.CENTER,
                                                }),
                                                new Paragraph({
                                                    children: [new TextRun({ text: 'Class Teacher', bold: true, size: 24 })],
                                                    alignment: AlignmentType.CENTER,
                                                }),
                                                new Paragraph({
                                                    children: [new TextRun({ text: '(Signature)', size: 18 })],
                                                    alignment: AlignmentType.CENTER,
                                                }),
                                            ],
                                        }),
                                    ],
                                }),
                            ],
                        }),
                        new Paragraph({ text: '', spacing: { before: 600 } }),
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [new TextRun({ text: `\u00a9 ${new Date().getFullYear()} ${school.name || 'School'} | All Rights Reserved`, size: 16, color: "9ca3af" })],
                        }),
                    ],
                }],
            });

            const blob = await Packer.toBlob(doc);
            saveAs(blob, `Character_Certificate_${certData.certificate_number}.docx`);
            toast.success('Word document downloaded!', { id: loadingToast });
        } catch (error) {
            console.error('Error generating Word document:', error);
            toast.error('Failed to generate Word document', { id: loadingToast });
        }
    };

    const CharacterCertificateTemplate = ({ data, school, showBorder = true }) => {
        if (!data || !school) return null;

        const formattedDate = new Date(data.issued_date || data.issuedDate).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        return (
            <div style={{
                width: '210mm',
                minHeight: '297mm',
                padding: '20mm',
                fontFamily: "'Times New Roman', serif",
                backgroundColor: 'white',
                position: 'relative'
            }}>
                {showBorder && (
                    <div style={{
                        border: '2px solid #2e7d32',
                        padding: '15mm',
                        height: '100%',
                        position: 'relative'
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '15mm' }}>
                            {school.logo && (
                                <img 
                                    src={`${API_URL}${school.logo}`} 
                                    alt="School Logo" 
                                    style={{ height: '80px', marginBottom: '10px', display: 'block', margin: '0 auto 10px auto' }}
                                    crossOrigin="anonymous"
                                />
                            )}
                            <h1 style={{ 
                                fontSize: '24px', 
                                fontWeight: 'bold', 
                                color: '#2e7d32',
                                marginBottom: '5px',
                                textTransform: 'uppercase'
                            }}>
                                {school.name || 'School Name'}
                            </h1>
                            <p style={{ fontSize: '12px', color: '#4b5563' }}>
                                {school.address || ''}
                            </p>
                            <p style={{ fontSize: '12px', color: '#4b5563' }}>
                                Phone: {school.phone || ''} | Email: {school.email || ''}
                            </p>
                        </div>

                        <div style={{ textAlign: 'center', marginBottom: '15mm' }}>
                            <h2 style={{
                                fontSize: '20px',
                                fontWeight: 'bold',
                                color: '#2e7d32',
                                borderBottom: '2px solid #2e7d32',
                                display: 'inline-block',
                                paddingBottom: '5px'
                            }}>
                                CHARACTER CERTIFICATE
                            </h2>
                        </div>

                        <div style={{ textAlign: 'right', marginBottom: '10mm' }}>
                            <p style={{ fontSize: '12px' }}>
                                <strong>Certificate No:</strong> {data.certificate_number}
                            </p>
                            <p style={{ fontSize: '12px' }}>
                                <strong>Date:</strong> {formattedDate}
                            </p>
                        </div>

                        <div style={{ marginBottom: '20mm', lineHeight: '1.8' }}>
                            <p style={{ fontSize: '14px', textAlign: 'justify', marginBottom: '8mm' }}>
                                This is to certify that <strong>{data.student_name}</strong> 
                                {' '}son/daughter of <strong>{data.father_name || 'N/A'}</strong> 
                                {' '}and <strong>{data.mother_name || 'N/A'}</strong> 
                                {' '}is a student of this institution.
                            </p>
                            
                            <p style={{ fontSize: '14px', textAlign: 'justify', marginBottom: '8mm' }}>
                                He/She is studying in <strong>Class {data.class}</strong>
                                {' '}Section <strong>{data.section}</strong>
                                {' '}with Roll Number <strong>{data.roll_no}</strong>.
                            </p>

                            <p style={{ fontSize: '14px', textAlign: 'justify', marginBottom: '8mm' }}>
                                During the period of his/her study, the student has exhibited <strong>exemplary conduct, good moral character, and disciplined behavior</strong>. 
                                {data.conduct_remarks && (
                                    <> He/She has been particularly noted for: <em>"{data.conduct_remarks}"</em></>
                                )}
                            </p>

                            {data.purpose && (
                                <p style={{ fontSize: '14px', textAlign: 'justify', marginBottom: '8mm' }}>
                                    This certificate is issued for the purpose of: <strong>{data.purpose}</strong>
                                </p>
                            )}

                            {data.remarks && (
                                <p style={{ fontSize: '12px', fontStyle: 'italic', color: '#6b7280', marginTop: '5mm' }}>
                                    Remarks: {data.remarks}
                                </p>
                            )}
                        </div>

                        <div style={{
                            marginTop: '30mm',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-end'
                        }}>
                            <div style={{ textAlign: 'center', flex: 1 }}>
                                <div style={{ borderTop: '1px solid #000', width: '150px', margin: '0 auto' }}></div>
                                <p style={{ fontSize: '12px', marginTop: '5px' }}>Principal</p>
                            </div>
                            <div style={{ textAlign: 'center', flex: 1 }}>
                                <div style={{ borderTop: '1px solid #000', width: '150px', margin: '0 auto' }}></div>
                                <p style={{ fontSize: '12px', marginTop: '5px' }}>Class Teacher</p>
                            </div>
                        </div>

                        <div style={{
                            position: 'absolute',
                            bottom: '20mm',
                            left: '0',
                            right: '0',
                            textAlign: 'center',
                            fontSize: '10px',
                            color: '#9ca3af'
                        }}>
                            <p>© {new Date().getFullYear()} {school.name || 'School'} | All Rights Reserved</p>
                        </div>
                    </div>
                )}
                
                {!showBorder && (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: '15mm' }}>
                            {school.logo && (
                                <img 
                                    src={`${API_URL}${school.logo}`} 
                                    alt="School Logo" 
                                    style={{ height: '80px', marginBottom: '10px', display: 'block', margin: '0 auto 10px auto' }}
                                    crossOrigin="anonymous"
                                />
                            )}
                            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2e7d32', marginBottom: '5px', textTransform: 'uppercase' }}>
                                {school.name || 'School Name'}
                            </h1>
                            <p style={{ fontSize: '12px', color: '#4b5563' }}>{school.address || ''}</p>
                            <p style={{ fontSize: '12px', color: '#4b5563' }}>Phone: {school.phone || ''} | Email: {school.email || ''}</p>
                        </div>
                        <div style={{ textAlign: 'center', marginBottom: '15mm' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2e7d32', borderBottom: '2px solid #2e7d32', display: 'inline-block', paddingBottom: '5px' }}>
                                CHARACTER CERTIFICATE
                            </h2>
                        </div>
                        <div style={{ textAlign: 'right', marginBottom: '10mm' }}>
                            <p><strong>Certificate No:</strong> {data.certificate_number}</p>
                            <p><strong>Date:</strong> {formattedDate}</p>
                        </div>
                        <div style={{ marginBottom: '20mm', lineHeight: '1.8' }}>
                            <p>This is to certify that <strong>{data.student_name}</strong> son/daughter of <strong>{data.father_name || 'N/A'}</strong> and <strong>{data.mother_name || 'N/A'}</strong> is a student of this institution.</p>
                            <p>He/She is studying in <strong>Class {data.class}</strong> Section <strong>{data.section}</strong> with Roll Number <strong>{data.roll_no}</strong>.</p>
                            <p>During the period of his/her study, the student has exhibited <strong>exemplary conduct, good moral character, and disciplined behavior</strong>. {data.conduct_remarks && `He/She has been particularly noted for: "${data.conduct_remarks}"`}</p>
                            {data.purpose && <p>This certificate is issued for the purpose of: <strong>{data.purpose}</strong></p>}
                            {data.remarks && <p style={{ fontSize: '12px', fontStyle: 'italic' }}>Remarks: {data.remarks}</p>}
                        </div>
                        <div style={{ marginTop: '30mm', display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ textAlign: 'center' }}><div style={{ borderTop: '1px solid #000', width: '150px', margin: '0 auto' }}></div><p>Principal</p></div>
                            <div style={{ textAlign: 'center' }}><div style={{ borderTop: '1px solid #000', width: '150px', margin: '0 auto' }}></div><p>Class Teacher</p></div>
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '10mm', fontSize: '10px', color: '#9ca3af' }}></div>
                    </>
                )}
            </div>
        );
    };

    const getStudentStatusBadge = (student) => {
        if (student.character_certificate_count > 0) {
            return <Badge variant="success">{student.character_certificate_count} Certificate(s)</Badge>;
        }
        return <Badge variant="default">No Certificates</Badge>;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading student data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 p-6 md:p-8 text-white shadow-xl">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                            🌟 Character Certificate Management
                        </h1>
                        <p className="mt-2 text-green-100 text-sm md:text-base">
                            Issue and manage character certificates for students
                        </p>
                    </div>
                    <div>
                        <button 
                            onClick={handleViewDummyCertificate}
                            className="bg-white/20 hover:bg-white/30 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all border border-white/30 backdrop-blur-sm active:scale-95 flex items-center gap-2"
                        >
                            <span>👁️</span> View Dummy Certificate
                        </button>
                    </div>
                </div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-20 w-60 h-60 rounded-full bg-emerald-400 opacity-20 blur-3xl"></div>
            </div>

            {/* Filters */}
            <Card variant="elevated">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            value={filters.class}
                            onChange={(e) => {
                                setFilters(prev => ({ ...prev, class: e.target.value, section: '', stream: '' }));
                            }}
                        >
                            <option value="">All Classes</option>
                            {classes.map(cls => (
                                <option key={cls.id} value={cls.class_number}>
                                    {cls.name || `Class ${cls.class_number}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    {(filters.class === '11' || filters.class === '12') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Group (Stream)</label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                value={filters.stream}
                                onChange={(e) => setFilters(prev => ({ ...prev, stream: e.target.value, section: '' }))}
                            >
                                <option value="">All Groups</option>
                                {availableStreams.map(stream => (
                                    <option key={stream.id} value={stream.id}>
                                        {stream.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50 disabled:text-gray-400"
                            value={filters.section}
                            onChange={(e) => handleFilterChange('section', e.target.value)}
                            disabled={!filters.class}
                        >
                            <option value="">{filters.class ? 'All Sections' : 'Select Class First'}</option>
                            {filteredSections.map(sec => (
                                <option key={sec.mapping_id} value={sec.section_code}>
                                    {sec.section_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                        <input
                            type="text"
                            placeholder="Search by name, roll number, or father's name..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>
                </div>
            </Card>

            {/* Students List */}
            <Card title="Students List" subtitle={`${filteredStudents.length} student(s) found`} variant="elevated">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Roll No</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Student Name</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Class</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Father's Name</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Actions</th>
                             </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredStudents.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 text-sm font-mono text-gray-900">{student.roll_no}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-gray-900">{student.name}</div>
                                        <div className="text-xs text-gray-500">{student.email}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {student.class_name || `Class ${student.class}`} - {student.section_name || student.section}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{student.father_name || 'N/A'}</td>
                                    <td className="px-4 py-3">
                                        {getStudentStatusBadge(student)}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleGenerateCertificate(student)}
                                                className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                                            >
                                                Generate
                                            </button>
                                            <button
                                                onClick={() => handleViewHistory(student)}
                                                className="px-3 py-1.5 bg-gray-600 text-white text-xs rounded-lg hover:bg-gray-700 transition-colors"
                                            >
                                                History
                                            </button>
                                            {student.character_certificate_count > 0 && (
                                                <button
                                                    onClick={() => handleViewHistory(student)}
                                                    className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                                                >
                                                    View
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredStudents.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                                        No students found matching the filters
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Generate Certificate Modal */}
            <Modal
                isOpen={showCertificateModal}
                onClose={() => setShowCertificateModal(false)}
                title="Generate Character Certificate"
                size="lg"
            >
                {selectedStudent && (
                    <div className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-800 mb-2">Student Details</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="font-medium">Name:</span> {selectedStudent.name}</div>
                                <div><span className="font-medium">Roll No:</span> {selectedStudent.roll_no}</div>
                                <div><span className="font-medium">Class:</span> {selectedStudent.class_name || `Class ${selectedStudent.class}`}</div>
                                <div><span className="font-medium">Section:</span> {selectedStudent.section_name || selectedStudent.section}</div>
                                <div><span className="font-medium">Father's Name:</span> {selectedStudent.father_name || 'N/A'}</div>
                                <div><span className="font-medium">Mother's Name:</span> {selectedStudent.mother_name || 'N/A'}</div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Purpose of Certificate <span className="text-red-500">*</span>
                            </label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                value={certificateData.purpose}
                                onChange={(e) => setCertificateData({ ...certificateData, purpose: e.target.value })}
                            >
                                <option value="">Select Purpose</option>
                                <option value="College Admission">College Admission</option>
                                <option value="Scholarship">Scholarship</option>
                                <option value="Job Application">Job Application</option>
                                <option value="Visa/Passport">Visa/Passport</option>
                                <option value="Police Verification">Police Verification</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Conduct Remarks (Optional)
                            </label>
                            <textarea
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                rows="3"
                                placeholder="e.g., 'Always helpful to peers, respectful to teachers, actively participates in co-curricular activities'"
                                value={certificateData.conductRemarks}
                                onChange={(e) => setCertificateData({ ...certificateData, conductRemarks: e.target.value })}
                            />
                            <p className="text-xs text-gray-500 mt-1">Highlight specific positive traits or achievements</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Additional Remarks (Optional)
                            </label>
                            <textarea
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                rows="2"
                                placeholder="Any other notes..."
                                value={certificateData.remarks}
                                onChange={(e) => setCertificateData({ ...certificateData, remarks: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Issued Date
                            </label>
                            <input
                                type="date"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                value={certificateData.issuedDate}
                                onChange={(e) => setCertificateData({ ...certificateData, issuedDate: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Certificate Number
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                value={certificateData.certificateNumber}
                                readOnly
                            />
                            <p className="text-xs text-gray-500 mt-1">Auto-generated, unique for each certificate</p>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="secondary" onClick={() => setShowCertificateModal(false)}>
                                Cancel
                            </Button>
                            <Button 
                                variant="primary" 
                                onClick={generateCertificatePDF}
                                disabled={generating || !certificateData.purpose}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {generating ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Generating...
                                    </>
                                ) : (
                                    'Generate & Download'
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Certificate History Modal */}
            <Modal
                isOpen={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
                title={`Character Certificate History - ${selectedStudent?.name || ''}`}
                size="lg"
            >
                {certificateHistory.length > 0 ? (
                    <div className="space-y-4">
                        {certificateHistory.map((cert) => (
                            <div key={cert.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800">
                                            Certificate No: {cert.certificate_number}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Purpose: {cert.purpose}
                                        </p>
                                        {cert.conduct_remarks && (
                                            <p className="text-sm text-gray-600 mt-1">
                                                Conduct: {cert.conduct_remarks}
                                            </p>
                                        )}
                                        <p className="text-sm text-gray-500">
                                            Issued on: {new Date(cert.issued_date).toLocaleDateString()}
                                        </p>
                                        {cert.remarks && (
                                            <p className="text-sm text-gray-500 mt-1">
                                                Remarks: {cert.remarks}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleViewCertificate(cert)}
                                        >
                                            View
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => downloadCertificate(cert)}
                                            className="text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            Download PDF
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => downloadCertificateAsWord(cert)}
                                            className="text-green-600 hover:text-green-700 font-medium"
                                        >
                                            Download Word
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No character certificates issued for this student yet.</p>
                    </div>
                )}
            </Modal>

            {/* Preview Modal */}
            <Modal
                isOpen={showPreviewModal}
                onClose={() => setShowPreviewModal(false)}
                title="Character Certificate Preview"
                size="xl"
            >
                {previewCertificate && schoolInfo && (
                    <div className="space-y-4">
                        <div className="border rounded-lg p-2 bg-gray-50">
                            <CharacterCertificateTemplate 
                                data={{
                                    ...previewCertificate,
                                    student_name: previewCertificate.student_name,
                                    class: previewCertificate.class,
                                    section: previewCertificate.section,
                                    roll_no: previewCertificate.roll_no,
                                    father_name: previewCertificate.father_name,
                                    mother_name: previewCertificate.mother_name,
                                    purpose: previewCertificate.purpose,
                                    conduct_remarks: previewCertificate.conduct_remarks,
                                    issued_date: previewCertificate.issued_date,
                                    certificate_number: previewCertificate.certificate_number,
                                    remarks: previewCertificate.remarks
                                }}
                                school={schoolInfo}
                                showBorder={false}
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button variant="secondary" onClick={() => setShowPreviewModal(false)}>
                                Close
                            </Button>
                            <Button 
                                variant="primary" 
                                onClick={() => downloadCertificate(previewCertificate)}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                Download PDF
                            </Button>
                            <Button 
                                variant="primary" 
                                onClick={() => downloadCertificateAsWord(previewCertificate)}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Download Word
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Hidden Certificate Template for PDF Generation */}
            <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                <div ref={certificateRef}>
                    {certificateToCapture && (
                        <CharacterCertificateTemplate 
                            data={certificateToCapture}
                            school={schoolInfo}
                            showBorder={false}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminCharacterCertificate;