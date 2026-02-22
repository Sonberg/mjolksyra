"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { PlusIcon, Pencil, Trash2 } from "lucide-react";

import { getBlocks } from "@/services/blocks/getBlocks";
import { createBlock } from "@/services/blocks/createBlock";
import { deleteBlock } from "@/services/blocks/deleteBlock";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/dialogs/ConfirmDialog";

export function BlocksPageContent() {
  const router = useRouter();
  const client = useQueryClient();

  const { data: blocks = [], isLoading } = useQuery({
    queryKey: ["blocks"],
    queryFn: getBlocks,
  });

  const createMutation = useMutation({
    mutationFn: createBlock,
    onSuccess: (block) => {
      router.push(`/app/coach/blocks/${block.id}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBlock,
    onSuccess: () => client.invalidateQueries({ queryKey: ["blocks"] }),
  });

  const handleCreate = () => {
    createMutation.mutate({
      block: {
        name: "New Block",
        numberOfWeeks: 4,
        workouts: [],
      },
    });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Training Blocks</h1>
        <Button onClick={handleCreate} disabled={createMutation.isPending}>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Block
        </Button>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : blocks.length === 0 ? (
        <div className="text-center text-muted-foreground py-16">
          <p className="mb-4">No blocks yet.</p>
          <Button onClick={handleCreate} variant="outline">
            Create your first block
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {blocks.map((block) => (
            <div
              key={block.id}
              className="border rounded-lg p-4 flex items-center justify-between hover:bg-accent/50 transition-colors"
            >
              <div>
                <div className="font-semibold">{block.name}</div>
                <div className="text-sm text-muted-foreground">
                  {block.numberOfWeeks} week{block.numberOfWeeks !== 1 ? "s" : ""} ·{" "}
                  {block.workouts.length} workout
                  {block.workouts.length !== 1 ? "s" : ""}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/app/coach/blocks/${block.id}`)}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <ConfirmDialog
                  title={`Delete "${block.name}"?`}
                  description="This action cannot be reversed."
                  continueButtonVariant="destructive"
                  continueButton="Yes, delete"
                  cancelButton="Cancel"
                  onConfirm={() => deleteMutation.mutate({ blockId: block.id })}
                  trigger={
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
