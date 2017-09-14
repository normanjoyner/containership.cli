---
command-name: 'client-plugin sync'
permalink: '/docs/commands/client-plugin-sync'
---

<h2> {{ page.command-name }} </h2>

The `{{ page.command-name }}` command allows you sync manually added plugins or fix corrupted state in your local
command line client configuration. Sync will iterate through all the plugins in your `.containership` plugin directory
and attempt to load that into the client configuration.

~~~
csctl client-plugin sync

┌────────────────────────────┬─────────┬──────────────────────────────────────────────────┬──────────────────────────────────────────────────┐
│ NAME                       │ VERSION │ DESCRIPTION                                      │ PATH                                             │
├────────────────────────────┼─────────┼──────────────────────────────────────────────────┼──────────────────────────────────────────────────┤
│ containership.plugin.cloud │ 0.14.0  │ Containership Cloud management client.           │ /Users/root/.containership/plugins/containership │
│                            │         │                                                  │ .plugin.cloud                                    │
└────────────────────────────┴─────────┴──────────────────────────────────────────────────┴──────────────────────────────────────────────────┘
~~~
