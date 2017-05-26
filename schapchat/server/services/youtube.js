const req = require('request');

const BASE_URL = 'https://www.googleapis.com/youtube/v3';
const {channel} = require('../../config/youtube.json');
// https://developers.google.com/youtube/v3/docs/subscriptions/list
// cache result for n amount of time
function isSubscribed(token, cb) {
  return req.get({
    url: `${BASE_URL}/subscriptions`,
    json: true,
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

    const items = resp.body.items;

    if (items && items.length) {
      return cb(null, true);
    }

    return cb(null, false);
  });
}

// https://developers.google.com/youtube/v3/docs/subscriptions/insert#request-body
function subscribe(token, cb) {
  req({
    method: 'post',
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
      return cb(err, null);
    }

    return cb(null, res.body);
  });
}

module.exports = {
  isSubscribed,
  subscribe
};