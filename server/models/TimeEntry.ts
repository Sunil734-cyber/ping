import mongoose, { Schema, Document } from 'mongoose';

export type CategoryId = 'work' | 'social' | 'exercise' | 'commute' | 'meals' | 'sleep' | 'leisure';

export interface ITimeEntry extends Document {
  userId: string;
  hour: number;
  date: string;
  categoryId: CategoryId | null;
  customText?: string;
  timestamp: number;
  notificationId?: string;
}

const TimeEntrySchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  hour: {
    type: Number,
    required: true,
    min: 0,
    max: 23
  },
  date: {
    type: String,
    required: true,
    index: true
  },
  categoryId: {
    type: String,
    enum: ['work', 'social', 'exercise', 'commute', 'meals', 'sleep', 'leisure', null],
    default: null
  },
  customText: {
    type: String
  },
  timestamp: {
    type: Number,
    required: true
  },
  notificationId: {
    type: String
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
TimeEntrySchema.index({ userId: 1, date: -1 });
TimeEntrySchema.index({ userId: 1, date: 1, hour: 1 });

export default mongoose.model<ITimeEntry>('TimeEntry', TimeEntrySchema);
