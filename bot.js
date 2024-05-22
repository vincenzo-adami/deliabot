require('dotenv').config();

let tmi = require('tmi.js');
const https = require('https');


let client = new tmi.Client({
	options: { debug: true, messagesLogLevel: "info" },
	connection: {
		reconnect: true,
		secure: true
	},
	identity: {
		username: process.env.TWITCH_USERNAME,
		password: process.env.TWITCH_OAUTH
	},
	channels: [ process.env.TWITCH_CHANNEL ]
});

client.connect().catch(console.error);

function luna (obj, channel) {
    let gets = [];

    for (let i in obj){
        gets.push(i + "=" +encodeURIComponent(obj[i]))
    }

    gets.push("LDZ=" + new Date(obj.year,obj.month-1,1) / 1000);

    let url = "https://www.icalendar37.net/lunar/api/?" + gets.join("&");
    https.get(url,(res) => {
		let body = "";
	
		res.on("data", (chunk) => {
			body += chunk;
		});
	
		res.on("end", () => {
			try {
				let json = JSON.parse(body);
				// get the current day
				let giorno = new Date().getDate();
				// get the moon phase of the current day
				let fase = json.phase[giorno].phaseName;
				let luce = Math.round(json.phase[giorno].lighting);
				// compose message for the chat
				let mex = (`・Presenza della Luna: `+fase+`・Illuminazione: `+luce+`%`);
				client.say(channel, `${mex}`);
			} catch (error) {
				console.error(error.message);
			};
		});
	
	}).on("error", (error) => {
		console.error(error.message);
	});
	
}

let moonConfig = {
    lang  		: 'it', // (*) 
	day 		: new Date().getDay()+1,
    month 		: new Date().getMonth() + 1, // 1  - 12
    year  		: new Date().getFullYear(), // year
}

client.on('message', (channel, tags, message, self) => {
	if(self) return;
	if(message.toLowerCase() === '!moon') {
        luna(moonConfig, channel);
    }
});
