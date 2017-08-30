---
command-name: 'remote set-url'
permalink: '/docs/commands/remote-set-url'
---

<h2> {{ page.command-name }} </h2>

The `{{ page.command-name }}` command allows you to update the URL for an existing CLI remote.

`csctl remote set-url <remote_name> <remote_url>`

|------+----+------------+----+----------|
| Argument | Alias | Description | Required | Default |
|-----------------|------|-----------|----------------|-------|
| remote_name | | Name of the remote for local reference | y | |
| remote_url | | URL of one of the `leader` nodes on your cluster | y | |
|=================+============+=================+================+===|

> This cluster will also need firewall rules for the Containership API open to the machine you are using the CLI from.
See <https://docs.containership.io/access-control/firewalls/oss-firewall-guidelines> for more information.
