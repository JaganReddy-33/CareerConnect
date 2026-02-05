import mongoose from 'mongoose';

const jobAlertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    keywords: [String],
    jobType: [String],
    location: String,
    minSalary: Number,
    maxSalary: Number,
    remote: Boolean,
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'instant'],
      default: 'weekly',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastSent: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const JobAlert = mongoose.model('JobAlert', jobAlertSchema);
export default JobAlert;
