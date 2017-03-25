---
aliases:
  - /2.3/guides/testing/continuous-integration.html
title: Continuous integration
---

Continuous integration is the practice of having a build server regularly compile
and test the latest code base.
Using continuous integration has many advantages:

- Developers can be alerted by the build server when a recent commit will not compile
("breaks the build") or fails tests.
- When development slows down, the build server continues to regularly download and
compile the app, alerting developers to bit rot.
- In cases where a project's test suite takes a long time to run, the burden can be
shifted to the build server by creating a temporary "staging" branch.
- Build servers are an ideal "outside tester" for your build process.
They don't share the peculiarities of your shell environment, home directory,
`/usr/local/bin` directory, etc.

Wikipedia lists [even more advantages](http://en.wikipedia.org/wiki/Continuous_integration#Advantages).
Continuous integration is not much less important than source control and build
automation; it should be a part of most of your projects!

## Jenkins ##

## Set up a free hosted Jenkins ##

## Add a build status image to your `README` file  ##

## Integrate IRC and Twitter (seriously!) ##

{% include _under_construction.html %}
