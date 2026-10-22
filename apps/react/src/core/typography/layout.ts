import type { Slide } from '../project/schema'

export type FontSpec = { family: string; weight: number }
export type StyledToken = { text: string; style: 'accent'|'outline'|'highlight'|null }
export type StyledLine = StyledToken[]
export type TextLayout = {
  box: {x:number;y:number;w:number;h:number}
  pad:number; availableWidth:number; availableHeight:number
  kicker:{lines:string[];size:number;lineHeight:number;gap:number;x:number;y:number}|null
  heading:{lines:StyledLine[];size:number;lineHeight:number;x:number;y:number}
  body:{lines:string[];size:number;lineHeight:number;x:number;y:number}
  totalHeight:number;scale:number
}
export function parseHeadingMarkup(raw:string){
 const re=/\*([^*\n]+)\*|_([^_\n]+)_|~([^~\n]+)~/g
 return (raw||'').split('\n').map(paragraph=>{
  if(paragraph==='')return [] as StyledToken[]
  const out:StyledToken[]=[];let last=0,m:RegExpExecArray|null;re.lastIndex=0
  while((m=re.exec(paragraph))){pushWords(out,paragraph.slice(last,m.index),null);pushWords(out,m[1]??m[2]??m[3],m[1]!==undefined?'accent':m[2]!==undefined?'outline':'highlight');last=re.lastIndex}
  pushWords(out,paragraph.slice(last),null);return out
 })
}
function pushWords(out:StyledToken[],text:string,style:StyledToken['style']){for(const word of text.trim().split(/\s+/).filter(Boolean))out.push({text:word,style})}
function width(ctx:CanvasRenderingContext2D,line:StyledLine){return line.reduce((sum,t,i)=>sum+(i?ctx.measureText(' ').width:0)+ctx.measureText(t.text).width,0)}
function wrap(ctx:CanvasRenderingContext2D,raw:string,max:number):StyledLine[]{
 const result:StyledLine[]=[]
 for(const tokens of parseHeadingMarkup(raw)){
  if(!tokens.length){result.push([]);continue}
  let line:StyledLine=[],text=''
  for(const token of tokens){const test=text?text+' '+token.text:token.text
   if(line.length&&ctx.measureText(test).width>max){result.push(line);line=[token];text=token.text}else{line.push(token);text=test}}
  if(line.length)result.push(line)
 }
 return result
}
function wrapPlain(ctx:CanvasRenderingContext2D,raw:string,max:number){
 return (raw||'').split('\n').flatMap(p=>{if(!p)return [''];const result:string[]=[];let line=''
  for(const word of p.split(/\s+/).filter(Boolean)){const test=line?line+' '+word:word;if(line&&ctx.measureText(test).width>max){result.push(line);line=word}else line=test}
  if(line)result.push(line);return result
 })
}
function lengthFactor(raw:string){const n=(raw||'').replace(/[*_~]/g,'').replace(/\s+/g,' ').trim().length;if(n<=55)return 1;if(n>=220)return .58;return 1-((n-55)/165)*.42}
export function buildTextLayout(ctx:CanvasRenderingContext2D,slide:Slide,box:{x:number;y:number;w:number;h:number},W:number,_H:number,fonts:{heading:FontSpec;body:FontSpec},sizeMultiplier=1):TextLayout{
 const pad=W*.08,boxW=(slide.textBoxWRatio||1)*box.w,boxH=(slide.textBoxHRatio||1)*box.h
 const textBox={x:box.x,y:box.y,w:boxW,h:boxH},availW=Math.max(10,boxW-2*pad),availH=Math.max(10,boxH-2*pad)
 const headBase=(slide.headSizePx&&slide.headSizePx>0)?slide.headSizePx:W*.086*sizeMultiplier*lengthFactor(slide.heading)
 const bodyBase=(slide.bodySizePx&&slide.bodySizePx>0)?slide.bodySizePx:W*.036*sizeMultiplier
 const headBaseScaled=headBase*(slide.tscale||1),bodyBaseScaled=bodyBase*(slide.bodyDetached?(slide.bodyTscale||1):(slide.tscale||1))
 const baseGap=W*.03*(slide.tscale||1),hasBody=!slide.bodyDetached&&!!slide.body.trim(),hasKicker=!!slide.kicker.trim()
 const kickerSize=W*.026,kickerLH=kickerSize*1.3,kickerGap=baseGap*.6
 let scale=1,headLines:StyledLine[]=[],bodyLines:string[]=[],headSize=headBaseScaled,bodySize=bodyBaseScaled,headLH=headSize*1.15,bodyLH=bodySize*1.35,gap=baseGap,totalHeight=0
 for(let n=0;n<40;n++){
  headSize=headBaseScaled*scale;bodySize=bodyBaseScaled*scale;headLH=headSize*1.15;bodyLH=bodySize*1.35;gap=baseGap*scale
  ctx.font=fonts.heading.weight+' '+headSize+'px "'+fonts.heading.family+'"'
  headLines=wrap(ctx,slide.heading,availW);let maxHead=0
  for(const line of headLines)if(line.length)maxHead=Math.max(maxHead,width(ctx,line))
  bodyLines=[];let maxBody=0
  if(hasBody){ctx.font=fonts.body.weight+' '+bodySize+'px "'+fonts.body.family+'"';bodyLines=wrapPlain(ctx,slide.body,availW);for(const line of bodyLines)maxBody=Math.max(maxBody,ctx.measureText(line).width)}
  totalHeight=(hasKicker?kickerLH+kickerGap:0)+headLines.length*headLH+(bodyLines.length?gap+bodyLines.length*bodyLH:0)
  if((totalHeight<=availH&&maxHead<=availW+.5&&maxBody<=availW+.5)||scale<=.3)break
  scale-=.03
 }
 const top=textBox.y+pad,bottom=textBox.y+textBox.h-pad
 let start=slide.position==='top'?top:slide.position==='bottom'?bottom-totalHeight:top+(bottom-top-totalHeight)/2
 start+=(slide.textOffsetY||0)*(W/1080)
 const x=(slide.align==='center'?textBox.x+textBox.w/2:textBox.x+pad)+(slide.textOffsetX||0)*(W/1080)
 const kicker=hasKicker?{lines:[slide.kicker.toUpperCase()],size:kickerSize,lineHeight:kickerLH,gap:kickerGap,x,y:start}:null
 const headingY=start+(hasKicker?kickerLH+kickerGap:0)
 return {box:textBox,pad,availableWidth:availW,availableHeight:availH,kicker,heading:{lines:headLines,size:headSize,lineHeight:headLH,x,y:headingY},body:{lines:bodyLines,size:bodySize,lineHeight:bodyLH,x,y:headingY+headLines.length*headLH+(bodyLines.length?gap:0)},totalHeight,scale}
}
export function buildBrowserTextLayout(slide:Slide,box:{x:number;y:number;w:number;h:number},W:number,H:number,sizeMultiplier=1){
 const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas 2D context unavailable')
 return buildTextLayout(ctx,slide,box,W,H,{heading:{family:slide.headFont,weight:slide.headWeight},body:{family:slide.bodyFont,weight:slide.bodyWeight}},sizeMultiplier)
}
