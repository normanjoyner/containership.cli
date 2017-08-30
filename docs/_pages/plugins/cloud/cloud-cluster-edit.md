---
command-name: 'cloud cluster edit'
permalink: '/docs/plugins/cloud/cloud-cluster-edit'
---

<h2> {{ page.command-name }} </h2>

The `{{ page.command-name }}` command allows you to edit details about your containership cloud cluster.

|------+----+------------+----+----------|
| Argument | Alias | Description | Required | Default |
|-----------------|------|-----------|----------------|-------|
| locked | l | Whether or not the cluster is locked to modifications | n | false |
|=================+============+=================+================+===|

Example setting your cluster state to locked:

`csctl cloud cluster edit <cluster_id> --locked=true`

Example setting your cluster state to un-locked:

`csctl cloud cluster edit <cluster_id> --locked=false`
