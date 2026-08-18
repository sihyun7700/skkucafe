import { getRecommendationsDb } from "../../../db/recommendations";

const COOKIE_NAME="skku_cafe_voter";

function getCafe(request:Request){
  const cafe=new URL(request.url).searchParams.get("cafe")?.trim()??"";
  return cafe.length>0&&cafe.length<=100?cafe:null;
}

function getVoterId(request:Request){
  const cookie=request.headers.get("cookie")??"";
  const value=cookie.split(";").map(item=>item.trim()).find(item=>item.startsWith(`${COOKIE_NAME}=`));
  return value?decodeURIComponent(value.slice(COOKIE_NAME.length+1)):null;
}

async function getStatus(cafe:string,voterId:string|null){
  const db=await getRecommendationsDb();
  const total=await db.prepare("SELECT COUNT(*) AS count FROM recommendations WHERE cafe_id = ?").bind(cafe).first<{count:number}>();
  const vote=voterId?await db.prepare("SELECT 1 AS found FROM recommendations WHERE cafe_id = ? AND voter_id = ? LIMIT 1").bind(cafe,voterId).first<{found:number}>():null;
  return {count:Number(total?.count??0),recommended:Boolean(vote?.found)};
}

export async function GET(request:Request){
  const cafe=getCafe(request);
  if(!cafe)return Response.json({error:"카페 이름이 필요합니다."},{status:400});
  try{return Response.json(await getStatus(cafe,getVoterId(request)))}
  catch{return Response.json({error:"추천 수를 불러오지 못했습니다."},{status:500})}
}

export async function POST(request:Request){
  const cafe=getCafe(request);
  if(!cafe)return Response.json({error:"카페 이름이 필요합니다."},{status:400});
  try{
    const existingVoterId=getVoterId(request);
    const voterId=existingVoterId??crypto.randomUUID();
    const db=await getRecommendationsDb();
    await db.prepare("INSERT OR IGNORE INTO recommendations (cafe_id, voter_id) VALUES (?, ?)").bind(cafe,voterId).run();
    const status=await getStatus(cafe,voterId);
    const headers=new Headers({"content-type":"application/json"});
    if(!existingVoterId)headers.append("set-cookie",`${COOKIE_NAME}=${encodeURIComponent(voterId)}; Path=/; Max-Age=31536000; SameSite=Lax; HttpOnly`);
    return new Response(JSON.stringify(status),{status:201,headers});
  }catch{return Response.json({error:"추천을 저장하지 못했습니다."},{status:500})}
}

export async function DELETE(request:Request){
  const cafe=getCafe(request);
  if(!cafe)return Response.json({error:"카페 이름이 필요합니다."},{status:400});
  try{
    const voterId=getVoterId(request);
    if(voterId){
      const db=await getRecommendationsDb();
      await db.prepare("DELETE FROM recommendations WHERE cafe_id = ? AND voter_id = ?").bind(cafe,voterId).run();
    }
    return Response.json(await getStatus(cafe,voterId));
  }catch{return Response.json({error:"추천을 취소하지 못했습니다."},{status:500})}
}
