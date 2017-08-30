---
command-name: 'remote set-active'
permalink: '/docs/commands/remote-set-active'
---

<h2> {{ page.command-name }} </h2>

The `{{ page.command-name }}` command allows you to update the currently active remote for your CLI.

`csctl remote set-active <remote_name>`

|------+----+------------+----+----------|
| Argument | Alias | Description | Required | Default |
|-----------------|------|-----------|----------------|-------|
| remote_name | | Name of the remote for local reference | y | |
|=================+============+=================+================+===|

> You can only have one active remote at a time. To see you currently active remote, run `csctl remote list` and the remote with
an `*` is your currently active remote.

~~~
csctl remote list


┌────────────────────────────────────────┬─────────┬────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ NAME                                   │ VERSION │ URL                                                                                                │
├────────────────────────────────────────┼─────────┼────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ * 00000000-0000-0000-0000-000000000000 │ v1      │ https://api.containership.io/v2/organizations/00000000-0000-0000-0000-000000000000/clusters/       │
│                                        │         │ 00000000-0000-0000-0000-000000000000/proxy                                                         │
└────────────────────────────────────────┴─────────┴────────────────────────────────────────────────────────────────────────────────────────────────────┘
~~~
