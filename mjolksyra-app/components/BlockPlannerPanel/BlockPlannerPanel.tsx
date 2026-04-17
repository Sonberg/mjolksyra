"use client";

import { ReactNode, useEffect, useRef, useState, useId } from "react";
import { isAxiosError } from "axios";
import {
  SendIcon,
  XIcon,
  PaperclipIcon,
  CheckIcon,
  RotateCcwIcon,
  Trash2Icon,
  LoaderCircle,
} from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { clarifyBlockPlan } from "@/services/blockPlanner/clarifyBlockPlan";
import { applyBlockPlannerProposal } from "@/services/blockPlanner/applyBlockPlannerProposal";
import { deleteBlockPlannerSession } from "@/services/blockPlanner/deleteBlockPlannerSession";
import { discardBlockPlannerProposal } from "@/services/blockPlanner/discardBlockPlannerProposal";
import { getLatestBlockPlannerSession } from "@/services/blockPlanner/getLatestBlockPlannerSession";
import { PurchaseCreditsDialog } from "@/dialogs/PurchaseCreditsDialog/PurchaseCreditsDialog";
import type {
  PlannerFileContent,
  BlockPlannerActionProposal,
  BlockPlannerActionSet,
  BlockPlannerCreditBreakdownItem,
  ApplyBlockPlannerProposalResponse,
} from "@/services/blockPlanner/types";
import { cn } from "@/lib/utils";

type Props = {
  blockId: string;
  numberOfWeeks: number;
  onGenerated: () => Promise<unknown>;
  initialState?: {
    sessionId?: string | null;
    messages?: Message[];
    proposedActionSet?: BlockPlannerActionSet | null;
  };
};

type Message = {
  role: "user" | "assistant";
  content: string;
  options?: string[];
};

type GenerationResult = ApplyBlockPlannerProposalResponse & {
  generatedAt: string;
};

const ACCEPTED_EXTENSIONS =
  ".json,.txt,.csv,.xlsx,.jpg,.jpeg,.png,.webp,.heic,.heif";
const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
  "image/heic",
  "image/heif",
]);
const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
]);

function isImageFile(file: File): boolean {
  if (IMAGE_TYPES.has(file.type)) return true;
  const ext = "." + (file.name.split(".").pop()?.toLowerCase() ?? "");
  return IMAGE_EXTENSIONS.has(ext);
}

