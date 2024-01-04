
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

import { spawn } from 'child_process';
//import 'child_process';

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
	const cmd_line = msg.trim();
	const cmd_words = cmd_line.match(/(?:[^\s"]+|"[^"]*")+/g);
	const cmd  = cmd_words[0];
	const args = cmd_words.slice(1);

	//console.log("cmd  = " + cmd);
	//console.log("args = " + args);

	// If the command is known, let's execute it
	switch (cmd) {
	case "!help":
	case "!h":
	case "!commands":
	case "!command":
	{
		let help =
			"Commands:\n" +
			"\t!help    -- Show this screen.\n" +
			"\t!links   -- Show Jeff's links.\n" +
			//"\t!echo    -- Print string arguments.\n" + // TODO: is this safe
			//"\t!eval    -- Execute arbitrary javascript.\n" +
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
		client.say(target, "You rolled a " + num);
		//console.log("* Executed `" + cmd + "` command");
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
	case "!echo":
	{
		client.say(target, args.join(" "));
		break;
	}
	case "!syntran":
	case "!sy":
	{
		// Usage: !syntran 1 + 2;
		const arg = args.join(" ");

		if (arg.includes("open"))
		{
			// This will block anything that even contains an "open" substring
			client.say(target, "You are not in the sudoers file. This incident will be reported");
		}
		else
		{
			//client.say(target, "ok");

			//var ls  = spawn('ls', ['-l']);
			//ls.stdout.on('data', function (data) {
			//   console.log(`stdout: ${data}`);
			//});

			//var cmd = spawn('syntran', ['-c "' + arg + '"']);
			//var sy_cmd = spawn('syntran', ['-c', arg]);

			console.log("cwd = ", process.cwd());

			//var sy_cmd = spawn('/home/jeff/bin/syntran', ['-c', arg]);
			//var sy_cmd = spawn('/home/jeff/bin/syntran', ['--version']);

			// Prerequisite: build syntran.exe natively in Windows (*not* in
			// WSL) and copy into this repository's folder
			//var sy_cmd = spawn('.\\syntran.exe', ['--version']);
			//var sy_cmd = spawn('.\\syntran.exe', ['-c "' + arg + '"']);
			var sy_cmd = spawn('.\\syntran.exe', ['-c', arg]);

			let answer = "";
			sy_cmd.stdout.on('data', function (data) {
				console.log(`stdout: ${data}`);
				answer = data;
				client.say(target, "" + data);
			});

			sy_cmd.stderr.on('data', (data) => {
			  console.error(`stderr: ${data}`);
			});

			sy_cmd.on('close', (code) => {
			  console.log(`child process exited with code ${code}`);
			});

			//client.say(target, "" + answer);

		}
		break;
	}
	//case "!eval":
	//{
	//	// Usage: !eval 1 + 2
	//	const arg = args.join(" ");

	//	//// Usage: !eval "1 + 2"
	//	//const arg = args[0].replace(/['"]+/g, ''); // strip quotes

	//	console.log("arg = " + arg);
	//	client.say(target, "" + eval(arg));
	//	break;
	//}
	default:
	{
		let char_ = cmd.substring(0, 1);
		if (char_ == "!")
		{
			// Don't bother logging non-commands

			client.say(target, "Unknown command `" + cmd + "`.  Use `!help` to show commands.");
			//console.log("* Unknown command `" + cmd + "`");
		}
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
	console.log("* Connected to " + addr + ":" + port);
}

