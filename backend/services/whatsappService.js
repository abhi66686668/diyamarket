const { Client, RemoteAuth, MessageMedia } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');
const qrcodeTerminal = require('qrcode-terminal');
const qrcodeImg = require('qrcode');

let client;
let currentQR = '';
let isAuthenticated = false;

const initWhatsApp = async () => {
    try {
        const store = new MongoStore({ mongoose: mongoose });

        client = new Client({
            authStrategy: new RemoteAuth({
                clientId: 'diya-marketing',
                store: store,
                backupSyncIntervalMs: 300000
            }),
            webVersionCache: {
                type: 'remote',
                remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
            },
            puppeteer: {
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
            }
        });

        client.on('qr', (qr) => {
            currentQR = qr;
            isAuthenticated = false;
            console.log('\n=============================================');
            console.log('SCAN THIS QR CODE WITH WHATSAPP TO LINK ACCOUNT');
            console.log('If you cannot scan this, go to: https://diyamarket.onrender.com/api/qr');
            console.log('=============================================\n');
            qrcodeTerminal.generate(qr, { small: true });

            // Also save as an image file for easier scanning locally
            const artifactPath = require('path').join(__dirname, '../../whatsapp-qr.png');
            qrcodeImg.toFile(artifactPath, qr, {
                color: { dark: '#000000', light: '#FFFFFF' },
                width: 400
            }, (err) => {
                if (err) console.error('Failed to generate QR image', err);
            });
        });

        client.on('ready', () => {
            currentQR = '';
            isAuthenticated = true;
            console.log('WhatsApp Client is Ready!');
        });
        
        client.on('remote_session_saved', () => {
            console.log('WhatsApp Session Saved to MongoDB!');
        });

        client.on('authenticated', () => {
            currentQR = '';
            isAuthenticated = true;
            console.log('WhatsApp Authenticated!');
        });

        client.on('auth_failure', msg => {
            currentQR = '';
            isAuthenticated = false;
            console.error('WhatsApp Authentication failure:', msg);
        });

        client.initialize();
    } catch (error) {
        console.error('WhatsApp init error:', error);
    }
};

const getQR = () => currentQR;
const getAuthStatus = () => isAuthenticated;

const sendPDF = async (phoneNumber, pdfBuffer, caption = 'Here is your receipt.') => {
    if (!client) {
        console.log('WhatsApp client not initialized');
        return;
    }
    
    // Format number: remove + and spaces, append @c.us
    // Assuming Indian number +91 default if not provided
    let cleanNumber = phoneNumber.replace(/\D/g, '');
    if (cleanNumber.length === 10) cleanNumber = '91' + cleanNumber;
    const chatId = `${cleanNumber}@c.us`;

    try {
        const media = new MessageMedia('application/pdf', pdfBuffer.toString('base64'), 'Receipt.pdf');
        await client.sendMessage(chatId, media, { caption });
        console.log(`PDF sent successfully to ${chatId}`);
    } catch (error) {
        console.error(`Failed to send PDF to ${chatId}:`, error);
    }
};

module.exports = { initWhatsApp, sendPDF, getQR, getAuthStatus };
