"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import {
  SparklesIcon,
  SendIcon,
  XIcon,
  PaperclipIcon,
  CheckIcon,
  RotateCcwIcon,
  UploadIcon,
} from "lucide-react";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);
import { clarifyWorkoutPlan } from "@/services/aiPlanner/clarifyWorkoutPlan";
import { deletePlannerSession } from "@/services/aiPlanner/deletePlannerSession";
import { generateWorkoutPlan } from "@/services/aiPlanner/generateWorkoutPlan";
import { previewWorkoutPlan } from "@/services/aiPlanner/previewWorkoutPlan";
import { getLatestPlannerSession } from "@/services/aiPlanner/getLatestPlannerSession";
import { getCreditPricing } from "@/services/coaches/getCreditPricing";
import { PurchaseCreditsDialog } from "@/dialogs/PurchaseCreditsDialog/PurchaseCreditsDialog";
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
    file.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
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

export function AIPlannerPanel({
  traineeId,
  onGenerated,
  initialState,
}: Props) {
  const [sessionId, setSessionId] = useState<string | null>(
    initialState?.sessionId ?? null,
  );
  const [description, setDescription] = useState(
    initialState?.description ?? "",
  );
  const [messages, setMessages] = useState<Message[]>(
    initialState?.messages ?? [],
  );
  const [attachedFiles, setAttachedFiles] = useState<PlannerFileContent[]>(
    initialState?.attachedFiles ?? [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(!initialState);
  const [suggestedParams, setSuggestedParams] =
    useState<ClarifyWorkoutPlanSuggestedParams | null>(
      initialState?.suggestedParams ?? null,
    );
  const [isReadyToGenerate, setIsReadyToGenerate] = useState(
    initialState?.isReadyToGenerate ?? false,
  );
  const [generationResult, setGenerationResult] =
    useState<GenerationResult | null>(initialState?.generationResult ?? null);
  const [previewData, setPreviewData] = useState<
    PreviewWorkoutPlanWorkout[] | null
  >(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [insufficientCredits, setInsufficientCredits] = useState(false);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [isClearingSession, setIsClearingSession] = useState(false);
  const [attachmentDragDepth, setAttachmentDragDepth] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: pricing } = useQuery({
    queryKey: ["coach-credit-pricing"],
    queryFn: getCreditPricing,
  });
  const generateCost =
    pricing?.find((p) => p.action === "GenerateWorkoutPlan")?.creditCost ??
    null;
  const hasStarted = messages.length > 0 || isLoading;
  const hasSessionDraft =
    hasStarted ||
    attachedFiles.length > 0 ||
    !!description.trim() ||
    !!generationResult;

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
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
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
        conversationHistory: newMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
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
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
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
        setMessages([
          ...messages,
          {
            role: "assistant",
            content: "Generation failed. Please try again.",
          },
        ]);
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
        {
          role: "assistant",
          content: "Couldn't clear this session right now. Please try again.",
        },
      ]);
    } finally {
      setIsClearingSession(false);
    }
  }

  async function addAttachedFiles(files: File[]) {
    if (!files.length) {
      return;
    }

    const parsed = await Promise.all(files.map(parseFileToContent));
    setAttachedFiles((prev) => [...prev, ...parsed]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    await addAttachedFiles(Array.from(e.target.files ?? []));
  }

  const isAttachmentDragActive = attachmentDragDepth > 0;

  function handleAttachmentDragEnter(e: React.DragEvent<HTMLDivElement>) {
    if (!e.dataTransfer.types.includes("Files")) {
      return;
    }

    e.preventDefault();
    setAttachmentDragDepth((value) => value + 1);
  }

  function handleAttachmentDragOver(e: React.DragEvent<HTMLDivElement>) {
    if (!e.dataTransfer.types.includes("Files")) {
      return;
    }

    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }

  function handleAttachmentDragLeave(e: React.DragEvent<HTMLDivElement>) {
    if (!e.dataTransfer.types.includes("Files")) {
      return;
    }

    e.preventDefault();
    setAttachmentDragDepth((value) => Math.max(0, value - 1));
  }

  async function handleAttachmentDrop(e: React.DragEvent<HTMLDivElement>) {
    if (!e.dataTransfer.files.length) {
      return;
    }

    e.preventDefault();
    setAttachmentDragDepth(0);
    await addAttachedFiles(Array.from(e.dataTransfer.files));
  }

  function removeFile(index: number) {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  if (isBootstrapping) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingDots />
      </div>
    );
  }

  if (generationResult) {
    return (
      <div className="flex h-full flex-col bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent)] p-4">
        <div className="flex items-start gap-3 border border-[var(--shell-border)] bg-[color-mix(in_srgb,var(--shell-surface-strong)_92%,white_8%)] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.06)]">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-[var(--shell-border)] bg-[var(--shell-accent)]">
            <CheckIcon className="h-3.5 w-3.5 text-[var(--shell-accent-ink)]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--shell-muted)]">
              Planner complete
            </p>
            <p className="mt-1 text-sm font-semibold text-[var(--shell-ink)]">
              Program generated
            </p>
            <p className="mt-1 text-sm text-[var(--shell-muted)]">
              {generationResult.summary}
            </p>
            <p className="mt-1 text-xs text-[var(--shell-muted)]">
              {dayjs(generationResult.dateFrom).format("MMM D")}
              {" — "}
              {dayjs(generationResult.dateTo).format("MMM D, YYYY")}
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--shell-muted)]">
          Workouts were added as drafts. Review them in the{" "}
          <span className="font-semibold text-[var(--shell-ink)]">Changes</span>{" "}
          tab, then publish when ready.
        </p>
        <button
          type="button"
          disabled={isClearingSession}
          className="mt-4 inline-flex items-center gap-1.5 self-start border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-muted)] transition hover:bg-[var(--shell-surface)] hover:text-[var(--shell-ink)]"
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
      <div className="border-b border-[var(--shell-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent)] px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <SparklesIcon className="h-3.5 w-3.5 text-[var(--shell-muted)]" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--shell-muted)]">
                AI planner
              </p>
            </div>
            <p className="mt-1 text-sm font-semibold text-[var(--shell-ink)]">
              Build the next block with guided prompts
            </p>
          </div>
          {hasSessionDraft && (
            <button
              type="button"
              disabled={isLoading || isClearingSession}
              className="inline-flex items-center gap-1 border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-muted)] transition hover:bg-[var(--shell-surface)] hover:text-[var(--shell-ink)] disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => void handleClearSession()}
            >
              <RotateCcwIcon className="h-3 w-3" />
              Clear session
            </button>
          )}
        </div>
        {!hasStarted && (
          <p className="mt-2 text-xs leading-5 text-[var(--shell-muted)]">
            Describe the training goal, upload context, and let the planner
            guide you toward a clean draft before generation.
          </p>
        )}
      </div>

      {hasStarted && (
        <div className="min-h-0 flex-1 overflow-y-auto bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_22%)] px-4 py-4">
          <div className="flex min-h-full flex-col justify-end gap-3">
            {messages.map((message, index) => {
              const isLastAi =
                message.role === "assistant" &&
                index === messages.findLastIndex((m) => m.role === "assistant");
              const showOptions =
                isLastAi &&
                message.options?.length &&
                !isLoading &&
                !isReadyToGenerate;

              return (
                <div key={index} className="flex flex-col gap-1.5">
                  <PlannerBubble role={message.role}>
                    {message.content}
                  </PlannerBubble>
                  {showOptions && (
                    <div className="flex flex-wrap gap-2 pl-1">
                      {message.options!.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => void handleOptionSelect(option)}
                          className="border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-1.5 text-xs font-medium text-[var(--shell-ink)] transition hover:border-[var(--shell-ink)] hover:bg-[var(--shell-surface-strong)]"
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
                <div className="border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-4 py-3">
                  <LoadingDots />
                </div>
              </div>
            )}
            {isReadyToGenerate && suggestedParams && !isLoading && previewData === null && (
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
            {previewData !== null && !isLoading && (
              <PreviewCard
                workouts={previewData}
                generateCost={generateCost}
                isLoading={isPreviewLoading}
                onGenerate={() => void handleGenerate()}
                onRefine={(feedback) => void handleRefine(feedback)}
              />
            )}
            {insufficientCredits && (
              <div className="flex items-center justify-between gap-3 border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-4 py-3">
                <p className="text-xs text-[var(--shell-muted)]">
                  Not enough credits.
                </p>
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

      {!hasStarted ? (
        <div
          className={[
            "flex-1 overflow-y-auto px-4 py-4 transition",
            isAttachmentDragActive
              ? "bg-[color-mix(in_srgb,var(--shell-surface)_72%,white_28%)]"
              : "",
          ].join(" ")}
          data-testid="ai-planner-attachment-dropzone"
          onDragEnter={handleAttachmentDragEnter}
          onDragOver={handleAttachmentDragOver}
          onDragLeave={handleAttachmentDragLeave}
          onDrop={(e) => void handleAttachmentDrop(e)}
        >
          <div
            className={[
              "mb-4 flex items-center justify-between gap-3 border border-dashed px-3 py-2 transition",
              isAttachmentDragActive
                ? "border-[var(--shell-ink)] bg-[var(--shell-surface)]"
                : "border-[var(--shell-border)] bg-[color-mix(in_srgb,var(--shell-surface)_86%,white_14%)]",
            ].join(" ")}
          >
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-muted)]">
                {isAttachmentDragActive ? "Drop files here" : "Drag and drop attachments"}
              </p>
              <p className="mt-0.5 text-[11px] text-[var(--shell-muted)]">
                Add notes, spreadsheets, exports, or images for planner context.
              </p>
            </div>
            <UploadIcon className="h-4 w-4 shrink-0 text-[var(--shell-muted)]" />
          </div>

          <textarea
            className="w-full resize-none border border-[var(--shell-border)] bg-[var(--shell-surface)] px-5 py-4 text-sm leading-6 text-[var(--shell-ink)] placeholder:text-[var(--shell-muted)] focus:border-[var(--shell-ink)] focus:outline-none"
            rows={5}
            placeholder="e.g. 12-week strength block for a powerlifter, 3 days/week with progressive overload on squat, bench, and deadlift..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                void handleSendInitial();
              }
            }}
          />

          {attachedFiles.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {attachedFiles.map((file, i) => (
                <AttachmentPill
                  key={`${file.name}-${i}`}
                  fileName={file.name}
                  onRemove={() => removeFile(i)}
                />
              ))}
            </div>
          )}

          <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-muted)]">
            {isAttachmentDragActive ? "Release to attach files" : "Tip: you can also drag files anywhere into this area"}
          </p>

          <div className="mt-4 flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={ACCEPTED_EXTENSIONS}
              multiple
              onChange={handleFileChange}
            />
            <div className="flex gap-4 justify-end">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 border border-[var(--shell-border)] bg-[var(--shell-surface)] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-muted)] transition hover:bg-[var(--shell-surface-strong)] hover:text-[var(--shell-ink)]"
                onClick={() => fileInputRef.current?.click()}
              >
                <PaperclipIcon className="h-3 w-3" />
                Attach context
              </button>
              <button
                type="button"
                disabled={!description.trim() || isLoading}
                className="ml-auto inline-flex items-center gap-1.5 border border-transparent bg-[var(--shell-accent)] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-accent-ink)] transition hover:bg-[var(--shell-accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => void handleSendInitial()}
              >
                <SendIcon className="h-3 w-3" />
                Start planner
              </button>
            </div>
          </div>
        </div>
      ) : !isReadyToGenerate && previewData === null ? (
        <div
          className="border-t border-[var(--shell-border)] bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.03))] px-4 py-3"
          data-testid="ai-planner-attachment-dropzone"
          onDragEnter={handleAttachmentDragEnter}
          onDragOver={handleAttachmentDragOver}
          onDragLeave={handleAttachmentDragLeave}
          onDrop={(e) => void handleAttachmentDrop(e)}
        >
          <div
            className={[
              "border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] p-2 transition",
              isAttachmentDragActive
                ? "border-dashed border-[var(--shell-ink)] bg-[color-mix(in_srgb,var(--shell-surface-strong)_84%,white_16%)]"
                : "",
            ].join(" ")}
          >
            <div className="mb-2 flex items-center justify-between gap-3 border border-dashed border-[var(--shell-border)] bg-[color-mix(in_srgb,var(--shell-surface)_88%,white_12%)] px-2 py-2">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-muted)]">
                  {isAttachmentDragActive ? "Drop files here" : "Drag and drop attachments"}
                </p>
                <p className="mt-0.5 text-[11px] text-[var(--shell-muted)]">
                  Add context files without leaving the planner.
                </p>
              </div>
              <UploadIcon className="h-4 w-4 shrink-0 text-[var(--shell-muted)]" />
            </div>
            {attachedFiles.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2 px-2 pt-2">
                {attachedFiles.map((file, i) => (
                  <AttachmentPill
                    key={`${file.name}-${i}`}
                    fileName={file.name}
                    onRemove={() => removeFile(i)}
                  />
                ))}
              </div>
            )}
            <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-muted)]">
              {isAttachmentDragActive ? "Release to attach files" : "Tip: drag files straight into this composer"}
            </p>
            <div className="mb-2 flex items-center justify-between gap-2 px-2">
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
                className="inline-flex items-center gap-1.5 border border-[var(--shell-border)] bg-[var(--shell-surface)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-muted)] transition hover:bg-[var(--shell-surface-strong)] hover:text-[var(--shell-ink)]"
                onClick={() => fileInputRef.current?.click()}
              >
                <PaperclipIcon className="h-3 w-3" />
                Attach
              </button>
              <span className="text-[10px] font-medium text-[var(--shell-muted)]">
                Cmd/Ctrl + Enter to send
              </span>
            </div>
            <div className="flex items-end gap-2">
              <textarea
                className="min-h-[44px] flex-1 resize-none border border-transparent bg-transparent px-4 py-2.5 text-sm leading-6 text-[var(--shell-ink)] placeholder:text-[var(--shell-muted)] focus:border-[var(--shell-border)] focus:bg-[var(--shell-surface)] focus:outline-none"
                rows={2}
                placeholder="Reply with the next detail..."
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
                className="flex h-11 w-11 shrink-0 items-center justify-center border border-transparent bg-[var(--shell-accent)] text-[var(--shell-accent-ink)] transition hover:bg-[var(--shell-accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => void handleSendFollowUp()}
              >
                <SendIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
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

