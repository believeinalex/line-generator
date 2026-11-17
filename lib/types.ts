export interface PlayerSummary {
  id: string;
  name: string;
  team: string;
  headshot: string;
}

export interface PlayerInfo {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  jersey: string;
  position: string;
  headshot: string;
  teamId: string;
  teamAbbr: string;
  teamName: string;
  /** hex without leading # */
  color: string;
  altColor: string;
}

export interface StatLine {
  min: number;
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  tpm: number;
  tpa: number;
  fgm: number;
  fga: number;
  ftm: number;
  fta: number;
  to: number;
  pf: number;
}

export interface GameEntry {
  eventId: string;
  /** ISO timestamp from ESPN (UTC) */
  date: string;
  seasonType: string;
  home: boolean;
  result: "W" | "L" | "";
  teamScore: number;
  oppScore: number;
  oppAbbr: string;
  oppName: string;
  oppLogo: string;
  teamAbbr: string;
  dnp: boolean;
  stats: StatLine;
}
