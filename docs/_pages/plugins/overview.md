---
permalink: '/docs/plugins/overview'
---
---

# Overview

Plugins are extensions of the core Containership functionality. There are two types of plugins:

`core` - Plugins that run on the Containership cluster and provide additional core functionality

`cli` - Plugins that extend CLI capaiblities and commands.

An example plugin is the official `containership cloud` plugin that encapsulates the additional
functionality provided to you through the Containership cloud dashboard. The plugin is both a core
a CLI plugin. The CLI plugin extends the client with a new `cloud` command that allows you to interface
with all the additional features and capabilities that the `core` plugin providers.

See [creating a plugin]({{ site.baseurl }}/docs/plugins/creating) for more information on how to create
your own `core` and `cli` plugins for Containership.
