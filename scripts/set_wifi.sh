#!/bin/bash
set -e # Exit immediately if a command fails

# Assign arguments to variables for clarity
WIFI_SSID="$1"
WIFI_PASS="$2"

echo "--- Reconfiguring Wi-Fi to connect to '$WIFI_SSID' ---"

# 1. Stop and disable the Access Point services
echo "Stopping AP services..."
systemctl stop hostapd
systemctl stop dnsmasq
systemctl disable hostapd

# 2. Create the wpa_supplicant.conf file with the new credentials
echo "Creating new wpa_supplicant.conf file..."
cat <<EOF > /etc/wpa_supplicant/wpa_supplicant.conf
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
country=IS # Change to your country code e.g. US, GB

network={
    ssid="${WIFI_SSID}"
    psk="${WIFI_PASS}"
    key_mgmt=WPA-PSK
}
EOF

# 3. Re-enable the standard networking client
echo "Re-enabling standard networking..."
systemctl unmask wpa_supplicant
systemctl enable wpa_supplicant
systemctl restart dhcpcd

echo "Configuration complete. Rebooting in 5 seconds..."
sleep 5
reboot