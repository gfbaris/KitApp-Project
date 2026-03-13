const User = require('../models/User');

// GET /users/:userId
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// PUT /users/:userId
const updateUser = async (req, res, next) => {
  try {
    if (req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ error: 'Bu işlem için yetkiniz bulunmuyor' });
    }

    const { firstName, lastName, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { firstName, lastName, phone },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// DELETE /users/:userId
const deleteUser = async (req, res, next) => {
  try {
    if (req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ error: 'Bu işlem için yetkiniz bulunmuyor' });
    }

    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = { getUser, updateUser, deleteUser };
