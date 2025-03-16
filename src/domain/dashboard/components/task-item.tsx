import { Task, TaskStatus } from "@/lib/types";
import {
  CheckCircle2,
  Clock,
  MoreVertical,
  PlayCircle,
  Trash2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { motion } from "motion/react";

interface TaskItemProps {
  task: Task;
  onUpdateStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

export default function TaskItem({
  task,
  onUpdateStatus,
  onDelete,
}: TaskItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      case "IN_PROGRESS":
        return <PlayCircle className="h-4 w-4" />;
      case "COMPLETED":
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
      case "IN_PROGRESS":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
      case "COMPLETED":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      default:
        return "";
    }
  };

  const handleUpdateStatus = async (status: TaskStatus) => {
    if (task.status === status) return;

    setIsUpdating(true);
    try {
      await onUpdateStatus(task.id, status);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    await onDelete(task.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="line-clamp-1 text-lg">{task.title}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  disabled={task.status === "PENDING" || isUpdating}
                  onClick={() => handleUpdateStatus("PENDING")}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Mark as Pending
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={task.status === "IN_PROGRESS" || isUpdating}
                  onClick={() => handleUpdateStatus("IN_PROGRESS")}
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Mark as In Progress
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={task.status === "COMPLETED" || isUpdating}
                  onClick={() => handleUpdateStatus("COMPLETED")}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark as Completed
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {task.description || "No description provided."}
          </p>
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-0">
          <Badge variant="outline" className={getStatusColor(task.status)}>
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1"
            >
              {getStatusIcon(task.status)}
              {task.status.replace("_", " ")}
            </motion.span>
          </Badge>
          <span className="text-xs text-muted-foreground">
            {format(new Date(task.createdAt), "MMM d, yyyy")}
          </span>
        </CardFooter>
      </Card>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
