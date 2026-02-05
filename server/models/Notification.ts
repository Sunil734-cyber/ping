import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: string;
  message: string;
  category?: string;
  activityLogged?: boolean;
  timestamp: Date;
  scheduledFor?: Date;
  read: boolean;
  metadata?: {
    interval?: number;
    customData?: any;
  };
}

const NotificationSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  message: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['work', 'social', 'exercise', 'commute', 'meals', 'sleep', 'leisure'],
    default: null
  },
  activityLogged: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  scheduledFor: {
    type: Date
  },
  read: {
    type: Boolean,
    default: false
  },
  metadata: {
    interval: Number,
    customData: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index for efficient queries
NotificationSchema.index({ userId: 1, timestamp: -1 });
NotificationSchema.index({ userId: 1, read: 1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
