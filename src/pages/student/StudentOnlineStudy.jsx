import React, { useState, useEffect } from 'react';
import { API_URL } from '../../productionLink/productionLink';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const API_BASE = API_URL;

// SVG Icons
const FiFolder = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
);
const FiFileText = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
);

const StudentOnlineStudy = () => {
    const [videos, setVideos] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [playingVideo, setPlayingVideo] = useState(null);

    // Playlist & Notes State
    const [activeTab, setActiveTab] = useState('videos'); // 'videos', 'playlists'
    const [playlists, setPlaylists] = useState([]);
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [playlistNotes, setPlaylistNotes] = useState([]);
    const [videoNotes, setVideoNotes] = useState([]);

    useEffect(() => {
        fetchVideos();
        fetchSubjects();
        fetchPlaylists();
    }, []);

    useEffect(() => {
        if (selectedPlaylist) {
            fetchPlaylistNotes(selectedPlaylist.id);
        }
    }, [selectedPlaylist]);

    const fetchVideos = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/student/online-study/videos`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setVideos(data.videos || []);
            }
        } catch (error) {
            console.error('Error fetching videos:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubjects = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/student/online-study/subjects`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setSubjects(data.subjects || []);
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    const fetchPlaylists = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/student/online-study/playlists`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setPlaylists(data); // Assuming array response
            }
        } catch (error) {
            console.error('Error fetching playlists:', error);
        }
    };

    const fetchPlaylistNotes = async (playlistId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/student/online-study/notes?parent_type=playlist&parent_id=${playlistId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
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
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/student/online-study/notes?parent_type=video&parent_id=${videoId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setVideoNotes(data);
            }
        } catch (error) {
            console.error('Error fetching video notes:', error);
        }
    };

    useEffect(() => {
        if (playingVideo) {
            fetchVideoNotes(playingVideo.id);
        } else {
            setVideoNotes([]);
        }
    }, [playingVideo]);

    const getVideoSrc = (video) => {
        if (video.video_path) {
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
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-teal-600 p-8 text-white shadow-2xl">
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold tracking-tight">🎬 Online Study</h1>
                    <p className="mt-3 text-green-100 text-lg max-w-2xl">
                        Watch educational videos and access study playlists by subject. Learn at your own pace!
                    </p>
                </div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48"></div>
                <div className="absolute bottom-0 right-20 w-64 h-64 bg-white/10 rounded-full -mb-32"></div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm w-fit mx-auto md:mx-0">
                {['videos', 'playlists'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); setSelectedPlaylist(null); }}
                        className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab
                                ? 'bg-green-600 text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Common Filters for both tabs (or specific?) */}
            {/* If inside Playlist Detail, hide filters? Yes. */}
            {(!selectedPlaylist) && (
                <Card variant="elevated">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder={activeTab === 'videos' ? "Search videos by title or topic..." : "Search playlists by title..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                            />
                        </div>
                        <div className="md:w-64">
                            <select
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
                            >
                                <option value="">All Subjects</option>
                                {/* Use filteredGroupedVideos keys for Videos tab, but for Playlists logic might differ.
                                    For simplicity, strictly strictly use subjects API list?
                                    But existing code used grouped keys.
                                    Let's use the 'subjects' state if available (fetched in useEffect), or fallback.
                                */}
                                {subjects.length > 0 ? (
                                    subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)
                                ) : (
                                    Object.keys(groupedVideos).map(subject => (
                                        <option key={subject} value={subject}>{subject}</option>
                                    ))
                                )}
                            </select>
                        </div>
                    </div>
                </Card>
            )}

            {/* CONTENT AREA */}
            {activeTab === 'videos' ? (
                /* VIDEOS TAB CONTENT */
                Object.keys(filteredGroupedVideos).length === 0 ? (
                    <Card variant="elevated">
                        <div className="text-center py-12">
                            <span className="text-6xl block mb-4">📹</span>
                            <h3 className="text-xl font-bold text-gray-700 mb-2">No Videos Available</h3>
                            <p className="text-gray-500">
                                {searchTerm || selectedSubject
                                    ? 'No videos match your search criteria.'
                                    : 'No study videos have been uploaded yet.'}
                            </p>
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
                                        className="group border border-gray-200 rounded-xl overflow-hidden hover:border-green-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
                                        onClick={() => setPlayingVideo(video)}
                                    >
                                        <div className="aspect-video bg-gradient-to-br from-green-100 to-teal-100 relative">
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform">
                                                    <FiFolder className="w-8 h-8 ml-1" /> {/* Using generic icon if needed, or SVG */}
                                                    <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                </div>
                                            </div>
                                            <div className="absolute bottom-2 left-2">
                                                <Badge variant="secondary" size="sm">{video.topic_name}</Badge>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{video.title}</h3>
                                            <p className="text-xs text-gray-500 mb-2">{video.subject_name}</p>
                                            <span className="text-xs text-gray-400">
                                                {new Date(video.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    ))
                )
            ) : (
                /* PLAYLISTS TAB CONTENT */
                selectedPlaylist ? (
                    <div className="space-y-6">
                        {/* Playlist Header */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <button
                                onClick={() => setSelectedPlaylist(null)}
                                className="mb-4 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <span className="mr-2">←</span> Back to Playlists
                            </button>
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <Badge variant="warning">{selectedPlaylist.subject_name}</Badge>
                                        <h2 className="text-2xl font-bold text-gray-900">{selectedPlaylist.title}</h2>
                                    </div>
                                    <p className="text-gray-600">{selectedPlaylist.description}</p>
                                </div>
                            </div>
                        </div>

                        {/* Playlist Notes */}
                        {playlistNotes.length > 0 && (
                            <Card variant="elevated">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <FiFileText className="w-5 h-5" /> Playlist Notes
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {playlistNotes.map(note => (
                                        <a
                                            key={note.id}
                                            href={`${API_BASE}${note.file_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-4 border rounded-xl hover:bg-gray-50 transition-colors group"
                                        >
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                                <FiFileText className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-gray-900 truncate">{note.title}</h4>
                                                <p className="text-xs text-gray-500">PDF • {new Date(note.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <span className="text-gray-400">↓</span>
                                        </a>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Playlist Videos Filtered from 'videos' state approx? */}
                        {/* Or relying on 'videos' state having all videos? */}
                        {/* If 'videos' state has all videos, we filter. */}
                        <Card variant="elevated">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                📺 Playlist Videos
                            </h3>
                            {videos.filter(v => v.playlist_id === selectedPlaylist.id).length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {videos
                                        .filter(v => v.playlist_id === selectedPlaylist.id)
                                        .map(video => (
                                            <div
                                                key={video.id}
                                                className="group border border-gray-200 rounded-xl overflow-hidden hover:border-green-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
                                                onClick={() => setPlayingVideo(video)}
                                            >
                                                <div className="aspect-video bg-gray-100 relative">
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center text-green-600 shadow-sm group-hover:scale-110 transition-transform">
                                                            <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-3">
                                                    <h4 className="font-medium text-gray-900 line-clamp-1">{video.title}</h4>
                                                    <Badge variant="secondary" size="sm" className="mt-2">{video.topic_name}</Badge>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No videos in this playlist yet.</p>
                            )}
                        </Card>
                    </div>
                ) : (
                    /* Playlist Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {playlists
                            .filter(p => !selectedSubject || p.subject_name === selectedSubject)
                            .filter(p => !searchTerm || p.title.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map(playlist => (
                                <div
                                    key={playlist.id}
                                    onClick={() => setSelectedPlaylist(playlist)}
                                    className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full"
                                >
                                    <div className="h-48 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center relative overflow-hidden">
                                        <div className="absolute inset-0 bg-pattern opacity-10"></div>
                                        <div className="w-20 h-20 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center text-amber-600 shadow-lg group-hover:scale-110 transition-transform duration-500">
                                            <FiFolder className="w-10 h-10" />
                                        </div>
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-amber-700 shadow-sm">
                                            {playlist.video_count} Videos
                                        </div>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Badge variant="warning" size="sm">{playlist.subject_name}</Badge>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                                            {playlist.title}
                                        </h3>
                                        <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">
                                            {playlist.description}
                                        </p>
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                                            <span className="text-xs text-gray-400">
                                                Created {new Date(playlist.created_at).toLocaleDateString()}
                                            </span>
                                            <span className="text-amber-600 text-sm font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                                View Playlist →
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                )
            )}

            {/* Video Player Modal with Sidebar */}
            {playingVideo && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-6xl w-full overflow-hidden shadow-2xl flex flex-col lg:flex-row max-h-[90vh]">
                        {/* Main Video Area */}
                        <div className="flex-1 flex flex-col overflow-y-auto">
                            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">{playingVideo.title}</h3>
                                    <p className="text-sm text-gray-500">{playingVideo.topic_name} • {playingVideo.subject_name}</p>
                                </div>
                                <button
                                    onClick={() => setPlayingVideo(null)}
                                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="aspect-video bg-black">
                                {playingVideo.video_path ? (
                                    <video
                                        src={getVideoSrc(playingVideo)}
                                        className="w-full h-full"
                                        controls
                                        autoPlay
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                ) : isYouTubeUrl(playingVideo.video_url) ? (
                                    <iframe
                                        src={getYouTubeEmbedUrl(playingVideo.video_url)}
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        title={playingVideo.title}
                                    ></iframe>
                                ) : (
                                    <video
                                        src={playingVideo.video_url}
                                        className="w-full h-full"
                                        controls
                                        autoPlay
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                )}
                            </div>
                            {playingVideo.description && (
                                <div className="p-4 bg-gray-50 border-t">
                                    <p className="text-gray-700">{playingVideo.description}</p>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="w-full lg:w-80 border-l bg-gray-50 flex flex-col h-[300px] lg:h-auto">
                            <div className="p-4 border-b bg-white">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <FiFileText className="w-5 h-5 text-green-600" />
                                    Study Notes
                                </h3>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {videoNotes.length > 0 ? (
                                    videoNotes.map(note => (
                                        <a
                                            key={note.id}
                                            href={`${API_BASE}${note.file_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-green-400 hover:shadow-sm transition-all group"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="mt-1 text-green-500">
                                                    <FiFileText className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-900 group-hover:text-green-700">{note.title}</h4>
                                                    <p className="text-xs text-gray-400 mt-1">{new Date(note.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </a>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-400">
                                        <FiFileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                        <p className="text-sm">No notes attached to this video</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentOnlineStudy;
