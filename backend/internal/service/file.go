package service

import (
	"context"
	"fmt"
	"io"
	"math/rand"
	"strawberry/pkg/logger"
	minio_client "strawberry/pkg/minio"
	"time"

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

	// img, err := compressImg(data)
	// if err != nil {
	// 	l.Error("cannot compress img", zap.Error(err))
	// 	return err
	// }

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

func (s *FileService) UploadWork(ctx context.Context, userId int64, data io.Reader, size int64, contentType string) (string, error) {
	ctx = logger.WithLogger(ctx)
	l := logger.FromContext(ctx)

	workId := fmt.Sprint(rand.Int63n(100000000) + time.Now().Unix())
	// img, err := compressImg(data)
	// if err != nil {
	// 	l.Error("cannot compress img", zap.Error(err))
	// 	return "", err
	// }

	l.Info("upload work",
		zap.Int64("userId", userId),
		zap.String("workId", workId),
		zap.Int64("size", size),
		zap.String("contentType", contentType),
	)

	err := s.minio.UploadWork(userId, workId, data, size, contentType)
	if err != nil {
		l.Error("failed to upload work",
			zap.Int64("userId", userId),
			zap.String("workId", workId),
			zap.Error(err),
		)
		return "", err
	}

	return workId, nil
}

func (s *FileService) GetWorks(ctx context.Context, userId int64) ([]string, error) {
	ctx = logger.WithLogger(ctx)
	l := logger.FromContext(ctx)

	l.Info("get works",
		zap.Int64("userId", userId),
	)

	filesIds, err := s.minio.GetWorksIDs(userId)
	if err != nil {
		l.Error("failed to get works",
			zap.Int64("userId", userId),
			zap.Error(err),
		)
		return nil, err
	}

	return filesIds, nil
}

func (s *FileService) GetWork(ctx context.Context, userId int64, workId string) (io.ReadCloser, error) {
	ctx = logger.WithLogger(ctx)
	l := logger.FromContext(ctx)

	l.Info("get work",
		zap.Int64("userId", userId),
		zap.String("workId", workId),
	)

	rc, err := s.minio.GetWork(userId, workId)
	if err != nil {
		l.Error("failed to get work",
			zap.Int64("userId", userId),
			zap.String("workId", workId),
			zap.Error(err),
		)
		return nil, err
	}
	return rc, nil
}

func (s *FileService) DeleteWork(ctx context.Context, userId int64, workId string) error {
	ctx = logger.WithLogger(ctx)
	l := logger.FromContext(ctx)

	l.Info("delete work",
		zap.Int64("userId", userId),
		zap.String("workId", workId),
	)

	err := s.minio.DeleteWork(userId, workId)
	if err != nil {
		l.Error("failed to delete work",
			zap.Int64("userId", userId),
			zap.String("workId", workId),
			zap.Error(err),
		)
		return err
	}
	return nil
}

// func compressImg(data io.Reader) (io.Reader, error) {
// 	img, _, err := image.Decode(data)
// 	if err != nil {
// 		return nil, err
// 	}

// 	var buf bytes.Buffer

// 	err = jpeg.Encode(&buf, img, &jpeg.Options{Quality: 50})
// 	if err != nil {
// 		return nil, err
// 	}

// 	return &buf, nil
// }
