import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import { API_URL } from '../../productionLink/productionLink';
import Badge from '../../components/ui/Badge';

const API_BASE = API_URL;

// SVG Icons
const FiFolder = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
);
const FiFileText = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
);
const FiVideo = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
);
const FiMoreVertical = ({ className, onClick }) => (
    <svg onClick={onClick} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
);

const OnlineStudy = () => {
    const [videos, setVideos] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [playingVideo, setPlayingVideo] = useState(null);

    // Upload form state
    const [uploadForm, setUploadForm] = useState({
        subject_id: '',
        topic_name: '',
        title: '',
        description: '',
        video_url: '',
        video_file: null,
        playlist_id: ''
    });
    const [uploading, setUploading] = useState(false);
    const [uploadType, setUploadType] = useState('file'); // 'file' or 'url'
    const [uploadProgress, setUploadProgress] = useState(0);

    // Playlist & Notes State
    const [activeTab, setActiveTab] = useState('videos'); // 'videos', 'playlists'
    const [playlists, setPlaylists] = useState([]);
    const [selectedPlaylist, setSelectedPlaylist] = useState(null); // If set, showing playlist details
    const [playlistNotes, setPlaylistNotes] = useState([]);
    const [videoNotes, setVideoNotes] = useState([]); // Notes for currently playing/selected video

    // Modals
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [playlistForm, setPlaylistForm] = useState({ title: '', description: '', subject_id: '' });

    const [showNoteModal, setShowNoteModal] = useState(false);
    const [noteForm, setNoteForm] = useState({ title: '', file: null, parent_type: 'playlist', parent_id: '' }); // parent_type: 'playlist' or 'video'

    useEffect(() => {
        fetchVideos();
        fetchSubjects();
        fetchPlaylists();
    }, []);

    // Also fetch notes when a video is selected or playlist is selected
    useEffect(() => {
        if (selectedPlaylist) {
            fetchPlaylistNotes(selectedPlaylist.id);
            // Fetch videos for this playlist specifically? 
            // Reuse fetchVideos but filtered? 
            // Or rely on global video list and filter in JS? 
            // Better to fetch specific playlist videos if list is huge, but for now filtering locally or new fetch is fine.
            // Let's use a new fetch or filter.
            // Actually, fetchVideos gets ALL videos. We can just filter `videos.filter(v => v.playlist_id === selectedPlaylist.id)`
            // BUT fetchVideos gets LAST 100 or something? 
            // The backend `GET /videos` gets ALL videos (no LIMIT). So JS filtering is fine for now.
        }
    }, [selectedPlaylist]);

    const fetchPlaylists = async () => {
        try {
            const schoolId = localStorage.getItem('schoolId');
            const url = schoolId
                ? `${API_BASE}/api/library/online-study/playlists?school_id=${schoolId}`
                : `${API_BASE}/api/library/online-study/playlists`;
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setPlaylists(data);
            }
        } catch (error) {
            console.error('Error fetching playlists:', error);
        }
    };

    const fetchPlaylistNotes = async (playlistId) => {
        try {
            const response = await fetch(`${API_BASE}/api/library/online-study/notes?parent_type=playlist&parent_id=${playlistId}`);
            if (response.ok) {
                const data = await response.json();
                setPlaylistNotes(data);
            }
        } catch (error) {
            console.error('Error fetching playlist notes:', error);
        }
    };

    const fetchVideoNotes = async (videoId) => {
        try {
            const response = await fetch(`${API_BASE}/api/library/online-study/notes?parent_type=video&parent_id=${videoId}`);
            if (response.ok) {
                const data = await response.json();
                setVideoNotes(data);
            }
        } catch (error) {
            console.error('Error fetching video notes:', error);
        }
    };

    const fetchVideos = async () => {
        try {
            // Get school_id directly from localStorage (saved by login as 'schoolId')
            const schoolId = localStorage.getItem('schoolId');

            const url = schoolId
                ? `${API_BASE}/api/library/online-study/videos?school_id=${schoolId}`
                : `${API_BASE}/api/library/online-study/videos`;

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setVideos(data);
            }
        } catch (error) {
            console.error('Error fetching videos:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubjects = async () => {
        try {
            // Get school_id directly from localStorage (saved by login as 'schoolId')
            const schoolId = localStorage.getItem('schoolId');

            console.log('📚 Fetching subjects - school_id:', schoolId);

            const url = schoolId
                ? `${API_BASE}/api/library/subjects?school_id=${schoolId}`
                : `${API_BASE}/api/library/subjects`;

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                // Handle both direct array and {subjects: [...]} format
                setSubjects(Array.isArray(data) ? data : (data.subjects || []));
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setUploading(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append('subject_id', uploadForm.subject_id);
            formData.append('topic_name', uploadForm.topic_name);
            formData.append('title', uploadForm.title);
            formData.append('description', uploadForm.description || '');
            if (uploadForm.playlist_id) formData.append('playlist_id', uploadForm.playlist_id);

            if (uploadType === 'file' && uploadForm.video_file) {
                formData.append('video', uploadForm.video_file);
            } else if (uploadType === 'url' && uploadForm.video_url) {
                formData.append('video_url', uploadForm.video_url);
            }

            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                    setUploadProgress(percentComplete);
                }
            });

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 201) {
                        setShowUploadModal(false);
                        setUploadForm({
                            subject_id: '',
                            topic_name: '',
                            title: '',
                            description: '',
                            video_url: '',
                            video_file: null,
                            playlist_id: ''
                        });
                        setUploadProgress(0);
                        fetchVideos();
                        if (selectedPlaylist) fetchPlaylists(); // Refresh counts
                    } else {
                        alert('Failed to upload video');
                    }
                    setUploading(false);
                }
            };

            xhr.open('POST', `${API_BASE}/api/library/online-study/videos`);

            // Add Authorization Header
            const token = localStorage.getItem('token');
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);

            xhr.send(formData);
        } catch (error) {
            console.error('Error uploading video:', error);
            alert('Error uploading video');
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this video?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/library/online-study/videos/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                fetchVideos();
                if (selectedPlaylist) fetchPlaylists();
            } else {
                alert('Failed to delete video');
            }
        } catch (error) {
            console.error('Error deleting video:', error);
        }
    };

    // Playlist Handlers
    const handleCreatePlaylist = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/library/online-study/playlists`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(playlistForm)
            });

            if (response.ok) {
                setShowPlaylistModal(false);
                setPlaylistForm({ title: '', description: '', subject_id: '' });
                fetchPlaylists();
            } else {
                alert('Failed to create playlist');
            }
        } catch (error) {
            console.error('Error creating playlist:', error);
        }
    };

    const handleDeletePlaylist = async (id) => {
        if (!window.confirm('Are you sure you want to delete this playlist? Videos will strictly remain but be unlinked.')) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/library/online-study/playlists/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                fetchPlaylists();
                if (selectedPlaylist && selectedPlaylist.id === id) setSelectedPlaylist(null);
            }
        } catch (error) {
            console.error('Error deleting playlist:', error);
        }
    };

    // Note Handlers
    const handleUploadNote = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', noteForm.title);
            formData.append('parent_type', noteForm.parent_type);
            formData.append('parent_id', noteForm.parent_id);
            formData.append('file', noteForm.file);

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/library/online-study/notes`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }, // Content-Type auto-set for FormData
                body: formData
            });

            if (response.ok) {
                setShowNoteModal(false);
                setNoteForm({ title: '', file: null, parent_type: 'playlist', parent_id: '' });
                if (noteForm.parent_type === 'playlist') fetchPlaylistNotes(noteForm.parent_id);
                if (noteForm.parent_type === 'video') fetchVideoNotes(noteForm.parent_id);
            } else {
                alert('Failed to upload note');
            }
        } catch (error) {
            console.error('Error uploading note:', error);
        }
    };

    const handleDeleteNote = async (noteId, parentType, parentId) => {
        if (!window.confirm('Delete this note?')) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/library/online-study/notes/${noteId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                if (parentType === 'playlist') fetchPlaylistNotes(parentId);
                if (parentType === 'video') fetchVideoNotes(parentId);
            }
        } catch (error) {
            console.error('Delete note error:', error);
        }
    };

    const getVideoSrc = (video) => {
        if (video.video_path) {
            // Local file - use streaming endpoint
            const pathParts = video.video_path.split('/');
            const filename = pathParts[pathParts.length - 1];
            const subjectFolder = pathParts[pathParts.length - 2];
            return `${API_BASE}/api/library/online-study/stream/${subjectFolder}/${filename}`;
        }
        return video.video_url;
    };

    const getYouTubeEmbedUrl = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11
            ? `https://www.youtube.com/embed/${match[2]}`
            : null;
    };

    const isYouTubeUrl = (url) => {
        if (!url) return false;
        return url.includes('youtube.com') || url.includes('youtu.be');
    };

    // Group videos by subject
    const groupedVideos = videos.reduce((acc, video) => {
        const subjectName = video.subject_name || 'Uncategorized';
        if (!acc[subjectName]) {
            acc[subjectName] = [];
        }
        acc[subjectName].push(video);
        return acc;
    }, {});

    // Filter videos
    const filteredGroupedVideos = Object.entries(groupedVideos).reduce((acc, [subject, vids]) => {
        if (selectedSubject && subject !== selectedSubject) return acc;

        const filteredVids = vids.filter(v =>
            v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.topic_name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filteredVids.length > 0) {
            acc[subject] = filteredVids;
        }
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading study materials...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-8">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white shadow-2xl">
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold tracking-tight">🎬 Online Study</h1>
                    <p className="mt-3 text-indigo-100 text-lg max-w-2xl">
                        Access study videos and playlists organized by subject.
                    </p>
                    <div className="mt-6 flex gap-4">
                        <div className="flex bg-white/20 p-1 rounded-lg backdrop-blur-sm">
                            <button
                                onClick={() => { setActiveTab('videos'); setSelectedPlaylist(null); }}
                                className={`px-4 py-2 rounded-md font-medium transition-all ${activeTab === 'videos' && !selectedPlaylist ? 'bg-white text-indigo-600 shadow-sm' : 'text-white hover:bg-white/10'}`}
                            >
                                Videos
                            </button>
                            <button
                                onClick={() => { setActiveTab('playlists'); setSelectedPlaylist(null); }}
                                className={`px-4 py-2 rounded-md font-medium transition-all ${activeTab === 'playlists' || selectedPlaylist ? 'bg-white text-indigo-600 shadow-sm' : 'text-white hover:bg-white/10'}`}
                            >
                                Playlists
                            </button>
                        </div>
                        {activeTab === 'videos' && !selectedPlaylist && (
                            <button
                                onClick={() => {
                                    setUploadForm(prev => ({ ...prev, playlist_id: '' }));
                                    setShowUploadModal(true);
                                }}
                                className="px-6 py-2.5 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-opacity-90 transition-all shadow-lg flex items-center gap-2"
                            >
                                <span>➕</span> Upload Video
                            </button>
                        )}
                        {activeTab === 'playlists' && !selectedPlaylist && (
                            <button
                                onClick={() => setShowPlaylistModal(true)}
                                className="px-6 py-2.5 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-opacity-90 transition-all shadow-lg flex items-center gap-2"
                            >
                                <span>➕</span> Create Playlist
                            </button>
                        )}
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48"></div>
                <div className="absolute bottom-0 right-20 w-64 h-64 bg-white/10 rounded-full -mb-32"></div>
            </div>

            {/* PLAYLIST DETAIL VIEW */}
            {selectedPlaylist ? (
                <div className="space-y-6">
                    <button onClick={() => setSelectedPlaylist(null)} className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                        ← Back to Playlists
                    </button>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">{selectedPlaylist.title}</h2>
                                <p className="text-gray-500 mt-2">{selectedPlaylist.description}</p>
                                <div className="flex gap-2 mt-4">
                                    <Badge variant="info">{selectedPlaylist.subject_name}</Badge>
                                    <Badge variant="secondary">{videos.filter(v => v.playlist_id === selectedPlaylist.id).length} videos</Badge>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setNoteForm({ title: '', file: null, parent_type: 'playlist', parent_id: selectedPlaylist.id });
                                        setShowNoteModal(true);
                                    }}
                                    className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition-colors"
                                >
                                    📄 Add Note
                                </button>
                                <button
                                    onClick={() => {
                                        setUploadForm(prev => ({ ...prev, playlist_id: selectedPlaylist.id, subject_id: selectedPlaylist.subject_id }));
                                        setShowUploadModal(true);
                                    }}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                                >
                                    ➕ Add Video
                                </button>
                            </div>
                        </div>

                        {/* Playlist Notes */}
                        {playlistNotes.length > 0 && (
                            <div className="mt-8 border-t pt-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <FiFileText className="text-indigo-600" /> Playlist Notes
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {playlistNotes.map(note => (
                                        <div key={note.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-indigo-200 transition-colors">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                                                    <FiFileText />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-medium text-gray-900 truncate">{note.title}</h4>
                                                    <a href={`${API_BASE}${note.file_path}`} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline">
                                                        Download PDF
                                                    </a>
                                                </div>
                                            </div>
                                            <button onClick={() => handleDeleteNote(note.id, 'playlist', selectedPlaylist.id)} className="text-gray-400 hover:text-red-500">
                                                🗑️
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Playlist Videos */}
                    <div className="mt-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Videos in this Playlist</h3>
                        {videos.filter(v => v.playlist_id === selectedPlaylist.id).length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <p className="text-gray-500">No videos in this playlist yet.</p>
                                <button onClick={() => { setUploadForm(prev => ({ ...prev, playlist_id: selectedPlaylist.id, subject_id: selectedPlaylist.subject_id })); setShowUploadModal(true); }} className="mt-2 text-indigo-600 font-medium">Add a video</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {videos.filter(v => v.playlist_id === selectedPlaylist.id).map(video => (
                                    <div key={video.id} className="group border border-gray-200 rounded-xl overflow-hidden hover:border-indigo-300 hover:shadow-lg transition-all duration-300 bg-white">
                                        <div className="aspect-video bg-gray-100 relative cursor-pointer" onClick={() => setPlayingVideo(video)}>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center text-indigo-600 shadow-md group-hover:scale-110 transition-transform">►</div>
                                            </div>
                                            <div className="absolute bottom-2 left-2"><Badge variant="secondary" size="sm">{video.topic_name}</Badge></div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{video.title}</h3>
                                            <div className="flex items-center justify-between mt-3">
                                                <button onClick={() => handleDelete(video.id)} className="text-red-500 text-xs font-medium hover:underline">Delete</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : activeTab === 'playlists' ? (
                /* PLAYLISTS GRID */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {playlists.map(playlist => (
                        <div
                            key={playlist.id}
                            onClick={() => setSelectedPlaylist(playlist)}
                            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <FiFolder className="w-6 h-6" />
                                </div>
                                <div className="flex gap-2">
                                    <Badge variant="info" size="sm">{playlist.subject_name}</Badge>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">{playlist.title}</h3>
                            <p className="text-gray-500 text-sm mb-4 line-clamp-2">{playlist.description}</p>
                            <div className="flex items-center justify-between pt-4 border-t text-sm text-gray-500">
                                <span>{playlist.video_count} videos</span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDeletePlaylist(playlist.id); }}
                                    className="text-gray-400 hover:text-red-500 p-1"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                    {playlists.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500 mb-4">No playlists found.</p>
                            <button onClick={() => setShowPlaylistModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Create Playlist</button>
                        </div>
                    )}
                </div>
            ) : (
                /* VIDEOS GRID (Existing Logic) */
                <>
                    <Card variant="elevated">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Search videos by title or topic..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div className="md:w-64">
                                <select
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                                >
                                    <option value="">All Subjects</option>
                                    {subjects.map(subject => (
                                        <option key={subject.id} value={subject.name}>{subject.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </Card>

                    {Object.keys(filteredGroupedVideos).length === 0 ? (
                        <Card variant="elevated">
                            <div className="text-center py-12">
                                <span className="text-6xl block mb-4">📹</span>
                                <h3 className="text-xl font-bold text-gray-700 mb-2">No Videos Found</h3>
                                <p className="text-gray-500 mb-6">
                                    {searchTerm || selectedSubject
                                        ? 'No videos match your search criteria.'
                                        : 'Start by uploading your first study video!'}
                                </p>
                                <button
                                    onClick={() => setShowUploadModal(true)}
                                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                                >
                                    Upload Video
                                </button>
                            </div>
                        </Card>
                    ) : (
                        Object.entries(filteredGroupedVideos).map(([subject, vids]) => (
                            <Card key={subject} variant="elevated">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="text-2xl">📚</span>
                                    <h2 className="text-xl font-bold text-gray-900">{subject}</h2>
                                    <Badge variant="info" size="sm">{vids.length} videos</Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {vids.map(video => (
                                        <div
                                            key={video.id}
                                            className="group border border-gray-200 rounded-xl overflow-hidden hover:border-indigo-300 hover:shadow-lg transition-all duration-300"
                                        >
                                            <div
                                                className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 relative cursor-pointer"
                                                onClick={() => setPlayingVideo(video)}
                                            >
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform">
                                                        <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-2 left-2"><Badge variant="secondary" size="sm">{video.topic_name}</Badge></div>
                                                {video.playlist_title && <div className="absolute top-2 left-2"><Badge variant="warning" size="sm">📂 {video.playlist_title}</Badge></div>}
                                            </div>

                                            <div className="p-4">
                                                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{video.title}</h3>
                                                {video.description && <p className="text-sm text-gray-500 line-clamp-2 mb-3">{video.description}</p>}
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-400">{new Date(video.created_at).toLocaleDateString()}</span>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setNoteForm({ title: '', file: null, parent_type: 'video', parent_id: video.id });
                                                                setShowNoteModal(true);
                                                            }}
                                                            className="text-indigo-500 hover:text-indigo-700 text-xs font-medium"
                                                        >
                                                            + Note
                                                        </button>
                                                        <button onClick={() => handleDelete(video.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        ))
                    )}
                </>
            )}

            {/* Video Player Modal */}
            {playingVideo && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-5xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b flex items-center justify-between bg-gray-50 flex-shrink-0">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{playingVideo.title}</h3>
                                <p className="text-sm text-gray-500">{playingVideo.topic_name} • {playingVideo.subject_name}</p>
                            </div>
                            <button onClick={() => { setPlayingVideo(null); setVideoNotes([]); }} className="p-2 hover:bg-gray-200 rounded-full transition-colors">✕</button>
                        </div>
                        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                            <div className="flex-1 bg-black overflow-y-auto">
                                <div className="aspect-video w-full">
                                    {playingVideo.video_path ? (
                                        <video src={getVideoSrc(playingVideo)} className="w-full h-full" controls autoPlay>Your browser does not support the video tag.</video>
                                    ) : isYouTubeUrl(playingVideo.video_url) ? (
                                        <iframe src={getYouTubeEmbedUrl(playingVideo.video_url)} className="w-full h-full" allowFullScreen title={playingVideo.title}></iframe>
                                    ) : (
                                        <video src={playingVideo.video_url} className="w-full h-full" controls autoPlay>Your browser does not support the video tag.</video>
                                    )}
                                </div>
                                {playingVideo.description && <div className="p-4 text-white/80">{playingVideo.description}</div>}
                            </div>
                            {/* Notes Sidebar in Player */}
                            <div className="w-full md:w-80 bg-gray-50 border-l flex flex-col">
                                <div className="p-4 border-b flex justify-between items-center bg-white">
                                    <h4 className="font-bold text-gray-800">📝 Notes</h4>
                                    <button
                                        onClick={() => { setNoteForm({ title: '', file: null, parent_type: 'video', parent_id: playingVideo.id }); setShowNoteModal(true); }}
                                        className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200"
                                    >
                                        + Add
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {/* Load Notes on Demand */}
                                    <LoadVideoNotes videoId={playingVideo.id} notes={videoNotes} setNotes={setVideoNotes} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Playlist Creator Modal */}
            {showPlaylistModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="p-6 border-b bg-indigo-600 text-white">
                            <h2 className="text-xl font-bold">Create New Playlist</h2>
                        </div>
                        <form onSubmit={handleCreatePlaylist} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Playlist Title</label>
                                <input type="text" required className="w-full border rounded-lg p-2" value={playlistForm.title} onChange={e => setPlaylistForm({ ...playlistForm, title: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                                <select required className="w-full border rounded-lg p-2" value={playlistForm.subject_id} onChange={e => setPlaylistForm({ ...playlistForm, subject_id: e.target.value })}>
                                    <option value="">Select Subject</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                                <textarea rows={3} className="w-full border rounded-lg p-2" value={playlistForm.description} onChange={e => setPlaylistForm({ ...playlistForm, description: e.target.value })}></textarea>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <button type="button" onClick={() => setShowPlaylistModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Note Upload Modal */}
            {showNoteModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="p-6 border-b bg-indigo-600 text-white">
                            <h2 className="text-xl font-bold">Upload Note</h2>
                            <p className="text-indigo-100 text-sm">For {noteForm.parent_type}: ID {noteForm.parent_id}</p>
                        </div>
                        <form onSubmit={handleUploadNote} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Note Title</label>
                                <input type="text" required className="w-full border rounded-lg p-2" value={noteForm.title} onChange={e => setNoteForm({ ...noteForm, title: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">File (PDF/Doc)</label>
                                <input type="file" required accept=".pdf,.doc,.docx" className="w-full border rounded-lg p-2" onChange={e => setNoteForm({ ...noteForm, file: e.target.files[0] })} />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <button type="button" onClick={() => setShowNoteModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Upload</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Upload Video Modal (Updated) */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                            <h2 className="text-2xl font-bold">Upload Study Video</h2>
                            <p className="text-indigo-100 mt-1">Add a new video to the study library</p>
                        </div>

                        <form onSubmit={handleUpload} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Subject *</label>
                                <select
                                    required
                                    value={uploadForm.subject_id}
                                    onChange={(e) => setUploadForm({ ...uploadForm, subject_id: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map(sub => (
                                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Playlist Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Playlist (Optional)</label>
                                <select
                                    value={uploadForm.playlist_id}
                                    onChange={(e) => setUploadForm({ ...uploadForm, playlist_id: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                                >
                                    <option value="">No Playlist (Standalone)</option>
                                    {playlists
                                        .filter(p => !uploadForm.subject_id || p.subject_id == uploadForm.subject_id)
                                        .map(p => (
                                            <option key={p.id} value={p.id}>{p.title}</option>
                                        ))
                                    }
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Topic Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g., Chapter 1: Introduction"
                                    value={uploadForm.topic_name}
                                    onChange={(e) => setUploadForm({ ...uploadForm, topic_name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Video Title *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter video title"
                                    value={uploadForm.title}
                                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                />
                            </div>

                            {/* Upload Type Toggle */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Video Source *</label>
                                <div className="flex gap-2 mb-3">
                                    <button
                                        type="button"
                                        onClick={() => setUploadType('file')}
                                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${uploadType === 'file'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        📁 Upload File
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setUploadType('url')}
                                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${uploadType === 'url'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        🔗 YouTube URL
                                    </button>
                                </div>

                                {uploadType === 'file' ? (
                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors">
                                        <input
                                            type="file"
                                            accept="video/*"
                                            onChange={(e) => setUploadForm({ ...uploadForm, video_file: e.target.files[0] })}
                                            className="hidden"
                                            id="video-file-input"
                                        />
                                        <label htmlFor="video-file-input" className="cursor-pointer">
                                            {uploadForm.video_file ? (
                                                <div>
                                                    <span className="text-4xl block mb-2">🎥</span>
                                                    <p className="text-indigo-600 font-medium">{uploadForm.video_file.name}</p>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {(uploadForm.video_file.size / (1024 * 1024)).toFixed(2)} MB
                                                    </p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <span className="text-4xl block mb-2">📤</span>
                                                    <p className="text-gray-600">Click to select video file</p>
                                                    <p className="text-xs text-gray-400 mt-1">MP4, WebM, AVI up to 500MB</p>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                ) : (
                                    <div>
                                        <input
                                            type="url"
                                            placeholder="YouTube video URL"
                                            value={uploadForm.video_url}
                                            onChange={(e) => setUploadForm({ ...uploadForm, video_url: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Paste YouTube video link</p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Description (Optional)</label>
                                <textarea
                                    rows={3}
                                    placeholder="Brief description of the video content"
                                    value={uploadForm.description}
                                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                                />
                            </div>

                            {/* Upload Progress */}
                            {uploading && uploadProgress > 0 && (
                                <div>
                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                        <span>Uploading...</span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowUploadModal(false);
                                        setUploadProgress(0);
                                    }}
                                    disabled={uploading}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading || (uploadType === 'file' && !uploadForm.video_file) || (uploadType === 'url' && !uploadForm.video_url)}
                                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                >
                                    {uploading ? 'Uploading...' : 'Upload Video'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper component to load notes inside the player
const LoadVideoNotes = ({ videoId, notes, setNotes }) => {
    // This component helps trigger fetch on mount
    useEffect(() => {
        const fetchNotes = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`${API_URL}/api/library/online-study/notes?parent_type=video&parent_id=${videoId}`);
                if (response.ok) {
                    const data = await response.json();
                    setNotes(data);
                }
            } catch (e) { console.error(e); }
        };
        fetchNotes();
    }, [videoId]);

    if (notes.length === 0) return <p className="text-gray-400 text-sm text-center py-4">No notes for this video.</p>;

    return (
        <div className="space-y-2">
            {notes.map(note => (
                <div key={note.id} className="flex items-center justify-between p-2 bg-white rounded border text-sm">
                    <a href={`${API_URL}${note.file_path}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center gap-2 truncate">
                        📄 {note.title}
                    </a>
                </div>
            ))}
        </div>
    );
};

export default OnlineStudy;
