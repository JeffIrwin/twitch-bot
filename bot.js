
import tmi from "tmi.js";

// Example secrets file:
//
//     const oauth_token = "abcdefgh12345678";
//     export default { oauth_token };
//
// To get a token, first create a bot account and register the bot app according
// to these instructions:  https://dev.twitch.tv/docs/irc/get-started/
//
// Then, use the twitch cli to generate a token:
//
//     /mnt/c/Program\ Files/twitch/twitch-cli_1.1.22_Windows_x86_64/twitch.exe token -u -s "chat:read chat:edit"
//
import secrets from "./scratch/secrets.js";

const me = "geoff_erwin";
const vers = "0.0.1";

//==============================================================================

// Define configuration options
const opts =
{
	options: {debug: true},
	identity:
	{
		username: me,
		password: 'oauth:' + secrets.oauth_token
	},
	channels:
	[
		'jeff_irwin'
	]
};

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

// Called every time a message comes in
function onMessageHandler (target, context, msg, self)
{
	if (self) { return; } // Ignore messages from the bot

	// Remove whitespace from chat message
	const commandName = msg.trim();

	// If the command is known, let's execute it
	switch (commandName) {
	case "!help":
	{
		let help =
			"Commands:\n" +
			"\t!help    -- Show this screen.\n" +
			"\t!links   -- Show Jeff's links.\n" +
			"\t!version -- Show " + me + " version.\n" +
			"\t!dice    -- Roll dice.\n";

		const help_lines = help.split("\n");
		for (var i = 0; i < help_lines.length; i++)
		{
			client.say(target, help_lines[i]);
		}
		break;
	}
	case "!dice":
	{
		const num = rollDice();
		client.say(target, `You rolled a ${num}`);
		console.log(`* Executed ${commandName} command`);
		break;
	}
	case "!links":
	{
		client.say(target, "https://www.jeffirwin.xyz/about");
		break;
	}
	case "!version":
	{
		client.say(target, me + " " + vers);
		break;
	}
	default:
	{
		console.log(`* Unknown command ${commandName}`);
		break;
	}}
}

// Function called when the "dice" command is issued
function rollDice ()
{
	const sides = 6;
	return Math.floor(Math.random() * sides) + 1;
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port)
{
	console.log(`* Connected to ${addr}:${port}`);
}