function ConfirmCard({
  params,
  isPreviewLoading,
  onPreview,
  onEdit,
}: ConfirmCardProps) {
  return (
    <div className="border border-[var(--shell-border)] bg-[color-mix(in_srgb,var(--shell-surface-strong)_92%,white_8%)] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.06)]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--shell-muted)]">
        Ready to generate
      </p>
      <dl className="mt-3 space-y-2 text-sm">
        <Row
          label="Start date"
          value={dayjs(params.startDate).format("ddd, D MMM YYYY")}
        />
        <Row
          label="Duration"
          value={`${params.numberOfWeeks} week${params.numberOfWeeks !== 1 ? "s" : ""}`}
        />
        <Row label="Conflicts" value={params.conflictStrategy} />
      </dl>
      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          disabled={isPreviewLoading}
          className="inline-flex items-center gap-1.5 border border-transparent bg-[var(--shell-accent)] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-accent-ink)] transition hover:bg-[var(--shell-accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onPreview}
        >
          <SparklesIcon className="h-3 w-3" />
          Preview Plan
        </button>
        <button
          type="button"
          disabled={isPreviewLoading}
          className="inline-flex items-center gap-1 border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-muted)] transition hover:bg-[var(--shell-surface-strong)] hover:text-[var(--shell-ink)] disabled:cursor-not-allowed disabled:opacity-50"
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

function AttachmentPill({
  fileName,
  onRemove,
}: {
  fileName: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-1 text-[10px] font-medium text-[var(--shell-muted)]">
      {fileName}
      <button
        type="button"
        onClick={onRemove}
        className="transition hover:text-[var(--shell-ink)]"
        aria-label={`Remove attachment ${fileName}`}
      >
        <XIcon className="h-3 w-3" />
      </button>
    </span>
  );
}

function PlannerBubble({
  role,
  children,
}: {
  role: Message["role"];
  children: ReactNode;
}) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[88%] sm:max-w-[82%]">
        <div
          className={
            isUser
              ? "mb-1 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--shell-muted)]"
              : "mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--shell-muted)]"
          }
        >
          {isUser ? "Coach" : "Planner"}
        </div>
        <div
          className={
            isUser
              ? "border border-[var(--shell-accent)]/30 bg-[color-mix(in_srgb,var(--shell-accent)_16%,var(--shell-surface)_84%)] px-4 py-3 text-sm leading-6 text-[var(--shell-ink)] shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
              : "border border-[var(--shell-border)] bg-[color-mix(in_srgb,var(--shell-surface-strong)_92%,white_8%)] px-4 py-3 text-sm leading-6 text-[var(--shell-ink)]"
          }
        >
          {children}
        </div>
      </div>
    </div>
  );
}

