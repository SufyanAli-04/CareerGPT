import { Request, Response } from 'express';
import Stripe from 'stripe';
import { env } from '../config/env';
import User from '../models/User';

const isDummyKey = !env.STRIPE_SECRET_KEY;

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  // Let the SDK automatically select the correct default stable API version
} as any);

// @desc    Create Stripe Checkout Session
// @route   POST /api/stripe/create-checkout-session
// @access  Protected
export const createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { plan } = req.body;
    const userId = (req as any).user._id;

    if (isDummyKey) {
      res.status(400).json({ 
        message: 'Stripe Secret Key is not configured. Please add your real STRIPE_SECRET_KEY in server/.env and restart the server.' 
      });
      return;
    }

    if (!plan || (plan !== 'CareerGPT Advance' && plan !== 'CareerGPT Pro')) {
      res.status(400).json({ message: 'Invalid subscription plan selected.' });
      return;
    }

    const priceAmount = plan === 'CareerGPT Advance' ? 1900 : 4900; // in cents ($19 and $49)

    // Create session using Stripe hosted payment portal
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: plan,
              description: plan === 'CareerGPT Pro' ? 'Ultimate placement-focused coaching toolkit' : 'Essential AI career growth tools',
            },
            unit_amount: priceAmount,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${env.CLIENT_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.CLIENT_URL}/pricing`,
      metadata: {
        userId: userId.toString(),
        plan: plan,
      },
    });

    res.json({ success: true, url: session.url });
  } catch (error: any) {
    console.error('Stripe Session Error:', error);
    res.status(500).json({ message: 'Failed to create checkout session.', error: error.message });
  }
};

// @desc    Verify Stripe Checkout Session & update user subscription
// @route   POST /api/stripe/verify-session
// @access  Protected
export const verifyCheckoutSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      res.status(400).json({ message: 'Session ID is required.' });
      return;
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid' || session.status === 'complete') {
      const targetUserId = session.metadata?.userId;
      const targetPlan = session.metadata?.plan;

      if (!targetUserId || !targetPlan) {
        res.status(400).json({ message: 'Invalid session metadata.' });
        return;
      }

      // Update user plan in MongoDB database
      const user = await User.findById(targetUserId);
      if (!user) {
        res.status(404).json({ message: 'User not found.' });
        return;
      }

      user.plan = targetPlan;
      await user.save();

      res.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          currentRole: user.currentRole,
          targetRole: user.targetRole,
          firstName: user.firstName,
          lastName: user.lastName,
          dateOfBirth: user.dateOfBirth,
          phoneNumber: user.phoneNumber,
          userRole: user.userRole,
          country: user.country,
          city: user.city,
          postalCode: user.postalCode,
          language: user.language,
          theme: user.theme,
          plan: user.plan,
        },
      });
    } else {
      res.status(400).json({ message: 'Stripe session payment not completed.' });
    }
  } catch (error: any) {
    console.error('Stripe Verification Error:', error);
    res.status(500).json({ message: 'Failed to verify session.', error: error.message });
  }
};
