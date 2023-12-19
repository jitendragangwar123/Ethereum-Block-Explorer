import { Alchemy, Network } from 'alchemy-sdk';
import { useEffect, useState } from 'react';
import { ethers } from "ethers"
import './App.css';
const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(settings);

function App() {
  const [blockNumber, setBlockNumber] = useState();
  const [blockTransactions, setBlockTransactions] = useState([]);
  const [transactionSelected, setTransactionSelected] = useState("");

  useEffect(() => {
    async function getBlockNumber() {
      // Assuming alchemy is defined somewhere in your code
      setBlockNumber(await alchemy.core.getBlockNumber());
    }

    getBlockNumber();
  }, []);

  useEffect(() => {
    async function setTransactions() {
      try {
        const { transactions } = await alchemy.core.getBlockWithTransactions(blockNumber);
        setBlockTransactions(transactions);
      } catch (error) {
        setBlockTransactions([]);
      }
    }

    setTransactions();
  }, [blockNumber]);

  const handleSelectTransaction = (hash) => {
    if (blockTransactions.length === 0) setTransactionSelected('');
    setTransactionSelected(hash);
  }

  const calcFee = (transaction, toFixed) => {
    const gasFee = transaction.gasLimit * transaction.gasPrice;

    if (isNaN(gasFee)) return "0";

    return parseFloat(ethers.formatEther(gasFee.toString())).toFixed(toFixed);
  }

  const previousBlock = () => {
    const actualBlocknumber = blockNumber - 1 < 0 ? 0 : blockNumber - 1;
    setBlockNumber(actualBlocknumber);
  }

  const nextBlock = () => {
    const actualBlocknumber = blockNumber + 1;
    setBlockNumber(actualBlocknumber);
  }

  const getSubstring = (data, index) => {
    try {
      return `${data.substring(0, index)}...`;
    } catch (error) {
      return '';
    }
  }

  const getTransaction = (hash) => {
    const transactions = [...blockTransactions];
    const index = transactions.findIndex(tx => tx.hash === hash);
    return index >= 0 ? transactions[index] : {};
  }

  const Block = () => {
    return (
      <>
        <div className="block-details-heading">
          <b>Block Details</b>
        </div>
        <div className="block-navigation-container">
          <button className="block-navigation-button" onClick={() => previousBlock()}>Previous Block</button>
          <p className="block-number-display">{` Block Number: ${blockNumber} `}</p>
          <button className="block-navigation-button" onClick={() => nextBlock()}>Next Block</button>
        </div>
      </>
    );
  }

  const Transactions = () => {
    return (
      <>
        <div>
          <table>
            <thead>
              <tr>
                <th>Transaction Hash</th>
                <th>Block</th>
                <th>From</th>
                <th>To</th>
                <th>Confirmations</th>
                <th>Value</th>
                <th>Transaction Fee</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {blockTransactions.map(transaction => (
                <tr key={transaction.hash} onClick={() => handleSelectTransaction(transaction.hash)}>
                  <td >{getSubstring(transaction.hash, 15)}</td >
                  <td >{transaction.blockNumber}</td >
                  <td >{getSubstring(transaction.from, 15)}</td >
                  <td >{getSubstring(transaction.to, 15)}</td >
                  <td >{transaction.confirmations}</td >
                  <td >{parseFloat(ethers.formatEther(transaction.value.toString())).toFixed(12)}</td >
                  <td >{calcFee(transaction, 5)}</td >
                  <td >{getSubstring(transaction.data, 15)}</td >
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  const Detail = (props) => {
    return (
      <div >
        <p>{props.name}:</p>
        <p>{props.value}</p>
      </div>
    )
  }

  const TransactionDetail = (props) => {
    return (
      <>
        <div >
          <b>{"Transaction Details"}</b>
        </div>

        <Detail name={"Transaction Hash"} value={props.transaction.hash} />
        <Detail name={"Block"} value={props.transaction.blockNumber} />
        <Detail name={"From"} value={props.transaction.from} />
        <Detail name={"To"} value={props.transaction.to} />
        <Detail name={"Confirmations"} value={props.transaction.confirmations} />
        <Detail name={"Value"} value={props.transaction?.value ? parseFloat(ethers.formatEther(props.transaction?.value.toString())) : "0"} />
        <Detail name={"Transaction Fee"} value={calcFee(props.transaction, 18)} />
        <div>
          <p>Data:</p>
          <p>{props.transaction.data}</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Block />
      <Transactions />
      {transactionSelected && <TransactionDetail transaction={getTransaction(transactionSelected)} />}
    </>
  );
}
export default App;