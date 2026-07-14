import React from "react";
import { ArrowRight, Link, X, Search, LucideProps } from "lucide-react";

export function IconArrowRight({ size = 16, className, ...props }: LucideProps) {
  return <ArrowRight size={size} className={className} {...props} />;
}

export function IconLink({ size = 16, className, ...props }: LucideProps) {
  return <Link size={size} className={className} {...props} />;
}

export function IconX({ size = 16, className, ...props }: LucideProps) {
  return <X size={size} className={className} {...props} />;
}

export function IconSearch({ size = 16, className, ...props }: LucideProps) {
  return <Search size={size} className={className} {...props} />;
}
