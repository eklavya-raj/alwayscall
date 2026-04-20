# Storage

By default, call recordings are stored in an AWS S3 bucket managed by Stream, located in the same region as your application.
Recording files are retained for two weeks before being automatically deleted.
If you need to keep recordings longer or prefer not to store this data with Stream, you can opt to use your own storage solution.

## Use your own storage

Stream supports the following external storage providers:

- [Amazon S3](#amazon-s3)
- [Google Cloud Storage](#google-cloud-storage)
- [Azure Blob Storage](#azure-blob-storage)

If you need support for a different storage provider, you can participate in the conversation [here](https://github.com/GetStream/protocol/discussions/371).

To use your own storage you need to:

1. Configure a new external storage for your Stream application. Stream supports up to 10 storage configurations per application.
2. (Optional) Check storage configuration for correctness.
   Calling check endpoint will create a test markdown file in the storage to verify the configuration. It will return an error if the file is not created.
   In case of success, the file with`stream-<uuid>.md` will be uploaded to the storage. Every time you call this endpoint, a new file will be created.
3. Configure your call type(s) to use the new storage

Once the setup is complete, call recordings and transcription files will be automatically stored in your own storage.

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
// 1. create a new storage with all the required parameters
await client.createExternalStorage({
  bucket: "my-bucket",
  name: "my-s3",
  storage_type: "s3",
  path: "directory_name/",
  aws_s3: {
    s3_region: "us-east-1",
    s3_api_key: "my-access-key",
    s3_secret: "my-secret",
  },
});

// 2. (Optional) Check storage configuration for correctness
// In case of any errors, this will throw a ResponseError.
await client.checkExternalStorage({
  name: "my-s3",
});

// 3. update the call type to use the new storage
await client.video.updateCallType({
  name: "my-call-type",
  external_storage: "my-s3",
});
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
# 1. create a new storage with all the required parameters
from getstream.models.s_3_request import S3Request

client.create_external_storage(
    name='my-s3',
    storage_type='s3',
    bucket='my-bucket',
    path='directory_name/',
    aws_s3=S3Request(
        s3_region='us-east-1',
        s3_api_key='my-access-key',
        s3_secret='my-secret',
    ),
)

# 2. (Optional) Check storage configuration for correctness
# In case of any errors, this will throw a StreamAPIException.
response = client.check_external_storage(name='my-s3')

# 3. update the call type to use the new storage
client.video.update_call_type(name='allhands', external_storage='my-s3')
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
// 1. create a new storage with all the required parameters

client.CreateExternalStorage(ctx, &getstream.CreateExternalStorageRequest{
	Name:        "my-s3",
	StorageType: "s3",
	Bucket:      "my-bucket",
	Path:        getstream.PtrTo("directory_name/"),
	AwsS3: &getstream.S3Request{
		S3Region: "us-east-1",
		S3APIKey: getstream.PtrTo("my-access"),
		S3Secret: getstream.PtrTo("my-secret"),
	},
})

// 2. (Optional) Check storage configuration for correctness
// In case of any errors, this will throw a StreamAPIException.
response, err := client.CheckExternalStorage(ctx, "my-s3", &getstream.CheckExternalStorageRequest{})

// 3. update the call type to use the new storage
client.Video().UpdateCallType(ctx, "allhands", &getstream.UpdateCallTypeRequest{
  ExternalStorage: getstream.PtrTo("my-s3"),
})
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
# 1. create a new storage with all the required parameters
curl -X POST https://video.stream-io-api.com/video/external_storage?api_key=${API_KEY} \
    -H "Authorization: ${TOKEN}" \
    -H "Content-Type: application/json" \
    -H "stream-auth-type: jwt" \
    -d '{
      "name": "my-storage",
      "storage_type": "s3",
      "bucket": "my-bucket",
      "path": "my-folder",
      "aws_s3": {
        "s3_region": "us-east-1",
        "s3_api_key": "my-api-key",
        "s3_secret": "my-secret"
      }
    }'

    # 2. (Optional) Check storage configuration for correctness
curl -X GET https://video.stream-io-api.com/video/external_storage/check?api_key=${API_KEY} \
    -H "Authorization: ${TOKEN}" \
    -H "stream-auth-type: jwt"

# 3. update the call type to use the new storage
curl -X PUT https://video.stream-io-api.com/api/v2/video/calltypes/${CALL_TYPE}?api_key=${API_KEY} \
    -H "Authorization: ${TOKEN}" \
    -H "Content-Type: application/json" \
    -H "stream-auth-type: jwt" \
    -d '{
        "external_storage": "my-storage"
    }'
```

</tabs-item>

</tabs>

### Multiple storage providers and default storage

You can configure multiple storage providers for your application. Maximum of 10 storage providers can be configured.
When starting a transcription or recording, you can specify which storage provider to use for that particular call. If none is specified, the default storage provider will be used.

When transcribing or recording a call, the storage provider is selected in this order:

1. If specified at the call level, the storage provider chosen for that particular call will be used.
2. If specified at the call type level, the storage provider designated for that call type will be used.
3. If neither applies, Stream S3 storage will be used.

> **Note:** All Stream applications have Stream S3 storage enabled by default, which you can refer to as `"stream-s3"` in the configuration.

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
// update the call type to use Stream S3 storage for recordings
await client.video.updateCallType({
  name: "my-call-type",
  external_storage: "stream-s3",
});

// specify my-storage storage when starting call transcribing
await call.startTranscription({
  transcription_external_storage: "my-storage",
});

// specify my-storage storage for recording
await call.startRecording({ recording_external_storage: "my-storage" });
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
# update the call type to use Stream S3 storage for recordings
client.video.update_call_type('my-call-type', external_storage="stream-s3")

# specify my-storage storage when starting call transcribing
call.start_transcription(transcription_external_storage="my-storage")

# specify my-storage storage for recording
call.start_recording(recording_external_storage="my-storage")
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
// update the call type to use Stream S3 storage for recordings
client.Video().UpdateCallType(ctx, "my-call-type", &getstream.UpdateCallTypeRequest{
  ExternalStorage: getstream.PtrTo("stream-s3"),
})

// specify my-storage storage when starting call transcribing
call.StartTranscription(ctx, &getstream.StartTranscriptionRequest{
	TranscriptionExternalStorage: getstream.PtrTo("my-storage"),
})

// specify my-storage storage for recording
call.StartRecording(ctx, &getstream.StartRecordingRequest{
  RecordingExternalStorage: PtrTo("my-storage"),
})
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
# update the call type to use Stream S3 storage for recordings
curl -X PUT https://video.stream-io-api.com/api/v2/video/calltypes/${CALL_TYPE}?api_key=${API_KEY} \
    -H "Authorization: ${TOKEN}" \
    -H "stream-auth-type: jwt" \
    -H 'Content-Type: application/json' \
-d '{
  "external_storage": "my-first-storage"
}'

# specify Stream S3 storage when starting call transcribing
curl -X POST "https://video.stream-io-api.com/api/v2/video/call/${CALL_TYPE}/${CALL_ID}/start_transcription?api_key=${API_KEY}" \
    -H "Authorization: ${TOKEN}" \
    -H "stream-auth-type: jwt" \
    -H 'Content-Type: application/json' \
-d '{
    "transcription_external_storage": "my-second-storage"
}'
```

</tabs-item>

</tabs>

## Storage configuration

### Request model

All storage providers have 4 shared parameters, other parameters are dependant on what kind of storage you want to create (below you can find examples for all supported storage types):

<open-api-models modelname="CreateExternalStorageRequest" recursive="false" headerlevel="4"></open-api-models>

## Amazon S3

### Request model

This is how you can configure S3 stroage in the Stream API:

<open-api-models modelname="S3Request" recursive="false" headerlevel="4"></open-api-models>

### Code example

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
await client.createExternalStorage({
  name: "my-s3",
  storage_type: "s3",
  bucket: "my-bucket",
  path: "directory_name/",
  aws_s3: {
    s3_api_key: "us-east-1",
    s3_region: "my-access-key",
    s3_secret: "my-secret",
  },
});
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
from getstream.models import S3Request

client.create_external_storage(
  bucket="my-bucket",
  name="stream-s3",
  storage_type="s3",
  path="directory_name/",
  aws_s3=S3Request(
      s3_region="us-east-1",
      s3_api_key="my-access-key",
      s3_secret="my-secret",
  ),
)
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
client.CreateExternalStorage(ctx, &getstream.CreateExternalStorageRequest{
	Name:        "my-s3",
	StorageType: "s3",
	Bucket:      "my-bucket",
	Path:        getstream.PtrTo("directory_name/"),
	AWSS3: &getstream.S3Request{
		S3Region: "us-east-1",
		S3APIKey: getstream.PtrTo("my-access-key"),
		S3Secret: getstream.PtrTo("my-secret"),
	},
},
)
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
curl -X POST https://video.stream-io-api.com/video/external_storage?api_key=${API_KEY} \
    -H "Authorization: ${TOKEN}" \
    -H "stream-auth-type: jwt" \
    -H 'Content-Type: application/json' \
-d '{
  "name": "my-s3",
  "storage_type": "s3",
  "bucket": "my-bucket",
  "path": "my-folder",
  "aws_s3": {
    "s3_api_key": "...",
    "s3_region": "...",
    "s3_secret": "..."
  }
}'
```

</tabs-item>

</tabs>

### Example S3 policy

With this option you omit the key and secret, but instead you set up a resource-based policy to grant Stream SendMessage permission on your S3 bucket.
The following policy needs to be attached to your queue (replace the value of Resource with the fully qualified ARN of you S3 bucket):

```json
{
  "Version": "2012-10-17",
  "Id": "StreamExternalStoragePolicy",
  "Statement": [
    {
      "Sid": "ExampleStatement01",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::185583345998:root"
      },
      "Action": ["s3:PutObject"],
      "Resource": ["arn:aws:s3:::bucket_name/*", "arn:aws:s3:::bucket_name"]
    }
  ]
}
```

### S3 Compatible Storage (Minio)

To use Minio or other S3 compatible storage you can specify custom endpoint. In this case API key and secret are required.

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
await client.createExternalStorage({
  name: "my-s3",
  storage_type: "s3",
  bucket: "my-bucket",
  path: "directory_name/",
  aws_s3: {
    s3_api_key: "us-east-1",
    s3_region: "my-access-key",
    s3_secret: "my-secret",
    s3_custom_endpoint_url: "https://s3.us-east-1.amazonaws.com",
  },
});
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
from getstream.models import S3Request

client.create_external_storage(
  bucket="my-bucket",
  name="stream-s3",
  storage_type="s3",
  path="directory_name/",
  aws_s3=S3Request(
      s3_region="us-east-1",
      s3_api_key="my-access-key",
      s3_secret="my-secret",
      s3_custom_endpoint_url="https://s3.us-east-1.amazonaws.com"
  ),
)
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
client.CreateExternalStorage(ctx, &getstream.CreateExternalStorageRequest{
	Name:        "my-s3",
	StorageType: "s3",
	Bucket:      "my-bucket",
	Path:        getstream.PtrTo("directory_name/"),
	AWSS3: &getstream.S3Request{
		S3Region: "us-east-1",
		S3APIKey: getstream.PtrTo("my-access"),
		S3Secret: getstream.PtrTo("my-secret"),
		S3CustomEndpointUrl: getstream.PtrTo("https://s3.us-east-1.amazonaws.com"),
	},
},
)
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
curl -X POST https://video.stream-io-api.com/video/external_storage?api_key=${API_KEY} \
    -H "Authorization: ${TOKEN}" \
    -H "stream-auth-type: jwt" \
    -H 'Content-Type: application/json' \
-d '{
  "name": "my-s3",
  "storage_type": "s3",
  "bucket": "my-bucket",
  "path": "my-folder",
  "aws_s3": {
    "s3_api_key": "...",
    "s3_region": "...",
    "s3_secret": "...",
    "s3_custom_endpoint_url": "https://s3.us-east-1.amazonaws.com"
  }
}'
```

