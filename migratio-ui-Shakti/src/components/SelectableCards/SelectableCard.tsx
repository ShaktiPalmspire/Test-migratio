import Image from "next/image";

interface SelectableCardProps {
  title: string;
  subtitle: string;
  logo: string;
  isSelected: boolean;
  onSelect: () => void;
  comingSoon?: boolean;
}

export default function SelectableCard({
  title,
  subtitle,
  logo,
  isSelected,
  onSelect,
  comingSoon = false,
}: SelectableCardProps) {
  return (
    <div
      onClick={() => {
        if (!comingSoon) onSelect();
      }}
      className={`relative max-w-[260px] w-full rounded-2xl border p-6 transition-all duration-300 ${
        isSelected
          ? "border-[var(--migratio_border)] bg-[var(--migratio_primary-50)]"
          : "border-[var(--migratio_border)] bg-[var(--migratio_white)]"
      } ${comingSoon ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-[var(--migratio_primary)] hover:shadow-[var(--migratio_box_shadow)]"}`}
    >
      {comingSoon && (
        <div
          className="absolute top-2 right-2 rounded-md px-2 py-1 text-xs"
          style={{
            backgroundColor: "var(--migratio_gray)",
            color: "var(--white_color)",
            fontFamily: "var(--font-secondary)",
            fontSize: "12px",
            fontWeight: "var(--font-weight-medium)",
          }}
        >
          Coming Soon
        </div>
      )}
      <div className="flex flex-col h-full justify-between items-start gap-3">
        <Image src={logo} alt={`${title} Logo`} width={40} height={40} />
        <div>
          <div className="mb-1 heading">
            <h3
            className="text-margin-zero"
            style={{
              fontFamily: "var(--font-primary)",
              fontSize: "var(--font-size-h4)",
              fontWeight: "var(--font-weight-medium)",
              lineHeight: "var(--line-height-heading)",
              color: "var(--black_color)",
            }}
          >
            {title}
          </h3>
          </div>
          <p
            style={{
              fontFamily: "var(--font-secondary)",
              fontSize: "var(--font-size-p-small)",
              fontWeight: "var(--font-weight-normal)",
              lineHeight: "var(--line-height-p)",
              color: "var(--black_color)",
              opacity: 0.6,
              margin: 0,
            }}
          >
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
