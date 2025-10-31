package service

import (
	"gin-blog-go/global"
	"gin-blog-go/model/blog"
)

type OperationCommentService struct{}

func (operationCommentService *OperationCommentService) ArticleComment(postId int) ([]blog.Comment, error) {
	var comments []blog.Comment

	// 使用链式调用更简洁
	result := global.GLOBAL_DB.
		Where("post_id = ?", postId).
		Order("created_at DESC"). // 添加排序，通常评论按时间倒序
		Find(&comments)
	if result.Error != nil {
		return comments, result.Error
	} else {
		return comments, nil
	}
}

func (operationCommentService *OperationCommentService) Create(b *blog.Comment) (err error) {
	result := global.GLOBAL_DB.Model(&blog.Comment{}).Create(&b)
	return result.Error
}
