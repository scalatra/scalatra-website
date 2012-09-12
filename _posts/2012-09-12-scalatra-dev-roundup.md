---
layout: default
title: Scalatra dev roundup
---

Scalatra development has been proceeding at a rapid pace in recent months,
although we've been doing a pretty poor job of making that visible to the
outside world. Let's try and fix that.

First up, development on Scalatra 2.2.x is now proceeding full steam ahead.
One major feature being worked on has been typeclass data binding.

The data binders will work using the Command pattern in conjunction with
typeclass converters. You'll be able to receive a JSON string in your request
params, and the converter will automatically deserialize the JSON, perform
validations, and inflate a command object for you - so you know you've got
good data coming in the front door when you start processing the request.

Ivan Porto Carrero,the Scalatra core team member working on this, has offered
an advance sneak-peek [on his blog][http://flanders.co.nz/2012/09/08/typeclass-based-databinding-for-scalatra/].

Ivan is also working with Jean-François Arcand, the [Atmosphere][https://github.com/Atmosphere/atmosphere/wiki] project
lead, to make Scalatra's Atmosphere integration the best it can be. For those
who are not yet aware of it, Atmosphere designed to make it easier to build a
synchronous web applications that include a mix of WebSocket, Comet and
RESTful behavior.

At present, Scalatra already has Atmosphere support, using
[Meteor chat][https://github.com/scalatra/scalatra/blob/develop/example/src/main/scala/org/scalatra/MeteorChatExample.scala]. Ivan and Jean-François are currently figuring out how to make Atmosphere
usage the simplest and most seamless experience possible, supporting as many
of the Atmosphere protocols as is practical.

Ivan and Ross Baker, another member of the core team, are currently both in
San Francisco. This is a rare occurrence fraught with frightening possibilities.
Watch this space to see what that brings.