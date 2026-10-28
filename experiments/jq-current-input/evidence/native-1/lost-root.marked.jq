debug({stage:"entry", current:.}) | .jobs[] | debug({stage:"job", current:.}) | {job:.id, owner:.owners[.owner]} | debug({stage:"result", current:.})
