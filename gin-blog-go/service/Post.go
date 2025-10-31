package service

import (
	"gin-blog-go/global"
	"gin-blog-go/model/blog"
)

type OperationPostService struct{}

func (operationPostService *OperationPostService) Create(post *blog.Post) (err error) {
	result := global.GLOBAL_DB.Model(&blog.Post{}).Create(&post)
	return result.Error
}

func (operationPostService *OperationPostService) Update(post *blog.Post) (err error) {
	result := global.GLOBAL_DB.Model(&blog.Post{}).Where("id = ?", post.ID).Updates(post)
	return result.Error
}

func (operationPostService *OperationPostService) Detail(id int) (post blog.Post, err error) {
	result := global.GLOBAL_DB.Model(&blog.Post{}).First(&post, id)
	if result.Error != nil {
		return post, result.Error
	} else {
		return post, nil
	}
}

func (operationPostService *OperationPostService) Delete(id int) (err error) {
	result := global.GLOBAL_DB.Delete(&blog.Post{}, id)
	return result.Error
}

func (operationPostService *OperationPostService) List() (posts []blog.Post, err error) {
	result := global.GLOBAL_DB.Find(&posts)
	if result.Error != nil {
		return posts, result.Error
	} else {
		return posts, nil
	}
}
