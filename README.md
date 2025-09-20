# Coupon Marketplace

A full-stack MERN marketplace where users can buy, sell, and redeem digital coupons & vouchers. Built with MongoDB, Express.js, Node.js, and React.js.

## Features

### For Users (Buyers & Sellers)
- **User Registration & Authentication** - JWT-based auth with secure password hashing
- **Browse Coupons** - Filter by category, price range, and expiry date
- **Purchase Coupons** - Request purchase, seller approval, and payment simulation
- **Create Coupons** - Submit coupons for admin approval
- **Track Purchases** - View purchase history and redemption codes
- **Seller Dashboard** - Manage coupons and track sales

### For Admins
- **Admin Authentication** - Separate admin login system
- **Approve/Reject Coupons** - Review and manage seller submissions
- **Revenue Tracking** - Monitor platform fees (20% on each sale)
- **Dashboard Analytics** - View statistics and performance metrics

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, JWT, bcryptjs
- **Frontend**: React.js, React Router, Axios
- **Styling**: Custom CSS with white/black theme
- **Database**: MongoDB (local or Atlas)

## Project Structure

```
marketplace-for-coupons-and-vouchers/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── index.js         # Server entry point
│   ├── seed.js          # Database seeding script
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context
│   │   ├── services/    # API services
│   │   └── utils/       # Utility functions
│   └── package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Git

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your values:
   ```env
   MONGO_URI=mongodb://localhost:27017/coupon-marketplace
   JWT_SECRET=your_jwt_secret_key_here
   PORT=5000
   ```

4. **Seed the database**
   ```bash
   npm run seed
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```
   
   Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your values:
   ```env
   REACT_APP_API_URL=http://localhost:5000
   ```

4. **Start the development server**
   ```bash
   npm start
   ```
   
   App will run on `http://localhost:3000`

## Demo Credentials

### Admin Login
- **Email**: admin@marketplace.local
- **Password**: AdminPass123

### User Logins (all use password: password123)
- **Email**: rahul@example.com
- **Email**: priya@example.com
- **Email**: amit@example.com
- **Email**: sneha@example.com

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/admin-login` - Admin login
- `GET /api/auth/me` - Get current user

### Coupons
- `GET /api/coupons` - List coupons (with filters)
- `GET /api/coupons/:id` - Get coupon details
- `POST /api/coupons` - Create coupon (seller)
- `PUT /api/coupons/:id` - Update coupon
- `DELETE /api/coupons/:id` - Delete coupon
- `GET /api/coupons/seller/my-coupons` - Get seller's coupons

### Admin
- `GET /api/admin/submissions` - Get pending submissions
- `PUT /api/admin/submissions/:id/approve` - Approve coupon
- `PUT /api/admin/submissions/:id/reject` - Reject coupon
- `GET /api/admin/revenue` - Get revenue data
- `GET /api/admin/dashboard` - Get dashboard data

### Purchases
- `POST /api/purchases/request` - Request purchase
- `PUT /api/purchases/:id/accept` - Accept purchase (seller)
- `POST /api/purchases/:id/pay` - Complete payment
- `GET /api/purchases/user` - User purchase history
- `GET /api/purchases/seller` - Seller sales history
- `GET /api/purchases/pending` - Pending purchases (seller)

## Database Schema

### User
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  passwordHash: String,
  role: String, // 'user' or 'admin'
  isSeller: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Coupon
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  category: String,
  redemptionCode: String,
  expiryDate: Date,
  price: Number,
  sellerId: ObjectId,
  quantity: Number,
  status: String, // 'pending' | 'approved' | 'rejected' | 'sold'
  images: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Purchase
```javascript
{
  _id: ObjectId,
  couponId: ObjectId,
  buyerId: ObjectId,
  sellerId: ObjectId,
  amountPaid: Number,
  platformFee: Number, // 20% of amountPaid
  sellerEarnings: Number,
  purchasedAt: Date,
  redemptionCodeRevealed: Boolean,
  redemptionCode: String,
  status: String // 'pending' | 'accepted' | 'paid' | 'completed'
}
```

## Key Features

### Purchase Flow
1. **Browse** - User browses available coupons
2. **Request** - User requests to purchase a coupon
3. **Accept** - Seller accepts the purchase request
4. **Pay** - User completes payment (simulated)
5. **Reveal** - Redemption code is revealed to buyer
6. **Complete** - Coupon is marked as sold

### Platform Fee
- **20%** platform fee on each sale
- **80%** goes to the seller
- Revenue tracking for admin dashboard

### Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Protected routes and admin-only access
- Input validation and sanitization

## Development

### Running Tests
```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### Building for Production
```bash
# Frontend
cd frontend
npm run build
```

## Deployment

### Backend (Heroku/Railway/DigitalOcean)
1. Set environment variables
2. Deploy with your preferred platform
3. Update frontend API URL

### Frontend (Vercel/Netlify)
1. Build the project
2. Deploy to your preferred platform
3. Set environment variables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@couponmarketplace.com or create an issue in the repository.

---

**Note**: This is a demo application. For production use, implement additional security measures, payment gateway integration, and comprehensive testing.
