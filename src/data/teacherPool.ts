/**
 * 호환용 별칭(alias) — 실제 데이터는 teachers.ts 단일 소스에 있다.
 *
 * 과거 작업에서 teacherPool.ts 로 분리했던 44명 데이터를 teachers.ts 로 통합했다.
 * 기존 import 경로(@/data/teacherPool)를 깨지 않도록 그대로 재노출한다.
 * 새 코드는 가급적 "@/data/teachers" 에서 직접 import 할 것.
 */
export * from "./teachers";
