# Mixmax JS SDK

[![Build Status](https://travis-ci.org/mixmaxhq/mixmax-sdk-js.svg?branch=master)](https://travis-ci.org/mixmaxhq/mixmax-sdk-js)

This repo is for our Mixmax JavaScript SDK for use by third party apps as well as Mixmax's own apps.
It exports a top level module called `Mixmax`, with submodules

* `Mixmax.editor`: APIs for managing the lifecycle of a [Mixmax enhancement]'s editor as documented
[here][Mixmax.editor docs].
* `Mixmax.widgets`: APIs for embedding Mixmax functionality in your own website, currently the
sequence picker as documented [here][sequence picker docs] and the embedded calendar as documented
[here][embedded cal docs].
* `Mixmax.sidebar`: APIs for integrating your website into the Mixmax sidebar as documented
[here][Mixmax.sidebar docs].

If you are interested in contributing to this repo, see [here][CONTRIBUTING.md].

[Mixmax enhancement]: https://developer.mixmax.com/docs/overview-enhancement
[Mixmax.editor docs]: https://developer.mixmax.com/docs/overview-enhancement#sdkjs
[sequence picker docs]: https://developer.mixmax.com/docs/sequences-picker
[embedded cal docs]: https://developer.mixmax.com/docs/embedded-calendar
[Mixmax.sidebar docs]: https://developer.mixmax.com/docs/sidebars
[CONTRIBUTING.md]: CONTRIBUTING.md
