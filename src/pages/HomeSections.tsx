// 메인 페이지 콘텐츠 섹션: 서비스 검색 · 상황별 묶음 · 고수 홍보 · 팁 · 인기 질문
// 커뮤니티 공개 목록 API(최신순 20개)만 쓴다. 글이 없거나 불러오지 못하면 섹션을 숨긴다(메인 화면의 보조 콘텐츠라 오류 화면을 띄우지 않음)
import { useMemo, useRef, useState } from 'react';
import * as api from '../api/endpoints';
import { getPosts, type BoardType, type PostSummary } from '../api/mvp';
import type { FirstCategory, SecondCategory } from '../api/types';
import { useLoad } from '../hooks/useLoad';
import imgMove from '../assets/home/move.jpg';
import imgWinter from '../assets/home/winter.jpg';
import imgStudy from '../assets/home/study.jpg';
import imgStartup from '../assets/home/startup.jpg';

const requestHref = (fc: number, cat: number) => `#/requests/new?fc=${fc}&cat=${cat}`;

// ── 서비스 검색: 세부 서비스 이름으로 찾아 바로 요청서로 이동 ──
// 세부 서비스 목록은 검색창을 처음 누를 때 분야별로 한 번만 불러온다
export function ServiceSearch({ cats }: { cats: FirstCategory[] }) {
  const [q, setQ] = useState('');
  const [all, setAll] = useState<{ first: FirstCategory; sub: SecondCategory }[] | null>(null);
  const started = useRef(false);
  const warm = () => {
    if (started.current) return;
    started.current = true;
    Promise.all(cats.map((c) => api.getSecondCategories(c.id).then((l) => l.map((sub) => ({ first: c, sub })))))
      .then((l) => setAll(l.flat()))
      .catch(() => { started.current = false; });
  };
  const [open, setOpen] = useState(false);
  const term = q.trim().replace(/\s+/g, '');
  const has = (s: string) => s.replace(/\s+/g, '').includes(term);
  // 세부 서비스 이름이 맞는 것을 먼저, 없으면 분야 이름이 맞는 것
  const bySub = term && all ? all.filter((x) => has(x.sub.name)) : [];
  const hits = (bySub.length ? bySub : term && all ? all.filter((x) => has(x.first.name)) : []).slice(0, 8);
  return (
    <div className="svc-search" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false); }}
      onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}>
      <label className="sr-only" htmlFor="svc-q">서비스 검색</label>
      <input id="svc-q" className="input" type="search" placeholder="서비스 검색 (예: 입주 청소)" autoComplete="off"
        value={q} onFocus={() => { warm(); setOpen(true); }} onChange={(e) => { warm(); setOpen(true); setQ(e.target.value); }} />
      {term && open && (
        <ul className="svc-hits" role="listbox" aria-label="검색 결과">
          {!all && <li className="svc-empty">세부 서비스를 불러오는 중이에요</li>}
          {all && hits.length === 0 && <li className="svc-empty">"{q.trim()}"에 맞는 서비스가 없어요. 아래 분야에서 골라 보세요.</li>}
          {hits.map((x) => (
            <li key={x.sub.id}><a href={requestHref(x.first.id, x.sub.id)}><b>{x.sub.name}</b><small>{x.first.name}</small></a></li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── 상황별 묶음: 함께 찾는 세부 서비스를 한 장의 카드로 ──
// ponytail: 세부 서비스 ID는 백엔드 시드(data.sql) 값 그대로. 관리자가 카테고리를 지우면 링크가 깨지므로 그때는 이름으로 찾아 연결하도록 바꾼다
const BUNDLES = [
  { title: '새집으로 이사', desc: '이사부터 입주 청소, 부분 인테리어까지', img: imgMove,
    items: [{ fc: 1, cat: 101, name: '이사' }, { fc: 1, cat: 102, name: '입주/집 청소' }, { fc: 3, cat: 113, name: '부분 인테리어' }] },
  { title: '겨울 집 점검', desc: '보일러와 창문, 추워지기 전에', img: imgWinter,
    items: [{ fc: 2, cat: 109, name: '수도/보일러/전기' }, { fc: 2, cat: 108, name: '문/창문' }, { fc: 1, cat: 103, name: '가전/가구 청소' }] },
  { title: '영어 공부 시작', desc: '내신부터 회화, 시험 준비까지', img: imgStudy,
    items: [{ fc: 5, cat: 129, name: '영어 과외' }, { fc: 7, cat: 155, name: '외국어-영어' }, { fc: 7, cat: 152, name: '시험/자격증' }] },
  { title: '창업 준비', desc: '서비스 개발부터 디자인, 마케팅까지', img: imgStartup,
    items: [{ fc: 6, cat: 139, name: '개발 외주' }, { fc: 6, cat: 138, name: '디자인 외주' }, { fc: 6, cat: 142, name: '마케팅' }] }
];

export function Bundles() {
  return (
    <section className="home-sec">
      <h2 className="home-h2">상황별로 한 번에 찾기</h2>
      <div className="bundles">
        {BUNDLES.map((b) => (
          <article key={b.title} className="bundle">
            <img src={b.img} alt="" loading="lazy" />
            <div className="bundle-body">
              <b>{b.title}</b>
              <span>{b.desc}</span>
              <div className="bundle-links">
                {b.items.map((i) => <a key={i.cat} href={requestHref(i.fc, i.cat)}>{i.name}</a>)}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// ── 커뮤니티 글을 쓰는 섹션 공통 ──
function usePosts(board: BoardType) {
  const load = useLoad(() => getPosts(board, 1), [board]);
  return load.state.kind === 'ok' ? load.state.data.content.filter((p) => p.isVisible) : [];
}
const place = (p: PostSummary) => [p.category?.secondCategoryName, p.region?.secondRegionName].filter(Boolean).join(' · ');

function SecHead({ title, more }: { title: string; more: string }) {
  return <div className="row between baseline"><h2 className="home-h2">{title}</h2><a className="more" href={more}>더보기</a></div>;
}

// 고수 홍보: 사진 있는 홍보 글 8개를 가로로 넘겨 본다
// PC는 4개씩 넘기는 버튼(첫 페이지는 오른쪽만, 마지막 페이지는 왼쪽만), 모바일은 손가락으로 밀어 본다
const PER_PAGE = 4;
const GAP = 16; // .h-scroll gap과 같아야 한 페이지씩 정확히 넘어간다
export function ExpertPromos() {
  const list = usePosts('PROMOTION').filter((p) => p.thumbnailUrl).slice(0, 8);
  const box = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  if (list.length === 0) return null;
  const pages = Math.ceil(list.length / PER_PAGE);
  const go = (d: number) => { const el = box.current; if (el) el.scrollTo({ left: (page + d) * (el.clientWidth + GAP), behavior: 'smooth' }); };
  const onScroll = () => { const el = box.current; if (el) setPage(Math.round(el.scrollLeft / (el.clientWidth + GAP))); };
  const arrow = (d: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>;
  return (
    <section className="home-sec">
      <SecHead title="고수들의 작업 소개" more="#/community?board=PROMOTION" />
      <div className="carousel">
        <div className="h-scroll" ref={box} onScroll={onScroll}>
          {list.map((p) => (
            <a key={p.postId} className="promo-card" href={`#/community/${p.postId}`}>
              <img src={p.thumbnailUrl!} alt="" loading="lazy" />
              <b>{p.title}</b>
              <small>{p.memberNickname}{place(p) && ` · ${place(p)}`}</small>
            </a>
          ))}
        </div>
        <div className="car-nav">
          {page > 0 && <button type="button" className="car-btn prev" aria-label="이전 작업 보기" onClick={() => go(-1)}>{arrow('m15 18-6-6 6-6')}</button>}
          {page < pages - 1 && <button type="button" className="car-btn next" aria-label="다음 작업 보기" onClick={() => go(1)}>{arrow('m9 18 6-6-6-6')}</button>}
        </div>
      </div>
    </section>
  );
}

// 고수의 팁: 분야 칩으로 걸러 본다
export function ExpertTips() {
  const list = usePosts('TIP');
  const [cat, setCat] = useState<string | null>(null);
  const cats = useMemo(() => [...new Set(list.map((p) => p.category?.firstCategoryName).filter((c): c is string => !!c))], [list]);
  if (list.length === 0) return null;
  const shown = list.filter((p) => !cat || p.category?.firstCategoryName === cat).slice(0, 8);
  return (
    <section className="home-sec">
      <SecHead title="고수가 알려 주는 팁" more="#/community?board=TIP" />
      {cats.length > 1 && (
        <div className="chips" role="group" aria-label="팁 분야">
          <button type="button" className={`hchip${cat === null ? ' on' : ''}`} aria-pressed={cat === null} onClick={() => setCat(null)}>전체</button>
          {cats.map((c) => <button type="button" key={c} className={`hchip${cat === c ? ' on' : ''}`} aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>)}
        </div>
      )}
      <div className="tip-grid home-tips">
        {shown.map((p) => (
          <a key={p.postId} className="tip-card" href={`#/community/${p.postId}`}>
            {p.thumbnailUrl ? <img src={p.thumbnailUrl} alt="" loading="lazy" /> : <span className="tip-noimg" />}
            <b>{p.title}</b>
            <small className="sub">{p.memberNickname} · 좋아요 {p.likeCount}</small>
          </a>
        ))}
      </div>
    </section>
  );
}

// 인기 질문: 최근 질문 20개 중 좋아요·댓글·조회 순으로 6개 (전체 기간 순위 API가 없어 최근 글 기준)
export function PopularQuestions() {
  const list = usePosts('QUESTION');
  if (list.length === 0) return null;
  const top = [...list].sort((a, b) => b.likeCount - a.likeCount || b.commentCount - a.commentCount || b.viewCount - a.viewCount).slice(0, 6);
  return (
    <section className="home-sec">
      <SecHead title="요즘 많이 본 질문" more="#/community?board=QUESTION" />
      <ol className="rank">
        {top.map((p) => (
          <li key={p.postId}>
            <a href={`#/community/${p.postId}`}>
              <b>{p.title}</b>
              <small>{[place(p), `좋아요 ${p.likeCount}`, `댓글 ${p.commentCount}`].filter(Boolean).join(' · ')}</small>
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
