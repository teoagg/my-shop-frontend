let resources
export async function loadAnalytics(signal) {
  const arn=process.env.ANALYTICS_READER_ARN
  if (!arn) return []
  if (!resources) {
    const sdk=await import('@aws-sdk/client-lambda')
    resources={...sdk,client:new sdk.LambdaClient({maxAttempts:2})}
  }
  const data=[]; let cursor
  for (let page=0; page<100; page++) {
    const response=await resources.client.send(new resources.InvokeCommand({FunctionName:arn,InvocationType:'RequestResponse',Payload:Buffer.from(JSON.stringify({cursor}))}),{abortSignal:signal})
    if(response.FunctionError) throw Object.assign(new Error('Analytics reader failed.'),{status:502})
    const result=JSON.parse(Buffer.from(response.Payload).toString())
    if(!Array.isArray(result.data)) throw Object.assign(new Error('Invalid analytics reader response.'),{status:502})
    data.push(...result.data);cursor=result.cursor
    if(!cursor) return data
  }
  throw Object.assign(new Error('Analytics dataset exceeds pilot limit.'),{status:503})
}
