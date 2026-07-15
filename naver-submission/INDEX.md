# 네이버 수집 요청 배치 (우선순위 정렬)

- **전체 URL 수**: 6,744개
- **배치 파일 수**: 135개 (배치당 50개)
- **예상 소요일수**: 약 135일 (하루 1파일)
- **도메인**: https://xn--l89av43blfdm0cm7d.com
- **범위(초기)**: Tier 0~2 전량 + Tier 3~4 상위 5,000개 (이후 `TIER34_CAP` 상수만 늘려 확장)
- **이번 컷오프에서 제외(확장 예정)**: 지역 랜딩 122개 + 전국 학교×과목 등 — Tier 3(그 외 서울)이 상한을 채워 Tier 4는 이번 회차 미포함. `TIER34_CAP`을 늘리면 순서대로 편입됩니다.

## Tier별 URL 수
| Tier | URL 수 |
|---|---:|
| Tier 0 — 허브/상위 탐색 | 16 |
| Tier 1 — 강남·양천·송파 지역×과목 | 704 |
| Tier 2 — 위 3구 학교×과목(고→중) | 1,024 |
| Tier 3 — 그 외 서울 지역×과목 | 5,000 |
| Tier 4 — 지역 랜딩 + 전국 학교(상위) | 0 |
| **합계** | **6,744** |

## 운영 방법
1. 매일 배치 파일 하나(예: `day-001.txt`)를 엽니다.
2. 네이버 서치어드바이저 → **요청 → 웹 페이지 수집** 에 파일 안의 URL을 **한 줄씩** 붙여넣어 제출합니다.
3. 파일 하나(50개)를 모두 제출했으면, 아래 체크리스트에서 해당 day 파일에 체크합니다.
4. 다음 날 다음 번호 파일로 이어서 진행합니다. (재생성 스크립트: `npx tsx scripts/generate-naver-submission-batches.ts`)

## 제출 체크리스트
- [x] day-001.txt
- [ ] day-002.txt
- [ ] day-003.txt
- [ ] day-004.txt
- [ ] day-005.txt
- [ ] day-006.txt
- [ ] day-007.txt
- [ ] day-008.txt
- [ ] day-009.txt
- [ ] day-010.txt
- [ ] day-011.txt
- [ ] day-012.txt
- [ ] day-013.txt
- [ ] day-014.txt
- [ ] day-015.txt
- [ ] day-016.txt
- [ ] day-017.txt
- [ ] day-018.txt
- [ ] day-019.txt
- [ ] day-020.txt
- [ ] day-021.txt
- [ ] day-022.txt
- [ ] day-023.txt
- [ ] day-024.txt
- [ ] day-025.txt
- [ ] day-026.txt
- [ ] day-027.txt
- [ ] day-028.txt
- [ ] day-029.txt
- [ ] day-030.txt
- [ ] day-031.txt
- [ ] day-032.txt
- [ ] day-033.txt
- [ ] day-034.txt
- [ ] day-035.txt
- [ ] day-036.txt
- [ ] day-037.txt
- [ ] day-038.txt
- [ ] day-039.txt
- [ ] day-040.txt
- [ ] day-041.txt
- [ ] day-042.txt
- [ ] day-043.txt
- [ ] day-044.txt
- [ ] day-045.txt
- [ ] day-046.txt
- [ ] day-047.txt
- [ ] day-048.txt
- [ ] day-049.txt
- [ ] day-050.txt
- [ ] day-051.txt
- [ ] day-052.txt
- [ ] day-053.txt
- [ ] day-054.txt
- [ ] day-055.txt
- [ ] day-056.txt
- [ ] day-057.txt
- [ ] day-058.txt
- [ ] day-059.txt
- [ ] day-060.txt
- [ ] day-061.txt
- [ ] day-062.txt
- [ ] day-063.txt
- [ ] day-064.txt
- [ ] day-065.txt
- [ ] day-066.txt
- [ ] day-067.txt
- [ ] day-068.txt
- [ ] day-069.txt
- [ ] day-070.txt
- [ ] day-071.txt
- [ ] day-072.txt
- [ ] day-073.txt
- [ ] day-074.txt
- [ ] day-075.txt
- [ ] day-076.txt
- [ ] day-077.txt
- [ ] day-078.txt
- [ ] day-079.txt
- [ ] day-080.txt
- [ ] day-081.txt
- [ ] day-082.txt
- [ ] day-083.txt
- [ ] day-084.txt
- [ ] day-085.txt
- [ ] day-086.txt
- [ ] day-087.txt
- [ ] day-088.txt
- [ ] day-089.txt
- [ ] day-090.txt
- [ ] day-091.txt
- [ ] day-092.txt
- [ ] day-093.txt
- [ ] day-094.txt
- [ ] day-095.txt
- [ ] day-096.txt
- [ ] day-097.txt
- [ ] day-098.txt
- [ ] day-099.txt
- [ ] day-100.txt
- [ ] day-101.txt
- [ ] day-102.txt
- [ ] day-103.txt
- [ ] day-104.txt
- [ ] day-105.txt
- [ ] day-106.txt
- [ ] day-107.txt
- [ ] day-108.txt
- [ ] day-109.txt
- [ ] day-110.txt
- [ ] day-111.txt
- [ ] day-112.txt
- [ ] day-113.txt
- [ ] day-114.txt
- [ ] day-115.txt
- [ ] day-116.txt
- [ ] day-117.txt
- [ ] day-118.txt
- [ ] day-119.txt
- [ ] day-120.txt
- [ ] day-121.txt
- [ ] day-122.txt
- [ ] day-123.txt
- [ ] day-124.txt
- [ ] day-125.txt
- [ ] day-126.txt
- [ ] day-127.txt
- [ ] day-128.txt
- [ ] day-129.txt
- [ ] day-130.txt
- [ ] day-131.txt
- [ ] day-132.txt
- [ ] day-133.txt
- [ ] day-134.txt
- [ ] day-135.txt
