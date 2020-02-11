Scalatra Website
================

This is the code for [https://scalatra.org](https://scalatra.org), including all the news, guides, and getting started content.

To build it:

* check it out locally
* install [Hugo version 0.31.1](https://gohugo.io). Anything above 0.31.1 will not work because of [this issue](https://github.com/scalatra/scalatra-website/issues/196)
* type `hugo serve` from the root directory of the repo

Hugo will fire up, and you'll be able to edit the site's contents at http://localhost:1313/

## New Scalatra version
The docs need to be updated when a new version of Scalatra is released. The following are the steps that were done when 2.7 was published.

1. Create 2.7 branch, then create 2.7 directory and copy 2.6 docs to 2.7 directory on 2.7 branch
1. Update 2.7 docs on 2.7 branch, then create a pull request
1. Merge into master, then publish the website

### Update 2.7 docs
1. Create the file `layouts/_default/guides-2.7.html`. Update it as needed.
1. In each *.md file, update the `layout: guides-2.6` line to `layout: guides-2.7`.
1. Add shortcodes for 2.7.
1. Update all references of 2.6 to {{< 2-7-scalatra_short_version >}} 
