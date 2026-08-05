"use client";

import { useEffect } from "react";
import { captureUtm } from "@/lib/utm";

/*
 * 레이아웃 수준에서 UTM 을 1회 캡처(first-touch)하는 마운트 전용 컴포넌트.
 * 화면에 아무것도 그리지 않는다(null 반환). 루트 layout 의 <body> 에 배치한다.
 */
export default function UtmCapture() {
  useEffect(() => {
    captureUtm();
  }, []);
  return null;
}
