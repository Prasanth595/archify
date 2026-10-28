debug({stage:"entry", current:.}) | .jobs[] as $job | debug({stage:"bound-job", current:., job:$job}) | {job:$job.id, owner:.owners[$job.owner]} | debug({stage:"result", current:.})
