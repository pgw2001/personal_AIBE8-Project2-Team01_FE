// 상단 헤더(웹)와 하단 탭바(모바일)
// 로고는 로그인 여부와 관계없이 공개 홈(#/)으로 이동한다
import { useEffect, useRef, useState } from 'react';
import { useSession } from '../auth/session';
import { navigate } from '../hooks/useHashRoute';
import { roleLabel } from '../lib/format';
import { Avatar } from './ui';
import logo from '../assets/efy-logo.png';

interface NavItem { href: string; label: string; match: RegExp }

// 역할별 주 메뉴 (와이어프레임 헤더 구성)
function navFor(role: string | null): NavItem[] {
  const common: NavItem[] = [
    { href: '#/', label: '서비스 찾기', match: /^\/$|^\/requests\/new/ },
    { href: '#/community', label: '커뮤니티', match: /^\/community/ }
  ];
  if (role === 'USER') return [...common, { href: '#/requests', label: '내 요청서', match: /^\/requests(\/\d+)?$/ }];
  if (role === 'EXPERT') return [...common,
    { href: '#/received', label: '받은 요청', match: /^\/received/ },
    { href: '#/quotes', label: '보낸 견적', match: /^\/quotes/ }];
  if (role === 'ADMIN') return [
    { href: '#/admin/members', label: '회원 관리', match: /^\/admin\/members/ },
    { href: '#/admin/categories', label: '카테고리', match: /^\/admin\/categories/ },
    { href: '#/admin/regions', label: '지역', match: /^\/admin\/regions/ }
  ];
  return common;
}

// 로그인 후 돌아올 현재 화면
export function currentRedirect(): string {
  const h = window.location.hash.replace(/^#/, '') || '/';
  return h.startsWith('/login') || h.startsWith('/signup') ? '/' : h;
}

// 라이트·다크 전환: 고른 값은 html[data-theme]와 localStorage(efy.theme)에 둔다. 고르기 전에는 시스템 설정을 따른다
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
const isDarkNow = () => (document.documentElement.dataset.theme ? document.documentElement.dataset.theme === 'dark' : darkQuery.matches);
function ThemeToggle() {
  const [dark, setDark] = useState(isDarkNow);
  useEffect(() => {
    const onChange = () => setDark(isDarkNow());
    darkQuery.addEventListener('change', onChange);
    return () => darkQuery.removeEventListener('change', onChange);
  }, []);
  const toggle = () => {
    const next = dark ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('efy.theme', next); } catch { /* 저장 못 해도 이번 화면에는 적용 */ }
    setDark(!dark);
  };
  return (
    <button type="button" className="ib" onClick={toggle} aria-label={dark ? '라이트 모드로 바꾸기' : '다크 모드로 바꾸기'} title={dark ? '라이트 모드' : '다크 모드'}>
      {dark
        ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
        : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /></svg>}
    </button>
  );
}

// 우측 상단 계정 메뉴: 프로필을 누르면 마이페이지·로그아웃이 열린다. 바깥을 누르거나 Esc·화면 이동 시 닫힌다
function AccountMenu({ path }: { path: string }) {
  const { me, logout } = useSession();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);
  if (!me) return null;
  const doLogout = async () => {
    setBusy(true);
    try { await logout().catch(() => undefined); navigate('/', undefined, true); } finally { setBusy(false); setOpen(false); }
  };
  return (
    <div className="acct" ref={box}>
      <button type="button" className="me-pill" aria-haspopup="menu" aria-expanded={open} aria-label={`계정 메뉴 · ${me.nickname} · ${roleLabel(me.role)}`} onClick={() => setOpen((o) => !o)}>
        <Avatar url={me.imageUrl} size={32} />
        <span className="me-name">{me.nickname}</span>
        <span className={`role-tag ${me.role === 'EXPERT' ? 'expert' : me.role === 'ADMIN' ? 'admin' : 'user'}`}>{roleLabel(me.role)}</span>
        <svg className="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </button>
      {open && (
        <div className="acct-menu" role="menu">
          <a role="menuitem" href="#/mypage">마이페이지</a>
          <button type="button" role="menuitem" disabled={busy} onClick={doLogout}>{busy ? '로그아웃하는 중' : '로그아웃'}</button>
        </div>
      )}
    </div>
  );
}

