---
command-name: 'cloud account info'
permalink: '/docs/plugins/cloud/cloud-account-info'
---

<h2> {{ page.command-name }} </h2>

<p>
The {{ page.command-name }} allows you to view details about your containership cloud account.
</p>

~~~
csctl cloud account info

┌───────────────┬─────────────────────────────────────────────────────────────────┐
│ ID            │ aaaaaaaa-ed2d-4883-867a-c600322564a2                            │
├───────────────┼─────────────────────────────────────────────────────────────────┤
│ EMAIL         │ developer@containership.io                                      |
├───────────────┼─────────────────────────────────────────────────────────────────┤
│ ORGANIZATIONS │ sample-org-1: 12345000-b283-40b9-82f0-3a7118b8a259              │
│               │ sample-org-2: 12345667-dcf8-429a-b564-26996d285dd0              │
├───────────────┼─────────────────────────────────────────────────────────────────┤
│ SIGNUP_METHOD │ github                                                          │
├───────────────┼─────────────────────────────────────────────────────────────────┤
│ NAME          │ Containership Developer                                         |
├───────────────┼─────────────────────────────────────────────────────────────────┤
│ PHONE         │ 1234567890                                                      │
├───────────────┼─────────────────────────────────────────────────────────────────┤
│ METADATA      │ onboarding.createdFirstCluster: true                            │
└───────────────┴─────────────────────────────────────────────────────────────────┘
~~~
