#!/usr/bin/env bash

# Ref:
#
#     https://dev.twitch.tv/docs/authentication/refresh-tokens/#:~:text=When%20you%20get%20a%20user,receiving%20a%20401%20Unauthorized%20response.
#
# This is a standalone script mainly for testing and development, but it could
# just be a part of run.sh now that it's done

#curl -X POST https://id.twitch.tv/oauth2/token \
#-H 'Content-Type: application/x-www-form-urlencoded' \
#-d 'grant_type=refresh_token&refresh_token=gdw3k62zpqi0kw01escg7zgbdhtxi6hm0155tiwcztxczkx17&client_id=<your client id goes here>&client_secret=<your client secret goes here>'

config="${HOME}/.config/twitch-cli/.twitch-cli.env"

# get the shit from the goddamn config
REFRESHTOKEN=$(grep 'REFRESHTOKEN' "$config" | grep -o '\w*$')
CLIENTID=$(    grep 'CLIENTID'     "$config" | grep -o '\w*$')
CLIENTSECRET=$(grep 'CLIENTSECRET' "$config" | grep -o '\w*$')

# ping the motherfucker
response=$(curl -X POST https://id.twitch.tv/oauth2/token \
-H 'Content-Type: application/x-www-form-urlencoded' \
-d "grant_type=refresh_token&refresh_token=${REFRESHTOKEN}&client_id=${CLIENTID}&client_secret=${CLIENTSECRET}")

#echo "response = $response"

# parse the new shit from the motherfucker's response
#
# jq might be nice to use instead but it's a dependency
access_token=$( echo $response  | grep -o '"access_token":"\w*"' | cut -f 2 -d ':' | tr -d '"')
refresh_token=$(echo $response  | grep -o '"refresh_token":"\w*"' | cut -f 2 -d ':' | tr -d '"')

#echo "access_token  = \"$access_token\""
#echo "refresh_token = \"$refresh_token\""

# put the new shit back into the goddamn config
sed -i "s/ACCESSTOKEN=.*/ACCESSTOKEN=${access_token}/" "$config"
sed -i "s/REFRESHTOKEN=.*/REFRESHTOKEN=${refresh_token}/" "$config"

