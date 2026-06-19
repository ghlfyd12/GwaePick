import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "accent" | "primary";
type Size = "md" | "lg";

type CTAButtonProps = {
  /** 이동 대상. 전환 동선은 항상 무료 상담 신청(#consult)으로 모인다. */
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  /** 시각적 라벨과 다른 접근성 라벨이 필요할 때 */
  "aria-label"?: string;
};

/*
 * 재사용 CTA 버튼.
 *
 * 현재 모든 CTA 는 페이지 내 앵커(#consult)로 이동하므로 의미상 "링크"다.
 * 따라서 button 이 아니라 next/link 의 <a> 로 렌더링한다. (버튼/링크 구분)
 */
const base =
  "inline-flex items-center justify-center rounded-full font-semibold text-white whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2";

const variants: Record<Variant, string> = {
  accent: "bg-accent hover:bg-accent-dark focus-visible:outline-accent",
  primary: "bg-primary hover:bg-primary-dark focus-visible:outline-primary",
};

const sizes: Record<Size, string> = {
  // min-h-12 = 48px: 모바일에서 엄지로 누르기 쉬운 최소 크기
  md: "min-h-12 px-5 text-sm",
  lg: "min-h-12 px-7 text-base sm:min-h-14",
};

export default function CTAButton({
  href,
  children,
  variant = "accent",
  size = "md",
  className = "",
  "aria-label": ariaLabel,
}: CTAButtonProps) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </Link>
  );
}
