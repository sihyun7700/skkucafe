"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LayerGroup, Map as LeafletMap } from "leaflet";

type Campus = "명륜" | "율전";
type FilterKey = "outlet" | "noise" | "seat" | "table";
type Cafe = {
  name:string; location:string; vibe:string; outlets:string; restroom:string; hours:string;
  wifi:string; note?:string; image:string; lat:number; lng:number;
  outlet:string; noise:string; seat:string; table:string;
};
type RecommendationState={count:number;recommended:boolean;loading:boolean};

const cafes: Record<Campus, Cafe[]> = {
  명륜: [
    {name:"낫컴플리트",location:"정문에서 도보",vibe:"대화 > 공부",outlets:"많음",restroom:"반층 아래",hours:"12:00–20:00",wifi:"O",image:"/cafes/cafe-12.webp",lat:37.584213510920414,lng:126.99811154222641,outlet:"많음",noise:"대화 많은 편",seat:"일반 좌석",table:"일반 테이블"},
    {name:"토니씨의 작업실",location:"정문에서 도보",vibe:"조용·차분",outlets:"많음",restroom:"내부",hours:"24시간",wifi:"O",note:"밥 먹고 와도 OK",image:"/cafes/cafe-13.webp",lat:37.58387473031498,lng:126.99770850047214,outlet:"많음",noise:"조용한 편",seat:"스터디 좌석",table:"1인 테이블"},
    {name:"캐치카페 혜화",location:"혜화역 도보",vibe:"스터디카페",outlets:"많음",restroom:"내부",hours:"12:00–22:00",wifi:"O",note:"무료 스터디 카페",image:"/cafes/cafe-14.webp",lat:37.582660207368775,lng:126.99879992586976,outlet:"많음",noise:"조용한 편",seat:"스터디 좌석",table:"넓은 테이블"},
    {name:"킹스커피 24시 카페",location:"혜화역 도보",vibe:"2층 대화 · 3층 카공",outlets:"3층에 많음",restroom:"내부",hours:"24시간",wifi:"O",image:"/cafes/cafe-15.webp",lat:37.58293771566033,lng:126.99905352292744,outlet:"많음",noise:"공간별 분리",seat:"스터디 좌석",table:"넓은 테이블"},
    {name:"카페 알프카",location:"혜화역 도보",vibe:"대화 < 공부",outlets:"적음",restroom:"내부",hours:"08:00–22:00",wifi:"O",image:"/cafes/cafe-16.webp",lat:37.58320801728019,lng:126.99978262648929,outlet:"적음",noise:"조용한 편",seat:"일반 좌석",table:"일반 테이블"},
    {name:"투썸플레이스 혜화대명로점",location:"혜화역",vibe:"4층은 조용",outlets:"4층에 많음",restroom:"내부",hours:"10:00–22:30",wifi:"O",image:"/cafes/cafe-17.webp",lat:37.58375942053458,lng:127.00107328962544,outlet:"많음",noise:"공간별 분리",seat:"스터디 좌석",table:"벽·창가 테이블"},
    {name:"스타벅스 동숭길입구점",location:"혜화역",vibe:"대화 > 공부",outlets:"적음",restroom:"내부",hours:"07:00–22:00",wifi:"O",image:"/cafes/cafe-18.webp",lat:37.58417026338912,lng:127.00187939933494,outlet:"적음",noise:"대화 많은 편",seat:"일반 좌석",table:"일반 테이블"},
    {name:"프롬하츠커피 대학로점",location:"혜화역",vibe:"대화 < 공부",outlets:"적음",restroom:"내부",hours:"10:00–23:00",wifi:"O",image:"/cafes/cafe-19.webp",lat:37.58255929185892,lng:127.00156235855121,outlet:"적음",noise:"조용한 편",seat:"일반 좌석",table:"일반 테이블"},
    {name:"콘크리트 팔레트",location:"혜화역",vibe:"대화 < 공부",outlets:"보통 (벽쪽 자리만)",restroom:"내부",hours:"10:00–22:00",wifi:"O",note:"창가 자리 짐박스 있음",image:"/cafes/cafe-20.webp",lat:37.58246919321529,lng:127.00150801382772,outlet:"보통",noise:"조용한 편",seat:"일반 좌석",table:"벽·창가 테이블"},
    {name:"스터디카페 스페로",location:"혜화역 도보",vibe:"스터디카페",outlets:"많음",restroom:"외부",hours:"24시간",wifi:"O",image:"/cafes/cafe-21.webp",lat:37.58264939654368,lng:126.99891314056752,outlet:"많음",noise:"조용한 편",seat:"스터디 좌석",table:"1인 테이블"},
    {name:"할리스 성균관대점",location:"정문에서 도보",vibe:"대화 > 공부 · 3·4층 스터디존",outlets:"많음 · 카공 자리 O",restroom:"내부",hours:"09:00–25:00",wifi:"O",image:"/cafes/cafe-22.webp",lat:37.58353957227792,lng:126.99840592051844,outlet:"많음",noise:"공간별 분리",seat:"스터디 좌석",table:"벽·창가 테이블"},
    {name:"에이라운드",location:"혜화역 도보 10분",vibe:"대화 > 공부",outlets:"많음",restroom:"외부",hours:"10:00–20:30",wifi:"O",note:"노트북 작업 추천",image:"/cafes/cafe-23.webp",lat:37.58487665662665,lng:127.00030342396457,outlet:"많음",noise:"대화 많은 편",seat:"노트북 좌석",table:"벽·창가 테이블"},
  ],
  율전: [
    {name:"자명문",location:"성균관대역",vibe:"대화 + 공부",outlets:"보통",restroom:"외부 · 오래됨",hours:"08:00–22:00",wifi:"O",image:"/cafes/cafe-01.webp",lat:37.29925830590224,lng:126.96996220009322,outlet:"보통",noise:"균형",seat:"일반 좌석",table:"일반 테이블"},
    {name:"스타벅스 수원성균관대점",location:"성균관대역",vibe:"대화 > 공부",outlets:"보통",restroom:"외부",hours:"08:00–22:00",wifi:"O",image:"/cafes/cafe-02.webp",lat:37.2988802682898,lng:126.97157296031762,outlet:"보통",noise:"대화 많은 편",seat:"일반 좌석",table:"일반 테이블"},
    {name:"하우짓 블랙",location:"성균관대역 도보",vibe:"대화 + 공부",outlets:"보통",restroom:"내부",hours:"08:00–22:00",wifi:"O",image:"/cafes/cafe-03.webp",lat:37.298502030366016,lng:126.97240772826139,outlet:"보통",noise:"균형",seat:"일반 좌석",table:"일반 테이블"},
    {name:"투썸플레이스 수원성균관대점",location:"성균관대역 도보",vibe:"대화 > 공부",outlets:"많음",restroom:"내부",hours:"08:00–24:00",wifi:"O",image:"/cafes/cafe-04.webp",lat:37.29673525940457,lng:126.96940379173547,outlet:"많음",noise:"대화 많은 편",seat:"일반 좌석",table:"일반 테이블"},
    {name:"투썸플레이스 수원율전점",location:"성균관대역",vibe:"대화 > 공부",outlets:"많음",restroom:"외부",hours:"08:00–22:00",wifi:"O",image:"/cafes/cafe-05.webp",lat:37.30123040169886,lng:126.97254659279474,outlet:"많음",noise:"대화 많은 편",seat:"일반 좌석",table:"일반 테이블"},
    {name:"오르카 커피룸",location:"성균관대역",vibe:"대화 + 공부",outlets:"적음",restroom:"외부 · 깔끔",hours:"11:00–22:00",wifi:"O",image:"/cafes/cafe-06.webp",lat:37.29973424094715,lng:126.97071093033335,outlet:"적음",noise:"균형",seat:"일반 좌석",table:"일반 테이블"},
    {name:"MLMC",location:"천천동 · 역 도보 10분+",vibe:"대화 + 공부",outlets:"많음",restroom:"내부",hours:"08:00–22:00",wifi:"O",image:"/cafes/cafe-07.webp",lat:37.29680629025117,lng:126.98177850156334,outlet:"많음",noise:"균형",seat:"일반 좌석",table:"넓은 테이블"},
    {name:"아이엠바리스타",location:"성균관대역 도보",vibe:"대화 + 공부",outlets:"멀티탭 O",restroom:"외부 · 오래됨",hours:"11:30–22:30",wifi:"?",note:"팀플 가능 · 넓은 테이블",image:"/cafes/cafe-08.webp",lat:37.29868940804291,lng:126.97224524578185,outlet:"많음",noise:"균형",seat:"팀플 좌석",table:"넓은 테이블"},
    {name:"스터디카페 콤마",location:"성균관대역 도보",vibe:"스터디카페",outlets:"많음",restroom:"내부 · 깔끔",hours:"24시간",wifi:"O",image:"/cafes/cafe-09.webp",lat:37.298999026227705,lng:126.97083753796214,outlet:"많음",noise:"조용한 편",seat:"스터디 좌석",table:"1인 테이블"},
    {name:"카페 디깅",location:"성균관대역 도보",vibe:"스터디카페",outlets:"전 좌석 콘센트",restroom:"여자 내부 · 남자 반층 위",hours:"24시간",wifi:"O",note:"화장실 깔끔",image:"/cafes/cafe-10.webp",lat:37.299085741405484,lng:126.971726274825,outlet:"전 좌석",noise:"조용한 편",seat:"스터디 좌석",table:"1인 테이블"},
    {name:"전율",location:"성균관대역 도보",vibe:"대화 < 공부",outlets:"많음",restroom:"여자 내부 · 남자 외부",hours:"12:00–23:00",wifi:"O",note:"성균관대생 할인",image:"/cafes/cafe-11.webp",lat:37.29766489647566,lng:126.96851466157949,outlet:"많음",noise:"조용한 편",seat:"스터디 좌석",table:"일반 테이블"},
  ],
};

