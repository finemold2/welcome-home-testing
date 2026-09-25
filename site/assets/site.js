/* Claude 자기소개 사이트 · 공통 스크립트 */
(function(){
  var root=document.documentElement;

  /* 화면 밝기 */
  var btn=document.getElementById('theme-btn');
  var mq=window.matchMedia?window.matchMedia('(prefers-color-scheme: dark)'):null;
  function effective(){
    var t=root.getAttribute('data-theme');
    if(t==='light'||t==='dark')return t;
    return mq&&mq.matches?'dark':'light';
  }
  function syncTheme(){
    if(!btn)return;
    var dark=effective()==='dark';
    btn.querySelector('.tb-text').textContent=dark?'밝게 보기':'어둡게 보기';
    btn.querySelector('.tb-state').textContent=dark?', 지금은 어두운 화면':', 지금은 밝은 화면';
  }
  if(btn){
    btn.addEventListener('click',function(){
      var next=effective()==='dark'?'light':'dark';
      root.setAttribute('data-theme',next);
      try{localStorage.setItem('intro-theme',next);}catch(e){}
      syncTheme();
    });
    if(mq){if(mq.addEventListener)mq.addEventListener('change',syncTheme);else if(mq.addListener)mq.addListener(syncTheme);}
    syncTheme();
  }

  /* 좁은 화면에서 현재 메뉴가 보이도록 */
  var nav=document.querySelector('.nav');
  var cur=nav&&nav.querySelector('[aria-current="page"]');
  if(nav&&cur&&nav.scrollWidth>nav.clientWidth){
    nav.scrollLeft=Math.max(0,cur.offsetLeft-nav.clientWidth/2+cur.offsetWidth/2);
  }

  /* 턴마다 글자 수 */
  var fmt=window.Intl&&Intl.NumberFormat?new Intl.NumberFormat('ko-KR'):{format:String};
  Array.prototype.forEach.call(document.querySelectorAll('.turn'),function(t){
    var slot=t.querySelector('[data-len]');
    var b=t.querySelector('.body');
    if(!slot||!b)return;
    var c=b.cloneNode(true);
    Array.prototype.forEach.call(c.querySelectorAll('.sr,form,.result'),function(e){e.parentNode.removeChild(e);});
    slot.textContent=fmt.format(c.textContent.replace(/\s+/g,' ').trim().length)+'자';
    slot.setAttribute('aria-hidden','true');
  });

  /* 부탁 다듬기 도구 */
  var form=document.getElementById('builder');
  if(!form)return;
  var f={
    goal:document.getElementById('b-goal'),
    context:document.getElementById('b-context'),
    cond:document.getElementById('b-cond'),
    example:document.getElementById('b-example'),
    why:document.getElementById('b-why')
  };
  var out=document.getElementById('b-out');
  var meter=document.getElementById('b-meter');
  var missing=document.getElementById('b-missing');
  var status=document.getElementById('b-status');
  var hints={
    goal:'무엇을 하려는지 한 줄 적어 주세요.',
    context:'누가 읽는지, 어디에 쓰는지 알려 주시면 어조를 맞출 수 있어요.',
    cond:'길이, 말투, 형식 중 하나만 정해 주셔도 결과가 달라져요.',
    example:'원하는 결과와 비슷한 예시가 있으면 붙여 주세요.'
  };
  function clean(s){return s.replace(/\s+$/,'').replace(/^\s+/,'');}
  function compose(){
    var lines=[],filled=0,miss=[];
    ['goal','context','cond','example'].forEach(function(k){
      var v=clean(f[k].value);
      if(!v){miss.push(hints[k]);return;}
      filled++;
      if(k==='example')lines.push('참고할 예시:\n'+v);
      else lines.push(v);
    });
    if(f.why.checked)lines.push('고친 곳마다 이유를 한 줄씩 달아 주세요.');
    out.textContent=lines.length?lines.join('\n\n'):'왼쪽 칸을 채우면 여기에 부탁 문장이 만들어져요.';
    meter.innerHTML='<b>'+filled+'</b> / 4가지 담김';
    missing.innerHTML='';
    miss.forEach(function(m){var li=document.createElement('li');li.textContent=m;missing.appendChild(li);});
    missing.hidden=miss.length===0;
    status.textContent='';
  }
  form.addEventListener('input',compose);
  form.addEventListener('change',compose);
  form.addEventListener('submit',function(e){e.preventDefault();});
  document.getElementById('b-reset').addEventListener('click',function(){
    ['goal','context','cond','example'].forEach(function(k){f[k].value='';});
    f.goal.focus();
    compose();
    status.textContent='모든 칸을 비웠어요.';
  });
  document.getElementById('b-copy').addEventListener('click',function(){
    var text=out.textContent;
    function selectOut(){
      var r=document.createRange();r.selectNodeContents(out);
      var s=window.getSelection();s.removeAllRanges();s.addRange(r);
      status.textContent='문장을 선택해 뒀어요. Ctrl+C(맥은 ⌘+C)로 복사해 주세요.';
    }
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(function(){status.textContent='복사했어요. 저와의 대화창에 붙여 넣어 보세요.';},selectOut);
    }else{selectOut();}
  });
  compose();
})();
