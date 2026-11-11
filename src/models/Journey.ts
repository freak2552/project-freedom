import mongoose, { Schema, model, models, type InferSchemaType } from 'mongoose';

export const JOURNEY_TYPE_IDS = ['general', 'study', 'life', 'habit', 'health'] as const;
export type JourneyTypeId = (typeof JOURNEY_TYPE_IDS)[number];

// A single log line inside a journey. Stored inside the journey document.
const JourneyEntrySchema = new Schema(
  {
    content: { type: String, required: true, trim: true, minlength: 1, maxlength: 1000 },
    date: { type: Date, default: Date.now },
  },
  { _id: true },
);

// A journey (adventure) with its entries. Stored permanently until the user deletes it.
const JourneySchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 60 },
    description: { type: String, default: '', trim: true, maxlength: 200 },
    type: { type: String, enum: JOURNEY_TYPE_IDS, default: 'general' },
    entries: { type: [JourneyEntrySchema], default: [] },
  },
  { timestamps: true },
);

JourneySchema.index({ userId: 1, createdAt: -1 });

export type JourneyDoc = InferSchemaType<typeof JourneySchema> & { _id: mongoose.Types.ObjectId };
export const Journey = models.Journey || model('Journey', JourneySchema);
