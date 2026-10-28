.jobs[] as $job | {job: $job.id, owner: .owners[$job.owner]}
