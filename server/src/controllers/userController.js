import mongoose from 'mongoose';
import { User } from '../models/User.js';

export const getUsers = async (req, res, next) => {
  try {
    const currentUserId = req.userId;
    const { search } = req.query;

    const query = {
      _id: { $ne: currentUserId },
    };

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const users = await User.find(query).sort({ name: 1 });

    const formattedUsers = users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      avatarUrl: u.avatarUrl,
      status: u.status,
      lastSeen: u.lastSeen ? u.lastSeen.toISOString() : null,
    }));

    return res.status(200).json({
      success: true,
      data: {
        users: formattedUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found.',
        },
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found.',
        },
      });
    }

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
          lastSeen: user.lastSeen ? user.lastSeen.toISOString() : null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
