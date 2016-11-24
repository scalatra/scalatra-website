---
title: "GitBucket, a large FOSS codebase in Scalatra"
author: Dave Hrycyszyn
twitter: futurechimp
date: 2013-09-16
aliases:
    - /2013/09/16/gitbucket-release.html
---

Congratulations are in order to the
[authors](https://github.com/takezoe/gitbucket/graphs/contributors) of
[GitBucket](https://github.com/takezoe/gitbucket), a free software clone of
[GitHub](https://github.com).

<!--more-->

GitBucket uses Scalatra, the [Slick](http://slick.typesafe.com/) database
query and access library and the pure-Java
[JGit](https://github.com/eclipse/jgit) implementation of git to provide the
most easily-installable open-source GitHub that it's possible to imagine.
Download Apache Tomcat, drop the GitBucket war file into it, and you'll have
your own privately-hosted GitHub clone in about 5 minutes.

The recent GitBucket
[v1.5 release](https://groups.google.com/forum/#!topic/scalatra-user/OiX0WLyoVVg)
brings repo forks, pull requests, LDAP authentication, a branch viewer, and
bug fixes to the code base.

GitBucket is a great example of a reasonably large FOSS codebase that you can
peruse if you're interested in seeing how things are done for a full-stack
Scalatra web application.
