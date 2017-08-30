---
command-name: 'cloud cluster use'
permalink: '/docs/plugins/cloud/cloud-cluster-use'
---

<h2> {{ page.command-name }} </h2>

<p>
The {{ page.command-name }} allows you to set the given cluster as the active cluster for the command line client.
</p>

> This implicitly creates and sets a cluster remote as active. See [remote]({{ site.baseurl }}/docs/commands/remote) for more information.

`csctl cloud cluster use <cluster_id>`

Once you have an active cluster, you can use all of the standard client commands to interact with your cluster.

Example of listing services:

`csctl svc list`
