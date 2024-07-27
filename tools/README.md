# Stacks

Load the envs:

```bash
export STAGE=dev
export REGION=us-east-1
export APP_NAME=Web3ToolKit
```

## Global

### Config Bucket

Deploy the config bucket:

```bash
aws cloudformation create-stack \
    --region ${REGION} \
    --stack-name ${APP_NAME}-S3ConfigBucket \
    --template-body file://tools/stacks/global/config-bucket.yml \
    --parameters ParameterKey=AppName,ParameterValue=${APP_NAME}
```

Get stack outputs (bucket name and bucket arn):

```bash
aws cloudformation describe-stacks \
    --region ${REGION} \
    --stack-name ${APP_NAME}-S3ConfigBucket \
    --query 'Stacks[0].Outputs'
```

## Listener

### DynamoDB Tables

```bash
aws cloudformation create-stack \
    --region ${REGION} \
    --stack-name ${APP_NAME}-ListenerDynamodbTables-${STAGE} \
    --template-body file://tools/stacks/listener/dynamodb-tables.yml \
    --parameters ParameterKey=AppName,ParameterValue=${APP_NAME}
```

## Vault

### DynamoDB Tables

```bash
aws cloudformation create-stack \
    --region ${REGION} \
    --stack-name ${APP_NAME}-WalletDynamodbTables-${STAGE} \
    --template-body file://tools/stacks/wallet/dynamodb-tables.yml \
    --parameters ParameterKey=AppName,ParameterValue=${APP_NAME}
```

### Secrets

```bash
aws secretsmanager create-secret \
    --region ${REGION} \
    --name ${APP_NAME}/${STAGE}/Wallet/Mnemonics \
    --secret-string '{
        "hardhat-default": "test test test test test test test test test test test junk"
    }'
```