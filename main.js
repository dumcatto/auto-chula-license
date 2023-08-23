const core = require('@actions/core')
const httpm = require('@actions/http-client')

async function run() {
  try {

    const inputs = {
      email: core.getInput('cunet-email'),
      password: core.getInput('cunet-password')
    }

    const url = 'https://licenseportal.it.chula.ac.th'

    // Create a HTTP client
    const client = new httpm.HttpClient('cunet-login-action', [], {
      allowRetries: true,
      maxRetries: 3
    })
    core.info('Created HTTP client')

    try {
      let body = {
        UserName: inputs.email,
        Password: inputs.password
      }
      let res = await client.postJson(url, body)
      core.info('POST request sent')

      if (res.message.statusCode != 200) {
        throw new Error(`Request failed with status code ${res.message.statusCode}`)
      }

    } catch (error) {
      throw new Error(`failed to post to: ${error.message}`)
    }

  } catch (error) {
    core.setFailed(error.message)
  }
}

run()