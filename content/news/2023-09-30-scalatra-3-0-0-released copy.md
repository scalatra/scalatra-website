---
title: "Scalatra 3.0.0 is out"
layout: news
author: Naoki Takezoe
twitter: takezoen
date: 2023-09-30
---

One year since the latest milestone build, the Scalatra team finally released Scalatra 3.0.0 with Scala 3 and Jakarta support!

<!--more-->

## Scala 3 and Jakarta support

Basically, Scalatra 3.0 is compatible with Scalatra 2.x and it now supports Scala 3 in addition to 2.12 and 2.13.

Also, Scalatra 3.0 supports both Servlet 4.0.1 (javax) and 5.0.0 (jakarta). Artifacts have a suffix depending on the Servlet version as follows:

```scala
// for javax
"org.scalatra" %% "scalatra-javax" % "3.0.0",
"org.scalatra" %% "scalatra-json-javax" % "3.0.0",
"org.scalatra" %% "scalatra-forms-javax" % "3.0.0",
...

// for jakarta
"org.scalatra" %% "scalatra-jakarta" % "3.0.0",
"org.scalatra" %% "scalatra-json-jakarta" % "3.0.0",
"org.scalatra" %% "scalatra-forms-jakarta" % "3.0.0",
...
```

## Dropped modules

Due to difficullty in continuous maintenance and support, the following module has been dropped in Scalatra 3.0.

- scalatra-atomosphere
- scalatra-scalate

You would be able to use atomosphere and scalate in your Scalatra applications by writing some simple integration code yourself.

## Resources

- [Scalatra 3.0 Guides](https://scalatra.org/guides/3.0/) explain features of Scalatra 3.0 comprehensively
- [Here](https://github.com/scalatra/scalatra-website-examples) is a collection of Scalatra example projects that now include Scalatra 3.0
- [Giter8 template](https://github.com/scalatra/scalatra.g8) now generates a Scalatra 3.0 project with Scala 3 and Jakarta by default
