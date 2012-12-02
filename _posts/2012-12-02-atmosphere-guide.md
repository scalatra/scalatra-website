---
layout: post
title: Atmosphere guide now available
author: Dave Hrycyszyn
twitter: futurechimp
---

Just in time for the end of the year, we're nearly done with the 
Big Documentation Push of 2012. This time we've got a 
[first draft](http://scalatra.org/2.2/guides/atmosphere.html) 
of a guide to Scalatra's new 
[Atmosphere](https://github.com/Atmosphere/atmosphere) support. 

This is an exciting addition to the upcoming Scalatra 2.2 release.
Atmosphere provides server-push capabilities for persistently connected
clients. It takes care of the low-level connection and transport
details using either its own 
[connector](https://github.com/Atmosphere/atmosphere/wiki/jQuery.atmosphere.js-API)
or [socket.io](http://socket.io).


In other news, after quite a bit of discussion over the exact meaning of
the word "databinding", the namespace formerly known as "databinding"
has been renamed to "commands". We've updated the
[Scalatra Guides](http://scalatra.org/2.2/guides) to reflect the new
name. Code examples should work as before. 