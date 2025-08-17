#!/bin/bash
set -e # Exit immediately if a command fails

# Assign arguments to variables for clarity
WIFI_SSID="$1"
WIFI_PASS="$2"

echo "--- Reconfiguring Wi-Fi to connect to '$WIFI_SSID' ---"

# 1. Take down the NetworkManager Access Point profile
echo "Stopping and deleting the Kiosk AP profile..."
# Use '|| true' to ignore errors if the connection is already down or doesn't exist.
# This makes the script safe to run even if the AP was never started.
nmcli con modify "Kiosk-AP-Profile" connection.autoconnect no || true
nmcli con down "Kiosk-AP-Profile" || true
nmcli con delete "Kiosk-AP-Profile" || true
# nmcli con down "Kiosk-AP-Profile" || true
# 2. Connect to the new Wi-Fi network using NetworkManager
echo "Connecting to the new Wi-Fi network..."
# This single command finds the network, creates a new saved connection profile,
# and connects to it immediately.
nmcli dev wifi connect "$WIFI_SSID" password "$WIFI_PASS"

echo "Configuration complete. Rebooting in 5 seconds for changes to take full effect..."
sleep 5
reboot