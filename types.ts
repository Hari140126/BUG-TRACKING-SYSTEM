
export enum UserRole {
  TESTER = 'Tester',
  DEVELOPER = 'Developer',
  MANAGER = 'Manager'
}

export enum BugPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export enum BugStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'In-Progress',
  RESOLVED = 'Resolved'
}

export interface BugAttachment {
  name: string;
  type: string;
  size: number;
  data: string; // Base64 encoded data
}

export interface User {
  id: number;
  fullName: string;
  username: string;
  email: string;
  role: UserRole;
  designation?: string;
  department?: string;
  skills?: string;
  password?: string;
  isApproved: boolean;
  createdAt: string;
}

export interface Bug {
  id: number;
  title: string;
  description: string;
  priority: BugPriority;
  status: BugStatus;
  createdAt: string;
  dueDate: string;
  testerId: number;
  developerId: number | null;
  developerName?: string;
  testerName?: string;
  failingCode?: string;
  fixedCode?: string;
  attachments: BugAttachment[];
}

export interface Comment {
  id: number;
  bugId: number;
  userId: number;
  content: string;
  createdAt: string;
}
