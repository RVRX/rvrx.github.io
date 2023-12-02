{
  "title": "3rd Party Email Client w/ iCloud Custom Email Domain",
  "subtitle": "",
  "seo_keywords": "guide, icloud, email, SMTP",
  "desc": "How to add iCloud custom email domain to third party email client like Thunderbird",
  "published": true,
  "dateEdited": 1693540800000,
  "datePosted": 1693540800000,
  "tags": [ "guide" ],
  "color": "#887AA2"
}
<!--# START POST #-->

## Why
I've just signed up for *iCloud+* to use the "[Custom Email Domain](https://support.apple.com/en-us/HT212514)" feature as my email host. At $0.99/mo it certainly beats Google Workspace's $6/mo, and hey, my iPhone yelled at me just this morning that my iCloud storage was full. I was fully expecting there to be some element to keep me in the Apple ecosystem and make using 3rd party apps a pain, but to my surprise - **other than no documentation on the process - it was doable**.

## How
After you've set up a custom email domain through iCloud (must be done on an Apple device of course), to add the email to your 3rd party:
1. If you haven't already; **add your regular @icloud.com email to your email client**. if you haven't done this before, you'll find you **need to generate an [app specific password](https://support.apple.com/en-us/HT204397)**, and if your client doesn't autofill IMAP/SMTP the details, see [here](https://support.apple.com/en-us/102525).
2. If you didn't recently add the records to your domain, you might not have been instructed to add a [DNS SPF](https://www.cloudflare.com/learning/dns/dns-records/dns-spf-record/) record to your domain. Without this, the root iCloud account would not be authorized to send emails on behalf of your custom domain. This should come in the form of a TXT record saying `"v=spf1 include:icloud.com ~all"`, but I'd check the current documentation on Apple's end for this if unsure.
3. **Add your custom domain email as an 'alias' for the iCloud root account on your mail client**. This can come in many forms, so you might need to dig around the documentation for your client. On Thunderbird this can be found under `Account Settings -> [your iCloud account] -> Manage Identities`. Basically you just want to find the setting that allows you to send mail *from your iCloud account* **as** your custom email.
4. Some mail clients will be upset that your domain doesn't say anything about how to handle DMARC, so you might want to add a TXT record under `_dmarc.yourcustomdomain.com` with the body: `"v=DMARC1; p=none"`.

Following these steps I am getting a 100% rating on mail-tester.com.
