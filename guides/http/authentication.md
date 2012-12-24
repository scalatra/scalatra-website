---
layout: default
title: Flash | Scalatra
---

<div class="page-header">
  <h1>Flash</h1>
</div>


Scentry is Scalatra's optional authentication system.
Scentry is a **user submitted authentication** scheme.
Combining `ScentrySupport` and `BasicAuthSupport` traits allow you to quickly tie a
`User` class to the session and Basic Authentication methods.

---

## Dependency

```scala
// Put this in build.sbt:
"org.scalatra" % "scalatra-auth" % "{{ site.scalatra_version }}"
```

There is a new authentication middleware in the auth directory, to be
documented soon.  See an example at
[usage example](http://gist.github.com/660701).
Here's another [example](https://gist.github.com/732347) for basic authentication.