type WeekGroup = {
  weekLabel: string;
  weekRange: string;
  workouts: PreviewWorkoutPlanWorkout[];
};

function groupByWeek(workouts: PreviewWorkoutPlanWorkout[]): WeekGroup[] {
  const map = new Map<string, PreviewWorkoutPlanWorkout[]>();
  for (const workout of workouts) {
    const d = dayjs(workout.plannedAt);
    const key = `${d.isoWeekYear()}-W${String(d.isoWeek()).padStart(2, "0")}`;
    map.set(key, [...(map.get(key) ?? []), workout]);
  }
  const groups: WeekGroup[] = [];
  let weekIndex = 1;
  for (const [, weekWorkouts] of map) {
    const monday = dayjs(weekWorkouts[0].plannedAt).startOf("isoWeek" as dayjs.OpUnitType);
    const sunday = monday.add(6, "day");
    groups.push({
      weekLabel: `Week ${weekIndex}`,
      weekRange: `${monday.format("MMM D")} – ${sunday.format("MMM D")}`,
      workouts: weekWorkouts.sort((a, b) => a.plannedAt.localeCompare(b.plannedAt)),
    });
    weekIndex++;
  }
  return groups;
}

function formatSet(set: PreviewWorkoutPlanWorkout["exercises"][0]["sets"][0], type?: string): string {
  if (type === "DurationSeconds" && set.durationSeconds) return `${set.durationSeconds}s`;
  if (type === "DistanceMeters" && set.distanceMeters) return `${set.distanceMeters}m`;
  const parts: string[] = [];
  if (set.reps) parts.push(`${set.reps}`);
  if (set.weightKg) parts.push(`${set.weightKg}kg`);
  return parts.join(" @ ");
}

