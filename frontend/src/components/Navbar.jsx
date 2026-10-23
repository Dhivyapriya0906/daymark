import {useEffect,useState} from 'react';
import {useAuth} from '../context/AuthContext';
import Icon from './Icon';

const items=[['dashboard','Dashboard','grid'],['tasks','My tasks','list'],['today','Today','sunCalendar'],['upcoming','Upcoming','calendar'],['completed','Completed','check']];

export default function Navbar({activeView,onNavigate,query,onQueryChange,onCreate,children}){
  const {user,logout}=useAuth();
  const [collapsed,setCollapsed]=useState(false);
  const [mobileOpen,setMobileOpen]=useState(false);
  const [theme,setTheme]=useState(()=>localStorage.getItem('daymark-theme')||'light');
  useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem('daymark-theme',theme);},[theme]);
  const navigate=view=>{onNavigate(view);setMobileOpen(false);};
  return <div className={`app-frame ${collapsed?'sidebar-collapsed':''} ${mobileOpen?'mobile-sidebar-open':''}`}>
    {mobileOpen&&<button className="sidebar-scrim" aria-label="Close navigation" onClick={()=>setMobileOpen(false)}/>}
    <aside className="sidebar" aria-label="Main navigation">
      <div className="sidebar-brand-row"><a className="brand" href="/"><span className="brand-mark"><Icon name="spark" size={19}/></span><span className="brand-name">daymark</span></a><button className="sidebar-collapse" onClick={()=>setCollapsed(!collapsed)} aria-label={collapsed?'Expand sidebar':'Collapse sidebar'} title={collapsed?'Expand sidebar':'Collapse sidebar'}><Icon name="panel" size={17}/></button></div>
      <button className="button button-primary sidebar-create" onClick={onCreate} title="Create task"><Icon name="plus" size={17}/><span>New task</span></button>
      <div className="sidebar-label">WORKSPACE</div>
      <nav className="side-nav">{items.map(([key,label,icon])=><button key={key} className={`nav-item ${activeView===key?'selected':''}`} onClick={()=>navigate(key)} title={collapsed?label:undefined} aria-current={activeView===key?'page':undefined}><Icon name={icon}/><span>{label}</span>{key==='tasks'&&<span className="nav-shortcut">⌘ 1</span>}</button>)}</nav>
      <div className="sidebar-bottom"><button className="nav-item theme-control" onClick={()=>setTheme(theme==='light'?'dark':'light')} title={theme==='light'?'Switch to dark theme':'Switch to light theme'}><Icon name={theme==='light'?'moon':'sun'}/><span>{theme==='light'?'Dark appearance':'Light appearance'}</span></button><div className="profile-block"><div className="profile-avatar">{user?.name?.[0]?.toUpperCase()||'D'}</div><div className="profile-copy"><strong>{user?.name}</strong><span>Personal workspace</span></div><button className="profile-logout" onClick={logout} aria-label="Log out" title="Log out"><Icon name="logout" size={17}/></button></div></div>
    </aside>
    <div className="workspace-column"><header className="topbar"><button className="mobile-menu" onClick={()=>setMobileOpen(true)} aria-label="Open navigation"><span/><span/><span/></button><div className="breadcrumbs"><span>Workspace</span><Icon name="chevron" size={14}/><strong>{items.find(x=>x[0]===activeView)?.[1]||'Dashboard'}</strong></div><div className="topbar-tools"><label className="global-search"><Icon name="search" size={17}/><input aria-label="Search tasks" placeholder="Search anything…" value={query} onChange={e=>onQueryChange(e.target.value)}/><kbd>⌘ K</kbd></label><span className="topbar-avatar" title={user?.name}>{user?.name?.[0]?.toUpperCase()||'D'}</span></div></header>{children}</div>
  </div>;
}
