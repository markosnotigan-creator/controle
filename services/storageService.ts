import { Officer, LeaveRecord, LeaveStatus, Rank } from '../types';

const OFFICERS_KEY = 'pm_folgas_officers';
const LEAVES_KEY = 'pm_folgas_leaves';

// Helper to simulate delay for realism (optional)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Data seeding
const seedData = () => {
  if (!localStorage.getItem(OFFICERS_KEY)) {
    const mockOfficers: Officer[] = [
      { id: '1', name: 'Silva', rank: Rank.CB, matricula: '12345', unit: '1º BPM', createdAt: Date.now() },
      { id: '2', name: 'Oliveira', rank: Rank.SD, matricula: '67890', unit: 'CHOQUE', createdAt: Date.now() },
      { id: '3', name: 'Santos', rank: Rank.SGT1, matricula: '11223', unit: 'RAIO', createdAt: Date.now() },
    ];
    localStorage.setItem(OFFICERS_KEY, JSON.stringify(mockOfficers));
  }
};

seedData();

export const StorageService = {
  // Officers
  getOfficers: async (): Promise<Officer[]> => {
    await delay(100);
    const data = localStorage.getItem(OFFICERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  getOfficerById: async (id: string): Promise<Officer | undefined> => {
    const officers = await StorageService.getOfficers();
    return officers.find(o => o.id === id);
  },

  saveOfficer: async (officer: Officer): Promise<void> => {
    const officers = await StorageService.getOfficers();
    const existingIndex = officers.findIndex(o => o.id === officer.id);
    if (existingIndex >= 0) {
      officers[existingIndex] = officer;
    } else {
      officers.push(officer);
    }
    localStorage.setItem(OFFICERS_KEY, JSON.stringify(officers));
  },

  deleteOfficer: async (id: string): Promise<void> => {
    const officers = await StorageService.getOfficers();
    const filtered = officers.filter(o => o.id !== id);
    localStorage.setItem(OFFICERS_KEY, JSON.stringify(filtered));
    // Also delete leaves
    const leaves = await StorageService.getLeaves();
    const filteredLeaves = leaves.filter(l => l.officerId !== id);
    localStorage.setItem(LEAVES_KEY, JSON.stringify(filteredLeaves));
  },

  // Leaves
  getLeaves: async (): Promise<LeaveRecord[]> => {
    await delay(100);
    const data = localStorage.getItem(LEAVES_KEY);
    return data ? JSON.parse(data) : [];
  },

  getLeavesByOfficer: async (officerId: string): Promise<LeaveRecord[]> => {
    const leaves = await StorageService.getLeaves();
    return leaves.filter(l => l.officerId === officerId);
  },

  saveLeave: async (leave: LeaveRecord): Promise<void> => {
    const leaves = await StorageService.getLeaves();
    const existingIndex = leaves.findIndex(l => l.id === leave.id);
    if (existingIndex >= 0) {
      leaves[existingIndex] = leave;
    } else {
      leaves.push(leave);
    }
    localStorage.setItem(LEAVES_KEY, JSON.stringify(leaves));
  },

  deleteLeave: async (id: string): Promise<void> => {
    const leaves = await StorageService.getLeaves();
    const filtered = leaves.filter(l => l.id !== id);
    localStorage.setItem(LEAVES_KEY, JSON.stringify(filtered));
  },

  // Aggregation
  getSummary: async () => {
    const officers = await StorageService.getOfficers();
    const leaves = await StorageService.getLeaves();
    
    let totalAvailable = 0;
    let totalUsed = 0;

    leaves.forEach(l => {
      if (l.status === LeaveStatus.AVAILABLE) totalAvailable += l.amount;
      if (l.status === LeaveStatus.USED) totalUsed += l.amount;
    });

    return {
      officerCount: officers.length,
      totalAvailable,
      totalUsed
    };
  }
};
