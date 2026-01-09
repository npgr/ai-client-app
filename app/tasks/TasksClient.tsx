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
  const [command, setCommand] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadIfEmpty() {
      if ((!initialTasks || initialTasks.length === 0) && mounted) {
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

    loadIfEmpty();

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

    const commandHandler = (e: any) => {
      if (e.action !== "update") return;
      const { command, page } = e.record?.command || {};
      setCommand(command || null);
      console.log("Command event:", e.record?.command);
    };

    pb.collection("tasks").subscribe("*", handler);
    pb.collection("command").subscribe("*", commandHandler);

    return () => {
      mounted = false;
      try {
        pb.collection("tasks").unsubscribe("*");
        pb.collection("command").unsubscribe("*");
      } catch (err) {
        // ignore
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div>Command: {command}</div>
      <br />
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
