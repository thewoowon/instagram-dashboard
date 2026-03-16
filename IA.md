가장 현실적인 결론부터 말하면, **“완전 자동 게시”가 아니라 “AI가 95% 만들고, 너는 승인만 하는 구조”**가 정답이다. 인스타는 계정/권한/API 제약이 있고, 브랜드 계정은 오발행 1번이 손실이 크다. 공식적으로 Instagram Platform은 **프로페셔널 계정(비즈니스/크리에이터)** 중심으로 동작하고, 콘텐츠 게시·인사이트·댓글 관리 등이 API로 가능하다. 다만 게시 기능은 계정/권한 세팅을 정확히 맞춰야 하고, 퍼블리싱 한도도 존재한다. ([Facebook Developers][1])

네 경우에는 계정이 2개다. **Mistakr = 신뢰/인사이트형**, **100:0LAB = 트래픽/훅형**으로 성격이 다르므로, 생성 모델은 같아도 **콘텐츠 전략과 승인 기준은 분리**해야 한다. 시스템은 하나로 묶되, 계정별 브랜드 룰셋을 따로 두는 방식이 맞다. ([Facebook Developers][2])

## 1. 권장 최종 아키텍처

```text
[Idea Sources]
- 트렌드 키워드
- 내부 아이디어 백로그
- 수동 입력 주제
- 성과 좋았던 과거 포스트 재가공

        ↓

[Planning Layer]
- 계정별 콘텐츠 캘린더 생성
- 포맷 결정 (캐러셀 / 릴스 스크립트 / 단일 이미지)
- 우선순위 점수 계산

        ↓

[AI Content Generation Layer]
- Hook 생성
- Caption 생성
- Carousel slide copy 생성
- Hashtag 초안 생성
- CTA 생성
- 댓글 고정문구 생성

        ↓

[Creative Production Layer]
- 이미지 생성
- 썸네일 생성
- 템플릿 합성
- 브랜드 룩앤필 적용

        ↓

[Quality Gate Layer]
- 금지어 검사
- 길이 검사
- 중복 검사
- 브랜드 톤 검사
- 법률/명예훼손/허위표현 룰 검사
- 계정별 score 산정

        ↓

[Approval Layer]
- 관리자 대시보드
- 미리보기
- 수정
- 승인 / 반려

        ↓

[Publishing Layer]
- 예약 큐
- Instagram API 게시
- 실패 시 재시도 / 롤백 / 알림

        ↓

[Analytics Layer]
- 인사이트 수집
- 성과 저장
- 다음 콘텐츠 생성에 피드백 반영
```

이 구조가 좋은 이유는, **생성·검수·승인·게시·학습**이 분리되어 있어서 나중에 일부만 교체 가능하기 때문이다. 예를 들어 이미지 생성기만 바꾸거나, 승인 화면만 고도화하거나, 나중에 Threads/X까지 확장해도 전체를 갈아엎지 않는다. ([Facebook Developers][1])

## 2. 인스타 운영 전제 조건

인스타 자동화에서 가장 먼저 확인해야 할 것은 기술이 아니라 **계정 타입**이다. 공식 문서 기준으로 Instagram API는 **프로페셔널 계정** 대상으로 제공되며, 게시 관리 기능은 앱과 계정 권한 구성이 전제된다. 또한 Meta는 API 게시량과 비즈니스 유스케이스 단위의 제한을 둔다. 검색 결과 기준으로, 콘텐츠 퍼블리싱은 **24시간 이동 구간 내 25회 게시 제한**이 안내되어 있다. ([Facebook Developers][3])

즉 네 시스템은 처음부터 이렇게 설계해야 한다.

* 계정은 둘 다 프로페셔널 계정으로 전환
* 앱 권한/토큰 만료 대응 포함
* 게시 실패를 전제로 재시도 큐 구성
* 일일 게시량 제한을 내부 로직에서 선반영

이걸 안 넣으면 “생성은 잘 되는데 게시 단계에서 자꾸 깨지는 시스템”이 된다. ([Facebook Developers][1])

## 3. 현실적인 기술 스택

나는 네 상황이면 이 조합을 권한다.

### 백엔드

* **FastAPI**
* Python worker
* Celery 대신 초기엔 단순 queue + cron으로 시작

