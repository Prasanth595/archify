set -eu
cd /tmp/archify-bisect.aY88Mq
A=d0ecc67e1a3a4a4523137c89a3ad8a62f44b3537
D=1c1d70f2ce05768d7d1a6876e8baec1cf5f6bda7
git --version
git log --all --graph --format='%h %s parents=%p'
git bisect start --no-checkout --first-parent "$D" "$A"
printf '\nvisualize --first-parent --oneline --graph:\n'
env -u DISPLAY -u SECURITYSESSIONID -u SESSIONNAME -u MSYSTEM GIT_PAGER=cat git bisect visualize --first-parent --oneline --graph
printf '\nrev-list --first-parent bad --not good:\n'
git rev-list --first-parent --oneline "$D" --not "$A"
printf '\nbisect log:\n'
git bisect log
git bisect reset
