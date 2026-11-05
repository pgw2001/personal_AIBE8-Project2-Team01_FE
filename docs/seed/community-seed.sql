-- =====================================================================
-- 커뮤니티 시드 데이터 (메인 페이지 시연용)
-- 백엔드 src/main/resources/data.sql 맨 끝에 그대로 붙여 넣는다.
-- H2(로컬) 문법 기준. 기존 시드의 member·second_category·second_region 데이터가 먼저 들어가 있어야 한다.
--
-- 들어가는 것
--   1) 시드용 고수 6명 · 고객 2명 (비밀번호는 기존 시드 계정과 같음, 고수 프로필은 없음)
--   2) 게시글 27개: 홍보 8 · 팁 8 · 질문 8 · 모집 3
--   3) 사진 파일 20개 (file 테이블 행) + 게시글 연결(post_images)
--   4) 질문 글 댓글, 좋아요, 조회 수
--
-- 사진: Unsplash 사진 20장을 Supabase public 버킷(efy-public)에 올려 두었다. 출처는 docs/seed/README.md 참고.
-- =====================================================================

-- 1) 시드 회원 -----------------------------------------------------------
INSERT INTO member (email, password, nickname, phone, role, created_at, token_version)
VALUES ('seed-clean@example.com', '$2a$10$N8on.wPrFPr5oauwmXJQeeZoSnGoNxkC6q4I7eHMxNy88fcZdaO6C', '깔끔클린', '01070000001', 'EXPERT', CURRENT_TIMESTAMP, 0),
       ('seed-plumb@example.com', '$2a$10$N8on.wPrFPr5oauwmXJQeeZoSnGoNxkC6q4I7eHMxNy88fcZdaO6C', '바른설비', '01070000002', 'EXPERT', CURRENT_TIMESTAMP, 0),
       ('seed-interior@example.com', '$2a$10$N8on.wPrFPr5oauwmXJQeeZoSnGoNxkC6q4I7eHMxNy88fcZdaO6C', '온공간디자인', '01070000003', 'EXPERT', CURRENT_TIMESTAMP, 0),
       ('seed-photo@example.com', '$2a$10$N8on.wPrFPr5oauwmXJQeeZoSnGoNxkC6q4I7eHMxNy88fcZdaO6C', '스냅작가하루', '01070000004', 'EXPERT', CURRENT_TIMESTAMP, 0),
       ('seed-english@example.com', '$2a$10$N8on.wPrFPr5oauwmXJQeeZoSnGoNxkC6q4I7eHMxNy88fcZdaO6C', '제니영어', '01070000005', 'EXPERT', CURRENT_TIMESTAMP, 0),
       ('seed-dev@example.com', '$2a$10$N8on.wPrFPr5oauwmXJQeeZoSnGoNxkC6q4I7eHMxNy88fcZdaO6C', '코드메이트', '01070000006', 'EXPERT', CURRENT_TIMESTAMP, 0),
       ('seed-user1@example.com', '$2a$10$N8on.wPrFPr5oauwmXJQeeZoSnGoNxkC6q4I7eHMxNy88fcZdaO6C', '이사준비중', '01070000007', 'USER', CURRENT_TIMESTAMP, 0),
       ('seed-user2@example.com', '$2a$10$N8on.wPrFPr5oauwmXJQeeZoSnGoNxkC6q4I7eHMxNy88fcZdaO6C', '새내기집사', '01070000008', 'USER', CURRENT_TIMESTAMP, 0);

-- 2) 게시글 --------------------------------------------------------------
-- 지역 ID: 19 용산 · 20 성동 · 27 노원 · 30 마포 · 35 영등포 · 37 관악 · 38 서초 · 39 강남 · 40 송파 (모두 서울)
INSERT INTO post (member_id, second_category_id, second_region_id, board_type, title, content,
                  view_count, comment_count, like_count, created_at, updated_at, is_visible)
