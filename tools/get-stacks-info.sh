#!/bin/bash

# Check if the correct number of arguments is provided
if [ "$#" -ne 3 ]; then
    echo "Usage: $0 <appName> <stage> <region>"
    exit 1
fi

# Assign arguments to variables
appName=$1
stage=$2
region=$3

# Function to get stack outputs
get_stack_outputs() {
    local stack_name=$1
    aws cloudformation describe-stacks --stack-name "$stack_name" --region "$region" --query 'Stacks[0].Outputs' --output json
}

# Function to extract specific output value
get_output_value() {
    local outputs=$1
    local output_key=$2
    echo "$outputs" | jq -r --arg key "$output_key" '.[] | select(.OutputKey == $key) | .OutputValue'
}

# Define stack names
s3_config_bucket_stack="${appName}-S3ConfigBucket"
wallet_dynamodb_tables_stack="${appName}-WalletDynamodbTables-${stage}"

# Get stack outputs
s3_config_bucket_outputs=$(get_stack_outputs "$s3_config_bucket_stack")
wallet_dynamodb_table_outputs=$(get_stack_outputs "$wallet_dynamodb_tables_stack")

# Display general info
echo "General Info (Stack Outputs):"
echo "S3 Config Bucket Stack Outputs: $s3_config_bucket_outputs"
echo "Wallet DynamoDB Tables Stack Outputs: $wallet_dynamodb_table_outputs"

# Display specific important infos
echo "Most Important Infos:"
s3_config_bucket_name=$(get_output_value "$s3_config_bucket_outputs" "S3BucketName")
wallet_addresses_dynamodb_table_name=$(get_output_value "$wallet_dynamodb_table_outputs" "AddressesTableName")

echo "ConfigBucketName: $s3_config_bucket_name"
echo "WalletAddressesTableName: $wallet_addresses_dynamodb_table_name"

# Add any other specific output values you need here
# For example:
# some_other_output=$(get_output_value "$dynamodb_table_outputs" "SomeOtherOutputKey")
# echo "Some Other Output: $some_other_output"
