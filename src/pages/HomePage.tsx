// 공개 홈 · 서비스 선택 (와이어프레임 W·01 기준)
// 로그인 없이 볼 수 있고 요청서 작성처럼 인증이 필요한 동작에서만 로그인을 요구한다
// 로그인 전 방문자에게는 랜딩(히어로·진행 방식·고수 안내)을, 로그인한 회원에게는 서비스 선택만 보여 준다
// 히어로의 견적 화면은 실제 데이터로 오해하지 않도록 '화면 예시'라고 표시한다
// "이 조건의 고수 둘러보기"는 고수 검색 API가 없어 넣지 않았다
import { useEffect, useState } from 'react';
import { errorText } from '../api/client';
import * as api from '../api/endpoints';
import type { FirstCategory, SecondCategory } from '../api/types';
import { useSession } from '../auth/session';
import { ErrorView, LoadingView } from '../components/ui';
import { useLoad } from '../hooks/useLoad';
import { Bundles, ExpertPromos, ExpertTips, PopularQuestions, ServiceSearch } from './HomeSections';

// 분야 아이콘: Phosphor Icons duotone (MIT, https://phosphoricons.com) 원본 path
// [d, 1]은 연한 면(투톤의 옅은 층), [d]는 선. 색은 currentColor를 따른다
type IconPaths = ([string] | [string, 1])[];
const ICONS: Record<string, IconPaths> = {
  'truck': [['M248,120v64a8,8,0,0,1-8,8H216a24,24,0,0,0-48,0H104a24,24,0,0,0-48,0H32a8,8,0,0,1-8-8V144H184V120Z', 1], ['M255.42,117l-14-35A15.93,15.93,0,0,0,226.58,72H192V64a8,8,0,0,0-8-8H32A16,16,0,0,0,16,72V184a16,16,0,0,0,16,16H49a32,32,0,0,0,62,0h50a32,32,0,0,0,62,0h17a16,16,0,0,0,16-16V120A7.94,7.94,0,0,0,255.42,117ZM192,88h34.58l9.6,24H192ZM32,72H176v64H32ZM80,208a16,16,0,1,1,16-16A16,16,0,0,1,80,208Zm81-24H111a32,32,0,0,0-62,0H32V152H176v12.31A32.11,32.11,0,0,0,161,184Zm31,24a16,16,0,1,1,16-16A16,16,0,0,1,192,208Zm48-24H223a32.06,32.06,0,0,0-31-24V128h48Z']],
  'wrench': [['M224,96a64,64,0,0,1-94.94,56L73,217A24,24,0,0,1,39,183L104,126.94a64,64,0,0,1,80-90.29L144,80l5.66,26.34L176,112l43.35-40A63.8,63.8,0,0,1,224,96Z', 1], ['M226.76,69a8,8,0,0,0-12.84-2.88l-40.3,37.19-17.23-3.7-3.7-17.23,37.19-40.3A8,8,0,0,0,187,29.24,72,72,0,0,0,88,96,72.34,72.34,0,0,0,94,124.94L33.79,177c-.15.12-.29.26-.43.39a32,32,0,0,0,45.26,45.26c.13-.13.27-.28.39-.42L131.06,162A72,72,0,0,0,232,96,71.56,71.56,0,0,0,226.76,69ZM160,152a56.14,56.14,0,0,1-27.07-7,8,8,0,0,0-9.92,1.77L67.11,211.51a16,16,0,0,1-22.62-22.62L109.18,133a8,8,0,0,0,1.77-9.93,56,56,0,0,1,58.36-82.31l-31.2,33.81a8,8,0,0,0-1.94,7.1L141.83,108a8,8,0,0,0,6.14,6.14l26.35,5.66a8,8,0,0,0,7.1-1.94l33.81-31.2A56.06,56.06,0,0,1,160,152Z']],
  'paint-roller': [['M208,64v64a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8H200A8,8,0,0,1,208,64Z', 1], ['M232,88H216V64a16,16,0,0,0-16-16H48A16,16,0,0,0,32,64V88H16a8,8,0,0,0,0,16H32v24a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V104h16v50L131.6,182.65A16.07,16.07,0,0,0,120,198v34a8,8,0,0,0,16,0V198l100.4-28.68A16.07,16.07,0,0,0,248,154V104A16,16,0,0,0,232,88Zm-32,40H48V64H200v64Z']],
  'sparkle': [['M194.82,151.43l-55.09,20.3-20.3,55.09a7.92,7.92,0,0,1-14.86,0l-20.3-55.09-55.09-20.3a7.92,7.92,0,0,1,0-14.86l55.09-20.3,20.3-55.09a7.92,7.92,0,0,1,14.86,0l20.3,55.09,55.09,20.3A7.92,7.92,0,0,1,194.82,151.43Z', 1], ['M197.58,129.06,146,110l-19-51.62a15.92,15.92,0,0,0-29.88,0L78,110l-51.62,19a15.92,15.92,0,0,0,0,29.88L78,178l19,51.62a15.92,15.92,0,0,0,29.88,0L146,178l51.62-19a15.92,15.92,0,0,0,0-29.88ZM137,164.22a8,8,0,0,0-4.74,4.74L112,223.85,91.78,169A8,8,0,0,0,87,164.22L32.15,144,87,123.78A8,8,0,0,0,91.78,119L112,64.15,132.22,119a8,8,0,0,0,4.74,4.74L191.85,144ZM144,40a8,8,0,0,1,8-8h16V16a8,8,0,0,1,16,0V32h16a8,8,0,0,1,0,16H184V64a8,8,0,0,1-16,0V48H152A8,8,0,0,1,144,40ZM248,88a8,8,0,0,1-8,8h-8v8a8,8,0,0,1-16,0V96h-8a8,8,0,0,1,0-16h8V72a8,8,0,0,1,16,0v8h8A8,8,0,0,1,248,88Z']],
  'student': [['M224,64,128,96,32,64l96-32Z', 1], ['M226.53,56.41l-96-32a8,8,0,0,0-5.06,0l-96,32a8,8,0,0,0-5.4,6.75A5,5,0,0,0,24,64v80a8,8,0,0,0,16,0V75.1L73.59,86.29a64,64,0,0,0,20.65,88.05c-18,7.06-33.56,19.83-44.94,37.29a8,8,0,1,0,13.4,8.74C77.77,197.25,101.57,184,128,184s50.23,13.25,65.3,36.37a8,8,0,0,0,13.4-8.74c-11.38-17.46-27-30.23-44.94-37.29a64,64,0,0,0,20.65-88l44.12-14.7a8,8,0,0,0,0-15.18ZM176,120A48,48,0,1,1,89.35,91.55l36.12,12a8,8,0,0,0,5.06,0l36.12-12A47.89,47.89,0,0,1,176,120ZM128,87.57,57.3,64,128,40.43,198.7,64Z']],
  'laptop': [['M216,72V176H40V72A16,16,0,0,1,56,56H200A16,16,0,0,1,216,72Z', 1], ['M232,168h-8V72a24,24,0,0,0-24-24H56A24,24,0,0,0,32,72v96H24a8,8,0,0,0-8,8v16a24,24,0,0,0,24,24H216a24,24,0,0,0,24-24V176A8,8,0,0,0,232,168ZM48,72a8,8,0,0,1,8-8H200a8,8,0,0,1,8,8v96H48ZM224,192a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8v-8H224ZM152,88a8,8,0,0,1-8,8H112a8,8,0,0,1,0-16h32A8,8,0,0,1,152,88Z']],
  'briefcase': [['M224,118.31V200a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V118.31h0A191.14,191.14,0,0,0,128,144,191.08,191.08,0,0,0,224,118.31Z', 1], ['M104,112a8,8,0,0,1,8-8h32a8,8,0,0,1,0,16H112A8,8,0,0,1,104,112ZM232,72V200a16,16,0,0,1-16,16H40a16,16,0,0,1-16-16V72A16,16,0,0,1,40,56H80V48a24,24,0,0,1,24-24h48a24,24,0,0,1,24,24v8h40A16,16,0,0,1,232,72ZM96,56h64V48a8,8,0,0,0-8-8H104a8,8,0,0,0-8,8ZM40,72v41.62A184.07,184.07,0,0,0,128,136a184,184,0,0,0,88-22.39V72ZM216,200V131.63A200.25,200.25,0,0,1,128,152a200.19,200.19,0,0,1-88-20.36V200H216Z']],
  'palette': [['M224,127.17a96.48,96.48,0,0,1-2.39,22.18A24,24,0,0,1,198.21,168H152a24,24,0,0,0-24,24,24,24,0,0,1-32,22.61C58.73,201.44,32,169.81,32,128a96,96,0,0,1,95-96C179.84,31.47,223.55,74.35,224,127.17Z', 1], ['M200.77,53.89A103.27,103.27,0,0,0,128,24h-1.07A104,104,0,0,0,24,128c0,43,26.58,79.06,69.36,94.17A32,32,0,0,0,136,192a16,16,0,0,1,16-16h46.21a31.81,31.81,0,0,0,31.2-24.88,104.43,104.43,0,0,0,2.59-24A103.28,103.28,0,0,0,200.77,53.89Zm13,93.71A15.89,15.89,0,0,1,198.21,160H152a32,32,0,0,0-32,32,16,16,0,0,1-21.31,15.07C62.49,194.3,40,164,40,128a88,88,0,0,1,87.09-88h.9a88.35,88.35,0,0,1,88,87.25A88.86,88.86,0,0,1,213.81,147.6ZM140,76a12,12,0,1,1-12-12A12,12,0,0,1,140,76ZM96,100A12,12,0,1,1,84,88,12,12,0,0,1,96,100Zm0,56a12,12,0,1,1-12-12A12,12,0,0,1,96,156Zm88-56a12,12,0,1,1-12-12A12,12,0,0,1,184,100Z']],
  'car': [['M184,176h40v24a8,8,0,0,1-8,8H192a8,8,0,0,1-8-8ZM32,200a8,8,0,0,0,8,8H64a8,8,0,0,0,8-8V176H32ZM194.11,44.75A8,8,0,0,0,186.8,40H69.2a8,8,0,0,0-7.31,4.75L32,112H224Z', 1], ['M240,104H229.2L201.42,41.5A16,16,0,0,0,186.8,32H69.2a16,16,0,0,0-14.62,9.5L26.8,104H16a8,8,0,0,0,0,16h8v80a16,16,0,0,0,16,16H64a16,16,0,0,0,16-16V184h96v16a16,16,0,0,0,16,16h24a16,16,0,0,0,16-16V120h8a8,8,0,0,0,0-16ZM69.2,48H186.8l24.89,56H44.31ZM64,200H40V184H64Zm128,0V184h24v16Zm24-32H40V120H216ZM56,144a8,8,0,0,1,8-8H80a8,8,0,0,1,0,16H64A8,8,0,0,1,56,144Zm112,0a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H176A8,8,0,0,1,168,144Z']],
  'scales': [['M56,88l32,80c0,17.67-20,24-32,24s-32-6.33-32-24ZM200,56l-32,80c0,17.67,20,24,32,24s32-6.33,32-24Z', 1], ['M239.43,133l-32-80h0a8,8,0,0,0-9.16-4.84L136,62V40a8,8,0,0,0-16,0V65.58L54.26,80.19A8,8,0,0,0,48.57,85h0v.06L16.57,165a7.92,7.92,0,0,0-.57,3c0,23.31,24.54,32,40,32s40-8.69,40-32a7.92,7.92,0,0,0-.57-3L66.92,93.77,120,82V208H104a8,8,0,0,0,0,16h48a8,8,0,0,0,0-16H136V78.42L187,67.1,160.57,133a7.92,7.92,0,0,0-.57,3c0,23.31,24.54,32,40,32s40-8.69,40-32A7.92,7.92,0,0,0,239.43,133ZM56,184c-7.53,0-22.76-3.61-23.93-14.64L56,109.54l23.93,59.82C78.76,180.39,63.53,184,56,184Zm144-32c-7.53,0-22.76-3.61-23.93-14.64L200,77.54l23.93,59.82C222.76,148.39,207.53,152,200,152Z']],
  'squares-four': [['M112,56v48a8,8,0,0,1-8,8H56a8,8,0,0,1-8-8V56a8,8,0,0,1,8-8h48A8,8,0,0,1,112,56Zm88-8H152a8,8,0,0,0-8,8v48a8,8,0,0,0,8,8h48a8,8,0,0,0,8-8V56A8,8,0,0,0,200,48Zm-96,96H56a8,8,0,0,0-8,8v48a8,8,0,0,0,8,8h48a8,8,0,0,0,8-8V152A8,8,0,0,0,104,144Zm96,0H152a8,8,0,0,0-8,8v48a8,8,0,0,0,8,8h48a8,8,0,0,0,8-8V152A8,8,0,0,0,200,144Z', 1], ['M200,136H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,200,136Zm0,64H152V152h48v48ZM104,40H56A16,16,0,0,0,40,56v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,104,40Zm0,64H56V56h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm0,64H152V56h48v48Zm-96,32H56a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,104,136Zm0,64H56V152h48v48Z']],
};
// 분야 이름에 맞는 아이콘 (없으면 기본 격자)
const ICON_RULES: [RegExp, string][] = [
  [/이사|청소/, 'truck'], [/설치|수리/, 'wrench'], [/인테리어/, 'paint-roller'], [/이벤트|뷰티/, 'sparkle'],
  [/취미|자기계발/, 'palette'], [/과외|레슨/, 'student'], [/외주/, 'laptop'], [/취업|직무/, 'briefcase'],
  [/자동차/, 'car'], [/법률|금융/, 'scales']
];
function CatIcon({ name }: { name: string }) {
  const key = ICON_RULES.find(([re]) => re.test(name))?.[1] ?? 'squares-four';
  return (
    <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
      {ICONS[key].map(([d, soft]) => <path key={d} d={d} opacity={soft ? 0.2 : undefined} />)}
    </svg>
  );
}

