#!/bin/sh

# Start brickd and run it in the background.
brickd &

# Start the tftemp.js file
/usr/local/bin/node /home/user/tftemp.js
