set -eu
D=$(mktemp -d /tmp/archify-bisect.XXXXXX)
cd "$D"
git init -q
export GIT_AUTHOR_NAME=Fixture GIT_AUTHOR_EMAIL=fixture@example.invalid GIT_COMMITTER_NAME=Fixture GIT_COMMITTER_EMAIL=fixture@example.invalid GIT_AUTHOR_DATE='2001-01-01T00:00:00Z' GIT_COMMITTER_DATE='2001-01-01T00:00:00Z'
T=$(git mktree </dev/null)
A=$(echo A | git commit-tree "$T")
B=$(echo B | git commit-tree "$T" -p "$A")
C=$(echo C | git commit-tree "$T" -p "$A")
M=$(echo M | git commit-tree "$T" -p "$B" -p "$C")
D1=$(echo D | git commit-tree "$T" -p "$M")
git update-ref refs/heads/main "$D1"
git symbolic-ref HEAD refs/heads/main
printf 'fixture=%s\nA=%s\nB=%s\nC=%s\nM=%s\nD=%s\n' "$D" "$A" "$B" "$C" "$M" "$D1"
git log --all --graph --format='%h %s parents=%p'
git bisect start --no-checkout "$D1" "$A"
git bisect skip "$B" "$C"
printf '\nVISUALIZE:\n'
env -u DISPLAY -u SECURITYSESSIONID -u SESSIONNAME -u MSYSTEM GIT_PAGER=cat git bisect visualize --graph --format='%h %s parents=%p'
printf '\nLOG:\n'
git bisect log
printf '\nMARK MERGE BAD:\n'
set +e
git bisect bad "$M"
status=$?
set -e
printf 'exit=%s\n' "$status"
printf '\nLOG AFTER:\n'
git bisect log
printf '\nVISUALIZE AFTER:\n'
env -u DISPLAY -u SECURITYSESSIONID -u SESSIONNAME -u MSYSTEM GIT_PAGER=cat git bisect visualize --graph --format='%h %s parents=%p'
git bisect reset
printf '\nFIRST PARENT:\n'
git bisect start --no-checkout --first-parent "$D1" "$A"
env -u DISPLAY -u SECURITYSESSIONID -u SESSIONNAME -u MSYSTEM GIT_PAGER=cat git bisect visualize --graph --format='%h %s parents=%p'
git bisect reset
