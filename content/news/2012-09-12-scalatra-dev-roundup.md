---
title: Scalatra dev roundup
author: Dave Hrycyszyn
twitter: futurechimp
date: 2012-09-12
aliases:
    - /2012/09/12/scalatra-dev-roundup.html
---

Scalatra development has been proceeding at a rapid pace in recent months,
although we've been doing a pretty poor job of making that visible to the
outside world. Let's try and fix that.

<!--more-->


As you may have noticed, we released the 2.1.x series of Scalatra, and
to celebrate that release we also built out an improved website with better
instructions for [getting started](http://scalatra.org/2.2/getting-started/) and performing [common development tasks](http://scalatra.org/2.2/guides/).

Development on Scalatra 2.2.x is now proceeding full steam ahead.
One major new feature is improved data binding.

The data bindings will work using the Command pattern in conjunction with
typeclass converters. You'll be able to receive a JSON string in your request
params, and the converter will automatically deserialize the JSON, perform
validations, and inflate a command object for you - so you know you've got
good data coming in the front door when you start processing the request.

[Ivan Porto Carrero](https://twitter.com/casualjim), the Scalatra core team
member working on this, has offered an advance sneak-peek
[on his blog](http://flanders.co.nz/2012/09/08/typeclass-based-databinding-for-scalatra/).
