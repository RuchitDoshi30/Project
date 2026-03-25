import { Request, Response } from 'express';
import { Announcement } from '../models';
import { asyncHandler } from '../middlewares/asyncHandler';
import { ApiError } from '../middlewares/errorHandler';

export const getAnnouncements = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit as string, 10) || 20, 50);
  const skip = (page - 1) * limit;

  // Non-admin users only see non-expired announcements
  const filter: any = {};
  if (req.user?.role !== 'admin') {
    filter.expiresAt = { $gte: new Date() };
  }

  const total = await Announcement.countDocuments(filter);
  const announcements = await Announcement.find(filter)
    .sort({ isPinned: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    data: announcements,
    page,
    totalPages: Math.ceil(total / limit),
    total,
  });
});

export const createAnnouncement = asyncHandler(async (req: Request, res: Response) => {
  const announcement = await Announcement.create(req.body);
  res.status(201).json({ success: true, data: announcement });
});

export const updateAnnouncement = asyncHandler(async (req: Request, res: Response) => {
  const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!announcement) throw new ApiError(404, 'Announcement not found');
  res.json({ success: true, data: announcement });
});

export const deleteAnnouncement = asyncHandler(async (req: Request, res: Response) => {
  const announcement = await Announcement.findByIdAndDelete(req.params.id);
  if (!announcement) throw new ApiError(404, 'Announcement not found');
  res.json({ success: true, message: 'Announcement deleted' });
});

export const togglePin = asyncHandler(async (req: Request, res: Response) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) throw new ApiError(404, 'Announcement not found');
  announcement.isPinned = !announcement.isPinned;
  await announcement.save();
  res.json({ success: true, data: announcement });
});