VALUES
-- 홍보 (고수)
((SELECT id FROM member WHERE email = 'expert1@example.com'), 101, 38, 'PROMOTION',
 '원룸·투룸 이사 전문, 3년간 파손 0건',
 '서초·강남 위주로 원룸, 투룸 이사를 하고 있어요.
가구는 모서리 보호대를 씌우고, 그릇은 한 장씩 따로 싸서 옮깁니다.
평일 오전 이사는 조금 더 저렴하게 진행해요. 요청서 남겨 주시면 사진 보고 정확히 견적 드릴게요.',
 412, 0, 0, DATEADD('DAY', -6, CURRENT_TIMESTAMP), DATEADD('DAY', -6, CURRENT_TIMESTAMP), TRUE),
((SELECT id FROM member WHERE email = 'seed-clean@example.com'), 102, 39, 'PROMOTION',
 '입주청소 전후 사진 보여드려요',
 '34평 아파트 입주청소 사례예요. 2인 1조로 6시간 작업했습니다.
창틀, 베란다 배수구, 주방 후드 안쪽까지 분해해서 닦아요.
작업 후 사진으로 구석구석 보여 드리고, 하루 안에 다시 봐 드립니다.',
 538, 0, 0, DATEADD('DAY', -5, CURRENT_TIMESTAMP), DATEADD('DAY', -5, CURRENT_TIMESTAMP), TRUE),
((SELECT id FROM member WHERE email = 'seed-plumb@example.com'), 109, 30, 'PROMOTION',
 '보일러 고장, 방문 진단부터 받아보세요',
 '마포·서대문 지역 보일러, 수도 수리합니다.
에러코드만 알려 주셔도 대략적인 원인과 비용을 미리 말씀드려요.
부품 교체가 필요 없으면 출장비만 받습니다.',
 267, 0, 0, DATEADD('DAY', -4, CURRENT_TIMESTAMP), DATEADD('DAY', -4, CURRENT_TIMESTAMP), TRUE),
((SELECT id FROM member WHERE email = 'seed-interior@example.com'), 113, 20, 'PROMOTION',
 '15평 구축 부분 리모델링 사례',
 '주방 상판과 욕실 타일, 거실 조명만 바꾼 부분 리모델링이에요.
전체 공사보다 기간은 5일, 비용은 절반 정도였어요.
살면서 공사가 가능한지, 어디까지 바꿀지 현장에서 같이 정해 드립니다.',
 691, 0, 0, DATEADD('DAY', -3, CURRENT_TIMESTAMP), DATEADD('DAY', -3, CURRENT_TIMESTAMP), TRUE),
((SELECT id FROM member WHERE email = 'seed-photo@example.com'), 120, 19, 'PROMOTION',
 '웨딩·가족 스냅 포트폴리오',
 '야외 웨딩 스냅과 가족사진을 주로 찍어요.
촬영 전 장소와 시간대를 같이 정하고, 보정본은 2주 안에 보내 드립니다.
원본 전체도 함께 드려요.',
 355, 0, 0, DATEADD('DAY', -3, CURRENT_TIMESTAMP), DATEADD('DAY', -3, CURRENT_TIMESTAMP), TRUE),
((SELECT id FROM member WHERE email = 'seed-english@example.com'), 129, 40, 'PROMOTION',
 '중고등 영어 내신 1:1 관리',
 '송파 지역 중고등학생 영어 내신을 1:1로 봐요.
학교 기출을 분석해서 시험 4주 전부터 맞춤 자료로 준비합니다.
첫 수업은 레벨 확인과 상담으로 진행해요.',
 289, 0, 0, DATEADD('DAY', -2, CURRENT_TIMESTAMP), DATEADD('DAY', -2, CURRENT_TIMESTAMP), TRUE),
((SELECT id FROM member WHERE email = 'seed-dev@example.com'), 139, 35, 'PROMOTION',
 'MVP 웹·앱 외주 개발 사례',
 '초기 창업팀의 MVP를 6주 안에 만들어 드려요.
기획서가 없어도 괜찮아요. 첫 미팅에서 꼭 필요한 기능만 같이 추립니다.
최근에는 예약 서비스와 사내 관리 도구를 만들었어요.',
 198, 0, 0, DATEADD('DAY', -1, CURRENT_TIMESTAMP), DATEADD('DAY', -1, CURRENT_TIMESTAMP), TRUE),
