import type { LessonStep } from './course';

export interface LearningProgress {
  xp: number;
  streak: number;
  lastStudyDay: string | null;
  completedSteps: Record<string, string[]>;
  completedLessons: string[];
}

export interface AwardResult {
  progress: LearningProgress;
  awarded: number;
  firstCompletion: boolean;
  streakAdvanced: boolean;
}

const STORAGE_KEY = 'levelup-learning-progress-v2';

export const emptyProgress: LearningProgress = {
  xp: 0,
  streak: 0,
  lastStudyDay: null,
  completedSteps: {},
  completedLessons: [],
};

const dayKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const previousDayKey = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return dayKey(date);
};

export function loadProgress(): LearningProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress;
    const parsed = JSON.parse(raw) as Partial<LearningProgress>;
    return {
      xp: Number.isFinite(parsed.xp) ? Number(parsed.xp) : 0,
      streak: Number.isFinite(parsed.streak) ? Number(parsed.streak) : 0,
      lastStudyDay: typeof parsed.lastStudyDay === 'string' ? parsed.lastStudyDay : null,
      completedSteps: parsed.completedSteps && typeof parsed.completedSteps === 'object' ? parsed.completedSteps : {},
      completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons : [],
    };
  } catch {
    return emptyProgress;
  }
}

export function saveProgress(progress: LearningProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function stepXp(step: LessonStep, isLastStep = false): number {
  if (step.activity === 'mastery' && isLastStep) return 160;
  if (step.activity === 'mastery') return 35;
  if (step.activity === 'code') return 50;
  if (step.kind === 'practice') return 30;
  if (step.kind === 'observe') return 24;
  if (step.kind === 'learn') return 22;
  if (step.kind === 'reflect') return 40;
  return 18;
}

export function awardStep(progress: LearningProgress, lessonId: string, step: LessonStep, isLastStep: boolean): AwardResult {
  const completedForLesson = progress.completedSteps[lessonId] ?? [];
  if (completedForLesson.includes(step.id)) {
    return { progress, awarded: 0, firstCompletion: false, streakAdvanced: false };
  }

  const today = dayKey();
  const streakAdvanced = progress.lastStudyDay !== today;
  const nextStreak = !streakAdvanced
    ? progress.streak
    : progress.lastStudyDay === previousDayKey()
      ? progress.streak + 1
      : 1;
  const awarded = stepXp(step, isLastStep);
  const completedLessons = isLastStep && !progress.completedLessons.includes(lessonId)
    ? [...progress.completedLessons, lessonId]
    : progress.completedLessons;

  const next: LearningProgress = {
    xp: progress.xp + awarded,
    streak: nextStreak,
    lastStudyDay: today,
    completedSteps: {
      ...progress.completedSteps,
      [lessonId]: [...completedForLesson, step.id],
    },
    completedLessons,
  };
  saveProgress(next);
  return { progress: next, awarded, firstCompletion: true, streakAdvanced };
}

export function courseCompletion(progress: LearningProgress, lessonCount: number) {
  return Math.round((progress.completedLessons.length / lessonCount) * 100);
}
