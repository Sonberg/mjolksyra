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
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all fo data-[state=active]:bg-white data-[state=active]:text-black data-[state=inactive]:text-white"
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
      className="inline-flex h-10 gap-1 items-center justify-center rounded-lg bg-white/10 p-1 text-muted-foreground"
      tabIndex={0}
      data-orientation="horizontal"
    >
      {options.map(renderTab)}
    </div>
  );
}
