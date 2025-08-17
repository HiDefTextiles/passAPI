#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "--- Starting Access Point Setup ---"

# 1. CONFIGURE STATIC IP FOR WLAN0
# ---------------------------------
echo "Configuring static IP for wlan0..."
# Stop the default networking service to take manual control
systemctl stop dhcpcd
# Add our static IP configuration
cat <<EOF > /etc/network/interfaces.d/wlan0-static
allow-hotplug wlan0
iface wlan0 inet static
    address 192.168.4.1
    netmask 255.255.255.0
    network 192.168.4.0
    broadcast 192.168.4.255
EOF
# Bring the interface up with the new IP
ifdown wlan0 || true # Ignore errors if it's already down
ifup wlan0

# 2. CONFIGURE DNSMASQ (DHCP SERVER)
# ---------------------------------
echo "Configuring dnsmasq..."
cat <<EOF > /etc/dnsmasq.conf
interface=wlan0
dhcp-range=192.168.4.2,192.168.4.20,255.255.255.0,24h
EOF

# 3. CONFIGURE HOSTAPD (THE ACCESS POINT)
# ---------------------------------
echo "Configuring hostapd..."
cat <<EOF > /etc/hostapd/hostapd.conf
interface=wlan0
driver=nl80211
ssid=Kiosk-WiFi
hw_mode=g
channel=7
wmm_enabled=0
macaddr_acl=0
auth_algs=1
ignore_broadcast_ssid=0
wpa=2
wpa_passphrase=raspberry
wpa_key_mgmt=WPA-PSK
wpa_pairwise=TKIP
rsn_pairwise=CCMP
EOF

# Point hostapd to its new config file
sed -i 's|#DAEMON_CONF=""|DAEMON_CONF="/etc/hostapd/hostapd.conf"|' /etc/default/hostapd

# 4. START THE SERVICES
# ---------------------------------
echo "Stopping conflicting services and starting AP services..."
systemctl stop wpa_supplicant
systemctl unmask hostapd
systemctl enable hostapd
systemctl restart dnsmasq
systemctl restart hostapd

echo "--- Access Point Setup Complete! ---"