#!/bin/bash
set -e

echo "--- Starting Access Point Setup using NetworkManager ---"

# Delete any old profile with the same name to ensure a clean start
nmcli con delete "Kiosk-AP-Profile" || true

# Step 1: Create a new, plain Wi-Fi connection profile
echo "Creating a new connection profile..."
nmcli con add type wifi ifname wlan0 con-name "Kiosk-AP-Profile" autoconnect no ssid "Kiosk-WiFi"

# Step 2: Modify the profile to be a WPA2 Access Point with our specific IP
echo "Configuring the profile as a Hotspot..."
nmcli con modify "Kiosk-AP-Profile" 802-11-wireless.mode ap 802-11-wireless.band bg
nmcli con modify "Kiosk-AP-Profile" wifi-sec.key-mgmt wpa-psk wifi-sec.psk "raspberry"
nmcli con modify "Kiosk-AP-Profile" ipv4.method shared ipv4.addresses 192.168.4.1/24

# Step 3: Set the profile to autoconnect on boot
echo "Setting AP Profile to autoconnect..."
nmcli con modify "Kiosk-AP-Profile" connection.autoconnect yes

# Step 4: Activate the new Access Point connection
echo "Activating the new Access Point..."
nmcli con up "Kiosk-AP-Profile"

echo "--- Access Point Setup Complete! ---"