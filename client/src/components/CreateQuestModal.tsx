import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";
import { createQuest, fetchQuests } from "../store/slices/questSlice";
import { fetchCurrentUser } from "../store/slices/authSlice";

interface CreateQuestModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateQuestModal({ onClose, onSuccess }: CreateQuestModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("INTELLECT");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await dispatch(createQuest({ name, description, category, difficulty, type: "PROJECT" })).unwrap();
      await dispatch(fetchQuests({ limit: 50 })).unwrap();
      await dispatch(fetchCurrentUser()).unwrap();
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(10,10,15,0.9)] backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md p-6 md:p-8 bg-[rgba(20,20,30,0.9)] border border-[rgba(139,92,246,0.3)] shadow-[0_0_30px_rgba(139,92,246,0.1)]"
          style={{ clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6 border-b border-[rgba(255,255,255,0.05)] pb-4">
            <h2 className="text-xl md:text-2xl font-black uppercase text-white font-['Rajdhani'] flex items-center gap-2">
              <span className="text-[#8b5cf6]">✦</span> Create Campaign
            </h2>
            <button onClick={onClose} className="text-[rgba(255,255,255,0.3)] hover:text-white transition-colors text-xl">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-widest text-[#8b5cf6] mb-2 font-['Rajdhani']">Campaign Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="E.g. Learn React Native"
                className="w-full bg-[rgba(10,10,15,0.8)] border border-[rgba(255,255,255,0.1)] text-white px-4 py-3 outline-none focus:border-[#8b5cf6] transition-colors"
                style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)" }}
              />
            </div>
            
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-widest text-[#8b5cf6] mb-2 font-['Rajdhani']">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details of the campaign..."
                rows={2}
                className="w-full bg-[rgba(10,10,15,0.8)] border border-[rgba(255,255,255,0.1)] text-white px-4 py-3 outline-none focus:border-[#8b5cf6] transition-colors"
                style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)" }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-[#8b5cf6] mb-2 font-['Rajdhani']">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[rgba(10,10,15,0.8)] border border-[rgba(255,255,255,0.1)] text-white px-4 py-3 outline-none focus:border-[#8b5cf6] transition-colors appearance-none"
                  style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)" }}
                >
                  <option value="INTELLECT">Intellect</option>
                  <option value="PHYSICAL">Physical</option>
                  <option value="HEALTH">Health</option>
                  <option value="DISCIPLINE">Discipline</option>
                  <option value="CREATIVITY">Creativity</option>
                  <option value="SOCIAL">Social</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-[#8b5cf6] mb-2 font-['Rajdhani']">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-[rgba(10,10,15,0.8)] border border-[rgba(255,255,255,0.1)] text-white px-4 py-3 outline-none focus:border-[#8b5cf6] transition-colors appearance-none"
                  style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)" }}
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                  <option value="EPIC">Epic</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 text-xs font-black uppercase tracking-widest transition-all bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-white font-['Rajdhani'] border border-[rgba(255,255,255,0.1)]"
                style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="flex-1 py-3 text-xs font-black uppercase tracking-widest transition-all bg-[rgba(139,92,246,0.1)] hover:bg-[rgba(139,92,246,0.2)] text-[#c084fc] font-['Rajdhani'] border border-[#8b5cf6] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}
              >
                {loading ? 'Initializing...' : 'Initialize'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
