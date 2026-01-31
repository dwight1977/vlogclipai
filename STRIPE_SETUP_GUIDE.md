# VlogClip AI - Stripe Payment Integration Setup Guide

## 🚀 Production Deployment Checklist

### Step 1: Create Stripe Account
1. **Sign up at**: https://stripe.com
2. **Complete business verification** (required for live payments)
3. **Set up business details** and bank account information

### Step 2: Create Products and Prices in Stripe Dashboard

#### A. Creator Pro Plan
**Monthly Subscription:**
- **Product Name**: VlogClip AI Creator Pro
- **Price**: $9.00 USD per month
- **Billing**: Recurring monthly
- **Copy the Price ID** → Update `STRIPE_PRODUCT_PRO_MONTHLY` in `.env`

**Annual Subscription:**
- **Product Name**: VlogClip AI Creator Pro (Annual)
- **Price**: $90.00 USD per year (save $18)
- **Billing**: Recurring yearly
- **Copy the Price ID** → Update `STRIPE_PRODUCT_PRO_ANNUAL` in `.env`

#### B. Business Plan
**Monthly Subscription:**
- **Product Name**: VlogClip AI Business
- **Price**: $29.00 USD per month
- **Billing**: Recurring monthly
- **Copy the Price ID** → Update `STRIPE_PRODUCT_BUSINESS_MONTHLY` in `.env`

**Annual Subscription:**
- **Product Name**: VlogClip AI Business (Annual)
- **Price**: $290.00 USD per year (save $58)
- **Billing**: Recurring yearly
- **Copy the Price ID** → Update `STRIPE_PRODUCT_BUSINESS_ANNUAL` in `.env`

### Step 3: Get API Keys

#### Test Keys (for development)
1. Go to **Developers** → **API Keys** in Stripe Dashboard
2. Copy **Publishable key** (starts with `pk_test_`) → Update `STRIPE_PUBLISHABLE_KEY`
3. Copy **Secret key** (starts with `sk_test_`) → Update `STRIPE_SECRET_KEY`

#### Live Keys (for production)
1. **Toggle to "Live mode"** in Stripe Dashboard
2. Copy **Publishable key** (starts with `pk_live_`) → Update `STRIPE_PUBLISHABLE_KEY`
3. Copy **Secret key** (starts with `sk_live_`) → Update `STRIPE_SECRET_KEY`

### Step 4: Set up Webhooks

#### Create Webhook Endpoint
1. Go to **Developers** → **Webhooks** in Stripe Dashboard
2. Click **"Add endpoint"**
3. **Endpoint URL**: `https://yourdomain.com/api/payments/webhook`
4. **Events to send**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy **Signing secret** → Update `STRIPE_WEBHOOK_SECRET` in `.env`

### Step 5: Update Environment Variables

Create or update your production `.env` file:

```bash
# Stripe Live Configuration (Production)
STRIPE_SECRET_KEY=sk_live_your_actual_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_live_your_actual_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret_here

# Stripe Product Price IDs (from Step 2)
STRIPE_PRODUCT_PRO_MONTHLY=price_1234567890abcdef
STRIPE_PRODUCT_PRO_ANNUAL=price_0987654321fedcba
STRIPE_PRODUCT_BUSINESS_MONTHLY=price_abcdef1234567890
STRIPE_PRODUCT_BUSINESS_ANNUAL=price_fedcba0987654321

# Frontend URL (for redirects)
FRONTEND_URL=https://yourdomain.com
```

### Step 6: Test Payment Flow

#### Test with Stripe Test Cards
Use these test card numbers in test mode:

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

**Declined Payment:**
- Card: `4000 0000 0000 0002`

#### Test Scenarios
1. **Upgrade from Free to Pro** (monthly)
2. **Upgrade from Free to Business** (annual)
3. **Upgrade from Pro to Business**
4. **Cancel subscription**
5. **Webhook processing** (check server logs)

### Step 7: Frontend Integration

The frontend will need the publishable key:

```javascript
// In your React app
const stripe = Stripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
```

### Step 8: Security Checklist

#### Environment Security
- ✅ **Never commit** `.env` file to version control
- ✅ **Use different keys** for test vs production
- ✅ **Restrict API keys** to specific IP addresses (in Stripe Dashboard)
- ✅ **Enable webhook signature verification**

#### Data Protection
- ✅ **Never store** card numbers or payment details
- ✅ **Use HTTPS** for all payment requests
- ✅ **Validate webhooks** with signature verification
- ✅ **Log payment events** for audit trail

### Step 9: Go Live Checklist

Before switching to live mode:

1. ✅ **Business verification complete** in Stripe
2. ✅ **Bank account added** for payouts
3. ✅ **Test payments working** in test mode
4. ✅ **Webhooks tested** and processing correctly
5. ✅ **SSL certificate** installed on domain
6. ✅ **Error handling** implemented for failed payments
7. ✅ **Customer support** process for billing issues

### Step 10: Monitoring and Maintenance

#### Stripe Dashboard Monitoring
- **Revenue tracking** - Monitor monthly recurring revenue
- **Failed payments** - Set up alerts for payment failures
- **Churn analysis** - Track subscription cancellations
- **Customer disputes** - Handle any chargebacks promptly

#### Application Monitoring
- **Webhook delivery** - Ensure webhooks are processing successfully
- **Payment errors** - Log and alert on payment processing errors
- **User plan sync** - Verify user plan status matches Stripe subscriptions

---

## 🔧 Technical Implementation Status

### ✅ Completed
- [x] Stripe SDK installed and configured
- [x] Environment variables structure created
- [x] Stripe configuration module (`stripe-config.js`)
- [x] Webhook event handling structure
- [x] Plan pricing and feature definitions

### 🚧 Next Steps (In Progress)
- [ ] Payment API endpoints (`/api/payments/*`)
- [ ] Database schema for user billing
- [ ] Webhook processing logic
- [ ] Frontend payment components
- [ ] Error handling and logging

### 📋 Production Deployment Requirements
1. **Stripe Account Setup** → Business verification complete
2. **Products Created** → All 4 price IDs configured
3. **Webhooks Configured** → Endpoint URL and events set
4. **Environment Variables** → Live keys and product IDs updated
5. **SSL Certificate** → HTTPS enabled for webhook security

---

**🎯 Estimated Setup Time: 2-3 hours**
**⚡ Priority: HIGH** - Required for payment processing
**🔒 Security Level: CRITICAL** - Handle with production-level security

---

*Last Updated: July 29, 2025*
*Status: Configuration complete, awaiting API key setup*