---
layout: default
title: Google App Engine | Scalatra
---

<div class="page-header">
  <h1>Google App Engine</h1>
</div>

Scalatra doesn't work on [Google App Engine](https://developers.google.com/appengine/)
(GAE).

*Why not?!*

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
