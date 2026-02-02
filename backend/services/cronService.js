const cron = require('node-cron');
const Post = require('../models/Post');
const fs = require('fs');
const path = require('path');

const initCronJobs = () => {
    // Schedule task to run at 00:00 on Sunday
    cron.schedule('0 0 * * 0', async () => {
        console.log('[Cron] Running weekly auto-delete task...');
        try {
            // Find posts older than 7 days
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const posts = await Post.find({ 
                created_at: { $lt: sevenDaysAgo } 
            });

            if (posts.length > 0) {
                console.log(`[Cron] Found ${posts.length} posts to delete.`);
                
                for (const post of posts) {
                    // Delete media file if exists
                    if (post.media_path) {
                        const relativePath = post.media_path.startsWith('/') ? post.media_path.slice(1) : post.media_path;
                        const filePath = path.join(__dirname, '..', relativePath);
                        if (fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                            console.log(`[Cron] Deleted file: ${filePath}`);
                        }
                    }
                }

                // Delete from DB
                await Post.deleteMany({ created_at: { $lt: sevenDaysAgo } });
                console.log('[Cron] Weekly deletion completed successfully.');
            } else {
                console.log('[Cron] No posts found older than 7 days.');
            }

        } catch (err) {
            console.error('[Cron] Error during weekly auto-delete:', err);
        }
    });

    console.log('[Cron] Cron jobs initialized.');
};

module.exports = initCronJobs;
