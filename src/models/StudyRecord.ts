import mongoose, { Schema, model, models, type InferSchemaType } from 'mongoose';


const StudyRecordSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    subjectName: { type: String, required: true, trim: true, maxlength: 60 },
    dateKey: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    minutes: { type: Number, required: true, min: 0, max: 1440, default: 0 },
  },
  { timestamps: true },
);

StudyRecordSchema.index({ userId: 1, dateKey: 1, subjectId: 1 }, { unique: true });

export type StudyRecordDoc = InferSchemaType<typeof StudyRecordSchema> & {
  _id: mongoose.Types.ObjectId;
};
export const StudyRecord = models.StudyRecord || model('StudyRecord', StudyRecordSchema);
