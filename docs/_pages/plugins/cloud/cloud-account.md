---
command-name: 'cloud account'
permalink: '/docs/plugins/cloud/cloud-account'
---

<h2> Overview </h2>

<p>
The {{ page.command-name }} command allows you to display and configure your containership cloud account.
</p>

<h2> Commands </h2>

<p>
{% for item in site.data.navigation.docs %}
    {% if item.title == 'Containership Cloud Plugin' %}
        <ul>
        {% for link in item.children %}
            {% if link.title contains page.command-name and link.title != page.command-name %}
                <li><a href="{{link.url}}">{{link.title}}</a></li>
            {% endif %}
        {% endfor %}
        </ul>
    {% endif %}
{% endfor %}
</p>
