# Diya Market

Diya Market is a full-stack web application designed for managing customers, contracts, products, and payments. It features a built-in automated WhatsApp integration for sending payment receipts and notifications directly to customers.

## 🚀 Features

- **Customer Management**: Add and track customer profiles.
- **Product Management**: Manage inventory, prices, and discount prices with image uploads.
- **Contract & Payment Tracking**: Keep track of customer contracts, installments, and payment histories.
- **Automated WhatsApp Receipts**: Automatically sends a PDF receipt to the customer's WhatsApp upon successful payment.
- **Cloudinary Integration**: Seamlessly upload and serve product and customer images.
- **Dashboard Analytics**: Overview of total revenue, active contracts, and sales performance.

## 🛠️ Tech Stack

### Frontend
- **React.js** (Vite)
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API requests
- **React Toastify** for notifications

### Backend
- **Node.js & Express.js**
- **MongoDB & Mongoose**
- **whatsapp-web.js** (for WhatsApp automation)
- **wwebjs-mongo** (for WhatsApp session persistence)
- **Socket.io** (for real-time updates)
- **Cloudinary** (for image storage)
- **PDFKit** (for generating PDF receipts)

## ⚙️ Environment Variables

To run this project locally, you will need to create a `.env` file in the `backend` directory with the following variables:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/abhi66686668/diyamarket.git
   cd diyamarket
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Run Locally:**
   - **Backend:** `cd backend && npm start` (runs on http://localhost:5000)
   - **Frontend:** `cd frontend && npm run dev` (runs on http://localhost:5173)

## 📱 WhatsApp Authentication

Because this app uses `whatsapp-web.js`, you must link your WhatsApp account to the server.
1. Start the server.
2. Navigate to `http://localhost:5000/api/qr` (or your deployed URL `https://diyamarket.onrender.com/api/qr`).
3. Scan the QR code using the "Linked Devices" feature in your WhatsApp mobile app.
4. The session is automatically saved to MongoDB and will persist across restarts!

## ☁️ Deployment (Render)

This project is configured to easily deploy on Render using Docker.
- The included `Dockerfile` builds both the frontend and backend, installs Chromium for Puppeteer, and serves everything from a single Node.js instance.
- **Build Command:** (Handled by Docker)
- Ensure all environment variables listed above are added to the Render dashboard.

## 📄 License

MIT License
