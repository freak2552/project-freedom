import mongoose, { Schema, model, models, type InferSchemaType } from 'mongoose';

const DiaryEntrySchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    dateKey: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    text: { type: String, required: true, trim: true, minlength: 1, maxlength: 5000 },
  },
  { timestamps: true },
);

// One diary entry per user per day. Saving again updates it.
DiaryEntrySchema.index({ userId: 1, dateKey: 1 }, { unique: true });

export type DiaryEntryDoc = InferSchemaType<typeof DiaryEntrySchema> & {
  _id: mongoose.Types.ObjectId;
};
export const DiaryEntry = models.DiaryEntry || model('DiaryEntry', DiaryEntrySchema);
