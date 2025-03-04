#!/bin/bash 
parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

cd "$parent_path"

# copy content from index.html to xpr index.hbs
cat "$parent_path"/xpr/web/index.html > "$parent_path"/xpr/element/index.hbs