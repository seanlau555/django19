# -*- coding: utf-8 -*-
# Generated by Django 1.11.7 on 2017-12-29 02:37
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('posts', '0017_remove_postimage_imageslug'),
    ]

    operations = [
        migrations.AlterField(
            model_name='post',
            name='image',
            field=models.TextField(),
        ),
    ]
