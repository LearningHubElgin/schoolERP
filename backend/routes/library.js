const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ==================== MULTER CONFIGURATION FOR VIDEO UPLOADS ====================

// Create upload directories if they don't exist
const createUploadDir = (subjectName) => {
    const baseDir = path.join(__dirname, '..', 'upload', 'online_study', 'videos');
    const subjectDir = path.join(baseDir, subjectName || 'general');

    if (!fs.existsSync(subjectDir)) {
        fs.mkdirSync(subjectDir, { recursive: true });
    }
    return subjectDir;
};

// Configure multer storage
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
            // Get subject name from the request body or use 'general'
            const subjectId = req.body.subject_id;
            let subjectName = 'general';

            if (subjectId) {
                const [subjects] = await db.execute('SELECT name FROM subjects WHERE id = ?', [subjectId]);
                if (subjects.length > 0) {
                    // Sanitize subject name for folder
                    subjectName = subjects[0].name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
                }
            }

            const uploadDir = createUploadDir(subjectName);
            req.subjectFolder = subjectName; // Store for later use
            cb(null, uploadDir);
        } catch (error) {
            console.error('Error setting upload destination:', error);
            cb(error, null);
        }
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `video-${uniqueSuffix}${ext}`);
    }
});

// File filter for video files
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/x-matroska'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only video files are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 500 * 1024 * 1024 // 500MB max file size
    }
});

// ==================== SUBJECTS ROUTE ====================

// Get all subjects (for dropdowns, filtered by school)
router.get('/subjects', async (req, res) => {
    try {
        const { school_id } = req.query;

        console.log('🔍 [SUBJECTS API] Query params:', req.query);
        console.log('🔍 [SUBJECTS API] school_id:', school_id);

        let query = 'SELECT id, name FROM subjects';
        const params = [];

        if (school_id) {
            query += ' WHERE school_id = ?';
            params.push(school_id);
            console.log('✅ [SUBJECTS API] Filtering by school_id:', school_id);
        } else {
            console.log('⚠️ [SUBJECTS API] No school_id provided - returning ALL subjects!');
        }

        query += ' ORDER BY name';

        const [subjects] = await db.query(query, params);
        console.log('📊 [SUBJECTS API] Returning', subjects.length, 'subjects');
        res.json(subjects);
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ error: 'Failed to fetch subjects' });
    }
});

// ==================== online_study ROUTES ====================

// Get all videos (with optional filters)
router.get('/online-study/videos', async (req, res) => {
    try {
        const { subject_id, topic, school_id, playlist_id } = req.query;

        let query = `
            SELECT 
                v.*,
                s.name as subject_name,
                p.title as playlist_title
            FROM online_study_videos v
            LEFT JOIN subjects s ON v.subject_id = s.id
            LEFT JOIN study_playlists p ON v.playlist_id = p.id
            WHERE 1=1
        `;
        const params = [];

        if (school_id) {
            query += ' AND v.school_id = ?';
            params.push(school_id);
        }

        if (subject_id) {
            query += ' AND v.subject_id = ?';
            params.push(subject_id);
        }

        if (topic) {
            query += ' AND v.topic_name LIKE ?';
            params.push(`%${topic}%`);
        }

        if (playlist_id) {
            query += ' AND v.playlist_id = ?';
            params.push(playlist_id);
        }

        query += ' ORDER BY v.created_at DESC';

        const [videos] = await db.execute(query, params);
        res.json(videos);
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({ error: 'Failed to fetch videos' });
    }
});

