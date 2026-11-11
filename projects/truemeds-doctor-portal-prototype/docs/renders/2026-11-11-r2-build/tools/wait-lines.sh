#!/bin/bash
# Waits until the final-checks output has at least $1 lines (or a "layout " line), then prints it.
F=/private/tmp/claude-501/-Users-appu13-pm-agent--work-truemeds-doctor-portal-prototype-projects-truemeds-doctor-portal-prototype/6328e35f-a161-4dba-b6b1-32783d442f8d/tasks/bppn4qp1g.output
for i in $(seq 1 55); do
  c=$(wc -l < "$F")
  if [ "$c" -ge "$1" ] || grep -q "^layout  " "$F"; then break; fi
  sleep 10
done
cat "$F"
