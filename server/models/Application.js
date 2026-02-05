import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coverLetter: String,
    resume: {
      fileId: mongoose.Schema.Types.ObjectId,
      fileName: String,
    },
    status: {
      type: String,
      enum: ['Applied', 'Reviewed', 'Interview', 'Offer', 'Rejected', 'Withdrawn'],
      default: 'Applied',
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    notes: [
      {
        by: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        text: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    screeningScore: Number,
    interviews: [
      {
        date: Date,
        interviewer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        feedback: String,
        score: Number,
      },
    ],
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

applicationSchema.index({ applicant: 1, job: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);
export default Application;
