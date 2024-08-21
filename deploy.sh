#!/usr/bin/env bash
cd $(dirname $0)
set +a allexport
source manifests/oce-bot.secret.env
source manifests/oce-bot.config.env
set -a allexport

export IMAGE_NAME=syd.ocir.io/sdofbpj7jnsu/byhemechi/ocebs-bot
export IMAGE_TAG=latest

export IMAGE=$IMAGE_NAME:$IMAGE_TAG

echo "building image..."
docker build . \
    --platform=linux/arm64 \
    -t $IMAGE --push \
    || exit $?
export IMAGE=$(docker inspect --format='{{index .RepoDigests 0}}' $IMAGE)
export DIGEST=${IMAGE#*@}
echo -ne "deploying \x1b[32m"
echo $DIGEST
echo -e "\x1b[0m"
cp manifests/kustomization.yml manifests/_kustomization.yml
yq -i ".images[0].digest = \"$DIGEST\"" manifests/kustomization.yml || exit $?
yq -i ".images[0].newName = \"$IMAGE_NAME\"" manifests/kustomization.yml || exit $?
yq -i ".images[0].newTag = \"$IMAGE_TAG\"" manifests/kustomization.yml || exit $?
kubectl apply -k manifests --server-side --context oci || exit $?
mv manifests/_kustomization.yml manifests/kustomization.yml
