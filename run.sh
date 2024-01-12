#!/bin/bash

#============================================================

# One-time setup:
#
#     npm install
#     brew install twitch
#     # (check brew website for instructions on installing brew)

#============================================================

# Get a new user token.  They expire every 4 hours
#
# Make sure to log out of your main account and login as your bot account before
# doing this!

get_twitch_token()
{
	#mv scratch/secrets.js scratch/secrets-old.js

	# TODO: cmd flag to enable/disable token refresh
	twitch="/mnt/c/Program Files/twitch/twitch-cli_1.1.22_Windows_x86_64/twitch.exe"
	echo "const oauth_token = \"$("${twitch}" token -u -s "chat:read chat:edit" |& grep -oP "User Access Token: \K.*")\"; export default { oauth_token };" > scratch/secrets.js

}

run_twitch_bot()
{
	cmd.exe /c "node bot.js"
}

# TODO: update ./syntran.exe from installation?

# Try to just start the bot first.  If it fails (probably due to login issue),
# get a new token and try again
run_twitch_bot #|| \
	get_twitch_token && \
	run_twitch_bot

#============================================================

