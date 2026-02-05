import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationSettings extends Document {
  userId: string;
  enabled: boolean;
  interval: number; // in minutes
  startTime?: string; // e.g., "09:00"
  endTime?: string; // e.g., "18:00"
  daysOfWeek?: number[]; // 0-6, Sunday-Saturday
  lastPingTime?: Date;
}

const NotificationSettingsSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  enabled: {
    type: Boolean,
    default: false
  },
  interval: {
    type: Number,
    enum: [15, 30, 60, 120],
    default: 60
  },
  startTime: {
    type: String,
    default: '09:00'
  },
  endTime: {
    type: String,
    default: '18:00'
  },
  daysOfWeek: {
    type: [Number],
    default: [1, 2, 3, 4, 5] // Monday to Friday
  },
  lastPingTime: {
    type: Date
  }
}, {
  timestamps: true
});

export default mongoose.model<INotificationSettings>('NotificationSettings', NotificationSettingsSchema);
