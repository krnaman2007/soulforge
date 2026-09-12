export const PROJECT_ACTIVE = "ACTIVE" as const;
export const PROJECT_COMPLETED = "COMPLETED" as const;
export const TASK_COMPLETED = "COMPLETED" as const;

export const isProjectActive = (status?: string | null) => status?.toUpperCase() === PROJECT_ACTIVE;
export const isProjectCompleted = (status?: string | null) => status?.toUpperCase() === PROJECT_COMPLETED;
export const isTaskCompleted = (status?: string | null) => status?.toUpperCase() === TASK_COMPLETED;

export const difficultyLabel = (difficulty?: string | number | null) => {
  if (typeof difficulty === "number") return difficulty >= 3 ? "Hard" : difficulty <= 1 ? "Easy" : "Medium";
  const value = String(difficulty || "MEDIUM").toUpperCase();
  return value === "EASY" ? "Easy" : value === "HARD" || value === "EPIC" ? "Hard" : "Medium";
};