### 데이터베이스

* **Supabase Postgres**
* 이유: 관리 쉬움, row level auth, dashboard 만들기 편함

### 스케줄링

* GitHub Actions / Railway cron / Cloud Run jobs 중 하나
* 초기는 Railway가 가장 단순

### 저장소

* 이미지/영상 산출물: Supabase Storage 또는 S3

### AI

* 텍스트: GPT 계열
* 이미지: 이미지 생성 모델 + 브랜드 템플릿 렌더러
* 템플릿 합성: Python Pillow 또는 Node canvas

### 프론트 대시보드

* Next.js admin
* 승인/반려/수정/예약상태 확인

이 조합이 좋은 이유는 **구현 속도 > 운영 편의 > 확장성** 균형이 좋기 때문이다. 네가 지금 바로 만들려는 단계에서는 쿠버네티스나 과한 메시지 브로커는 오버엔지니어링이다. 이건 SaaS를 바로 파는 단계가 아니라, **네 계정 2개를 안정적으로 굴리는 단계**이기 때문이다. 이 부분은 내 설계 판단이다. Meta API 제약 자체는 공식 문서 기준으로 반영했다. ([Facebook Developers][1])

## 4. 서비스 경계: 무엇을 자동화하고 무엇을 인간이 잡을 것인가

핵심은 여기다.

### AI가 맡는 것

* 주제 후보 생성
* 포스트 초안 작성
* 캐러셀 슬라이드 문안
* 해시태그 초안
* 이미지 프롬프트 생성
* 썸네일 카피
* A/B 버전 3개 생성
* 예약 시간 추천

### 인간이 맡는 것

* 최종 승인
* 법적 리스크 판단
* 브랜드 방향성 최종 체크
* 민감한 표현 수정
* 이벤트성/시의성 게시 결정

이유는 명확하다. 인스타 API로 게시는 가능해도, **좋은 운영은 API가 아니라 편집권**에서 나온다. 특히 100:0LAB처럼 사고/판정/법률 뉘앙스가 섞이는 계정은 허위 단정, 과장, 오인 가능성을 반드시 인간이 잘라야 한다. Mistakr도 특정 회사/창업가 실패 서사를 다룰 경우 표현 리스크가 있다. 이 부분은 법률 자문은 아니지만, 운영 리스크 관점에서 매우 중요하다. ([Facebook Developers][1])

## 5. 데이터 모델 설계

최소 테이블은 이렇게 가면 된다.

### accounts

* id
* brand_name
* instagram_account_id
* status
* posting_limit_policy
* brand_rules_json

### content_ideas

* id
* account_id
* source_type
* topic
* angle
* priority_score
* status

### post_drafts

* id
* account_id
* idea_id
* format_type
* hook
* caption
* hashtags
* cta
* risk_score
* quality_score
* approval_status

### creative_assets

* id
* post_draft_id
* asset_type
* storage_url
* prompt
* preview_url

### publish_jobs

* id
* post_draft_id
* scheduled_at
* publish_status
* retry_count
* meta_publish_id
* error_message

### post_metrics

* id
* post_draft_id
* impressions
* reach
* likes
* comments
* saves
* shares
* profile_visits
* collected_at

Meta는 프로페셔널 계정 인사이트 접근을 지원하므로, 이 테이블 구조를 두면 **“성과 기반 재생성 루프”**를 만들 수 있다. 즉, 단순 예약 툴이 아니라 **성능 최적화 엔진**으로 진화한다. ([Facebook Developers][2])

## 6. 계정별 생성 파이프라인

### A. Mistakr

Mistakr는 트래픽형 계정이 아니라 **전문성 + 사례 기반 신뢰형**이 더 맞다.

콘텐츠 타입:

* 실패한 스타트업 사례 요약
* 실패 원인 3분해
* “이 아이템이 망한 이유”
* 창업자가 착각한 PMF 신호
* 지표 해석
* 리스크 프레임워크

생성 규칙:

* 자극보다 통찰 우선
* 숫자/구조/원인 분해 강조
* “배울 점”이 반드시 들어갈 것
* 단정 표현 최소화

### B. 100:0LAB

여기는 훨씬 공격적으로 간다.