((SELECT id FROM member WHERE email = 'expert2@example.com'), 103, 27, 'PROMOTION',
 '에어컨 분해청소, 겨울에 미리 하세요',
 '벽걸이, 스탠드, 시스템 에어컨 모두 분해해서 고압 세척해요.
겨울에는 예약이 여유로워서 원하시는 날짜에 맞춰 드릴 수 있어요.
곰팡이 냄새가 났다면 꼭 한번 맡겨 보세요.',
 174, 0, 0, DATEADD('HOUR', -20, CURRENT_TIMESTAMP), DATEADD('HOUR', -20, CURRENT_TIMESTAMP), TRUE),

-- 팁 (고수)
((SELECT id FROM member WHERE email = 'seed-clean@example.com'), 102, 39, 'TIP',
 '입주청소 전에 꼭 확인할 5가지',
 '1. 청소 범위에 베란다, 창틀, 붙박이장 안쪽이 들어가는지 확인하세요.
2. 새집증후군 시공은 청소와 별도인지 물어보세요.
3. 작업 인원과 예상 시간을 미리 받아 두세요.
4. 끝나고 함께 둘러보는 시간을 꼭 잡으세요.
5. 다시 봐 주는 기간(A/S)이 며칠인지 확인하세요.',
 1204, 0, 0, DATEADD('DAY', -9, CURRENT_TIMESTAMP), DATEADD('DAY', -9, CURRENT_TIMESTAMP), TRUE),
((SELECT id FROM member WHERE email = 'seed-plumb@example.com'), 109, 30, 'TIP',
 '보일러 동파 막는 겨울 습관',
 '영하로 내려가는 날에는 외출 모드로 두고 나가세요. 보일러를 끄면 배관이 얼 수 있어요.
베란다에 보일러가 있다면 배관을 보온재로 감싸 두세요.
수도는 아주 가늘게 틀어 두면 동파를 막을 수 있어요.',
 876, 0, 0, DATEADD('DAY', -7, CURRENT_TIMESTAMP), DATEADD('DAY', -7, CURRENT_TIMESTAMP), TRUE),
((SELECT id FROM member WHERE email = 'expert1@example.com'), 101, 38, 'TIP',
 '이삿짐 쌀 때 깨지는 물건 포장법',
 '접시는 눕히지 말고 세워서 넣으세요. 세워야 충격에 덜 깨져요.
컵 안에는 신문지를 채우고, 상자 빈 곳은 수건으로 메우세요.
상자 겉에 "깨짐 주의"와 들어갈 방 이름을 적어 두면 정리가 빨라요.',
 943, 0, 0, DATEADD('DAY', -6, CURRENT_TIMESTAMP), DATEADD('DAY', -6, CURRENT_TIMESTAMP), TRUE),
((SELECT id FROM member WHERE email = 'seed-interior@example.com'), 115, 20, 'TIP',
 '장판 vs 강마루, 이렇게 고르세요',
 '반려동물이 있거나 물을 자주 쓰면 장판이 관리하기 편해요.
찍힘에 강하고 고급스러운 느낌을 원하면 강마루가 좋아요.
비용은 강마루가 평당 2~3배 정도 더 들어요.',
 1532, 0, 0, DATEADD('DAY', -5, CURRENT_TIMESTAMP), DATEADD('DAY', -5, CURRENT_TIMESTAMP), TRUE),
((SELECT id FROM member WHERE email = 'seed-photo@example.com'), 120, 19, 'TIP',
 '셀프 웨딩 촬영 장소 고르는 법',
 '해가 지기 1시간 전, 골든아워에 찍으면 보정 없이도 색이 예뻐요.
사람이 적은 평일 오전도 좋아요.
공원은 촬영 허가가 필요한 곳이 있으니 미리 확인하세요.',
 702, 0, 0, DATEADD('DAY', -4, CURRENT_TIMESTAMP), DATEADD('DAY', -4, CURRENT_TIMESTAMP), TRUE),
