import mongoose, { Schema, model, models, type InferSchemaType } from 'mongoose';

// One mark per habit per day. Colours: green = completed, yellow = partial,
// red = missed, blue = rest / extra, black = skipped.
export const HABIT_COLORS = ['green', 'yellow', 'red', 'blue', 'black'] as const;
export type HabitColor = (typeof HABIT_COLORS)[number];

const HabitLogSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    habitId: { type: Schema.Types.ObjectId, ref: 'Habit', required: true },
    dateKey: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    color: { type: String, required: true, enum: HABIT_COLORS },
  },
  { timestamps: true },
);

// One log per habit per day.
HabitLogSchema.index({ userId: 1, habitId: 1, dateKey: 1 }, { unique: true });
HabitLogSchema.index({ userId: 1, dateKey: 1 });

export type HabitLogDoc = InferSchemaType<typeof HabitLogSchema> & { _id: mongoose.Types.ObjectId };
export const HabitLog = models.HabitLog || model('HabitLog', HabitLogSchema);
