"use client";

import Image from "next/image";
import { useState } from "react";

/*
 * SafeImage — next/image(fill) 래퍼. 파일이 없으면(onError) 아무것도 렌더하지 않아
 * 부모의 빈 영역만 남는다(깨진 이미지 아이콘 방지). 부모는 relative + 크기 지정 필요.
 */
export default function SafeImage({
  src,
  alt,
  sizes,
  className,
  priority,
}: {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
}) {
  const [broken, setBroken] = useState(false);
  if (broken) return null;
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized
      onError={() => setBroken(true)}
      className={className}
    />
  );
}