</tabs-item>

</tabs>

## Google Cloud Storage

To use Google Cloud Storage as your storage provider, you need to send your [service account](https://cloud.google.com/iam/docs/service-accounts-create) credentials as they are stored in your JSON file.
Stream only needs permission to write new files, it is not necessary to grant any other permission.

> Note: We recommend reading the credentials from the file to avoid issues with copying and pasting errors.

### Code example

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
await client.createExternalStorage({
  bucket: "my-bucket",
  name: "my-gcs",
  storage_type: "gcs",
  path: "directory_name/",
  gcs_credentials: "content of the service account file",
});
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
with open("/path/to/your/service-account-file.json") as service_account_file:
    creds = service_account_file.read()

client.create_external_storage(
    name='my-gcs',
    storage_type='gcs',
    bucket='my-bucket',
    path='directory_name/',
    gcs_credentials=creds
)
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
file, err := os.Open("/path/to/your/service-account-file.json")
if err != nil {
	log.Fatal(err)
}
defer file.Close()
creds, err := io.ReadAll(file)
if err != nil {
	log.Fatal(err)
}

client.CreateExternalStorage(ctx, &getstream.CreateExternalStorageRequest{
	Name:           "my-gcs",
	StorageType:    "gcs",
	Bucket:         "my-bucket",
	Path:           getstream.PtrTo("directory_name/"),
	GcsCredentials: getstream.PtrTo(string(creds)),
})
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
curl -X POST https://video.stream-io-api.com/video/external_storage?api_key=${API_KEY} \
    -H "Authorization: ${TOKEN}" \
    -H "stream-auth-type: jwt" \
    -H 'Content-Type: application/json' \
-d '{
  "name": "my-storage",
  "storage_type": "gcs",
  "bucket": "my-bucket",
  "path": "my-folder",
  "gcs_credentials": "content of the service account file"
}'