// 히어로 오른쪽 '화면 예시': 요청서 한 장에 견적이 여러 개 도착한 모습
const DEMO_QUOTES = [
  { who: '고수 A', note: '포장이사 · 사다리차 포함', price: '320,000원' },
  { who: '고수 B', note: '반포장이사 · 당일 가능', price: '280,000원', pick: true },
  { who: '고수 C', note: '일반이사 · 주말 추가 없음', price: '350,000원' }
];
function QuoteDemo() {
  return (
    <figure className="demo" aria-label="화면 예시: 요청서 한 장에 견적 세 개가 도착한 모습">
      <figcaption className="demo-cap">화면 예시</figcaption>
      <div className="demo-req">
        <b>이사 요청서</b>
        <span>서초구 → 마포구 · 원룸 · 다음 주 토요일</span>
      </div>
      <ul className="demo-list">
        {DEMO_QUOTES.map((q) => (
          <li key={q.who} className={q.pick ? 'on' : undefined}>
            <span className="col"><b>{q.who}</b><small>{q.note}</small></span>
            <span className="demo-price">{q.price}</span>
          </li>
        ))}
      </ul>
      <div className="demo-foot">견적 3개 도착 · 마감까지 18시간</div>
    </figure>
  );
}

export function HomePage() {
  const { status, me } = useSession();
  const cats = useLoad(() => api.getFirstCategories(), []);
  const [catId, setCatId] = useState<number | null>(null);
  const [subs, setSubs] = useState<Record<number, SecondCategory[] | 'error'>>({});
  const [subId, setSubId] = useState<number | null>(null);

  const loadSubs = (id: number) => {
    setSubs((m) => { const n = { ...m }; delete n[id]; return n; });
    api.getSecondCategories(id).then((l) => setSubs((m) => ({ ...m, [id]: l }))).catch(() => setSubs((m) => ({ ...m, [id]: 'error' })));
  };
  useEffect(() => { if (catId !== null && subs[catId] === undefined) loadSubs(catId); }, [catId]); // eslint-disable-line react-hooks/exhaustive-deps

  // 처음에는 아무 분야도 고르지 않는다. 분야를 누르면 세부 서비스가 열리고, 같은 분야를 다시 누르면 닫힌다
  // 다른 분야로 바꾸면 세부 서비스 선택을 초기화한다
  const pickCat = (c: FirstCategory) => { setCatId(c.id === catId ? null : c.id); setSubId(null); };
  const cur = catId !== null ? subs[catId] : undefined;
  const curCat = cats.state.kind === 'ok' ? cats.state.data.find((c) => c.id === catId) : undefined;
  const subName = Array.isArray(cur) ? cur.find((s) => s.id === subId)?.name : undefined;
  const role = status === 'member' ? me?.role : undefined;
  const guest = status === 'guest';
  const canRequest = role !== 'EXPERT' && role !== 'ADMIN'; // 요청서는 비회원(로그인 후)·고객만 쓴다
  const toServices = () => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <main className="home">
      {guest && (
        <section className="land-hero">
          <div className="land-hero-in">
            <div className="col land-copy">
              <h1>요청서 한 장이면<br />고수들이 먼저 견적을 보내요</h1>
              <p>이사, 청소, 수리, 레슨, 외주까지. 필요한 일을 적어 두면 조건에 맞는 고수들이 24시간 동안 견적을 보내고, 가격과 내용을 나란히 비교해 고를 수 있어요.</p>
              <div className="row hero-cta">
                <button type="button" className="hbtn p" onClick={toServices}>요청서 쓰기</button>
                <button type="button" className="hbtn g" onClick={() => document.getElementById('flow')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>견적 받는 방법</button>
              </div>
            </div>
            <QuoteDemo />
          </div>
        </section>
      )}

      <div className="home-body">
        <section id="services" className="home-sec">
          <div className="svc-head">
            <h2 className="home-h2">어떤 서비스가 필요하세요?</h2>
            {cats.state.kind === 'ok' && canRequest && <ServiceSearch cats={cats.state.data} />}
          </div>
          {cats.state.kind === 'loading' && <div className="card"><LoadingView label="서비스 분야를 불러오는 중이에요" /></div>}
          {cats.state.kind === 'error' && <ErrorView title="서비스 분야를 불러오지 못했어요" message={errorText(cats.state.error)} onRetry={() => cats.reload()} />}
          {cats.state.kind === 'ok' && (cats.state.data.length === 0 ? <div className="state card"><b>등록된 서비스 분야가 없어요</b></div> : (
            <>
              <div className="cat-grid">
                {cats.state.data.map((c) => (
                  <button type="button" key={c.id} className={`cat${c.id === catId ? ' on' : ''}`} aria-expanded={c.id === catId} aria-controls="sub-panel" onClick={() => pickCat(c)}>
                    <span className="ico"><CatIcon name={c.name} /></span>{c.name}
                  </button>
                ))}
              </div>
              {catId !== null && <div className="sub-panel" id="sub-panel">
                <div className="col grow gap-s">
                  <b className="sub-title">{curCat?.name ?? ''} · 세부 서비스</b>
                  {cur === undefined && <LoadingView label="세부 서비스를 불러오는 중이에요" />}
                  {cur === 'error' && <ErrorView title="세부 서비스를 불러오지 못했어요" onRetry={() => catId !== null && loadSubs(catId)} />}
                  {Array.isArray(cur) && (cur.length === 0 ? <span className="sub">이 분야에는 아직 세부 서비스가 없어요.</span> : (
                    <div className="chips">
                      {cur.map((s) => (
                        <button type="button" key={s.id} className={`hchip${s.id === subId ? ' on' : ''}`} aria-pressed={s.id === subId} onClick={() => setSubId(s.id)}>{s.name}</button>
                      ))}
                    </div>
                  ))}
                  {role === 'EXPERT' && <small className="sub">요청서는 고객 상태에서 작성할 수 있어요.</small>}
                  {role === 'ADMIN' && <small className="sub">관리자 계정은 요청서를 작성하지 않아요.</small>}
                </div>
                {role !== 'EXPERT' && role !== 'ADMIN' && (
                  subId
                    ? <a className="hbtn p" href={`#/requests/new?fc=${catId}&cat=${subId}`}>{subName} 요청서 쓰기</a>
                    : <button type="button" className="hbtn p" disabled>세부 서비스를 골라 주세요</button>
                )}
              </div>}
            </>
          ))}
        </section>

        {canRequest && <Bundles />}
        <ExpertPromos />
        <ExpertTips />

        {guest && (
          <section id="flow" className="home-sec land-flow">
            <h2 className="home-h2">견적은 이렇게 받아요</h2>
            <ol>
              <li><b>요청서 보내기</b><span>서비스와 지역을 고르고 질문 몇 개에 답하면 요청서가 완성돼요.</span></li>
              <li><b>24시간 동안 견적 받기</b><span>조건에 맞는 고수들이 가격과 작업 내용을 담아 견적을 보내요.</span></li>
              <li><b>비교하고 고르기</b><span>견적은 받은 뒤 3일 동안 고를 수 있어요. 고르면 바로 채팅으로 일정과 비용을 조율해요.</span></li>
            </ol>
          </section>
        )}

        <PopularQuestions />

        {canRequest && (
          <section className="land-pro">
            <div className="col">
              <h2 className="home-h2">고수로 활동하고 싶다면</h2>
              <p>프로필을 등록하면 내 분야와 지역의 요청서를 받아요. 마음에 드는 요청서에만 크레딧을 써서 견적을 보내면 돼요.</p>
            </div>
            <a className="hbtn g" href="#/expert/intro">고수 등록 안내 보기</a>
          </section>
        )}
        {role === 'EXPERT' && (
          <section className="land-pro">
            <div className="col">
              <h2 className="home-h2">새 요청서가 와 있는지 확인해 보세요</h2>
              <p>내 분야와 지역에 들어온 요청서를 보고 견적을 보낼 수 있어요.</p>
            </div>
            <a className="hbtn g" href="#/received">받은 요청 보기</a>
          </section>
        )}
      </div>
    </main>
  );
}
