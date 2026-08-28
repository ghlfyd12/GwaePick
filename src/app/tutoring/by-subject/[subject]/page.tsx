import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SubjectDetail from "@/components/SubjectDetail";
import JsonLd from "@/components/JsonLd";
import { subjects, subjectBySlug } from "@/data/subjects";
import { buildSubjectFaq } from "@/data/subjectDetailCopy";
import {
  buildSubjectMeta,
  serviceJsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
} from "@/lib/seo";

/*
 * 과목 단독 상세 — /tutoring/by-subject/[subject](영문 slug).
 * subjects.ts 8과목만 정적 생성(dynamicParams=false → 그 외 slug 는 404).
 */
export const dynamicParams = false;

const slugKey = (s: string) => decodeURIComponent(s).normalize("NFC");

export function generateStaticParams() {
  return subjects.map((s) => ({ subject: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subject: string }>;
}): Promise<Metadata> {
  const { subject } = await params;
  const subj = subjectBySlug[slugKey(subject)];
  if (!subj) return {};
  return buildSubjectMeta({
    subjectLabel: subj.label,
    subjectSlug: subj.slug,
    canonicalPath: `/tutoring/by-subject/${subj.slug}`,
  });
}

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject } = await params;
  const subj = subjectBySlug[slugKey(subject)];
  if (!subj) notFound();

  const canonical = `/tutoring/by-subject/${subj.slug}`;
  const jsonLd = [
    serviceJsonLd({ subjectLabel: subj.label, canonicalPath: canonical }),
    breadcrumbJsonLd([
      { name: "홈", path: "/" },
      { name: "과목별 과외", path: "/tutoring/by-subject" },
      { name: `${subj.label}과외` },
    ]),
    // FAQPage — SubjectDetail 이 렌더링하는 Q&A(buildSubjectFaq)와 동일 소스.
    faqJsonLd(buildSubjectFaq(subj.label)),
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <SubjectDetail subject={subj} />
    </>
  );
}
