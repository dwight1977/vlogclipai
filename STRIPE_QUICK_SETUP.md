# 🚀 Stripe Quick Setup - VlogClip AI

## ⚡ 5-Minute Production Setup

### 1. Get Stripe Account
- Sign up: https://stripe.com
- Complete business verification

### 2. Create Products (5 minutes)
Copy these exact configurations in Stripe Dashboard:

#### Creator Pro Monthly
- **Name**: VlogClip AI Creator Pro
- **Price**: $9.00/month
- **Copy Price ID** → Replace `STRIPE_PRODUCT_PRO_MONTHLY` in `.env`

#### Creator Pro Annual  
- **Name**: VlogClip AI Creator Pro (Annual)
- **Price**: $90.00/year
- **Copy Price ID** → Replace `STRIPE_PRODUCT_PRO_ANNUAL` in `.env`

#### Business Monthly
- **Name**: VlogClip AI Business
- **Price**: $29.00/month  
- **Copy Price ID** → Replace `STRIPE_PRODUCT_BUSINESS_MONTHLY` in `.env`

#### Business Annual
- **Name**: VlogClip AI Business (Annual)
- **Price**: $290.00/year
- **Copy Price ID** → Replace `STRIPE_PRODUCT_BUSINESS_ANNUAL` in `.env`

### 3. Get API Keys (2 minutes)
In Stripe Dashboard → Developers → API Keys:

**Test Mode** (for development):
- Copy **Publishable Key** (pk_test_...) → Replace `STRIPE_PUBLISHABLE_KEY`
- Copy **Secret Key** (sk_test_...) → Replace `STRIPE_SECRET_KEY`

**Live Mode** (for production):
- Toggle to "Live mode"
- Copy **Publishable Key** (pk_live_...) → Replace `STRIPE_PUBLISHABLE_KEY`  
- Copy **Secret Key** (sk_live_...) → Replace `STRIPE_SECRET_KEY`

### 4. Setup Webhook (3 minutes)
In Stripe Dashboard → Developers → Webhooks:

1. **Add Endpoint**: `https://yourdomain.com/api/payments/webhook`
2. **Select Events**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
3. **Copy Signing Secret** → Replace `STRIPE_WEBHOOK_SECRET`

### 5. Update .env File
```bash
# Replace these with your real keys:
STRIPE_SECRET_KEY=sk_live_your_real_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_real_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_real_webhook_secret

# Replace with your real Price IDs:
STRIPE_PRODUCT_PRO_MONTHLY=price_your_real_pro_monthly_id
STRIPE_PRODUCT_PRO_ANNUAL=price_your_real_pro_annual_id
STRIPE_PRODUCT_BUSINESS_MONTHLY=price_your_real_business_monthly_id
STRIPE_PRODUCT_BUSINESS_ANNUAL=price_your_real_business_annual_id
```

### 6. Test Configuration
```bash
curl http://localhost:3001/api/payments/config
```

Should return: `"status": "configured"`

---

## 🎯 Current Status: ✅ READY FOR REAL KEYS

**✅ Configuration Structure**: Complete  
**✅ API Integration**: Ready  
**✅ Plan Pricing**: Configured  
**✅ Webhook Handling**: Prepared  
**✅ Error Handling**: Implemented  

**Next**: Get real Stripe account and update keys ☝️

---

**⏱️ Total Setup Time**: ~10 minutes  
**🔒 Security**: Production-ready  
**💰 Revenue**: Ready to collect payments  