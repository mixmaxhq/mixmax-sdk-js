#!/bin/bash

# the following line will make sure exit this script if any command fails
set -e

# Upload to S3.
gulp upload
