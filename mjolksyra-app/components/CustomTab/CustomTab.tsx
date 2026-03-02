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
        className="inline-flex min-w-[7.5rem] items-center justify-center whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-zinc-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 data-[state=active]:bg-zinc-100 data-[state=active]:text-zinc-950 data-[state=active]:shadow-[0_8px_20px_rgba(255,255,255,0.14)] data-[state=inactive]:text-zinc-400 data-[state=inactive]:hover:bg-zinc-900/80 data-[state=inactive]:hover:text-zinc-100"
        tabIndex={isActive ? 0 : -1}
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
      className="inline-flex h-12 items-center justify-center gap-1 rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
      tabIndex={0}
      data-orientation="horizontal"
    >
      {options.map(renderTab)}
    </div>
  );
}
