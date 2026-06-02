import {
  collection, addDoc, query, where, orderBy, limit, getDocs, Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export interface StatusReport {
  stationId: string;
  working: boolean;
  createdAt: Timestamp;
}

export interface StatusSummary {
  working: number;
  notWorking: number;
  lastReport?: { working: boolean; date: string };
}

export async function reportStatus(stationId: string, working: boolean): Promise<void> {
  await addDoc(collection(db, "statusReports"), {
    stationId,
    working,
    createdAt: Timestamp.now(),
  });
}

export async function getStatusSummary(stationId: string): Promise<StatusSummary> {
  // Last 20 reports for this station
  const q = query(
    collection(db, "statusReports"),
    where("stationId", "==", stationId),
    orderBy("createdAt", "desc"),
    limit(20)
  );
  const snap = await getDocs(q);
  let working = 0, notWorking = 0;
  let lastReport: StatusSummary["lastReport"];

  snap.docs.forEach((d, i) => {
    const data = d.data() as StatusReport;
    if (data.working) working++; else notWorking++;
    if (i === 0) {
      lastReport = {
        working: data.working,
        date: data.createdAt.toDate().toLocaleDateString(),
      };
    }
  });

  return { working, notWorking, lastReport };
}
