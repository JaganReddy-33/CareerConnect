import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['jobSeeker', 'employer', 'admin'],
      default: 'jobSeeker',
    },
    phone: {
      type: String,
      trim: true,
    },
    location: {
      city: String,
      country: String,
    },
    profileImage: {
      type: String,
    },
    resume: {
      fileName: String,
      mimeType: String,
      data: Buffer,
      uploadedAt: Date,
    },
    bio: {
      type: String,
    },
    skills: [String],
    experience: [
      {
        company: String,
        position: String,
        duration: String,
        description: String,
      },
    ],
    socialLinks: {
      linkedin: String,
      github: String,
      portfolio: String,
    },
    company: {
      name: String,
      logo: String,
      description: String,
      website: String,
    },
    savedJobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
      },
    ],
    refreshToken: {
      type: String,
    },
    passwordResetToken: String,
    passwordResetExpire: Date,
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpire: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    console.log('Password not modified, skipping hash');
    return next();
  }

  try {
    console.log('Hashing password for:', this.email);
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(this.password, salt);
    console.log('Password hashed successfully');
    console.log('Original:', this.password);
    console.log('Hashed:', hashedPassword);
    this.password = hashedPassword;
    next();
  } catch (error) {
    console.error('Error hashing password:', error);
    next(error);
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  console.log('Comparing passwords:');
  console.log('Entered:', enteredPassword);
  console.log('Stored (hashed):', this.password);
  const match = await bcryptjs.compare(enteredPassword, this.password);
  console.log('Match result:', match);
  return match;
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.refreshToken;
  return user;
};

const User = mongoose.model('User', userSchema);
export default User;
