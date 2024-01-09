# sqid-helper

This helper collects some statistics for use by the SQID frontend. It
is designed to run on the Wikimedia Toolforge Kubernetes cluster. Most
of the data is gathered from processing the Wikidata dumps, but some
frequently-changing information is gathered from SPARQL and SQL
queries.

## Building
Use `podman` to build a suitable executable for Debian bookworm:
```bash
podman build . --tag sqid-helper:LATEST
podman run --rm -it --name sqid-helper sqid-helper:LATEST
podman cp sqid-helper:/sqid-helper .
```

## Configuring the jobs
This assumes that `sqid-helper` and `.logrotate.conf` are located in the tools home directory.

```bash
toolforge jobs load toolforge.yaml
```

This does the equivalent of running the following, but atomically.
```bash
toolforge jobs run sqid-update-statistics --command './sqid-helper --data-path ~/projects/sqid/data' --image bookworm --cpu 1 --mem 512M --schedule '@hourly' --emails onfailure --filelog-stdout ~/logs/sqid-update-statistics.log --filelog-stderr ~/logs/sqid-update-statistics.log
toolforge jobs run sqid-check-dump --command './sqid-helper --only=check-dump --data-path ~/projects/sqid/data' --image bookworm --cpu 1 --mem 6Gi --schedule '@hourly' --emails onfailure --filelog-stdout ~/logs/sqid-check-dump.log --filelog-stderr ~/logs/sqid-check-dump.log
toolforge jobs run logrotate --command "logrotate -v ./.logrotate.conf --state ./.logrotate.state" --image mariadb --schedule '@daily'
```