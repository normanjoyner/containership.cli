---
command-name: 'client-plugin add'
permalink: '/docs/commands/client-plugin-add'
---

<h2> {{ page.command-name }} </h2>

The `{{ page.command-name }}` command allows you to add new `core` or `cli` plugins to your `.containership` directory.

> When a plugin is added, it is attempted to be synced and loaded as a `cli` plugin. If it is not a valid plugin it will be
ignored but may still be used as a `core` plugin if this is running on a containership node.

> If the plugin already exists, this command will be ignored. Please see
[client-plugin upgrade]({{ site.baseurl }}/docs/commands/client-plugin-upgrade)
for more information on upgrading plugins.

The command supports plugins in either `npm` or `github://` format (brackets denote optional and braces denote required):

`Github format: github://{organization}/{repo}[#version]`

`NPM format: [@{organization}/]{repo}[@{version}]`

Example adding the `cloud` plugin:

~~~
csctl client-plugin add github://containership/containership.plugin.cloud

added 325 packages in 35.971s
Successfully upgraded all plugins!
~~~