export function Header({ path }: { path: string }) {
  const { status, me } = useSession();
  const role = status === 'member' && me ? me.role : null;
  const items = navFor(role);
  return (
    <header className="hd">
      <a href="#/" className="logo" aria-label="EFY 홈">
        <img src={logo} alt="EFY 홈" />
      </a>
      <nav className="hd-nav" aria-label="주 메뉴">
        {items.map((i) => <a key={i.href} href={i.href} className={i.match.test(path) ? 'on' : ''}>{i.label}</a>)}
      </nav>
      <div className="hd-right">
        <ThemeToggle />
        {status === 'member' && me ? (
          <>
            {me.role !== 'ADMIN' && (
              <a className="ib hide-m" href="#/chats" aria-label="채팅">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /></svg>
              </a>
            )}
            {me.role === 'EXPERT' && <a className="cr-pill hide-m" href="#/credit">크레딧</a>}
            <AccountMenu path={path} />
          </>
        ) : status === 'guest' ? (
          <>
            <a className="btn small ghost hide-m" href="#/signup">회원가입</a>
            <a className="btn small" href={`#/login?redirect=${encodeURIComponent(currentRedirect())}`}>로그인</a>
          </>
        ) : null}
      </div>
    </header>
  );
}

// 모바일 하단 탭 (와이어프레임 M·01 · 보드메모 "하단 탭")
// 고객·비로그인 = 홈·커뮤니티·내 요청서·채팅·마이 / 고수 = 받은 요청·보낸 견적·커뮤니티·채팅·마이
// 관리자는 화면 상단 탭(회원·카테고리·지역)을 쓰므로 하단 탭이 없다
type TabIcon = 'home' | 'board' | 'doc' | 'chat' | 'me' | 'inbox' | 'send';
interface TabItem { href: string; label: string; icon: TabIcon; match: RegExp }

const ICON_PATH: Record<TabIcon, string> = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  board: 'M4 4h16v12H8l-4 4zM8 9h8M8 12h5',
  doc: 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5',
  chat: 'M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z',
  me: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c.8-4 4-6.5 8-6.5s7.2 2.5 8 6.5',
  inbox: 'M3 13h5l1.5 3h5L16 13h5M5 5h14l2 8v6H3v-6z',
  send: 'M21 3 10 14M21 3l-7 18-4-7-7-4z'
};

function tabsFor(role: string | null): TabItem[] {
  const community: TabItem = { href: '#/community', label: '커뮤니티', icon: 'board', match: /^\/community/ };
  const chat: TabItem = { href: '#/chats', label: '채팅', icon: 'chat', match: /^\/chats/ };
  const my: TabItem = { href: '#/mypage', label: '마이', icon: 'me', match: /^\/mypage|^\/expert\/|^\/bookmarks|^\/credit/ };
  if (role === 'EXPERT') {
    return [
      { href: '#/received', label: '받은 요청', icon: 'inbox', match: /^\/received/ },
      { href: '#/quotes', label: '보낸 견적', icon: 'send', match: /^\/quotes/ },
      community, chat, my
    ];
  }
  return [
    { href: '#/', label: '홈', icon: 'home', match: /^\/$|^\/requests\/new/ },
    community,
    { href: '#/requests', label: '내 요청서', icon: 'doc', match: /^\/requests$/ },
    chat, my
  ];
}

// 하단 탭을 보여 줄 화면 (각 탭의 첫 화면만 · 상세·작성·채팅방은 전체 화면)
export function showMobileTabs(path: string, params: URLSearchParams, role: string | null): boolean {
  if (role === 'ADMIN') return false;
  if (path === '/requests' || path === '/received') return !params.get('id');
  return ['/', '/community', '/chats', '/mypage', '/quotes'].includes(path);
}

export function MobileTabBar({ path }: { path: string }) {
  const { status, me } = useSession();
  const role = status === 'member' && me ? me.role : null;
  return (
    <nav className="m-tabbar" aria-label="하단 메뉴">
      {tabsFor(role).map((t) => (
        <a key={t.href} href={t.href} className={t.match.test(path) ? 'on' : ''} aria-current={t.match.test(path) ? 'page' : undefined}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ICON_PATH[t.icon]} /></svg>
          <span>{t.label}</span>
        </a>
      ))}
    </nav>
  );
}
