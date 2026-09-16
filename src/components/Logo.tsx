import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  size?: "sm" | "md" | "lg" | "xl";
  hideText?: boolean;
  to?: string;
}

const sizeConfig = {
  sm: {
    icon: "h-7 w-auto",
    text: "text-lg",
    gap: "gap-2",
  },
  md: {
    icon: "h-8 w-auto",
    text: "text-xl",
    gap: "gap-2.5",
  },
  lg: {
    icon: "h-10 w-auto",
    text: "text-2xl",
    gap: "gap-3",
  },
  xl: {
    icon: "h-12 w-auto",
    text: "text-3xl",
    gap: "gap-3.5",
  },
};

export function Logo({
  className,
  iconClassName,
  textClassName,
  size = "md",
  hideText = false,
  to = "/",
}: LogoProps) {
  const config = sizeConfig[size];

  const content = (
    <div className={cn("inline-flex items-center select-none", config.gap, className)}>
      <img
        src="/logo.png"
        alt="StudyQadam Icon"
        className={cn(config.icon, "object-contain shrink-0", iconClassName)}
      />
      {!hideText && (
        <span
          className={cn(
            "font-display font-bold tracking-tight leading-none flex items-center",
            config.text,
            textClassName
          )}
        >
          <span className="text-[#993750] dark:text-rose-400">Study</span>
          <span className="text-[#E12C35] dark:text-rose-500">Qadam</span>
        </span>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
        {content}
      </Link>
    );
  }

  return content;
}

export default Logo;
