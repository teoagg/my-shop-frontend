// CommonJS entry point for hosts such as Plesk/Passenger.
import('./server.mjs').catch((error) => {
  console.error(error)
  process.exit(1)
})