((SELECT id FROM member WHERE email = 'seed-english@example.com'), 129, 40, 'TIP',
 '영어 단어, 하루 30개 외우는 법',
 '새 단어 30개보다 어제 외운 단어 다시 보기가 먼저예요.
1일, 3일, 7일 뒤에 다시 보는 순서로 복습해 보세요.
예문을 소리 내어 읽으면 오래 기억에 남아요.',
 1088, 0, 0, DATEADD('DAY', -3, CURRENT_TIMESTAMP), DATEADD('DAY', -3, CURRENT_TIMESTAMP), TRUE),
((SELECT id FROM member WHERE email = 'seed-dev@example.com'), 139, 35, 'TIP',
 '외주 맡기기 전 정리할 문서 3가지',
 '1. 누가, 어떤 순서로 쓰는지 적은 사용 흐름
2. 꼭 있어야 하는 기능과 나중에 넣을 기능 목록
3. 참고하는 서비스 2~3개와 마음에 드는 이유
이 세 가지만 있어도 견적이 훨씬 정확해져요.',
 655, 0, 0, DATEADD('DAY', -2, CURRENT_TIMESTAMP), DATEADD('DAY', -2, CURRENT_TIMESTAMP), TRUE),
((SELECT id FROM member WHERE email = 'expert2@example.com'), 103, 27, 'TIP',
 '에어컨 청소 주기, 이렇게 보세요',
 '필터는 2주에 한 번 직접 물로 씻어 주세요.
분해청소는 1~2년에 한 번이면 충분해요.
켤 때 쉰내가 나거나 바람이 약해졌다면 그때가 분해청소할 때예요.',
 487, 0, 0, DATEADD('DAY', -1, CURRENT_TIMESTAMP), DATEADD('DAY', -1, CURRENT_TIMESTAMP), TRUE),

-- 질문 (고객)
((SELECT id FROM member WHERE email = 'seed-user1@example.com'), 101, 38, 'QUESTION',
 '이사 견적이 업체마다 왜 이렇게 달라요?',
 '투룸 이사인데 견적이 45만 원부터 80만 원까지 나왔어요.
어떤 부분을 비교해야 할지 모르겠어요.',
 321, 0, 0, DATEADD('HOUR', -30, CURRENT_TIMESTAMP), DATEADD('HOUR', -30, CURRENT_TIMESTAMP), TRUE),
((SELECT id FROM member WHERE email = 'customer2@example.com'), 102, 39, 'QUESTION',
 '입주청소 몇 평부터 2명이 와요?',
 '24평 아파트인데 1명이 와도 괜찮을까요?',
 188, 0, 0, DATEADD('HOUR', -26, CURRENT_TIMESTAMP), DATEADD('HOUR', -26, CURRENT_TIMESTAMP), TRUE),
((SELECT id FROM member WHERE email = 'customer1@example.com'), 109, 30, 'QUESTION',
 '보일러에 E-03 에러가 계속 떠요',
 '껐다 켜면 잠깐 되다가 다시 에러가 나요. 직접 해볼 수 있는 게 있을까요?',
 265, 0, 0, DATEADD('HOUR', -20, CURRENT_TIMESTAMP), DATEADD('HOUR', -20, CURRENT_TIMESTAMP), TRUE),
((SELECT id FROM member WHERE email = 'seed-user2@example.com'), 114, 37, 'QUESTION',
 '원룸 도배, 셀프로 해도 될까요?',
 '6평 원룸이에요. 셀프 도배 해보신 분 계신가요? 업체 비용이랑 차이가 궁금해요.',
 143, 0, 0, DATEADD('HOUR', -16, CURRENT_TIMESTAMP), DATEADD('HOUR', -16, CURRENT_TIMESTAMP), TRUE),
