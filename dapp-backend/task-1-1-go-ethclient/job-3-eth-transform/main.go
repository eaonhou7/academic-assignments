package main

import (
	"context"
	"fmt"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"log"
	"math/big"

	"crypto/ecdsa"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
)

func main() {
	client, err := ethclient.Dial("https://sepolia.infura.io/v3/xx")
	if err != nil {
		log.Fatalf("链接出错 %v ", err)
	}

	privateKey, err := crypto.HexToECDSA("private Key")
	if err != nil {
		log.Fatalf("密钥解析出错 %v ", err)
	}
	fmt.Println("密钥解析成功")

	publicKey := privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		log.Fatalf("共钥断言失败 %v ", err)
	}

	fromAddress := crypto.PubkeyToAddress(*publicKeyECDSA)
	nonce, err := client.PendingNonceAt(context.Background(), fromAddress)
	if err != nil {
		log.Fatalf("获取nonce失败 %v ", err)
	}

	toAddress := common.HexToAddress("0xa3575da84470d6a8fa4f13c02a06800b8639730b")
	gasPrice, err := client.SuggestGasPrice(context.Background())
	if err != nil {
		log.Fatalf("获取建议gasPrice失败:%v", err)
	}
	gasLimit := uint64(21000)

	value := big.NewInt(100000000000000000) //0.1 eth
	var data []byte
	LegacyTransaction := types.LegacyTx{
		Nonce:    nonce,
		To:       &toAddress,
		Value:    value,
		Gas:      gasLimit,
		GasPrice: gasPrice,
		Data:     data,
	}

	tx := types.NewTx(&LegacyTransaction)

	chainId, err := client.NetworkID(context.Background())
	if err != nil {
		log.Fatalf("获取chainId失败:%v", err)
	}
	fmt.Println("chainId:", chainId)

	signTx, err := types.SignTx(tx, types.NewEIP155Signer(chainId), privateKey)
	if err != nil {
		log.Fatalf("chainId与私钥签名失败:%v", err)
	}
	fmt.Println("signTx:", signTx.Hash().Hex())

	err = client.SendTransaction(context.Background(), signTx)
	if err != nil {
		log.Fatalf("chainId与私钥签名失败:%v", err)
	}
	fmt.Printf("📝 通过以下下链接查看详情：https://sepolia.etherscan.io/tx/%s\n", signTx.Hash().Hex())
}
