const Post = require('../models/Post');
const User = require('../models/User');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { createNotification, notifyUsersByRole } = require('./notificationController');

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

                const newPost = await Post.create({
            user_id: req.user.id,
            title,
            content,
            media_type: mediaType,
            media_path: mediaPath,
            status
        });

        // Notify managers/admins about new post submission
        if (status === 'PENDING') {
            const user = await User.findById(req.user.id);
            await notifyUsersByRole(
                ['ADMIN', 'MANAGER'],
                'POST_SUBMITTED',
                'New Post Submitted',
                `${user?.username || 'A creator'} submitted a new post: "${title}"`,
                `/dashboard/posts?view=${newPost._id}`,
                { postId: newPost._id }
            );
        }

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

                const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const updateData = { status };
        if (status === 'REJECTED') {
            updateData.rejection_reason = reason || '';
        }

        await Post.findByIdAndUpdate(id, updateData);

        // Send notification to post creator
        const notificationData = {
            'APPROVED': {
                type: 'POST_APPROVED',
                title: 'Post Approved',
                message: `Your post "${post.title}" has been approved and is ready for publishing.`
            },
            'REJECTED': {
                type: 'POST_REJECTED',
                title: 'Post Rejected',
                message: `Your post "${post.title}" was rejected. Reason: ${reason || 'Not specified'}`
            },
            'PUBLISHED': {
                type: 'POST_PUBLISHED',
                title: 'Post Published',
                message: `Your post "${post.title}" is now live!`
            }
        };

        if (notificationData[status]) {
            await createNotification(
                post.user_id,
                notificationData[status].type,
                notificationData[status].title,
                notificationData[status].message,
                `/dashboard/my-posts?view=${id}`,
                { postId: id }
            );
        }

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

        // Ownership check
        if (req.user.role === 'CREATOR' && post.user_id.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Edit restriction for creators - can only edit DRAFT or REJECTED posts
        if (req.user.role === 'CREATOR') {
            const editableStatuses = ['DRAFT', 'REJECTED'];
            if (!editableStatuses.includes(post.status)) {
                return res.status(403).json({ 
                    message: 'Cannot edit a submitted post. You can only edit drafts or rejected posts.' 
                });
            }
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
        }
        // Note: rejected posts stay rejected until explicitly resubmitted

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
        
        // Convert user_id to ObjectId for proper matching
        const userId = new mongoose.Types.ObjectId(req.user.id);
        
        let matchQuery = { user_id: userId };
        
        if (startDate && endDate) {
            matchQuery.created_at = {
                $gte: new Date(`${startDate}T00:00:00`),
                $lte: new Date(`${endDate}T23:59:59`)
            };
        }

        // Get today's start and end
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get this week's start (Monday)
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
        if (weekStart > today) weekStart.setDate(weekStart.getDate() - 7);

        // Count today's posts
        const todayPosts = await Post.countDocuments({
            user_id: userId,
            created_at: { $gte: today, $lt: tomorrow }
        });

        // Count this week's posts
        const weekPosts = await Post.countDocuments({
            user_id: userId,
            created_at: { $gte: weekStart, $lt: tomorrow }
        });

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

        const result = stats[0] || { total: 0, drafts: 0, pending: 0, approved: 0, rejected: 0, published: 0 };
        result.today = todayPosts;
        result.thisWeek = weekPosts;

        res.json(result);
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

exports.getAllActivity = async (req, res) => {
    try {
        if (!['ADMIN', 'MANAGER'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const [users, posts] = await Promise.all([
            User.find()
                .select('username created_at role email')
                .sort({ created_at: -1 })
                .limit(50)
                .lean(),
            Post.find()
                .populate('user_id', 'username')
                .select('title created_at user_id status')
                .sort({ created_at: -1 })
                .limit(50)
                .lean()
        ]);

        const userActivity = users.map(u => ({
            id: u._id,
            username: u.username,
            created_at: u.created_at,
            type: 'USER_JOINED',
            details: `Role: ${u.role}, Email: ${u.email}`
        }));

        const postActivity = posts.map(p => ({
            id: p._id,
            title: p.title,
            created_at: p.created_at,
            type: 'POST_CREATED',
            username: p.user_id?.username,
            details: `Status: ${p.status}`
        }));

        const activity = [...userActivity, ...postActivity]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        res.json(activity);
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

// Resubmit rejected post for review
exports.resubmitPost = async (req, res) => {
    try {
        const { id } = req.params;
        
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Only owner can resubmit
        if (post.user_id.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Only rejected or draft posts can be resubmitted
        if (!['REJECTED', 'DRAFT'].includes(post.status)) {
            return res.status(400).json({ message: 'Only rejected or draft posts can be resubmitted' });
        }

        await Post.findByIdAndUpdate(id, {
            status: 'PENDING',
            rejection_reason: null
        });

        // Notify managers about resubmission
        const user = await User.findById(req.user.id);
        await notifyUsersByRole(
            ['ADMIN', 'MANAGER'],
            'POST_SUBMITTED',
            'Post Resubmitted',
            `${user?.username || 'A creator'} resubmitted a post: "${post.title}"`,
            `/dashboard/posts`,
            { postId: id }
        );

        res.json({ message: 'Post resubmitted for review' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
