import mongoose, { Schema, type Model } from "mongoose";

export interface StudySubjectDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  normalizedName: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudySubjectSchema = new Schema<StudySubjectDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40,
    },
    normalizedName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 40,
    },
  },
  { timestamps: true },
);

StudySubjectSchema.index(
  { userId: 1, normalizedName: 1 },
  { unique: true, name: "unique_subject_name_per_user" },
);
StudySubjectSchema.index({ userId: 1, createdAt: 1 });

const StudySubject =
  (mongoose.models.StudySubject as Model<StudySubjectDocument> | undefined) ??
  mongoose.model<StudySubjectDocument>("StudySubject", StudySubjectSchema);

export default StudySubject;
