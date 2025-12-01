package main

import (
	"context"
	"fmt"
	"github.com/ethereum/go-ethereum/ethclient"
	"log"
	"math/big"
)

func main() {
	blockId := big.NewInt(9745483)
	printBlockInfo(blockId)
}

func printBlockInfo(blockId *big.Int) {
	client, err := ethclient.Dial("https://sepolia.infura.io/v3/xx")
	if err != nil {
		log.Fatalf("链接出错 %v ", err)
	}

	block, err := client.BlockByNumber(context.Background(), blockId)
	if err != nil {
		return
	}
	fmt.Println("block number:", block.Number())
	fmt.Println("block hash:", block.Hash().Hex())
	fmt.Println("block time:", block.Time)
	fmt.Println("block hash:", len(block.Transactions()))
}
