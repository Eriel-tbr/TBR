/* Supabase simulado para las pruebas: misma forma que supabase-js en lo que usa Mi TBR.
   La "base de datos" vive en Node (window.mockDb) y la comparten todos los "dispositivos". */
(function(){
  const S = () => { try{ return JSON.parse(localStorage.getItem('mock.session')); }catch(e){ return null; } };
  const cbs = [];
  function from(){
    const q = { eq:{} }, b = {
      select(){ return b; }, eq(k, v){ q.eq[k] = v; return b; },
      maybeSingle(){ return window.mockDb('get').then(r => ({ data:r ? { data:r.data, rev:r.rev } : null, error:null })); },
      insert(o){ return window.mockDb('insert', o).then(err => ({ error:err })); },
      update(o){ q.upd = o; return b; },
      then(res, rej){ return window.mockDb('update', { data:q.upd.data, rev:q.upd.rev, expect:q.eq.rev }).then(d => ({ data:d, error:null })).then(res, rej); }
    };
    return b;
  }
  window.supabase = { createClient(){ return {
    auth:{
      getSession:async () => ({ data:{ session:S() } }),
      onAuthStateChange(cb){ cbs.push(cb); setTimeout(() => cb('INITIAL_SESSION', S()), 0); return { data:{ subscription:{ unsubscribe(){} } } }; },
      signInWithOAuth:async () => { localStorage.setItem('mock.session', JSON.stringify({ user:{ id:'u1', email:'lectora@example.com' } })); cbs.forEach(c => c('SIGNED_IN', S())); return { error:null }; },
      signOut:async () => { localStorage.removeItem('mock.session'); cbs.forEach(c => c('SIGNED_OUT', null)); return { error:null }; }
    },
    from,
    storage:{ from(){ return { upload:async path => { await window.mockDb('upload', path); return { error:null }; }, getPublicUrl:path => ({ data:{ publicUrl:'https://mock.storage/' + path } }) }; } },
    channel(){ return { on(){ return this; }, subscribe(){ return this; } }; },
    removeChannel(){}
  }; } };
})();
