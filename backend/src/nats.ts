import { NatsClient } from "nats-client-ts";

export const nc = async () => {
  const client = new NatsClient(
    'http://bitspac.es:4222', { user: '', password: '' }, '', true, (ctx) => { return true }
  )

  await client.connect()
  return client
}

