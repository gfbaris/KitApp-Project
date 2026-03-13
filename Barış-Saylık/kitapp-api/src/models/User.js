const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Ad zorunludur'],
      trim: true,
      minlength: [2, 'Ad en az 2 karakter olmalıdır'],
      maxlength: [50, 'Ad en fazla 50 karakter olabilir'],
    },
    lastName: {
      type: String,
      required: [true, 'Soyad zorunludur'],
      trim: true,
      minlength: [2, 'Soyad en az 2 karakter olmalıdır'],
      maxlength: [50, 'Soyad en fazla 50 karakter olabilir'],
    },
    email: {
      type: String,
      required: [true, 'E-posta zorunludur'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Geçerli bir e-posta adresi giriniz'],
    },
    password: {
      type: String,
      required: [true, 'Şifre zorunludur'],
      minlength: [8, 'Şifre en az 8 karakter olmalıdır'],
      select: false,
    },
    phone: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Şifreyi kaydetmeden önce hashle
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Şifre karşılaştırma metodu
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
