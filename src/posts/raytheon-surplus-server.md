---
title: Aerospace Grade... Compute?
description: Carbon Fiber Raytheon Surpluss
tags:
  - homelab
  - server
date: 2025-11-23T17:00:00-05:00
color: "#797979"
layout: post.njk
---


## Discovering the Server

Don’t quite remember how I stumbled upon it, but in late August I found myself looking at an eBay listing for a “Crystal Rugged Model RS265P 2U Carbon Fiber Ruggedized Industrial Server.”   

![][image1]  
Now beyond the immediate “that's a thing??,” of seeing a *carbon fiber* server, a couple things caught my eye:

(1) a starting price of only $100 with 0 bids six days into a weeklong action, and

(2) it was likely worth more than $100 \- even with the dubious “for parts” eBay categorization. 

### Research

[RS265P Rugged 2U Carbon Fiber Server \- Crystal Group](https://www.crystalrugged.com/product/rs265p-rugged-2u-carbon-fiber-server/) ([archive](https://archive.is/6gdA7))

Looking at the description, I noticed that this was only marked as 'for parts' because the system was untested: **“We are unsure of any other specs as we don't have a power cable to power it up.”**

While “untested” and its close neighbor “for parts” often actually means “nothing works, but I don’t want to tell you that.” I trusted that this seller actually just didn't have the very unique DC power input nor the know-how or gear required to open up the case and connect an ATX PSU to the motherboard. I messaged the seller aiming to figure out the chances of the hardware actually being in working order.  

![][image2]  
Well. Now I knew it was Raytheon/RTX surplus, and he had multiple units \- despite only listing one. I figured the chances that Raytheon is auctioning off dead server's instead of scrapping them quite low...


### Purchasing

With my curiosity piqued enough, I put in my max bid of $125, and a day later I was the proud owner of… nothing. Someone outbid me in the last few seconds of the auction. Well, I went back to my DMs to the seller…. and **ended up walking away with *two* servers, for $110 each**. I did this ~~due to an obsession with I hoarding weird technology~~ in hopes that I could resell one for double the money and keep the other \- effectively getting one unit for free.

---

## The Server Arrives

**![][image3]**

### Included Paperwork

The servers came with some RMA paperwork \- looks like they were both sent back to Crystal Rugged in late 2021 to get a USB 3.0 upgrade. Interestingly some of the paperwork had more contact information for the RTX employees involved than I expected. Not sure why they chose to include these docs, but OK.

![](/img/raytheon-coversheet-censored.png)

### Exterior

* The IO shield goes pretty hard. Its not the SuperMicro OEM one, but rather Its CNC’d just for this motherboard’s IO layout from a solid block.  
TODO: PHOTO
* Fat ground connection  

![](/img/raytheon-s-l1600-10.png)


![](/img/raytheon-s-l1600-11.png)


![](/img/raytheon-s-l1600.png)


## Opening the server up

Apparently tool-less screws or latching mechanisms are too heavy so Crystal instead opted for *seventy* screws that need to be taken out in order to open up the server. In fairness to the designers of this sleek chassis, *only 17* to get access to the pci-e lanes to service the cards, with the rest of the motherboard hiding behind the other 53\.  

![](/img/raytheon-s-l1600-2.png)


![](/img/raytheon-s-l1600-4.png)


![](/img/raytheon-s-l1600-5.png)


![](/img/raytheon-s-l1600-6.png)

Crystal certainly wasn’t lying about the ruggedized nature of this build. 

* The fans are nice SanAce models with sturdy **aluminum frames**, which I’ve never seen before.  
* Unused PCI lanes have dust covers
* Certain connections are hot-glued in place
* Plenty of ground wires
* All eight sticks of RAM have stabilizers, holding them in place -- perfectly equidistant from each other![][image4]  
* Goop. Yup. a lot of goop. Zoom in on some of the photos above and you'll see:
  * Some grey goop around capacitors
  * Some clear goop around some traces and smaller chips (see base of the CPU heatsinks)
  * Hot glue on certain connections (see drive backplane)
  * And most interestingly, some oily goop goop *in* the PCI-e lanes. Discovered this one when pulling out the RAM.

The grey and clear goop makes some sense to me \- the server might be getting jostled around, and Crystal wanted to prevent any components on the PCBs from rattling their way off. Assuming the grey material handles higher temps better. I can't quite figure out, however, why the slots (expansion/PCI \+ RAM) have goop in them? In fact I think the RAM itself was a fair bit oily \- not just at the contacts.  


They also put their own stickers on the Samsung DIMMs  
![][image5]

Looks like when estimating the potential cost of the server pre-purchase, I had not considered the RAM. 256GB of ECC DDR4 per server 🤑🤑. Glued together via spacers atop the sticks, and covered in an oily goop \- but DDR4 nonetheless.  
**XXX more stuff about the physical internals**

### Discovering a Spec Drawings Doc \+ The OG Auction

In other ‘why was this made available’ findings, I ended up tracking down a PDF published **by the auction house that the original buyer of this lot of servers source them from** that begins with a preface about it being “Export Controlled under EAR” and disclaimers on every page from Crystal Group saying “RECIPIENT AGREES NOT TO DISCLOSE OR REPRODUCE ALL OR PART OF THIS DRAWING”. <!-- The doc was a TODO TODO whatever you call ME measurement diagram, printed CAD thingy TODO TODO.--> Crystal appears to still manufacture this model, so I don't quite understand why RTX thought it was appropriate to provide the mechanical drawings to the auction-house. How did I stumble upon this? Well, I punched into Google Search what I thought was a model number for one of the PCI-e cards \- thinking it was a generic OEM model identifier \- but looks like the card was actually re-labeled with Crystal PNs. **And this document was indexed in Google. [Here's the hotlink to it for those curious if it is still up](https://www.hgpauction.com/wp-content/uploads/2024/10/2482572-CMS-00507.pdf).**

#### Finding the Auction Site

Poked around the website hosting the PDF for a while, till I was able to trace down the original listing\! The auction, titled “Raytheon: Surplus SATCOM Communications & Field Equipment” had a staggering 779 lots. That's 779 different listings, with things like Flight-Sims, racks of equipment inside portable shelters, some insane aeronautical surveillance cameras, and tons of other communications equipment I wouldn’t know how to describe. Check it out live [here](https://bid.hgpauction.com/past-auctions/herita10278?page=1&pageSize=60) or archived [here](https://archive.is/c4Azm).  
![][image6]  
 **My servers** appear to have come from lot 502 ([live](https://bid.hgpauction.com/past-auctions/herita10278/lot-details/24b1bb99-a031-4fd6-a41a-b24100208477), [archive](https://archive.is/m8WFK)) \- which sold for an unpublished amount on Feb 06, 2025\. The lot description doesn't include any links to the previously mentioned, so I’m not quite sure where that was published.  
![][image7]  

## Booting the Server

### Getting it Powered

I looked around my apartment but unfortunately I did not have a [CB6P20-22SS-A34 (MIL-DTL-5015)](https://www.milnec.com/mil-5015-connectors/mil-c-5015-connectors-catalog.pdf) connector nor 28VDC service to power the unit, so I pulled out the funky PSU in the server and swapped in my own. Of course, half of the connectors had to be glued on, so it took me longer than I thought, but we got there. I didn’t have the right gear to get all the fans hooked up (they were wired straight into the PSU instead of going through the MODO headers for some reason), but a couple Noctuas on top did the job well enough.  
![][image9]

### Getting into the IPMI

	Once I got it powered on, my next challenge was actually connecting to it… turns out after I got rid of my old monitors a few months back I no longer had anything that could capture VGA output. I tried getting into the IPMI but the interface wasn’t asking my router for a DHCP lease \- and wasn’t otherwise advertising itself as active (outside of a link light on the port).

#### Getting display out

Went to the local Microcenter and it turns out VGA to HDMI adapters aren’t a hot commodity so they had none. Apparently VGA to HDMI is a bit more complicated than the other direction, as it requires some supplemental power over USB.  
![][image10]  
![][image11]

#### Getting into the BIOS

	Once I got the cable, I was able to reset the IPMI, which, interestingly, had been set statically to `173.11.10.202/24` \- which is not in a private subnet or other reserved address block.  
![][image12]

	It also had the boot mode set to LEGACY, so I swapped that over to UEFI.

#### Back to the IPMI

	Plugged in a USB semi-virtually (my PiKVM is plugged into the server’s USB and can mount arbitrary files), and used the BIOS to trigger a boot to it. Curiously I wasn’t getting any video output. I decided to fall back to the IPMI KVM, but that came with some problems. I’ve worked with a couple of SuperMicro’s before, both brand new enterprise gear and older stuff from ebay, and I’ve never actually run into one that *doesn’t* have the modern HTML KVM as an option. Falling back to the Java JNLP applet was much more of a pain then it needed to be. I had to:

* Download an older version of Java (JDK 8u151). Oracle makes this a pain, and all the old repo’s I used to use seemed to be dead.  
* Even after disabling every security feature I still had to roll my computer’s clock back to 2015 to get past some disabled features and expired certificates.

(For whatever reason I did all this research in a private window and didn’t document it, so I no longer recall what the exact error message was)  
	

Once I got into the IPMI’s KVM I saw it was the RAID card that was holding up the boot. Not sure why this didn’t make its way to the VGA output. On that note I know almost nothing about how cards like these place themselves into the boot process to present configuration screen like this.

![][image13]  
Press any key to continue…

![][image14]  
If you hit ‘C’, you get this cute little LSI screen, with not much to do without any drives attached.

![][image15]  
Wait for this guy to go on by

![][image16]  
Another splash screen

![][image17]  
… and finally at a screen that is actually also going out the VGA port\!

![][image18]  
Boot into my media

![][image19]  
Ran some super quick memtests just to make sure the RAM was good, as I plan to resell it quickly.

![][image20]  
Boot into Ubuntu and check out all those cores 😁.


## Conclusion

Made my money back selling RAM alone; sold off all the RAM from one unit, and half from the other (I think I’ll be fine with just 128GB). Sold off the rest of the components for the server all at once. Probably could have made more money selling each piece individually \- esp, the motherboard \- but I figured I would take the easy route. So, all in all, a pretty fun weekend project, that I was able to walk away from a few hundred dollars richer and with a free carbon fiber server (-128GB of RAM) that can sit in a rack in my cluttered room and look sick (i.e., collect dust).

[image1]: /img/raytheon-image1.webp

[image2]: /img/raytheon-image2.webp

[image3]: /img/raytheon-image3.webp

[image4]: /img/raytheon-image4.webp

[image5]: /img/raytheon-image5.webp

[image6]: /img/raytheon-image6.webp

[image7]: /img/raytheon-image7.webp

[image9]: /img/raytheon-image9.webp

[image10]: /img/raytheon-image10.webp

[image11]: /img/raytheon-image11.webp

[image12]: /img/raytheon-image12.webp

[image13]: /img/raytheon-image13.webp

[image14]: /img/raytheon-image14.webp

[image15]: /img/raytheon-image15.webp

[image16]: /img/raytheon-image16.webp

[image17]: /img/raytheon-image17.webp

[image18]: /img/raytheon-image18.webp

[image19]: /img/raytheon-image19.webp

[image20]: /img/raytheon-image20.webp
