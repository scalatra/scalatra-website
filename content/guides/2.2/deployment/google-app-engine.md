---
aliases:
  - /2.2/guides/deployment/google-app-engine.html
title: Google App Engine
---

Scalatra doesn't work on [Google App Engine](https://developers.google.com/appengine/)
(GAE).

*Why not?!*

----

## Short answer ##
Scalatra runs on the Java platform (JRE). GAE doesn't support the JRE.

## Long answer ##
GAE only supports a non-standard subset of the JRE, requiring that apps be specifically
designed for it.
Here are a few of the limitations:

- [No support](https://developers.google.com/appengine/docs/features#Roadmap_Features) for Servlet 3.0
- [Essential request headers](https://developers.google.com/appengine/docs/java/runtime#Request_Headers) are removed.
- [Essential response headers](https://developers.google.com/appengine/docs/java/runtime#Responses) are removed.
- Streaming responses are [unsupported](https://developers.google.com/appengine/docs/java/runtime#Responses).
- GAE is so aggressive about terminating slow responders that the app can be left in
an [inconsistent state](https://developers.google.com/appengine/docs/java/runtime#The_Request_Timer) according to the rules of the JVM.
- Apps [cannot make client requests](https://developers.google.com/appengine/docs/java/runtime#The_Sandbox) without using GAE's fetch service.
- [Not all](https://developers.google.com/appengine/docs/java/jrewhitelist) JRE classes are supported.
- Logging is possible [only through `java.util.logging`](https://developers.google.com/appengine/docs/java/runtime#Logging).

## Future ##
It's really the Servlet 3.0 that is absolutely essential for Scalatra.
Once that is implemented, if there is sufficient demand, it may be possible to support
GAE without forking the Scalatra codebase.

## Pretty please? ##

Scalatra 2.0.x was based on Servlet 2.5, and may work on GAE with the above
caveats.  This is unsupported by the Scalatra team, as we believe you will get
a better Scalatra experience with the [other Platform as a Service
options](index.html).
