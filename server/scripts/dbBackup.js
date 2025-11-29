// server/scripts/dbBackup.js
const { google } = require('googleapis');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('../config');

const backupDatabase = async () => {
  const backupFileName = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;
  const backupFilePath = path.join(__dirname, '..', 'backups', backupFileName);
  
  return new Promise((resolve, reject) => {
    // Create backup using mysqldump
    exec(
      `mysqldump -u ${config.db.user} -p${config.db.password} ${config.db.database} > ${backupFilePath}`,
      async (error) => {
        if (error) return reject(error);
        
        try {
          // Authenticate with Google
          const auth = new google.auth.GoogleAuth({
            keyFile: 'service-account-key.json',
            scopes: ['https://www.googleapis.com/auth/drive'],
          });
          
          const drive = google.drive({ version: 'v3', auth });
          
          // Upload to Google Drive
          const fileMetadata = {
            name: backupFileName,
            parents: [config.googleDrive.folderId],
          };
          
          const media = {
            mimeType: 'application/sql',
            body: fs.createReadStream(backupFilePath),
          };
          
          const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id',
          });
          
          console.log(`Backup uploaded: ${response.data.id}`);
          
          // Delete local file
          fs.unlinkSync(backupFilePath);
          
          resolve();
        } catch (err) {
          reject(err);
        }
      }
    );
  });
};

// Schedule daily backup
if (require.main === module) {
  const cron = require('node-cron');
  cron.schedule('0 2 * * *', backupDatabase); // Run daily at 2 AM
}

module.exports = backupDatabase;