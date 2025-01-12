export function draggingStyle({
  canDrop,
  isOver,
}: {
  isOver: boolean;
  canDrop: boolean;
}) {
  return {
    "bg-accent/25": canDrop,
    "bg-accent": isOver && canDrop,
  };
}
