---
title: Google App Engine
layout: guides-2.5
---

Scalatra can run on [Google App Engine Flexible Environment](https://cloud.google.com/appengine/docs/flexible/java/). You can use the provided [Java 8 / Jetty 9 runtime](https://cloud.google.com/appengine/docs/flexible/java/dev-jetty9), the provided [Java 8 runtime](https://cloud.google.com/appengine/docs/flexible/java/dev-java-only) (which would require you to write the server setup code yourself), or any external Docker image capable of running Java web applications.

Scalatra can run on [Google App Engine Standard Java 8 runtime](https://cloud.google.com/appengine/docs/standard/java/runtime-java8) with some [limitations](https://cloud.google.com/appengine/docs/standard/java/how-requests-are-handled), most notably no support for streaming responses and no support for Servlet 3+ async processing.

The old [Java 7 runtime](https://cloud.google.com/appengine/docs/standard/java/runtime) only supports Servlet API 2.5 and imposes even more restrictions, making it practically unusable with Scalatra.
