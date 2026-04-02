import { useEffect, useState, useCallback, useMemo } from "react";
import { getTasksApi, createTaskApi, updateTaskApi, deleteTaskApi } from "../api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Loader2,
  LayoutList,
  ChevronRight,
  Calendar,
  Filter,
  ChevronLeft,
  Search,
  BarChart3,
  CheckCircle
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "DONE"; // Matches Backend Uppercase
  priority: "LOW" | "MEDIUM" | "HIGH";     // Matches Backend Uppercase
  due_date?: string;
}

export default function TaskList() {
  // Data States
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI States
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Pagination & Filter State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    search: ""
  });

  // Form State (Lower case for UI, converted to Upper on Submit)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    due_date: ""
  });

  const progressPercentage = useMemo(() => {
    if (totalCount === 0) return 0;
    return Math.round((completedCount / totalCount) * 100);
  }, [completedCount, totalCount]);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        // Convert filters to Upper for backend
        status: filters.status !== "all" ? filters.status.toUpperCase() : undefined,
        priority: filters.priority !== "all" ? filters.priority.toUpperCase() : undefined,
        search: filters.search.trim() || undefined
      };

      const data = await getTasksApi(params);
      setTasks(data.tasks || []);
      setTotalPages(Math.ceil((data.total || 0) / 10) || 1);
      setTotalCount(data.total || 0);
      setCompletedCount(data.completedCount || 0);
      setError(null);
    } catch (err) {
      setError("Failed to sync with server.");
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    setPage(1);
  }, [filters.status, filters.priority, filters.search]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // --- ACTION HANDLERS WITH TRANSFORMATIONS ---
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      const payload = {
        title: formData.title.trim(),
        // IMPORTANT: Backend wants Uppercase "LOW", "MEDIUM", "HIGH"
        priority: formData.priority.toUpperCase(),
        description: formData.description.trim() || undefined,
        // IMPORTANT: .datetime() requires ISO String
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : undefined,
      };

      await createTaskApi(payload);
      setFormData({ title: "", description: "", priority: "medium", due_date: "" });
      setIsDialogOpen(false);
      fetchTasks();
      setError(null);
    } catch (err: any) {
      console.error("Submission Error:", err);
      setError("Creation failed. Check if server is running.");
    }
  };

  const handleToggleStatus = async (task: Task) => {
    // IMPORTANT: Backend wants "DONE" or "TODO"
    const newStatus = task.status === "DONE" ? "TODO" : "DONE";
    try {
      await updateTaskApi(task.id, { status: newStatus });
      fetchTasks();
    } catch {
      setError("Status update failed.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTaskApi(id);
      fetchTasks();
    } catch {
      alert("Delete failed.");
    }
  };

  const getPriorityColor = (priority: string) => {
    const p = priority?.toLowerCase();
    switch (p) {
      case "high": return "text-red-400 bg-red-400/10 border-red-400/20";
      case "medium": return "text-amber-400 bg-amber-400/10 border-amber-400/20";
      default: return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-200 font-sans selection:bg-white/10">
      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* PROGRESS ANALYTICS */}
        <section className="mb-12 p-8 rounded-[2rem] bg-zinc-900/10 border border-zinc-800/40 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <CheckCircle className="h-24 w-24 text-emerald-500" />
          </div>
          <div className="relative z-10">
            <div className="flex items-end justify-between mb-6">
              <div className="space-y-1">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Global Progress</h2>
                <p className="text-4xl font-black text-white">{progressPercentage}%</p>
              </div>
              <Badge variant="outline" className="bg-emerald-500/5 text-emerald-400 border-emerald-500/20 px-4 py-1.5 rounded-full text-xs font-bold">
                {completedCount} / {totalCount} Completed
              </Badge>
            </div>
            <Progress value={progressPercentage} className="h-2.5 bg-zinc-800/50" />
          </div>
        </section>

        {/* HEADER & CREATE */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter text-white">Tasks</h1>
            <p className="text-zinc-500 text-sm">Real-time task synchronization.</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-zinc-100 text-zinc-950 hover:bg-white transition-all shadow-xl px-8 rounded-full h-11 font-bold">
                <Plus className="mr-2 h-4 w-4" /> New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-white">Create Task</DialogTitle>
                <DialogDescription className="text-zinc-500">
                  Assign a priority and deadline to your new task.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-6 mt-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-zinc-500">Title</label>
                  <Input
                    placeholder="Task summary..."
                    className="bg-zinc-900 border-zinc-800"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-zinc-500">Priority</label>
                    <Select
                      onValueChange={(v) => setFormData({...formData, priority: v})}
                      value={formData.priority}
                    >
                      <SelectTrigger className="bg-zinc-900 border-zinc-800">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-zinc-500">Deadline</label>
                    <Input
                      type="date"
                      className="bg-zinc-900 border-zinc-800 text-zinc-400"
                      value={formData.due_date}
                      onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-zinc-100 text-zinc-950 hover:bg-white h-12 font-bold uppercase tracking-widest text-[10px]">
                  Initialize Task
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        {/* SEARCH & FILTERS */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
            <Input
              placeholder="Search tasks..."
              className="bg-zinc-900/40 border-zinc-800 pl-10 h-10"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>
          <Select value={filters.status} onValueChange={(v) => setFilters({...filters, status: v})}>
            <SelectTrigger className="w-[140px] bg-zinc-900/40 border-zinc-800 h-10">
              <Filter className="h-3 w-3 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.priority} onValueChange={(v) => setFilters({...filters, priority: v})}>
            <SelectTrigger className="w-[140px] bg-zinc-900/40 border-zinc-800 h-10">
              <BarChart3 className="h-3 w-3 mr-2" />
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* TASK LIST */}
        <div className="space-y-3 min-h-[400px] relative">
          {loading && (
            <div className="absolute inset-0 bg-[#09090b]/40 z-10 flex items-center justify-center rounded-3xl backdrop-blur-[1px]">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
            </div>
          )}

          {tasks.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center py-32 border border-dashed border-zinc-800 rounded-[2rem] bg-zinc-900/5">
              <LayoutList className="h-12 w-12 text-zinc-800 mb-4" />
              <p className="text-zinc-600 text-sm">No tasks matching your search.</p>
            </div>
          ) : (
            tasks.map((task) => (
              <Card key={task.id} className="border-zinc-800/60 bg-zinc-900/20 hover:bg-zinc-900/40 transition-all group rounded-2xl">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <button onClick={() => handleToggleStatus(task)} className="focus:outline-none active:scale-90 transition-transform">
                      {task.status === "DONE" ? (
                        <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                      ) : (
                        <Circle className="h-6 w-6 text-zinc-700 group-hover:text-zinc-500" />
                      )}
                    </button>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-semibold tracking-tight ${task.status === "DONE" ? "text-zinc-600 line-through" : "text-zinc-100"}`}>
                          {task.title}
                        </span>
                        <Badge variant="outline" className={`text-[8px] uppercase px-2 py-0.5 border-0 font-black tracking-widest ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </Badge>
                      </div>
                      {task.due_date && (
                        <span className="text-[10px] text-zinc-600 mt-1 flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" /> Due {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                    <Button
                      variant="ghost" size="icon"
                      className="h-9 w-9 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-full"
                      onClick={() => handleDelete(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <ChevronRight className="h-4 w-4 text-zinc-800" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* PAGINATION */}
        <div className="mt-12 pt-8 border-t border-zinc-800/60 flex items-center justify-between">
          <div className="flex flex-col">
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-600">Page Index</p>
            <p className="text-sm font-medium text-zinc-400">{page} of {totalPages}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline" size="sm"
              className="bg-transparent border-zinc-800 text-zinc-400 h-10 px-4 rounded-xl"
              disabled={page === 1 || loading}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-2" /> Previous
            </Button>
            <Button
              variant="outline" size="sm"
              className="bg-transparent border-zinc-800 text-zinc-400 h-10 px-4 rounded-xl"
              disabled={page >= totalPages || loading}
              onClick={() => setPage(p => p + 1)}
            >
              Next <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