콘텐츠 타입:

* “이 사고 100:0일까?”
* 3장 캐러셀 퀴즈
* 블랙박스 장면 요약
* 결과 공개
* 운전자 실수 포인트
* 보험/과실비율 오해 정리

생성 규칙:

* 첫 장 훅 강하게
* 1초 이해
* 결과 공개형
* 댓글 유도
* 단, 법적 결론처럼 단정 금지

즉 하나의 생성 API를 쓰더라도, 내부적으로는 `brand_rules_json`과 `prompt_profile`이 달라야 한다. 이게 없으면 두 계정이 같은 톤으로 오염된다. ([Facebook Developers][1])

## 7. 실제 워크플로우

가장 현실적인 배치는 아래다.

### 매일 새벽

1. 아이디어 후보 20개 생성
2. 각 계정별 상위 5개 선별
3. 포스트 초안 생성
4. 이미지 프롬프트 생성
5. 미리보기 렌더링
6. 품질 점수 계산
7. 승인 대기열에 적재

### 점심 전

8. 너는 관리자 화면에서 승인/반려만 함
9. 필요시 카피 1줄 수정

### 오후

10. 예약 큐가 정해진 시간에 게시
11. 실패 시 재시도
12. 성공 시 post_id 저장

### 다음 날

13. 인사이트 수집
14. 성과 상위 포스트의 훅/길이/포맷 패턴 분석
15. 다음 배치 생성에 반영

공식적으로 Instagram API는 게시와 인사이트 수집을 지원하므로, 이 루프는 충분히 현실적이다. 댓글 관리도 API 기반 자동화 여지가 있다. ([Facebook Developers][4])

## 8. 게시 엔진 설계

게시 부분은 생성보다 더 신경 써야 한다.

### publish service 내부 단계

1. 승인된 draft 조회
2. scheduled_at 도래 여부 확인
3. 일일 게시 한도 확인
4. asset 유효성 검사
5. Instagram publish API 호출
6. 응답 저장
7. 성공 시 상태 전환
8. 실패 시 retry + 알림

### 필수 예외 처리

* access token 만료
* 권한 박탈
* asset 포맷 오류
* rate limiting
* 동일 draft 중복 게시 방지
* 네트워크 타임아웃

Meta는 플랫폼/비즈니스 유스케이스 기준의 제한을 두고, 댓글/콘텐츠 관련 API에서도 rate limiting을 피하려면 웹훅 활용을 권장한다. 따라서 polling 남발보다 event/webhook 중심 설계가 더 안전하다. ([Facebook Developers][5])

## 9. 승인 대시보드 화면 구성

너는 “마지막 준비까지 끌어올리고 배포 컨펌만” 하고 싶다고 했으니, 관리자 화면이 핵심이다. 이 화면이 허접하면 전체 자동화의 의미가 없다.

### 승인 화면에 꼭 있어야 할 것

* 계정 선택
* 콘텐츠 포맷 선택
* 썸네일 미리보기
* 캡션 전체 보기
* 해시태그 접기/펼치기
* 위험 점수 표시
* 브랜드 톤 점수 표시
* 수정 후 재생성 버튼
* 승인 / 반려 / 예약변경 버튼

### 추가로 있으면 좋은 것

* “Mistakr 톤으로 다시”
* “100:0LAB 더 자극적으로”
* “길이 20% 축소”
* “슬라이드 1장 더”
* “근거성 표현으로 완화”

즉 대시보드는 CMS가 아니라 **AI 편집 콘솔**이어야 한다.

## 10. 프롬프트 시스템

프롬프트를 매번 하드코딩하면 금방 무너진다. 반드시 계층화해야 한다.

### system prompt

* 계정 브랜드 세계관
* 금지 표현
* 말투
* CTA 스타일

### task prompt

* 캐러셀 생성
* 릴스 대본 생성
* 댓글 고정문구 생성

### validator prompt

* 과장 여부
* 중복 여부
* 명예훼손 가능성
* 신뢰도 저하 표현 검사

### optimizer prompt

* 상위 성과 포스트 특징 반영
* 훅 강화
* 저장 유도 강화

이렇게 나눠야 “생성기”와 “검사기”를 분리할 수 있다. 그래야 AI가 쓴 문장을 AI가 다시 감시하게 만들 수 있다.

