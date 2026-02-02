const Post = require('../models/Post');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

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

        await Post.create({
            user_id: req.user.id,
            title,
            content,
            media_type: mediaType,
            media_path: mediaPath,
            status
        });

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

        let query = {};

        // Role-based filtering
        if (role === 'CREATOR' || role === 'USER') {
            query.user_id = id;
        }

        // Status filtering
        if (status) {
            if (status === 'DRAFT') {
                query.$or = [{ status: 'DRAFT' }, { status: null }, { status: '' }];
            } else {
                query.status = status;
            }
        }

        // Date filtering
        if (req.query.startDate && req.query.endDate) {
            query.created_at = {
                $gte: new Date(`${req.query.startDate}T00:00:00`),
                $lte: new Date(`${req.query.endDate}T23:59:59`)
            };
        }

        // Filter by specific user
        if (req.query.user_id) {
            query.user_id = req.query.user_id;
        }

        // Privacy: Admins/Managers should not see others' drafts
        if (role === 'ADMIN' || role === 'MANAGER') {
            if (!status || status !== 'DRAFT') {
                query.$or = [
                    { status: { $ne: 'DRAFT' } },
                    { user_id: id }
                ];
            }
        }

        const posts = await Post.find(query)
            .populate('user_id', 'username profile_picture')
            .sort({ created_at: -1 });

        // Transform to include username at root level
        const transformedPosts = posts.map(post => ({
            ...post.toObject(),
            username: post.user_id?.username,
            user_profile_picture: post.user_id?.profile_picture
        }));

        res.json(transformedPosts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updatePostStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reason, socialPlatforms } = req.body;

        if (!['APPROVED', 'REJECTED', 'PUBLISHED'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const updateData = { status };
        if (status === 'REJECTED') {
            updateData.rejection_reason = reason || '';
        }

        await Post.findByIdAndUpdate(id, updateData);

        // Social Publishing Logic
        if ((status === 'APPROVED' || status === 'PUBLISHED') && socialPlatforms && Array.isArray(socialPlatforms)) {
            if (socialPlatforms.includes('FACEBOOK')) {
                console.log(`[Auto-Publish] Posting Post ID ${id} to FACEBOOK PAGE...`);
            }
            if (socialPlatforms.includes('WHATSAPP')) {
                console.log(`[Auto-Publish] Sending Post ID ${id} to WHATSAPP CHANNEL...`);
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
        const { platform } = req.body;

        if (!['ADMIN', 'MANAGER'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const post = await Post.findById(id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (post.status !== 'PUBLISHED') {
            await Post.findByIdAndUpdate(id, { status: 'PUBLISHED' });
        }

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

        const post = await Post.findById(id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const isOwner = post.user_id.toString() === req.user.id.toString();
        const isDraft = post.status === 'DRAFT';

        if (req.user.role !== 'ADMIN') {
            if (!(isOwner && isDraft)) {
                return res.status(403).json({ message: 'Access denied: You can only delete your own drafts.' });
            }
        }

        // Delete file if exists
        if (post.media_path) {
            const relativePath = post.media_path.startsWith('/') ? post.media_path.slice(1) : post.media_path;
            const filePath = path.join(__dirname, '..', relativePath);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await Post.findByIdAndDelete(id);
        res.json({ message: 'Post deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getSystemStats = async (req, res) => {
    try {
        if (!['ADMIN', 'MANAGER'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const [totalPosts, publishedPosts, pendingPosts, totalUsers, usersByRole] = await Promise.all([
            Post.countDocuments(),
            Post.countDocuments({ status: 'PUBLISHED' }),
            Post.countDocuments({ status: 'PENDING' }),
            User.countDocuments(),
            User.aggregate([
                { $group: { _id: '$role', count: { $sum: 1 } } }
            ])
        ]);

        res.json({
            total_posts: totalPosts,
            published_posts: publishedPosts,
            pending_posts: pendingPosts,
            total_users: totalUsers,
            users_breakdown: usersByRole.map(r => ({ role: r._id, count: r.count }))
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('user_id', 'username profile_picture');

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Access Control
        if (req.user.role === 'CREATOR' && post.user_id._id.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const response = {
            ...post.toObject(),
            username: post.user_id?.username
        };

        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updatePost = async (req, res) => {
    try {
        const { title, content } = req.body;
        const newFile = req.file;
        
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (req.user.role === 'CREATOR' && post.user_id.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const updateData = { title, content };

        // Handle Media Update
        if (newFile) {
            const mediaType = newFile.mimetype.startsWith('video') ? 'VIDEO' : 'IMAGE';
            const mediaPath = '/uploads/' + newFile.filename;
            updateData.media_type = mediaType;
            updateData.media_path = mediaPath;
        }

        // Handle Status Update
        const { isDraft } = req.body;
        if (isDraft === 'true') {
            updateData.status = 'DRAFT';
        } else if (isDraft === 'false') {
            updateData.status = 'PENDING';
        } else if (req.user.role === 'CREATOR' && post.status === 'REJECTED') {
            updateData.status = 'PENDING';
        }

        await Post.findByIdAndUpdate(req.params.id, updateData);

        res.json({ message: 'Post updated successfully', status: updateData.status || post.status });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getUserStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        let matchQuery = { user_id: req.user.id };
        
        if (startDate && endDate) {
            matchQuery.created_at = {
                $gte: new Date(`${startDate}T00:00:00`),
                $lte: new Date(`${endDate}T23:59:59`)
            };
        }

        const stats = await Post.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    drafts: { $sum: { $cond: [{ $eq: ['$status', 'DRAFT'] }, 1, 0] } },
                    pending: { $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] } },
                    approved: { $sum: { $cond: [{ $eq: ['$status', 'APPROVED'] }, 1, 0] } },
                    rejected: { $sum: { $cond: [{ $eq: ['$status', 'REJECTED'] }, 1, 0] } },
                    published: { $sum: { $cond: [{ $eq: ['$status', 'PUBLISHED'] }, 1, 0] } }
                }
            }
        ]);

        res.json(stats[0] || { total: 0, drafts: 0, pending: 0, approved: 0, rejected: 0, published: 0 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getUserStatsById = async (req, res) => {
    try {
        if (!['ADMIN', 'MANAGER'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { id } = req.params;
        const { startDate, endDate } = req.query;

        // Convert string id to ObjectId for aggregation
        const mongoose = require('mongoose');
        let matchQuery = { user_id: new mongoose.Types.ObjectId(id) };

        if (startDate && endDate) {
            matchQuery.created_at = {
                $gte: new Date(`${startDate}T00:00:00`),
                $lte: new Date(`${endDate}T23:59:59`)
            };
        }

        const [stats, user] = await Promise.all([
            Post.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        drafts: { $sum: { $cond: [{ $eq: ['$status', 'DRAFT'] }, 1, 0] } },
                        pending: { $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] } },
                        approved: { $sum: { $cond: [{ $eq: ['$status', 'APPROVED'] }, 1, 0] } },
                        rejected: { $sum: { $cond: [{ $eq: ['$status', 'REJECTED'] }, 1, 0] } },
                        published: { $sum: { $cond: [{ $eq: ['$status', 'PUBLISHED'] }, 1, 0] } }
                    }
                }
            ]),
            User.findById(id).select('username email role')
        ]);

        res.json({ 
            stats: stats[0] || { total: 0, drafts: 0, pending: 0, approved: 0, rejected: 0, published: 0 }, 
            user: user || {} 
        });
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

        const [users, posts] = await Promise.all([
            User.find()
                .select('username created_at')
                .sort({ created_at: -1 })
                .limit(5)
                .lean(),
            Post.find()
                .populate('user_id', 'username')
                .select('title created_at user_id')
                .sort({ created_at: -1 })
                .limit(5)
                .lean()
        ]);

        const userActivity = users.map(u => ({
            id: u._id,
            username: u.username,
            created_at: u.created_at,
            type: 'USER_JOINED'
        }));

        const postActivity = posts.map(p => ({
            id: p._id,
            title: p.title,
            created_at: p.created_at,
            type: 'POST_CREATED',
            username: p.user_id?.username
        }));

        const activity = [...userActivity, ...postActivity]
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

        const postMediaCount = await Post.countDocuments({ media_path: { $ne: null } });
        const usedMB = postMediaCount * 8; 
        
        const stats = {
            used_gb: (usedMB / 1024).toFixed(2),
            total_gb: 100,
            images_gb: ((usedMB * 0.3) / 1024).toFixed(2),
            videos_gb: ((usedMB * 0.7) / 1024).toFixed(2),
            docs_gb: 0.1
        };

        res.json(stats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
