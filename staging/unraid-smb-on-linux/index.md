{
  "title": "Unraid SMB Shares on Linux",
  "subtitle": "Permanently adding an Unraid SMB share to a Linux client",
  "seo_keywords": "Unraid, smb, nfs, nas, linux",
  "desc": "How to setup an Unraid SMB share to automatically mount on boot on a Linux client",
  "published": true,
  "dateEdited": 1698811200000,
  "datePosted": 1698811200000,
  "tags": [ "guide", "unraid", "linux", "homelab" ],
  "color": "#7A9CA2"
}
<!--# START POST #-->

This guide will explain how to setup an Unraid SMB share to automatically mount on boot on a Linux client. It also addresses the `noserverino` fix for stale file handles that can be encountered due to the Unraid Mover's impact on the Unraid SMB server.

## Install SMB/CIFS
Install SMB utlitiy to allow CIFS mounting: 
```
apt-get install cifs-utils
```

## Creating Protected File with SMB Credentials
Create secure SMB password file:
```bash
mkdir ~/Credentials/
cd ~/Credentials/
echo username=my_unraid_user > .smbpasswd_unraid
echo password=my_unraid_password >> .smbpasswd_unraid
chmod 600 .smbpasswd_unraid
```

## Adding Entry to fstab for Automatic Mounting on Boot
To get a share to automatically mount on boot, it needs to be added to `/etc/fstab`, like in this example:
```
//10.0.1.37/myshare /mnt/ClientPath cifs _netdev,noserverino,credentials=/home/rvrx/Credentials/.smbpasswd_unraid 0 0
```
* `//10.0.1.37/myshare` - path to smb share
* `/mnt/ClientPath` - local path. This is often a `/mnt/...` location. This path must be created locally first, so do a quick mkdir here if it is not.
* `cifs` - old name for SMB
* `_netdev` - tells mount that the filesystem is on a device that require network access. This will ensure that the system won't try to mount this share until its network services have finished setting up.
* `noserverino` - **IMPORANT FOR UNRAID**: "Client generates inode numbers itself rather than using the actual ones from the server." This will prevent stale file handle errors after the Unraid Mover is invoked. *More on this later...*
* `credentials=...` - path to our credentials file
* `0 0` - *fs_freq* and *fs_passno*. Very commonly these are both 0.


Unless you wish to reboot, run `mount -a` to mount the new fstab entries.

Check the manual for `mount` and `mount-cifs` on your system, under the "FILESYSTEM-INDEPENDENT MOUNT OPTIONS" section for more options you might want to consider, such as explicit read and write access declarations.


### The *noserverino* Fix
I have found very little background information on the /why/ of this fix, but here is the issue as I understand it:

When Unraid invokes its Mover, a file is moved from one disk to another. This causes a change in the “inode” number for this file. This inode holds important metadata about this file and its location, and is therefore required to access the file. When this change happens, the client remains ignorant, and on its next attempt to access this directory or file, it runs into the “stale file handle” issue. This is due to the file handle now pointing to an inode number that is, ultimately, invalid. Normally, in similar scenarios, the inode (and therefore file handle) would be refreshed, avoiding this. But in some edge-cases in CIFS (or even NFS), such as in the case of the Unraid mover, the server does not notify the client of the inode refresh. This is why the system flags it as “stale”. it is now effectively a null-pointer. The client has no idea where this file has gone.

Under normal SMB operation:
1. Server provides inode *number* (not actual inode information) to client.
2. When the client wants a file/dir, it requests the inode itself via this reference.
3. If the Unraid Mover has been invoked, causing a change in the inode number, there will not be a match


Client-side inode via `noserverino` flag:
1. Client generates its own inode and uses that to reference files.
2. When the Mover causes a quiet inode change, the client no longer cares, it's got its own reference locally, and the change is not breaking.

\
\
If my understanding is off, please email me at *cole@[this domain]* and let me know!