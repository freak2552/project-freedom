import mongoose, { Schema, model, models, type InferSchemaType } from 'mongoose';

// A habit the user tracks. Stored permanently until the user deletes it.
const HabitSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 40 },
  },
  { timestamps: true },
);

HabitSchema.index({ userId: 1, createdAt: 1 });

export type HabitDoc = InferSchemaType<typeof HabitSchema> & { _id: mongoose.Types.ObjectId };
export const Habit = models.Habit || model('Habit', HabitSchema);
