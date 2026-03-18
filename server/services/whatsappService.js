const axios = require('axios');

const API_URL = process.env.EVOLUTION_API_URL;
const API_KEY = process.env.EVOLUTION_API_KEY;
const INSTANCE_NAME = process.env.EVOLUTION_INSTANCE_NAME;

const evolutionClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'apikey': API_KEY
    }
});

const createInstance = async () => {
    try {
        const response = await evolutionClient.post('/instance/create', {
            instanceName: INSTANCE_NAME,
            token: API_KEY, // The API key acts as the token for the instance
            qrcode: true, // important to get the QR code right away usually
            integration: "WHATSAPP-BAILEYS"
        });
        return response.data;
    } catch (error) {
        console.error('Failed to create instance:', error.response?.data || error.message);
        throw error;
    }
};

exports.getConnectionStatus = async () => {
    try {
        const response = await evolutionClient.get(`/instance/connectionState/${INSTANCE_NAME}`);
        return response.data;
    } catch (error) {
        // If instance not found (404), create it and return an OFFLINE status manually
        if (error.response?.status === 404) {
            console.log(`Instance ${INSTANCE_NAME} not found. Creating it...`);
            await createInstance();
            const response = await evolutionClient.get(`/instance/connectionState/${INSTANCE_NAME}`);
            return response.data;
        }
        console.error('Evolution API Connection Status Error:', error.response?.data || error.message);
        throw error;
    }
};

exports.getQRCode = async () => {
    try {
        console.log(INSTANCE_NAME);
        const response = await evolutionClient.get(`/instance/connect/${INSTANCE_NAME}`);
        return response.data; // This usually contains base64/code
    } catch (error) {
        if (error.response?.status === 404) {
            console.log(`Instance ${INSTANCE_NAME} not found during connect. Creating it...`);
            await createInstance();
            // Retry connecting after creation
            const retryResponse = await evolutionClient.get(`/instance/connect/${INSTANCE_NAME}`);
            return retryResponse.data;
        }
        console.error('Evolution API QR Code Error:', error.response?.data || error.message);
        throw error;
    }
};

exports.logout = async () => {
    try {
        const response = await evolutionClient.delete(`/instance/logout/${INSTANCE_NAME}`);
        return response.data;
    } catch (error) {
        console.error('Evolution API Logout Error:', error.response?.data || error.message);
        throw error;
    }
};

exports.sendText = async (number, text) => {
    try {
        const response = await evolutionClient.post(`/message/sendText/${INSTANCE_NAME}`, {
            number: number,
            text: text,
            linkPreview: false
        });
        return response.data;
    } catch (error) {
        console.error('Evolution API Send Text Error:', error.response?.data || error.message);
        throw error;
    }
};

exports.sendMedia = async (number, mediaData, fileName, caption) => {
    try {
        // mediaData should be base64 string for PDF
        const response = await evolutionClient.post(`/message/sendMedia/${INSTANCE_NAME}`, {
            number: number,
            mediatype: 'document',
            mimetype: 'application/pdf',
            fileName: fileName,
            caption: caption,
            media: mediaData
        });
        return response.data;
    } catch (error) {
        console.error('Evolution API Send Media Error:', JSON.stringify(error.response?.data, null, 2) || error.message);
        throw error;
    }
};
