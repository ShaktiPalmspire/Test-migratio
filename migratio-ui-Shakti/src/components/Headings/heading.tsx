import { ReactNode, HTMLAttributes } from "react";

type HeadingAs = "h1" | "h2" | "h3" | "h4" | "h5" | "h6"; // You can expand this as needed

interface BaseProps {
  children: ReactNode;
  as?: HeadingAs;
}

type HeadingProps =
  | (BaseProps & HTMLAttributes<HTMLHeadingElement> & { as?: HeadingAs });

export default function Heading({
  children,
  as = "h1",
  ...props
}: HeadingProps) {
  // Dynamically render the tag using `as` prop
  const Tag = as;

  return (
    <Tag {...props}>
      {children}
    </Tag>
  );
}
