const core = require('@actions/core')
const httpm = require('@actions/http-client')
const qs = require('qs')
const axios = require('axios')

async function run() {
  try {

    const inputs = {
      email: core.getInput('cunet-email'),
      password: core.getInput('cunet-password')
    }

    const url = 'https://licenseportal.it.chula.ac.th'

    // Create a HTTP client
    const client = new httpm.HttpClient('cunet-login-action', [], {
      allowRedirects: false,
      allowRetries: true,
      maxRetries: 3,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    core.info('Created HTTP client')

    // Send a POST request (login)
    try {

      data = qs.stringify({
        UserName: inputs.email,
        Password: inputs.password
      }, { encode: false })

      let res = await client.post(url + `?${data}`)
      core.info('POST request sent')

      if (res.message.statusCode != 302) {
        throw new Error(`Request failed with status code ${res.message.statusCode}`)
      }

      // Get cookies
      cookies = {}
      for (let cookie of res.message.headers['set-cookie']) {
        s = cookie.split(';')[0].split('=')
        cookies[s[0]] = s[1]
      }

      if (!cookies['.AspNetCore.Cookies']) {
        throw new Error('Login failed')
      }

    } catch (error) {
      throw new Error(`failed to post to: ${error.message}`)
    }
    core.info('Login successful')

    // Send a POST request (get license)
    try {
      let data = {
        UserName: inputs.email,
        Password: inputs.password
      }
      let res = await client.post(url, JSON.stringify(data))
      core.info('POST request sent')

      if (res.message.statusCode != 200) {
        throw new Error(`Request failed with status code ${res.message.statusCode}`)
      } else if (res.message.headers['set-cookie'].length < 2) {
        throw new Error('Login failed')
      }
    } catch (error) {
      throw new Error(`failed to post to: ${error.message}`)
    }

  } catch (error) {
    throw new Error(error.message)
  }
}

run()