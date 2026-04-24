'use client';

export default function CategorySelect({ categories, currentCategoryId }) {
  return (
    <form method="get" style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '240px', flex: '1' }}>
        Categoría
        <select
          name="categoryId"
          defaultValue={currentCategoryId}
          className="select"
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
