const db = require('../config/database');

exports.createPost = async (req, res) => {
    try {
        const { title, content, isDraft } = req.body;
        const file = req.file;

        if (!title || !file) {
            return res.status(400).json({ message: 'Title and media file are required' });
        }

        const mediaType = file.mimetype.startsWith('video') ? 'VIDEO' : 'IMAGE';
        const mediaPath = '/uploads/' + file.filename;
        const status = isDraft === 'true' ? 'DRAFT' : 'PENDING';

        await db.query(
            'INSERT INTO posts (user_id, title, content, media_type, media_path, status) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user.id, title, content, mediaType, mediaPath, status]
        );

        res.status(201).json({ message: status === 'DRAFT' ? 'Post saved as draft' : 'Post submitted for review' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getPosts = async (req, res) => {
    try {
        const { status } = req.query;
        const { role, id } = req.user;

        let query = 'SELECT posts.*, users.username FROM posts JOIN users ON posts.user_id = users.id';
        const params = [];
        const conditions = [];

        // Role-based filtering
        if (role === 'CREATOR' || role === 'USER') {
            conditions.push('posts.user_id = ?');
            params.push(id);
        }

        // Status filtering
        if (status) {
            if (status === 'DRAFT') {
                // Include explicit matches, NULLs, or empty strings
                conditions.push('(posts.status = ? OR posts.status IS NULL OR posts.status = "")');
                params.push(status);
            } else {
                conditions.push('posts.status = ?');
                params.push(status);
            }
        }

        // Date filtering
        if (req.query.startDate && req.query.endDate) {
            conditions.push('posts.created_at BETWEEN ? AND ?');
            params.push(`${req.query.startDate} 00:00:00`, `${req.query.endDate} 23:59:59`);
        }

        // Filter by specific user (for filtering by specific creator/user)
        if (req.query.user_id) {
            conditions.push('posts.user_id = ?');
            params.push(req.query.user_id);
        }

        // Privacy: Admins/Managers should not see others' drafts
        // Creators/Users are already restricted to their own ID above
        if (role === 'ADMIN' || role === 'MANAGER') {
            conditions.push('(posts.status != "DRAFT" OR posts.user_id = ?)');
            params.push(id);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        
        query += ' ORDER BY posts.created_at DESC';

        console.log('--- Debug GetPosts ---');
        console.log('Query:', query);
        console.log('Params:', params);

        const [posts] = await db.query(query, params);
        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updatePostStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reason, socialPlatforms } = req.body; // 'APPROVED', 'REJECTED', 'PUBLISHED', socialPlatforms: ['FACEBOOK', 'WHATSAPP']

        if (!['APPROVED', 'REJECTED', 'PUBLISHED'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        let query = 'UPDATE posts SET status = ?';
        const params = [status];

        if (status === 'REJECTED') {
            query += ', rejection_reason = ?';
            params.push(reason || '');
        }

        query += ' WHERE id = ?';
        params.push(id);

        await db.query(query, params);

        // Social Publishing Logic
        if ((status === 'APPROVED' || status === 'PUBLISHED') && socialPlatforms && Array.isArray(socialPlatforms)) {
            // Check for Facebook
            if (socialPlatforms.includes('FACEBOOK')) {
                console.log(`[Auto-Publish] Posting Post ID ${id} to FACEBOOK PAGE...`);
                // Implementation: Call Facebook Graph API here
            }

            // Check for WhatsApp
            if (socialPlatforms.includes('WHATSAPP')) {
                console.log(`[Auto-Publish] Sending Post ID ${id} to WHATSAPP CHANNEL...`);
                // Implementation: Call WhatsApp Business API here
            }
        }

        res.json({ message: `Post status updated to ${status}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.publishToSocials = async (req, res) => {
    try {
        const { id } = req.params;
        const { platform } = req.body; // 'FACEBOOK', 'ALL'

        // Check Access
        if (!['ADMIN', 'MANAGER'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const [posts] = await db.query('SELECT * FROM posts WHERE id = ?', [id]);
        if (posts.length === 0) return res.status(404).json({ message: 'Post not found' });
        const post = posts[0];

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Update status to PUBLISHED if not already
        if (post.status !== 'PUBLISHED') {
            await db.query('UPDATE posts SET status = "PUBLISHED" WHERE id = ?', [id]);
        }

        // In a real app, we would use the Facebook Graph API here with req.user's connected token.
        // For now, we simulate success.
        console.log(`[SocialMock] Published post ${id} to ${platform}`);

        res.json({ message: `Successfully published to ${platform}!` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const { id } = req.params;

        const [posts] = await db.query('SELECT * FROM posts WHERE id = ?', [id]);
        if (posts.length === 0) return res.status(404).json({ message: 'Post not found' });
        const post = posts[0];

        // Access Control: 
        // 1. Admin can delete anything
        // 2. Owner can delete their own DRAFT
        const isOwner = post.user_id === req.user.id;
        const isDraft = post.status === 'DRAFT';

        if (req.user.role !== 'ADMIN') {
            if (!(isOwner && isDraft)) {
                return res.status(403).json({ message: 'Access denied: You can only delete your own drafts.' });
            }
        }

        // Delete file if exists
        if (post.media_path) {
            const filePath = require('path').join(__dirname, '..', post.media_path);
            const fs = require('fs');
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // Delete from DB
        await db.query('DELETE FROM posts WHERE id = ?', [id]);
        res.json({ message: 'Post deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};



exports.getSystemStats = async (req, res) => {
    try {
        // Admin and Manager can see stats
        if (!['ADMIN', 'MANAGER'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Parallel queries for efficiency
        const [totalPosts] = await db.query('SELECT COUNT(*) as count FROM posts');
        const [publishedPosts] = await db.query('SELECT COUNT(*) as count FROM posts WHERE status = "PUBLISHED"');
        const [pendingPosts] = await db.query('SELECT COUNT(*) as count FROM posts WHERE status = "PENDING"');
        const [users] = await db.query('SELECT COUNT(*) as count FROM users');
        const [usersByRole] = await db.query('SELECT role, COUNT(*) as count FROM users GROUP BY role');

        res.json({
            total_posts: totalPosts[0].count,
            published_posts: publishedPosts[0].count,
            pending_posts: pendingPosts[0].count,
            total_users: users[0].count,
            users_breakdown: usersByRole
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getPostById = async (req, res) => {
    try {
        const [posts] = await db.query(
            'SELECT posts.*, users.username FROM posts JOIN users ON posts.user_id = users.id WHERE posts.id = ?', 
            [req.params.id]
        );

        if (posts.length === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const post = posts[0];

        // Access Control: Admins/Managers can view all, Creators only their own
        if (req.user.role === 'CREATOR' && post.user_id !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updatePost = async (req, res) => {
    try {
        const { title, content } = req.body;
        const newFile = req.file;
        
        // Fetch existing post to check ownership and status
        const [posts] = await db.query('SELECT * FROM posts WHERE id = ?', [req.params.id]);
        if (posts.length === 0) return res.status(404).json({ message: 'Post not found' });
        const post = posts[0];

        if (req.user.role === 'CREATOR' && post.user_id !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Logic for re-submission/update
        let newStatus = post.status;
        let query = 'UPDATE posts SET title = ?, content = ?';
        let params = [title, content];

        // Handle Media Update
        if (newFile) {
            const mediaType = newFile.mimetype.startsWith('video') ? 'VIDEO' : 'IMAGE';
            const mediaPath = '/uploads/' + newFile.filename;

            query += ', media_type = ?, media_path = ?';
            params.push(mediaType, mediaPath);
        }

        // Handle Status Update (Draft vs Submit)
        const { isDraft } = req.body;
        if (isDraft === 'true') {
            newStatus = 'DRAFT';
        } else if (isDraft === 'false') {
            newStatus = 'PENDING';
        } else if (req.user.role === 'CREATOR' && post.status === 'REJECTED') {
            // Fallback: If isDraft is not specified but it's a rejected post being edited, assume resubmission
            newStatus = 'PENDING';
        }

        if (newStatus !== post.status) {
            query += ', status = ?';
            params.push(newStatus);
        }

        query += ' WHERE id = ?';
        params.push(req.params.id);

        await db.query(query, params);

        res.json({ message: 'Post updated successfully', status: newStatus });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getUserStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let query = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'DRAFT' THEN 1 ELSE 0 END) as drafts,
                SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected,
                SUM(CASE WHEN status = 'PUBLISHED' THEN 1 ELSE 0 END) as published
            FROM posts 
            WHERE user_id = ?
        `;
        const params = [req.user.id];

        if (startDate && endDate) {
            query += ' AND created_at BETWEEN ? AND ?';
            params.push(`${startDate} 00:00:00`, `${endDate} 23:59:59`);
        }

        const [stats] = await db.query(query, params);
        res.json(stats[0] || {});
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getUserStatsById = async (req, res) => {
    try {
        // Only Admin or Manager can view other users' stats
        if (!['ADMIN', 'MANAGER'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { id } = req.params;
        const { startDate, endDate } = req.query;

        let query = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'DRAFT' THEN 1 ELSE 0 END) as drafts,
                SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected,
                SUM(CASE WHEN status = 'PUBLISHED' THEN 1 ELSE 0 END) as published
            FROM posts 
            WHERE user_id = ?
        `;
        const params = [id];

        if (startDate && endDate) {
            query += ' AND created_at BETWEEN ? AND ?';
            params.push(`${startDate} 00:00:00`, `${endDate} 23:59:59`);
        }

        const [stats] = await db.query(query, params);
        
        // Also fetch user details for the header
        const [users] = await db.query('SELECT username, email, role FROM users WHERE id = ?', [id]);
        
        res.json({ stats: stats[0] || {}, user: users[0] || {} });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getDashboardActivity = async (req, res) => {
    try {
        if (!['ADMIN', 'MANAGER'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const [users] = await db.query(`
            SELECT id, username, created_at, 'USER_JOINED' as type 
            FROM users 
            ORDER BY created_at DESC LIMIT 5
        `);

        const [posts] = await db.query(`
            SELECT p.id, p.title, p.created_at, 'POST_CREATED' as type, u.username 
            FROM posts p 
            JOIN users u ON p.user_id = u.id 
            ORDER BY p.created_at DESC LIMIT 5
        `);

        const activity = [...users, ...posts]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 10);

        res.json(activity);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getStorageStats = async (req, res) => {
    try {
        if (!['ADMIN', 'MANAGER'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const [postMedia] = await db.query('SELECT COUNT(*) as count FROM posts WHERE media_path IS NOT NULL');
        // Estimate: 8MB avg for video/high-res image
        const usedMB = postMedia[0].count * 8; 
        
        // Mock distribution
        const stats = {
            used_gb: (usedMB / 1024).toFixed(2),
            total_gb: 100, // 100GB Plan
            images_gb: ((usedMB * 0.3) / 1024).toFixed(2),
            videos_gb: ((usedMB * 0.7) / 1024).toFixed(2),
            docs_gb: 0.1 // minimal
        };

        res.json(stats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
