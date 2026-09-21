import test from 'node:test'
import assert from 'node:assert/strict'
import { makeHandler, reader, findProduct } from '../handler.mjs'
import { normalize, fingerprint, summarize } from '../validation.mjs'
import { save } from '../store.mjs'
import { createServer } from 'node:http'
const input={eventId:'11111111-1111-4111-8111-111111111111',eventType:'view',sessionId:'session-1234',documentId:'product-a',variant:'B',metadata:{source:'test'}}
const event=body=>({httpMethod:'POST',body:JSON.stringify({data:body})})
test('validates before writes; accepts base64 API events and preserves event identity',async()=>{
  const stored=[]
  const handler=makeHandler({lookup:async()=>({id:7,documentId:'product-a'}),persist:async r=>{stored.push(r);return false}})
  assert.equal((await handler(event({...input,eventType:'invalid'}))).statusCode,400)
  assert.equal((await handler(event({...input,sessionId:'x'}))).statusCode,400)
  assert.equal((await handler({httpMethod:'POST',body:'{'})).statusCode,400)
  assert.equal(stored.length,0)
  const response=await handler({requestContext:{http:{method:'POST'}},isBase64Encoded:true,body:Buffer.from(JSON.stringify({data:input})).toString('base64')})
  assert.equal(response.statusCode,200)
  assert.equal(stored[0].eventId,input.eventId)
  assert.deepEqual(stored[0].product,{id:7,documentId:'product-a'})
  assert.equal(JSON.parse(response.body).data.accepted,true)
  assert.ok(!response.body.includes(input.sessionId))
})
test('rejects invalid identity, variant, oversized metadata and bodies',async()=>{
  assert.throws(()=>normalize({...input,documentId:'../bad'}),{status:400})
  assert.throws(()=>normalize({...input,variant:'C'}),{status:400})
  assert.throws(()=>normalize({...input,metadata:{value:'x'.repeat(5000)}}),{status:400})
  const handler=makeHandler({lookup:async()=>{throw Error('Must not read')}})
  assert.equal((await handler({httpMethod:'POST',body:'x'.repeat(17000)})).statusCode,413)
  assert.equal((await handler({httpMethod:'OPTIONS'})).statusCode,204)
  assert.equal((await handler({httpMethod:'GET'})).statusCode,405)
  await assert.rejects(reader({requestContext:{http:{method:'GET'}}}))
})
test('conditional persistence makes retry idempotent and rejects changed payload',async()=>{
  const values=new Map()
  class Put {constructor(input){this.input=input}}
  class Get {constructor(input){this.input=input}}
  const injected={PutItemCommand:Put,GetItemCommand:Get,client:{send:async cmd=>{
    if(cmd instanceof Put){
      assert.equal(cmd.input.ConditionExpression,'attribute_not_exists(eventId)')
      const id=cmd.input.Item.eventId.S
      if(values.has(id)) throw Object.assign(new Error(),{name:'ConditionalCheckFailedException'})
      values.set(id,cmd.input.Item);return {}
    }
    assert.equal(cmd.input.ConsistentRead,true)
    return {Item:values.get(cmd.input.Key.eventId.S)}
  }}}
  const record={...input,product:{id:7,documentId:'product-a'},createdAt:'2026-01-01'}
  assert.equal(await save(record,injected),false)
  assert.equal(await save({...record,createdAt:'2026-01-02'},injected),true)
  await assert.rejects(save({...record,eventType:'purchase'},injected),{status:409})
  assert.equal(values.size,1)
  assert.equal(fingerprint({...record,metadata:{a:1,b:2}}),fingerprint({...record,metadata:{b:2,a:1}}))
})
test('persistence failure is not acknowledged; summary exposes aggregates only',async()=>{
  const handler=makeHandler({lookup:async()=>({id:7,documentId:'product-a'}),persist:async()=>{throw Error('database unreachable')}})
  assert.equal((await handler(event(input))).statusCode,500)
  const rows=summarize([input,{...input,eventType:'add_to_cart'},{...input,eventType:'recommendation_impression'},{...input,eventType:'recommendation_click'}])
  assert.equal(rows[1].sessions,1);assert.equal(rows[1].recommendationCtr,1)
  assert.ok(!JSON.stringify(rows).includes(input.sessionId))
})
test('product validation only reads published catalog; no analytics forwarding',async t=>{
  let found=true
  const server=createServer((req,res)=>{
    const url=new URL(req.url,'http://localhost')
    assert.equal(req.method,'GET');assert.equal(url.pathname,'/api/products')
    assert.equal(url.searchParams.get('status'),'published')
    assert.equal(url.searchParams.get('filters[documentId][$eq]'),'product-a')
    res.end(JSON.stringify({data:found?[{id:7,documentId:'product-a'}]:[]}))
  })
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
  const previous=process.env.STRAPI_URL
  process.env.STRAPI_URL=`http://127.0.0.1:${server.address().port}`
  t.after(()=>{if(previous===undefined)delete process.env.STRAPI_URL;else process.env.STRAPI_URL=previous;server.closeAllConnections();server.close()})
  assert.deepEqual(await findProduct(input),{id:7,documentId:'product-a'})
  found=false;await assert.rejects(findProduct(input),{status:400})
})
