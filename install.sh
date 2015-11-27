#!/bin/bash

set -e

DIR="$( cd "$( dirname "$0" )" && pwd )"

if [ "none$1" == "none" ]; then
  echo "extension id is missing!"
  echo "usage: ./install.sh extensionId"
  exit -1
fi


if [ $(uname -s) == 'Darwin' ]; then
  echo "This is not for MAC"
else
  if [ "$(whoami)" == "root" ]; then
    if [ -x "/etc/chromium" ]; then
      TARGET_DIR="/etc/chromium/native-messaging-hosts"
    elif [ -x "/etc/opt/chrome" ]; then
      TARGET_DIR="/etc/opt/chrome/native-messaging-hosts"
    else
      echo "failed to guess chrome browser. it's neither chromium nor google-chrome"
      exit 1
    fi
  else
    if [ -x "$HOME/.config/chromium" ]; then
      TARGET_DIR="$HOME/.config/chromium/NativeMessagingHosts"
    elif [ -x "$HOME/.config/google-chrome-beta" ]; then
      TARGET_DIR="$HOME/.config/google-chrome-beta/NativeMessagingHosts"
    elif [ -x "$HOME/.config/google-chrome" ]; then
      TARGET_DIR="$HOME/.config/google-chrome/NativeMessagingHosts"
    else
      echo "failed to guess chrome browser. it's neither chromium, google-chrome nor google-chrome-beta"
      exit 1
    fi
  fi
fi


HOST_NAME=localhost.command.execute

# Create directory to store native messaging host.
mkdir -p $TARGET_DIR

# Copy native messaging host manifest.
cp "$DIR/$HOST_NAME.json" "$TARGET_DIR"

# Update host path in the manifest.
HOST_PATH=$DIR/execute.js
sed -i -e "s|HOST_PATH|$HOST_PATH|" $TARGET_DIR/$HOST_NAME.json
sed -i -e "s|EXTENSION_ID|$1|"      $TARGET_DIR/$HOST_NAME.json

# Set permissions for the manifest so that all users can read it.
chmod o+r $TARGET_DIR/$HOST_NAME.json

echo "Native messaging host $HOST_NAME has been installed."

