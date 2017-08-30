---
command-name: 'cloud'
permalink: '/docs/plugins/cloud/overview'
---

<h2> Overview </h2>

The `{{ page.command-name }}` plugin provides additional functionality for interacting with accounts, organizations, and clusters
created through the containership cloud dashboard.

<h2> Commands </h2>

<p>
{% for item in site.data.navigation.docs %}
    {% if item.title == 'Containership Cloud Plugin' %}
        <ul>
        {% for link in item.children %}
            {% if link.title contains page.command-name and link.title != "Overview" %}
                <li><a href="{{site.baseurl}}{{link.url}}">{{link.title}}</a></li>
            {% endif %}
        {% endfor %}
        </ul>
    {% endif %}
{% endfor %}
</p>
