const core = require('@actions/core')
const httpm = require('@actions/http-client')
const qs  = require('qs')

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

    // Send a POST request (login)
    try {
      let data = {
        UserName: inputs.email,
        Password: inputs.password
      }
      let res = await client.post(url + `?${qs.stringify(data, { encode: false })}`)
      core.info('POST request sent')

      if (res.message.statusCode != 200) {
        throw new Error(`Request failed with status code ${res.message.statusCode}`)
      } else if (res.message.headers['set-cookie'].length < 2) {
        throw new Error('Login failed')
      }
    } catch (error) {
      throw new Error(`failed to post to: ${error.message}`)
    }
    core.info('Login successful')

    // Send a GET request (get license)
    // try {
    //   let data = {
    //     UserName: inputs.email,
    //     Password: inputs.password
    //   }
    //   let res = await client.post(url, JSON.stringify(data))
    //   core.info('POST request sent')

    //   if (res.message.statusCode != 200) {
    //     throw new Error(`Request failed with status code ${res.message.statusCode}`)
    //   } else if (res.message.headers['set-cookie'].length < 2) {
    //     throw new Error('Login failed')
    //   }
    // } catch (error) {
    //   throw new Error(`failed to post to: ${error.message}`)
    // }

  } catch (error) {
    core.setFailed(error.message)
  }
}

run()