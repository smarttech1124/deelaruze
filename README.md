# 🎨 Deelaruze - Street Art Publishing Platform

Independent art publishing platform for underground street culture, sticker art, and graffiti.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- MongoDB (local or Atlas)
- Cloudinary account (for image storage)
- Stripe account (for payments)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/deelaruze-website.git
cd deelaruze-website

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your credentials
nano .env
```

### Environment Setup

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/deelaruze

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Stripe (Payment Processing)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email Configuration (Gmail Example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password
FROM_EMAIL=noreply@deelaruze.com
FROM_NAME=Deelaruze

# Instagram API (Optional)
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token
INSTAGRAM_USER_ID=your_instagram_user_id

# Admin Credentials
ADMIN_EMAIL=admin@deelaruze.com
ADMIN_PASSWORD=change_this_secure_password
```

### Running the Application

```bash
# Development mode (runs both frontend and backend)
npm run dev

# Run frontend only
npm run dev:client

# Run backend only
npm run dev:server

# Production build
npm run build

# Start production server
npm run server
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 📁 Project Structure

```
deelaruze-website/
├── public/                 # Static assets
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── services/          # API services
│   ├── context/           # React context
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Utility functions
│   └── styles/            # CSS files
├── server/                # Backend source
│   ├── controllers/       # Request handlers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── config/           # Configuration
│   └── utils/            # Backend utilities
└── uploads/              # Temporary file uploads
```

## 🗄️ Database Setup

### Local MongoDB

```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Ubuntu/Debian
sudo apt-get install mongodb
sudo systemctl start mongodb

# Verify MongoDB is running
mongosh
```

### MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create new cluster (free tier available)
3. Create database user
4. Whitelist IP address (0.0.0.0/0 for development)
5. Get connection string
6. Update `MONGODB_URI` in `.env`

## ☁️ Cloudinary Setup

1. Sign up at [Cloudinary](https://cloudinary.com)
2. Navigate to Dashboard
3. Copy Cloud Name, API Key, and API Secret
4. Update `.env` with credentials
5. Create upload presets (optional):
   - Go to Settings → Upload
   - Create preset named "deelaruze_publications"
   - Enable unsigned uploads

## 💳 Stripe Setup

1. Create account at [Stripe](https://stripe.com)
2. Navigate to Developers → API Keys
3. Copy Publishable and Secret keys
4. Update `.env` with keys
5. Create products in Stripe Dashboard
6. Set up webhook endpoint:
   - URL: `https://yourdomain.com/api/orders/webhook`
   - Events: `checkout.session.completed`, `payment_intent.succeeded`
7. Copy webhook secret to `.env`

## 📧 Email Setup

### Using Gmail

1. Enable 2-Factor Authentication on Google Account
2. Generate App Password:
   - Go to Account Settings → Security
   - App Passwords → Generate
3. Use app password in `.env` as `SMTP_PASS`

### Using SendGrid (Recommended for Production)

```bash
npm install @sendgrid/mail
```

1. Sign up at [SendGrid](https://sendgrid.com)
2. Verify sender email
3. Generate API key
4. Update email service to use SendGrid

## 🔐 Security Checklist

- [ ] Change all default passwords and secrets
- [ ] Use environment variables for sensitive data
- [ ] Enable CORS for specific domains only
- [ ] Implement rate limiting
- [ ] Use helmet.js for security headers
- [ ] Sanitize user inputs
- [ ] Validate all API requests
- [ ] Use HTTPS in production
- [ ] Set secure cookie options
- [ ] Implement CSRF protection

## 🚢 Deployment

### Frontend (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Build frontend
npm run build

# Deploy
vercel --prod
```

### Backend Options

**Option 1: Vercel Serverless Functions**
```bash
# Create vercel.json
{
  "version": 2,
  "builds": [
    { "src": "server/server.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "server/server.js" }
  ]
}

# Deploy
vercel --prod
```

**Option 2: Railway**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

**Option 3: Render**
1. Connect GitHub repository
2. Create Web Service
3. Set environment variables
4. Deploy automatically on push

**Option 4: DigitalOcean / AWS / Linode**
```bash
# SSH into server
ssh user@your-server-ip

# Install Node.js and MongoDB
# Clone repository
git clone your-repo-url
cd deelaruze-website

# Install dependencies
npm install --production

# Install PM2
npm install -g pm2

# Start application
pm2 start server/server.js --name deelaruze

# Enable startup on boot
pm2 startup
pm2 save

# Setup Nginx reverse proxy
sudo nano /etc/nginx/sites-available/deelaruze
```

Nginx configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- ProductCard.test.js
```

## 📊 API Documentation

### Publications

- `GET /api/publications` - Get all publications
- `GET /api/publications/:id` - Get single publication
- `GET /api/publications/slug/:slug` - Get by slug
- `GET /api/publications/featured` - Get featured
- `POST /api/publications` - Create (admin)
- `PUT /api/publications/:id` - Update (admin)
- `DELETE /api/publications/:id` - Delete (admin)

### Orders

- `POST /api/orders/create-checkout-session` - Create checkout
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders/webhook` - Stripe webhook

### Submissions

- `POST /api/submissions` - Submit artwork
- `GET /api/submissions` - Get all (admin)
- `PUT /api/submissions/:id` - Update status (admin)

### Contact

- `POST /api/contact` - Send message
- `POST /api/newsletter` - Subscribe to newsletter

## 🎨 Frontend Development

### Component Structure

```javascript
// Example component
import React from 'react';
import { useCart } from '../../hooks/useCart';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <div className="product-card">
      <img src={product.images[0]?.url} alt={product.title} />
      <h3>{product.title}</h3>
      <p>${product.price}</p>
      <button onClick={() => addToCart(product)}>
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;
```

### Custom Hooks

```javascript
// hooks/usePublications.js
import { useState, useEffect } from 'react';
import { publicationService } from '../services/publicationService';

export const usePublications = (filters = {}) => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const data = await publicationService.getAll(filters);
        setPublications(data.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();
  }, [JSON.stringify(filters)]);

  return { publications, loading, error };
};
```

## 🛠️ Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
mongosh

# Restart MongoDB
brew services restart mongodb-community  # macOS
sudo systemctl restart mongodb          # Linux
```

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

### Cloudinary Upload Fails

- Verify API credentials are correct
- Check upload preset configuration
- Ensure file size is under limit
- Verify internet connection

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
npm run dev
```

## 📝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open pull request

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Support

- Email: support@deelaruze.com
- Instagram: [@deelaruze](https://instagram.com/deelaruze)
- Issues: [GitHub Issues](https://github.com/yourusername/deelaruze-website/issues)

---

Built with ❤️ for the streets. This is DIY. This is independent. This is ours.