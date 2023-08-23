const core = require('@actions/core')
const httpm = require('@actions/http-client')

async function run() {
  try {

    const inputs = {
      email: core.getInput('cunet-email'),
      password: core.getInput('cunet-password')
    }

    core.info(`Logging in with ${inputs.email}`)

  } catch (error) {
    core.setFailed(error.message)
  }
}

run()