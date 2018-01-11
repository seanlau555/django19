# -*- coding: utf-8 -*-
# Generated by Django 1.11.7 on 2018-01-09 03:09
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('posts', '0028_post_private'),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='content_display',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='post',
            name='published',
            field=models.BooleanField(default=False),
        ),
    ]