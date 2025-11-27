import { Server } from "http";
import app from "./app";
import { envVars } from "./app/config/env";
import { connectDB } from "./app/config/prisma";
import { seedSuperAdmin } from "./app/utils/seedAdmin";

async function bootstrap() {
  // This variable will hold our server instance
  let server: Server;

  try {
    await connectDB()

    // Start the server
    server = app.listen(envVars.PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${envVars.PORT}`)
    })

    await seedSuperAdmin()

    // Function to gracefully shut down the server
    const exitHandler = () => {
      if (server) {
        server.close(() => {
          console.log('Server closed gracefully.')
          process.exit(1) // Exit with a failure code
        })
      } else {
        process.exit(1)
      }
    }

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (error) => {
      console.log(
        'Unhandled Rejection is detected, we are closing our server...'
      )
      console.error('Unhandled Rejection error:', error) // Log the actual error
      if (server) {
        server.close(() => {
          process.exit(1)
        })
      } else {
        process.exit(1)
      }
    })
  } catch (error) {
    console.error('Error during server startup:', error)
    process.exit(1)
  }
}
bootstrap();
