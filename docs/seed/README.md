# 커뮤니티 시드 데이터 (메인 페이지 시연용)

메인 페이지에 고수 홍보 카드, 팁 사진 카드, 커뮤니티 인기글을 보여 주려면 커뮤니티 글과 사진이 있어야 합니다.
지금 `data.sql`에는 게시글이 없어서, 서버를 재시작하면 이 섹션들이 모두 비어 보입니다.

## 할 일

### 1. SQL 붙이기

[`community-seed.sql`](community-seed.sql) 내용을 백엔드 `src/main/resources/data.sql` **맨 끝**에 그대로 붙여 넣습니다.

- 기존 시드의 회원, 카테고리, 지역 데이터를 참조하므로 반드시 맨 끝이어야 합니다.
- H2 문법(`DATEADD`, `VALUES ... AS v(...)`)입니다. 로컬 프로필(H2 메모리 DB)에서 쓰는 걸 전제로 했습니다.
- 검증: 백엔드 `dev` 브랜치(커밋 `92dd717`) 복사본에 붙여서 서버를 띄웠고, 에러 없이 시작되는 것과 `/api/public/posts` 응답을 확인했습니다.

들어가는 데이터:

| 항목 | 개수 | 내용 |
|---|---|---|
| 회원 | 8 | 고수 6명(고수 프로필 없음), 고객 2명. 비밀번호는 기존 시드 계정과 같음 |
| 홍보 글 | 8 | 사진 1~2장씩 |
| 팁 글 | 8 | 사진 1장씩 |
| 질문 글 | 8 | 댓글 11개, 좋아요 |
| 모집 글 | 3 | 사진 없음 |
| 사진 | 20 | `file` 행과 `post_images` 연결 (사진은 Supabase에 이미 있음) |

- 좋아요는 실제 `post_like` 행으로 넣었고, 마지막에 `comment_count`와 `like_count`를 실제 행 개수로 다시 계산합니다.
- 조회 수는 숫자로 직접 넣었습니다.
- 작성 시각은 지금 기준으로 몇 시간~며칠 전으로 흩어 두었습니다.

### 2. 사진 (이미 올려 둠, 할 일 없음)

사진 20장은 로컬 서버의 업로드 API(`/api/files`)로 Supabase **public 버킷(`efy-public`)** 에 올려 두었습니다. SQL의 `storage_path`가 그 경로(UUID 파일 이름)를 가리킵니다.

- 로컬 DB는 메모리라서 재시작하면 비워지지만, 사진은 Supabase에 남아 있으므로 시드 SQL이 같은 경로를 다시 연결합니다.
- 같은 `application-secret.properties`를 쓰는 팀원이면 누구의 로컬에서도 같은 사진이 보입니다.
- 버킷에서 이 파일들을 지우면 썸네일이 깨집니다.

**출처**: 모두 [Unsplash](https://unsplash.com/license) 무료 라이선스 사진입니다(상업적 사용 가능, 출처 표기 의무 없음). 1200×900으로 잘라 받았습니다.

| 시드 이름 | 내용 | Unsplash 사진 |
|---|---|---|
| `promo-moving-1` | 상자와 식물이 가득한 방 | [photo-1730154838368-c37b1fdebcf6](https://images.unsplash.com/photo-1730154838368-c37b1fdebcf6) |
| `promo-moving-2` | 테이프 붙은 골판지 상자 더미 | [photo-1766040923580-16ad32fae8b4](https://images.unsplash.com/photo-1766040923580-16ad32fae8b4) |
| `promo-clean-1` | 빈 거실 | [photo-1783125127015-bf513362480b](https://images.unsplash.com/photo-1783125127015-bf513362480b) |
| `promo-clean-2` | 흰색 주방 | [photo-1556911220-bff31c812dba](https://images.unsplash.com/photo-1556911220-bff31c812dba) |
| `promo-boiler-1` | 금속 배관 | [photo-1618840626133-54463084a141](https://images.unsplash.com/photo-1618840626133-54463084a141) |
| `promo-interior-1` | 흰 캐비닛 주방 | [photo-1556912173-3bb406ef7e77](https://images.unsplash.com/photo-1556912173-3bb406ef7e77) |
| `promo-interior-2` | 욕실 세면대 | [photo-1629079447777-1e605162dc8d](https://images.unsplash.com/photo-1629079447777-1e605162dc8d) |
| `promo-snap-1` | 손잡은 신랑 신부 | [photo-1520854221256-17451cc331bf](https://images.unsplash.com/photo-1520854221256-17451cc331bf) |
| `promo-snap-2` | DSLR 카메라 렌즈 | [photo-1512790182412-b19e6d62bc39](https://images.unsplash.com/photo-1512790182412-b19e6d62bc39) |
| `promo-english-1` | 펼친 영어사전 | [photo-1543165796-5426273eaab3](https://images.unsplash.com/photo-1543165796-5426273eaab3) |
| `promo-dev-1` | 코드가 띄워진 노트북 | [photo-1498050108023-c5249f4df085](https://images.unsplash.com/photo-1498050108023-c5249f4df085) |
| `promo-aircon-1` | 에어컨 실외기 | [photo-1718203862467-c33159fdc504](https://images.unsplash.com/photo-1718203862467-c33159fdc504) |
| `tip-clean` | 스프레이 세제 | [photo-1563453392212-326f5e854473](https://images.unsplash.com/photo-1563453392212-326f5e854473) |
| `tip-boiler` | 성에 낀 창문 | [photo-1766871348719-87309e0fb740](https://images.unsplash.com/photo-1766871348719-87309e0fb740) |
| `tip-packing` | 이삿짐 상자 | [photo-1600725935160-f67ee4f6084a](https://images.unsplash.com/photo-1600725935160-f67ee4f6084a) |
| `tip-floor` | 헤링본 원목 마루 | [photo-1761053130711-2515ef532bb5](https://images.unsplash.com/photo-1761053130711-2515ef532bb5) |
| `tip-wedding` | 햇살 드는 공원 | [photo-1560706834-c8b400d29d37](https://images.unsplash.com/photo-1560706834-c8b400d29d37) |
| `tip-words` | 알파벳 카드 | [photo-1785780224428-7b690d3d58bd](https://images.unsplash.com/photo-1785780224428-7b690d3d58bd) |
| `tip-docs` | 와이어프레임 스케치 | [photo-1790861286837-3580e5c91683](https://images.unsplash.com/photo-1790861286837-3580e5c91683) |
| `tip-aircon` | 벽걸이 실외기 | [photo-1776860150250-757406c52438](https://images.unsplash.com/photo-1776860150250-757406c52438) |

## 알아 둘 점

- **시드 고수 6명은 고수 프로필이 없습니다.** 글 작성자로만 씁니다. 공개 고수 프로필 화면으로 연결하려면 `expert_profile` 시드도 추가해야 합니다.
- **로컬은 H2 메모리 DB라서** 서버를 재시작할 때마다 이 데이터가 다시 들어갑니다.
- **운영(prod) 프로필은 `spring.sql.init.mode=never`** 이므로 이 시드는 운영 DB에 들어가지 않습니다.
- **글 제목이 이미지 연결 키입니다.** 시드 SQL 안에서 글 제목으로 사진과 댓글을 연결하므로, 글 제목을 바꾸면 아래쪽 `VALUES` 목록의 제목도 같이 바꿔야 합니다.
