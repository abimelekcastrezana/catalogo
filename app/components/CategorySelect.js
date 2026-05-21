'use client';

export default function CategorySelect({ categories, currentCategoryId }) {
  return (
    <form method="get" className="mb-4">
      <label className="flex flex-col gap-1 min-w-[240px] flex-1">
        <span className="text-sm font-medium text-[var(--muted)]">Categoría</span>
        <select
          name="categoryId"
          defaultValue={currentCategoryId}
          className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--text)] appearance-none"
          onChange={(e) => e.currentTarget.form?.submit()}
        >
          <option value="">Todas</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
    </form>
  );
}
