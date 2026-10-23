import {useCallback,useEffect,useMemo,useState} from 'react';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import LoadingSpinner from '../components/LoadingSpinner';
import Icon from '../components/Icon';
import {taskService} from '../services/taskService';
import {useAuth} from '../context/AuthContext';

const labels={dashboard:'Your day, in focus',tasks:'My tasks',today:'Due today',upcoming:'Coming up',completed:'Completed tasks'};
const descriptions={dashboard:'A clear view of what you’re working on.',tasks:'Everything you’ve planned, all in one place.',today:'The things worth your attention today.',upcoming:'A little look at what’s ahead.',completed:'Look at everything you’ve made progress on.'};
const todayKey=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};

export default function Dashboard(){
  const {user}=useAuth();
  const [tasks,setTasks]=useState([]),[stats,setStats]=useState({total:0,pending:0,inProgress:0,completed:0});
  const [loading,setLoading]=useState(true),[error,setError]=useState(''),[notice,setNotice]=useState('');
  const [query,setQuery]=useState(''),[status,setStatus]=useState(''),[priority,setPriority]=useState(''),[view,setView]=useState('dashboard');
  const [modal,setModal]=useState(null),[busy,setBusy]=useState(false);
  const load=useCallback(async()=>{setLoading(true);setError('');try{const [ts,st]=await Promise.all([taskService.list({search:query||undefined,status:status||undefined,priority:priority||undefined}),taskService.stats()]);setTasks(ts);setStats(st);}catch(e){setError(e.response?.data?.message||'We could not load your tasks. Please try again.');}finally{setLoading(false);}},[query,status,priority]);
  useEffect(()=>{const t=setTimeout(load,180);return()=>clearTimeout(t);},[load]);
  const visible=useMemo(()=>tasks.filter(t=>{if(view==='today')return t.dueDate===todayKey();if(view==='upcoming')return t.dueDate>todayKey()&&t.status!=='COMPLETED';if(view==='completed')return t.status==='COMPLETED';return true;}),[tasks,view]);
  const save=async data=>{setBusy(true);try{modal.id?await taskService.update(modal.id,data):await taskService.create(data);setModal(null);setNotice(modal.id?'Your changes are saved.':'Task added to your workspace.');setTimeout(()=>setNotice(''),2600);await load();}catch(e){setError(e.response?.data?.message||'Could not save that task. Please try again.');}finally{setBusy(false);}};
  const remove=async task=>{if(!window.confirm(`Delete “${task.title}”? This cannot be undone.`))return;try{await taskService.remove(task.id);setNotice('Task deleted.');setTimeout(()=>setNotice(''),2600);await load();}catch(e){setError(e.response?.data?.message||'Could not delete that task.');}};
  const now=new Date(),dateLabel=new Intl.DateTimeFormat('en',{weekday:'long',month:'long',day:'numeric'}).format(now),firstName=user?.name?.trim().split(/\s+/)[0]||'there';
  const resetFilters=()=>{setQuery('');setStatus('');setPriority('');};
  return <Navbar activeView={view} onNavigate={setView} query={query} onQueryChange={setQuery} onCreate={()=>setModal({})}>
    <main className="dashboard">
      <div className="dashboard-date"><span className="date-dot"/>{dateLabel}</div>
      <div className="welcome-row"><div><h1>{view==='dashboard'?`Good ${now.getHours()<12?'morning':now.getHours()<18?'afternoon':'evening'}, ${firstName}`:labels[view]} <span className="wave"><Icon name="spark" size={23}/></span></h1><p>{descriptions[view]}</p></div><button className="button button-primary create-button" onClick={()=>setModal({})}><Icon name="plus" size={17}/> New task</button></div>
      <section className="stats-grid" aria-label="Task summary">
        <div className="stat-card stat-total"><div className="stat-top"><span className="stat-icon"><Icon name="grid"/></span><span className="stat-label">Total tasks</span></div><strong>{stats.total}</strong><span className="stat-caption">in your workspace</span></div>
        <div className="stat-card stat-todo"><div className="stat-top"><span className="stat-icon"><Icon name="list"/></span><span className="stat-label">To do</span></div><strong>{stats.pending}</strong><span className="stat-caption">ready when you are</span></div>
        <div className="stat-card stat-progress"><div className="stat-top"><span className="stat-icon"><Icon name="clock"/></span><span className="stat-label">In progress</span></div><strong>{stats.inProgress}</strong><span className="stat-caption">currently underway</span></div>
        <div className="stat-card stat-completed"><div className="stat-top"><span className="stat-icon"><Icon name="check"/></span><span className="stat-label">Completed</span></div><strong>{stats.completed}</strong><span className="stat-caption">nice work, you</span></div>
      </section>
      <section className="tasks-section">
        <div className="section-heading"><div><span className="eyebrow">{view==='dashboard'?'YOUR WORKSPACE':'TASK VIEW'}</span><h2>{view==='dashboard'?'My tasks':labels[view]} <span className="count-pill">{visible.length}</span></h2></div><div className="task-filters"><label className="search-field"><Icon name="search" size={16}/><input aria-label="Search tasks" placeholder="Search tasks…" value={query} onChange={e=>setQuery(e.target.value)}/></label><select aria-label="Filter by status" value={status} onChange={e=>setStatus(e.target.value)}><option value="">All statuses</option><option value="PENDING">To do</option><option value="IN_PROGRESS">In progress</option><option value="COMPLETED">Completed</option></select><select aria-label="Filter by priority" value={priority} onChange={e=>setPriority(e.target.value)}><option value="">All priorities</option><option value="HIGH">High priority</option><option value="MEDIUM">Medium priority</option><option value="LOW">Low priority</option></select></div></div>
        {notice&&<div className="notice" role="status">✓ &nbsp;{notice}</div>}{error&&<div className="alert dashboard-alert" role="alert">{error}<button onClick={load}>Try again</button></div>}
        {loading?<LoadingSpinner label="Getting your workspace ready…"/>:visible.length?<div className="task-list">{visible.map(t=><TaskCard key={t.id} task={t} onEdit={setModal} onDelete={remove}/>)}</div>:<div className="empty-state"><div className="empty-illustration"><Icon name="spark" size={21}/></div><h3>{query||status||priority?'Nothing here matches your filters':view==='today'?'Nothing due today':view==='upcoming'?'Your schedule has room to breathe':view==='completed'?'Your completed tasks will show up here':'A little space to begin'}</h3><p>{query||status||priority?'Try adjusting your search or filters.':view==='dashboard'||view==='tasks'?'Add a task and give your day a clear starting point.':'Tasks in this view will appear here when they’re ready.'}</p>{view==='dashboard'&&<button className="button button-outline" onClick={()=>setModal({})}><Icon name="plus" size={16}/> Create your first task</button>}{(query||status||priority)&&<button className="text-button" onClick={resetFilters}>Clear filters</button>}</div>}
      </section>
      <footer className="footer-note">A little progress, every day. <span>✳</span></footer>
    </main>
    {modal&&<TaskForm task={modal.id?modal:null} onSave={save} onClose={()=>setModal(null)} busy={busy}/>}
  </Navbar>;
}
