#!/usr/bin/env bash

#============================================================

# One-time setup:
#
#     npm install
#     brew install twitchdev/twitch/twitch-cli
#     # (check brew website for instructions on installing brew on linux)

#============================================================

# Get a new user token.  They expire every 4 hours
#
# Make sure to log out of your main account and login as your bot account before
# doing this!

get_twitch_token()
{
	# Popup a browser login dialog.  You probably don't want to do this manually
	# ever, except for once per machine

	#mv scratch/secrets.js scratch/secrets-old.js

	# TODO: cmd flag to enable/disable token refresh

	#twitch="/mnt/c/Program Files/twitch/twitch-cli_1.1.22_Windows_x86_64/twitch.exe"
	twitch="twitch"

	echo "const oauth_token = \"$("${twitch}" token -u -s "chat:read chat:edit" |& grep -oP "User Access Token: \K.*")\"; export default { oauth_token };" > scratch/secrets.js

}

refresh_twitch_token()
{
	# This is like get_twitch_token() but it mostly works automatically and
	# silently

	./refresh.sh

	config="${HOME}/.config/twitch-cli/.twitch-cli.env"
	access_token=$(grep 'ACCESSTOKEN' "$config" | grep -o '\w*$')

	#echo $access_token
	echo "const oauth_token = \"${access_token}\"; export default { oauth_token };" > scratch/secrets.js

}

run_twitch_bot()
{
	#cmd.exe /c "node bot.js"  # windows
	node bot.js  # linux
}

# TODO: update ./syntran.exe from installation?

if [[ ! -e scratch/secrets.js ]]; then
	#get_twitch_token
	refresh_twitch_token
fi

# Try to just start the bot first.  If it fails (probably due to login issue),
# get a new token and try again
run_twitch_bot #|| \
	#get_twitch_token && \
	refresh_twitch_token && \
	run_twitch_bot

#============================================================