const campusInfo = {
  명륜:{title:"명륜캠퍼스",sub:"인문사회과학캠퍼스 · 서울 혜화",center:[37.5844,126.9985] as [number,number],school:[37.5891,126.9917] as [number,number],zoom:15},
  율전:{title:"율전캠퍼스",sub:"자연과학캠퍼스 · 수원 율전",center:[37.2991,126.9732] as [number,number],school:[37.2934,126.9756] as [number,number],zoom:15},
};

const campusBoundaries:Record<Campus,[number,number][]>= {
  명륜:[[37.5875365,126.9893055],[37.5873832,126.9894754],[37.5871965,126.9895092],[37.5870254,126.9896098],[37.5870285,126.9897841],[37.5869244,126.9897908],[37.586935,126.9900792],[37.5867937,126.9905217],[37.5868886,126.9905014],[37.5868943,126.9905648],[37.5869095,126.9907313],[37.5869475,126.9908905],[37.5870037,126.9910876],[37.5870208,126.9912557],[37.5870209,126.9914372],[37.5870633,126.9918066],[37.587111,126.9919867],[37.5871927,126.9921767],[37.5872151,126.9923372],[37.5872141,126.992441],[37.587193,126.9925592],[37.587144,126.9927058],[37.5871039,126.9928435],[37.587128,126.9929814],[37.5871439,126.9930298],[37.5871912,126.9931549],[37.587228,126.9932738],[37.5872568,126.9934612],[37.5872356,126.9936211],[37.5871828,126.9937532],[37.5871267,126.9938326],[37.5869585,126.9939528],[37.586557,126.9942006],[37.5860929,126.9945441],[37.5857014,126.9948574],[37.5853197,126.9951135],[37.5852287,126.995124],[37.5849447,126.9952952],[37.5847253,126.9956412],[37.5846599,126.9958014],[37.584512,126.9963784],[37.5844306,126.9968005],[37.5845534,126.9968547],[37.5846275,126.9969219],[37.5848051,126.9969406],[37.5848285,126.996994],[37.5851041,126.9969537],[37.5851899,126.9969257],[37.5851506,126.9966328],[37.5857412,126.996458],[37.5857727,126.9966372],[37.5860957,126.9965561],[37.5863282,126.9964942],[37.5864919,126.9964491],[37.5864688,126.9962607],[37.5866468,126.9961781],[37.586706,126.9961039],[37.5866646,126.9958028],[37.5864157,126.9958794],[37.5863782,126.9957123],[37.5864863,126.9956483],[37.5867071,126.9955864],[37.5868803,126.9956237],[37.5872655,126.9953892],[37.5871764,126.9951847],[37.5878084,126.9947757],[37.5879059,126.9947004],[37.5879689,126.9945864],[37.5880482,126.9945271],[37.5881607,126.9945254],[37.588213,126.9946029],[37.5883105,126.9946405],[37.5884078,126.994658],[37.5884796,126.9947457],[37.588501,126.9948573],[37.5886296,126.9948368],[37.5887734,126.9948224],[37.5888129,126.9947008],[37.5887952,126.9944788],[37.5885252,126.9938332],[37.5885658,126.9937928],[37.5886972,126.9936652],[37.5887774,126.9935685],[37.5887269,126.9934872],[37.5887911,126.993369],[37.5890052,126.9932127],[37.5890985,126.9930943],[37.5890936,126.9929259],[37.5890751,126.9927941],[37.5891698,126.9926791],[37.5892803,126.9925712],[37.589364,126.992467],[37.5894397,126.9923229],[37.5894859,126.9922092],[37.5894735,126.9921233],[37.5896621,126.991837],[37.5892601,126.9896],[37.5875365,126.9893055]],
  율전:[[37.2908958,126.9701796],[37.2907516,126.9740962],[37.290714,126.9749024],[37.2907122,126.9749394],[37.290691,126.975388],[37.2906474,126.9756146],[37.2906346,126.9757286],[37.2909361,126.9760203],[37.2910869,126.9764429],[37.2910093,126.9767983],[37.2911709,126.9771678],[37.2912965,126.9780265],[37.291282,126.9783542],[37.2912802,126.9785575],[37.2913105,126.9785872],[37.2923495,126.9790871],[37.2925412,126.9791543],[37.2928079,126.979166],[37.2933509,126.9790603],[37.2938572,126.9789344],[37.2938826,126.9789281],[37.2939163,126.9789152],[37.2942478,126.9787916],[37.2944953,126.978695],[37.2946998,126.9786189],[37.2948321,126.9785634],[37.2951927,126.9784248],[37.2954402,126.9781225],[37.2955375,126.9782007],[37.2958512,126.978093],[37.2961908,126.978032],[37.2963848,126.9780647],[37.296527,126.9779754],[37.2965635,126.9779612],[37.2971025,126.9777522],[37.2962901,126.9765832],[37.2963275,126.9765145],[37.2969976,126.9752817],[37.297245,126.974829],[37.2973011,126.9747301],[37.2974066,126.9744408],[37.2973966,126.9743179],[37.2973961,126.9742891],[37.2973895,126.9739377],[37.2970097,126.9738871],[37.2968098,126.9734485],[37.2966233,126.9729381],[37.2967414,126.972432],[37.2967943,126.9720985],[37.2966834,126.9719234],[37.2966727,126.9717788],[37.2965245,126.9716485],[37.2965632,126.9711599],[37.2965909,126.9708108],[37.2966001,126.9706344],[37.2963231,126.9705721],[37.2961495,126.9705117],[37.2958252,126.9704025],[37.2952828,126.9703131],[37.2929487,126.9702625],[37.2908958,126.9701796]],
};

