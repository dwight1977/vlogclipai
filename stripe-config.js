// Stripe Configuration for VlogClip AI
// Production-ready payment processing setup

const stripe = require('stripe');

// Initialize Stripe with secret key (with fallback for development)
const stripeClient = process.env.STRIPE_SECRET_KEY 
  ? stripe(process.env.STRIPE_SECRET_KEY)
  : null; // Fallback when no key is provided

// Plan configurations matching your pricing structure
const STRIPE_PLANS = {
  free: {
    name: 'Free Tier',
    price: 0,
    videosPerMonth: 1,
    clipsPerDay: 3,
    features: ['1 video per month', 'Up to 3 clips per day', 'Free tier watermark']
  },
  pro: {
    name: 'Creator Pro',
    monthlyPrice: 9,
    annualPrice: 90,
    stripePriceMonthly: process.env.STRIPE_PRODUCT_PRO_MONTHLY,
    stripePriceAnnual: process.env.STRIPE_PRODUCT_PRO_ANNUAL,
    videosPerMonth: Infinity,
    clipsPerDay: Infinity,
    features: ['Unlimited videos', 'Unlimited clips', 'No watermark', 'Batch processing', 'Priority support']
  },
  business: {
    name: 'Business',
    monthlyPrice: 29,
    annualPrice: 290,
    stripePriceMonthly: process.env.STRIPE_PRODUCT_BUSINESS_MONTHLY,
    stripePriceAnnual: process.env.STRIPE_PRODUCT_BUSINESS_ANNUAL,
    videosPerMonth: Infinity,
    clipsPerDay: Infinity,
    features: ['Everything in Pro', '60-second clips', 'Real-time analytics', 'API access', 'Team collaboration', 'Commercial usage rights']
  }
};

// Stripe webhook events we handle
const STRIPE_WEBHOOK_EVENTS = {
  CHECKOUT_COMPLETED: 'checkout.session.completed',
  SUBSCRIPTION_CREATED: 'customer.subscription.created',
  SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  INVOICE_PAID: 'invoice.payment_succeeded',
  INVOICE_FAILED: 'invoice.payment_failed'
};

// Create checkout session for plan upgrades
const createCheckoutSession = async (userId, planType, billingPeriod = 'monthly') => {
  try {
    const plan = STRIPE_PLANS[planType];
    if (!plan || planType === 'free') {
      throw new Error('Invalid plan type');
    }

    const priceId = billingPeriod === 'annual' ? plan.stripePriceAnnual : plan.stripePriceMonthly;
    
    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/cancel`,
      metadata: {
        userId: userId,
        planType: planType,
        billingPeriod: billingPeriod
      },
      client_reference_id: userId
    });

    return session;
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    throw error;
  }
};

// Create customer portal session for subscription management
const createPortalSession = async (customerId) => {
  try {
    const session = await stripeClient.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/account`
    });

    return session;
  } catch (error) {
    console.error('Error creating Stripe portal session:', error);
    throw error;
  }
};

// Get subscription details
const getSubscription = async (subscriptionId) => {
  try {
    const subscription = await stripeClient.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    throw error;
  }
};

// Cancel subscription
const cancelSubscription = async (subscriptionId) => {
  try {
    const subscription = await stripeClient.subscriptions.del(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};

// Verify webhook signature
const verifyWebhookSignature = (payload, signature) => {
  try {
    const event = stripeClient.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    return event;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw error;
  }
};

module.exports = {
  stripeClient,
  STRIPE_PLANS,
  STRIPE_WEBHOOK_EVENTS,
  createCheckoutSession,
  createPortalSession,
  getSubscription,
  cancelSubscription,
  verifyWebhookSignature
};