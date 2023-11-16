{
  "title": "Demo 3",
  "subtitle": "demo 3 subtitle",
  "desc": "demo 3Dynamic DNS to resolve the server IP reliably from outside the network",
  "published": false,
  "dateEdited": 2399708131979,
  "datePosted": 2399708131979,
  "tags": [ "tag1", "tag3" ],
  "color": "red"
}
<!--# START POST #-->

This guide will explains how to setup an Unraid SMB share to automatically mount on boot on a Linux client. It also addresses the `noserverino` fix for stale file handles.

## Install SMB/CIFS
Install SMB utlitiy to allow CIFS mounting: 
```
apt-get install cifs-utils
```

![HDD Image](hdd_pcb.jpg)

## Creating Protected File with SMB Credentials
Create secure SMB password file:
```bash
mkdir ~/Credentials/
cd ~/Credentials/
echo username=my_unraid_user > .smbpasswd_unraid
echo password=my_unraid_password >> .smbpasswd_unraid
chmod 600 .smbpasswd_unraid
```
