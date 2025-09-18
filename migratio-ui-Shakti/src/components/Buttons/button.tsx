import { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "with_arrow" | "error";
type ButtonAs = "button" | "link";

interface BaseProps {
  children: ReactNode;
  variant?: ButtonVariant;
  as?: ButtonAs;
}

type ButtonProps =
  | (BaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { as?: "button" })
  | (BaseProps & AnchorHTMLAttributes<HTMLAnchorElement> & { as: "link"; href: string });

export default function Button({
  children,
  variant = "primary",
  as = "button",
  ...props
}: ButtonProps) {
  const className = variant;

  if (as === "link") {
    const { href, ...rest } = props as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a href={href} className={className} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <button className={className} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}