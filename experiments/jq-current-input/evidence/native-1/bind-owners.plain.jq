.owners as $owners | .jobs[] | {job: .id, owner: $owners[.owner]}
