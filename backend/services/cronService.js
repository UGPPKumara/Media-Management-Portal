const cron = require('node-cron');
const db = require('../config/db');
const fs = require('fs');
const path = require('path');

const initCronJobs = () => {
    // Schedule task to run at 00:00 on Sunday
    cron.schedule('0 0 * * 0', async () => {
        console.log('[Cron] Running weekly auto-delete task...');
        try {
            // Select posts older than 7 days
            const [posts] = await db.query('SELECT * FROM posts WHERE created_at < NOW() - INTERVAL 7 DAY');

            if (posts.length > 0) {
                console.log(`[Cron] Found ${posts.length} posts to delete.`);
                
                for (const post of posts) {
                    // Delete media file if exists
                    if (post.media_path) {
                        const filePath = path.join(__dirname, '..', post.media_path);
                        if (fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                            console.log(`[Cron] Deleted file: ${filePath}`);
                        }
                    }
                }

                // Delete from DB
                await db.query('DELETE FROM posts WHERE created_at < NOW() - INTERVAL 7 DAY');
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
