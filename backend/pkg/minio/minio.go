package minio_client

import (
	"context"
	"io"

	"fmt"

	"github.com/minio/minio-go"
)

type MinioClient struct {
	client *minio.Client
	ctx    context.Context
}

func New(endpoint, accessKey, secretKey string, useSSL bool) (*MinioClient, error) {
	cli, err := minio.New(endpoint, accessKey, secretKey, useSSL)
	if err != nil {
		return nil, err
	}
	return &MinioClient{
		client: cli,
		ctx:    context.Background(),
	}, nil
}

func (m *MinioClient) BucketExists(bucket string) (bool, error) {
	return m.client.BucketExists(bucket)
}

func (m *MinioClient) CreateBucket(bucket, location string) error {
	exists, err := m.BucketExists(bucket)
	if err != nil {
		return err
	}
	if !exists {
		return m.client.MakeBucket(bucket, location)
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
	bucket := "avatars"
	key := fmt.Sprint(userId) + ".jpg"

	if err := m.CreateBucket(bucket, "minio"); err != nil {
		return err
	}

	return m.UploadFile(bucket, key, reader, size, contentType)
}

func (m *MinioClient) GetAvatar(userId int64) (io.ReadCloser, error) {
	bucket := "avatars"
	key := fmt.Sprint(userId) + ".jpg"
	return m.DownloadFile(bucket, key)
}

func (m *MinioClient) UploadWork(userId, workId int64, reader io.Reader, size int64, contentType string) error {
	bucket := "works"
	key := fmt.Sprint(userId) + "/" + fmt.Sprint(workId) + ".png"

	if err := m.CreateBucket(bucket, "minio"); err != nil {
		return err
	}

	return m.UploadFile(bucket, key, reader, size, contentType)
}

type WorkFile struct {
	Name    string
	Content io.ReadCloser
}

func (m *MinioClient) GetWorks(userId int64) ([]WorkFile, error) {
	bucket := "works"
	prefix := fmt.Sprintf("%d/", userId)

	doneCh := make(chan struct{})
	defer close(doneCh)

	objectCh := m.client.ListObjects(bucket, prefix, true, doneCh)

	var files []WorkFile

	for object := range objectCh {
		if object.Err != nil {
			return nil, fmt.Errorf("error listing object: %w", object.Err)
		}

		obj, err := m.client.GetObject(bucket, object.Key, minio.GetObjectOptions{})
		if err != nil {
			return nil, fmt.Errorf("error getting object %s: %w", object.Key, err)
		}

		files = append(files, WorkFile{
			Name:    object.Key,
			Content: obj,
		})
	}

	return files, nil
}

func (m *MinioClient) deleteObject(bucket, key string) error {
	err := m.client.RemoveObject(bucket, key)
	if err != nil {
		return fmt.Errorf("failed to delete object %s/%s: %w", bucket, key, err)
	}
	return nil
}

func (m *MinioClient) DeleteAvatar(userId int64) error {
	bucket := "avatars"
	key := fmt.Sprintf("%d.jpg", userId)
	return m.deleteObject(bucket, key)
}

func (m *MinioClient) DeleteWork(userId, workId int64) error {
	bucket := "works"
	key := fmt.Sprintf("%d/%d.jpg", userId, workId)
	return m.deleteObject(bucket, key)
}
