const Post = require('../models/Post');
const fs = require('fs');
const path = require('path');

exports.runCleanup = async (req, res) => {
    try {
        console.log('Running cleanup job...');

        // Find posts that are PUBLISHED and created > 7 days ago, and media not yet deleted
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const posts = await Post.find({
            status: 'PUBLISHED',
            media_deleted: false,
            created_at: { $lt: sevenDaysAgo }
        }).select('id media_path');

        if (posts.length === 0) {
            return res.json({ message: 'No files to cleanup' });
        }

        let deletedCount = 0;
        const idsToUpdate = [];

        for (const post of posts) {
            const relativePath = post.media_path.startsWith('/') ? post.media_path.slice(1) : post.media_path;
            const absolutePath = path.join(__dirname, '..', relativePath);

            try {
                if (fs.existsSync(absolutePath)) {
                    fs.unlinkSync(absolutePath);
                    console.log(`Deleted: ${absolutePath}`);
                }
                deletedCount++;
                idsToUpdate.push(post._id);
            } catch (err) {
                console.error(`Failed to delete file for post ${post._id}:`, err);
            }
        }

        if (idsToUpdate.length > 0) {
            await Post.updateMany(
                { _id: { $in: idsToUpdate } },
                { media_deleted: true }
            );
        }

        res.json({ message: `Cleanup complete. Deleted ${deletedCount} files.` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during cleanup' });
    }
};
