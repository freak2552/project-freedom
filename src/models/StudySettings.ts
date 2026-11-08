import { Schema, model, models, type InferSchemaType } from 'mongoose';

// One settings document per user: the normal daily target plus per-date overrides.
const StudySettingsSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    dailyTargetHours: { type: Number, required: true, min: 0, max: 24, default: 5 },
    // Keyed by "YYYY-MM-DD" -> hours. Replaces the normal target for that date.
    specialDays: { type: Map, of: Number, default: {} },
  },
  { timestamps: true },
);

export type StudySettingsDoc = InferSchemaType<typeof StudySettingsSchema>;
export const StudySettings = models.StudySettings || model('StudySettings', StudySettingsSchema);
