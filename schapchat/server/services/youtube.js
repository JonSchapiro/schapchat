const req = require('request');

const BASE_URL = 'https://www.googleapis.com/youtube/v3';
const {channel, web} = require('../../config/youtube.json');
// https://developers.google.com/youtube/v3/docs/subscriptions/list
// cache result for n amount of time
function isSubscribed(token, cb) {
  return req.get({
    url: `${BASE_URL}/subscriptions`,
    json: true,
    headers: {'Authorization': `Bearer ${token}`},
    qs: {
     forChannelId: `${channel.id}`,
     mine: 'true',
     part: 'snippet,contentDetails',
     access_token: token
    }
  }, function(err, resp) {
    if (err || !resp || !resp.body) {
      return cb(new Error('Unable to check subscription: ', err), null);
    }
    console.log('sub data ', err, resp.body)
    const items = resp.body.items;
    
    const subResp = {
      status: 200,
      body: true
    }

    if (items && items.length) {
      return cb(null, subResp);
    }


    if (resp.body && resp.body.error) {
      subResp.status = resp.body.error.code;
    }

    subResp.body = false;

    return cb(null, subResp);
  });
}

// https://developers.google.com/youtube/v3/docs/subscriptions/insert#request-body
function subscribe(token, cb) {
  req({
    method: 'post',
    json: true,
    headers: {'Authorization': `Bearer ${token}`},
    qs: {
      part: 'snippet'
    },
    url: '${BASE_URL}/subscriptions',
    body: {  
      snippet: {
        resourceId: {
          kind: "youtube#channel",
          channelId: `${channel.id}` 
        }
     }
    }
  }, function(err, resp) {
    if (err || !resp) {
      // returning response as there might be an error object in the resp
      return cb(err, resp);
    }

    return cb(null, res.body);
  });
}

function renewAccessToken(refreshToken, token, cb) {
  req({
    method: 'post',
    json: true,
    headers: {'Authorization': `Bearer ${token}`},
    url: `https://www.googleapis.com/oauth2/v4/token`,
    form: {  
      client_id: web.client_id,
      client_secret: web.client_secret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    }
  }, function(err, resp) {
    if (err || !resp) {
      // returning response as there might be an error object in the resp
      return cb(err, resp);
    }

    return cb(null, resp);
  });
}

module.exports = {
  isSubscribed,
  subscribe,
  renewAccessToken
};