var fs = require('fs');
var readline = require('readline');
var {google} = require('googleapis');
var OAuth2 = google.auth.OAuth2;

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/youtube-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/youtube.force-ssl'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'youtube-nodejs-quickstart.json';

const sleep = ms => { return new Promise(resolve => setTimeout(resolve, ms)) }


function postCommentTest(auth) {
    var service = google.youtube('v3')
    service.commentThreads.insert({
        auth: auth,
        "part": "snippet",
        requestBody:
        { "snippet":{
            "topLevelComment":{
             "snippet":{
              "textOriginal": "YOUR_COMMENT_HERE",
              "videoId": "Rmf6T_Ewt38"
             }
            }
           }
          }
    
        
      }, (err, result) => {
          console.log(err)
          console.log(result)
      })
  }

  function postCommentReal(auth, videoId) {
    var service = google.youtube('v3')
    service.commentThreads.insert({
        auth: auth,
        "part": "snippet",
        requestBody:
        { "snippet":{
            "topLevelComment":{
             "snippet":{
              "textOriginal": "Instead of a $1000 Gift Card can you donate $2000 (or even $4000 :) ) to a 401c3 charity of my choice?",
              "videoId": videoId
             }
            }
           }
          }
      }, (err, result) => {
          console.log(err)
          console.log(result)
      })
  }

  function getChannel(auth) {
    return new Promise(resolve => {
        var service = google.youtube('v3');
        service.search.list({
            auth: auth,
            part: 'snippet',
            channelId: 'UCX6OQ3DkcsbYNE6H8uQQuVA',
            maxResults: '10',
            order: 'date'
        }, (err, result) => {
    
            if (err) {
                return console.log(err)
            }
    
            const { data } = result
            let videoIDS = []

            for (let i = 0; i < data.items.length; i++) {
                videoIDS.push(data.items[i].id.videoId)
            }
            resolve(videoIDS) 
    
        })
    })
}
  
  

async function authorize(credentials) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
  
    // Check if we have previously stored a token.
    const promise = new Promise(async resolve => {
        fs.readFile(TOKEN_PATH, async function(err, token) {
            if (err) {
                const result = await getNewToken(oauth2Client)
              resolve(result)
            } else {
              oauth2Client.credentials = JSON.parse(token);
              resolve(oauth2Client)
            }
          });
    })

    return promise
  }
// Load client secrets from a local file.


fs.readFile('client_secret.json', async function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }

  // Authorize a client with the loaded credentials, then call the YouTube API.
   let auth = await authorize(JSON.parse(content));
   let beast_set = new Set()
    let videos = await getChannel(auth)

    console.log('First Pass Through')
    for (let i = 0; i < videos.length; i++) {
        beast_set.add(videos[i])
    }
    
    await sleep(1000 * 5)

    videos = await getChannel(auth)
    console.log('Second Pass Through')
    for (let i = 0; i < videos.length; i++) {
        beast_set.add(videos[i])
    }

    await sleep(1000 * 5)

    console.log('Starting While Loop!')
    console.log(beast_set)

    while (1) {
        console.log('Looping')
        const new_video = await getChannel(auth)

        new_video.forEach(id => {
            if ( !beast_set.has(id) ) {

                postCommentReal(auth, id)
                console.log(`Found New Video ${id}`)

                beast_set.add(id)
            }
        })

        await sleep(100)
    }
    // while (1) {

    // }
    // postComment(auth)
});











/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client) {
    return new Promise(resolve => {
        var authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES
          });
          console.log('Authorize this app by visiting this url: ', authUrl);
          var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
          });
          rl.question('Enter the code from that page here: ', function(code) {
            rl.close();
            oauth2Client.getToken(code, function(err, token) {
              if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
              }
              oauth2Client.credentials = token;
              storeToken(token);
               resolve(oauth2Client)
            //   callback(oauth2Client);
            });
          });
    })
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    if (err) throw err;
    console.log('Token stored to ' + TOKEN_PATH);
  });
}

/**
 * Lists the names and IDs of up to 10 files.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */


//   service.channels.list({
//     auth: auth,
//     part: 'snippet,contentDetails,statistics',
//     forUsername: 'MrBeast'
//   }, function(err, response) {
//     if (err) {
//       console.log('The API returned an error: ' + err);
//       return;
//     }
//     var channels = response.data.items;
//     if (channels.length == 0) {
//       console.log('No channel found.');
//     } else {
//       console.log('This channel\'s ID is %s. Its title is \'%s\', and ' +
//                   'it has %s views.',
//                   channels[0].id,
//                   channels[0].snippet.title,
//                   channels[0].statistics.viewCount);
//     }
//   });


