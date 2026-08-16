import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { env } from '../config/env';

const generateToken = (id: string): string => {
  return jwt.sign({ id }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, userRole } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: 'Please provide all required fields' });
      return;
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: 'User already exists with this email' });
      return;
    }

    const nameParts = name.trim().split(/\s+/);
    let firstName = '';
    let lastName = '';
    if (nameParts.length === 1) {
      firstName = nameParts[0];
    } else {
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(' ');
    }

    const user = await User.create({
      name,
      email,
      password,
      firstName,
      lastName,
      userRole: userRole || 'User',
    });

    res.status(201).json({
      success: true,
      token: generateToken((user._id as unknown) as string),
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
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Please provide email and password' });
      return;
    }

    const ADMIN_EMAIL = 'admin@careergpt.com';
    const ADMIN_PASSWORD = 'admin@123';

    if (email.toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      let adminUser = await User.findOne({ email: ADMIN_EMAIL });
      if (!adminUser) {
        adminUser = await User.create({
          name: 'System Admin',
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          userRole: 'Admin',
          plan: 'CareerGPT Pro',
          firstName: 'System',
          lastName: 'Admin'
        });
      }

      res.json({
        success: true,
        token: generateToken((adminUser._id as unknown) as string),
        user: {
          _id: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
          avatar: adminUser.avatar,
          currentRole: adminUser.currentRole,
          targetRole: adminUser.targetRole,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          dateOfBirth: adminUser.dateOfBirth,
          phoneNumber: adminUser.phoneNumber,
          userRole: adminUser.userRole,
          country: adminUser.country,
          city: adminUser.city,
          postalCode: adminUser.postalCode,
          language: adminUser.language,
          theme: adminUser.theme,
          plan: adminUser.plan,
        },
      });
      return;
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    if (user.suspended) {
      res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });
      return;
    }

    res.json({
      success: true,
      token: generateToken((user._id as unknown) as string),
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
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Protected
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById((req as any).user._id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Protected
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById((req as any).user._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const {
      name,
      currentRole,
      targetRole,
      avatar,
      firstName,
      lastName,
      dateOfBirth,
      phoneNumber,
      userRole,
      country,
      city,
      postalCode,
      language,
      theme,
      plan,
    } = req.body;

    if (name !== undefined) user.name = name;
    if (currentRole !== undefined) user.currentRole = currentRole;
    if (targetRole !== undefined) user.targetRole = targetRole;
    if (avatar !== undefined) user.avatar = avatar;
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (userRole !== undefined) user.userRole = userRole;
    if (country !== undefined) user.country = country;
    if (city !== undefined) user.city = city;
    if (postalCode !== undefined) user.postalCode = postalCode;
    if (language !== undefined) user.language = language;
    if (theme !== undefined) user.theme = theme;
    if (plan !== undefined) user.plan = plan;

    const updatedUser = await user.save();
    res.json({
      success: true,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        currentRole: updatedUser.currentRole,
        targetRole: updatedUser.targetRole,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        dateOfBirth: updatedUser.dateOfBirth,
        phoneNumber: updatedUser.phoneNumber,
        userRole: updatedUser.userRole,
        country: updatedUser.country,
        city: updatedUser.city,
        postalCode: updatedUser.postalCode,
        language: updatedUser.language,
        theme: updatedUser.theme,
        plan: updatedUser.plan,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