const filterOptions: Record<FilterKey,string[]> = {
  outlet:["전체","전 좌석","많음","보통","적음"],
  noise:["전체","조용한 편","균형","공간별 분리","대화 많은 편"],
  seat:["전체","스터디 좌석","노트북 좌석","팀플 좌석","일반 좌석"],
  table:["전체","1인 테이블","넓은 테이블","벽·창가 테이블","일반 테이블"],
};
const filterLabels:Record<FilterKey,string>={outlet:"콘센트",noise:"소음",seat:"좌석",table:"테이블"};

function RealMap({campus,items,active,onPreview,onSelect}:{campus:Campus;items:Cafe[];active:string;onPreview:(name:string)=>void;onSelect:(name:string)=>void}) {
  const elementRef=useRef<HTMLDivElement>(null);
  const mapRef=useRef<LeafletMap|null>(null);
  const layerRef=useRef<LayerGroup|null>(null);
  const [ready,setReady]=useState(0);

  useEffect(()=>{let cancelled=false;(async()=>{
    if(!elementRef.current)return;
    const L=await import("leaflet");if(cancelled||!elementRef.current)return;
    mapRef.current?.remove();
    const info=campusInfo[campus];
    const map=L.map(elementRef.current,{zoomControl:true,scrollWheelZoom:false}).setView(info.center,info.zoom);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',maxZoom:19}).addTo(map);
    const layer=L.layerGroup().addTo(map);
    const schoolIcon=L.divIcon({className:"school-map-icon",html:"<span><b>학교</b><small>성균관대학교 캠퍼스</small></span>",iconSize:[126,82],iconAnchor:[63,82]});
    L.marker(info.school,{icon:schoolIcon,title:"성균관대학교"}).addTo(layer);
    L.polygon(campusBoundaries[campus],{color:"#e96537",weight:4,opacity:.95,fillColor:"#e96537",fillOpacity:.07,dashArray:"11 7",interactive:false,className:"campus-boundary"}).addTo(map);
    const cafePoints=cafes[campus].map(c=>[c.lat,c.lng] as [number,number]);
    if(campus==="명륜"){
      const visibleBounds=L.latLngBounds([...cafePoints,info.school]);
      map.fitBounds(visibleBounds,{padding:[120,100],maxZoom:15});
      map.setZoom(Math.min(map.getZoom()+1,16));
      map.panBy([-42,-28],{animate:false});
    }else{
      const allPoints=[...campusBoundaries[campus],...cafePoints];
      map.fitBounds(allPoints,{padding:[54,54],maxZoom:15});
      const cafeBounds=L.latLngBounds(cafePoints);
      const cafeFitZoom=map.getBoundsZoom(cafeBounds,false,L.point(120,70));
      const currentInitialZoom=Math.min(map.getZoom()+1,cafeFitZoom,16);
      map.setView(cafeBounds.getCenter(),Math.min(currentInitialZoom+1,17));
    }
    mapRef.current=map;layerRef.current=layer;setReady(value=>value+1);
    setTimeout(()=>map.invalidateSize(),50);
  })();return()=>{cancelled=true;mapRef.current?.remove();mapRef.current=null;layerRef.current=null}},[campus]);

  useEffect(()=>{(async()=>{
    const layer=layerRef.current;if(!layer)return;
    const L=await import("leaflet");
    layer.eachLayer(candidate=>{if((candidate as {options?:{title?:string}}).options?.title!=="성균관대학교")layer.removeLayer(candidate)});
    items.forEach(c=>{
      const selected=c.name===active;
      const icon=L.divIcon({className:"cafe-map-icon",html:`<span class="${selected?"selected":""}"><i></i><b>${c.name}</b></span>`,iconSize:[180,32],iconAnchor:[16,28]});
      L.marker([c.lat,c.lng],{icon,title:c.name}).addTo(layer)
        .on("mouseover focus",()=>onPreview(c.name))
        .on("click",()=>onSelect(c.name));
    });
  })()},[items,active,onPreview,onSelect,ready]);
  return <div className="real-map sketch-styled" ref={elementRef} aria-label={`${campus}캠퍼스 실제 위치 지도`} />;
}

