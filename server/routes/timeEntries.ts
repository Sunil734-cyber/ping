import express, { Request, Response } from 'express';
import TimeEntry from '../models/TimeEntry.js';
import { ApiError } from '../middleware/errorHandler.js';

const router = express.Router();

// Default userId for demo purposes
const DEFAULT_USER_ID = 'demo-user';

// Get time entries for a date range
router.get('/', async (req: Request, res: Response, next) => {
  try {
    const userId = req.query.userId as string || DEFAULT_USER_ID;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    
    const query: any = { userId };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }
    
    const entries = await TimeEntry.find(query).sort({ date: -1, hour: 1 });
    
    res.json({ success: true, data: entries });
  } catch (error) {
    next(error);
  }
});

// Get time entries for a specific date
router.get('/date/:date', async (req: Request, res: Response, next) => {
  try {
    const userId = req.query.userId as string || DEFAULT_USER_ID;
    const { date } = req.params;
    
    const entries = await TimeEntry.find({ userId, date }).sort({ hour: 1 });
    
    res.json({ success: true, data: entries });
  } catch (error) {
    next(error);
  }
});

// Create or update a time entry
router.post('/', async (req: Request, res: Response, next) => {
  try {
    const userId = req.body.userId || DEFAULT_USER_ID;
    const { hour, date, categoryId, customText, notificationId } = req.body;
    
    if (hour === undefined || !date) {
      throw new ApiError(400, 'Hour and date are required');
    }
    
    if (hour < 0 || hour > 23) {
      throw new ApiError(400, 'Hour must be between 0 and 23');
    }
    
    // Check if entry already exists for this hour and date
    const existingEntry = await TimeEntry.findOne({ userId, hour, date });
    
    let entry;
    if (existingEntry) {
      // Update existing entry
      entry = await TimeEntry.findByIdAndUpdate(
        existingEntry._id,
        {
          categoryId,
          customText,
          notificationId,
          timestamp: Date.now()
        },
        { new: true }
      );
    } else {
      // Create new entry
      entry = await TimeEntry.create({
        userId,
        hour,
        date,
        categoryId,
        customText,
        notificationId,
        timestamp: Date.now()
      });
    }
    
    res.status(existingEntry ? 200 : 201).json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
});

// Update a time entry
router.put('/:id', async (req: Request, res: Response, next) => {
  try {
    const { categoryId, customText } = req.body;
    
    const entry = await TimeEntry.findByIdAndUpdate(
      req.params.id,
      {
        categoryId,
        customText,
        timestamp: Date.now()
      },
      { new: true }
    );
    
    if (!entry) {
      throw new ApiError(404, 'Time entry not found');
    }
    
    res.json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
});

// Delete a time entry
router.delete('/:id', async (req: Request, res: Response, next) => {
  try {
    const entry = await TimeEntry.findByIdAndDelete(req.params.id);
    
    if (!entry) {
      throw new ApiError(404, 'Time entry not found');
    }
    
    res.json({ success: true, data: { message: 'Time entry deleted' } });
  } catch (error) {
    next(error);
  }
});

// Get statistics for time entries
router.get('/stats/summary', async (req: Request, res: Response, next) => {
  try {
    const userId = req.query.userId as string || DEFAULT_USER_ID;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    
    const query: any = { userId };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }
    
    const entries = await TimeEntry.find(query);
    
    // Group by category
    const categoryStats = entries.reduce((acc: any, entry) => {
      const cat = entry.categoryId || 'unassigned';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
    
    res.json({ 
      success: true, 
      data: {
        total: entries.length,
        byCategory: categoryStats,
        dateRange: { startDate, endDate }
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
