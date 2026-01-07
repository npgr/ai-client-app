import PocketBase from "pocketbase";

const PB_URL = process.env.NEXT_PUBLIC_PB_URL || "http://127.0.0.1:8090";

export const pb = new PocketBase(PB_URL);

export async function getTasks() {
  const records = await pb.collection("tasks").getFullList({ sort: "-created" });
  return records.map((r: any) => ({
    id: r.id,
    task: r.task,
    startDate: r.startDate,
    endDate: r.endDate,
    completed: r.completed,
  }));
}