import Image from "next/image";
import Button from "../../components/Buttons/button";

interface CardProps {
  logo: string;
  title: string;
  subtitle: string;
  status: string;
  connected: boolean;
  connectedDate: string;
  dataSyncStatus: string;
  portalId?: string | number; // new prop
  onReconnect?: () => void;
  onDisconnect?: () => void;
  redirect: () => void;
}

export default function Card({
  title,
  subtitle,
  logo,
  connected,
  dataSyncStatus,
  portalId, // new prop
  onDisconnect,
  redirect,
}: CardProps) {
  return (
    <div className="rounded-2xl card_border p-6 max-w-[336px] w-[100%] transition hover:transition hover:border-[var(--migratio_primary)] hover:shadow-[var(--migratio_box_shadow)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src={`${logo}`}
            alt={`${title} Logo`}
            width={40}
            height={40}
            className="rounded-md"
          />
          <div>
            <h3
              className="text-margin-zero text-[var(--black_color)]"
              style={{
                fontSize: "var(--font-size-h4)",
                lineHeight: "var(--line-height-heading)",
              }}
            >
              {title}
            </h3>
            <p
              className="text-[var(--migratio_text)] text-margin-zero opacity-60"
              style={{
                fontSize: "var(--font-size-p-small)",
                lineHeight: "var(--line-height-p)",
              }}
            >
              {subtitle}
            </p>
          </div>
        </div>
        <div>
          {connected && portalId ? (
            // Show the new checkmark SVG
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-circle-check-big w-4 h-4 text-green-500"
              aria-hidden="true"
            >
              <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
              <path d="m9 11 3 3L22 4"></path>
            </svg>
          ) : (
            // Show the original alert SVG
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="lucide lucide-circle-x w-4 h-4 text-red-500"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="m15 9-6 6"></path>
              <path d="m9 9 6 6"></path>
            </svg>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <div
          className="flex justify-between text-[var(--black_color)]"
          style={{ fontSize: "var(--font-size-p)" }}
        >
          <span>Status</span>
          <span
            className={`rounded-md px-3 py-1 text-xs ${
              connected
                ? "bg-green-200 text-green-800"
                : "bg-red-100 text-[var(--migratio_error)]"
            }`}
          >
            {connected ? "Connected" : "Not Connected"}
          </span>
        </div>
        <div
          className="flex justify-between text-[var(--black_color)]"
          style={{ fontSize: "var(--font-size-p)" }}
        >
          <span>Portal Id</span>
          <span>{connected && portalId ? portalId : "-"}</span>
        </div>
        <div
          className="flex justify-between text-[var(--black_color)]"
          style={{ fontSize: "var(--font-size-p)" }}
        >
          <span>Data Sync</span>
          <span>{dataSyncStatus}</span>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end">
        {connected ? (
          <Button variant="error" onClick={() => onDisconnect && onDisconnect()}>
            Disconnect
          </Button>
        ) : (
          <Button variant="primary" onClick={redirect}>
            Connect
          </Button>
        )}
      </div>
    </div>
  );
}
