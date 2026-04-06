"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { SparklesIcon, SendIcon, XIcon, PaperclipIcon, CheckIcon, RotateCcwIcon } from "lucide-react";
import dayjs from "dayjs";
import { clarifyWorkoutPlan } from "@/services/aiPlanner/clarifyWorkoutPlan";
import { deletePlannerSession } from "@/services/aiPlanner/deletePlannerSession";
import { generateWorkoutPlan } from "@/services/aiPlanner/generateWorkoutPlan";
import { previewWorkoutPlan } from "@/services/aiPlanner/previewWorkoutPlan";
import { getLatestPlannerSession } from "@/services/aiPlanner/getLatestPlannerSession";
import { getCreditPricing } from "@/services/coaches/getCreditPricing";
import { PurchaseCreditsDialog } from "@/dialogs/PurchaseCreditsDialog/PurchaseCreditsDialog";
import { WorkoutPlanPreview } from "./WorkoutPlanPreview";
import type {
  PlannerConversationMessage,
  PlannerFileContent,
  ClarifyWorkoutPlanSuggestedParams,
  GenerateWorkoutPlanResponse,
  PreviewWorkoutPlanWorkout,
} from "@/services/aiPlanner/types";

type Props = {
  traineeId: string;
  onGenerated: () => Promise<unknown>;
  initialState?: {
    sessionId?: string | null;
    description?: string;
    messages?: Message[];
    attachedFiles?: PlannerFileContent[];
    suggestedParams?: ClarifyWorkoutPlanSuggestedParams | null;
    isReadyToGenerate?: boolean;
    generationResult?: GenerationResult | null;
  };
};

type Message = {
  role: "user" | "assistant";
  content: string;
  options?: string[];
};

type GenerationResult = GenerateWorkoutPlanResponse & { generatedAt: string };

const ACCEPTED_EXTENSIONS = ".json,.txt,.csv,.xlsx,.jpg,.jpeg,.png,.webp";
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

async function parseFileToContent(file: File): Promise<PlannerFileContent> {
  if (IMAGE_TYPES.includes(file.type)) {
    return {
      name: file.name,
      type: "image",
      content: `[Image file: ${file.name} — upload to storage for AI vision analysis]`,
    };
  }

  if (
    file.name.endsWith(".xlsx") ||
    file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    const { read, utils } = await import("xlsx");
    const buffer = await file.arrayBuffer();
    const workbook = read(buffer);
    const sheets = workbook.SheetNames.map((name) => {
      const sheet = workbook.Sheets[name];
      const json = utils.sheet_to_json(sheet);
      return `Sheet: ${name}\n${JSON.stringify(json, null, 2)}`;
    });
    return { name: file.name, type: "excel", content: sheets.join("\n\n") };
  }

  const text = await file.text();
  return { name: file.name, type: file.type || "text", content: text };
}

