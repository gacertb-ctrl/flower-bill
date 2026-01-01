const mysqldump = require('mysqldump');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// 1. Safe Private Key Parsing
// This fixes the common issue where \n is read as literal characters instead of newlines
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY
    ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n').trim()
    : '';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const backupDatabase = async () => {
    console.log('⏳ Starting Database Backup...');

    if (!PRIVATE_KEY || !process.env.GOOGLE_CLIENT_EMAIL) {
        console.error('❌ Missing Google Credentials in .env');
        return;
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `backup_${process.env.DB_NAME}_${timestamp}.sql`;
    const filePath = path.join(__dirname, fileName);

    // try {
        // 2. Initialize Auth
        const auth = new google.auth.JWT({
            email: process.env.GOOGLE_CLIENT_EMAIL,
            key: PRIVATE_KEY,
            scopes: SCOPES,
        });
        
        // Test Authentication immediately
        await auth.authorize();
        console.log('🔑 Google Auth Successful');

        // 3. Create DB Dump
        await mysqldump({
            connection: {
                host: 'mysql-377652b8-gacertb-abf0.g.aivencloud.com',
                user: 'avnadmin',
                password: 'AVNS_7DMZCGdPbK8WSsWHgRl',
                database: 'defaultdb',
                port: '16840'
            },
            dumpToFile: filePath,
        });

        console.log('✅ Database dump created locally.');

        // 4. Upload to Google Drive
        await uploadToDrive(auth, fileName, filePath);

        // 5. Delete Local File
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log('🗑️ Local backup file deleted.');
        }

    // } catch (error) {
    //     console.error('❌ Backup Failed:', error.message);
    //     // Clean up file if it exists and failed
    //     if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    // }
};

const uploadToDrive = async (auth, fileName, filePath) => {
    const drive = google.drive({ version: 'v3', auth });

    try {
        console.log('⏳ files, path: ', filePath, ' name: ', fileName);
        const fileMetadata = {
            name: fileName,
            parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
        };

        const media = {
            mimeType: 'application/sql',
            body: fs.createReadStream(filePath),
        };

        const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id',
        });

        console.log(`🚀 File uploaded to Drive successfully! File ID: ${response.data.id}`);
    } catch (error) {
        console.error('❌ Google Drive Upload Error:', error.message);
        throw error;
    }
};

module.exports = { backupDatabase };
