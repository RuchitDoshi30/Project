import { Request, Response } from 'express';
import { PlacementDrive } from '../models';
import { asyncHandler } from '../middlewares/asyncHandler';
import { ApiError } from '../middlewares/errorHandler';

export const getDrives = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit as string, 10) || 20, 50);
  const skip = (page - 1) * limit;

  const total = await PlacementDrive.countDocuments();
  const drives = await PlacementDrive.find()
    .sort({ driveDate: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    data: drives,
    page,
    totalPages: Math.ceil(total / limit),
    total,
  });
});

export const createDrive = asyncHandler(async (req: Request, res: Response) => {
  const drive = await PlacementDrive.create(req.body);
  res.status(201).json({ success: true, data: drive });
});

export const updateDrive = asyncHandler(async (req: Request, res: Response) => {
  const drive = await PlacementDrive.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!drive) throw new ApiError(404, 'Placement drive not found');
  res.json({ success: true, data: drive });
});

export const deleteDrive = asyncHandler(async (req: Request, res: Response) => {
  const drive = await PlacementDrive.findByIdAndDelete(req.params.id);
  if (!drive) throw new ApiError(404, 'Placement drive not found');
  res.json({ success: true, message: 'Placement drive deleted' });
});
