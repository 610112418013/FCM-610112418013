const admin = require('firebase-admin')
const { google } = require('googleapis')
const axios = require('axios')

const MESSAGING_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging'
const SCOPES = [MESSAGING_SCOPE]

const serviceAccount = require('./fcm-ab8fc-firebase-adminsdk-2at03-3aa08f045c.json')
const databaseURL = 'https://fcm-ab8fc.firebaseio.com'
const URL =
  'https://fcm.googleapis.com/v1/projects/fcm-ab8fc/messages:send'
const deviceToken =
  'd2fZK-ckfsBSvqsjRziWmv:APA91bFn3ucSAd8gNcWg1EMa_9iEDidLWmgf3_JumT7U_J57T7NI49Jc01aDDeLxoWuI-UjsLFzANrUD99O748U4o4SyX7nSOOMKZw_543wt5xtaNLr0E-6MONOmkelC14NU4f_GELyd'

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: databaseURL
})

function getAccessToken() {
  return new Promise(function(resolve, reject) {
    var key = serviceAccount
    var jwtClient = new google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      SCOPES,
      null
    )
    jwtClient.authorize(function(err, tokens) {
      if (err) {
        reject(err)
        return
      }
      resolve(tokens.access_token)
    })
  })
}

async function init() {
  const body = {
    message: {
      data: { key: 'value' },
      notification: {
        title: 'Notification title',
        body: 'Notification body'
      },
      webpush: {
        headers: {
          Urgency: 'high'
        },
        notification: {
          requireInteraction: 'true'
        }
      },
      token: deviceToken
    }
  }

  try {
    const accessToken = await getAccessToken()
    console.log('accessToken: ', accessToken)
    const { data } = await axios.post(URL, JSON.stringify(body), {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    })
    console.log('name: ', data.name)
  } catch (err) {
    console.log('err: ', err.message)
  }
}

init()