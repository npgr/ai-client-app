"use client";

import React, { useEffect, useState } from "react";
import PocketBase from "pocketbase";

export interface Task {
  id?: number | string;
  task: string;
  startDate: string;
  endDate: string;
  completed: boolean;
}

const PB_URL = process.env.NEXT_PUBLIC_PB_URL || "http://127.0.0.1:8090";
const pb = new PocketBase(PB_URL);

export default function TasksClient({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks || []);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!initialTasks || initialTasks.length === 0) {
        try {
          const recs = await pb.collection("tasks").getFullList();
          if (!mounted) return;
          setTasks(
            recs.map((r: any) => ({
              id: r.id,
              task: r.task,
              startDate: r.startDate,
              endDate: r.endDate,
              completed: r.completed,
            }))
          );
        } catch (err) {
          console.error("Failed to load tasks:", err);
        }
      }
    }

    load();

    const handler = (e: any) => {
      const rec = {
        id: e.record?.id,
        task: e.record?.task,
        startDate: e.record?.startDate,
        endDate: e.record?.endDate,
        completed: e.record?.completed,
      };
      setTasks((prev) => {
        if (e.action === "create") {
          return [rec, ...prev];
        }
        if (e.action === "update") {
          return prev.map((t) => (String(t.id) === String(rec.id) ? rec : t));
        }
        if (e.action === "delete") {
          return prev.filter((t) => String(t.id) !== String(rec.id));
        }
        return prev;
      });
    };

    const sub = pb.collection("tasks").subscribe("*", handler);

    return () => {
      mounted = false;
      try {
        pb.collection("tasks").unsubscribe("*");
      } catch (err) {
        // ignore
      }
      if (sub && typeof sub === "object" && typeof sub.unsubscribe === "function") {
        try {
          sub.unsubscribe();
        } catch {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      {tasks.length === 0 ? (
        <p>No tasks found.</p>
      ) : (
        <ul className="space-y-3">
          {tasks.map((t) => (
            <li key={String(t.id)} className="rounded-md border p-3">
              <div className="flex justify-between">
                <strong>{t.task}</strong>
                <span>{t.completed ? "✅" : "⬜"}</span>
              </div>
              <div className="text-sm text-zinc-600">
                <div>Start: {t.startDate}</div>
                <div>End: {t.endDate}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
