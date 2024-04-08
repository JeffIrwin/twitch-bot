
// standard imports
import { spawnSync } from "child_process";

// 3p imports
import tmi from "tmi.js";            // twitch
import stripAnsi from 'strip-ansi';  // remove ANSI esc sequences from strings

// my imports

// Example secrets file:
//
//     const oauth_token = "abcdefgh12345678";
//     export default { oauth_token };
//
// To get a token, first create a bot account and register the bot app according
// to these instructions:  https://dev.twitch.tv/docs/irc/get-started/
//
// Then, just run `run.sh`.  Or manually, use the twitch cli to generate a
// token:
//
//     /mnt/c/Program\ Files/twitch/twitch-cli_1.1.22_Windows_x86_64/twitch.exe token -u -s "chat:read chat:edit"
//
// On a new machine, you will probably have to run the native Windows twitch.exe
// CLI to setup the client ID and secret (copied from dev.twitch.tv settings) to
// get your first token.
//
//     twitch.exe token -u -s "chat:edit chat:read"
//
// On subsequent runs of this script, WSL twitch binary should work
//

import secrets from "./scratch/secrets.js";

//==============================================================================

const ME = "geoff_erwin";
const VERS = "0.0.3";

const MS_PER_S   = 1000;
const MS_PER_MIN = 60 * MS_PER_S;

//==============================================================================

// Define configuration options
const opts =
{
	options: {debug: true},
	identity:
	{
		username: ME,
		password: "oauth:" + secrets.oauth_token
	},
	channels:
	[
		"jeff_irwin"
	]
};

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers(defined below)
client.on("message", on_msg_handler);
client.on("connected", on_connected_handler);

// Connect to Twitch:
client.connect();

async function periodic_msgs(target)
{
	while (true)
	{
		//let msg = "howdy!  welcome to the stream.  try commands like !help or !links";
		let msg = "don't forget to smash that bell.  try commands like !help or !links";
		client.say(target, msg);
		//await sleep_ms(5 * MS_PER_S);
		await sleep_ms(15 * MS_PER_MIN);
	}
}

// Called every time a message comes in
let first = false;
function on_msg_handler(target, context, msg, self)
{
	if (self) { return; } // Ignore messages from the bot

	if (!first)
	{
		first = true;
		periodic_msgs(target);
	}

	// Remove whitespace from chat message
	const cmd_line = msg.trim();
	const cmd_words = cmd_line.match(/(?:[^\s"]+|"[^"]*")+/g);
	const cmd  = cmd_words[0];
	const args = cmd_words.slice(1);

	console.log("target = " + target);
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
			"commands:\n" +
			"\t!help    -- show this screen.\n" +
			"\t!links   -- show jeff's links.\n" +
			"\t!syntran 1+2;  -- run syntran code.\n" +
			//"\t!echo    -- print string arguments.\n" +
			//"\t!eval    -- execute arbitrary javascript.\n" +
			"\t!version -- show " + ME + " version.\n" +
			"\t!dice    -- roll dice.\n";

		const help_lines = help.split("\n");
		for (let i = 0; i < help_lines.length; i++)
		{
			client.say(target, help_lines[i]);
		}
		break;
	}
	case "!dice":
	{
		const num = roll_dice();
		client.say(target, "you rolled a " + num);
		//console.log("* executed `" + cmd + "` command");
		break;
	}
	case "!discord":
	{
		client.say(target, "i don't have a discord, but you can use !links to see my social links");
		break;
	}
	case "!jeff":
	{
		client.say(target, "my name is jeff");
		break;
	}
	case "!lurk":
	{
		// do nothing
		break;
	}
	case "!links":
	{
		client.say(target, "https://www.jeffirwin.xyz/about");
		break;
	}
	case "!version":
	{
		client.say(target, ME + " " + VERS);
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

		if (arg.includes("open") || arg.includes("include"))
		{
			// This will block anything that even contains an "open" substring
			client.say(target, "you are not in the sudoers file. this incident will be reported");
		}
		else
		{
			// TODO: wrap this whole case in an async fn in case somebody
			// drops a math bomb

			//console.log("cwd = ", process.cwd());

			// Prerequisite: build syntran.exe natively in Windows (*not* in
			// WSL) and copy into this repository's folder
			//let sy_cmd = spawnSync(".\\syntran.exe", ["-c", arg]);

			// Use WSL syntran binary.  This works as long as you also run this
			// bot in WSL nodejs
			let sy_cmd = spawnSync("syntran", ["-c", arg]);

			//if (sy_cmd.status == 0)
			//{
				// syntran just always returns 0 for "-c".  Need to fix it there
				// instead of trying to hack return status based on number of
				// lines
				//client.say(target, "" + sy_cmd.stdout);
				let lines = ("" + sy_cmd.stdout).split("\n");
				//client.say(target, "" + lines[0]);
				client.say(target, "" + stripAnsi(lines[0]));
			//}

		}
		break;
	}
	//case "!eval":
	//{
	//	// Usage: !eval 1 + 2
	//	const arg = args.join(" ");

	//	//// Usage: !eval "1 + 2"
	//	//const arg = args[0].replace(/[""]+/g, ""); // strip quotes

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

			client.say(target, "unknown command `" + cmd + "`.  use !help to show commands.");
			//console.log("* unknown command `" + cmd + "`");
		}
		break;
	}}
}

// Function called when the "dice" command is issued
function roll_dice()
{
	const SIDES = 6;
	return Math.floor(Math.random() * SIDES) + 1;
}

// Called every time the bot connects to Twitch chat
function on_connected_handler(addr, port)
{
	console.log("* connected to " + addr + ":" + port);
}

function sleep_ms(ms)
{
	return new Promise(resolve => setTimeout(resolve, ms));
}