async function parseFileToContent(file: File): Promise<PlannerFileContent> {
  if (isImageFile(file)) {
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

export function BlockPlannerPanel({
  blockId,
  numberOfWeeks,
  onGenerated,
  initialState,
}: Props) {
  const attachmentInputId = useId();
  const [sessionId, setSessionId] = useState<string | null>(
    initialState?.sessionId ?? null,
  );
  const [description, setDescription] = useState("");
  const [messages, setMessages] = useState<Message[]>(
    initialState?.messages ?? [],
  );
  const [attachedFiles, setAttachedFiles] = useState<PlannerFileContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(!initialState);
  const [generationResult, setGenerationResult] =
    useState<GenerationResult | null>(null);
  const [proposedActionSet, setProposedActionSet] =
    useState<BlockPlannerActionSet | null>(
      initialState?.proposedActionSet ?? null,
    );
  const [userInput, setUserInput] = useState("");
  const [insufficientCredits, setInsufficientCredits] = useState(false);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [isClearingSession, setIsClearingSession] = useState(false);
  const [proposalError, setProposalError] = useState<string | null>(null);
  const [attachmentDragDepth, setAttachmentDragDepth] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasPendingProposal = proposedActionSet?.status === "pending";
  const hasStarted = messages.length > 0 || isLoading;
  const hasSessionDraft =
    hasStarted ||
    attachedFiles.length > 0 ||
    !!description.trim() ||
    !!proposedActionSet ||
    !!generationResult;

  useEffect(() => {
    if (initialState) {
      setIsBootstrapping(false);
      return;
    }

    let cancelled = false;

    async function clearPersistedSession() {
      try {
        const session = await getLatestBlockPlannerSession({ blockId });
        if (cancelled || !session) {
          return;
        }

        await deleteBlockPlannerSession({ blockId, sessionId: session.sessionId });
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
  }, [initialState, blockId]);

  function scrollToBottom() {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }

  async function handleSendInitial() {
    if (!description.trim()) return;

    const userMessage: Message = { role: "user", content: description.trim() };
    const newMessages = [userMessage];
    setMessages(newMessages);
    setIsLoading(true);
    scrollToBottom();

    try {
      const response = await clarifyBlockPlan({
        blockId,
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
      setProposedActionSet(response.proposedActionSet);
      setProposalError(null);
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
      const response = await clarifyBlockPlan({
        blockId,
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
      setProposedActionSet(response.proposedActionSet);
      setProposalError(null);
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

  async function handleApplyProposal() {
    if (!proposedActionSet) return;

    setIsLoading(true);
    setInsufficientCredits(false);

    try {
      const result = await applyBlockPlannerProposal({
        blockId,
        proposalId: proposedActionSet.id,
      });

      setGenerationResult({ ...result, generatedAt: new Date().toISOString() });
      setProposedActionSet(null);
      await onGenerated();
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 422) {
        setInsufficientCredits(true);
      } else {
        setMessages([
          ...messages,
          {
            role: "assistant",
            content: "Applying this proposal failed. Please try again.",
          },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDiscardProposal() {
    if (!proposedActionSet || isLoading) return;

    setIsLoading(true);
    try {
      await discardBlockPlannerProposal({
        blockId,
        proposalId: proposedActionSet.id,
      });
      setProposedActionSet(null);
      setProposalError(null);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "Proposal discarded. Tell me what you want to change next.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setSessionId(null);
    setDescription("");
    setMessages([]);
    setAttachedFiles([]);
    setUserInput("");
    setGenerationResult(null);
    setProposedActionSet(null);
    setProposalError(null);
  }

  async function handleClearSession() {
    if (isLoading || isClearingSession) return;

    setIsClearingSession(true);
    try {
      if (sessionId) {
        await deleteBlockPlannerSession({ blockId, sessionId });
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
    if (!files.length) return;
    const parsed = await Promise.all(files.map(parseFileToContent));
    setAttachedFiles((prev) => [...prev, ...parsed]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    await addAttachedFiles(Array.from(e.target.files ?? []));
  }

  const isAttachmentDragActive = attachmentDragDepth > 0;

  function handleAttachmentDragEnter(e: React.DragEvent<HTMLDivElement>) {
    if (!e.dataTransfer.types.includes("Files")) return;
    e.preventDefault();
    setAttachmentDragDepth((v) => v + 1);
  }

  function handleAttachmentDragOver(e: React.DragEvent<HTMLDivElement>) {
    if (!e.dataTransfer.types.includes("Files")) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }

  function handleAttachmentDragLeave(e: React.DragEvent<HTMLDivElement>) {
    if (!e.dataTransfer.types.includes("Files")) return;
    e.preventDefault();
    setAttachmentDragDepth((v) => Math.max(0, v - 1));
  }

  async function handleAttachmentDrop(e: React.DragEvent<HTMLDivElement>) {
    if (!e.dataTransfer.files.length) return;
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
      <div className="flex h-full flex-col gap-4 bg-[var(--shell-surface)] p-4">
        <Card className="border border-[var(--shell-border)] shadow-none">
          <CardHeader className="border-b border-[var(--shell-border)] p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-[var(--shell-border)] bg-[var(--shell-accent)]">
                <CheckIcon data-icon className="text-[var(--shell-accent-ink)]" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--shell-muted)]">
                  Block planner complete
                </p>
                <CardTitle className="mt-1 text-base">
                  Changes applied
                </CardTitle>
                <CardDescription className="mt-1 text-sm">
                  {generationResult.summary}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-2">
              <StatTile
                label="Actions applied"
                value={`${generationResult.actionsApplied}`}
              />
              <StatTile label="Next step" value="Review block" />
            </div>
            <p className="mt-4 text-xs leading-5 text-[var(--shell-muted)]">
              The block template was updated. Review the changes in the grid.
            </p>
          </CardContent>
          <CardFooter className="border-t border-[var(--shell-border)] p-4 pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={isClearingSession}
              onClick={() => void handleClearSession()}
            >
              <RotateCcwIcon data-icon="inline-start" />
              Clear session
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--shell-surface)]">
      <Card className="border-b border-[var(--shell-border)] border-x-0 border-t-0 shadow-none">
        <CardHeader className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--shell-muted)]">
                Block planner
              </p>
              <CardTitle className="mt-1 text-base">
                Design your {numberOfWeeks}-week block
              </CardTitle>
              <CardDescription className="mt-1 text-xs leading-5">
                Describe the block, review proposed workouts, and apply only
                when you approve.
              </CardDescription>
            </div>
            {hasSessionDraft && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isLoading || isClearingSession}
                onClick={() => void handleClearSession()}
              >
                <RotateCcwIcon data-icon="inline-start" />
                Clear session
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {hasStarted && (
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <div className="flex min-h-full flex-col gap-4">
            <div className="flex flex-col gap-3">
              {messages.map((message, index) => {
                const isLastAi =
                  message.role === "assistant" &&
                  index ===
                    messages.findLastIndex((m) => m.role === "assistant");
                const showOptions =
                  isLastAi &&
                  message.options?.length &&
                  !isLoading &&
                  !hasPendingProposal;

                return (
                  <div key={index} className="flex flex-col gap-1.5">
                    <PlannerBubble role={message.role}>
                      {message.content}
                    </PlannerBubble>
                    {showOptions && (
                      <div className="flex flex-wrap gap-2">
                        {message.options!.map((option) => (
                          <Button
                            key={option}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => void handleOptionSelect(option)}
                          >
                            {option}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              {isLoading && (
                <div className="border border-[var(--shell-border)] bg-[var(--shell-surface)] px-4 py-3">
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--shell-muted)]">
                    Planner
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[var(--shell-muted)]">
                    <LoadingDots />
                    <span>Designing the block…</span>
                  </div>
                </div>
              )}
            </div>

            {hasPendingProposal && proposedActionSet && (
              <ProposalReviewCard
                proposal={proposedActionSet}
                isLoading={isLoading}
                error={proposalError}
                onApply={() => void handleApplyProposal()}
                onDiscard={() => void handleDiscardProposal()}
              />
            )}
            {insufficientCredits && (
              <Alert variant="destructive">
                <AlertTitle>Not enough credits for this proposal.</AlertTitle>
                <AlertDescription className="flex items-center justify-between gap-3">
                  <span>
                    Buy more credits and then apply this{" "}
                    {proposedActionSet?.creditCost || 1} credit proposal again.
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => setPurchaseDialogOpen(true)}
                  >
                    Buy credits
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </div>
          <div ref={bottomRef} />
        </div>
      )}

      {!hasStarted ? (
        <div
          className={[
            "flex flex-1 flex-col justify-end overflow-hidden transition",
            isAttachmentDragActive
              ? "bg-[color-mix(in_srgb,var(--shell-surface)_72%,white_28%)]"
              : "",
          ].join(" ")}
          data-testid="block-planner-attachment-dropzone"
          onDragEnter={handleAttachmentDragEnter}
          onDragOver={handleAttachmentDragOver}
          onDragLeave={handleAttachmentDragLeave}
          onDrop={(e) => void handleAttachmentDrop(e)}
        >
          <Separator />
          <PlannerComposer
            value={description}
            onChange={setDescription}
            onSend={() => void handleSendInitial()}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey))
                void handleSendInitial();
            }}
            canSend={!!description.trim()}
            isLoading={isLoading}
            rows={5}
            placeholder={`e.g. Build a ${numberOfWeeks}-week strength block, 3 days per week, focusing on the big 3.`}
            fileInputRef={fileInputRef}
            fileInputId={attachmentInputId}
            attachedFiles={attachedFiles}
            isAttachmentDragActive={isAttachmentDragActive}
            attachmentButtonLabel="Attach context"
            onAttachmentClick={() => fileInputRef.current?.click()}
            onRemoveFile={removeFile}
            onFileChange={handleFileChange}
          />
        </div>
      ) : (
        <>
          <Separator />
          <div
            data-testid="block-planner-attachment-dropzone"
            onDragEnter={handleAttachmentDragEnter}
            onDragOver={handleAttachmentDragOver}
            onDragLeave={handleAttachmentDragLeave}
            onDrop={(e) => void handleAttachmentDrop(e)}
          >
            <PlannerComposer
              value={userInput}
              onChange={setUserInput}
              onSend={() => void handleSendFollowUp()}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey))
                  void handleSendFollowUp();
              }}
              canSend={!!userInput.trim()}
              isLoading={isLoading}
              rows={3}
              placeholder={
                hasPendingProposal
                  ? "Ask for changes or explain what to revise..."
                  : "Reply with the next detail..."
              }
              textareaDisabled={isLoading}
              fileInputRef={fileInputRef}
              fileInputId={attachmentInputId}
              attachedFiles={attachedFiles}
              isAttachmentDragActive={isAttachmentDragActive}
              attachmentButtonLabel="Attach"
              onAttachmentClick={() => fileInputRef.current?.click()}
              onRemoveFile={removeFile}
              onFileChange={handleFileChange}
            />
          </div>
        </>
      )}
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-xs">
      <dt className="text-[var(--shell-muted)]">{label}</dt>
      <dd className="font-medium text-[var(--shell-ink)]">{value}</dd>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--shell-muted)]">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-[var(--shell-ink)]">
        {value}
      </p>
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
    <Badge
      variant="secondary"
      className="gap-1.5 py-1 normal-case tracking-[0.04em]"
    >
      <span className="text-[10px] font-medium text-[var(--shell-muted)]">
        {fileName}
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="transition hover:text-[var(--shell-ink)]"
        aria-label={`Remove attachment ${fileName}`}
      >
        <XIcon className="size-3" />
      </button>
    </Badge>
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
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div className="max-w-[92%]">
        <div
          className={cn(
            "mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--shell-muted)]",
            isUser && "text-right",
          )}
        >
          {isUser ? "Coach" : "Planner"}
        </div>
        <div
          className={cn(
            "border px-4 py-3 text-sm leading-6 text-[var(--shell-ink)]",
            isUser
              ? "border-[var(--shell-border)] bg-[var(--shell-surface)]"
              : "border-[var(--shell-border)] bg-[var(--shell-surface-strong)]",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatWeekDay(week?: number | null, dayOfWeek?: number | null): string {
  if (!week && !dayOfWeek) return "Not specified";
  const parts: string[] = [];
  if (week) parts.push(`Week ${week}`);
  if (dayOfWeek) parts.push(DAY_NAMES[(dayOfWeek - 1) % 7] ?? `Day ${dayOfWeek}`);
  return parts.join(" / ");
}

type ProposalReviewCardProps = {
  proposal: BlockPlannerActionSet;
  isLoading: boolean;
  error: string | null;
  onApply: () => void;
  onDiscard: () => void;
};

function ProposalReviewCard({
  proposal,
  isLoading,
  error,
  onApply,
  onDiscard,
}: ProposalReviewCardProps) {
  const creditCost = proposal.creditCost || 1;
  const breakdownSummary = summarizeCreditBreakdown(proposal.creditBreakdown);

  return (
    <Card className="border border-[var(--shell-border)] shadow-none">
      <CardHeader className="border-b border-[var(--shell-border)] p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--shell-muted)]">
          Pending approval
        </p>
        <CardTitle className="mt-1 text-base">{proposal.summary}</CardTitle>
        {proposal.explanation && (
          <CardDescription className="mt-1 text-xs leading-5">
            {proposal.explanation}
          </CardDescription>
        )}
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <StatTile
            label="Actions"
            value={`${proposal.actions.length} staged change${proposal.actions.length !== 1 ? "s" : ""}`}
          />
          <StatTile label="Price" value={`${creditCost} cr`} />
        </div>
        <p className="mt-3 text-xs text-[var(--shell-muted)]">
          {breakdownSummary ? `${breakdownSummary}. ` : ""}Rounded and capped at
          5 cr.
        </p>
      </CardHeader>

      <CardContent className="border-b border-[var(--shell-border)] p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--shell-muted)]">
          Review changes
        </p>
        <ScrollArea className="mt-3 max-h-[260px]">
          <div className="flex flex-col gap-2">
            {proposal.actions.map((action, index) => (
              <ProposalActionRow
                key={`${action.actionType}-${action.targetWorkoutId ?? index}`}
                action={action}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="flex-col items-stretch gap-3 p-4 pt-4">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        )}
        <div className="flex items-center gap-2">
          <Button type="button" disabled={isLoading} onClick={onApply}>
            <CheckIcon data-icon="inline-start" />
            {`Apply changes (${creditCost} cr)`}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={onDiscard}
          >
            <Trash2Icon data-icon="inline-start" />
            Discard
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

function ProposalActionRow({ action }: { action: BlockPlannerActionProposal }) {
  return (
    <div className="border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-[var(--shell-ink)]">
          {action.summary}
        </p>
        <Badge variant="secondary" className="shrink-0">
          {formatActionType(action.actionType)}
        </Badge>
      </div>
      <div className="mt-2 flex flex-col gap-1 text-xs text-[var(--shell-muted)]">
        {action.previousWeek &&
          action.targetWeek &&
          (action.previousWeek !== action.targetWeek ||
            action.previousDayOfWeek !== action.targetDayOfWeek) && (
            <Row
              label="Move"
              value={`${formatWeekDay(action.previousWeek, action.previousDayOfWeek)} → ${formatWeekDay(action.targetWeek, action.targetDayOfWeek)}`}
            />
          )}
        {!action.previousWeek && action.targetWeek && (
          <Row
            label="Position"
            value={formatWeekDay(action.targetWeek, action.targetDayOfWeek)}
          />
        )}
        {action.workout?.name && (
          <Row label="Workout" value={action.workout.name} />
        )}
        {action.workout?.exercises?.length ? (
          <Row
            label="Exercises"
            value={`${action.workout.exercises.length} exercise${action.workout.exercises.length !== 1 ? "s" : ""}`}
          />
        ) : null}
      </div>
    </div>
  );
}

function formatActionType(
  actionType: BlockPlannerActionProposal["actionType"],
): string {
  return actionType.replaceAll("_", " ");
}

function summarizeCreditBreakdown(
  breakdown: BlockPlannerCreditBreakdownItem[],
): string | null {
  if (!breakdown.length) return null;
  return breakdown
    .map((item) => `${item.count} ${item.actionType.replaceAll("_", " ")}`)
    .join(" + ");
}

function LoadingDots() {
  return (
    <span className="flex gap-1">
      <span
        className="blocks-pulse size-1.5 bg-[var(--shell-muted)]"
        style={{ animationDelay: "0ms" }}
      />
      <span
        className="blocks-pulse size-1.5 bg-[var(--shell-muted)]"
        style={{ animationDelay: "200ms" }}
      />
      <span
        className="blocks-pulse size-1.5 bg-[var(--shell-muted)]"
        style={{ animationDelay: "400ms" }}
      />
    </span>
  );
}

type PlannerComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  canSend: boolean;
  isLoading: boolean;
  rows: number;
  placeholder: string;
  textareaDisabled?: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  fileInputId: string;
  attachedFiles: PlannerFileContent[];
  isAttachmentDragActive: boolean;
  attachmentButtonLabel: string;
  onAttachmentClick: () => void;
  onRemoveFile: (index: number) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function PlannerComposer({
  value,
  onChange,
  onSend,
  onKeyDown,
  canSend,
  isLoading,
  rows,
  placeholder,
  textareaDisabled,
  fileInputRef,
  fileInputId,
  attachedFiles,
  isAttachmentDragActive,
  attachmentButtonLabel,
  onAttachmentClick,
  onRemoveFile,
  onFileChange,
}: PlannerComposerProps) {
  return (
    <div className="bg-[var(--shell-surface-strong)] p-2 shadow-[0_-6px_24px_rgba(0,0,0,0.04)]">
      <div className="flex items-end gap-2">
        <div className="min-h-11 min-w-0 flex-1 px-3">
          <Textarea
            rows={rows}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={textareaDisabled}
            className="min-h-10 resize-none border-0 bg-transparent py-2 shadow-none focus-visible:ring-0"
          />
        </div>
        <Button
          type="button"
          size="sm"
          disabled={!canSend || isLoading}
          onClick={onSend}
          className="shrink-0 self-end"
        >
          {isLoading ? (
            <LoaderCircle data-icon="inline-start" className="animate-spin" />
          ) : (
            <SendIcon data-icon="inline-start" />
          )}
          {isLoading ? "Sending..." : "Send"}
        </Button>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          id={fileInputId}
          data-testid="block-planner-attachment-input"
          accept={ACCEPTED_EXTENSIONS}
          multiple
          onChange={onFileChange}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          data-testid="block-planner-attachment-button"
          className="gap-1.5 text-[var(--shell-muted)] hover:text-[var(--shell-ink)]"
          onClick={onAttachmentClick}
        >
          <PaperclipIcon data-icon="inline-start" />
          {isAttachmentDragActive ? "Drop files here" : attachmentButtonLabel}
        </Button>
        {attachedFiles.map((file, i) => (
          <AttachmentPill
            key={`${file.name}-${i}`}
            fileName={file.name}
            onRemove={() => onRemoveFile(i)}
          />
        ))}
        <span className="ml-auto text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-muted)]">
          Cmd/Ctrl + Enter to send
        </span>
      </div>
    </div>
  );
}