// Add new video with file upload
router.post('/online-study/videos', authMiddleware, roleMiddleware('librarian', 'admin', 'teacher'), upload.single('video'), async (req, res) => {
    try {
        const { subject_id, topic_name, title, description, video_url, playlist_id } = req.body;
        const schoolId = req.user.school_id;

        // Check if it's file upload or URL
        const hasFile = req.file;
        const hasUrl = video_url && video_url.trim();

        if (!subject_id || !topic_name || !title) {
            return res.status(400).json({ error: 'Subject, topic name, and title are required' });
        }

        if (!hasFile && !hasUrl) {
            return res.status(400).json({ error: 'Either a video file or video URL is required' });
        }

        // Get subject name
        let subjectName = null;
        const [subjects] = await db.execute('SELECT name FROM subjects WHERE id = ?', [subject_id]);
        if (subjects.length > 0) {
            subjectName = subjects[0].name;
        }

        let videoPath = null;
        let finalVideoUrl = video_url || null;

        if (hasFile) {
            // Store relative path for the video
            const subjectFolder = req.subjectFolder || 'general';
            videoPath = `/upload/online_study/videos/${subjectFolder}/${req.file.filename}`;
        }

        const [result] = await db.execute(
            `INSERT INTO online_study_videos (subject_id, subject_name, topic_name, title, description, video_url, video_path, school_id, playlist_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [subject_id, subjectName, topic_name, title, description || null, finalVideoUrl, videoPath, schoolId, playlist_id || null]
        );

        res.status(201).json({
            id: result.insertId,
            message: 'Video added successfully',
            video_path: videoPath
        });
    } catch (error) {
        console.error('Error adding video:', error);
        res.status(500).json({ error: 'Failed to add video' });
    }
});

// Delete video (also delete file if exists)
router.delete('/online-study/videos/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Get video info first to delete file
        const [videos] = await db.execute('SELECT video_path FROM online_study_videos WHERE id = ?', [id]);

        if (videos.length === 0) {
            return res.status(404).json({ error: 'Video not found' });
        }

        // Delete file if it exists
        if (videos[0].video_path) {
            const filePath = path.join(__dirname, '..', videos[0].video_path);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        const [result] = await db.execute(
            'DELETE FROM online_study_videos WHERE id = ?',
            [id]
        );

        res.json({ message: 'Video deleted successfully' });
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({ error: 'Failed to delete video' });
    }
});

// Get subjects with video count (filtered by school)
router.get('/online-study/subjects', async (req, res) => {
    try {
        const { school_id } = req.query;

        let query = `
            SELECT 
                s.id,
                s.name,
                COUNT(v.id) as video_count
            FROM subjects s
            LEFT JOIN online_study_videos v ON s.id = v.subject_id`;

        const params = [];

        if (school_id) {
            query += ` AND v.school_id = ?
            WHERE s.school_id = ?`;
            params.push(school_id, school_id);
        }

        query += `
            GROUP BY s.id, s.name
            ORDER BY s.name`;

        const [subjects] = await db.execute(query, params);
        res.json(subjects);
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ error: 'Failed to fetch subjects' });
    }
});

// Serve uploaded videos
router.get('/online-study/stream/:subjectFolder/:filename', (req, res) => {
    const { subjectFolder, filename } = req.params;
    const videoPath = path.join(__dirname, '..', 'upload', 'online_study', 'videos', subjectFolder, filename);

    if (!fs.existsSync(videoPath)) {
        return res.status(404).json({ error: 'Video not found' });
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
        // Handle range requests for video streaming
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(videoPath, { start, end });
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(videoPath).pipe(res);
    }
});

// ==================== BOOK MANAGEMENT ROUTES ====================

// Get All Books
router.get('/books', authMiddleware, async (req, res) => {
    try {
        const { school_id } = req.query;
        const schoolId = school_id || req.user.school_id;

        let query = 'SELECT * FROM library_books WHERE 1=1';
        const params = [];

        if (schoolId) {
            query += ' AND school_id = ?';
            params.push(schoolId);
        }

        query += ' ORDER BY created_at DESC';

        const [books] = await db.query(query, params);
        res.json(books);
    } catch (error) {
        console.error('Fetch books error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// Add New Book
router.post('/books', authMiddleware, roleMiddleware('librarian'), async (req, res) => {
    try {
        const { isbn, title, author, category, publisher, year, total_copies, shelf_location } = req.body;

        // Validation
        if (!isbn || !title || !author || !category || !total_copies) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        const schoolId = req.user.school_id;

        // Check if ISBN already exists in this school
        const [existing] = await db.query(
            'SELECT id FROM library_books WHERE isbn = ? AND school_id = ?',
            [isbn, schoolId]
        );
        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Book with this ISBN already exists in your library'
            });
        }

        const query = `
            INSERT INTO library_books 
            (isbn, title, author, category, publisher, year, total_copies, available_copies, shelf_location, school_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(query, [
            isbn, title, author, category, publisher, year,
            total_copies, total_copies, shelf_location, schoolId
        ]);

        res.status(201).json({
            success: true,
            message: 'Book added successfully',
            bookId: result.insertId
        });

    } catch (error) {
        console.error('Add book error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// Update Book Details
router.put('/books/:id', authMiddleware, roleMiddleware('librarian', 'admin'), async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const bookId = req.params.id;
        const { isbn, title, author, category, publisher, year, total_copies, shelf_location } = req.body;

        // 1. Get existing book data
        const [existing] = await connection.query('SELECT total_copies, available_copies FROM library_books WHERE id = ? FOR UPDATE', [bookId]);

        if (existing.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Book not found' });
        }

        const oldTotal = existing[0].total_copies;
        const oldAvailable = existing[0].available_copies;
        const newTotal = parseInt(total_copies);
        let newAvailable = oldAvailable;

        // 2. Adjust available copies if total copies changed
        if (newTotal !== oldTotal) {
            const diff = newTotal - oldTotal;
            newAvailable = oldAvailable + diff;

            if (newAvailable < 0) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Cannot reduce total copies to ${newTotal}. ${oldTotal - oldAvailable} copies are currently issued.`
                });
            }
        }

        // 3. Update Book
        const query = `
            UPDATE library_books 
            SET isbn = ?, title = ?, author = ?, category = ?, publisher = ?, year = ?, total_copies = ?, available_copies = ?, shelf_location = ?
            WHERE id = ?
        `;

        await connection.query(query, [
            isbn, title, author, category, publisher, year,
            newTotal, newAvailable, shelf_location, bookId
        ]);

        await connection.commit();
        res.json({ success: true, message: 'Book updated successfully' });

    } catch (error) {
        await connection.rollback();
        console.error('Update book error:', error);
        res.status(500).json({ success: false, message: 'Failed to update book', error: error.message });
    } finally {
        connection.release();
    }
});

// Delete Book
router.delete('/books/:id', authMiddleware, roleMiddleware('librarian', 'admin'), async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const bookId = req.params.id;

        // 1. Check for active issues
        const [activeIssues] = await connection.query(
            "SELECT count(*) as count FROM library_issued_books WHERE book_id = ? AND status = 'issued'",
            [bookId]
        );

        if (activeIssues[0].count > 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: `Cannot delete book. ${activeIssues[0].count} copies are currently issued.`
            });
        }

        // 2. Delete Book
        await connection.query('DELETE FROM library_books WHERE id = ?', [bookId]);

        await connection.commit();
        res.json({ success: true, message: 'Book deleted successfully' });

    } catch (error) {
        await connection.rollback();
        console.error('Delete book error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete book' });
    } finally {
        connection.release();
    }
});

// Search Students (Roll No or Name)
router.get('/students/search', authMiddleware, async (req, res) => {
    try {
        const { query } = req.query;
        const schoolId = req.user.school_id;

        if (!query || query.length < 2) {
            return res.json([]);
        }

        const sql = `
            SELECT s.id, s.roll_no, u.name, s.class, s.section 
            FROM students s 
            JOIN users u ON s.user_id = u.id 
            WHERE (s.roll_no LIKE ? OR u.name LIKE ?) AND s.school_id = ?
            LIMIT 10
        `;
        const [students] = await db.query(sql, [`%${query}%`, `%${query}%`, schoolId]);
        res.json(students);
    } catch (error) {
        console.error('Search students error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

// Search Books (ISBN or Title)
router.get('/books/search', authMiddleware, async (req, res) => {
    try {
        const { query } = req.query;
        const schoolId = req.user.school_id;

        if (!query || query.length < 2) {
            return res.json([]);
        }

        const sql = `
            SELECT id, isbn, title, author, available_copies 
            FROM library_books 
            WHERE (isbn LIKE ? OR title LIKE ?) AND school_id = ?
            LIMIT 10
        `;
        const [books] = await db.query(sql, [`%${query}%`, `%${query}%`, schoolId]);
        res.json(books);
    } catch (error) {
        console.error('Search books error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

// Issue Book
router.post('/issue', authMiddleware, roleMiddleware('librarian'), async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { student_id, book_id, issue_date, due_date } = req.body;

        // 1. Check book availability
        const [book] = await connection.query(
            'SELECT available_copies FROM library_books WHERE id = ? FOR UPDATE',
            [book_id]
        );

        if (book.length === 0 || book[0].available_copies < 1) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Book is not available'
            });
        }

        // 2. Issue Book
        await connection.query(
            `INSERT INTO library_issued_books (student_id, book_id, issue_date, due_date, issued_by) 
             VALUES (?, ?, ?, ?, ?)`,
            [student_id, book_id, issue_date, due_date, req.user.id]
        );

        // 3. Update Available Copies
        await connection.query(
            'UPDATE library_books SET available_copies = available_copies - 1 WHERE id = ?',
            [book_id]
        );

        await connection.commit();
        res.status(201).json({
            success: true,
            message: 'Book issued successfully'
        });

    } catch (error) {
        await connection.rollback();
        console.error('Issue book error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to issue book'
        });
    } finally {
        connection.release();
    }
});

// Search Issued Books
router.get('/issued/search', authMiddleware, async (req, res) => {
    try {
        const { query, type } = req.query;
        if (!query || query.length < 2) {
            return res.json([]);
        }

        let whereClause = "ib.status = 'issued'";
        const params = [];
        const searchTerm = `%${query}%`;

        if (type === 'student') {
            whereClause += " AND (s.roll_no LIKE ? OR u.name LIKE ?)";
            params.push(searchTerm, searchTerm);
        } else if (type === 'book') {
            whereClause += " AND (lb.isbn LIKE ? OR lb.title LIKE ?)";
            params.push(searchTerm, searchTerm);
        } else {
            // Fallback to broad search if no type specified
            whereClause += " AND (s.roll_no LIKE ? OR u.name LIKE ? OR lb.isbn LIKE ? OR lb.title LIKE ?)";
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        const sql = `
            SELECT 
                ib.id, 
                ib.issue_date, 
                ib.due_date,
                s.roll_no, 
                u.name as student_name,
                lb.title as book_title,
                lb.isbn
            FROM library_issued_books ib
            JOIN students s ON ib.student_id = s.id
            JOIN users u ON s.user_id = u.id
            JOIN library_books lb ON ib.book_id = lb.id
            WHERE ${whereClause}
            LIMIT 10
        `;

        const [issuedBooks] = await db.query(sql, params);
        res.json(issuedBooks);
    } catch (error) {
        console.error('Search issued books error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

// Return Book
router.post('/return', authMiddleware, roleMiddleware('librarian'), async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { issue_id, return_date, fine_amount, remarks } = req.body;

        // 1. Get book_id from issue record
        const [issueRecord] = await connection.query(
            'SELECT book_id FROM library_issued_books WHERE id = ?',
            [issue_id]
        );

        if (issueRecord.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Issue record not found' });
        }

        const bookId = issueRecord[0].book_id;

        // 2. Update Issue Record (Mark as Returned)
        await connection.query(
            `UPDATE library_issued_books 
             SET status = 'returned', return_date = ?, fine_amount = ?, remarks = ?
             WHERE id = ?`,
            [return_date, fine_amount || 0, remarks, issue_id]
        );

        // 3. Update Book Availability (Increment)
        await connection.query(
            'UPDATE library_books SET available_copies = available_copies + 1 WHERE id = ?',
            [bookId]
        );

        await connection.commit();
        res.json({ success: true, message: 'Book returned and archived successfully' });

    } catch (error) {
        await connection.rollback();
        console.error('Return book error:', error);
        res.status(500).json({ success: false, message: 'Failed to return book' });
    } finally {
        connection.release();
    }
});

// List Issued Books (All Active Issues)
router.get('/issued', authMiddleware, async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        const sql = `
            SELECT 
                ib.id, 
                ib.student_id,
                ib.book_id,
                ib.issue_date, 
                ib.due_date,
                ib.created_at,
                s.roll_no, 
                u.name as student_name,
                lb.title as book_title,
                lb.author,
                lb.isbn
            FROM library_issued_books ib
            JOIN students s ON ib.student_id = s.id
            JOIN users u ON s.user_id = u.id
            JOIN library_books lb ON ib.book_id = lb.id
            WHERE ib.status = 'issued' AND lb.school_id = ?
            ORDER BY ib.created_at DESC
            LIMIT 100
        `;
        const [issuedBooks] = await db.query(sql, [schoolId]);
        res.json(issuedBooks);
    } catch (error) {
        console.error('List issued books error:', error);
        res.status(500).json({ error: 'Failed to fetch issued books' });
    }
});

// Update Issue Record (Edit)
router.put('/issued/:id', authMiddleware, roleMiddleware('librarian'), async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const issueId = req.params.id;
        const { student_id, book_id, issue_date, due_date } = req.body;

        // 1. Get existing record to check for book change
        const [existing] = await connection.query(
            'SELECT book_id FROM library_issued_books WHERE id = ?',
            [issueId]
        );

        if (existing.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Issue record not found' });
        }

        const oldBookId = existing[0].book_id;

        // 2. Handle Book Change
        if (book_id && book_id !== oldBookId) {
            // Check new book availability
            const [newBook] = await connection.query(
                'SELECT available_copies FROM library_books WHERE id = ? FOR UPDATE',
                [book_id]
            );

            if (newBook.length === 0 || newBook[0].available_copies < 1) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'New book is not available' });
            }

            // Increment old book
            await connection.query(
                'UPDATE library_books SET available_copies = available_copies + 1 WHERE id = ?',
                [oldBookId]
            );

            // Decrement new book
            await connection.query(
                'UPDATE library_books SET available_copies = available_copies - 1 WHERE id = ?',
                [book_id]
            );
        }

        // 3. Update Issue Record
        await connection.query(
            `UPDATE library_issued_books 
             SET student_id = ?, book_id = ?, issue_date = ?, due_date = ?
             WHERE id = ?`,
            [student_id, book_id, issue_date, due_date, issueId]
        );

        await connection.commit();
        res.json({ success: true, message: 'Issue record updated successfully' });

    } catch (error) {
        await connection.rollback();
        console.error('Update issue error:', error);
        res.status(500).json({ success: false, message: 'Failed to update issue record' });
    } finally {
        connection.release();
    }
});

// List Issued Book History (Returned Books)
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const { query } = req.query;
        let sql = `
            SELECT 
                ib.id, 
                ib.issue_date, 
                ib.due_date,
                ib.return_date,
                ib.updated_at,
                ib.fine_amount,
                ib.remarks,
                s.roll_no, 
                u.name as student_name,
                lb.title as book_title,
                lb.isbn,
                lb.author
            FROM library_issued_books ib
            JOIN students s ON ib.student_id = s.id
            JOIN users u ON s.user_id = u.id
            JOIN library_books lb ON ib.book_id = lb.id
            WHERE ib.status = 'returned'
            ORDER BY ib.updated_at DESC
        `;

        const params = [];
        if (query && query.length >= 2) {
            sql += ` AND (u.name LIKE ? OR s.roll_no LIKE ? OR lb.title LIKE ? OR lb.isbn LIKE ?)`;
            const term = `%${query}%`;
            params.push(term, term, term, term);
        }

        const [history] = await db.query(sql, params);
        res.json(history);
    } catch (error) {
        console.error('List history error:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Get dashboard statistics
router.get('/dashboard-stats', authMiddleware, roleMiddleware('librarian', 'admin'), async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const stats = {};

        // 1. Total Books & Available Books (filtered by school)
        const [books] = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN available_copies > 0 THEN 1 ELSE 0 END) as available_titles,
                SUM(total_copies) as total_copies,
                SUM(available_copies) as available_copies
            FROM library_books
            WHERE school_id = ?
        `, [schoolId]);
        stats.totalBooks = books[0].total_copies || 0;
        stats.availableBooks = books[0].available_copies || 0;

        // 2. Issued & Overdue Books (filtered by school via books table)
        const [issued] = await db.execute(`
            SELECT 
                COUNT(*) as total_issued,
                SUM(CASE WHEN ib.due_date < CURDATE() THEN 1 ELSE 0 END) as overdue
            FROM library_issued_books ib 
            JOIN library_books lb ON ib.book_id = lb.id
            WHERE ib.status = 'issued' AND lb.school_id = ?
        `, [schoolId]);
        stats.issuedBooks = issued[0].total_issued || 0;
        stats.overdueBooks = issued[0].overdue || 0;

        // 3. Total Members (Students + Teachers from this school)
        const [members] = await db.execute(`
            SELECT COUNT(*) as total 
            FROM users 
            WHERE role IN ('student', 'teacher') AND school_id = ?
        `, [schoolId]);
        stats.totalMembers = members[0].total || 0;

        // 4. Active Members (Users who interacted in last 30 days from this school)
        const [active] = await db.execute(`
            SELECT COUNT(DISTINCT ib.student_id) as active 
            FROM library_issued_books ib
            JOIN library_books lb ON ib.book_id = lb.id
            WHERE lb.school_id = ? AND (
                ib.issue_date >= DATE_SUB(NOW(), INTERVAL 30 DAY) 
                OR ib.return_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            )
        `, [schoolId]);
        stats.activeMembers = active[0].active || 0;

        // 5. Total Fine Collected (from this school's library)
        const [fines] = await db.execute(`
            SELECT SUM(ib.fine_amount) as total_fine 
            FROM library_issued_books ib
            JOIN library_books lb ON ib.book_id = lb.id
            WHERE ib.status = 'returned' AND lb.school_id = ?
        `, [schoolId]);
        stats.totalFine = fines[0].total_fine || 0;

        // 6. Recent Activities (Union of Issues and Returns)
        // Note: Union queries can be complex in raw SQL depending on schema, so we'll do two quick queries and merge in JS for simplicity or use a specific UNION.
        const [recentIssues] = await db.execute(`
            SELECT 
                ib.id, 'issue' as type, ib.issue_date as date, 
                lb.title as book_title, u.name as student_name
            FROM library_issued_books ib
            JOIN library_books lb ON ib.book_id = lb.id
            JOIN students s ON ib.student_id = s.id
            JOIN users u ON s.user_id = u.id
            WHERE lb.school_id = ?
            ORDER BY ib.issue_date DESC LIMIT 5
        `, [schoolId]);

        const [recentReturns] = await db.execute(`
            SELECT 
                ib.id, 'return' as type, ib.return_date as date, 
                lb.title as book_title, u.name as student_name
            FROM library_issued_books ib
            JOIN library_books lb ON ib.book_id = lb.id
            JOIN students s ON ib.student_id = s.id
            JOIN users u ON s.user_id = u.id
            WHERE ib.status = 'returned' AND lb.school_id = ?
            ORDER BY ib.return_date DESC LIMIT 5
        `, [schoolId]);

        // Merge and sort
        const activities = [...recentIssues, ...recentReturns]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5)
            .map(act => ({
                id: act.id,
                action: act.type === 'issue' ? 'Book Issued' : 'Book Returned',
                book: act.book_title,
                student: act.student_name,
                time: new Date(act.date), // Frontend will format relative time
                type: act.type
            }));

        // 7. Popular Books (filtered by school)
        const [popular] = await db.execute(`
            SELECT 
                lb.id, lb.title, lb.author, lb.available_copies,
                COUNT(ib.id) as issue_count
            FROM library_books lb
            LEFT JOIN library_issued_books ib ON lb.id = ib.book_id
            WHERE lb.school_id = ?
            GROUP BY lb.id
            ORDER BY issue_count DESC
            LIMIT 5
        `, [schoolId]);

        const popularBooks = popular.map(b => ({
            id: b.id,
            title: b.title,
            author: b.author,
            issued: b.issue_count,
            available: b.available_copies
        }));

        res.json({
            stats,
            recentActivities: activities,
            popularBooks
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

// Delete Issue Record (Void Transaction)
router.delete('/issued/:id', authMiddleware, roleMiddleware('librarian'), async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const issueId = req.params.id;

        // 1. Get existing record to ensure it exists and get book_id
        const [existing] = await connection.query(
            'SELECT book_id FROM library_issued_books WHERE id = ?',
            [issueId]
        );

        if (existing.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Issue record not found' });
        }

        const bookId = existing[0].book_id;

        // 2. Delete Issue Record
        await connection.query(
            'DELETE FROM library_issued_books WHERE id = ?',
            [issueId]
        );

        // 3. Restore Book Inventory
        await connection.query(
            'UPDATE library_books SET available_copies = available_copies + 1 WHERE id = ?',
            [bookId]
        );

        await connection.commit();
        res.json({ success: true, message: 'Issue record deleted successfully' });

    } catch (error) {
        await connection.rollback();
        console.error('Delete issue error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete issue record' });
    } finally {
        connection.release();
    }
});

// ==================== NOTES UPLOAD CONFIG ====================
const notesStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '..', 'upload', 'online_study', 'notes');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `note-${uniqueSuffix}${ext}`);
    }
});

