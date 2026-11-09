import mongoose, { Schema, model, models, type InferSchemaType } from 'mongoose';

// Same five feelings as the old DayFeeling component.
export const MOOD_VALUES = ['low', 'meh', 'okay', 'good', 'great'] as const;
export type MoodValue = (typeof MOOD_VALUES)[number];

const MoodEntrySchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    dateKey: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    mood: { type: String, required: true, enum: MOOD_VALUES },
  },
  { timestamps: true },
);

// One mood per user per day. Saving again updates it.
MoodEntrySchema.index({ userId: 1, dateKey: 1 }, { unique: true });

export type MoodEntryDoc = InferSchemaType<typeof MoodEntrySchema> & {
  _id: mongoose.Types.ObjectId;
};
export const MoodEntry = models.MoodEntry || model('MoodEntry', MoodEntrySchema);