export function AIPlannerPanel({ traineeId, onGenerated, initialState }: Props) {
  const [sessionId, setSessionId] = useState<string | null>(initialState?.sessionId ?? null);
  const [description, setDescription] = useState(initialState?.description ?? "");
  const [messages, setMessages] = useState<Message[]>(initialState?.messages ?? []);
  const [attachedFiles, setAttachedFiles] = useState<PlannerFileContent[]>(initialState?.attachedFiles ?? []);
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(!initialState);
  const [suggestedParams, setSuggestedParams] = useState<ClarifyWorkoutPlanSuggestedParams | null>(
    initialState?.suggestedParams ?? null,
  );
  const [isReadyToGenerate, setIsReadyToGenerate] = useState(initialState?.isReadyToGenerate ?? false);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(initialState?.generationResult ?? null);
  const [previewData, setPreviewData] = useState<PreviewWorkoutPlanWorkout[] | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [insufficientCredits, setInsufficientCredits] = useState(false);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [isClearingSession, setIsClearingSession] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: pricing } = useQuery({
    queryKey: ["coach-credit-pricing"],
    queryFn: getCreditPricing,
  });
  const generateCost = pricing?.find((p) => p.action === "GenerateWorkoutPlan")?.creditCost ?? null;
  const hasStarted = messages.length > 0 || isLoading;
  const hasSessionDraft = hasStarted || attachedFiles.length > 0 || !!description.trim() || !!generationResult;

  useEffect(() => {
    if (initialState) {
      setIsBootstrapping(false);
      return;
    }

    let cancelled = false;

    async function clearPersistedSession() {
      try {
        const session = await getLatestPlannerSession({ traineeId });
        if (cancelled || !session) {
          return;
        }

        await deletePlannerSession({ traineeId, sessionId: session.sessionId });
      } catch {
        // stale session cleanup is best-effort
      } finally {
        if (!cancelled) {
          handleReset();
          setIsBootstrapping(false);
        }
      }
    }

    void clearPersistedSession();
    return () => {
      cancelled = true;
    };
  }, [initialState, traineeId]);

  function scrollToBottom() {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }

  function buildConversationHistory(): PlannerConversationMessage[] {
    return messages.map((m) => ({ role: m.role, content: m.content }));
  }

  async function handleSendInitial() {
    if (!description.trim()) return;

    const userMessage: Message = { role: "user", content: description.trim() };
    const newMessages = [userMessage];
    setMessages(newMessages);
    setIsLoading(true);
    scrollToBottom();

    try {
      const response = await clarifyWorkoutPlan({
        traineeId,
        sessionId,
        description: description.trim(),
        filesContent: attachedFiles,
        conversationHistory: [],
      });

      setSessionId(response.sessionId);

      const aiMessage: Message = {
        role: "assistant",
        content: response.message,
        options: response.options?.length ? response.options : undefined,
      };
      setMessages([...newMessages, aiMessage]);

      if (response.isReadyToGenerate && response.suggestedParams) {
        setIsReadyToGenerate(true);
        setSuggestedParams(response.suggestedParams);
      }
      if (response.workoutsChanged) {
        await onGenerated();
      }
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Something went wrong. Please try again." }]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  }

  async function handleOptionSelect(option: string) {
    await handleSendFollowUpWithText(option);
  }

  async function handleSendFollowUp() {
    if (!userInput.trim()) return;
    await handleSendFollowUpWithText(userInput.trim());
    setUserInput("");
  }

  async function handleSendFollowUpWithText(text: string) {
    if (!text.trim()) return;

    const userMessage: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);
    scrollToBottom();

    try {
      const response = await clarifyWorkoutPlan({
        traineeId,
        sessionId,
        description,
        filesContent: attachedFiles,
        conversationHistory: newMessages.map((m) => ({ role: m.role, content: m.content })),
      });

      setSessionId(response.sessionId);

      const aiMessage: Message = {
        role: "assistant",
        content: response.message,
        options: response.options?.length ? response.options : undefined,
      };
      setMessages([...newMessages, aiMessage]);

      if (response.isReadyToGenerate && response.suggestedParams) {
        setIsReadyToGenerate(true);
        setSuggestedParams(response.suggestedParams);
      }
      if (response.workoutsChanged) {
        await onGenerated();
      }
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Something went wrong. Please try again." }]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  }

  async function handlePreview() {
    if (!suggestedParams) return;

    setIsPreviewLoading(true);
    scrollToBottom();

    try {
      const result = await previewWorkoutPlan({
        traineeId,
        description,
        filesContent: attachedFiles,
        conversationHistory: buildConversationHistory(),
        params: suggestedParams,
      });
      setPreviewData(result.workouts);
    } catch {
      setMessages((current) => [
        ...current,
        { role: "assistant", content: "Preview failed. Please try again." },
      ]);
    } finally {
      setIsPreviewLoading(false);
    }
  }

  async function handleGenerate() {
    if (!suggestedParams) return;

    setIsLoading(true);
    setInsufficientCredits(false);

    try {
      const result = await generateWorkoutPlan({
        traineeId,
        sessionId,
        description,
        filesContent: attachedFiles,
        conversationHistory: buildConversationHistory(),
        params: suggestedParams,
      });

      setGenerationResult({ ...result, generatedAt: new Date().toISOString() });
      await onGenerated();
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 422) {
        setInsufficientCredits(true);
        setPurchaseDialogOpen(true);
      } else {
        setMessages([...messages, { role: "assistant", content: "Generation failed. Please try again." }]);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRefine(feedback: string) {
    setPreviewData(null);
    setIsReadyToGenerate(false);
    setSuggestedParams(null);
    await handleSendFollowUpWithText(feedback);
  }

  function handleReset() {
    setSessionId(null);
    setDescription("");
    setMessages([]);
    setAttachedFiles([]);
    setUserInput("");
    setSuggestedParams(null);
    setIsReadyToGenerate(false);
    setGenerationResult(null);
    setPreviewData(null);
  }

  async function handleClearSession() {
    if (isLoading || isClearingSession) {
      return;
    }

    setIsClearingSession(true);
    try {
      if (sessionId) {
        await deletePlannerSession({ traineeId, sessionId });
      }
      handleReset();
    } catch {
      setMessages((current) => [
        ...current,
        { role: "assistant", content: "Couldn't clear this session right now. Please try again." },
      ]);
    } finally {
      setIsClearingSession(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const parsed = await Promise.all(files.map(parseFileToContent));
    setAttachedFiles((prev) => [...prev, ...parsed]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile(index: number) {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  if (isBootstrapping) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="flex gap-1">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--shell-muted)] [animation-delay:0ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--shell-muted)] [animation-delay:150ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--shell-muted)] [animation-delay:300ms]" />
        </span>
      </div>
    );
  }

  if (previewData !== null) {
    return (
      <WorkoutPlanPreview
        workouts={previewData}
        generateCost={generateCost}
        isLoading={isLoading}
        onGenerate={() => void handleGenerate()}
        onRefine={(feedback) => void handleRefine(feedback)}
      />
    );
  }

  if (generationResult) {
    return (
      <div className="flex h-full flex-col p-4">
        <div className="flex items-start gap-3 rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] p-4">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-none border border-[var(--shell-border)] bg-[var(--shell-accent)]">
            <CheckIcon className="h-3.5 w-3.5 text-[var(--shell-accent-ink)]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[var(--shell-ink)]">Program generated</p>
            <p className="mt-1 text-sm text-[var(--shell-muted)]">{generationResult.summary}</p>
            <p className="mt-1 text-xs text-[var(--shell-muted)]">
              {dayjs(generationResult.dateFrom).format("MMM D")}
              {" — "}
              {dayjs(generationResult.dateTo).format("MMM D, YYYY")}
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs text-[var(--shell-muted)]">
          Workouts were added as drafts. Review them in the{" "}
          <span className="font-semibold text-[var(--shell-ink)]">Changes</span> tab, then publish when ready.
        </p>
        <button
          type="button"
          disabled={isClearingSession}
          className="mt-4 inline-flex items-center gap-1.5 rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-muted)] transition hover:bg-[var(--shell-surface)] hover:text-[var(--shell-ink)]"
          onClick={() => void handleClearSession()}
        >
          <RotateCcwIcon className="h-3 w-3" />
          Clear session
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="border-b border-[var(--shell-border)] px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-3.5 w-3.5 text-[var(--shell-muted)]" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--shell-muted)]">
              AI Planner
            </p>
          </div>
          {hasSessionDraft && (
            <button
              type="button"
              disabled={isLoading || isClearingSession}
              className="inline-flex items-center gap-1 rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-muted)] transition hover:bg-[var(--shell-surface)] hover:text-[var(--shell-ink)] disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => void handleClearSession()}
            >
              <RotateCcwIcon className="h-3 w-3" />
              Clear session
            </button>
          )}
        </div>
        {!hasStarted && (
          <p className="mt-1 text-sm text-[var(--shell-muted)]">
            Describe the program you want to create. Upload files or images for additional context.
          </p>
        )}
      </div>

      {/* Chat area */}
      {hasStarted && (
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          <div className="flex flex-col gap-3">
            {messages.map((message, index) => {
              const isLastAi =
                message.role === "assistant" &&
                index === messages.findLastIndex((m) => m.role === "assistant");
              const showOptions =
                isLastAi && message.options?.length && !isLoading && !isReadyToGenerate;

              return (
                <div key={index} className="flex flex-col gap-1.5">
                  <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-none border px-3 py-2 text-sm leading-relaxed ${
                        message.role === "user"
                          ? "border-transparent bg-[var(--shell-accent)] text-[var(--shell-accent-ink)]"
                          : "border-[var(--shell-border)] bg-[var(--shell-surface-strong)] text-[var(--shell-ink)]"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                  {showOptions && (
                    <div className="flex flex-wrap gap-1.5 pl-1">
                      {message.options!.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => void handleOptionSelect(option)}
                          className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] px-2.5 py-1 text-xs font-medium text-[var(--shell-ink)] transition hover:border-[var(--shell-ink)] hover:bg-[var(--shell-surface-strong)]"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 py-2">
                  <span className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--shell-muted)] [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--shell-muted)] [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--shell-muted)] [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            )}
            {isReadyToGenerate && suggestedParams && !isLoading && (
              <ConfirmCard
                params={suggestedParams}
                isPreviewLoading={isPreviewLoading}
                onPreview={() => void handlePreview()}
                onEdit={() => {
                  setIsReadyToGenerate(false);
                  setSuggestedParams(null);
                  setInsufficientCredits(false);
                }}
              />
            )}
            {insufficientCredits && (
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-[var(--shell-muted)]">Not enough credits.</p>
                <button
                  type="button"
                  onClick={() => setPurchaseDialogOpen(true)}
                  className="shrink-0 text-xs font-semibold text-[var(--shell-accent)] underline-offset-2 hover:underline"
                >
                  Buy credits
                </button>
              </div>
            )}
          </div>
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input area */}
      {!hasStarted ? (
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <textarea
            className="w-full resize-none rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 py-2.5 text-sm text-[var(--shell-ink)] placeholder:text-[var(--shell-muted)] focus:border-[var(--shell-ink)] focus:outline-none"
            rows={4}
            placeholder="e.g. 12-week strength block for a powerlifter, 3 days/week with progressive overload on squat, bench, and deadlift…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                void handleSendInitial();
              }
            }}
          />

          {/* File chips */}
          {attachedFiles.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {attachedFiles.map((file, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] px-2 py-0.5 text-[10px] text-[var(--shell-muted)]"
                >
                  {file.name}
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="ml-0.5 hover:text-[var(--shell-ink)]"
                  >
                    <XIcon className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={ACCEPTED_EXTENSIONS}
              multiple
              onChange={handleFileChange}
            />
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-muted)] transition hover:bg-[var(--shell-surface)] hover:text-[var(--shell-ink)]"
              onClick={() => fileInputRef.current?.click()}
            >
              <PaperclipIcon className="h-3 w-3" />
              Attach
            </button>
            <button
              type="button"
              disabled={!description.trim() || isLoading}
              className="ml-auto inline-flex items-center gap-1.5 rounded-none border border-transparent bg-[var(--shell-accent)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-accent-ink)] transition hover:bg-[var(--shell-accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => void handleSendInitial()}
            >
              <SendIcon className="h-3 w-3" />
              Start
            </button>
          </div>
        </div>
      ) : !isReadyToGenerate ? (
        <div className="border-t border-[var(--shell-border)] px-4 py-3">
          {attachedFiles.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {attachedFiles.map((file, i) => (
                <span
                  key={`${file.name}-${i}`}
                  className="inline-flex items-center gap-1 rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] px-2 py-0.5 text-[10px] text-[var(--shell-muted)]"
                >
                  {file.name}
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="ml-0.5 hover:text-[var(--shell-ink)]"
                    aria-label={`Remove attachment ${file.name}`}
                  >
                    <XIcon className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="mb-2 flex items-center justify-between gap-2">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={ACCEPTED_EXTENSIONS}
              multiple
              onChange={handleFileChange}
            />
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-muted)] transition hover:bg-[var(--shell-surface)] hover:text-[var(--shell-ink)]"
              onClick={() => fileInputRef.current?.click()}
            >
              <PaperclipIcon className="h-3 w-3" />
              Attach
            </button>
          </div>
          <div className="flex items-end gap-2">
            <textarea
              className="min-h-[36px] flex-1 resize-none rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 py-2 text-sm text-[var(--shell-ink)] placeholder:text-[var(--shell-muted)] focus:border-[var(--shell-ink)] focus:outline-none"
              rows={2}
              placeholder="Reply…"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  void handleSendFollowUp();
                }
              }}
              disabled={isLoading}
            />
            <button
              type="button"
              disabled={!userInput.trim() || isLoading}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-none border border-transparent bg-[var(--shell-accent)] text-[var(--shell-accent-ink)] transition hover:bg-[var(--shell-accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => void handleSendFollowUp()}
            >
              <SendIcon className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-1.5 text-[10px] text-[var(--shell-muted)]">⌘ + Enter to send</p>
        </div>
      ) : null}
      <PurchaseCreditsDialog
        open={purchaseDialogOpen}
        onOpenChange={(open) => {
          setPurchaseDialogOpen(open);
          if (!open) setInsufficientCredits(false);
        }}
      />
    </div>
  );
}

type ConfirmCardProps = {
  params: ClarifyWorkoutPlanSuggestedParams;
  isPreviewLoading: boolean;
  onPreview: () => void;
  onEdit: () => void;
};

function ConfirmCard({ params, isPreviewLoading, onPreview, onEdit }: ConfirmCardProps) {
  return (
    <div className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--shell-muted)]">
        Ready to generate
      </p>
      <dl className="mt-2 space-y-1 text-sm">
        <Row label="Start date" value={dayjs(params.startDate).format("ddd, D MMM YYYY")} />
        <Row label="Duration" value={`${params.numberOfWeeks} week${params.numberOfWeeks !== 1 ? "s" : ""}`} />
        <Row label="Conflicts" value={params.conflictStrategy} />
      </dl>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          disabled={isPreviewLoading}
          className="inline-flex items-center gap-1.5 rounded-none border border-transparent bg-[var(--shell-accent)] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-accent-ink)] transition hover:bg-[var(--shell-accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onPreview}
        >
          <SparklesIcon className="h-3 w-3" />
          Preview Plan
        </button>
        <button
          type="button"
          disabled={isPreviewLoading}
          className="inline-flex items-center gap-1 rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-muted)] transition hover:bg-[var(--shell-surface-strong)] hover:text-[var(--shell-ink)] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onEdit}
        >
          Edit
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[var(--shell-muted)]">{label}</dt>
      <dd className="font-medium text-[var(--shell-ink)]">{value}</dd>
    </div>
  );
}
