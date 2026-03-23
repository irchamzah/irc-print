"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LoadingAnimation from "./LoadingAnimation";

// CustomLink TERPAKAI
export default function CustomLink({ href, children, className, ...props }) {
  const [isNavigating, setIsNavigating] = useState(false);
  const currentPath = usePathname();

  return (
    <>
      {isNavigating && <LoadingAnimation />}
      <Link
        href={href}
        className={`${className} `}
        onClick={() => {
          if (currentPath !== href) {
            setIsNavigating(true);
          }
        }}
        {...props}
      >
        {children}
      </Link>
    </>
  );
}
