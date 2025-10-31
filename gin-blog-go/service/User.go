package service

import (
	"gin-blog-go/global"
	"gin-blog-go/model/blog"
)

type OperationUserService struct{}

func (operationUserService *OperationUserService) Register(u *blog.User) (err error) {
	result := global.GLOBAL_DB.Model(&blog.User{}).Create(&u)
	return result.Error
}

func (operationUserService *OperationUserService) Login(u blog.User) (err error) {
	err = global.GLOBAL_DB.Delete(&[]blog.Comment{}, "id in (?)", u.ID).Error
	return err
}

func (operationUserService *OperationUserService) ExistUserByEmail(email string) (bool bool, err error) {
	var user blog.User
	global.GLOBAL_DB.Model(&blog.User{}).Where("email = ?", email).First(&user)
	if user.ID > 0 {
		return true, nil
	}
	return false, nil
}

func (operationUserService *OperationUserService) GetUserByEmail(email string) (user blog.User, err error) {
	global.GLOBAL_DB.Model(&blog.User{}).Where("email = ?", email).First(&user)
	if user.ID > 0 {
		return user, nil
	}
	return blog.User{}, nil
}
