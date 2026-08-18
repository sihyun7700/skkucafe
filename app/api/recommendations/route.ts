import { addRecommendation, getRecommendationStatus, removeRecommendation } from "../../../db/recommendations";

export const runtime="nodejs";

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
  return getRecommendationStatus(cafe,voterId);
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
    await addRecommendation(cafe,voterId);
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
      await removeRecommendation(cafe,voterId);
    }
    return Response.json(await getStatus(cafe,voterId));
  }catch{return Response.json({error:"추천을 취소하지 못했습니다."},{status:500})}
}
