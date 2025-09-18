// components/icons/MigratioLogo.tsx
import * as React from "react";

const MigratioLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="200"
    height="60"
    viewBox="0 0 200 60"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx="30" cy="30" r="25" fill="#a1e75d" stroke="#213d34" strokeWidth="5" />
    <path
      d="M23 37 L37 23 M30 23 H37 V30"
      stroke="#213d34"
      strokeWidth="5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <text
      x="60"
      y="38"
      fontFamily="Arial, sans-serif"
      fontSize="28"
      fill="var(--migratio_black)"
      fontWeight="bold"
    >
      MIGRATIO
    </text>
  </svg>
);

export default MigratioLogo;
