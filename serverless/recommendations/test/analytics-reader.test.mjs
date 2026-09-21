import test from 'node:test'
import assert from 'node:assert/strict'
import { LambdaClient } from '@aws-sdk/client-lambda'
import { loadAnalytics } from '../analytics.mjs'
import { recommend } from '../engine.mjs'

test('private reader pagination feeds newly collected events into recommendations',async t=>{
  const previous=process.env.ANALYTICS_READER_ARN
  process.env.ANALYTICS_READER_ARN='arn:aws:lambda:eu-north-1:123456789012:function:fixture-reader'
  const send=LambdaClient.prototype.send
  t.after(()=>{LambdaClient.prototype.send=send;if(previous===undefined)delete process.env.ANALYTICS_READER_ARN;else process.env.ANALYTICS_READER_ARN=previous})
  let calls=0
  LambdaClient.prototype.send=async function(command){
    assert.equal(command.input.FunctionName,process.env.ANALYTICS_READER_ARN)
    assert.equal(command.input.InvocationType,'RequestResponse')
    const event=JSON.parse(Buffer.from(command.input.Payload).toString())
    calls++
    if(calls===1){assert.equal(event.cursor,undefined);return {Payload:Buffer.from(JSON.stringify({data:[{eventType:'view',sessionId:'new-session',product:{documentId:'a'}}],cursor:'next-page'}))}}
    assert.equal(event.cursor,'next-page')
    return {Payload:Buffer.from(JSON.stringify({data:[{eventType:'purchase',sessionId:'new-session',product:{documentId:'c'}}],cursor:null}))}
  }
  const events=await loadAnalytics(AbortSignal.timeout(1000))
  assert.equal(calls,2)
  const products=[{id:1,documentId:'a',inStock:true,categories:[{id:1}]},{id:2,documentId:'b',inStock:true,categories:[{id:1}]},{id:3,documentId:'c',inStock:true,categories:[]}]
  assert.equal(recommend(products,[],{documentId:'a',limit:1})[0].documentId,'b')
  assert.equal(recommend(products,events,{documentId:'a',limit:1})[0].documentId,'c')
  LambdaClient.prototype.send=async()=>({FunctionError:'Unhandled',Payload:Buffer.from('{}')})
  await assert.rejects(loadAnalytics(AbortSignal.timeout(1000)),{status:502})
  LambdaClient.prototype.send=async()=>({Payload:Buffer.from('{"data":null}')})
  await assert.rejects(loadAnalytics(AbortSignal.timeout(1000)),{status:502})
})
