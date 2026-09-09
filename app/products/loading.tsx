export default function ProductsLoading() {
  return (
    <main className="shell py-10">
      <div className="mb-8 h-28 max-w-xl animate-pulse rounded-[8px] bg-white" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-96 animate-pulse rounded-[8px] border border-[var(--line)] bg-white"
          />
        ))}
      </div>
    </main>
  )
}
