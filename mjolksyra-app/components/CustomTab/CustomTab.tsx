type TabOption<T extends string = string> = {
  name: string;
  value: T;
};

type CustomTabProps<T extends string> = {
  options: TabOption<T>[];
  value: T;
  onSelect: (tab: TabOption<T>) => void;
};

export function CustomTab<T extends string>({
  options,
  value,
  onSelect,
}: CustomTabProps<T>) {
  function renderTab(tab: TabOption<T>) {
    const isActive = tab.value === value;
    return (
      <button
        key={tab.value}
        type="button"
        role="tab"
        aria-selected={isActive}
        aria-controls={`radix-:ru:-content-${tab.value}`}
        data-state={isActive ? "active" : "inactive"}
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-200 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:bg-gray-800/50"
        tabIndex={-1}
        onClick={() => onSelect(tab)}
      >
        {tab.name}
      </button>
    );
  }

  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className="inline-flex h-10 gap-1 items-center justify-center rounded-lg bg-gray-950/80 p-1 text-muted-foreground border border-gray-800/50"
      tabIndex={0}
      data-orientation="horizontal"
    >
      {options.map(renderTab)}
    </div>
  );
}
