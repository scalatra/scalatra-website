---
title: "Scalatra 3.1.0 is out"
layout: news
author: Naoki Takezoe
twitter: takezoen
date: 2024-06-08
---

The Scalatra team is pleased to announce the release of version 3.1.0 of the framework.

<!--more-->

Scalatra 3.1 is compatible with Scalatra 3.0 but supports Servlet 6.0.0 and Jetty 12.0.9.

You need to specify the suffix of artifacts depending on which version you use ervlet 4.0.1 (javax) or 6.0.0 (jakarta):

```scala
// for javax
"org.scalatra" %% "scalatra-javax" % "3.1.0",
"org.scalatra" %% "scalatra-json-javax" % "3.1.0",
"org.scalatra" %% "scalatra-forms-javax" % "3.1.0",
...

// for jakarta
"org.scalatra" %% "scalatra-jakarta" % "3.1.0",
"org.scalatra" %% "scalatra-json-jakarta" % "3.1.0",
"org.scalatra" %% "scalatra-forms-jakarta" % "3.1.0",
...
```

Also, many libraries are upgraded in Scalatra 3.1.0 but there are no code level imcompatibility, so you can still refer to Scalatra 3.0 documentation and examples for Scalatra 3.1.

- [Scalatra 3.0 / 3.1 Guides](https://scalatra.org/guides/3.0/) explain features of Scalatra 3.0 / 3.1 comprehensively
- [Scalatra examples repository](https://github.com/scalatra/scalatra-website-examples) contains many examples for Scalatra 3.0  compatible with Scalatra 3.1
