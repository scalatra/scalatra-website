---
layout: guide
title: Installation
---

Getting started with a new web framework can be a bit scary.
Luckily, Scalatra is easy to install, as it has relatively few dependencies.

It can run on Windows, Mac OS X, Linux, or BSD.

---

## 1. Install a JDK

Scalatra is web micro-framework written in Scala, so you'll need to have a
Java Development Kit (JDK) installed.

Many systems come with a JDK pre-loaded.

Run `java -version` and `javac -version` in a terminal to find if yours
does. The output should look something like this:

```bash
$ java -version
java version "1.7.0_10"
OpenJDK Runtime Environment (IcedTea6 1.11.1) build 1.7.0_10-b18)
Java HotSpot(TM) 64-Bit Server VM (build 23.6-b094, mixed mode)
```

```bash
$ javac -version
javac 1.7.0_10
```

You need Java 7, which will show up as version 1.7.

Java 8 support in Scala is classed as experimental in Scala 2.11.x. If you
aren't sure what this means, use Java 7.

If you don't yet have Java installed, you can find out how to install
it for your system
<a href="http://docs.oracle.com/javase/7/docs/webnotes/install/index.html">
over at the Java 7 install page</a>. Make sure you're using OpenJDK or Sun's JDK.
Some Linux distros pre-install `gcj`, which won't work.

## 2. Install giter8

Once you're sure you've got Java installed, you will need to download a few
other utilities.

[Conscript](https://github.com/foundweekends/conscript) is a tool for installing and
updating Scala code.
[giter8](https://github.com/foundweekends/giter8/), which depends on conscript, allows you to check out project templates directly from Github.
It's the recommended way to generate Scalatra project skeletons.

<h4>Install conscript</h4>
  <pre>curl https://raw.githubusercontent.com/foundweekends/conscript/master/setup.sh | sh</pre>

  <p>
    This will create a `bin` folder in your home directory.
    Make sure it's in your `PATH` by adding the following to your shell's
    profile (often `~/.bash_profile` on Mac and `~/.bashrc` on Linux):
  </p>

<pre>
PATH=$PATH:~/bin
export PATH
source ~/.bash_profile # (Mac)
source ~/.bashrc       # (Linux)
</pre>

<h4>Install giter8</h4>
  <pre>cs foundweekends/giter8</pre>

  <p>Depending on your connection speed, this can take a bit of time, as
  `conscript` downloads quite a few Scala dependencies.</p>

Alternatively, you can install `giter8` on a Mac via
[homebrew](http://brew.sh/):

```bash
brew install giter8
```

---

With installation out of the way, head over to the "[first project](first-project.html)"
page, which will show you how to generate, build, and run a Scalatra application.
