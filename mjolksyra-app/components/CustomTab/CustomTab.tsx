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
        className="inline-flex min-w-[7.5rem] flex-1 items-center justify-center whitespace-nowrap px-4 py-2 text-sm font-semibold outline-none transition-all duration-150 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-[var(--shell-accent)]/40 focus-visible:ring-offset-0 data-[state=active]:bg-[var(--shell-ink)] data-[state=active]:text-[var(--shell-surface)] data-[state=inactive]:bg-[var(--shell-surface)] data-[state=inactive]:text-[var(--shell-muted)] data-[state=inactive]:hover:bg-[var(--shell-surface-strong)] data-[state=inactive]:hover:text-[var(--shell-ink)]"
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
      className="inline-flex min-h-12 w-full max-w-[28rem] items-stretch justify-center border border-[var(--shell-border)] bg-[var(--shell-surface)] p-0"
      tabIndex={0}
      data-orientation="horizontal"
    >
      {options.map((option, index) => (
        <div
          key={option.value}
          className={
            index > 0
              ? "flex flex-1 border-l-2 border-[var(--shell-border)]"
              : "flex flex-1"
          }
        >
          {renderTab(option)}
        </div>
      ))}
    </div>
  );
}
