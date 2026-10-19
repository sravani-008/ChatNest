import { User } from '../models/User.js';
import { signToken } from '../config/jwt.js';
import { verifyGoogleOAuth } from '../config/googleAuth.js';

export const googleLogin = async (req, res, next) => {
  try {
    const { credential, idToken, accessToken, code } = req.body;

    if (!credential && !idToken && !accessToken && !code) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'AUTH_INVALID',
          message: 'Google credential, access token, or code is required.',
        },
      });
    }

    const googlePayload = await verifyGoogleOAuth({ credential, idToken, accessToken, code });

    let user = await User.findOne({
      $or: [{ googleId: googlePayload.googleId }, { email: googlePayload.email.toLowerCase() }],
    });

    if (user) {
      if (!user.googleId) user.googleId = googlePayload.googleId;
      if (googlePayload.avatarUrl && !user.avatarUrl) user.avatarUrl = googlePayload.avatarUrl;
      await user.save();
    } else {
      user = await User.create({
        googleId: googlePayload.googleId,
        email: googlePayload.email.toLowerCase(),
        name: googlePayload.name,
        avatarUrl: googlePayload.avatarUrl || null,
        status: 'online',
      });
    }

    const token = signToken({ id: user._id.toString() });

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: user.toJSON(),
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_INVALID',
        message: error.message || 'Google authentication failed',
      },
    });
  }
};

export const googleCallback = async (req, res) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  try {
    const { code } = req.query;
    if (!code) {
      return res.redirect(`${clientUrl}/login?error=no_code`);
    }

    const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
    const googlePayload = await verifyGoogleOAuth({ code, redirectUri });

    let user = await User.findOne({
      $or: [{ googleId: googlePayload.googleId }, { email: googlePayload.email.toLowerCase() }],
    });

    if (user) {
      if (!user.googleId) user.googleId = googlePayload.googleId;
      if (googlePayload.avatarUrl && !user.avatarUrl) user.avatarUrl = googlePayload.avatarUrl;
      await user.save();
    } else {
      user = await User.create({
        googleId: googlePayload.googleId,
        email: googlePayload.email.toLowerCase(),
        name: googlePayload.name,
        avatarUrl: googlePayload.avatarUrl || null,
        status: 'online',
      });
    }

    const token = signToken({ id: (user._id || user.id).toString() });
    return res.redirect(`${clientUrl}/chat?token=${token}`);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return res.redirect(`${clientUrl}/login?error=auth_failed`);
  }
};

export const devLogin = async (req, res, next) => {
  try {
    const { email, name, avatarUrl } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'AUTH_INVALID',
          message: 'Email is required for dev login.',
        },
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = (name || cleanEmail.split('@')[0]).trim();
    const googleId = `dev_google_${Buffer.from(cleanEmail).toString('hex').slice(0, 16)}`;

    let user = await User.findOne({ email: cleanEmail });

    if (user) {
      if (avatarUrl && !user.avatarUrl) {
        user.avatarUrl = avatarUrl;
        await user.save();
      }
    } else {
      user = await User.create({
        googleId,
        email: cleanEmail,
        name: cleanName,
        avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanEmail}`,
        status: 'online',
      });
    }

    const token = signToken({ id: user._id.toString() });

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: user.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          googleId: user.googleId,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          status: user.status,
          createdAt: user.createdAt.toISOString(),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const user = req.user;
    if (user) {
      user.status = 'offline';
      user.lastSeen = new Date();
      await user.save();
    }

    return res.status(200).json({
      success: true,
      data: {
        message: 'Logged out successfully',
      },
    });
  } catch (error) {
    next(error);
  }
};
