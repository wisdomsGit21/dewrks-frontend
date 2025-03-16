import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { TasksApi } from "@/lib/api";
import { Task, TaskStatus } from "@/lib/types";
import { Loader2, LogOut, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import TaskItem from "./components/task-item";
import CreateTask from "./components/create-task";

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TaskStatus | "ALL">("ALL");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    fetchTasks();
  }, [activeTab]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      let fetchedTasks;
      if (activeTab === "ALL") {
        fetchedTasks = await TasksApi.getAll();
      } else {
        fetchedTasks = await TasksApi.getAll(activeTab);
      }
      setTasks(fetchedTasks);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      toast.error("Failed to load tasks", {
        description: "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (title: string, description?: string) => {
    try {
      const newTask = await TasksApi.create({ title, description });
      setTasks((prevTasks) => [newTask, ...prevTasks]);
      toast.success("Task created", {
        description: "Your task has been created successfully.",
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Failed to create task:", error);
      toast("Failed to create task", {
        description: "Please try again later.",
      });
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: TaskStatus) => {
    try {
      const updatedTask = await TasksApi.update(taskId, { status });
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? updatedTask : task))
      );
      toast.success("Task updated", {
        description: `Task status changed to ${status
          .toLowerCase()
          .replace("_", " ")}.`,
      });
    } catch (error) {
      console.error("Failed to update task:", error);
      toast.error("Failed to update task", {
        description: "Please try again later.",
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await TasksApi.delete(taskId);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      toast("Task deleted", {
        description: "Your task has been deleted successfully.",
      });
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast.error("Failed to delete task", {
        description: "Please try again later.",
      });
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  const filteredTasks =
    activeTab === "ALL"
      ? tasks
      : tasks.filter((task) => task.status === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="  md:px-12 px-4 flex h-16 items-center justify-between">
          <h1 className="lg:text-xl text-base font-bold">Dewrks Assesment</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm hidden lg:block  text-muted-foreground">
              Hello, <span>{user?.name}</span>
            </span>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="container px-4  lg:px-12 mx-auto py-6">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Your Tasks</h2>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>

        <Tabs
          defaultValue="ALL"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TaskStatus | "ALL")}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="ALL">All</TabsTrigger>
            <TabsTrigger value="PENDING">Pending</TabsTrigger>
            <TabsTrigger value="IN_PROGRESS">In Progress</TabsTrigger>
            <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredTasks.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <p className="text-muted-foreground">No tasks found</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create your first task
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <AnimatePresence>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <TaskItem
                        task={task}
                        onUpdateStatus={handleUpdateTaskStatus}
                        onDelete={handleDeleteTask}
                      />
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <CreateTask
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreateTask={handleCreateTask}
      />
    </div>
  );
}
