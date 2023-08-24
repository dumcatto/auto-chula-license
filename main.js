const core = require('@actions/core')
const httpm = require('@actions/http-client')
const qs = require('qs')
const moment = require('moment-timezone')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

async function run() {
  try {

    const inputs = {
      email: core.getInput('cunet-email') || process.env.CUNET_EMAIL,
      password: core.getInput('cunet-password') || process.env.CUNET_PASSWORD,
      licenseID: core.getInput('license-id') || 5
    }

    const url = 'https://licenseportal.it.chula.ac.th'
    let cookies = {}

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

    let res = await client.get(url)
    core.info('GET request sent')
    for (let cookie of res.message.headers['set-cookie']) {
      s = cookie.split(';')[0].split('=')
      cookies[s[0]] = s[1]
    }

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
      const date = moment().tz('Asia/Bangkok')
    
      data = qs.stringify({
        Domain: inputs.email.split('@')[1],
        ProgramLicenseID: inputs.licenseID,
        BorrowDateStr: date.format('DD/MM/YYYY'),
        ExpiryDateStr: date.add(7, 'days').format('DD/MM/YYYY'),
        UserPrincipalName: inputs.email
      })
      let res = await client.post(url + `/Home/Borrow?${data}`, '', {
        'Cookie': Object.keys(cookies).map(key => `${key}=${cookies[key]}`).join('; ')
      })
      core.info('POST request sent')
      console.log(res.message.statusCode)

    } catch (error) {
      throw new Error(`failed to post to: ${error.message}`)
    }

  } catch (error) {
    core.setFailed(error.message)
  }
}

run()