const notesUpload = multer({
    storage: notesStorage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf' ||
            file.mimetype.includes('msword') ||
            file.mimetype.includes('officedocument')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF and Docs allowed.'), false);
        }
    }
});

// ==================== PLAYLIST ROUTES ====================

// Create Playlist
router.post('/online-study/playlists', authMiddleware, roleMiddleware('librarian', 'admin', 'teacher'), async (req, res) => {
    try {
        const { title, description, subject_id } = req.body;
        const schoolId = req.user.school_id;

        const [result] = await db.execute(
            `INSERT INTO study_playlists (school_id, subject_id, title, description, created_by)
             VALUES (?, ?, ?, ?, ?)`,
            [schoolId, subject_id, title, description, req.user.id]
        );

        res.status(201).json({ success: true, message: 'Playlist created', id: result.insertId });
    } catch (error) {
        console.error('Create playlist error:', error);
        res.status(500).json({ success: false, message: 'Failed to create playlist' });
    }
});

// Get Playlists
router.get('/online-study/playlists', async (req, res) => {
    try {
        const { school_id, subject_id } = req.query;
        let query = `
            SELECT p.*, s.name as subject_name, COUNT(v.id) as video_count
            FROM study_playlists p
            LEFT JOIN subjects s ON p.subject_id = s.id
            LEFT JOIN online_study_videos v ON p.id = v.playlist_id
            WHERE 1=1
        `;
        const params = [];

        if (school_id) {
            query += ' AND p.school_id = ?';
            params.push(school_id);
        }
        if (subject_id) {
            query += ' AND p.subject_id = ?';
            params.push(subject_id);
        }

        query += ' GROUP BY p.id ORDER BY p.created_at DESC';

        const [playlists] = await db.execute(query, params);
        res.json(playlists);
    } catch (error) {
        console.error('Get playlists error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch playlists' });
    }
});

