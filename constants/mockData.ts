// constants/mockData.ts
import type { TeeTime } from "@/types";

export const MOCK_TEE_TIMES: TeeTime[] = [
  {
    id: "1",
    time: "8:30 AM",
    day: "Today, June 17th",
    players: ["John Doe", "Jane Smith"],
    isConfirmed: true,
  },
  {
    id: "2",
    time: "2:00 PM",
    day: "Tomorrow, June 18th",
    players: ["John Doe", "Peter Jones", "Mary Williams", "Susan Brown"],
    isConfirmed: true,
  },
  {
    id: "3",
    time: "10:15 AM",
    day: "Friday, June 20th",
    players: ["John Doe"],
    isConfirmed: false,
  },
];
