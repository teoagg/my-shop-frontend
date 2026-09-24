import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, mkdtempSync, rmSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { EventEmitter } from 'node:events'
import { createRequire } from 'node:module'
import vm from 'node:vm'
import ts from 'typescript'
const require = createRequire(import.meta.url)
function load(file, context = {}, dependencies = {}) {
 const code = ts.transpileModule(readFileSync(new URL(file, import.meta.url),'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText
 const scope = {exports:{},process,URL,Response,AbortSignal,require:n=>dependencies[n]||require(n),...context}
 vm.runInNewContext(code,scope); return scope.exports
}
test('admin authorization trusts verified Strapi ID only, denies absent configuration and invalid sessions',async()=>{
 let calls=0
 const env={EVALUATION_ADMIN_USER_IDS:'7',NEXT_PUBLIC_STRAPI_URL:'https://api.example.test'}
 const context={process:{env},fetch:async()=>{calls++;return Response.json({id:7,blocked:false})}}
 const auth=load('../lib/evaluation-admin.ts',context)
 assert.equal(await auth.isEvaluationAdmin(new Request('https://shop.test')),false)
 const req=new Request('https://shop.test',{headers:{Authorization:'Bearer example'}})
 assert.equal(await auth.isEvaluationAdmin(req),true)
 env.EVALUATION_ADMIN_USER_IDS='8';assert.equal(await auth.isEvaluationAdmin(req),false)
 env.EVALUATION_ADMIN_USER_IDS='';assert.equal(await auth.isEvaluationAdmin(req),false);assert.equal(calls,2)
 const blocked=load('../lib/evaluation-admin.ts',{process:{env:{...env,EVALUATION_ADMIN_USER_IDS:'7'}},fetch:async()=>Response.json({id:7,blocked:true})})
 assert.equal(await blocked.isEvaluationAdmin(req),false)
})
test('runner denies public/cross-origin access, holds exclusive lock and enforces cooldown',async()=>{
 const cwd=mkdtempSync(join(tmpdir(),'evaluation-run-'));let allowed=false,spawns=0
 const deps={'@/lib/evaluation-admin':{isEvaluationAdmin:async()=>allowed},'node:child_process':{spawn:()=>{spawns++;const p=new EventEmitter();p.unref=()=>{};queueMicrotask(()=>p.emit('spawn'));return p}}}
 try{
 const route=load('../app/api/evaluation/run/route.ts',{process:{cwd:()=>cwd,env:{NEXT_PUBLIC_SITE_URL:'https://shop.test'}}},deps)
 const request=()=>new Request('https://shop.test/api/evaluation/run',{method:'POST',headers:{Origin:'https://shop.test'}})
 assert.equal((await route.POST(request())).status,403);assert.equal((await route.GET(request())).status,403);assert.equal(spawns,0)
 allowed=true
 assert.equal((await route.POST(new Request('https://shop.test/api/evaluation/run',{method:'POST',headers:{Origin:'https://evil.test'}}))).status,403)
 const results=await Promise.all([route.POST(request()),route.POST(request())]);assert.deepEqual(results.map(r=>r.status).sort(),[202,409]);assert.equal(spawns,1)
 const state=JSON.parse(await readFile(join(cwd,'evaluation/reports/web-run.json'),'utf8'));assert.equal(state.status,'running')
 rmSync(join(cwd,'evaluation/reports/web-run.lock'),{recursive:true})
 assert.equal((await route.POST(request())).status,429)
 assert.equal((await route.GET(request())).headers.get('cache-control'),'no-store')
 }finally{rmSync(cwd,{recursive:true,force:true})}
})
