---
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
openjdk version "11.0.20.1" 2023-08-24 LTS
OpenJDK Runtime Environment Zulu11.66+19-CA (build 11.0.20.1+1-LTS)
OpenJDK 64-Bit Server VM Zulu11.66+19-CA (build 11.0.20.1+1-LTS, mixed mode)
```

```bash
$ javac -version
javac 11.0.20.1
```

You need Java 11 or above (Oracle's JDK, OpenJDK, AdoptOpenJDK and various other distributions exist), which will show up as version 11. Java 8 is no longer supported in Scalatra 3.0.

If you don't yet have Java installed, you can find out how to install it for your system over at
[the Oracle's Java download page](https://www.oracle.com/java/technologies/downloads/)
or [the OpenJDK installation page](http://openjdk.java.net/install/index.html) or [AdoptOpenJDK download page](https://adoptium.net/).

## 2. Install sbt

Once you're sure you've got Java installed, you will need to install the _sbt_.

[sbt](https://www.scala-sbt.org/) is a build tool for Scala, Java, and more.
It can create a new project from the template repository.

In order to create a new project of Scalatra from the template, _sbt 0.13.13_ or later needs to be installed.
To install sbt, refer to [the Installing sbt page](https://www.scala-sbt.org/1.x/docs/Setup.html).

For example, if it is macOS, you can install it by brew command as follows.

```Bash
$ brew install sbt
$ sbt
...
...
> sbtVersion
[info] 1.9.7
```

---

With installation out of the way, head over to the "[first project](first-project.html)"
page, which will show you how to generate, build, and run a Scalatra application.
