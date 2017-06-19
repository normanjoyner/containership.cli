---
permalink: '/docs/plugins/overview'
---
---

# Overview

Plugins are extensions of the core containership functionality. There are two types of plugins:

`core` - Plugins that run on the containership cluster and provide additional core functionality

`cli` - Plugins that extend CLI capaiblities and commands.

An example plugin is the official `containership cloud` plugin that encapsulates the additional
functionality provided to you through the containership cloud dashboard. The plugin is both a core
a cli plugin. The CLI plugin extends the client with a new `cloud` command that allows you to interface
with all the additional features and capabilities that the `core` plugin providers.

See [creating a plugin]({{ site.baseurl }}/docs/plugins/creating) for more information on how to create
your own `core` and `cli` plugins for containership.
