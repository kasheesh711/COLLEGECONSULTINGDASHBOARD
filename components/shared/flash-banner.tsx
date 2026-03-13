import clsx from "clsx";

type FlashBannerProps = {
  message?: string;
  error?: string;
};

export function FlashBanner({ message, error }: FlashBannerProps) {
  if (!message && !error) return null;

  const isError = Boolean(error);

  return (
    <div
      className={clsx(
        "rounded-[1.5rem] border px-5 py-4 text-sm leading-7 shadow-[0_10px_24px_rgba(21,40,61,0.05)]",
        isError
          ? "border-[var(--danger)]/14 bg-[var(--danger-soft)] text-[var(--danger)]"
          : "border-[var(--brand-blue)]/14 bg-[var(--brand-blue-soft)] text-[var(--brand-blue)]",
      )}
    >
      {error ?? message}
    </div>
  );
}
