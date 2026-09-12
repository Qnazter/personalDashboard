export type Todo = {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
};

export type ProjectStatus = "planning" | "in-progress" | "blocked" | "done";

export type Project = {
  id: string;
  name: string;
  url?: string;
  status: ProjectStatus;
  notes?: string;
  createdAt: number;
};
