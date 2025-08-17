#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "--- Starting Access Point Setup ---"

# 1. CONFIGURE ACCESS POINT USING NETWORKMANAGER
# ------------------------------------------------
echo "Configuring wlan0 as an Access Point with NetworkManager..."

# This single command tells NetworkManager to:
#  - Create a Wi-Fi connection profile named "Kiosk-AP-Profile"
#  - Set the Wi-Fi name (SSID) to "Kiosk-WiFi"
#  - Put it in Access Point mode
#  - Set the static IP to 192.168.4.1
#  - Automatically handle DHCP for connecting clients (replaces dnsmasq)
nmcli dev wifi hotspot ifname wlan0 con-name "Kiosk-AP-Profile" ssid "Kiosk-WiFi" band bg ip4 192.168.4.1/24 password "raspberry"

echo "Bringing up the new Access Point connection..."
# The command above might automatically activate, but this ensures it.
nmcli con up "Kiosk-AP-Profile"


echo "--- Access Point Setup Complete! ---"