function formatPrescription(exercise: PreviewWorkoutPlanWorkout["exercises"][0]): string {
  if (!exercise.sets.length) return "";
  const type = exercise.prescriptionType;
  if (exercise.sets.length === 1) return formatSet(exercise.sets[0], type ?? undefined);
  const first = formatSet(exercise.sets[0], type ?? undefined);
  const allSame = exercise.sets.every((s) => formatSet(s, type ?? undefined) === first);
  if (allSame) return `${exercise.sets.length}×${first}`;
  return exercise.sets.map((s) => formatSet(s, type ?? undefined)).join(", ");
}

type PreviewCardProps = {
  workouts: PreviewWorkoutPlanWorkout[];
  generateCost: number | null;
  isLoading: boolean;
  onGenerate: () => void;
  onRefine: (feedback: string) => void;
};

function PreviewCard({ workouts, generateCost, isLoading, onGenerate, onRefine }: PreviewCardProps) {
  const [feedback, setFeedback] = useState("");
  const weeks = groupByWeek(workouts);

  function handleRefine() {
    const text = feedback.trim();
    if (!text) return;
    onRefine(text);
    setFeedback("");
  }

  return (
    <div className="border border-[var(--shell-border)] bg-[color-mix(in_srgb,var(--shell-surface-strong)_92%,white_8%)] shadow-[0_16px_40px_rgba(0,0,0,0.06)]">
      <div className="border-b border-[var(--shell-border)] px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--shell-muted)]">
          Plan Preview
        </p>
        <p className="mt-0.5 text-xs text-[var(--shell-muted)]">
          {workouts.length === 0
            ? "No workouts were generated."
            : `${workouts.length} workout${workouts.length !== 1 ? "s" : ""} across ${weeks.length} week${weeks.length !== 1 ? "s" : ""}`}
        </p>
      </div>
      <div className="max-h-[260px] overflow-y-auto">
        {workouts.length === 0 ? (
          <p className="px-4 py-4 text-xs text-[var(--shell-muted)]">
            The AI didn&apos;t return any workouts. Try refining your description.
          </p>
        ) : (
          weeks.map((week) => (
            <div key={week.weekLabel} className="border-b border-[var(--shell-border)] px-4 py-3 last:border-b-0">
              <div className="mb-1.5 flex items-baseline gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--shell-ink)]">
                  {week.weekLabel}
                </span>
                <span className="text-[10px] text-[var(--shell-muted)]">{week.weekRange}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {week.workouts.map((workout) => (
                  <div key={workout.plannedAt}>
                    <p className="text-xs font-medium text-[var(--shell-ink)]">
                      {dayjs(workout.plannedAt).format("ddd, MMM D")}
                      {workout.name && (
                        <span className="ml-1.5 font-normal text-[var(--shell-muted)]">— {workout.name}</span>
                      )}
                    </p>
                    {workout.exercises.length > 0 && (
                      <ul className="mt-0.5 space-y-0.5 pl-3">
                        {workout.exercises.map((exercise, i) => {
                          const prescription = formatPrescription(exercise);
                          return (
                            <li key={i} className="flex items-baseline gap-1.5 text-xs text-[var(--shell-muted)]">
                              <span className="text-[var(--shell-ink)]">{exercise.name}</span>
                              {prescription && <span>·</span>}
                              {prescription && <span>{prescription}</span>}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      <div className="border-t border-[var(--shell-border)] px-4 py-3">
        <textarea
          className="w-full resize-none border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-2 text-sm text-[var(--shell-ink)] placeholder:text-[var(--shell-muted)] focus:border-[var(--shell-ink)] focus:outline-none disabled:opacity-50"
          rows={2}
          placeholder="Give feedback to refine the plan…"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleRefine();
          }}
        />
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            disabled={!feedback.trim() || isLoading}
            className="inline-flex items-center gap-1.5 border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-muted)] transition hover:bg-[var(--shell-surface)] hover:text-[var(--shell-ink)] disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleRefine}
          >
            <RotateCcwIcon className="h-3 w-3" />
            Refine
          </button>
          <button
            type="button"
            disabled={isLoading || workouts.length === 0}
            className="ml-auto inline-flex items-center gap-1.5 border border-transparent bg-[var(--shell-accent)] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-accent-ink)] transition hover:bg-[var(--shell-accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onGenerate}
          >
            <SparklesIcon className="h-3 w-3" />
            {generateCost ? `Generate (${generateCost} cr)` : "Generate"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingDots() {
  return (
    <span className="flex gap-1">
      <span className="h-1.5 w-1.5 animate-bounce bg-[var(--shell-muted)] [animation-delay:0ms]" />
      <span className="h-1.5 w-1.5 animate-bounce bg-[var(--shell-muted)] [animation-delay:150ms]" />
      <span className="h-1.5 w-1.5 animate-bounce bg-[var(--shell-muted)] [animation-delay:300ms]" />
    </span>
  );
}