export default function Home(){
  const [campus,setCampus]=useState<Campus|null>(null);
  const [active,setActive]=useState("");
  const [filters,setFilters]=useState<Record<FilterKey,string>>({outlet:"전체",noise:"전체",seat:"전체",table:"전체"});
  const [recommendation,setRecommendation]=useState<RecommendationState>({count:0,recommended:false,loading:false});
  const detailRef=useRef<HTMLElement>(null);
  const filtered=useMemo(()=>campus?cafes[campus].filter(c=>(Object.keys(filters) as FilterKey[]).every(k=>filters[k]==="전체"||c[k]===filters[k])):[],[campus,filters]);
  const selected=campus?(cafes[campus].find(c=>c.name===active)||filtered[0]||cafes[campus][0]):null;
  useEffect(()=>{if(filtered.length&&!filtered.some(c=>c.name===active))setActive(filtered[0].name)},[filtered,active]);
  useEffect(()=>{
    if(!selected)return;
    const controller=new AbortController();
    setRecommendation(current=>({...current,loading:true}));
    fetch(`/api/recommendations?cafe=${encodeURIComponent(selected.name)}`,{signal:controller.signal})
      .then(response=>response.ok?response.json():Promise.reject())
      .then((data:{count:number;recommended:boolean})=>setRecommendation({...data,loading:false}))
      .catch(()=>{if(!controller.signal.aborted)setRecommendation({count:0,recommended:false,loading:false})});
    return()=>controller.abort();
  },[selected?.name]);

  const toggleRecommendation=async()=>{
    if(!selected||recommendation.loading)return;
    setRecommendation(current=>({...current,loading:true}));
    try{
      const response=await fetch(`/api/recommendations?cafe=${encodeURIComponent(selected.name)}`,{method:recommendation.recommended?"DELETE":"POST"});
      if(!response.ok)throw new Error();
      const data=await response.json() as {count:number;recommended:boolean};
      setRecommendation({...data,loading:false});
    }catch{setRecommendation(current=>({...current,loading:false}))}
  };

  const selectCafeFromMap=useCallback((name:string)=>{
    setActive(name);
    requestAnimationFrame(()=>requestAnimationFrame(()=>detailRef.current?.scrollIntoView({behavior:"smooth",block:"start"})));
  },[]);

  if(!campus)return <main className="entry">
    <header className="entry-head"><div className="brand"><span aria-hidden="true">☕</span><div><strong className="brand-title">SKKU <b>STUDY CAFE</b></strong><small>학교 주변 카페를 찾아보세요!</small></div></div></header>
    <section className="entry-copy"><p className="eyebrow">CHOOSE YOUR CAFE</p><h1>성대생의 카페를 찾아라!</h1><p>먼저 캠퍼스를 선택해주세요</p></section>
    <section className="campus-cards">{(["명륜","율전"] as Campus[]).map(c=><button key={c} onClick={()=>{setCampus(c);setActive(cafes[c][0].name)}} className={c==="명륜"?"light":"dark"}>
      <div className={`mascot-crop ${c==="명륜"?"mascot-myeongnyun":"mascot-yuljeon"}`} role="img" aria-label={`${c}캠퍼스 캐릭터`}/>
      <span className="campus-sub">{campusInfo[c].sub}</span><strong>{campusInfo[c].title}</strong><span className="enter-link">카페 {cafes[c].length}곳 탐색하기 <b>→</b></span>
    </button>)}</section>
    <footer>SKKU STUDY CAFE FINDER</footer>
  </main>;

  const clearFilters=()=>setFilters({outlet:"전체",noise:"전체",seat:"전체",table:"전체"});
  return <main>
    <header className="map-head"><button className="brand brand-button" onClick={()=>setCampus(null)} aria-label="캠퍼스 다시 선택"><span aria-hidden="true">☕</span><div><strong className="brand-title">SKKU <b>STUDY CAFE</b></strong><small>학교 주변 카페를 찾아보세요!</small></div></button><div className="campus-tabs">{(["명륜","율전"] as Campus[]).map(c=><button key={c} className={campus===c?"active":""} onClick={()=>{setCampus(c);setActive(cafes[c][0].name);clearFilters()}}>{c}캠퍼스</button>)}</div></header>
    <section className="map-intro"><div><p className="eyebrow">REAL LOCATION · SKETCH STYLE</p><h1>{campusInfo[campus].title} 카공 지도</h1><p>{campusInfo[campus].sub}</p></div><span>{filtered.length}<small>곳 표시 중</small></span></section>
    <section className="filter-bar"><div className="filter-title"><b>공부 조건 필터</b><span>복수 조건을 함께 선택할 수 있어요</span></div>{(Object.keys(filters) as FilterKey[]).map(key=><label key={key}><span>{filterLabels[key]}</span><select value={filters[key]} onChange={e=>setFilters({...filters,[key]:e.target.value})}>{filterOptions[key].map(o=><option key={o}>{o}</option>)}</select></label>)}<button className="reset" onClick={clearFilters}>초기화</button></section>
    <section className="explorer">
      <div className="map-wrap"><RealMap campus={campus} items={filtered} active={selected?.name??""} onPreview={setActive} onSelect={selectCafeFromMap}/></div>
      {selected?<aside className="detail-card" ref={detailRef}><div className="detail-photo"><img src={selected.image} alt={`${selected.name} 내부 사진`}/></div><div className="detail-body"><div className="detail-meta"><span>{selected.location}</span><b>Wi-Fi {selected.wifi}</b></div><h2>{selected.name}</h2><div className="feature-grid"><div><span>콘센트</span><b>{selected.outlet}</b></div><div><span>소음</span><b>{selected.noise}</b></div><div><span>좌석</span><b>{selected.seat}</b></div><div><span>테이블</span><b>{selected.table}</b></div></div>{selected.note&&<p className="note">{selected.note}</p>}<dl><div><dt>분위기 기록</dt><dd>{selected.vibe}</dd></div><div><dt>영업시간</dt><dd>{selected.hours}</dd></div><div><dt>화장실</dt><dd>{selected.restroom}</dd></div></dl><div className="recommend-row"><button type="button" onClick={toggleRecommendation} disabled={recommendation.loading} aria-pressed={recommendation.recommended}><span aria-hidden="true">👍</span>{recommendation.recommended?"추천 취소":"나도 추천해요!"}</button><p><strong>{recommendation.count}</strong><span>명이 추천했어요</span></p></div><a className="directions" href={`https://map.naver.com/p/search/${encodeURIComponent(selected.name)}`} target="_blank" rel="noreferrer">정확한 위치 검색 ↗</a></div></aside>:<aside className="no-result"><b>조건에 맞는 카페가 없어요.</b><button onClick={clearFilters}>필터 초기화</button></aside>}
    </section>
    <section className="result-list"><div className="list-title"><h2>조건에 맞는 카페</h2><span>{filtered.length}곳</span></div><div className="mini-grid">{filtered.map(c=><button key={c.name} className={selected?.name===c.name?"active":""} onClick={()=>setActive(c.name)}><img src={c.image} alt=""/><div><span>{c.location}</span><strong>{c.name}</strong><p>{c.noise} · 콘센트 {c.outlet}</p></div></button>)}</div></section>
    <footer>SKKU STUDY CAFE FINDER <span>·</span> 운영 정보는 방문 전 다시 확인해주세요.</footer>
  </main>
}
