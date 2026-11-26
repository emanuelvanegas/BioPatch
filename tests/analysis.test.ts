import {test} from 'node:test';
import assert from 'node:assert/strict';
import {classify} from '../src/classification.ts';
import {analyze,lab,delta,samplePixels,type Sample,type RGB} from '../src/color.ts';
const sample=(rgb:RGB):Sample=>({rgb,spread:0,clipped:0});
// Synthetic separated colors exercise behavior; they do not calibrate physical strips.
const colors:RGB[]=[[255,0,0],[0,255,0],[0,0,255],[255,255,0],[0,255,255],[255,0,255],[100,100,100],[230,130,30],[50,80,140],[140,30,60],[180,210,130],[20,120,80],[120,40,180],[200,150,160]];
const references=()=>new Map(colors.map((rgb,i)=>[i+1,sample(rgb)]));
test('all fourteen pH values have the specified category',()=>{for(let ph=1;ph<=14;ph++){assert.equal(classify(ph).tone,ph<4||ph>9?'outside':ph<=6?'acid':ph===7?'neutral':'alkaline');}});
test('invalid pH is rejected instead of receiving a clinical category',()=>{for(const ph of [NaN,Infinity,0,15,6.5])assert.throws(()=>classify(ph));});
test('sRGB conversion matches black, D65 white and red',()=>{assert.ok(delta(lab([0,0,0]),[0,0,0])<.001);assert.ok(delta(lab([255,255,255]),[100,0,0])<.01);assert.ok(delta(lab([255,0,0]),[53.24,80.09,67.20])<.02);});
test('exact distinct references recover all 14 labels',()=>{for(let i=0;i<14;i++){const result=analyze(references(),sample(colors[i]));assert.equal(result.status,'ok');if(result.status==='ok')assert.equal(result.ph,i+1);}});
test('missing strip or reference is incomplete',()=>{assert.equal(analyze(references(),undefined).status,'incomplete');const refs=references();refs.delete(7);assert.equal(analyze(refs,sample(colors[1])).status,'incomplete');});
test('duplicate colors are ambiguous, not an arbitrary pH',()=>{const refs=references();refs.set(7,sample(colors[0]));assert.equal(analyze(refs,sample(colors[0])).status,'ambiguous');});
test('bad strip and bad references prevent classification',()=>{assert.equal(analyze(references(),{...sample(colors[0]),spread:30}).status,'poor');const refs=references();refs.set(5,{...sample(colors[4]),clipped:.5});assert.equal(analyze(refs,sample(colors[0])).status,'poor');});
test('unmatched color is nonconclusive',()=>{const refs=new Map(Array.from({length:14},(_,i)=>[i+1,sample([0,0,255])]));assert.equal(analyze(refs,sample([255,255,0])).status,'ambiguous');});
test('median sample tolerates a few outliers; rejects empty pixels',()=>{const data=new Uint8ClampedArray(100*4);for(let i=0;i<100;i++)data.set(i<5?[255,255,255,255]:[100,140,70,255],i*4);const result=samplePixels(data);assert.deepEqual(result.rgb,[100,140,70]);assert.equal(result.spread,0);assert.equal(result.clipped,.05);assert.throws(()=>samplePixels(new Uint8ClampedArray(4)));});