// Delete Playlist
router.delete('/online-study/playlists/:id', authMiddleware, roleMiddleware('librarian', 'admin'), async (req, res) => {
    try {
        // Videos will have playlist_id set to NULL due to ON DELETE SET NULL foreign key
        await db.execute('DELETE FROM study_playlists WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Playlist deleted' });
    } catch (error) {
        console.error('Delete playlist error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete playlist' });
    }
});

// ==================== NOTES ROUTES ====================

// Upload Note
router.post('/online-study/notes', authMiddleware, roleMiddleware('librarian', 'admin', 'teacher'), notesUpload.single('file'), async (req, res) => {
    try {
        const { title, parent_type, parent_id } = req.body;
        const schoolId = req.user.school_id;

        if (!req.file) return res.status(400).json({ success: false, message: 'File is required' });

        const filePath = `/upload/online_study/notes/${req.file.filename}`;

        const [result] = await db.execute(
            `INSERT INTO study_notes (school_id, title, file_path, parent_type, parent_id, created_by)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [schoolId, title, filePath, parent_type, parent_id, req.user.id]
        );

        res.status(201).json({ success: true, message: 'Note uploaded', id: result.insertId });
    } catch (error) {
        console.error('Upload note error:', error);
        res.status(500).json({ success: false, message: 'Failed to upload note' });
    }
});

// Get Notes
router.get('/online-study/notes', async (req, res) => {
    try {
        const { parent_type, parent_id } = req.query;
        // Basic filtering, potentially add school_id if needed for general list

        const [notes] = await db.execute(
            'SELECT * FROM study_notes WHERE parent_type = ? AND parent_id = ? ORDER BY created_at DESC',
            [parent_type, parent_id]
        );
        res.json(notes);
    } catch (error) {
        console.error('Get notes error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch notes' });
    }
});

// Delete Note
router.delete('/online-study/notes/:id', authMiddleware, roleMiddleware('librarian', 'admin'), async (req, res) => {
    try {
        const [note] = await db.execute('SELECT file_path FROM study_notes WHERE id = ?', [req.params.id]);
        if (note.length > 0) {
            const fullPath = path.join(__dirname, '..', note[0].file_path);
            if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        }

        await db.execute('DELETE FROM study_notes WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Note deleted' });
    } catch (error) {
        console.error('Delete note error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete note' });
    }
});

module.exports = router;