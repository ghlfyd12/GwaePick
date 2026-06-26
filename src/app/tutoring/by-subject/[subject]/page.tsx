import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SubjectDetail from "@/components/SubjectDetail";
import { subjects, subjectBySlug } from "@/data/subjects";

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
  const title = `${subj.label} 과외 — 1:1 맞춤 개인과외 | 지식의참견`;
  const description = `${subj.label} 1:1 맞춤 개인과외. 직접 가르쳐 온 선생님이 학생 수준에 맞는 ${subj.label} 선생님을 연결해 드립니다. 진단부터 내신·서술형까지 단계별로 관리합니다.`;
  const canonical = `/tutoring/by-subject/${subj.slug}`;
  return {
    title: { absolute: title },
    description,
    keywords: [`${subj.label}과외`, `${subj.label} 1:1 과외`, `${subj.label} 개인과외`, `${subj.label} 내신`],
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject } = await params;
  const subj = subjectBySlug[slugKey(subject)];
  if (!subj) notFound();
  return <SubjectDetail subject={subj} />;
}
