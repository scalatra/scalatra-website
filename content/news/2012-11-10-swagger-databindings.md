---
title: New databindings guide
author: Dave Hrycyszyn
twitter: futurechimp
date: 2012-11-10
aliases:
    - /2012/11/10/swagger-databindings.html
---

As we work towards the Scalatra 2.2.0 release, we've been hard at work
documenting the many aspects of the framework included in the release.
This week saw publication of a long
[Swagger tutorial](http://www.infoq.com/articles/swagger-scalatra) on
[InfoQ](http://www.infoq.com).

<!--more-->


We've also published a pre-release
Scalatra Guide on the new
[databinder commands](http://scalatra.org/2.2/guides/databinders.html) in 2.2.
If you want to try it out, make sure you do:

`g8 scalatra/scalatra-sbt.g8 --branch develop`

and append `-SNAPSHOT` to all the
dependencies in the Guide, as it's written for 2.2.0 final.

Next up is a guide to Scalatra's Atmosphere support. We also plan to fill in
certain other under-documented aspects of Scalatra, notably the lamentably
skimpy documentation on data model integrations, before the 2.2 final release.

Several bugs have been fixed since 2.2.0-RC1, and a 2.2.0-RC2 is in preparation.
