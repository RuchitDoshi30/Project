import { api } from './api.client';

export interface Announcement {
  id: string;
  _id?: string;
  title: string;
  body: string;
  priority: 'Normal' | 'Important' | 'Urgent';
  targetAudience: string;
  createdAt: string;
  expiresAt: string;
  isPinned: boolean;
  author: string;
  views: number;
}

export interface PlacementDrive {
  id: string;
  _id?: string;
  companyName: string;
  companyLogo?: string;
  jobRole: string;
  packageLPA: string;
  driveDate: string;
  lastDateToApply: string;
  location: string;
  eligibleBranches: string[];
  minCGPA: number;
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  rounds: string[];
  registeredStudents: number;
  selectedStudents: number;
  description: string;
}

// Helper to normalize MongoDB _id to id
const normalizeId = <T extends { _id?: string; id?: string }>(item: T): T & { id: string } => ({
  ...item,
  id: item._id || item.id || '',
});

// ---- Announcements ----
export const getAnnouncements = async (): Promise<Announcement[]> => {
  const response = await api.get<{ success: boolean; data: any[] }>('/announcements');
  return response.data.map(normalizeId);
};

export const getAnnouncementById = async (id: string): Promise<Announcement | undefined> => {
  const all = await getAnnouncements();
  return all.find(a => a.id === id || a._id === id);
};

export const saveAnnouncement = async (announcement: Partial<Announcement>): Promise<void> => {
  if (announcement._id || announcement.id) {
    await api.put(`/announcements/${announcement._id || announcement.id}`, announcement);
  } else {
    await api.post('/announcements', announcement);
  }
};

export const deleteAnnouncementById = async (id: string): Promise<void> => {
  await api.delete(`/announcements/${id}`);
};

export const toggleAnnouncementPin = async (id: string): Promise<void> => {
  await api.patch(`/announcements/${id}/toggle-pin`);
};

// ---- Placement Drives ----
export const getPlacementDrives = async (): Promise<PlacementDrive[]> => {
  const response = await api.get<{ success: boolean; data: any[] }>('/drives');
  return response.data.map(normalizeId);
};

export const getPlacementDriveById = async (id: string): Promise<PlacementDrive | undefined> => {
  const all = await getPlacementDrives();
  return all.find(d => d.id === id || d._id === id);
};

export const savePlacementDrive = async (drive: Partial<PlacementDrive>): Promise<void> => {
  if (drive._id || drive.id) {
    await api.put(`/drives/${drive._id || drive.id}`, drive);
  } else {
    await api.post('/drives', drive);
  }
};

export const deletePlacementDriveById = async (id: string): Promise<void> => {
  await api.delete(`/drives/${id}`);
};