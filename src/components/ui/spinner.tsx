export function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const s = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8" }[size];
  return (
    <div
      role="status"
      aria-label="Carregando"
      className={`${s} animate-spin rounded-full border-4 border-indigo-600 border-t-transparent`}
    />
  );
}
