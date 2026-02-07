import Link from "next/link";

interface AppLogoProps {
  href?: string;
  className?: string;
}

export function AppLogo({ href = "/", className }: AppLogoProps) {
  const content = (
    <>
      <svg
        width="44"
        height="44"
        viewBox="0 0 120 120"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <g transform="translate(15,15)">
          <rect
            x="0"
            y="20"
            width="70"
            height="50"
            rx="10"
            fill="#00CCFF"
            opacity="0.35"
          />
          <rect
            x="10"
            y="15"
            width="70"
            height="50"
            rx="10"
            fill="#00CCFF"
            opacity="0.6"
          />
          <rect
            x="20"
            y="10"
            width="70"
            height="50"
            rx="10"
            fill="#FF1493"
          />
        </g>
      </svg>
      <span className="font-semibold text-2xl">Nexum</span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`flex items-center gap-2 ${className ?? ""}`.trim()}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`.trim()}>
      {content}
    </div>
  );
}
