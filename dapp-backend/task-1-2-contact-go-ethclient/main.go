package main

import (
	"context"
	"contract-go-ethclient/counter"
	"crypto/ecdsa"
	"encoding/hex"
	"fmt"
	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"math/big"
	"time"

	"github.com/ethereum/go-ethereum/ethclient"
	"log"
)

const (
	COUNTER_BIN = "6080604052348015600e575f5ffd5b506101928061001c5f395ff3fe608060405234801561000f575f5ffd5b5060043610610034575f3560e01c806306661abd14610038578063d09de08a14610056575b5f5ffd5b610040610060565b60405161004d91906100e7565b60405180910390f35b61005e610078565b005b5f5f9054906101000a900467ffffffffffffffff1681565b5f5f81819054906101000a900467ffffffffffffffff168092919061009c9061012d565b91906101000a81548167ffffffffffffffff021916908367ffffffffffffffff16021790555050565b5f67ffffffffffffffff82169050919050565b6100e1816100c5565b82525050565b5f6020820190506100fa5f8301846100d8565b92915050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601160045260245ffd5b5f610137826100c5565b915067ffffffffffffffff820361015157610150610100565b5b60018201905091905056fea2646970667358221220f89554af769190cae80763acbd0d2161a6cafd3bf6b3b7090ea98065cc0aa5bf64736f6c634300081e0033"
)

func main() {

	client, err := ethclient.Dial("https://sepolia.infura.io/v3/xx")
	if err != nil {
		log.Fatalf("链接出错 %v ", err)
	}
	fmt.Println("链接成功")
	privateKey, err := crypto.HexToECDSA("xx")
	if err != nil {
		log.Fatalf("密钥解析失败 %v ", err)
	}
	fmt.Println("密钥解析成功")

	publicKey := privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		log.Fatalf("公钥断言失败 %v ", err)
	}

	fromAddress := crypto.PubkeyToAddress(*publicKeyECDSA)

	nonce, err := client.PendingNonceAt(context.Background(), fromAddress)
	if err != nil {
		log.Fatalf("nonce获取失败 %v ", err)
	}

	gasPrice, err := client.SuggestGasPrice(context.Background())
	if err != nil {
		log.Fatalf("获取建议 gas price 失败 %v ", err)
	}
	fmt.Println("gas price 获取成功", gasPrice)

	gasLimit := uint64(3000000)

	data, err := hex.DecodeString(COUNTER_BIN)
	if err != nil {
		log.Fatalf("字节码解析失败 %v ", err)
	}
	fmt.Println("字节码解析成功")
	value := big.NewInt(0)
	LegacyTransaction := types.LegacyTx{
		Nonce:    nonce,
		Value:    value,
		Gas:      gasLimit,
		GasPrice: gasPrice,
		Data:     data,
	}
	tx := types.NewTx(&LegacyTransaction)

	networkID, err := client.NetworkID(context.Background())
	if err != nil {
		log.Fatalf("获取chainId失败 %v ", err)
	}

	signTx, err := types.SignTx(tx, types.NewEIP155Signer(networkID), privateKey)
	if err != nil {
		log.Fatalf("私钥签名失败 %v ", err)
	}
	fmt.Println("私钥签名成功", signTx.Hash().Hex())

	err = client.SendTransaction(context.Background(), signTx)
	if err != nil {
		fmt.Println("发送交易成功", signTx.Hash().Hex())
	}

	receipt, err := waitForReceipt(client, signTx.Hash())
	if err != nil {
		fmt.Println("获取收据失败", signTx.Hash().Hex())
	}

	if receipt.Status == types.ReceiptStatusSuccessful {
		fmt.Printf("\n 合约部署成功！合约地址：%s\n", receipt.ContractAddress.Hex())
		fmt.Printf("\n 可通过链接查看合约：https://sepolia.etherscan.io/address/%s\n", receipt.ContractAddress.Hex())
	} else {
		log.Fatalf("交易执行失败（合约部署未成功）：交易状态为0（回滚），请在Etherscan查看详情")
	}

	counterContract, err := counter.NewCounter(receipt.ContractAddress, client)
	if err != nil {
		log.Fatalf("合约获取失败 %v \n", err)
	}
	fmt.Println("合约获取成功")

	opts, err := bind.NewKeyedTransactorWithChainID(privateKey, networkID)
	if err != nil {
		log.Fatalf("创建交易配置失败 %v \n", err)
	}
	fmt.Println("创建交易配置成功")

	txIncrement, err := counterContract.Increment(opts)
	if err != nil {
		log.Fatalf("调用increment写入失败：%v \n", err)
	}
	fmt.Printf("调用increment成功！交易哈希：%s\n", txIncrement.Hash().Hex())

	receiptIncrement, err := bind.WaitMined(context.Background(), client, txIncrement)
	if err != nil {
		log.Fatalf("交易确认失败：%v", err)
	}
	if receipt.Status != 1 { // 1=交易成功，0=失败
		log.Fatalf("交易执行失败，状态码：%d", receiptIncrement.Status)
	}
	fmt.Println("交易已确认！")

	callOpt := &bind.CallOpts{Context: context.Background()}
	countInContract, err := counterContract.Count(callOpt)
	if err != nil {
		log.Fatalf("调用Count查询失败：%v", err)
	}
	fmt.Println("值为：", countInContract)
}

func waitForReceipt(client *ethclient.Client, txHash common.Hash) (*types.Receipt, error) {
	fmt.Print("\n⌛ 等待交易确认（约10-30秒）...")
	for {
		receipt, err := client.TransactionReceipt(context.Background(), txHash)
		if err == nil {
			return receipt, nil
		}
		if err != ethereum.NotFound {
			return nil, fmt.Errorf("回执查询异常：%v", err)
		}
		time.Sleep(1 * time.Second)
		fmt.Print(".")
	}
}