((SELECT id FROM member WHERE email = 'customer2@example.com'), 129, 40, 'QUESTION',
 '초등 영어 과외 몇 학년부터 하나요?',
 '초3 아이인데 학원이 맞을지 1:1 과외가 맞을지 고민이에요.',
 97, 0, 0, DATEADD('HOUR', -12, CURRENT_TIMESTAMP), DATEADD('HOUR', -12, CURRENT_TIMESTAMP), TRUE),
((SELECT id FROM member WHERE email = 'seed-user1@example.com'), 120, 19, 'QUESTION',
 '웨딩 스냅 원본도 다 받을 수 있나요?',
 '보정본만 주는 곳이 있다고 들었어요. 보통 어떻게 하나요?',
 76, 0, 0, DATEADD('HOUR', -9, CURRENT_TIMESTAMP), DATEADD('HOUR', -9, CURRENT_TIMESTAMP), TRUE),
((SELECT id FROM member WHERE email = 'seed-user2@example.com'), 191, 30, 'QUESTION',
 '강아지 산책 도우미 써보신 분?',
 '출근 시간이 길어져서 낮에 산책을 부탁하고 싶어요. 비용이 어느 정도인가요?',
 58, 0, 0, DATEADD('HOUR', -6, CURRENT_TIMESTAMP), DATEADD('HOUR', -6, CURRENT_TIMESTAMP), TRUE),
((SELECT id FROM member WHERE email = 'customer1@example.com'), 139, 35, 'QUESTION',
 '앱 외주 견적은 뭘 기준으로 받아요?',
 '예약 기능이 있는 간단한 앱을 만들고 싶어요. 기능 목록만 있으면 될까요?',
 41, 0, 0, DATEADD('HOUR', -3, CURRENT_TIMESTAMP), DATEADD('HOUR', -3, CURRENT_TIMESTAMP), TRUE),

-- 모집
((SELECT id FROM member WHERE email = 'seed-clean@example.com'), 102, 39, 'RECRUIT',
 '입주청소 팀원 모집합니다 (경력 무관)',
 '주 3~4회 함께 일할 팀원을 찾아요. 처음이어도 2주 동안 같이 다니며 알려 드려요.',
 233, 0, 0, DATEADD('DAY', -2, CURRENT_TIMESTAMP), DATEADD('DAY', -2, CURRENT_TIMESTAMP), TRUE),
((SELECT id FROM member WHERE email = 'seed-user1@example.com'), 155, 40, 'RECRUIT',
 '평일 저녁 토익 스터디원 구해요',
 '송파역 근처 카페에서 화, 목 저녁 8시에 모여요. 목표 점수는 850점이에요.',
 112, 0, 0, DATEADD('DAY', -1, CURRENT_TIMESTAMP), DATEADD('DAY', -1, CURRENT_TIMESTAMP), TRUE),
((SELECT id FROM member WHERE email = 'seed-photo@example.com'), 126, 19, 'RECRUIT',
 '연말 행사 촬영 보조 2명 구해요',
 '12월 둘째 주 토요일, 기업 행사 촬영 보조를 구해요. 장비는 제가 준비해요.',
 89, 0, 0, DATEADD('HOUR', -10, CURRENT_TIMESTAMP), DATEADD('HOUR', -10, CURRENT_TIMESTAMP), TRUE);

