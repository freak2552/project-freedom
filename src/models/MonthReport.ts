import { Schema, model, models, type InferSchemaType } from 'mongoose';

// One document per user per month that has a custom report name.
// Months without a document use the default name "Month Year".
// Add future per-month fields (for example a note) to this schema.
const MonthReportSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    monthKey: { type: String, required: true, match: /^\d{4}-(0[1-9]|1[0-2])$/ },
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 60 },
  },
  { timestamps: true },
);

// One report record per user per month.
MonthReportSchema.index({ userId: 1, monthKey: 1 }, { unique: true });

export type MonthReportDoc = InferSchemaType<typeof MonthReportSchema>;
export const MonthReport = models.MonthReport || model('MonthReport', MonthReportSchema);
