---
command-name: 'client-plugin upgrade'
permalink: '/docs/commands/client-plugin-upgrade'
---

<h2> {{ page.command-name }} </h2>

The {{ page.command-name }} command allows you to upgrade new `core` or `cli` plugins to your `.containership` directory.

> When a plugin is upgraded, it is attempted to be synced and loaded as a `cli` plugin. If it is not a valid plugin it will be
ignored but may still be used as a `core` plugin if this is running on a containership node.

> If the plugin does not already exist, this command will be ignored. Please see
[client-plugin add]({{ site.baseurl }}/docs/commands/client-plugin-add)
for more information on upgrading plugins.

The command supports plugins in either `npm` or `github://` format (brackets denote optional and braces denote required):

`Github format: github://{organization}/{repo}[#version]`

`NPM format: [@{organization}/]{repo}[@{version}]`

Example upgrading the `cloud` plugin:

~~~
./bin/cli.js client-plugin upgrade github://containership/containership.plugin.cloud

upgradeed 325 packages in 35.971s
Succesfully upgraded all plugins!
~~~
