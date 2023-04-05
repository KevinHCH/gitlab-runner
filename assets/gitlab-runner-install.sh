#!/bin/bash
sudo snap install docker
curl -L "https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh" | sudo bash
sudo apt-get update
sudo apt-get install gitlab-runner
sudo gitlab-runner register \
     --non-interactive \
     --url https://gitlab.com \
     --registration-token <GITLAB_REGISTRATION_TOKEN> \
     --name gitlab-runner \
     --executor docker \
     --docker-image "docker:20.10" \
     --docker-privileged \
     --docker-volumes "/certs/client" \
     --docker-pull-policy "if-not-present"
