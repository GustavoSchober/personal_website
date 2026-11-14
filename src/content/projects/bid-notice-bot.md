---
title: Bid notice bot
stack: Selenium · Airflow · SMTP
metric: "06:00"
metricLabel: daily, one e-mail per notice
chips: [Selenium, TOTP, PostgreSQL, Airflow]
order: 3
---
A headless bot that logs in with TOTP, pulls new bid notices month by month, stores them in PostgreSQL and alerts the sales team once per notice, never twice.
