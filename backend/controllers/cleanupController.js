const db = require('../config/database');
const fs = require('fs');
const path = require('path');

exports.runCleanup = async (req, res) => {
    try {
        console.log('Running cleanup job...');

        // Find posts that are PUBLISHED and created > 7 days ago, and media not yet deleted
        const [posts] = await db.query(
            `SELECT id, media_path FROM posts 
             WHERE status = 'PUBLISHED' 
             AND media_deleted = 0 
             AND created_at < NOW() - INTERVAL 7 DAY`
        );

        if (posts.length === 0) {
            return res.json({ message: 'No files to cleanup' });
        }

        let deletedCount = 0;
        const idsToUpdate = [];

        for (const post of posts) {
            const filePath = path.join(__dirname, '..', post.media_path);
            
            // Check if file exists and delete it
            // media_path starts with /uploads/, we need relative or absolute
            // In server.js we serve /uploads, but on disk it is relative to server.js root join 'uploads'
            // My postController saves: '/uploads/'+filename.
            // So path.join(__dirname, '..', post.media_path) might be backend/../uploads/file -> backend/uploads/file.
            // Correct logic: __dirname is backend/controllers. .. is backend.
            // post.media_path is /uploads/foo.jpg.
            // path.join('backend', '/uploads/foo.jpg') might resolve absolute if starts with /.
            // safer to strip leading /
            
            const relativePath = post.media_path.startsWith('/') ? post.media_path.slice(1) : post.media_path;
            const absolutePath = path.join(__dirname, '..', relativePath);

            try {
                if (fs.existsSync(absolutePath)) {
                    fs.unlinkSync(absolutePath);
                    console.log(`Deleted: ${absolutePath}`);
                }
                deletedCount++;
                idsToUpdate.push(post.id);
            } catch (err) {
                console.error(`Failed to delete file for post ${post.id}:`, err);
            }
        }

        if (idsToUpdate.length > 0) {
            await db.query(`UPDATE posts SET media_deleted = 1 WHERE id IN (?)`, [idsToUpdate]);
        }

        res.json({ message: `Cleanup complete. Deleted ${deletedCount} files.` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during cleanup' });
    }
};
