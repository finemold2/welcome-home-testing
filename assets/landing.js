/* Claude 소개 사이트 · 인터랙션 (외부 라이브러리 없음) */
(function(){
  'use strict';
  var root=document.documentElement;
  var reduceMq=window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):null;
  var motion=!(reduceMq&&reduceMq.matches);
  var finePointer=window.matchMedia&&window.matchMedia('(pointer: fine)').matches;
  root.classList.add('js');
  if(motion)root.classList.add('motion');

  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function $(s,c){return (c||document).querySelector(s);}
  function $$(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s));}

  /* ── 스크롤 루프: 한 프레임에 한 번만 계산 ── */
  var updaters=[];
  var ticking=false;
  function runUpdaters(){ticking=false;var y=window.scrollY||window.pageYOffset;var vh=window.innerHeight;for(var i=0;i<updaters.length;i++)updaters[i](y,vh);}
  function requestUpdate(){if(!ticking){ticking=true;requestAnimationFrame(runUpdaters);}}
  window.addEventListener('scroll',requestUpdate,{passive:true});
  window.addEventListener('resize',requestUpdate);

  /* ── 내비게이션: 배경, 진행 막대, 현재 섹션, 모바일 메뉴 ── */
  var nav=$('.nav');
  var bar=$('.progress i');
  var navLinks=$$('.links a');
  var sections=navLinks.map(function(a){return document.getElementById(a.getAttribute('href').slice(1));});
  updaters.push(function(y,vh){
    nav.classList.toggle('scrolled',y>8);
    var max=document.documentElement.scrollHeight-vh;
    bar.style.transform='scaleX('+(max>0?clamp(y/max,0,1):0)+')';
    var cur=-1;
    for(var i=0;i<sections.length;i++){
      if(!sections[i])continue;
      var r=sections[i].getBoundingClientRect();
      if(r.top<vh*0.4&&r.bottom>vh*0.4)cur=i;
    }
    navLinks.forEach(function(a,i){
      var on=i===cur;
      a.classList.toggle('active',on);
      if(on)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');
    });
  });
  var menuBtn=$('#menu-btn');
  var links=$('#nav-links');
  function setMenu(open){
    links.classList.toggle('open',open);
    menuBtn.setAttribute('aria-expanded',String(open));
    menuBtn.querySelector('.sr').textContent=open?'메뉴 닫기':'메뉴 열기';
  }
  menuBtn.addEventListener('click',function(){setMenu(!links.classList.contains('open'));});
  navLinks.forEach(function(a){a.addEventListener('click',function(){setMenu(false);});});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&links.classList.contains('open')){setMenu(false);menuBtn.focus();}});

  /* ── 등장 연출: 화면 아래쪽 6% 선을 넘으면 나타남 ── */
  var pending=$$('[data-reveal]');
  if(motion){
    updaters.push(function(y,vh){
      if(!pending.length)return;
      pending=pending.filter(function(el){
        if(el.getBoundingClientRect().top<vh*0.94){el.classList.add('in');return false;}
        return true;
      });
    });
  }else{
    pending.forEach(function(el){el.classList.add('in');});
    pending=[];
  }

  /* 화면에 들어올 때 한 번 실행 */
  function onceVisible(el,fn,margin){
    if(!el)return;
    if(!('IntersectionObserver' in window)){fn();return;}
    var io=new IntersectionObserver(function(entries){
      if(entries[0].isIntersecting){io.disconnect();fn();}
    },{rootMargin:margin||'0px 0px -15% 0px'});
    io.observe(el);
  }

  /* ── 히어로: 토큰 구름 ── */
  (function(){
    var canvas=$('#cloud');
    var hero=$('.hero');
    var heroIn=$('.hero-in');
    if(!canvas||!canvas.getContext)return;
    var ctx=canvas.getContext('2d');
    var WORDS=['생각','요약','번역','코드','질문','초안','분석','설명','아이디어','수정','왜?','{ }','=>','fn()','∑','한국어','English','日本語','Hola','def','git','SQL','표','메일','보고서','계획','근거','단계','검토','토큰','맥락','예시','답','문장','Claude','λ','</>','→','%','?','!','x²','π'];
    var SYL='가나다라마바사아자차카타파하글말읽쓰고침답묻요약번역분석이유근거단계예시초안검토계획생각코드';
    var FONT='"IBM Plex Sans KR","Apple SD Gothic Neo","Malgun Gothic",sans-serif';
    var W=0,H=0,DPR=1,cx=0,cy=0,R=0,base=1,wide=true,textRight=0;
    var pts=[],sprites={};
    var rotY=0.6,rotX=-0.22,spin=0,mx=0,my=0,tmx=0,tmy=0,scrollP=0;
    var start=0,running=false,visible=true,lastHl=0;

    function sprite(word,big){
      var key=word+(big?'|b':'|n');
      if(sprites[key])return sprites[key];
      var fs=big?30:24;
      var c=document.createElement('canvas');
      var g=c.getContext('2d');
      g.font=(big?'600 ':'400 ')+fs+'px '+FONT;
      var w=Math.ceil(g.measureText(word).width)+8,h=Math.ceil(fs*1.4);
      var out={w:w,h:h,fs:fs,white:null,gold:null};
      ['white','gold'].forEach(function(tone){
        var cc=document.createElement('canvas');cc.width=w;cc.height=h;
        var gg=cc.getContext('2d');
        gg.font=(big?'600 ':'400 ')+fs+'px '+FONT;
        gg.textAlign='center';gg.textBaseline='middle';
        gg.fillStyle=tone==='gold'?'#FFE14D':(big?'#DCE1FF':'#ECEEF4');
        gg.fillText(word,w/2,h/2+1);
        out[tone]=cc;
      });
      sprites[key]=out;
      return out;
    }

    function build(){
      sprites={};
      var n=W<700?150:280;
      var golden=Math.PI*(3-Math.sqrt(5));
      pts=[];
      for(var i=0;i<n;i++){
        var y=1-(i/(n-1))*2,r=Math.sqrt(1-y*y),th=golden*i;
        var big=i%3===0;
        var word=big?WORDS[(i/3|0)%WORDS.length]:SYL.charAt((i*7)%SYL.length);
        pts.push({x:Math.cos(th)*r,y:y,z:Math.sin(th)*r,big:big,sp:sprite(word,big),
          sx:(Math.random()*2-1)*2.4,sy:(Math.random()*2-1)*2.4,sz:(Math.random()*2-1)*2.4,hl:0});
      }
    }

    function resize(){
      var rect=hero.getBoundingClientRect();
      W=Math.max(1,rect.width);H=Math.max(1,rect.height);
      DPR=Math.min(window.devicePixelRatio||1,2);
      canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);
      ctx.setTransform(DPR,0,0,DPR,0,0);
      wide=W>=900;
      if(wide){
        cx=W*0.77;cy=H*0.5;R=Math.min(W*0.21,H*0.4);base=1;
        var t=$('.hero-title').getBoundingClientRect(),hr=hero.getBoundingClientRect();
        textRight=Math.max($('.hero-sub').getBoundingClientRect().right,t.right)-hr.left;
      }else{
        // 좁은 화면: 제목 위에 따로 놓인 작은 구름 (CSS의 .hero-in 위쪽 여백과 맞춤)
        R=Math.min(W*0.28,112);cx=W*0.5;cy=nav.offsetHeight+20+R*1.08;base=0.9;textRight=0;
      }
      build();
      if(!running)draw(performance.now());
    }

    function draw(now){
      var t=(now-start)/1000;
      var intro=motion?clamp(t/1.8,0,1):1;
      var e=1-Math.pow(1-intro,3);
      if(motion)spin+=0.0021;
      mx+=(tmx-mx)*0.05;my+=(tmy-my)*0.05;
      var ry=rotY+spin+mx*0.6,rx=rotX+my*0.35;
      var cY=Math.cos(ry),sY=Math.sin(ry),cX=Math.cos(rx),sX=Math.sin(rx);
      var spread=1+scrollP*0.9,fade=clamp(1-scrollP*1.25,0,1);
      ctx.clearRect(0,0,W,H);
      if(fade<=0.001)return;

      // 주의(attention) 표시: 앞쪽 토큰 몇 개를 번갈아 밝힘
      if(motion&&now-lastHl>650&&intro>=1){
        lastHl=now;
        for(var k=0;k<3;k++){var p0=pts[(Math.random()*pts.length)|0];p0.hl=1;}
      }

      var proj=[];
      for(var i=0;i<pts.length;i++){
        var p=pts[i];
        var x=p.sx+(p.x-p.sx)*e,y=p.sy+(p.y-p.sy)*e,z=p.sz+(p.z-p.sz)*e;
        var x1=x*cY+z*sY,z1=-x*sY+z*cY;
        var y1=y*cX-z1*sX,z2=y*sX+z1*cX;
        var s=2.6/(2.6+z2);
        proj.push({p:p,X:cx+x1*R*spread*s,Y:cy+y1*R*spread*s,s:s,z:z2});
        if(motion)p.hl*=0.975;
      }
      proj.sort(function(a,b){return b.z-a.z;});

      // 밝힌 토큰끼리 가는 선으로 잇기
      var lit=proj.filter(function(q){return q.p.hl>0.25&&q.z<0.3;});
      if(lit.length>1){
        ctx.lineWidth=1;
        for(var j=1;j<lit.length;j++){
          var a=lit[j-1],b=lit[j];
          if(Math.abs(a.X-b.X)+Math.abs(a.Y-b.Y)>R*1.1)continue;
          ctx.strokeStyle='rgba(140,155,255,'+(Math.min(a.p.hl,b.p.hl)*0.45*fade*base)+')';
          ctx.beginPath();ctx.moveTo(a.X,a.Y);ctx.lineTo(b.X,b.Y);ctx.stroke();
        }
      }

      for(var m=0;m<proj.length;m++){
        var q=proj[m];
        var depth=(1-q.z)/2;
        var alpha=(0.08+depth*0.7)*fade*e*base;
        if(wide&&textRight)alpha*=clamp((q.X-textRight+80)/170,0.12,1);
        var sp=q.p.sp;
        var size=(q.p.big?15:12)*q.s*(W<700?0.9:1);
        var sc=size/sp.fs;
        var w=sp.w*sc,h=sp.h*sc;
        var gold=q.p.hl>0.15;
        ctx.globalAlpha=gold?clamp(Math.max(alpha,q.p.hl*fade*Math.max(base,0.6)),0,1):alpha;
        ctx.drawImage(gold?sp.gold:sp.white,q.X-w/2,q.Y-h/2,w,h);
      }
      ctx.globalAlpha=1;
    }

    function loop(now){
      if(!running)return;
      draw(now);
      requestAnimationFrame(loop);
    }
    function play(){if(running||!motion||!visible)return;running=true;requestAnimationFrame(loop);}
    function stop(){running=false;}

    start=performance.now();
    resize();
    window.addEventListener('resize',function(){resize();});
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){build();if(!running)draw(performance.now());});
    if(finePointer){
      window.addEventListener('pointermove',function(ev){tmx=ev.clientX/window.innerWidth-0.5;tmy=ev.clientY/window.innerHeight-0.5;},{passive:true});
    }
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(en){visible=en[0].isIntersecting;if(visible)play();else stop();}).observe(hero);
    }
    document.addEventListener('visibilitychange',function(){if(document.hidden)stop();else play();});
    updaters.push(function(y,vh){
      var h=hero.offsetHeight||vh;
      scrollP=clamp(y/h,0,1);
      if(motion){
        heroIn.style.transform='translate3d(0,'+(scrollP*70).toFixed(1)+'px,0)';
        heroIn.style.opacity=String(clamp(1-scrollP*1.4,0,1));
      }
      if(!running)draw(performance.now());
    });
    play();
  })();

  /* ── 히어로: 저절로 입력되는 요청 ── */
  (function(){
    var out=$('#typed'),send=$('#send');
    if(!out)return;
    var prompts=['회의록에서 결정된 것만 추려 줘','이 에러 메시지가 무슨 뜻이야?','부산 2박 3일 여행 일정 짜 줘','이 문장을 더 자연스럽게 고쳐 줘','엑셀에서 중복된 행 지우는 법 알려 줘','면접 예상 질문 다섯 개만 뽑아 줘'];
    if(!motion){out.textContent=prompts[0];send.classList.add('ready');return;}
    var i=0;
    function type(text,k){
      out.textContent=text.slice(0,k);
      send.classList.toggle('ready',k>0);
      if(k<text.length){setTimeout(function(){type(text,k+1);},55+Math.random()*60);}
      else setTimeout(function(){send.classList.add('fire');setTimeout(function(){send.classList.remove('fire');erase(text,text.length);},260);},1500);
    }
    function erase(text,k){
      out.textContent=text.slice(0,k);
      if(k>0)setTimeout(function(){erase(text,k-1);},18);
      else{send.classList.remove('ready');i=(i+1)%prompts.length;setTimeout(function(){type(prompts[i],1);},380);}
    }
    setTimeout(function(){type(prompts[0],1);},1200);
  })();

  /* ── 예시 대화 ── */
  (function(){
    var chat=$('#chat');
    if(!chat)return;
    var AV='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 5l3 3-3 3" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><rect x="9" y="10" width="3.5" height="1.6" rx=".8" fill="#FFE14D"/></svg>';
    var DATA={
      write:{
        user:'팀장님께 보낼 휴가 신청 메일 써 줘. 다음 주 목요일, 금요일이고 정중하지만 짧게.',
        reply:[
          ['p','이렇게 써 보면 어떨까요?'],
          ['mail','제목: 휴가 신청드립니다 (다음 주 목·금)\n\n팀장님, 안녕하세요.\n다음 주 목요일과 금요일, 이틀간 연차 휴가를 신청드리려고 합니다.\n진행 중인 업무는 수요일까지 정리하고, 급한 일은 ○○ 님께 인수인계해 두겠습니다.\n검토 부탁드립니다. 감사합니다.'],
          ['p','인수인계할 분과 업무를 알려 주시면 그 부분을 더 구체적으로 채워 드릴게요.']
        ]
      },
      code:{
        user:'이 함수가 가끔 undefined를 돌려줘. 왜 그래?',
        userCode:'function findUser(users, id) {\n  users.forEach(u => {\n    if (u.id === id) return u;\n  });\n}',
        reply:[
          ['p','가끔이 아니라 항상 undefined가 나와요. forEach 안의 return은 콜백만 끝낼 뿐, findUser는 아무것도 돌려주지 않거든요.'],
          ['code','function findUser(users, id) {\n  return users.find(u => u.id === id);\n}'],
          ['p','find는 조건에 맞는 첫 항목을 돌려주고, 없으면 undefined를 돌려줘요. 못 찾았을 때 따로 처리하는 부분도 같이 볼까요?']
        ]
      },
      data:{
        user:'고객 설문 응답을 붙여 넣었어. 불만이 가장 많은 부분이 뭐야?',
        reply:[
          ['p','응답을 주제별로 묶어 보면 세 가지가 두드러져요.'],
          ['ul',['배송: “예정일보다 늦게 왔다”는 내용이 가장 자주 나와요.','환불 절차: 단계가 많고 답변이 느리다는 의견이 이어져요.','앱 로그인: 최근 업데이트 뒤로 로그인이 풀린다는 응답이 몰려 있어요.']],
          ['p','주제별 응답 수를 표로 정리하고, 대표 응답을 하나씩 뽑아 드릴까요?']
        ]
      },
      lang:{
        user:'이 문장을 자연스러운 영어로 바꿔 줘. “늦어서 죄송해요, 금방 갈게요!”',
        reply:[
          ['p','상황에 따라 이렇게 쓸 수 있어요.'],
          ['ul',['친구나 동료에게: “Sorry, running late! I’ll be there soon.”','조금 더 격식 있게: “I apologize for the delay. I’ll be there shortly.”']],
          ['p','메시지로 보낸다면 첫 번째가 더 자연스러워요.']
        ]
      },
      learn:{
        user:'하늘은 왜 파래? 초등학생한테 설명하듯이 알려 줘.',
        reply:[
          ['p','햇빛에는 빨강부터 보라까지 여러 색의 빛이 섞여 있어요.'],
          ['p','이 빛이 공기를 지나갈 때, 파란빛처럼 파장이 짧은 빛은 공기 알갱이에 부딪혀 사방으로 훨씬 많이 흩어져요. 그래서 하늘 어디를 봐도 파란빛이 우리 눈에 들어와요.'],
          ['p','해 질 녘에는 햇빛이 더 먼 길을 지나오느라 파란빛이 중간에 거의 다 흩어지고, 남은 빨강과 주황이 보여요. 그래서 노을은 붉어요.']
        ]
      }
    };
    var tabs=$$('.tabs [role="tab"]');
    var panel=$('#demo-panel');
    var runId=0,current='write',started=false;

    function el(tag,cls,text){var n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n;}
    function wait(ms,id){return new Promise(function(res,rej){setTimeout(function(){id===runId?res():rej('stale');},ms);});}

    function streamInto(node,text,id){
      if(!motion){node.textContent=text;return Promise.resolve();}
      var caret=el('span','stream-caret');
      var k=0;
      return new Promise(function(res,rej){
        (function step(){
          if(id!==runId){rej('stale');return;}
          k=Math.min(text.length,k+1+((Math.random()*3)|0));
          node.textContent=text.slice(0,k);node.appendChild(caret);
          if(k<text.length)setTimeout(step,22+Math.random()*28);
          else{caret.remove();res();}
        })();
      });
    }

    function play(key){
      var id=++runId;current=key;
      var d=DATA[key];
      chat.innerHTML='';
      chat.setAttribute('aria-busy','true');
      var u=el('div','msg user msg-enter');
      u.appendChild(el('p',null,d.user));
      if(d.userCode)u.appendChild(el('pre',null,d.userCode));
      chat.appendChild(u);
      var c=el('div','msg claude msg-enter');
      var av=el('span','av');av.innerHTML=AV;c.appendChild(av);
      var bd=el('div','bd');c.appendChild(bd);
      var typing=el('span','typing');typing.innerHTML='<i></i><i></i><i></i>';typing.setAttribute('aria-hidden','true');
      var sr=el('span','sr','Claude의 답');bd.appendChild(sr);
      return wait(motion?450:0,id).then(function(){
        chat.appendChild(c);bd.appendChild(typing);
        return wait(motion?700:0,id);
      }).then(function(){
        typing.remove();
        var chain=Promise.resolve();
        d.reply.forEach(function(block){
          chain=chain.then(function(){
            var type=block[0];
            if(type==='ul'){
              var ul=el('ul');bd.appendChild(ul);
              var inner=Promise.resolve();
              block[1].forEach(function(item){inner=inner.then(function(){var li=el('li');ul.appendChild(li);return streamInto(li,item,id);});});
              return inner;
            }
            var node=type==='code'?el('pre'):type==='mail'?el('div','mail'):el('p');
            bd.appendChild(node);
            return streamInto(node,block[1],id).then(function(){return wait(motion?160:0,id);});
          });
        });
        return chain;
      }).then(function(){chat.setAttribute('aria-busy','false');},function(){});
    }

    function select(tab,focus){
      tabs.forEach(function(t){var on=t===tab;t.setAttribute('aria-selected',String(on));t.tabIndex=on?0:-1;});
      panel.setAttribute('aria-labelledby',tab.id);
      if(focus)tab.focus();
      if(tab.scrollIntoView&&window.innerWidth<900){
        var box=tab.parentNode;box.scrollTo({left:tab.offsetLeft-box.clientWidth/2+tab.offsetWidth/2,behavior:motion?'smooth':'auto'});
      }
      play(tab.getAttribute('data-k'));
    }
    tabs.forEach(function(t,i){
      t.addEventListener('click',function(){select(t,false);});
      t.addEventListener('keydown',function(e){
        var n=null;
        if(e.key==='ArrowRight'||e.key==='ArrowDown')n=tabs[(i+1)%tabs.length];
        else if(e.key==='ArrowLeft'||e.key==='ArrowUp')n=tabs[(i-1+tabs.length)%tabs.length];
        else if(e.key==='Home')n=tabs[0];
        else if(e.key==='End')n=tabs[tabs.length-1];
        if(n){e.preventDefault();select(n,true);}
      });
    });
    $('#replay').addEventListener('click',function(){play(current);});

    // 처음에는 완성된 대화를 보여 두고, 화면에 들어오면 재생
    (function renderStatic(){
      var d=DATA.write;
      var u=el('div','msg user');u.appendChild(el('p',null,d.user));chat.appendChild(u);
      var c=el('div','msg claude');var av=el('span','av');av.innerHTML=AV;c.appendChild(av);
      var bd=el('div','bd');c.appendChild(bd);bd.appendChild(el('span','sr','Claude의 답'));
      d.reply.forEach(function(block){
        if(block[0]==='ul'){var ul=el('ul');block[1].forEach(function(t){ul.appendChild(el('li',null,t));});bd.appendChild(ul);}
        else bd.appendChild(el(block[0]==='code'?'pre':block[0]==='mail'?'div':'p',block[0]==='mail'?'mail':null,block[1]));
      });
      chat.appendChild(c);
    })();
    onceVisible(panel,function(){if(!started){started=true;if(motion)play('write');}},'0px 0px -25% 0px');
  })();

  /* ── 카드 스포트라이트와 자석 버튼 ── */
  if(finePointer){
    $$('.card').forEach(function(card){
      card.addEventListener('pointermove',function(e){
        var r=card.getBoundingClientRect();
        card.style.setProperty('--mx',(e.clientX-r.left)+'px');
        card.style.setProperty('--my',(e.clientY-r.top)+'px');
      });
    });
    if(motion){
      $$('.magnetic').forEach(function(b){
        b.addEventListener('pointermove',function(e){
          var r=b.getBoundingClientRect();
          var dx=(e.clientX-r.left-r.width/2)*0.18,dy=(e.clientY-r.top-r.height/2)*0.28;
          b.style.transform='translate('+dx.toFixed(1)+'px,'+dy.toFixed(1)+'px)';
        });
        b.addEventListener('pointerleave',function(){b.style.transform='';});
      });
    }
    var final=$('.final');
    if(final){
      final.addEventListener('pointermove',function(e){
        var r=final.getBoundingClientRect();
        final.style.setProperty('--gx',(e.clientX-r.left)+'px');
        final.style.setProperty('--gy',(e.clientY-r.top)+'px');
      });
    }
  }

  /* ── 부탁하는 법: 스크롤에 따라 입력창이 채워짐 ── */
  (function(){
    var composer=$('#composer'),hint=$('#composer-hint');
    var steps=$$('.step');
    if(!composer||!steps.length)return;
    var hints=['하려는 일부터 적어 보세요','맥락을 더하면 어조가 맞춰져요','조건을 정하면 결과가 선명해져요','주고받으며 다듬어요'];
    var last=-1;
    updaters.push(function(y,vh){
      if(window.innerWidth<960)return;
      var mid=vh*0.5,active=0;
      steps.forEach(function(s,i){var r=s.getBoundingClientRect();if(r.top<mid)active=i+1;});
      if(active===last)return;
      last=active;
      composer.setAttribute('data-step',String(active));
      steps.forEach(function(s,i){s.classList.toggle('on',i+1===active||(active===0&&i===0));});
      hint.textContent=hints[Math.max(0,active-1)];
    });
  })();

  /* ── 원칙: 스크롤하면 글자가 채워짐 ── */
  (function(){
    var p=$('#fill');
    if(!p||!motion)return;
    var text=p.textContent;
    var marks=['도움이','모른다고','고쳐요.','거절해요.','맡겨요.'];
    p.textContent='';
    var words=[];
    text.split(/(\s+)/).forEach(function(part){
      if(!part)return;
      if(/^\s+$/.test(part)){p.appendChild(document.createTextNode(part));return;}
      var s=document.createElement('span');s.className='w';s.textContent=part;
      if(marks.indexOf(part)>-1)s.classList.add('hl');
      p.appendChild(s);words.push(s);
    });
    var lastN=-1;
    updaters.push(function(y,vh){
      var r=p.getBoundingClientRect();
      var prog=clamp((vh*0.85-r.top)/(r.height+vh*0.35),0,1);
      var n=Math.round(prog*words.length);
      if(n===lastN)return;
      lastN=n;
      for(var i=0;i<words.length;i++)words[i].classList.toggle('lit',i<n);
    });
  })();

  /* ── 만든 과정: 기록 한 줄씩, 숫자 세기 ── */
  (function(){
    var term=$('#term');
    if(term&&motion){
      $$('.tl',term).forEach(function(l,i){l.style.setProperty('--i',i);});
      term.classList.remove('play');
      onceVisible(term,function(){term.classList.add('play');});
    }
    $$('.count').forEach(function(c){
      var to=parseInt(c.getAttribute('data-to'),10)||0;
      if(!motion||to===0)return;
      onceVisible(c,function(){
        var t0=performance.now(),dur=900;
        (function tick(now){
          var k=clamp((now-t0)/dur,0,1);
          c.textContent=String(Math.round(to*(1-Math.pow(1-k,3))));
          if(k<1)requestAnimationFrame(tick);
        })(t0);
      });
    });
  })();

  runUpdaters();
})();
