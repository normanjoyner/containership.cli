---
command-name: 'cloud'
permalink: '/docs/plugins/cloud/overview'
---

<h2> Overview </h2>

<p>
The {{ page.command-name }} plugin provides additional fucntionality for interacting with accounts, organizations, and clusters
created through the containership cloud dashboard.
</p>

<h2> Commands </h2>

<p>
{% for item in site.data.navigation.docs %}
    {% if item.title == 'Containership Cloud Plugin' %}
        <ul>
        {% for link in item.children %}
            {% if link.title contains page.command-name and link.title != "Overview" %}
                <li><a href="{{link.url}}">{{link.title}}</a></li>
            {% endif %}
        {% endfor %}
        </ul>
    {% endif %}
{% endfor %}
</p>
