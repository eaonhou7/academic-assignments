-- 假设有一个名为 students 的表，包含字段 id （主键，自增）、 name （学生姓名，字符串类型）、 age （学生年龄，整数类型）、 grade （学生年级，字符串类型）。
-- 要求 ：
-- 编写SQL语句向 students 表中插入一条新记录，学生姓名为 "张三"，年龄为 20，年级为 "三年级"。
-- 编写SQL语句查询 students 表中所有年龄大于 18 岁的学生信息。
-- 编写SQL语句将 students 表中姓名为 "张三" 的学生年级更新为 "四年级"。
-- 编写SQL语句删除 students 表中年龄小于 15 岁的学生记录。

CREATE TABLE students(
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'id',
	`name` varchar(64) NOT NULL DEFAULT '' COMMENT 'name',
	`age` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'age',
	`grade` varchar(64) NOT NULL DEFAULT '' COMMENT 'grade',
	PRIMARY KEY (`id`) USING BTREE
)ENGINE=INNODB;

insert into students VALUES (NULL, '张三', 20, '三年级');
SELECT * FROM students WHERE age > 18;
UPDATE students SET grade = '四年级' where name = '张三';
DELETE FROM students WHERE age < 15;



-- 假设有两个表： accounts 表（包含字段 id 主键， balance 账户余额）和 transactions 表（包含字段 id 主键， from_account_id 转出账户ID， to_account_id 转入账户ID， amount 转账金额）。
-- 要求 ：
-- 编写一个事务，实现从账户 A 向账户 B 转账 100 元的操作。在事务中，需要先检查账户 A 的余额是否足够，如果足够则从账户 A 扣除 100 元，向账户 B 增加 100 元，并在 transactions 表中记录该笔转账信息。如果余额不足，则回滚事务。

CREATE TABLE accounts (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'id',
	`name` varchar(64) NOT NULL DEFAULT '' COMMENT 'account name',
	`balance` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'balance',
	PRIMARY KEY (`id`) USING BTREE
)ENGINE=INNODB;

CREATE TABLE transactions (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'id',
	`from_account_id` varchar(64) NOT NULL DEFAULT '' COMMENT 'from_account_id',
	`to_account_id` varchar(64) NOT NULL DEFAULT '' COMMENT 'to_account_id',
	`amount` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'amount',
	PRIMARY KEY (`id`) USING BTREE
)ENGINE=INNODB;

INSERT INTO accounts VALUES (null, 'A',50),(null,'B',80),(null,'C',120),(null,'D',150);


DELIMITER //

CREATE PROCEDURE Transfer(
    IN from_name VARCHAR(255),    -- 转出账户 name
    IN to_name VARCHAR(255),      -- 转入账户 name
    IN amount DECIMAL(10,4),  -- 转账金额
		OUT result VARCHAR(255)
)
BEGIN
    -- 声明局部变量（存储余额和错误状态）
    DECLARE fbalance DECIMAL; -- 转出账户余额
		DECLARE errno INT DEFAULT 0;  -- 错误码（0 为无错误）
    -- 开始事务
    START TRANSACTION;

    -- 1. 查询转出账户余额，存入局部变量
    SELECT balance INTO fbalance FROM accounts WHERE name = from_name;

    -- 2. 检查余额是否充足
    IF fbalance >= amount THEN
        -- 3. 执行转账操作
        UPDATE accounts SET balance = balance - amount WHERE name = from_name;
        UPDATE accounts SET balance = balance + amount WHERE name = to_name;
    ELSE
			SET errno = 1;
    END IF;

		-- 4. 根据错误码提交或回滚
    IF errno = 0 THEN
        COMMIT; -- 无错误，提交事务
        SET result = '转账成功';
    ELSE
        ROLLBACK; -- 有错误，回滚事务
        SET result = '转账失败（余额不足或其他错误）';
    END IF;
END //

DELIMITER ;

SET @result = ''; -- 定义变量接收输出结果
CALL Transfer('A', 'B', 100.00, @result);
SELECT @result;

SET @result = ''; -- 定义变量接收输出结果
CALL Transfer('D', 'C', 100.00, @result);
SELECT @result;