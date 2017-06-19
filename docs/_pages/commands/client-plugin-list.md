---
command-name: 'client-plugin list'
permalink: '/docs/commands/client-plugin-list'
---

<h2> {{ page.command-name }} </h2>

<p>
The {{ page.command-name }} allows you to view a list of all the configured cli plugins installed.
</p>

~~~
csctl client-plugin list

┌────────────────────────────┬─────────┬──────────────────────────────────────────────────┬──────────────────────────────────────────────────┐
│ NAME                       │ VERSION │ DESCRIPTION                                      │ PATH                                             │
├────────────────────────────┼─────────┼──────────────────────────────────────────────────┼──────────────────────────────────────────────────┤
│ containership.plugin.cloud │ 0.14.0  │ Containership cloud management client.           │ /Users/nick/.containership/plugins/containership │
│                            │         │                                                  │ .plugin.cloud                                    │
└────────────────────────────┴─────────┴──────────────────────────────────────────────────┴──────────────────────────────────────────────────┘
~~~
