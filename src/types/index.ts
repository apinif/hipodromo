export interface Member {
  id: string;
  name: string;
  drawn: boolean;
  createdAt: string;
}

export interface DrawResult {
  winner: Member;
  poolReset: boolean;
  remainingCount: number;
  totalCount: number;
}

export interface DrawState {
  poolSize: number;
  totalMembers: number;
  drawnThisCycle: number;
  lastWinner: string | null;
}
