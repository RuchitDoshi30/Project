export interface Announcement {
  id: string;
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

const STORAGE_KEYS = {
  announcements: 'admin_announcements',
  drives: 'admin_placement_drives',
} as const;

const defaultAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'TCS Digital — Campus Drive on Feb 20',
    body: 'TCS Digital will be conducting a campus recruitment drive on February 20, 2026. Eligible branches: CS, IT. Minimum CGPA: 7.0. Students must register on the placement portal by Feb 18. Carry 2 copies of resume, ID card, and all mark sheets. Dress code: Formal.',
    priority: 'Urgent',
    targetAudience: 'CS, IT — Batch 2026',
    createdAt: '2026-02-10T09:00:00Z',
    expiresAt: '2026-02-20T23:59:00Z',
    isPinned: true,
    author: 'Dr. Placement Coordinator',
    views: 234,
  },
  {
    id: '2',
    title: 'Infosys Registration Open — Deadline Mar 2',
    body: 'Infosys has opened registrations for the Systems Engineer position. All branches are eligible with minimum CGPA 6.5. The drive is scheduled for March 5, 2026. Register through the placement portal immediately. Late applications will not be accepted.',
    priority: 'Important',
    targetAudience: 'All Branches — Batch 2026',
    createdAt: '2026-02-12T10:30:00Z',
    expiresAt: '2026-03-02T23:59:00Z',
    isPinned: true,
    author: 'Dr. Placement Coordinator',
    views: 189,
  },
  {
    id: '3',
    title: 'Resume Building Workshop — Feb 25',
    body: 'The Training & Placement Cell is organizing a Resume Building Workshop on February 25, 2026. Time: 2:00 PM - 5:00 PM. Venue: Seminar Hall, Block A. Expert: Ms. Priya Sharma (HR Consultant). All pre-final and final year students are encouraged to attend. Bring your laptop.',
    priority: 'Normal',
    targetAudience: 'All Students',
    createdAt: '2026-02-14T14:00:00Z',
    expiresAt: '2026-02-25T23:59:00Z',
    isPinned: false,
    author: 'Training Cell',
    views: 98,
  },
];

const defaultDrives: PlacementDrive[] = [
  {
    id: '1',
    companyName: 'TCS Digital',
    jobRole: 'Software Developer',
    packageLPA: '7.0',
    driveDate: '2026-02-20',
    lastDateToApply: '2026-02-18',
    location: 'Campus - Main Auditorium',
    eligibleBranches: ['CS', 'IT'],
    minCGPA: 7,
    status: 'Upcoming',
    rounds: ['Online Test', 'Technical Interview', 'HR Interview'],
    registeredStudents: 45,
    selectedStudents: 0,
    description: 'TCS Digital hiring for full-stack developer roles. Strong knowledge of DSA and system design required.',
  },
  {
    id: '2',
    companyName: 'Infosys',
    jobRole: 'Systems Engineer',
    packageLPA: '5.5',
    driveDate: '2026-03-05',
    lastDateToApply: '2026-03-02',
    location: 'Campus - Seminar Hall',
    eligibleBranches: ['CS', 'IT', 'EC', 'EE'],
    minCGPA: 6.5,
    status: 'Upcoming',
    rounds: ['Aptitude Test', 'Technical Interview', 'HR Interview'],
    registeredStudents: 87,
    selectedStudents: 0,
    description: 'Infosys campus recruitment for Systems Engineer position. Open to all engineering branches.',
  },
  {
    id: '3',
    companyName: 'Wipro',
    jobRole: 'Project Engineer',
    packageLPA: '4.5',
    driveDate: '2026-01-15',
    lastDateToApply: '2026-01-12',
    location: 'Campus - Block A',
    eligibleBranches: ['CS', 'IT', 'EC'],
    minCGPA: 6,
    status: 'Completed',
    rounds: ['Online Assessment', 'Group Discussion', 'Interview'],
    registeredStudents: 120,
    selectedStudents: 32,
    description: 'Wipro Project Engineer recruitment drive. Basic programming skills and aptitude required.',
  },
];

const readFromStorage = <T>(key: string, fallback: T): T => {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeToStorage = (key: string, value: unknown): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getAnnouncements = (): Announcement[] => {
  const announcements = readFromStorage<Announcement[]>(STORAGE_KEYS.announcements, defaultAnnouncements);
  if (!localStorage.getItem(STORAGE_KEYS.announcements)) {
    writeToStorage(STORAGE_KEYS.announcements, announcements);
  }
  return announcements;
};

export const getAnnouncementById = (id: string): Announcement | undefined => {
  return getAnnouncements().find((item) => item.id === id);
};

export const saveAnnouncement = (announcement: Announcement): void => {
  const announcements = getAnnouncements();
  const index = announcements.findIndex((item) => item.id === announcement.id);

  if (index >= 0) {
    announcements[index] = announcement;
  } else {
    announcements.unshift(announcement);
  }

  writeToStorage(STORAGE_KEYS.announcements, announcements);
};

export const deleteAnnouncementById = (id: string): void => {
  const announcements = getAnnouncements().filter((item) => item.id !== id);
  writeToStorage(STORAGE_KEYS.announcements, announcements);
};

export const toggleAnnouncementPin = (id: string): void => {
  const announcements = getAnnouncements().map((item) =>
    item.id === id ? { ...item, isPinned: !item.isPinned } : item
  );
  writeToStorage(STORAGE_KEYS.announcements, announcements);
};

export const getPlacementDrives = (): PlacementDrive[] => {
  const drives = readFromStorage<PlacementDrive[]>(STORAGE_KEYS.drives, defaultDrives);
  if (!localStorage.getItem(STORAGE_KEYS.drives)) {
    writeToStorage(STORAGE_KEYS.drives, drives);
  }
  return drives;
};

export const getPlacementDriveById = (id: string): PlacementDrive | undefined => {
  return getPlacementDrives().find((item) => item.id === id);
};

export const savePlacementDrive = (drive: PlacementDrive): void => {
  const drives = getPlacementDrives();
  const index = drives.findIndex((item) => item.id === drive.id);

  if (index >= 0) {
    drives[index] = drive;
  } else {
    drives.unshift(drive);
  }

  writeToStorage(STORAGE_KEYS.drives, drives);
};

export const deletePlacementDriveById = (id: string): void => {
  const drives = getPlacementDrives().filter((item) => item.id !== id);
  writeToStorage(STORAGE_KEYS.drives, drives);
};