-- 3) 사진 파일 + 게시글 연결 ----------------------------------------------
-- storage_path는 Supabase public 버킷(efy-public)에 이미 올라가 있는 사진 경로다 (docs/seed/README.md)
INSERT INTO file (uploader_id, storage_path, original_name, content_type, size, visibility, created_at)
SELECT m.id, v.path, v.name, 'image/jpeg', 300000, 'PUBLIC', CURRENT_TIMESTAMP
FROM (VALUES ('expert1@example.com', '5daa003e-1e20-4848-81d7-c3a418cecf91.jpg', 'promo-moving-1.jpg'),
             ('expert1@example.com', '50347254-5e8f-4b63-a33b-082d42401d16.jpg', 'promo-moving-2.jpg'),
             ('seed-clean@example.com', '064360f9-82e8-4e0c-b723-a2062cc1a375.jpg', 'promo-clean-1.jpg'),
             ('seed-clean@example.com', '50f09811-0f6c-4624-a85a-6f2f95294a83.jpg', 'promo-clean-2.jpg'),
             ('seed-plumb@example.com', 'aa76c2cf-be28-4f5c-99cc-197b0e69c1d4.jpg', 'promo-boiler-1.jpg'),
             ('seed-interior@example.com', '83d5c398-973d-497f-b61e-b9e2c0188532.jpg', 'promo-interior-1.jpg'),
             ('seed-interior@example.com', 'a5cd84ed-18ac-48e1-9a90-71e60abcaf05.jpg', 'promo-interior-2.jpg'),
             ('seed-photo@example.com', '10cd17fb-a6bc-456e-919d-3f8270397af3.jpg', 'promo-snap-1.jpg'),
             ('seed-photo@example.com', 'ab8834a5-3e84-4704-8069-ea8b9233458e.jpg', 'promo-snap-2.jpg'),
             ('seed-english@example.com', 'abd56987-aebe-47d2-8f7c-48df5f14bb94.jpg', 'promo-english-1.jpg'),
             ('seed-dev@example.com', '0f11d56a-67be-49b3-8573-7a97700a7f4c.jpg', 'promo-dev-1.jpg'),
             ('expert2@example.com', '12904168-fe15-4dc8-9df6-ddc507020606.jpg', 'promo-aircon-1.jpg'),
             ('seed-clean@example.com', 'd8c3a907-ba6a-469d-8093-4e69d9cf5284.jpg', 'tip-clean.jpg'),
             ('seed-plumb@example.com', 'ebea7963-5a18-4ac7-87db-f75fc6cfb701.jpg', 'tip-boiler.jpg'),
             ('expert1@example.com', '73c6b070-7b0c-493b-8af0-894c14c0c78c.jpg', 'tip-packing.jpg'),
             ('seed-interior@example.com', '74c3a957-9638-4644-962c-3eb84f6d090b.jpg', 'tip-floor.jpg'),
             ('seed-photo@example.com', '2f5d05bc-bad6-42c7-bdb6-dbae87d162e8.jpg', 'tip-wedding.jpg'),
             ('seed-english@example.com', 'd40e132c-5fe4-4565-8427-859a847dca8a.jpg', 'tip-words.jpg'),
             ('seed-dev@example.com', '434ee595-4316-4306-8b89-be7d42425ab9.jpg', 'tip-docs.jpg'),
             ('expert2@example.com', '797b95bd-3896-4109-bbf3-4912b12e72b1.jpg', 'tip-aircon.jpg')) AS v(email, path, name)
JOIN member m ON m.email = v.email;

