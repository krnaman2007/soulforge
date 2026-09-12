import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import { fetchTasks, completeTask, deleteTask } from "../store/slices/taskSlice";
import { fetchQuests, fetchQuestById, deleteQuest } from "../store/slices/questSlice";
import { fetchCurrentUser } from "../store/slices/authSlice";
import GlassCard from "../components/GlassCard";
import TaskCard from "../components/TaskCard";
import { ProjectDetail } from "./Projects";
import { isProjectActive, isTaskCompleted } from "../utils/status";
import CreateTaskModal from "../components/CreateTaskModal";
import CreateQuestModal from "../components/CreateQuestModal";

type Tab = "daily" | "projects" | "ai";



const TABS: { id: Tab; label: string }[] = [
  { id: "daily", label: "Daily" },
  { id: "projects", label: "Projects" },
  { id: "ai", label: "AI-Suggested" },
];

function ProjectRowCard({ project, index, onDelete, onOpen }: { project: any; index: number; onDelete: (id: string, type: string) => void; onOpen: (project: any) => void; }) {
  const totalTasks = Number(project.totalTasks ?? project.tasks?.length ?? 0);
  const completedTasks = isProjectActive(project.status) ? Number(project.completedTasks ?? project.tasks?.filter((t: any) => isTaskCompleted(t.status)).length ?? 0) : totalTasks;
  const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const color = project.color || "#00f0ff";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 200, damping: 20 }}
      className="group relative"
    >
      <div
        onClick={() => onOpen(project)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onOpen(project); }}
        className="p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-5 transition-all duration-300 relative overflow-hidden group/card bg-[rgba(15,15,22,0.7)] hover:bg-[rgba(20,20,30,0.8)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.15)]"
        style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))" }}
      >
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(project.id, 'projects'); }}
          className="absolute top-2 right-2 opacity-0 group-hover/card:opacity-100 transition-opacity text-[rgba(255,255,255,0.3)] hover:text-[#ef4444] z-20"
          title="Delete Campaign"
        >
          ✕
        </button>

        <div className="absolute top-0 left-0 w-1.5 h-full transition-colors duration-300 opacity-50 group-hover:opacity-100" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />

        <div className="w-12 h-12 hex-clip flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: `${color}20`, border: `1px solid ${color}40`, boxShadow: `inset 0 0 10px ${color}20` }}>
          <span style={{ filter: `drop-shadow(0 0 5px ${color})` }}>{project.icon || '🚀'}</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-base md:text-lg font-black tracking-wider uppercase text-white group-hover:text-[#00f0ff] transition-colors" style={{ fontFamily: "Rajdhani, sans-serif" }}>
            {project.title || project.name}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[rgba(232,232,240,0.5)]">
              {completedTasks} / {totalTasks} Tasks
            </span>
            <div className="flex-1 h-1.5 rounded-full bg-[rgba(255,255,255,0.05)] overflow-hidden">
               <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}80` }} />
            </div>
            <span className="text-[10px] font-black uppercase" style={{ color: color, fontFamily: "Rajdhani, sans-serif" }}>{pct}%</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1" style={{ color: "#00f0ff", fontFamily: "Rajdhani, sans-serif" }}>
             <span className="text-xs">✦</span> +{project.xpBonus !== undefined ? project.xpBonus : (project.bonusXP || 0)} XP
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1" style={{ color: "#00f0ff", fontFamily: "Rajdhani, sans-serif" }}>
             <span className="text-xs">◈</span> {project.coins !== undefined ? project.coins : (project.bonusCoins || 0)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function QuestLog() {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks } = useSelector((state: RootState) => state.tasks);
  const { quests: allQuests } = useSelector((state: RootState) => state.quests);
  const activeQuests = allQuests.filter((q) => isProjectActive(q.status));
  const dailyTasks = tasks.filter((task) => !task.projectId && !isTaskCompleted(task.status));
  const aiProjects = activeQuests.filter((q) => q.tasks?.some((task: any) => task.aiAnalyzed));

  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchQuests());
  }, [dispatch]);

  const [tab, setTab] = useState<Tab>("daily");
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showCreateQuest, setShowCreateQuest] = useState(false);

  const handleCompleteTask = async (id: string) => {
    await dispatch(completeTask(id)).unwrap();
    await dispatch(fetchTasks()).unwrap();
    await dispatch(fetchQuests({ limit: 50 })).unwrap();
    await dispatch(fetchCurrentUser()).unwrap();
  };

  const handleDelete = async (id: string, type: string) => {
    if (type === 'daily') await dispatch(deleteTask(id)).unwrap();
    else if (type === 'projects') {
      await dispatch(deleteQuest(id)).unwrap();
      if (selectedProject?.id === id) setSelectedProject(null);
    }
  };

  const handleOpenProject = async (project: any) => {
    const fullProject = await dispatch(fetchQuestById(project.id)).unwrap();
    setSelectedProject(fullProject);
  };

  const handleProjectCompleteTask = async (id: string) => {
    await dispatch(completeTask(id)).unwrap();
    await dispatch(fetchTasks()).unwrap();
    await dispatch(fetchQuests({ limit: 50 })).unwrap();
    if (selectedProject?.id) {
      const refreshed = await dispatch(fetchQuestById(selectedProject.id)).unwrap();
      setSelectedProject(refreshed);
    }
    await dispatch(fetchCurrentUser()).unwrap();
  };

  const handleProjectDelete = async (id: string) => {
    await dispatch(deleteQuest(id)).unwrap();
    setSelectedProject(null);
    await dispatch(fetchQuests({ limit: 50 })).unwrap();
  };

  const handleProjectDeleteTask = async (id: string) => {
    await dispatch(deleteTask(id)).unwrap();
    if (selectedProject?.id) {
      const refreshed = await dispatch(fetchQuestById(selectedProject.id)).unwrap();
      setSelectedProject(refreshed);
    }
    await dispatch(fetchQuests({ limit: 50 })).unwrap();
  };

  const getTabData = () => {
    if (tab === 'daily') return dailyTasks;
    if (tab === 'projects') return activeQuests;
    return aiProjects;
  };

  if (selectedProject) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto min-h-screen bg-transparent">
        <ProjectDetail
          project={selectedProject}
          onBack={() => setSelectedProject(null)}
          onCompleteTask={handleProjectCompleteTask}
          onDelete={handleProjectDelete}
          onDeleteTask={handleProjectDeleteTask}
        />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto min-h-screen bg-transparent">
      <div className="mb-8 border-b border-[rgba(255,255,255,0.05)] pb-6 relative">
         <div className="absolute top-0 right-0 w-32 h-32 bg-[#00f0ff] opacity-[0.03] blur-3xl rounded-full pointer-events-none" />
         <div className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#00f0ff] mb-2 font-['Rajdhani']">
            Mission Control
         </div>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-white mb-2" style={{ fontFamily: "Rajdhani, sans-serif" }}>Quest Log</h1>
        <p className="text-[10px] md:text-xs uppercase tracking-[0.1em] text-[rgba(232,232,240,0.5)] font-['Inter']">Active missions and objectives. Execute to acquire resources.</p>
        
        {/* Creation Buttons */}
        <div className="absolute top-0 right-0 mt-4 md:mt-0 flex gap-2">
          {tab === "daily" && (
            <button onClick={() => setShowCreateTask(true)} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all bg-[rgba(0,240,255,0.1)] hover:bg-[rgba(0,240,255,0.2)] text-[#00f0ff] font-['Rajdhani'] border border-[#00f0ff]" style={{ clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))" }}>
              + Initialize Task
            </button>
          )}
          {tab === "projects" && (
            <button onClick={() => setShowCreateQuest(true)} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all bg-[rgba(139,92,246,0.1)] hover:bg-[rgba(139,92,246,0.2)] text-[#c084fc] font-['Rajdhani'] border border-[#8b5cf6]" style={{ clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))" }}>
              + Initialize Campaign
            </button>
          )}
        </div>
      </div>

      {/* Tabs — glowing underline on active */}
      <div className="flex gap-2 mb-8" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="relative px-6 py-3 text-xs md:text-sm font-black uppercase tracking-widest transition-all"
            style={{
              color: tab === t.id ? "#00f0ff" : "rgba(232,232,240,0.4)",
              fontFamily: "Rajdhani, sans-serif",
            }}
          >
            {t.label}
            {t.id === "ai" && (
              <span className="ml-2 text-[9px] px-2 py-0.5"
                style={{ background: "rgba(139,92,246,0.15)", color: "#c084fc", border: "1px solid rgba(139,92,246,0.3)", clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))" }}>
                AI
              </span>
            )}
            {/* Glowing underline */}
            {tab === t.id && (
              <motion.div
                layoutId="questTabLine"
                className="absolute bottom-[-1px] left-0 right-0 h-0.5"
                style={{ background: "#00f0ff", boxShadow: "0 0 10px #00f0ff, 0 0 20px #00f0ff" }}
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {tab === "ai" && (
            <div className="p-4 flex items-start gap-3 bg-[rgba(139,92,246,0.05)] border border-[rgba(139,92,246,0.2)] mb-6"
              style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}>
              <span className="text-[#c084fc] text-lg mt-0.5 animate-pulse drop-shadow-[0_0_8px_#c084fc]">✦</span>
              <div>
                 <p className="text-xs font-black uppercase tracking-widest text-[#c084fc] font-['Rajdhani'] mb-1">Algorithmic Suggestions</p>
                 <p className="text-[10px] font-['Inter'] uppercase tracking-wider leading-relaxed" style={{ color: "rgba(232,232,240,0.6)" }}>
                   Missions generated by Soulforge AI based on current attributes and progression velocity. Rewards pre-calculated.
                 </p>
              </div>
            </div>
          )}
          {getTabData().length === 0 ? (
             <div className="py-12 text-center text-[rgba(232,232,240,0.5)] italic text-sm border border-[rgba(255,255,255,0.05)] bg-[rgba(15,15,22,0.6)]" style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}>
               No objectives found for this section.
             </div>
          ) : (
             getTabData().map((item: any, i: number) => {
               if (tab === 'projects' || tab === 'ai') {
                 return <ProjectRowCard key={item.id || i} project={item} index={i} onDelete={handleDelete} onOpen={handleOpenProject} />;
               }
               return <TaskCard key={item.id || i} task={item} index={i} onComplete={handleCompleteTask} onDelete={(id) => handleDelete(id, tab)} />;
             })
          )}
        </motion.div>
      </AnimatePresence>

      {showCreateTask && <CreateTaskModal onClose={() => setShowCreateTask(false)} />}
      {showCreateQuest && <CreateQuestModal onClose={() => setShowCreateQuest(false)} />}
    </div>
  );
}
