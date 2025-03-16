export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  userId: string;
  createdAt: string;
}

export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export type CreateTaskPayload = {
  title: string;
  description?: string;
};

export type UpdateTaskPayload = {
  title?: string;
  description?: string;
  status?: TaskStatus;
};

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}