-- sort_order 0번 사진이 목록 썸네일이 된다
INSERT INTO post_images (post_id, file_id, sort_order)
SELECT p.id, f.id, v.ord
FROM (VALUES ('원룸·투룸 이사 전문, 3년간 파손 0건', '5daa003e-1e20-4848-81d7-c3a418cecf91.jpg', 0),
             ('원룸·투룸 이사 전문, 3년간 파손 0건', '50347254-5e8f-4b63-a33b-082d42401d16.jpg', 1),
             ('입주청소 전후 사진 보여드려요', '064360f9-82e8-4e0c-b723-a2062cc1a375.jpg', 0),
             ('입주청소 전후 사진 보여드려요', '50f09811-0f6c-4624-a85a-6f2f95294a83.jpg', 1),
             ('보일러 고장, 방문 진단부터 받아보세요', 'aa76c2cf-be28-4f5c-99cc-197b0e69c1d4.jpg', 0),
             ('15평 구축 부분 리모델링 사례', '83d5c398-973d-497f-b61e-b9e2c0188532.jpg', 0),
             ('15평 구축 부분 리모델링 사례', 'a5cd84ed-18ac-48e1-9a90-71e60abcaf05.jpg', 1),
             ('웨딩·가족 스냅 포트폴리오', '10cd17fb-a6bc-456e-919d-3f8270397af3.jpg', 0),
             ('웨딩·가족 스냅 포트폴리오', 'ab8834a5-3e84-4704-8069-ea8b9233458e.jpg', 1),
             ('중고등 영어 내신 1:1 관리', 'abd56987-aebe-47d2-8f7c-48df5f14bb94.jpg', 0),
             ('MVP 웹·앱 외주 개발 사례', '0f11d56a-67be-49b3-8573-7a97700a7f4c.jpg', 0),
             ('에어컨 분해청소, 겨울에 미리 하세요', '12904168-fe15-4dc8-9df6-ddc507020606.jpg', 0),
             ('입주청소 전에 꼭 확인할 5가지', 'd8c3a907-ba6a-469d-8093-4e69d9cf5284.jpg', 0),
             ('보일러 동파 막는 겨울 습관', 'ebea7963-5a18-4ac7-87db-f75fc6cfb701.jpg', 0),
             ('이삿짐 쌀 때 깨지는 물건 포장법', '73c6b070-7b0c-493b-8af0-894c14c0c78c.jpg', 0),
             ('장판 vs 강마루, 이렇게 고르세요', '74c3a957-9638-4644-962c-3eb84f6d090b.jpg', 0),
             ('셀프 웨딩 촬영 장소 고르는 법', '2f5d05bc-bad6-42c7-bdb6-dbae87d162e8.jpg', 0),
             ('영어 단어, 하루 30개 외우는 법', 'd40e132c-5fe4-4565-8427-859a847dca8a.jpg', 0),
             ('외주 맡기기 전 정리할 문서 3가지', '434ee595-4316-4306-8b89-be7d42425ab9.jpg', 0),
             ('에어컨 청소 주기, 이렇게 보세요', '797b95bd-3896-4109-bbf3-4912b12e72b1.jpg', 0)) AS v(title, path, ord)
JOIN post p ON p.title = v.title
JOIN file f ON f.storage_path = v.path;

-- 4) 댓글 ----------------------------------------------------------------
INSERT INTO post_comment (post_id, member_id, content, like_count, created_at, updated_at)
SELECT p.id, m.id, v.content, 0, DATEADD('HOUR', -v.hrs, CURRENT_TIMESTAMP), DATEADD('HOUR', -v.hrs, CURRENT_TIMESTAMP)
FROM (VALUES ('이사 견적이 업체마다 왜 이렇게 달라요?', 'expert1@example.com', '사다리차 포함 여부, 포장 범위, 작업 인원을 먼저 비교해 보세요. 이 세 가지에서 차이가 가장 커요.', 28),
             ('이사 견적이 업체마다 왜 이렇게 달라요?', 'expert2@example.com', '추가 요금 조건(층수, 엘리베이터, 주말)도 견적서에 적혀 있는지 확인하세요.', 27),
             ('이사 견적이 업체마다 왜 이렇게 달라요?', 'customer1@example.com', '저도 비슷했는데 포장 범위 차이였어요!', 25),
             ('입주청소 몇 평부터 2명이 와요?', 'seed-clean@example.com', '보통 20평대부터 2명이 가요. 1명이면 시간이 두 배 가까이 걸려요.', 24),
             ('입주청소 몇 평부터 2명이 와요?', 'seed-user1@example.com', '저는 25평에 2명 오셨어요.', 22),
             ('보일러에 E-03 에러가 계속 떠요', 'seed-plumb@example.com', '대부분 점화 불량이에요. 가스 밸브가 열려 있는지 먼저 확인해 보시고, 계속 뜨면 점검받으세요.', 18),
             ('보일러에 E-03 에러가 계속 떠요', 'seed-user2@example.com', '저희 집도 밸브가 반쯤 잠겨 있었어요.', 17),
             ('원룸 도배, 셀프로 해도 될까요?', 'seed-interior@example.com', '6평이면 셀프도 가능해요. 다만 천장은 혼자 하기 어려워서 벽만 셀프로 하시는 분이 많아요.', 14),
             ('초등 영어 과외 몇 학년부터 하나요?', 'seed-english@example.com', '초3이면 1:1로 기초 읽기부터 잡기 좋은 시기예요. 아이 성향에 따라 소그룹도 괜찮아요.', 10),
             ('웨딩 스냅 원본도 다 받을 수 있나요?', 'seed-photo@example.com', '저는 원본 전체를 드려요. 계약 전에 원본 제공 여부를 꼭 물어보세요.', 7),
             ('앱 외주 견적은 뭘 기준으로 받아요?', 'seed-dev@example.com', '기능 목록에 화면 개수와 로그인 방식까지 적어 주시면 견적이 정확해져요.', 2)) AS v(title, email, content, hrs)
