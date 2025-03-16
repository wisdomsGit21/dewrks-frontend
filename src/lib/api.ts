import axios from "axios";
import {
  CreateTaskPayload,
  Task,
  TaskStatus,
  UpdateTaskPayload,
} from "./types";

const BaseURL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: BaseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const TasksApi = {
  getAll: async (status?: TaskStatus) => {
    const params = status ? { status } : {};
    const response = await api.get<Task[]>("/tasks", { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  create: async (payload: CreateTaskPayload) => {
    const response = await api.post<Task>("/tasks", payload);
    return response.data;
  },

  update: async (id: string, payload: UpdateTaskPayload) => {
    const response = await api.patch<Task>(`/tasks/${id}`, payload);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<{ message: string }>(`/tasks/${id}`);
    return response.data;
  },
};
