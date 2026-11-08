import mongoose, { Schema, model, models, type InferSchemaType } from 'mongoose';

const SubjectSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
  },
  { timestamps: true },
);

SubjectSchema.index({ userId: 1, name: 1 });

export type SubjectDoc = InferSchemaType<typeof SubjectSchema> & { _id: mongoose.Types.ObjectId };
export const Subject = models.Subject || model('Subject', SubjectSchema);
