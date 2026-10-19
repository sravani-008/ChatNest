import { User } from '../models/User.js';

export const getMyProfile = async (req, res, next) => {
  try {
    const user = req.user;
    return res.status(200).json({
      success: true,
      data: {
        user: user.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyProfile = async (req, res, next) => {
  try {
    const { name, bio } = req.body;

    if (name !== undefined && (!name || typeof name !== 'string' || !name.trim())) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PROFILE_UPDATE_FAILED',
          message: 'Name is required and cannot be empty.',
        },
      });
    }

    const user = req.user;

    if (name !== undefined) {
      user.name = name.trim();
    }

    if (bio !== undefined) {
      user.bio = typeof bio === 'string' ? bio.trim() : null;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          bio: user.bio,
          status: user.status,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
