import {chromium} from 'playwright';
import {createTrail} from '../src/app/features/number-trail/number-trail.engine';

function assert(value:unknown,message:string):asserts value{if(!value)throw new Error(message)}
const root=process.cwd()+'/dist/mental-mania/browser';
const server=Bun.serve({hostname:'127.0.0.1',port:0,async fetch(request){
  const pathname=new URL(request.url).pathname;
  const file=Bun.file(root+pathname);
  return new Response(await file.exists()?file:Bun.file(root+'/index.html'));
}});
const browser=await chromium.launch({headless:true});
try{
  for(const width of [320,390]){
    const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
    const page=await context.newPage(),errors:string[]=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(server.url+'play?game=pocket-post');
    await page.getByRole('button',{name:'Start puzzle',exact:true}).click();
    const board=page.locator('.trail');await board.waitFor();await board.scrollIntoViewIfNeeded();
    const id=await page.evaluate(()=>JSON.parse(localStorage.getItem('unloop:data:v1')!).active.puzzleId as string);
    const match=id.match(/trail-v2-(\d+)-(0|1)/)!;
    const puzzle=createTrail(Number(match[1]),match[2]==='1');
    const path=Array.from({length:puzzle.solution.length},(_,i)=>puzzle.solution.indexOf(i+1));
    const point=async(index:number)=>{
      const rect=await board.locator('[data-cell="'+index+'"]').boundingBox();assert(rect,'Cell missing');
      return{x:rect.x+rect.width/2,y:rect.y+rect.height/2};
    };
    const cdp=await context.newCDPSession(page);
    await page.evaluate(()=>{
      const events:unknown[]=[];(window as unknown as Record<string,unknown>)['gestureEvents']=events;
      for(const type of ['pointerdown','pointermove','pointerup','pointercancel','lostpointercapture'])document.addEventListener(type,event=>{
        const pointer=event as PointerEvent;
        events.push({type,x:pointer.clientX,y:pointer.clientY,primary:pointer.isPrimary,button:pointer.button,target:(pointer.target as Element)?.closest('[data-cell]')?.getAttribute('data-cell')});
      },true);
    });
    const touch=async(type:'touchStart'|'touchMove'|'touchEnd'|'touchCancel',index?:number)=>{
      const position=index===undefined?null:await point(index);
      await cdp.send('Input.dispatchTouchEvent',{type,touchPoints:position?[{...position,id:1,radiusX:3,radiusY:3}]:[]});
      await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>resolve())));
    };
    await touch('touchStart',path[0]);for(const cell of path.slice(1,6))await touch('touchMove',cell);
    if(await board.locator('.visited').count()!==6){
      console.log(JSON.stringify({id,path,errors,debug:await page.evaluate(()=>({events:(window as unknown as Record<string,unknown>)['gestureEvents'],message:document.querySelector('.message')?.textContent,visited:Array.from(document.querySelectorAll('.trail .visited')).map(cell=>cell.getAttribute('data-cell')),drawing:document.querySelector('.trail')?.className,session:localStorage.getItem('unloop:data:v1')}))}));
      throw new Error('Touch drawing did not reach six cells');
    }
    await touch('touchMove',path[4]);await touch('touchMove',path[3]);await touch('touchEnd');
    assert(await board.locator('.visited').count()===4,'Swipe rewind or synthetic-click suppression failed');
    await touch('touchStart',path[3]);await touch('touchCancel');
    await board.locator('[data-cell="'+path[4]+'"]').focus();await page.keyboard.press('Enter');
    assert(await board.locator('.visited').count()===5,'Keyboard fallback failed after pointer cancellation');
    await touch('touchStart',path[4]);
    // Send only turning points. Straight runs must fill intermediate cells even with sparse events.
    for(let step=5;step<path.length;step++){
      if(step<path.length-1&&path[step]!-path[step-1]===path[step+1]!-path[step]!)continue;
      await touch('touchMove',path[step]);
    }
    await touch('touchEnd');
    await page.getByRole('heading',{name:'Nicely noticed.'}).waitFor();
    assert(await board.locator('.visited').count()===path.length,'Fast swipe skipped a square');
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),'Horizontal page overflow');
    await page.getByRole('button',{name:'Finish break',exact:true}).last().click();
    await page.goto(server.url+'play?game=stencil-studio');
    await page.getByRole('button',{name:'Start puzzle',exact:true}).click();
    const picross=page.locator('.picross-board');await picross.scrollIntoViewIfNeeded();
    const first=await picross.locator('[data-cell="0"]').boundingBox(),last=await picross.locator('[data-cell="4"]').boundingBox();assert(first&&last,'Picross cells missing');
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:first.x+first.width/2,y:first.y+first.height/2,id:1}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:last.x+last.width/2,y:last.y+last.height/2,id:1}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>resolve())));
    assert(await picross.locator('.filled').count()===5,'Picross swipe paint or click suppression failed');
    await picross.locator('[data-cell="0"]').focus();await page.keyboard.press('Space');
    assert(await picross.locator('.filled').count()===4,'Picross keyboard toggle failed');
    await page.emulateMedia({reducedMotion:'reduce'});
    await picross.locator('[data-cell="0"]').tap();
    assert(await picross.locator('[data-cell="0"]').evaluate(element=>element.getAnimations().filter(animation=>animation.playState==='running').length)===0,'Reduced motion did not suppress gameplay animation');
    assert(errors.length===0,'Browser errors: '+errors.join('; '));
    console.log('PASS '+width+'px: touch draw, rewind, cancel, keyboard, sparse moves, complete, Picross paint, reduced motion, no overflow.');
    await context.close();
  }
}finally{await browser.close();server.stop(true)}
