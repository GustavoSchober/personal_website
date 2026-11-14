---
# DRAFT: written from internal work and kept generic. Review what can be public.
title: Public tender data integration
stack: Airflow · PostgreSQL · Metabase
metric: 48 s → 1.4 s
metricLabel: dashboard load time
chips: [Airflow, REST, PostgreSQL, Materialized views]
order: 1
---
Replaced a scraping-based feed with the vendor's REST API, orchestrated in Airflow. Found and fixed a deploy bug where two endpoints drifted out of sync, then moved the heaviest dashboard onto a materialized view.
