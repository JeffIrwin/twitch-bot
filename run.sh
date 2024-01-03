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

# TODO: cmd flag to enable/disable token refresh
mv scratch/secrets.js scratch/secrets-old.js
echo "const oauth_token = \"$(twitch token -u -s "chat:read chat:edit" |& grep -oP "User Access Token: \K.*")\"; export default { oauth_token };" > scratch/secrets.js

node bot.js

#============================================================