JOIN post p ON p.title = v.title
JOIN member m ON m.email = v.email;

-- 5) 좋아요 --------------------------------------------------------------
INSERT INTO post_like (member_id, post_id)
SELECT m.id, p.id
FROM (VALUES ('입주청소 전에 꼭 확인할 5가지', 'customer1@example.com'), ('입주청소 전에 꼭 확인할 5가지', 'customer2@example.com'),
             ('입주청소 전에 꼭 확인할 5가지', 'seed-user1@example.com'), ('입주청소 전에 꼭 확인할 5가지', 'seed-user2@example.com'),
             ('입주청소 전에 꼭 확인할 5가지', 'expert1@example.com'),
             ('장판 vs 강마루, 이렇게 고르세요', 'customer1@example.com'), ('장판 vs 강마루, 이렇게 고르세요', 'customer2@example.com'),
             ('장판 vs 강마루, 이렇게 고르세요', 'seed-user1@example.com'), ('장판 vs 강마루, 이렇게 고르세요', 'seed-user2@example.com'),
             ('영어 단어, 하루 30개 외우는 법', 'customer2@example.com'), ('영어 단어, 하루 30개 외우는 법', 'seed-user1@example.com'),
             ('영어 단어, 하루 30개 외우는 법', 'seed-user2@example.com'),
             ('보일러 동파 막는 겨울 습관', 'customer1@example.com'), ('보일러 동파 막는 겨울 습관', 'seed-user2@example.com'),
             ('이삿짐 쌀 때 깨지는 물건 포장법', 'seed-user1@example.com'), ('이삿짐 쌀 때 깨지는 물건 포장법', 'customer2@example.com'),
             ('15평 구축 부분 리모델링 사례', 'customer1@example.com'), ('15평 구축 부분 리모델링 사례', 'seed-user2@example.com'),
             ('15평 구축 부분 리모델링 사례', 'customer2@example.com'),
             ('입주청소 전후 사진 보여드려요', 'seed-user1@example.com'), ('입주청소 전후 사진 보여드려요', 'customer2@example.com'),
             ('이사 견적이 업체마다 왜 이렇게 달라요?', 'customer1@example.com'), ('이사 견적이 업체마다 왜 이렇게 달라요?', 'customer2@example.com'),
             ('이사 견적이 업체마다 왜 이렇게 달라요?', 'seed-user2@example.com'),
             ('보일러에 E-03 에러가 계속 떠요', 'seed-user1@example.com'), ('보일러에 E-03 에러가 계속 떠요', 'customer2@example.com'),
             ('입주청소 몇 평부터 2명이 와요?', 'seed-user2@example.com')) AS v(title, email)
JOIN post p ON p.title = v.title
JOIN member m ON m.email = v.email;

-- 6) 댓글 수·좋아요 수를 실제 행 개수와 맞춘다
UPDATE post p
SET comment_count = (SELECT COUNT(*) FROM post_comment c WHERE c.post_id = p.id AND c.deleted_at IS NULL),
    like_count    = (SELECT COUNT(*) FROM post_like l WHERE l.post_id = p.id);