## 11. 추천 구현 순서

너는 지금 바로 만들 거라 했으니, 순서는 이렇게 가는 게 맞다.

### Phase 1 — 일단 돌아가게

* 계정 연결
* 아이디어 생성
* 캡션 생성
* 이미지 업로드
* 승인 화면
* 수동 게시 버튼

### Phase 2 — 반자동

* 예약 게시
* 실패 재시도
* 인사이트 수집
* 기본 대시보드

### Phase 3 — 고도화

* 성과 기반 프롬프트 최적화
* 댓글 추천 답변
* 자동 리포트
* A/B 테스트

### Phase 4 — 사실상 운영 엔진

* 계정별 학습 루프
* 훅 유형 자동 선택
* 포맷 자동 추천
* 저성과 포스트 자동 리라이트

이 순서가 중요한 이유는, 처음부터 “완전자율 에이전트”처럼 만들면 100% 삐끗한다. 먼저 **게시 파이프라인 신뢰성**을 확보해야 한다.

## 12. 현실적인 배포 구조

이 구성이 가장 무난하다.

* **Next.js**: admin dashboard
* **FastAPI**: generation + validation + publishing API
* **Postgres/Supabase**: drafts/jobs/metrics 저장
* **Storage**: 이미지/영상 저장
* **Cron worker**: 정기 생성/수집
* **Webhook listener**: 댓글/상태 이벤트 처리

배포는:

* Next.js → Vercel
* FastAPI → Railway 또는 Cloud Run
* DB/Storage → Supabase

이유는 속도와 유지보수다. 지금 네 규모에서는 AWS 풀셋보다 이쪽이 훨씬 빠르고, 나중에 이관도 어렵지 않다.

## 13. 보안과 운영 리스크

이건 반드시 넣어라.

* Meta access token 암호화 저장
* 관리자 승인 이력 로그
* 게시 변경 감사 로그
* 삭제/수정 이벤트 기록
* 프롬프트 버전 관리
* asset 원본 보관
* 예외 발생 시 Slack/Telegram 알림

왜냐하면 나중에 “왜 이 문구로 올라갔지?”가 반드시 생긴다. 그때 **생성 버전, 검수 결과, 승인자, 게시 시각**이 추적되어야 한다.

## 14. 네 상황 기준 최종 추천안

너한테는 이게 최적이다.

### 최종 선택

* **Frontend**: Next.js admin
* **Backend**: FastAPI
* **DB**: Supabase Postgres
* **Storage**: Supabase Storage
* **AI**: 텍스트 생성 모델 + 이미지 생성 모델
* **Scheduler**: Railway cron
* **Publishing**: Instagram API
* **Analytics**: Instagram insights pull
* **Approval model**: human-in-the-loop

### 핵심 원칙

* 완전 자동 금지
* 승인 없이는 게시 금지
* 계정별 프롬프트 완전 분리
* 성과 데이터 기반 재생성
* 게시 엔진은 idempotent 하게

이 구조면 네가 원하는 **“클라우드에서 돌리고, 마지막 승인만 하는 시스템”**에 가장 가깝다. 그리고 잘 만들면 단순 내부툴이 아니라, 나중에 **멀티 브랜드 SNS 운영 SaaS**의 코어가 된다. ([Facebook Developers][1])

**DB 스키마 + FastAPI 엔드포인트 명세 + 관리자 화면 IA**

[1]: https://developers.facebook.com/products/instagram/apis/?utm_source=chatgpt.com "Instagram APIs | Facebook for Developers"
[2]: https://developers.facebook.com/docs/instagram-platform/insights/?utm_source=chatgpt.com "Insights - Instagram Platform - Meta for Developers"
[3]: https://developers.facebook.com/docs/instagram-platform/overview/?utm_source=chatgpt.com "Overview - Instagram Platform - Documentation"
[4]: https://developers.facebook.com/docs/instagram-platform/?utm_source=chatgpt.com "Instagram Platform - Meta for Developers - Facebook"
[5]: https://developers.facebook.com/docs/graph-api/overview/rate-limiting/?utm_source=chatgpt.com "Rate Limits - Graph API - Meta for Developers"
