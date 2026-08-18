# SKKU Cafe Finder

성균관대학교 명륜·율전캠퍼스 주변의 공부하기 좋은 카페를 지도와 조건 필터로 탐색하는 웹 서비스입니다.

## 로컬 실행

Node.js 22 이상이 필요합니다.

```bash
pnpm install
pnpm dev
```

`http://localhost:3000`에서 확인할 수 있습니다.

## Vercel 배포

1. Vercel에서 `sihyun7700/skkucafe` 저장소를 가져옵니다.
2. Framework Preset은 `Next.js`, Build Command는 `next build`를 사용합니다.
3. Vercel Marketplace에서 Neon Postgres를 연결합니다.
4. Neon이 프로젝트에 추가한 `DATABASE_URL` 환경 변수를 확인합니다.
5. 배포를 다시 실행합니다.

추천 기능은 첫 API 요청 때 `recommendations` 테이블과 인덱스를 자동 생성합니다. 로컬에서 추천 기능까지 확인하려면 `.env.example`을 참고하여 `.env.local`에 Neon 연결 문자열을 설정하세요.

## 주요 명령어

- `pnpm dev`: 개발 서버 실행
- `pnpm build`: Vercel 프로덕션 빌드 검증
- `pnpm start`: 빌드된 서버 실행
- `pnpm lint`: ESLint 검사
