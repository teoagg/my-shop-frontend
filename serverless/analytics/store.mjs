import { fingerprint } from './validation.mjs'
let resources
async function aws() {
  if (!process.env.EVENTS_TABLE) throw Object.assign(new Error('EVENTS_TABLE is not configured.'), { status: 503 })
  if (!resources) {
    const sdk = await import('@aws-sdk/client-dynamodb')
    resources = { ...sdk, client: new sdk.DynamoDBClient({ maxAttempts: 2 }) }
  }
  return resources
}
export async function save(record, injected) {
  const { client, PutItemCommand, GetItemCommand } = injected || await aws()
  const hash = fingerprint(record)
  const params = { TableName: process.env.EVENTS_TABLE, Item: { eventId:{S:record.eventId}, payload:{S:JSON.stringify(record)}, fingerprint:{S:hash} }, ConditionExpression:'attribute_not_exists(eventId)' }
  try { await client.send(new PutItemCommand(params)); return false }
  catch (error) {
    if (error.name !== 'ConditionalCheckFailedException') throw error
    const previous = await client.send(new GetItemCommand({ TableName:params.TableName, Key:{eventId:{S:record.eventId}}, ConsistentRead:true, ProjectionExpression:'fingerprint' }))
    if (previous.Item?.fingerprint?.S !== hash) throw Object.assign(new Error('Event id already belongs to a different event.'), {status:409})
    return true
  }
}
export async function readPage(cursor) {
  const { client, ScanCommand } = await aws()
  if (cursor !== undefined && (typeof cursor !== 'string' || cursor.length > 512)) throw new Error('Invalid cursor')
  const result = await client.send(new ScanCommand({ TableName:process.env.EVENTS_TABLE, ProjectionExpression:'payload', Limit:100, ExclusiveStartKey:cursor ? JSON.parse(Buffer.from(cursor,'base64url').toString()) : undefined, ConsistentRead:true }))
  return { data:(result.Items || []).map(item => JSON.parse(item.payload.S)), cursor:result.LastEvaluatedKey ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64url') : null }
}
export async function allEvents() {
  const data=[]; let cursor
  for (let page=0; page<100; page++) {
    const result=await readPage(cursor); data.push(...result.data); cursor=result.cursor
    if (!cursor) return data
  }
  throw Object.assign(new Error('Pilot dataset exceeds 100 pages.'),{status:503})
}
