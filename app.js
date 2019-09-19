var osrs = require('osrs-api');

const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Sheets API.
    authorize(JSON.parse(content), addStats);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error while trying to retrieve access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function listRSNS(auth) {
    const sheets = google.sheets({version: 'v4', auth});
    sheets.spreadsheets.values.get({
        spreadsheetId: '1PI6c9DOX1xI1daghxPYHXj2BmfgpAfUoBOanbUtmBn8',
        range: 'KyroLen!A2:N',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const rows = res.data.values;
        if (rows.length) {
            console.log('Name');
            // Print columns A and E, which correspond to indices 0 and 4.
            rows.map((row) => {
                console.log(`${row[0]}`);
            });
        } else {
            console.log('No data found.');
        }
    });
}

async function addStats(auth){
    const sheets = google.sheets({version: 'v4', auth});
    let players = ["Trainer Bad", "Makoara", "Sault", "Zestt", "Main Mukkor", "Lonely Wolf", "dognet", "OfCoarse", "Al Hasa", "Bitesized", "Maive",
        "Illioa", "Ily btw", "survived y2k", "Sir Mike S", "pyrokilldhc", "SirMixaLot97", "Earhole", "jomanan", "Q7L", "Wicz", "Rundera", "Listifyy",
       "Citadel wyrm", "AuroraRyall", "VienneseMelt", "Cave Worms", "Daevinan", "chaotickings", "Viing", "KyroLen", "Rock gooolem", "gz at 2277", "Sock Sucker", "LazyyySloth", "The OnlyPyro"]
    let values = [];
    //let players = ["Trainer Bad", "Makoara", "Sault", "Zestt", "Main Mukkor", "Lonely Wolf", "dickfield", "OfCoarse", "Al Hasa"]

    for (const player of players){
        console.log("Searching scores for " + player);
        let scores = await osrs.hiscores.getPlayer({name:player, type: osrs.constants.playerTypes.normal}).then().catch(console.error);
        wait(2000)
        const fields = ["runecrafting","thieving","hunter","agility","slayer","construction","woodcutting","farming","fishing",
            "easyClueScrolls","mediumClueScrolls","hardClueScrolls","eliteClueScrolls","masterClueScrolls","lastManStanding"];
        let playerValues = [];
        fields.forEach(function(field){
            if (scores[field]["experience"]) {
                playerValues.push(scores[field]["experience"]);
            }
            else{
                playerValues.push(scores[field]["score"]);
            }
        });
        values.push(playerValues);
    };

    sheets.spreadsheets.values.update({
        auth: auth,
        spreadsheetId: '1PI6c9DOX1xI1daghxPYHXj2BmfgpAfUoBOanbUtmBn8',
        range: 'API TEST!B2:P', //Change Sheet1 if your worksheet's name is something else
        valueInputOption: "USER_ENTERED",
        resource: {
            values: values
        }
    }, (err, response) => {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        } else {
            console.log("Appended");
        }
    });
}
//addStats();

function wait(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
        end = new Date().getTime();
    }
}