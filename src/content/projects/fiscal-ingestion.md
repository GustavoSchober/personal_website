---
title: Fiscal document ingestion
stack: Airflow · Python
metric: 6 DAGs
metricLabel: twice a day, 180-day backfill
chips: [Airflow, Python, NF-e, Incremental loads]
order: 2
---
Ingestion of Brazilian electronic invoices (NF-e) from a third-party API into the data lake, with opaque-cursor pagination, incremental lookback and dashboards on top.