```

</tabs-item>

</tabs>

### Example policy

```json
{
  "bindings": [
    {
      "role": "roles/storage.objectCreator",
      "members": ["service_account_principal_identifier"]
    }
  ]
}
```

## Azure Blob Storage

To use Azure Blob Storage as your storage provider, you need to create a container and a service principal with the following parameters:

### Request model

<open-api-models modelname="AzureRequest" recursive="false" headerlevel="4"></open-api-models>

Stream only needs permission to write new files, it is not necessary to grant any other permission.

### Code example

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
await client.createExternalStorage({
  name: "my-abs",
  storage_type: "abs",
  bucket: "my-bucket",
  path: "directory_name/",
  azure_blob: {
    abs_account_name: "...",
    abs_client_id: "...",
    abs_client_secret: "...",
    abs_tenant_id: "...",
  },
});
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
from getstream.models import AzureRequest

client.create_external_storage(
    name="my-abs",
    storage_type="abs",
    bucket="my-bucket",
    path="directory_name/",
    azure_blob=AzureRequest(
        abs_account_name="...",
        abs_client_id="...",
        abs_client_secret="...",
        abs_tenant_id="...",
    ),
)
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
client.CreateExternalStorage(ctx, &getstream.CreateExternalStorageRequest{
	Name:        "my-abs",
	StorageType: "abs",
	Bucket:      "my-bucket",
	Path:        getstream.PtrTo("directory_name/"),
	AzureBlob: &getstream.AzureRequest{
		AbsAccountName:  "...",
		AbsClientID:     "...",
		AbsClientSecret: "...",
		AbsTenantID:     "...",
	},
},
)
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
curl -X POST https://video.stream-io-api.com/video/external_storage?api_key=${API_KEY} \
    -H "Authorization: ${TOKEN}" \
    -H "stream-auth-type: jwt" \
    -H 'Content-Type: application/json' \
-d '{
  "name": "my-abs",
  "storage_type": "abs",
  "bucket": "my-bucket",
  "path": "my-folder",
  "azure_blob": {
    "abs_account_name": "...",
    "abs_client_id": "...",
    "abs_client_secret": "...",
    "abs_tenant_id": "..."
  }
}'
```

</tabs-item>

</tabs>


## Uploading times

Call recordings are uploaded immediately under the following conditions:

- The call has ended.
- Call recording is manually stopped.
- The call recording exceeds 2 hours in duration.

For lengthy calls, multiple files will be uploaded. Each file will contain up to 2 hours of video.

Upload times vary based on the storage method used. Below is a table providing a conservative estimation of upload times:

|           | &lt;=5 minutes | &lt;=1 hour | &lt;=2 hours |
| --------- | -------------- | ----------- | ------------ |
| Audio     | &lt; 10s       | &lt; 10s    | &lt; 10s     |
| HD Video  | &lt; 10s       | &lt; 30s    | &lt; 60s     |
| FHD Video | &lt; 10s       | &lt; 60s    | &lt; 120s    |

Please refer to this table to estimate the upload times based on your specific storage setup.


---

This page was last updated at 2026-04-17T17:34:00.926Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/recording/storage/](https://getstream.io/video/docs/react-native/recording/storage/).