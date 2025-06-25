package minio_client

import (
	"context"
	"io"
	"strings"

	"fmt"

	"github.com/minio/minio-go"
)

type MinioClient struct {
	client   *minio.Client
	ctx      context.Context
	location string
}

func New(endpoint, accessKey, secretKey string, useSSL bool, location string) (*MinioClient, error) {
	cli, err := minio.New(endpoint, accessKey, secretKey, useSSL)
	if err != nil {
		return nil, err
	}
	return &MinioClient{
		client:   cli,
		ctx:      context.Background(),
		location: location,
	}, nil
}

func (m *MinioClient) BucketExists(bucket string) (bool, error) {
	return m.client.BucketExists(bucket)
}

func (m *MinioClient) CreateBucket(bucket string) error {
	exists, err := m.BucketExists(bucket)
	if err != nil {
		return err
	}
	if !exists {
		return m.client.MakeBucket(bucket, m.location)
	}
	return nil
}

func (m *MinioClient) UploadFile(bucket, objectName string, reader io.Reader, objectSize int64, contentType string) error {
	_, err := m.client.PutObject(bucket, objectName, reader, objectSize, minio.PutObjectOptions{ContentType: contentType})
	return err
}

func (m *MinioClient) DownloadFile(bucket, key string) (io.ReadCloser, error) {
	object, err := m.client.GetObject(bucket, key, minio.GetObjectOptions{})
	if err != nil {
		return nil, err
	}
	return object, nil
}

func (m *MinioClient) UploadAvatar(userId int64, reader io.Reader, size int64, contentType string) error {
	bucket := "avatarsbonbontime"
	key := fmt.Sprint(userId) + ".jpg"

	if err := m.CreateBucket(bucket); err != nil {
		return err
	}

	return m.UploadFile(bucket, key, reader, size, contentType)
}

func (m *MinioClient) GetAvatar(userId int64) (io.ReadCloser, error) {
	bucket := "avatarsbonbontime"
	key := fmt.Sprint(userId) + ".jpg"
	return m.DownloadFile(bucket, key)
}

func (m *MinioClient) GetWork(userId int64, workId string) (io.ReadCloser, error) {
	bucket := "worksbonbontime"
	key := fmt.Sprintf("%d/%s", userId, workId)
	return m.DownloadFile(bucket, key)
}

func (m *MinioClient) UploadWork(userId int64, workId string, reader io.Reader, size int64, contentType string) error {
	bucket := "worksbonbontime"
	key := fmt.Sprintf("%d/%s", userId, workId)

	if err := m.CreateBucket(bucket); err != nil {
		return err
	}

	return m.UploadFile(bucket, key, reader, size, contentType)
}

type WorkFile struct {
	Name    string
	Content io.ReadCloser
}

func (m *MinioClient) GetWorksIDs(userId int64) ([]string, error) {
	bucket := "worksbonbontime"
	prefix := fmt.Sprintf("%d/", userId)

	doneCh := make(chan struct{})
	defer close(doneCh)

	objectCh := m.client.ListObjects(bucket, prefix, true, doneCh)

	var ids []string

	for object := range objectCh {
		if object.Err != nil {
			return nil, fmt.Errorf("error listing object: %w", object.Err)
		}
		parts := strings.Split(object.Key, "/")
		fileName := parts[len(parts)-1]

		dotIndex := strings.LastIndex(fileName, ".")
		id := fileName
		if dotIndex != -1 {
			id = fileName[:dotIndex]
		}

		ids = append(ids, id)
	}

	return ids, nil
}

func (m *MinioClient) deleteObject(bucket, key string) error {
	err := m.client.RemoveObject(bucket, key)
	if err != nil {
		return fmt.Errorf("failed to delete object %s/%s: %w", bucket, key, err)
	}
	return nil
}

func (m *MinioClient) DeleteAvatar(userId int64) error {
	bucket := "avatarsbonbontime"
	key := fmt.Sprintf("%d.jpg", userId)
	return m.deleteObject(bucket, key)
}

func (m *MinioClient) DeleteWork(userId int64, workId string) error {
	bucket := "worksbonbontime"
	key := fmt.Sprintf("%d/%s", userId, workId)
	return m.deleteObject(bucket, key)
}
