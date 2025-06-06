package service

import (
	"context"
	"fmt"
	"io"
	"strawberry/pkg/logger"
	minio_client "strawberry/pkg/minio"

	"go.uber.org/zap"
)

type FileService struct {
	minio *minio_client.MinioClient
}

func newFileService(client *minio_client.MinioClient) *FileService {
	return &FileService{minio: client}
}

func (s *FileService) UploadAvatar(ctx context.Context, userId int64, data io.Reader, size int64, contentType string) error {
	ctx = logger.WithLogger(ctx)
	l := logger.FromContext(ctx)

	l.Info("upload avatar",
		zap.Int64("userId", userId),
		zap.Int64("size", size),
		zap.String("contentType", contentType),
	)

	err := s.minio.UploadAvatar(userId, data, size, contentType)
	if err != nil {
		l.Error("failed to upload avatar",
			zap.Int64("userId", userId),
			zap.Error(err),
		)
	}
	return err
}

func (s *FileService) GetAvatar(ctx context.Context, userId int64) (io.ReadCloser, error) {
	ctx = logger.WithLogger(ctx)
	l := logger.FromContext(ctx)

	l.Info("get avatar",
		zap.Int64("userId", userId),
	)

	rc, err := s.minio.GetAvatar(userId)
	if err != nil {
		l.Error("failed to get avatar",
			zap.Int64("userId", userId),
			zap.Error(err),
		)
	}

	return rc, err
}

func (s *FileService) DeleteAvatar(ctx context.Context, userId int64) error {
	ctx = logger.WithLogger(ctx)
	l := logger.FromContext(ctx)

	l.Info("delete avatar",
		zap.Int64("userId", userId),
	)

	err := s.minio.DeleteAvatar(userId)
	if err != nil {
		l.Error("failed to delete avatar",
			zap.Int64("userId", userId),
			zap.Error(err),
		)
	}

	return err
}

func (s *FileService) UploadWork(ctx context.Context, userId, workId string, data io.Reader, size int64, contentType string) error {
	ctx = logger.WithLogger(ctx)
	l := logger.FromContext(ctx)

	key := fmt.Sprintf("%s/%s.png", userId, workId)

	l.Info("upload work",
		zap.String("userId", userId),
		zap.String("workId", workId),
		zap.Int64("size", size),
		zap.String("contentType", contentType),
		zap.String("key", key),
	)

	err := s.minio.UploadFile("works", key, data, size, contentType)
	if err != nil {
		l.Error("failed to upload work",
			zap.String("userId", userId),
			zap.String("workId", workId),
			zap.Error(err),
		)
	}

	return err
}

func (s *FileService) GetWorks(ctx context.Context, userId int64) (io.ReadCloser, error) {
	ctx = logger.WithLogger(ctx)
	l := logger.FromContext(ctx)

	l.Info("get works",
		zap.Int64("userId", userId),
	)

	files, err := s.minio.GetWorks(userId)
	if err != nil {
		l.Error("failed to get works",
			zap.Int64("userId", userId),
			zap.Error(err),
		)
		return nil, err
	}

	pr, pw := io.Pipe()
	go func() {
		defer pw.Close()
		defer func() {
			for _, f := range files {
				f.Content.Close()
			}
		}()

		for _, f := range files {
			_, err := io.Copy(pw, f.Content)
			if err != nil {
				l.Error("failed copying file content",
					zap.String("file", f.Name),
					zap.Error(err),
				)
				pw.CloseWithError(fmt.Errorf("failed copying %s: %w", f.Name, err))
				return
			}
		}
	}()

	return pr, nil
}

func (s *FileService) DeleteWork(ctx context.Context, userId, workId int64) error {
	ctx = logger.WithLogger(ctx)
	l := logger.FromContext(ctx)

	l.Info("delete work",
		zap.Int64("userId", userId),
		zap.Int64("workId", workId),
	)

	err := s.minio.DeleteWork(userId, workId)
	if err != nil {
		l.Error("failed to delete work",
			zap.Int64("userId", userId),
			zap.Int64("workId", workId),
			zap.Error(err),
		)
	}

	return err
}
