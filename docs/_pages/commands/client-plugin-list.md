---
command-name: 'client-plugin list'
permalink: '/docs/commands/client-plugin-list'
---

<h2> {{ page.command-name }} </h2>

The `{{ page.command-name }}` command allows you to view a list of all the configured CLI plugins installed.

~~~
csctl client-plugin list

┌────────────────────────────┬─────────┬──────────────────────────────────────────────────┬──────────────────────────────────────────────────┐
│ NAME                       │ VERSION │ DESCRIPTION                                      │ PATH                                             │
├────────────────────────────┼─────────┼──────────────────────────────────────────────────┼──────────────────────────────────────────────────┤
│ containership.plugin.cloud │ 0.14.0  │ Containership Cloud management client.           │ /Users/root/.containership/plugins/containership │
│                            │         │                                                  │ .plugin.cloud                                    │
└────────────────────────────┴─────────┴──────────────────────────────────────────────────┴──────────────────────────────────────────────────┘
~~~
