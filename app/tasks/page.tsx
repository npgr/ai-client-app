import React from "react";
import { getTasks } from "../../lib/pocketbase";
import TasksClient from "./TasksClient";

export default async function TasksPage() {
  const initialTasks = await getTasks();

  return (
    <div className="min-h-screen p-8">
      <main className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold mb-6">Tasks</h1>
        {/* Passing server-fetched data to the client component */}
        {/* @ts-expect-error Server -> Client prop */}
        <TasksClient initialTasks={initialTasks} />
      </main>
    </div>
  );
}